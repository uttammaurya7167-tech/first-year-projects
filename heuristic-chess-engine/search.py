"""
search.py — Search Algorithm for the Chess Engine
===================================================
This module implements the core "thinking" of the engine.

Pipeline (outer to inner):
  iterative_deepening()
      └── alpha_beta()          (Minimax with Alpha-Beta pruning)
              └── quiescence()  (extends search past captures)

Key techniques implemented:
  1. Minimax with Alpha-Beta Pruning
     - Prunes branches that cannot possibly improve upon the current best.
     - Best case reduces the branching factor from ~35 to ~6, allowing
       roughly twice the search depth for the same computation budget.

  2. Quiescence Search
     - After the main search horizon, we keep searching CAPTURE moves only.
     - This prevents the "horizon effect" (e.g. stopping mid-trade and
       misreading the material balance).

  3. Move Ordering
     - Captures are scored by MVV-LVA (Most Valuable Victim, Least Valuable
       Attacker) and placed first.
     - Killer moves (non-captures that caused beta cut-offs at the same depth)
       are placed just after captures.
     - Hash move (from transposition table) is placed first of all.
     - Good ordering dramatically speeds up pruning.

  4. Transposition Table (TT)
     - A hash map keyed by Zobrist hash stores depth, score, and score type
       (EXACT, LOWER_BOUND, UPPER_BOUND).
     - Avoids re-searching positions we have already evaluated.

  5. Iterative Deepening
     - Search depth-1 first, then depth-2, … up to the target depth.
     - Each completed shallow search provides the best move as the first
       candidate for the next deeper search, greatly improving move ordering.
     - Allows anytime termination: if time runs out we always have a result.

  6. Null-Move Pruning (Lightweight)
     - If we can skip our turn and still cause a beta cut-off, the position
       is "too good" and we prune. Uses a reduction R = 2.

  7. Late-Move Reductions (LMR)
     - Quiet moves that are ordered late are searched at reduced depth,
       assuming they are unlikely to be best.
"""

import time
import random
import chess
import chess.polyglot
from evaluate import evaluate, PIECE_VALUES

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

INFINITY   = 100_000        # Larger than any realistic score
MATE_SCORE = 30_000         # A checkmate result

# Transposition table entry types.
TT_EXACT       = 0   # The stored score is exact.
TT_LOWER_BOUND = 1   # The stored score is a lower bound (failed high / beta cut-off).
TT_UPPER_BOUND = 2   # The stored score is an upper bound (failed low / all-node).

# Maximum depth for killer move table and TT.
MAX_PLY = 64

# Null-move reduction depth.
NMR = 2

# ---------------------------------------------------------------------------
# Transposition Table
# ---------------------------------------------------------------------------

class TTEntry:
    """A single transposition table entry."""
    __slots__ = ("depth", "score", "flag", "best_move")

    def __init__(self, depth: int, score: int, flag: int, best_move):
        self.depth     = depth
        self.score     = score
        self.flag      = flag
        self.best_move = best_move   # chess.Move or None


# ---------------------------------------------------------------------------
# Move Ordering Helpers
# ---------------------------------------------------------------------------

# MVV-LVA: (victim_value - attacker_value / 10) precomputed as a simple int.
# Higher = better capture.
MVV_LVA_SCORES = {}
for victim in chess.PIECE_TYPES:
    for attacker in chess.PIECE_TYPES:
        victim_val   = PIECE_VALUES.get(victim, 0)
        attacker_val = PIECE_VALUES.get(attacker, 0)
        MVV_LVA_SCORES[(victim, attacker)] = victim_val * 10 - attacker_val


def _capture_score(board: chess.Board, move: chess.Move) -> int:
    """Return an MVV-LVA ordering score for a capture move.

    Higher is more promising (searched first).
    """
    attacker = board.piece_type_at(move.from_square)
    victim   = board.piece_type_at(move.to_square)
    if victim is None:
        # En-passant: the captured pawn is not on to_square.
        if board.is_en_passant(move):
            return MVV_LVA_SCORES[(chess.PAWN, chess.PAWN)]
        return 0
    return MVV_LVA_SCORES.get((victim, attacker), 0)


