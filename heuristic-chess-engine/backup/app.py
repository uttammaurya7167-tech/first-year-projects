# -*- coding: utf-8 -*-
"""
app.py — Flask Bridge Server
============================
Acts as middleware between the web frontend and the UCI chess engine.

Architecture:
  Browser <──HTTP/JSON──> Flask (app.py) <──stdin/stdout──> UCI engine (main.py)

The UCIEngine class keeps a single engine subprocess alive for the duration of
the server's lifetime, routing each /api/move request through a threading lock
to ensure sequential, non-overlapping I/O with the engine.
"""

import os
import sys
import subprocess
import threading

from flask import Flask, request, jsonify, send_from_directory

# ---------------------------------------------------------------------------
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
ENGINE_PATH  = os.path.join(BASE_DIR, "main.py")
# ---------------------------------------------------------------------------


class UCIEngine:
    """Manages a long-lived subprocess running our UCI chess engine.

    All public methods are thread-safe via a reentrant lock.
    If the engine process crashes it is automatically restarted.
    """

    def __init__(self, engine_script: str):
        self.engine_script = engine_script
        self.process: subprocess.Popen | None = None
        self._lock = threading.Lock()
        self._start()

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _start(self):
        """Spawn the engine and perform the UCI handshake."""
        self.process = subprocess.Popen(
            [sys.executable, "-u", self.engine_script],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            bufsize=1,           # line-buffered
            cwd=BASE_DIR,
        )
        self._send("uci")
        self._read_until("uciok", timeout=10)
        self._send("isready")
        self._read_until("readyok", timeout=10)

    def _alive(self) -> bool:
        return self.process is not None and self.process.poll() is None

    def _send(self, cmd: str):
        """Write one UCI command to the engine stdin."""
        if self._alive():
            self.process.stdin.write(cmd + "\n")
            self.process.stdin.flush()

    def _read_until(self, token: str, timeout: float = 30.0) -> list[str]:
        """Collect stdout lines until one contains `token`, then return all."""
        import select, time
        lines: list[str] = []
        deadline = time.time() + timeout

        while time.time() < deadline:
            # On Windows select() doesn't work on pipes; rely on readline()
            # with a short timeout trick via a daemon reader thread.
            line = self.process.stdout.readline()
            if not line:
                raise RuntimeError("Engine process closed stdout unexpectedly.")
            line = line.rstrip("\n").rstrip("\r")
            if line:
                lines.append(line)
            if token in line:
                return lines

        raise TimeoutError(f"Engine did not respond with '{token}' in {timeout}s")

    def _ensure_alive(self):
        """Restart the engine if it has died."""
        if not self._alive():
            self._start()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def new_game(self):
        """Signal a new game; clears TT and other engine state."""
        with self._lock:
            self._ensure_alive()
            self._send("ucinewgame")
            self._send("isready")
            self._read_until("readyok")

    def get_best_move(self, fen: str, movetime: int = 2000) -> dict:
        """
        Ask the engine for its best move given a FEN string.

        Returns:
            {
              "bestmove": "e2e4",        # UCI move string
              "info": {                  # last 'info' line fields
                "depth":      8,
                "score_cp":   +23,
                "score_text": "+0.23",
                "pv":         "e2e4",
              }
            }
        """
        with self._lock:
            self._ensure_alive()
            try:
                self._send(f"position fen {fen}")
                self._send(f"go movetime {movetime}")

                info: dict = {}

                while True:
                    line = self.process.stdout.readline()
                    if not line:
                        raise RuntimeError("Engine died during search.")
                    line = line.strip()
                    if not line:
                        continue

                    # ── Parse 'info' lines ────────────────────────────
                    if line.startswith("info"):
                        parts = line.split()

                        if "depth" in parts:
                            try:
                                info["depth"] = int(parts[parts.index("depth") + 1])
                            except (ValueError, IndexError):
                                pass

                        if "score" in parts:
                            idx = parts.index("score")
                            try:
                                score_type = parts[idx + 1]   # 'cp' or 'mate'
                                score_val  = int(parts[idx + 2])
                                if score_type == "cp":
                                    info["score_cp"]   = score_val
                                    info["score_text"] = f"{score_val / 100:+.2f}"
                                elif score_type == "mate":
                                    info["score_cp"]   = score_val * 30_000
                                    info["score_text"] = f"M{score_val}"
                            except (ValueError, IndexError):
                                pass

                        if "pv" in parts:
                            pv_idx = parts.index("pv")
                            info["pv"] = " ".join(parts[pv_idx + 1 : pv_idx + 6])

                        if "nps" in parts:
                            try:
                                info["nps"] = int(parts[parts.index("nps") + 1])
                            except (ValueError, IndexError):
                                pass

                    # ── Parse 'bestmove' ──────────────────────────────
                    elif line.startswith("bestmove"):
                        tokens = line.split()
                        best = tokens[1] if len(tokens) > 1 else "0000"
                        return {"bestmove": best, "info": info}

            except Exception as exc:
                return {"bestmove": None, "info": {}, "error": str(exc)}


# ---------------------------------------------------------------------------
# Flask application
# ---------------------------------------------------------------------------

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")

# Initialise the global engine singleton at import time.
engine = UCIEngine(ENGINE_PATH)


# ── Static file serving ────────────────────────────────────────────────────

@app.route("/")
def index():
    """Serve the frontend entry point."""
    return send_from_directory(FRONTEND_DIR, "index.html")


# ── API endpoints ──────────────────────────────────────────────────────────

@app.route("/api/new_game", methods=["POST"])
def api_new_game():
    """Reset the engine for a brand-new game.

    Body (optional JSON): {}
    Response: {"status": "ok"}
    """
    try:
        engine.new_game()
        return jsonify({"status": "ok"})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/move", methods=["POST"])
def api_move():
    """Send the current position to the engine and return its best move.

    Request JSON:
        {
          "fen":      "<FEN string>",
          "movetime": 2000           // milliseconds (optional, default 2000)
        }

    Response JSON:
        {
          "bestmove": "e7e5",
          "info": { "depth": 8, "score_cp": -23, "score_text": "-0.23", "pv": "..." }
        }
    """
    data = request.get_json(silent=True)
    if not data or "fen" not in data:
        return jsonify({"error": "Missing required field: fen"}), 400

    fen      = data["fen"]
    movetime = int(data.get("movetime", 2000))

    result = engine.get_best_move(fen, movetime)
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result)


@app.route("/api/status", methods=["GET"])
def api_status():
    """Health-check endpoint."""
    alive = engine._alive()
    return jsonify({"engine_alive": alive, "status": "ok" if alive else "engine_dead"})


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("=" * 55)
    print("  [*] ANTIGRAVITY CHESS  --  Web Interface")
    print("=" * 55)
    print(f"  Engine  : {ENGINE_PATH}")
    print(f"  Frontend: {FRONTEND_DIR}")
    print()
    print("  Open --> http://localhost:5000")
    print("=" * 55)
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
