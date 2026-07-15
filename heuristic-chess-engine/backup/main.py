"""
main.py — Universal Chess Interface (UCI) Loop
================================================
This is the entry point for the chess engine.  It reads UCI commands from
stdin and writes responses to stdout, exactly as described in the UCI
specification (http://www.shredderchess.com/chess-info/features/uci-tutorial.html).

Supported UCI commands
----------------------
  uci                    → Identify the engine and list options.
  isready                → Synchronisation ping; reply "readyok".
  ucinewgame             → Reset the engine for a new game.
  position startpos moves <m1 m2 …>
  position fen <FEN> [moves <m1 m2 …>]
                         → Set the board position.
  go [wtime <ms>] [btime <ms>] [movestogo <n>]
     [movetime <ms>] [depth <d>] [infinite]
                         → Start searching; output "bestmove <move>".
  stop                   → Stop the current search (handled via flag).
  quit                   → Exit the engine process.

UCI output produced
-------------------
  id name …              → Engine name.
  id author …            → Author name.
  uciok                  → End of engine identification.
  readyok                → Engine is ready.
  info depth … score cp … nodes … time … pv …
                         → Search progress (sent for each completed depth).
  bestmove <move>        → Final answer after "go".
"""

import sys
import chess
import chess.polyglot
from search import Searcher

# ---------------------------------------------------------------------------
# Engine identity
# ---------------------------------------------------------------------------
ENGINE_NAME    = "Antigravity Chess"
ENGINE_AUTHOR  = "Antigravity"

# ---------------------------------------------------------------------------
# Default search parameters (overridden by "go" command options)
# ---------------------------------------------------------------------------
DEFAULT_MAX_DEPTH  = 64       # Effectively unlimited; time controls the depth.
DEFAULT_MOVE_TIME  = 3.0      # Seconds per move when no time control is given.


def parse_position(command: str, board: chess.Board) -> None:
    """Parse the UCI 'position' command and update the board in place.

    Handles both:
      position startpos [moves m1 m2 …]
      position fen <FEN string> [moves m1 m2 …]

    Args:
        command: The full command string (without the leading "position").
        board:   The chess.Board to update.
    """
    tokens = command.split()

    # Locate the optional 'moves' keyword.
    try:
        moves_idx = tokens.index("moves")
        move_list = tokens[moves_idx + 1:]
    except ValueError:
        move_list = []
        moves_idx = len(tokens)

    position_tokens = tokens[:moves_idx]

    if position_tokens and position_tokens[0] == "startpos":
        board.reset()
    elif position_tokens and position_tokens[0] == "fen":
        # The FEN string follows the 'fen' keyword.
        fen = " ".join(position_tokens[1:])
        try:
            board.set_fen(fen)
        except ValueError:
            # Malformed FEN; keep current position.
            pass

    # Apply the move list.
    for move_uci in move_list:
        try:
            move = chess.Move.from_uci(move_uci)
            if move in board.legal_moves:
                board.push(move)
            else:
                # Sometimes promotions are sent without the promotion piece.
                # Try to handle gracefully.
                for legal in board.legal_moves:
                    if (legal.from_square == move.from_square and
                            legal.to_square == move.to_square):
                        board.push(legal)
                        break
        except ValueError:
            pass   # Skip malformed moves.