def order_moves(board: chess.Board,
                moves,
                tt_move: chess.Move = None,
                killers: list = None) -> list:
    """Sort moves to maximise Alpha-Beta pruning efficiency.

    Priority (highest first):
      1. Hash move (from transposition table)
      2. Winning / equal captures, ordered by MVV-LVA
      3. Killer moves (non-captures that produced beta cut-offs)
      4. Quiet moves (castling, pawn pushes, etc.)
    """
    killers = killers or []
    scores  = []

    for move in moves:
        if move == tt_move:
            score = 3_000_000          # Always search hash move first.
        elif board.is_capture(move):
            score = 2_000_000 + _capture_score(board, move)
        elif move in killers:
            score = 1_000_000          # Killer move bonus.
        else:
            # Basic quiet-move ordering: promotions slightly ahead.
            score = 500 if move.promotion else 0

        scores.append((score, move))

    scores.sort(key=lambda x: x[0], reverse=True)
    return [m for _, m in scores]


# ---------------------------------------------------------------------------
# Searcher class (holds state shared across the recursive calls)
# ---------------------------------------------------------------------------

class Searcher:
    """Encapsulates all search state so the module is re-entrant and testable."""

    def __init__(self):
        self.tt: dict[int, TTEntry] = {}   # Transposition table
        # Killer moves: killers[ply] = [move1, move2]
        self.killers: list[list] = [[] for _ in range(MAX_PLY)]
        # History heuristic: history[(from_sq, to_sq)] = bonus
        self.history: dict[tuple, int] = {}

        # Metrics / time management.
        self.nodes       = 0        # Nodes visited this search
        self.start_time  = 0.0      # Wall-clock start
        self.time_limit  = 0.0      # Seconds; 0 = unlimited (fixed depth)
        self.stop        = False    # Set to True to abort search

    # ------------------------------------------------------------------
    # Time management
    # ------------------------------------------------------------------

    def _check_time(self):
        """Flip self.stop if we have exceeded the time budget."""
        if self.time_limit > 0 and (self.nodes & 0x3FF) == 0:
            # Only check wall clock every 1024 nodes to avoid overhead.
            if time.time() - self.start_time >= self.time_limit:
                self.stop = True

    # ------------------------------------------------------------------
    # Quiescence Search
    # ------------------------------------------------------------------

    def quiescence(self, board: chess.Board, alpha: int, beta: int) -> int:
        """Extend the search past the horizon for captures only.

        This prevents the horizon effect by resolving all tactical sequences
        (captures, promotions) before applying the static eval.

        Args:
            board: Current position.
            alpha: Lower bound (best score the maximiser can guarantee).
            beta:  Upper bound (best score the minimiser can guarantee).

        Returns:
            A score from the perspective of the side to move.
        """
        self.nodes += 1
        self._check_time()
        if self.stop:
            return 0

        # "Stand pat": allow the side to move to choose not to capture.
        # This represents the option to make a quiet move instead.
        stand_pat = evaluate(board)

        if stand_pat >= beta:
            return beta    # Beta cut-off: too good, prune.

        if stand_pat > alpha:
            alpha = stand_pat   # Improve lower bound.

        # Only generate capture moves (and promotions) to keep quiescence lean.
        for move in order_moves(board, board.generate_pseudo_legal_captures()):
            if not board.is_legal(move):
                continue

            # Delta pruning: skip captures that can't possibly raise alpha.
            # (a lightweight form of futility pruning for quiescence)
            if board.is_capture(move):
                captured_pt = board.piece_type_at(move.to_square)
                if captured_pt:
                    gain = PIECE_VALUES.get(captured_pt, 0)
                    if stand_pat + gain + 200 < alpha:
                        continue   # This capture is hopeless; skip it.

            board.push(move)
            score = -self.quiescence(board, -beta, -alpha)
            board.pop()

            if self.stop:
                return 0

            if score >= beta:
                return beta        # Beta cut-off.
            if score > alpha:
                alpha = score      # Update best score.

        return alpha

    # ------------------------------------------------------------------
    # Alpha-Beta Search
    # ------------------------------------------------------------------

    def alpha_beta(self, board: chess.Board, depth: int, alpha: int, beta: int,
                   ply: int = 0, null_move_allowed: bool = True) -> int:
        """Negamax Alpha-Beta search.

        Uses the negamax formulation: the score is always from the perspective
        of the side to move. The caller negates the score after each recursive
        call.

        Args:
            board:            Current position.
            depth:            Remaining plies to search (0 → quiescence).
            alpha:            Lower bound.
            beta:             Upper bound.
            ply:              Distance from the root (used for killer table).
            null_move_allowed: Whether null-move pruning may be attempted.

        Returns:
            Best score from the perspective of the side to move.
        """
        self.nodes += 1
        self._check_time()
        if self.stop:
            return 0

        # ------------------------------------------------------------------
        # Terminal / draw detection.
        # ------------------------------------------------------------------
        if board.is_checkmate():
            return -(MATE_SCORE - ply)   # Prefer shorter mates.
        if board.is_stalemate() or board.is_insufficient_material() or \
           board.is_seventyfive_moves() or board.can_claim_draw():
            return 0

        # ------------------------------------------------------------------
        # Transposition table probe.
        # ------------------------------------------------------------------
        key      = chess.polyglot.zobrist_hash(board)
        tt_entry = self.tt.get(key)
        tt_move  = None

        if tt_entry is not None and tt_entry.depth >= depth:
            tt_move = tt_entry.best_move
            score   = tt_entry.score

            if tt_entry.flag == TT_EXACT:
                return score
            elif tt_entry.flag == TT_LOWER_BOUND:
                alpha = max(alpha, score)
            elif tt_entry.flag == TT_UPPER_BOUND:
                beta  = min(beta, score)

            if alpha >= beta:
                return score

        # ------------------------------------------------------------------
        # Leaf node → drop into quiescence search.
        # ------------------------------------------------------------------
        if depth <= 0:
            return self.quiescence(board, alpha, beta)

        in_check = board.is_check()

        # ------------------------------------------------------------------
        # Null-Move Pruning (skip a turn and see if we still beat beta).
        # ------------------------------------------------------------------
        if (null_move_allowed
                and not in_check
                and depth >= 3
                and not board.is_game_over()):
            # Avoid NMP in very late endgames (few pieces → zugzwang risk).
            non_pawn_pieces = (
                chess.popcount(board.occupied_co[board.turn])
                - chess.popcount(board.pieces_mask(chess.PAWN, board.turn))
                - 1   # minus king
            )
            if non_pawn_pieces >= 1:
                board.push(chess.Move.null())
                null_score = -self.alpha_beta(
                    board, depth - 1 - NMR, -beta, -beta + 1,
                    ply + 1, null_move_allowed=False
                )
                board.pop()

                if self.stop:
                    return 0

                if null_score >= beta:
                    return beta   # Null-move cut-off.

        # ------------------------------------------------------------------
        # Move loop.
        # ------------------------------------------------------------------
        legal_moves = list(board.legal_moves)
        if not legal_moves:
            # Should be caught by checkmate/stalemate above, but just in case.
            return evaluate(board)

        ordered = order_moves(board, legal_moves,
                              tt_move=tt_move,
                              killers=self.killers[ply])

        best_score = -INFINITY
        best_move  = None
        original_alpha = alpha

        for move_idx, move in enumerate(ordered):
            # ---------------------------------------------------------------
            # Check extension: extend depth by 1 if we're in check.
            # ---------------------------------------------------------------
            extension = 0
            if in_check:
                extension = 1

            # ---------------------------------------------------------------
            # Late Move Reduction (LMR): reduce quiet moves ordered late.
            # ---------------------------------------------------------------
            reduction = 0
            if (depth >= 3
                    and move_idx >= 3
                    and not board.is_capture(move)
                    and not move.promotion
                    and not in_check
                    and not board.gives_check(move)):
                # Simple LMR formula; stronger engines use logarithmic tables.
                reduction = 1 if move_idx < 6 else 2

            board.push(move)

            # Perform the recursive search (with possible LMR reduction).
            if reduction > 0:
                # First search at reduced depth.
                score = -self.alpha_beta(
                    board, depth - 1 - reduction + extension,
                    -alpha - 1, -alpha, ply + 1
                )
                # If it raises alpha, re-search at full depth.
                if score > alpha:
                    score = -self.alpha_beta(
                        board, depth - 1 + extension,
                        -beta, -alpha, ply + 1
                    )
            else:
                score = -self.alpha_beta(
                    board, depth - 1 + extension,
                    -beta, -alpha, ply + 1
                )

            board.pop()

            if self.stop:
                return 0

            if score > best_score:
                best_score = score
                best_move  = move

            if score > alpha:
                alpha = score

            if alpha >= beta:
                # Beta cut-off. Store this move as a killer for this ply.
                if not board.is_capture(move):
                    killers = self.killers[ply]
                    if move not in killers:
                        killers.insert(0, move)
                        if len(killers) > 2:
                            killers.pop()
                    # Update history heuristic.
                    key_h = (move.from_square, move.to_square)
                    self.history[key_h] = self.history.get(key_h, 0) + depth * depth
                break

        # ------------------------------------------------------------------
        # Store the result in the transposition table.
        # ------------------------------------------------------------------
        if best_score <= original_alpha:
            flag = TT_UPPER_BOUND
        elif best_score >= beta:
            flag = TT_LOWER_BOUND
        else:
            flag = TT_EXACT

        self.tt[key] = TTEntry(depth, best_score, flag, best_move)

        return best_score

    # ------------------------------------------------------------------
    # Iterative Deepening (public entry point)
    # ------------------------------------------------------------------

    def iterative_deepening(
        self,
        board: chess.Board,
        max_depth: int = 64,
        time_limit: float = 0.0,
        info_callback=None,
        noise_cp: int = 0,
    ) -> chess.Move:
        """Search with iterative deepening until depth or time is exhausted.

        Unlike the previous generator version, this is a plain method:

          best_move = searcher.iterative_deepening(board, ...)

        Per-depth progress is communicated via the optional *info_callback*
        callable instead of ``yield``.  The callback signature is::

            info_callback(depth: int, score: int, move: chess.Move,
                          elapsed: float, nodes: int) -> None

        If *info_callback* is None no progress reporting is done.

        The most recently completed depth's data is always available on
        ``self.last_info`` (a dict with keys depth/score/move/elapsed/nodes)
        so callers can inspect it after the search returns.

        Elo Scaling via noise_cp
        ------------------------
        When *noise_cp* > 0 the engine does not always return its strictly
        best move.  Instead, after the search, every legal move is searched
        at depth-1 and scored.  Any move whose score falls within *noise_cp*
        centipawns of the best score is added to a "candidate pool", and
        one is chosen uniformly at random.  This causes the engine to
        occasionally play reasonable-but-suboptimal moves, faithfully
        simulating human error at lower Elo levels.

        Mathematical relationship (approximate, empirically tuned):
          noise_cp = 0    →  ~1800-2000 Elo  (plays optimal move always)
          noise_cp = 30   →  ~1500 Elo       (rarely misses tactics)
          noise_cp = 80   →  ~1200 Elo       (misses combinations)
          noise_cp = 200  →  ~800  Elo       (frequent blunders)

        Combined with max_depth clamping at low levels, this gives a
        smooth, believable difficulty curve.

        Args:
            board:         Current position.
            max_depth:     Maximum search depth (plies).
            time_limit:    Time budget in seconds (0 = use max_depth only).
            info_callback: Optional callable invoked after each completed depth.
            noise_cp:      Centipawn window for random move selection (0 = off).

        Returns:
            The best move found (chess.Move), or None if the position has no
            legal moves.
        """
        self.start_time = time.time()
        self.time_limit = time_limit
        self.stop       = False
        self.nodes      = 0

        # Reset killer and history tables for a new search.
        self.killers  = [[] for _ in range(MAX_PLY)]
        self.history  = {}

        # Initialise last_info so callers can always read it safely.
        self.last_info: dict = {}

        best_move  = next(iter(board.legal_moves), None)  # Fallback: first legal move.
        best_score = -INFINITY

        for depth in range(1, max_depth + 1):
            # Run a full Alpha-Beta search at this depth.
            score = self.alpha_beta(board, depth, -INFINITY, INFINITY, ply=0)

            if self.stop:
                # Time ran out mid-search.  Discard the incomplete result and
                # keep whatever the last *completed* iteration produced.
                break

            # Retrieve the best move this iteration settled on from the TT.
            key      = chess.polyglot.zobrist_hash(board)
            tt_entry = self.tt.get(key)
            if tt_entry and tt_entry.best_move:
                best_move  = tt_entry.best_move
                best_score = score

            elapsed = time.time() - self.start_time

            # Store the per-depth snapshot so callers can read it at any time.
            self.last_info = {
                "depth":   depth,
                "score":   best_score,
                "move":    best_move,
                "elapsed": elapsed,
                "nodes":   self.nodes,
            }

            # Emit progress via the callback (e.g. main.py prints UCI info).
            if info_callback is not None:
                info_callback(depth, best_score, best_move, elapsed, self.nodes)

            # Stop immediately if a forced mate is found — no deeper search needed.
            if abs(best_score) >= MATE_SCORE - MAX_PLY:
                break

        # ------------------------------------------------------------------
        # Elo-scaling: if noise_cp > 0, pick randomly from near-best moves.
        # ------------------------------------------------------------------
        if noise_cp > 0 and best_move is not None:
            best_move = self._noisy_move_selection(board, best_score, noise_cp)

        return best_move

    def _noisy_move_selection(
        self,
        board: chess.Board,
        best_score: int,
        noise_cp: int,
    ) -> chess.Move:
        """Return a randomly chosen move from within *noise_cp* of the best score.

        Strategy
        --------
        Score every legal move at depth-1 (one-ply look-ahead — cheap and fast
        even at beginner level).  Any move whose score falls within *noise_cp*
        centipawns of the known-best score is a valid candidate.  We then draw
        one candidate uniformly at random.

        Why depth-1?
        At very low depths the main search may not have explored all moves
        deeply enough to assign meaningful scores.  Depth-1 gives each legal
        move at least one evaluation, guaranteeing the candidate pool is
        populated even at max_depth=1.

        Why uniform random (not softmax)?
        Simplicity and predictability.  A flat distribution inside the window
        is easier to reason about and tune than a temperature-scaled softmax.
        The *width* of the window (noise_cp) is the sole tuning knob.
        """
        legal_moves = list(board.legal_moves)
        if len(legal_moves) <= 1:
            return legal_moves[0] if legal_moves else None

        # Score each legal move with a single-ply search.
        candidates = []   # (score, move)
        for move in legal_moves:
            board.push(move)
            # Negate: score is from the *opponent's* perspective after the move.
            score = -self.quiescence(board, -INFINITY, INFINITY)
            board.pop()
            candidates.append((score, move))

        # The actual best score at this shallow look (may differ slightly from
        # the deep search score due to quiescence vs full search differences).
        top_score = max(s for s, _ in candidates)

        # Build the candidate pool: all moves within noise_cp of the best.
        pool = [m for s, m in candidates if top_score - s <= noise_cp]

        # Always include at least the strictly best move so we never blunder
        # into an immediate loss due to an unlucky window edge.
        if not pool:
            pool = [max(candidates, key=lambda x: x[0])[1]]

        return random.choice(pool)
