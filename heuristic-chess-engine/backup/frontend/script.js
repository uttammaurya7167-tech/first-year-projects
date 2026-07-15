/**
 * script.js — Antigravity Chess Frontend Logic
 * ==============================================
 * Connects the chessboard.js UI to the Flask/UCI backend.
 *
 * Flow:
 *  1. User drags/clicks a piece  →  chess.js validates the move locally
 *  2. Valid move is applied       →  FEN is sent to /api/move via fetch()
 *  3. Flask calls the UCI engine  →  engine returns "bestmove e7e5"
 *  4. Engine move applied to board →  board, history, and UI updated
 *
 * Libraries (loaded via CDN in index.html):
 *  - chess.js  v0.13.4  (move validation, FEN, SAN)
 *  - chessboard.js v1.0.0  (board rendering, drag-and-drop)
 *  - jQuery 3.7.1  (required by chessboard.js)
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS & PIECE THEME
   ═══════════════════════════════════════════════════════════════════════════ */

// Lichess CBurnett SVG piece set – beautiful and freely hosted.
// chessboard.js replaces {piece} with tokens like 'wK', 'bQ', etc.
const PIECE_THEME = 'https://lichess1.org/assets/piece/cburnett/{piece}.svg';

// Fallback piece theme (Wikipedia PNGs bundled with chessboard.js)
const PIECE_THEME_FALLBACK = 'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/website/img/chesspieces/wikipedia/{piece}.png';

// Unicode symbols used for captured-piece display and game-over overlay.
const PIECE_UNICODE = {
  wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙',
  bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟',
};

// Piece values (centipawns) – used for material advantage display.
const PIECE_VALUE = { p:1, n:3, b:3, r:5, q:9, k:0 };

/* ═══════════════════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════════════════ */

let game        = null;   // chess.js instance
let board       = null;   // chessboard.js instance
let playerColor = 'white'; // 'white' | 'black'  (which side the human plays)
let isThinking  = false;  // true while waiting for engine response
let gameActive  = false;  // false after game-over
let selectedSq  = null;   // currently selected square (click-to-move)
let lastMove    = null;   // { from, to } of the last played move
let pendingPromotion = null; // {from, to, resolve} when promotion dialog open
let clocks      = { white: 0, black: 0 };  // seconds elapsed
let clockInterval = null;

/* ═══════════════════════════════════════════════════════════════════════════
   INITIALISATION  (runs after DOM + CDN scripts are ready)
   ═══════════════════════════════════════════════════════════════════════════ */

$(function () {
  setupEventListeners();
  // Auto-start a game as White so the board is visible on load.
  startNewGame('white');
});

/* ═══════════════════════════════════════════════════════════════════════════
   EVENT LISTENERS
   ═══════════════════════════════════════════════════════════════════════════ */

function setupEventListeners () {
  // Header buttons
  $('#btn-new-white').on('click', () => showColorChooser());
  $('#btn-flip').on('click', () => { if (board) board.flip(); });

  // Color chooser
  $('#play-white').on('click', () => startNewGame('white'));
  $('#play-black').on('click', () => startNewGame('black'));

  // Control buttons
  $('#btn-rematch').on('click', () => startNewGame(playerColor));
  $('#btn-resign').on('click', handleResign);
  $('#game-over-rematch').on('click', () => startNewGame(playerColor));
}

/* ═══════════════════════════════════════════════════════════════════════════
   GAME LIFECYCLE
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Start (or restart) a complete game.
 * @param {'white'|'black'} color  – which side the human plays
 */