def parse_go(command: str, board: chess.Board, searcher: Searcher) -> str:
    """Parse the UCI 'go' command, run the search, and return 'bestmove <m>'.

    Supported sub-commands:
      wtime <ms>       – White's remaining time in milliseconds.
      btime <ms>       – Black's remaining time.
      winc <ms>        – White's increment per move.
      binc <ms>        – Black's increment.
      movestogo <n>    – Moves remaining until the next time control.
      movetime <ms>    – Fixed time per move.
      depth <d>        – Search exactly d plies (ignores time).
      infinite         – Search until 'stop' is received.

    Args:
        command:  The full command string.
        board:    Current board position.
        searcher: The Searcher instance.

    Returns:
        The UCI "bestmove" string.
    """
    tokens = command.split()

    # -----------------------------------------------------------------------
    # Parse options.
    # -----------------------------------------------------------------------
    def get_int(key: str, default: int) -> int:
        try:
            idx = tokens.index(key)
            return int(tokens[idx + 1])
        except (ValueError, IndexError):
            return default

    wtime     = get_int("wtime",     -1)
    btime     = get_int("btime",     -1)
    winc      = get_int("winc",       0)
    binc      = get_int("binc",       0)
    movestogo = get_int("movestogo",  0)
    movetime  = get_int("movetime",  -1)
    depth_arg = get_int("depth",     -1)
    infinite  = "infinite" in tokens

    # -----------------------------------------------------------------------
    # Determine time limit.
    # -----------------------------------------------------------------------
    max_depth  = DEFAULT_MAX_DEPTH
    time_limit = 0.0           # 0 = no time limit (use depth instead)

    if infinite:
        # Search forever; the GUI will send 'stop'.
        time_limit = 0.0
        max_depth  = DEFAULT_MAX_DEPTH

    elif movetime > 0:
        # Fixed time per move.
        time_limit = movetime / 1000.0

    elif depth_arg > 0:
        # Fixed depth; ignore time.
        max_depth  = depth_arg
        time_limit = 0.0

    elif wtime >= 0 or btime >= 0:
        # Classical time control: allocate a fraction of remaining time.
        my_time = (wtime if board.turn == chess.WHITE else btime)
        my_inc  = (winc  if board.turn == chess.WHITE else binc)

        if movestogo > 0:
            # Divide remaining time evenly over moves left (+/- buffer).
            time_limit = (my_time / max(movestogo, 1) + my_inc * 0.8) / 1000.0
        else:
            # Estimate ~30 moves remaining (typical endgame heuristic).
            time_limit = (my_time / 30 + my_inc * 0.8) / 1000.0

        # Safety cap: never use more than 20 % of remaining time in one move.
        time_limit = min(time_limit, my_time * 0.2 / 1000.0)
        # Minimum thinking time.
        time_limit = max(time_limit, 0.05)

    else:
        # No time info provided; use default.
        time_limit = DEFAULT_MOVE_TIME

    # -----------------------------------------------------------------------
    # Run iterative deepening and stream info lines.
    # -----------------------------------------------------------------------
    best_move = None

    for depth, score, move, elapsed, nodes in searcher.iterative_deepening(
            board, max_depth=max_depth, time_limit=time_limit):

        # Format the score for UCI output.
        if abs(score) >= 29_000:
            # Express checkmate distance in moves.
            mate_in = (30_000 - abs(score) + 1) // 2
            if score < 0:
                mate_in = -mate_in
            score_str = f"mate {mate_in}"
        else:
            score_str = f"cp {score}"

        # Build the PV (principal variation) from the transposition table.
        pv_moves = _extract_pv(board, searcher, depth)
        pv_str   = " ".join(m.uci() for m in pv_moves)

        elapsed_ms = int(elapsed * 1000)
        nps        = int(nodes / elapsed) if elapsed > 0 else 0

        info_line = (
            f"info depth {depth} score {score_str} "
            f"nodes {nodes} time {elapsed_ms} nps {nps} "
            f"pv {pv_str}"
        )
        print(info_line, flush=True)

        best_move = move

    # -----------------------------------------------------------------------
    # Output final answer.
    # -----------------------------------------------------------------------
    if best_move is None:
        # Should not happen in a legal position, but be safe.
        legal = list(board.legal_moves)
        best_move = legal[0] if legal else None

    return f"bestmove {best_move.uci() if best_move else '0000'}"


def _extract_pv(board: chess.Board, searcher: Searcher, max_len: int) -> list:
    """Walk the transposition table to recover the principal variation.

    Args:
        board:   Current position (will be mutated then restored).
        searcher: The searcher whose TT we query.
        max_len: Maximum number of PV moves to return.

    Returns:
        List of chess.Move objects forming the PV.
    """
    pv     = []
    seen   = set()   # Detect cycles (threefold repetition in the PV).

    for _ in range(max_len):
        key      = chess.polyglot.zobrist_hash(board)
        if key in seen:
            break
        seen.add(key)

        entry = searcher.tt.get(key)
        if entry is None or entry.best_move is None:
            break

        move = entry.best_move
        if move not in board.legal_moves:
            break

        pv.append(move)
        board.push(move)

    # Restore the board.
    for _ in pv:
        board.pop()

    return pv


# ---------------------------------------------------------------------------
# Main UCI loop
# ---------------------------------------------------------------------------

def main() -> None:
    """Read UCI commands from stdin and respond on stdout until 'quit'."""
    board    = chess.Board()
    searcher = Searcher()

    # Use sys.stdout in line-buffered mode so GUIs receive output immediately.
    sys.stdout.reconfigure(line_buffering=True)   # type: ignore[attr-defined]

    while True:
        try:
            line = input().strip()
        except EOFError:
            # stdin closed (e.g. GUI shut down the process).
            break

        if not line:
            continue

        # -------------------------------------------------------------------
        # UCI handshake.
        # -------------------------------------------------------------------
        if line == "uci":
            print(f"id name {ENGINE_NAME}")
            print(f"id author {ENGINE_AUTHOR}")
            # Declare any engine options here (none for now).
            print("uciok", flush=True)

        elif line == "isready":
            print("readyok", flush=True)

        elif line == "ucinewgame":
            # Reset the board and clear the transposition table for a fresh game.
            board.reset()
            searcher.tt.clear()
            searcher.killers = [[] for _ in range(64)]
            searcher.history = {}

        # -------------------------------------------------------------------
        # Position setup.
        # -------------------------------------------------------------------
        elif line.startswith("position"):
            # Strip the leading "position" keyword before passing to parser.
            parse_position(line[len("position"):].strip(), board)

        # -------------------------------------------------------------------
        # Search.
        # -------------------------------------------------------------------
        elif line.startswith("go"):
            result = parse_go(line, board, searcher)
            print(result, flush=True)

        # -------------------------------------------------------------------
        # Stop (for 'infinite' searches or pondering).
        # -------------------------------------------------------------------
        elif line == "stop":
            searcher.stop = True

        # -------------------------------------------------------------------
        # Quit.
        # -------------------------------------------------------------------
        elif line == "quit":
            break

        # Unknown commands are silently ignored (per UCI spec).


if __name__ == "__main__":
    main()
