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
import queue
import subprocess
import threading
import time

from flask import Flask, request, jsonify, send_from_directory

# ---------------------------------------------------------------------------
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
ENGINE_PATH  = os.path.join(BASE_DIR, "main.py")
# ---------------------------------------------------------------------------


class UCIEngine:
    """Manages a long-lived subprocess running our UCI chess engine.

    Thread-safety model
    -------------------
    * ``_lock`` serialises all commands sent to the engine so that only one
      Flask request drives a search at a time.
    * A *daemon reader thread* continuously drains the engine's stdout into a
      ``queue.Queue``.  This decouples the slow pipe reads from the lock so
      that the lock-holder can use non-blocking ``queue.get(timeout=…)``
      calls instead of blocking ``readline()`` — making the search loop
      interruptible.
    * ``_stop_evt`` is a ``threading.Event``.  Any thread can set it to
      signal the current lock-holder to abort its search, drain remaining
      output, and release the lock so the next request can proceed.

    Concurrency flow for a mid-search browser reload
    -------------------------------------------------
    1. Thread A holds ``_lock`` and is reading from the queue (search in
       flight).
    2. Browser fires a new request → Thread B calls ``get_best_move``.
    3. Thread B calls ``_interrupt_search()``:
         a. Sends ``stop`` to the engine stdin.
         b. Sets ``_stop_evt``.
         c. Blocks on ``_lock.acquire()`` — waiting for A to finish.
    4. Thread A's queue.get() times out, sees ``_stop_evt`` is set, drains
       remaining lines until ``bestmove``, then exits ``with self._lock``.
    5. Thread B acquires the lock, clears the event, starts its own search.
    """

    # How long (seconds) the search loop waits on each queue.get() before
    # checking the stop event.  Small enough for responsive interruption.
    _POLL = 0.05

    def __init__(self, engine_script: str):
        self.engine_script = engine_script
        self.process: subprocess.Popen | None = None
        self._lock     = threading.Lock()
        self._stop_evt = threading.Event()
        self._q: queue.Queue = queue.Queue()
        self._reader: threading.Thread | None = None
        self._start()

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _start(self):
        """Spawn the engine, start the reader thread, perform UCI handshake."""
        self._stop_evt.clear()
        self.process = subprocess.Popen(
            [sys.executable, "-u", self.engine_script],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            bufsize=1,
            cwd=BASE_DIR,
        )
        # Drain the old queue before starting fresh.
        while not self._q.empty():
            try:
                self._q.get_nowait()
            except queue.Empty:
                break

        # Daemon thread: constantly reads engine stdout and pushes to queue.
        self._reader = threading.Thread(target=self._reader_loop, daemon=True)
        self._reader.start()

        self._send("uci")
        self._read_until("uciok", timeout=10)
        self._send("isready")
        self._read_until("readyok", timeout=10)

    def _reader_loop(self):
        """Daemon thread: pump every line from engine stdout into self._q."""
        try:
            for line in self.process.stdout:
                self._q.put(line.rstrip("\n").rstrip("\r"))
        except Exception:
            pass   # Process closed or died; silently stop.
        finally:
            self._q.put(None)   # Sentinel: tells consumers the pipe is closed.

    def _alive(self) -> bool:
        return self.process is not None and self.process.poll() is None

    def _send(self, cmd: str):
        """Write a UCI command to the engine stdin (no locking required)."""
        if self._alive():
            try:
                self.process.stdin.write(cmd + "\n")
                self.process.stdin.flush()
            except OSError:
                pass

    def _read_until(self, token: str, timeout: float = 30.0) -> list[str]:
        """Collect lines from the queue until one contains *token*."""
        lines: list[str] = []
        deadline = time.time() + timeout
        while time.time() < deadline:
            try:
                line = self._q.get(timeout=min(self._POLL, deadline - time.time()))
            except queue.Empty:
                continue
            if line is None:
                raise RuntimeError("Engine process closed stdout unexpectedly.")
            if line:
                lines.append(line)
            if token in line:
                return lines
        raise TimeoutError(f"Engine did not respond with '{token}' in {timeout}s")

    def _ensure_alive(self):
        """Restart the engine (and its reader thread) if the process has died."""
        if not self._alive():
            self._start()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def new_game(self):
        """Signal a new game, interrupting any ongoing search first."""
        self._send("stop")            # harmless if nothing is searching
        self._stop_evt.set()
        with self._lock:
            self._stop_evt.clear()
            self._ensure_alive()
            self._send("ucinewgame")
            self._send("isready")
            self._read_until("readyok")

    def get_best_move(self, fen: str, movetime: int = 2000,
                      strength: str = "1800") -> dict:
        """Ask the engine for its best move given a FEN string.

        If another search is currently running, the request signals it to
        stop and waits for the lock before starting afresh.

        Args:
            fen:      FEN string for the current position.
            movetime: Search time in milliseconds.
            strength: Elo level key — one of '800','1200','1500','1800','2000'.
                      Forwarded to the engine via 'setoption name Skill Level'.
        """
        # Map strength key to UCI Skill Level (0-20).
        _STRENGTH_TO_SKILL = {
            "800":  2,    # band 0-3   → pick midpoint
            "1200": 6,    # band 4-7
            "1500": 10,   # band 8-11
            "1800": 14,   # band 12-15
            "2000": 20,   # band 16-20
        }
        skill_level = _STRENGTH_TO_SKILL.get(str(strength), 14)  # default 1800

        # Send stop + set event *before* competing for the lock.
        self._send("stop")
        self._stop_evt.set()

        with self._lock:
            self._stop_evt.clear()   # We now own the engine; reset for our search.
            self._ensure_alive()
            try:
                # Drain any stale output left by a previous interrupted search.
                while True:
                    try:
                        line = self._q.get_nowait()
                    except queue.Empty:
                        break
                    if line is None:
                        self._start()
                        break

                # ── Apply strength profile before sending the position ──────
                # The engine's main.py listens for this setoption command and
                # updates its current_strength, which parse_go then uses to
                # pick the correct (max_depth, noise_cp) profile.
                self._send(f"setoption name Skill Level value {skill_level}")

                self._send(f"position fen {fen}")
                self._send(f"go movetime {movetime}")

                info: dict = {}

                while True:
                    # Non-blocking get with short poll interval so we can
                    # check the stop event if another request interrupts us.
                    try:
                        line = self._q.get(timeout=self._POLL)
                    except queue.Empty:
                        if self._stop_evt.is_set():
                            # A newer request interrupted us.  Drain until
                            # the engine acknowledges with 'bestmove' and exit.
                            deadline = time.time() + 5.0
                            while time.time() < deadline:
                                try:
                                    line = self._q.get(timeout=self._POLL)
                                except queue.Empty:
                                    continue
                                if line is None:
                                    break
                                if line.strip().startswith("bestmove"):
                                    break
                            return {"bestmove": None, "info": info,
                                    "error": "search interrupted"}
                        continue   # spurious timeout; keep waiting

                    if line is None:
                        raise RuntimeError("Engine died during search.")

                    line = line.strip()
                    if not line:
                        continue

                    # ── Parse 'info' lines ────────────────────────────────
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
                                score_type = parts[idx + 1]
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

                    # ── Parse 'bestmove' ──────────────────────────────────
                    elif line.startswith("bestmove"):
                        tokens = line.split()
                        best   = tokens[1] if len(tokens) > 1 else "0000"
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
          "movetime": 2000,           // milliseconds (optional, default 2000)
          "strength": "1800"          // Elo level key (optional, default '1800')
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
    strength = str(data.get("strength", "1800"))

    result = engine.get_best_move(fen, movetime, strength=strength)
    if "error" in result and result["bestmove"] is None:
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
    print("  Open --> http://localhost:8080")
    print("=" * 55)
    app.run(host="0.0.0.0", port=8080, debug=False, threaded=True)