async function startNewGame (color) {
  hideColorChooser();

  playerColor = color;
  game        = new Chess();
  isThinking  = false;
  gameActive  = true;
  selectedSq  = null;
  lastMove    = null;

  // Notify the Flask/engine of a new game.
  try {
    await fetch('/api/new_game', { method: 'POST' });
  } catch (e) {
    logMsg('Could not reach the engine server.', 'error');
  }

  // (Re)build the board.
  initBoard();

  // Orientation: always put the human's colour at the bottom.
  const orientation = playerColor;
  if (board) board.orientation(orientation);

  clearHighlights();
  hideGameOver();
  resetMoveHistory();
  resetClocks();
  updatePlayerLabels();
  setStatus('Game started — good luck!', 'good');
  logMsg(`New game started. You play as ${capitalize(playerColor)}.`, 'system');
  updateEngineInfo({ depth: '—', score_text: '—', pv: '—' });
  updateEvalBar(0);

  // If the human plays Black the engine moves first.
  if (playerColor === 'black') {
    await requestEngineMove();
  }
}

/** Build or rebuild the chessboard.js board. */
function initBoard () {
  if (board) {
    board.destroy();
    board = null;
  }

  const cfg = {
    draggable:          true,
    position:           'start',
    pieceTheme:         PIECE_THEME,
    onDragStart:        onDragStart,
    onDrop:             onDrop,
    onSnapEnd:          onSnapEnd,
    onMouseoverSquare:  onMouseoverSquare,
    onMouseoutSquare:   onMouseoutSquare,
  };

  board = Chessboard('board', cfg);

  // Make the board fill its container (responsive).
  $(window).resize(() => { if (board) board.resize(); });

  // ── Click-to-move listener ──────────────────────────────────────────────
  // We attach this after the board is built so the square elements exist.
  $('#board').off('click', '.square-55d63').on('click', '.square-55d63', function () {
    if (!gameActive || isThinking) return;

    const sq    = $(this).data('square');
    const piece = game.get(sq);

    if (selectedSq === null) {
      // ── First click: select own piece ──────────────────────────────────
      if (piece && piece.color === playerColorChar()) {
        selectedSq = sq;
        showLegalMoves(sq);
      }
    } else {
      // ── Second click: attempt move ─────────────────────────────────────
      if (sq === selectedSq) {
        // Click on same square → deselect.
        clearHighlights();
        selectedSq = null;
        return;
      }

      const moved = attemptPlayerMove(selectedSq, sq);
      clearHighlights();
      selectedSq = null;

      if (!moved && piece && piece.color === playerColorChar()) {
        // Clicked a different own piece → re-select it.
        selectedSq = sq;
        showLegalMoves(sq);
      }
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHESSBOARD.JS CALLBACKS  (drag-and-drop)
   ═══════════════════════════════════════════════════════════════════════════ */

/** Called when the user starts dragging a piece. Prevent illegal lifts. */
function onDragStart (source, piece) {
  if (!gameActive || isThinking)   return false;
  if (game.game_over())            return false;

  // Only allow the human's own pieces.
  const isWhitePiece = piece.startsWith('w');
  if (playerColor === 'white' && !isWhitePiece) return false;
  if (playerColor === 'black' &&  isWhitePiece) return false;

  // Show legal move hints while dragging.
  clearHighlights();
  selectedSq = source;
  showLegalMoves(source);
  return true;
}

/** Called when a dragged piece is dropped. Return 'snapback' if invalid. */
function onDrop (source, target) {
  clearHighlights();
  selectedSq = null;

  if (source === target) return 'snapback';

  const moved = attemptPlayerMove(source, target);
  return moved ? undefined : 'snapback';
}

/** Called after the snap-back animation; sync board with chess.js state. */
function onSnapEnd () {
  if (board && game) board.position(game.fen());
}

/** Highlight legal destinations when hovering over an own piece. */
function onMouseoverSquare (square) {
  if (!gameActive || isThinking) return;
  const piece = game.get(square);
  if (!piece || piece.color !== playerColorChar()) return;
  if (selectedSq) return;   // Already have something selected.
  showLegalMoveHints(square);
}

/** Remove hover highlights when mouse leaves a square. */
function onMouseoutSquare () {
  if (selectedSq) return;
  removeLegalMoveHints();
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOVE EXECUTION
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Attempt to make a player move from `from` to `to`.
 * Handles promotions via a dialog.
 * Returns true if the move was accepted.
 */
function attemptPlayerMove (from, to) {
  // Detect if this is a pawn-promotion move.
  const piece = game.get(from);
  const isPromotion = (
    piece && piece.type === 'p' &&
    ((piece.color === 'w' && to[1] === '8') ||
     (piece.color === 'b' && to[1] === '1'))
  );

  if (isPromotion) {
    // Check the move is legal before opening dialog.
    const testMove = game.move({ from, to, promotion: 'q' });
    if (!testMove) return false;
    game.undo();                              // Undo test move.

    // Open dialog asynchronously; resolve continues the game.
    openPromotionDialog(from, to, piece.color).then(promotionPiece => {
      const move = game.move({ from, to, promotion: promotionPiece });
      if (move) finalisePlayerMove(move);
    });
    return true;   // Accepting the move (dialog pending).
  }

  // Normal move.
  const move = game.move({ from, to, promotion: 'q' });
  if (!move) return false;
  finalisePlayerMove(move);
  return true;
}

/** Apply all side effects after the human makes a valid move. */
async function finalisePlayerMove (move) {
  lastMove = { from: move.from, to: move.to };
  board.position(game.fen());
  applyLastMoveHighlight();
  updateMoveHistory();
  tickClock(playerColor, false);

  if (move.flags.includes('k') || move.flags.includes('q')) {
    logMsg('Castles!', 'player');
  } else if (move.san.includes('+')) {
    logMsg('Check!', 'alert');
  }
  logMsg(`You played: ${move.san}`, 'player');

  if (checkGameOver()) return;

  // Trigger engine response.
  await requestEngineMove();
}

/* ═══════════════════════════════════════════════════════════════════════════
   ENGINE COMMUNICATION
   ═══════════════════════════════════════════════════════════════════════════ */

/** Ask the Flask server for the engine's best move, then apply it. */
async function requestEngineMove () {
  if (!gameActive) return;

  const movetime = parseInt($('#difficulty').val(), 10) || 1500;
  const fen      = game.fen();

  isThinking = true;
  setStatus('Engine is thinking…', 'warn');
  showThinkingBar();
  updateEngineInfo({ depth: '…', score_text: '…', pv: '…' });

  let result;
  try {
    const resp = await fetch('/api/move', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ fen, movetime }),
    });
    result = await resp.json();
  } catch (err) {
    isThinking = false;
    hideThinkingBar();
    setStatus('Server error — is Flask running?', 'bad');
    logMsg('Error: Could not reach the engine server.', 'error');
    return;
  }

  isThinking = false;
  hideThinkingBar();

  if (!result || !result.bestmove || result.bestmove === '0000') {
    setStatus('Engine returned no move.', 'bad');
    logMsg('Engine returned no move.', 'error');
    return;
  }

  // Update engine info panel.
  if (result.info) updateEngineInfo(result.info);

  // Apply the engine move to chess.js.
  const bm   = result.bestmove;           // e.g. "e7e5", "e1g1", "e7e8q"
  const from = bm.substring(0, 2);
  const to   = bm.substring(2, 4);
  const promo = bm.length > 4 ? bm[4] : undefined;

  const moveObj = { from, to };
  if (promo) moveObj.promotion = promo;

  const move = game.move(moveObj);
  if (!move) {
    logMsg(`Engine returned illegal move: ${bm}`, 'error');
    return;
  }

  lastMove = { from, to };
  board.position(game.fen());
  applyLastMoveHighlight();
  updateMoveHistory();
  tickClock(playerColor === 'white' ? 'black' : 'white', false);

  if (move.san.includes('+')) logMsg(`Engine plays ${move.san} — Check!`, 'alert');
  else                         logMsg(`Engine plays: ${move.san}`, 'engine');

  highlightEngineCheck();

  const score = result.info && result.info.score_cp !== undefined
    ? result.info.score_cp
    : 0;
  // Eval bar: from human's perspective.
  const humanIsWhite = playerColor === 'white';
  const cpForHuman   = humanIsWhite ? -score : score;  // engine score is from engine's POV
  updateEvalBar(cpForHuman);

  checkGameOver();
  setStatus(`Your turn — ${capitalize(playerColor)} to move`, 'good');
}

/* ═══════════════════════════════════════════════════════════════════════════
   HIGHLIGHT HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Show legal-move dots/rings for a given source square. */
function showLegalMoves (square) {
  $('#board .square-55d63').removeClass('highlight-selected');
  $(`#board .square-${square}`).addClass('highlight-selected');
  showLegalMoveHints(square);
}

/** Render the dot/ring overlays without changing selection highlight. */
function showLegalMoveHints (square) {
  removeLegalMoveHints();
  const moves = game.moves({ square, verbose: true });
  moves.forEach(m => {
    const $sq = $(`#board .square-${m.to}`);
    if ($sq.length === 0) return;

    const isCapture = game.get(m.to) || m.flags.includes('e'); // en-passant
    if (isCapture) {
      $sq.append('<div class="legal-move-ring"></div>');
    } else {
      $sq.append('<div class="legal-move-dot"></div>');
    }
  });
}

function removeLegalMoveHints () {
  $('#board .legal-move-dot, #board .legal-move-ring').remove();
}

function clearHighlights () {
  removeLegalMoveHints();
  $('#board .square-55d63').removeClass('highlight-selected');
}

function applyLastMoveHighlight () {
  $('#board .square-55d63').removeClass('highlight-last-move');
  if (lastMove) {
    $(`#board .square-${lastMove.from}`).addClass('highlight-last-move');
    $(`#board .square-${lastMove.to}`).addClass('highlight-last-move');
  }
}

function highlightEngineCheck () {
  $('#board .square-55d63').removeClass('highlight-check');
  if (game.in_check()) {
    const kingSq = findKingSquare(game.turn());
    if (kingSq) $(`#board .square-${kingSq}`).addClass('highlight-check');
  }
}

function findKingSquare (color) {
  for (let r = 8; r >= 1; r--) {
    for (const f of ['a','b','c','d','e','f','g','h']) {
      const sq    = f + r;
      const piece = game.get(sq);
      if (piece && piece.type === 'k' && piece.color === color) return sq;
    }
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOVE HISTORY
   ═══════════════════════════════════════════════════════════════════════════ */

function updateMoveHistory () {
  const history = game.history();
  if (history.length === 0) {
    resetMoveHistory();
    return;
  }

  const $container = $('#move-history');
  $container.empty();

  for (let i = 0; i < history.length; i += 2) {
    const moveNum = Math.floor(i / 2) + 1;
    const whiteMove = history[i]    || '';
    const blackMove = history[i+1]  || '';

    const isLastWhite = (i === history.length - 1);
    const isLastBlack = (i + 1 === history.length - 1);

    const wClass = isLastWhite ? 'move-white move-current' : 'move-white';
    const bClass = isLastBlack ? 'move-black move-current' : 'move-black';

    $container.append(`
      <div class="move-row">
        <span class="move-num">${moveNum}.</span>
        <span class="${wClass}">${whiteMove}</span>
        ${blackMove ? `<span class="${bClass}">${blackMove}</span>` : ''}
      </div>
    `);
  }

  // Auto-scroll to bottom.
  $container.scrollTop($container[0].scrollHeight);
}

function resetMoveHistory () {
  $('#move-history').html('<div class="history-empty">No moves yet…</div>');
}

/* ═══════════════════════════════════════════════════════════════════════════
   GAME OVER
   ═══════════════════════════════════════════════════════════════════════════ */

function checkGameOver () {
  if (!game.game_over()) return false;

  gameActive = false;
  clearInterval(clockInterval);
  clearHighlights();

  let title, sub, icon;

  if (game.in_checkmate()) {
    const winner = game.turn() === 'w' ? 'Black' : 'White';
    const youWin = (winner === 'White' && playerColor === 'white') ||
                   (winner === 'Black' && playerColor === 'black');
    icon  = youWin ? '🏆' : '💀';
    title = 'Checkmate!';
    sub   = `${winner} wins${youWin ? ' — Congratulations!' : '.'}`;
    setStatus(title + ' ' + sub, youWin ? 'good' : 'bad');
    logMsg(title + ' ' + sub, 'alert');
  } else if (game.in_stalemate()) {
    icon  = '🤝';
    title = 'Stalemate!';
    sub   = 'Draw by stalemate.';
    setStatus(title, 'warn');
    logMsg(title, 'alert');
  } else if (game.in_draw()) {
    icon  = '🤝';
    title = 'Draw!';
    sub   = game.in_threefold_repetition()
      ? 'Draw by threefold repetition.'
      : game.insufficient_material()
        ? 'Draw — insufficient material.'
        : 'Draw by 50-move rule.';
    setStatus(title, 'warn');
    logMsg(sub, 'alert');
  } else {
    icon  = '⚑';
    title = 'Game Over';
    sub   = '';
  }

  showGameOver(icon, title, sub);
  return true;
}

function showGameOver (icon, title, sub) {
  $('#game-over-icon').text(icon);
  $('#game-over-title').text(title);
  $('#game-over-sub').text(sub);
  $('#game-over-overlay').removeClass('hidden');
}

function hideGameOver () {
  $('#game-over-overlay').addClass('hidden');
}

function handleResign () {
  if (!gameActive) return;
  gameActive = false;
  clearInterval(clockInterval);

  const winner = playerColor === 'white' ? 'Black' : 'White';
  showGameOver('🏳️', 'You Resigned', `${winner} wins.`);
  setStatus('You resigned.', 'bad');
  logMsg('You resigned.', 'alert');
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROMOTION DIALOG
   ═══════════════════════════════════════════════════════════════════════════ */

function openPromotionDialog (from, to, color) {
  return new Promise(resolve => {
    const pieces = color === 'w'
      ? [['q','♕'],['r','♖'],['b','♗'],['n','♘']]
      : [['q','♛'],['r','♜'],['b','♝'],['n','♞']];

    const btns = pieces.map(([p, sym]) =>
      `<button class="promo-btn" data-piece="${p}">${sym}</button>`
    ).join('');

    const $dialog = $(`
      <div id="promotion-dialog">
        <div class="promo-box">
          <div class="promo-title">Promote pawn to…</div>
          <div class="promo-pieces">${btns}</div>
        </div>
      </div>
    `);

    $dialog.find('.promo-btn').on('click', function () {
      const chosen = $(this).data('piece');
      $dialog.remove();
      resolve(chosen);
    });

    $('body').append($dialog);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   EVALUATION BAR
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Update the vertical evaluation bar.
 * @param {number} cpForHuman  centipawns from the human player's perspective.
 *                              positive = human is winning, negative = engine is winning
 */
function updateEvalBar (cpForHuman) {
  // Clamp to ±800 cp (± 8 pawns), then map to 10–90% fill.
  const clamped = Math.max(-800, Math.min(800, cpForHuman));
  const pct     = 50 + (clamped / 800) * 40;   // 10% – 90%

  $('#eval-bar-fill').css('width', pct + '%');

  const label = Math.abs(cpForHuman) > 2700
    ? (cpForHuman > 0 ? '+M' : '-M')
    : (cpForHuman >= 0 ? '+' : '') + (cpForHuman / 100).toFixed(2);

  $('#eval-bar-label').text(label);
}

/* ═══════════════════════════════════════════════════════════════════════════
   ENGINE INFO PANEL
   ═══════════════════════════════════════════════════════════════════════════ */

function updateEngineInfo ({ depth, score_text, pv, nps } = {}) {
  if (depth     !== undefined) $('#info-depth').text(depth);
  if (score_text !== undefined) $('#info-score').text(score_text);
  if (pv        !== undefined) $('#info-pv').text(pv || '—');
}

function showThinkingBar () {
  $('#thinking-bar').removeClass('hidden');
  $('#info-status').text('Thinking…').css('color', 'var(--accent-gold)');
}

function hideThinkingBar () {
  $('#thinking-bar').addClass('hidden');
  $('#info-status').text('Ready').css('color', 'var(--accent-green)');
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLOCKS (count-up timer for each player)
   ═══════════════════════════════════════════════════════════════════════════ */

function resetClocks () {
  clearInterval(clockInterval);
  clocks = { white: 0, black: 0 };
  renderClock('white');
  renderClock('black');
}

function renderClock (color) {
  const secs = clocks[color];
  const m    = String(Math.floor(secs / 60)).padStart(1, '0');
  const s    = String(secs % 60).padStart(2, '0');
  const text = `${m}:${s}`;

  // Which HTML element gets updated depends on orientation.
  const isHuman = color === playerColor;
  const elId    = isHuman ? '#clock-bottom-display' : '#clock-top-display';
  $(elId).text(text);
}

function tickClock (color, continuous) {
  clearInterval(clockInterval);
  clocks[color]++;
  renderClock(color);

  if (continuous) {
    clockInterval = setInterval(() => {
      if (!gameActive) { clearInterval(clockInterval); return; }
      clocks[color]++;
      renderClock(color);
    }, 1000);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   PLAYER LABELS
   ═══════════════════════════════════════════════════════════════════════════ */

function updatePlayerLabels () {
  if (playerColor === 'white') {
    $('#name-top').text('Antigravity Engine');
    $('#rating-top').text('≈1800');
    $('#name-bottom').text('You');
    $('#rating-bottom').text('White ♔');
    $('#avatar-top').html('<i class="fa-solid fa-robot"></i>').removeClass('human-avatar');
    $('#avatar-bottom').html('<i class="fa-solid fa-user"></i>').addClass('human-avatar');
  } else {
    $('#name-top').text('You');
    $('#rating-top').text('Black ♚');
    $('#name-bottom').text('Antigravity Engine');
    $('#rating-bottom').text('≈1800');
    $('#avatar-top').html('<i class="fa-solid fa-user"></i>').addClass('human-avatar');
    $('#avatar-bottom').html('<i class="fa-solid fa-robot"></i>').removeClass('human-avatar');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   COLOUR CHOOSER MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

function showColorChooser () { $('#color-chooser').removeClass('hidden'); }
function hideColorChooser () { $('#color-chooser').addClass('hidden');    }

/* ═══════════════════════════════════════════════════════════════════════════
   STATUS BAR
   ═══════════════════════════════════════════════════════════════════════════ */

function setStatus (msg, type /* 'good'|'warn'|'bad' */ ) {
  const $el = $('#status-msg');
  $el.removeClass('status-good status-warn status-bad')
     .addClass(type ? `status-${type}` : '')
     .html(`<i class="fa-solid fa-circle-info"></i> ${msg}`);
}

/* ═══════════════════════════════════════════════════════════════════════════
   GAME LOG
   ═══════════════════════════════════════════════════════════════════════════ */

function logMsg (text, cls /* 'system'|'player'|'engine'|'alert'|'error' */ ) {
  const $log   = $('#game-log');
  const $entry = $('<div>').addClass(`log-entry log-${cls || 'system'}`).text(text);
  $log.append($entry);
  $log.scrollTop($log[0].scrollHeight);
}

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

/** Return 'w' or 'b' for the human player's colour. */
function playerColorChar () {
  return playerColor === 'white' ? 'w' : 'b';
}

function capitalize (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
