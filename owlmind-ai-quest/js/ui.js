/**
 * OwlMind AI Quest — ui.js
 * Exposes window.OWL.ui
 * No ES modules. Pure browser script.
 */

(function () {
  'use strict';

  // Ensure namespace
  window.OWL = window.OWL || {};

  /* ─────────────────────────────────────────
     Constants
  ───────────────────────────────────────── */

  const TOAST_DURATION   = 3500;  // ms
  const TOAST_FADE       = 400;   // ms
  const LS_THEME_KEY     = 'owlmind_theme';
  const ACTIVE_MODAL_KEY = '__owlActiveModal';

  /* ─────────────────────────────────────────
     Avatar Emoji List (20 options)
  ───────────────────────────────────────── */

  const avatarEmojis = [
    '🦉', '🐺', '🦊', '🐯', '🦁',
    '🐸', '🐼', '🐨', '🦄', '🐲',
    '🦋', '🐙', '🦈', '🦕', '🐬',
    '🧑‍🚀', '🧙', '🥷', '🤖', '👾'
  ];

  /* ─────────────────────────────────────────
     Toast System
  ───────────────────────────────────────── */

  function _ensureToastContainer() {
    let c = document.getElementById('owl-toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'owl-toast-container';
      c.style.cssText = [
        'position:fixed',
        'top:1.25rem',
        'right:1.25rem',
        'z-index:99999',
        'display:flex',
        'flex-direction:column',
        'gap:0.5rem',
        'pointer-events:none'
      ].join(';');
      document.body.appendChild(c);
    }
    return c;
  }

  /**
   * Show a floating toast notification.
   * @param {string} message
   * @param {'success'|'error'|'info'|'warning'} type
   */
  function toast(message, type) {
    type = type || 'info';

    const iconMap = {
      success : '✅',
      error   : '❌',
      info    : 'ℹ️',
      warning : '⚠️'
    };

    const colorMap = {
      success : '#22c55e',
      error   : '#ef4444',
      info    : '#6366f1',
      warning : '#f59e0b'
    };

    const container = _ensureToastContainer();
    const el = document.createElement('div');

    el.style.cssText = [
      'background:var(--card-bg, #1e293b)',
      'color:var(--text-primary, #f1f5f9)',
      'border-left:4px solid ' + colorMap[type],
      'border-radius:0.5rem',
      'padding:0.75rem 1.25rem',
      'min-width:240px',
      'max-width:360px',
      'box-shadow:0 4px 24px rgba(0,0,0,0.4)',
      'font-size:0.9rem',
      'display:flex',
      'align-items:center',
      'gap:0.5rem',
      'pointer-events:auto',
      'opacity:0',
      'transform:translateX(100%)',
      'transition:opacity ' + TOAST_FADE + 'ms ease, transform ' + TOAST_FADE + 'ms ease'
    ].join(';');

    el.innerHTML = '<span style="font-size:1.1rem">' + (iconMap[type] || 'ℹ️') + '</span>'
      + '<span style="flex:1">' + _escHtml(message) + '</span>'
      + '<button style="background:none;border:none;color:inherit;cursor:pointer;font-size:1rem;opacity:0.6;padding:0 0 0 0.5rem" '
      + 'onclick="this.parentElement.remove()" aria-label="Dismiss">✕</button>';

    container.appendChild(el);

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateX(0)';
      });
    });

    // Auto-dismiss
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateX(100%)';
      setTimeout(function () { el.remove(); }, TOAST_FADE);
    }, TOAST_DURATION);
  }

  /* ─────────────────────────────────────────
     Modal System
  ───────────────────────────────────────── */

  /**
   * Show a modal dialog.
   * @param {{ title: string, body: string, buttons: Array<{label:string,action:function,primary:boolean}> }} options
   */
  function modal(options) {
    closeModal(); // close any existing

    const overlay = document.createElement('div');
    overlay.id = 'owl-modal-overlay';
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'background:rgba(0,0,0,0.65)',
      'z-index:88888',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'padding:1rem',
      'opacity:0',
      'transition:opacity 200ms ease'
    ].join(';');

    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.style.cssText = [
      'background:var(--card-bg,#1e293b)',
      'border:1px solid var(--border-color,#334155)',
      'border-radius:1rem',
      'padding:1.5rem',
      'width:100%',
      'max-width:480px',
      'max-height:80vh',
      'overflow-y:auto',
      'color:var(--text-primary,#f1f5f9)',
      'transform:scale(0.95)',
      'transition:transform 200ms ease',
      'box-shadow:0 20px 60px rgba(0,0,0,0.5)'
    ].join(';');

    // Header
    let html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">'
      + '<h2 style="margin:0;font-size:1.2rem;font-weight:700">' + _escHtml(options.title || '') + '</h2>'
      + '<button id="owl-modal-close" aria-label="Close" style="background:none;border:none;cursor:pointer;'
      + 'color:var(--text-secondary,#94a3b8);font-size:1.3rem;line-height:1;padding:0">✕</button>'
      + '</div>';

    // Body
    html += '<div style="margin-bottom:1.25rem;line-height:1.6">' + (options.body || '') + '</div>';

    // Buttons
    if (options.buttons && options.buttons.length) {
      html += '<div style="display:flex;gap:0.75rem;justify-content:flex-end;flex-wrap:wrap">';
      options.buttons.forEach(function (btn) {
        const primary = btn.primary
          ? 'background:var(--primary,#6366f1);color:#fff;border:none'
          : 'background:transparent;color:var(--text-primary,#f1f5f9);border:1px solid var(--border-color,#334155)';
        html += '<button class="owl-modal-btn" style="'
          + primary
          + ';padding:0.6rem 1.2rem;border-radius:0.5rem;cursor:pointer;font-size:0.9rem;font-weight:600"'
          + ' data-action="' + _escAttr(btn.label) + '">'
          + _escHtml(btn.label) + '</button>';
      });
      html += '</div>';
    }

    dialog.innerHTML = html;
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Store button actions map
    overlay[ACTIVE_MODAL_KEY] = options.buttons || [];

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.style.opacity = '1';
        dialog.style.transform = 'scale(1)';
      });
    });

    // Wire events
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    document.getElementById('owl-modal-close').addEventListener('click', closeModal);

    dialog.querySelectorAll('.owl-modal-btn').forEach(function (btnEl) {
      const label = btnEl.dataset.action;
      const btnDef = (options.buttons || []).find(function (b) { return b.label === label; });
      btnEl.addEventListener('click', function () {
        if (btnDef && typeof btnDef.action === 'function') {
          btnDef.action();
        }
        closeModal();
      });
    });

    // Keyboard: Escape closes
    function onKey(e) {
      if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onKey); }
    }
    document.addEventListener('keydown', onKey);
    overlay._owlKeyHandler = onKey;
  }

  /** Close the active modal. */
  function closeModal() {
    const overlay = document.getElementById('owl-modal-overlay');
    if (!overlay) return;
    if (overlay._owlKeyHandler) {
      document.removeEventListener('keydown', overlay._owlKeyHandler);
    }
    overlay.style.opacity = '0';
    const dialog = overlay.querySelector('[role=dialog]');
    if (dialog) dialog.style.transform = 'scale(0.95)';
    setTimeout(function () { overlay.remove(); }, 200);
  }

  /* ─────────────────────────────────────────
     Confirm Dialog
  ───────────────────────────────────────── */

  /**
   * Show a confirmation modal.
   * @param {string} message
   * @returns {Promise<boolean>}
   */
  function confirm(message) {
    return new Promise(function (resolve) {
      modal({
        title   : 'Confirm',
        body    : '<p style="margin:0">' + _escHtml(message) + '</p>',
        buttons : [
          {
            label   : 'Cancel',
            primary : false,
            action  : function () { resolve(false); }
          },
          {
            label   : 'Confirm',
            primary : true,
            action  : function () { resolve(true); }
          }
        ]
      });
    });
  }

  /* ─────────────────────────────────────────
     Theme
  ───────────────────────────────────────── */

  /**
   * Switch theme and persist.
   * @param {'dark'|'light'} theme
   */
  function setTheme(theme) {
    theme = theme || 'dark';
    window.OWL.state = window.OWL.state || {};
    window.OWL.state.theme = theme;
    localStorage.setItem(LS_THEME_KEY, theme);

    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    // Update any theme-toggle buttons
    const btns = document.querySelectorAll('[data-theme-toggle]');
    btns.forEach(function (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    });
  }

  /** Load stored theme on boot. */
  function loadTheme() {
    const stored = localStorage.getItem(LS_THEME_KEY) || 'dark';
    setTheme(stored);
    return stored;
  }

  /* ─────────────────────────────────────────
     Navigation Active State
  ───────────────────────────────────────── */

  /** Highlight the nav link matching the current hash route. */
  function updateNav() {
    const route = (window.location.hash || '#/').replace(/^#/, '') || '/';
    const navLinks = document.querySelectorAll('[data-nav]');
    navLinks.forEach(function (link) {
      const linkRoute = link.dataset.nav || '';
      const isActive = linkRoute === route
        || (linkRoute !== '/' && route.startsWith(linkRoute));
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    // Show/hide auth-dependent nav items
    const user = window.OWL.auth ? window.OWL.auth.getCurrentUser() : null;
    document.querySelectorAll('[data-auth-required]').forEach(function (el) {
      el.style.display = user ? '' : 'none';
    });
    document.querySelectorAll('[data-guest-only]').forEach(function (el) {
      el.style.display = !user ? '' : 'none';
    });
    document.querySelectorAll('[data-role-required]').forEach(function (el) {
      const required = el.dataset.roleRequired;
      el.style.display = (user && user.role === required) ? '' : 'none';
    });
  }

  /* ─────────────────────────────────────────
     XP / Level Helpers
  ───────────────────────────────────────── */

  /**
   * Total XP needed to REACH a given level.
   * Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 400 XP …
   * Formula: (level-1)^2 * 100
   */
  function xpForLevel(level) {
    level = Math.max(1, level);
    return (level - 1) * (level - 1) * 100;
  }

  /**
   * Compute current level from total accumulated XP.
   * @param {number} xp
   * @returns {number}
   */
  function levelFromXP(xp) {
    xp = Math.max(0, xp);
    // solve (level-1)^2 * 100 <= xp → level-1 <= sqrt(xp/100)
    var level = Math.floor(Math.sqrt(xp / 100)) + 1;
    // Clamp to sensible max
    return Math.min(Math.max(1, level), 50);
  }

  /**
   * Progress within the current level.
   * @param {number} xp
   * @returns {{ current: number, needed: number, percent: number }}
   */
  function progressToNextLevel(xp) {
    var level   = levelFromXP(xp);
    var current = xp - xpForLevel(level);
    var needed  = xpForLevel(level + 1) - xpForLevel(level);
    var percent = needed > 0 ? Math.min(100, Math.round((current / needed) * 100)) : 100;
    return { current: current, needed: needed, percent: percent };
  }

  /**
   * Format XP with comma separator.
   * @param {number} xp
   * @returns {string}
   */
  function formatXP(xp) {
    return (xp || 0).toLocaleString('en-US') + ' XP';
  }

  /**
   * Format level display string.
   * @param {number} level
   * @returns {string}
   */
  function formatLevel(level) {
    return 'Level ' + (level || 1);
  }

  /* ─────────────────────────────────────────
     Loading Overlay
  ───────────────────────────────────────── */

  function showLoader(message) {
    let overlay = document.getElementById('owl-loader');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'owl-loader';
      overlay.style.cssText = [
        'position:fixed',
        'inset:0',
        'background:rgba(0,0,0,0.7)',
        'z-index:99998',
        'display:flex',
        'flex-direction:column',
        'align-items:center',
        'justify-content:center',
        'gap:1rem',
        'color:#f1f5f9',
        'font-size:1rem'
      ].join(';');
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = '<div class="owl-spinner" style="'
      + 'width:48px;height:48px;border:4px solid rgba(255,255,255,0.2);'
      + 'border-top-color:#6366f1;border-radius:50%;'
      + 'animation:owl-spin 0.8s linear infinite'
      + '"></div>'
      + '<span>' + _escHtml(message || 'Loading…') + '</span>';

    _ensureSpinnerKeyframes();
    overlay.style.display = 'flex';
  }

  function hideLoader() {
    const overlay = document.getElementById('owl-loader');
    if (overlay) overlay.style.display = 'none';
  }

  function _ensureSpinnerKeyframes() {
    if (document.getElementById('owl-spinner-kf')) return;
    const style = document.createElement('style');
    style.id = 'owl-spinner-kf';
    style.textContent = '@keyframes owl-spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────
     Star Rating Renderer
  ───────────────────────────────────────── */

  /**
   * Render star rating HTML (out of 5).
   * @param {number} count  0–5 (supports half: 3.5)
   * @returns {string}
   */
  function renderStars(count) {
    count = Math.max(0, Math.min(5, count || 0));
    var html = '<span class="owl-stars" aria-label="' + count + ' out of 5 stars" style="color:#f59e0b;font-size:1.1rem;letter-spacing:1px">';
    for (var i = 1; i <= 5; i++) {
      if (count >= i) {
        html += '★';
      } else if (count >= i - 0.5) {
        html += '⭐'; // half-star fallback
      } else {
        html += '<span style="opacity:0.25">★</span>';
      }
    }
    html += '</span>';
    return html;
  }

  /* ─────────────────────────────────────────
     Time Ago
  ───────────────────────────────────────── */

  /**
   * Human-readable relative time.
   * @param {string|Date} dateStr
   * @returns {string}
   */
  function timeAgo(dateStr) {
    if (!dateStr) return 'unknown';
    var date  = new Date(dateStr);
    var now   = Date.now();
    var delta = Math.floor((now - date.getTime()) / 1000); // seconds

    if (delta < 10)  return 'just now';
    if (delta < 60)  return delta + ' seconds ago';

    var mins = Math.floor(delta / 60);
    if (mins < 60) return mins === 1 ? '1 minute ago' : mins + ' minutes ago';

    var hours = Math.floor(mins / 60);
    if (hours < 24) return hours === 1 ? '1 hour ago' : hours + ' hours ago';

    var days = Math.floor(hours / 24);
    if (days < 7)  return days === 1 ? 'yesterday' : days + ' days ago';

    var weeks = Math.floor(days / 7);
    if (weeks < 5) return weeks === 1 ? '1 week ago' : weeks + ' weeks ago';

    var months = Math.floor(days / 30);
    if (months < 12) return months === 1 ? '1 month ago' : months + ' months ago';

    var years = Math.floor(days / 365);
    return years === 1 ? '1 year ago' : years + ' years ago';
  }

  /* ─────────────────────────────────────────
     Utility Helpers (internal)
  ───────────────────────────────────────── */

  function _escHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function _escAttr(str) {
    return _escHtml(str);
  }

  /* ─────────────────────────────────────────
     Bootstrap Styles Injection
  ───────────────────────────────────────── */

  function _injectBaseStyles() {
    if (document.getElementById('owl-ui-base-styles')) return;
    const style = document.createElement('style');
    style.id = 'owl-ui-base-styles';
    style.textContent = `
      /* OwlMind UI Base — dark/light theme variables */
      :root, [data-theme="dark"] {
        --primary: #6366f1;
        --primary-hover: #4f46e5;
        --secondary: #06b6d4;
        --accent: #f59e0b;
        --success: #22c55e;
        --error: #ef4444;
        --warning: #f59e0b;
        --bg-main: #0f172a;
        --bg-surface: #1e293b;
        --card-bg: #1e293b;
        --border-color: #334155;
        --text-primary: #f1f5f9;
        --text-secondary: #94a3b8;
        --text-muted: #64748b;
        --nav-bg: #0f172a;
      }
      [data-theme="light"] {
        --primary: #6366f1;
        --primary-hover: #4f46e5;
        --secondary: #06b6d4;
        --accent: #f59e0b;
        --success: #22c55e;
        --error: #ef4444;
        --warning: #f59e0b;
        --bg-main: #f8fafc;
        --bg-surface: #ffffff;
        --card-bg: #ffffff;
        --border-color: #e2e8f0;
        --text-primary: #0f172a;
        --text-secondary: #475569;
        --text-muted: #94a3b8;
        --nav-bg: #ffffff;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        padding: 0;
        background: var(--bg-main);
        color: var(--text-primary);
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        transition: background 0.3s, color 0.3s;
        line-height: 1.5;
      }

      a { color: var(--primary); text-decoration: none; }
      a:hover { text-decoration: underline; }

      [data-nav].active {
        color: var(--primary) !important;
        font-weight: 700;
      }

      .owl-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.65rem 1.4rem;
        border-radius: 0.6rem;
        border: none;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 600;
        transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
        text-decoration: none;
      }
      .owl-btn:active { transform: scale(0.97); }
      .owl-btn-primary {
        background: var(--primary);
        color: #fff;
        box-shadow: 0 2px 12px rgba(99,102,241,0.35);
      }
      .owl-btn-primary:hover { background: var(--primary-hover); box-shadow: 0 4px 16px rgba(99,102,241,0.5); }
      .owl-btn-secondary {
        background: transparent;
        color: var(--text-primary);
        border: 1px solid var(--border-color);
      }
      .owl-btn-secondary:hover { background: var(--bg-surface); }
      .owl-btn-danger {
        background: var(--error);
        color: #fff;
      }
      .owl-btn-danger:hover { opacity: 0.85; }

      .owl-card {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 1rem;
        padding: 1.5rem;
        transition: box-shadow 0.2s;
      }
      .owl-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.15); }

      .owl-input {
        width: 100%;
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;
        padding: 0.65rem 1rem;
        color: var(--text-primary);
        font-size: 0.95rem;
        outline: none;
        transition: border-color 0.2s;
      }
      .owl-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }

      .owl-badge {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.03em;
      }
      .owl-badge-primary { background: rgba(99,102,241,0.15); color: var(--primary); }
      .owl-badge-success { background: rgba(34,197,94,0.15); color: var(--success); }
      .owl-badge-warning { background: rgba(245,158,11,0.15); color: var(--warning); }
      .owl-badge-error   { background: rgba(239,68,68,0.15);  color: var(--error);   }

      .owl-progress-bar {
        height: 8px;
        background: var(--border-color);
        border-radius: 999px;
        overflow: hidden;
      }
      .owl-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary), var(--secondary));
        border-radius: 999px;
        transition: width 0.6s ease;
      }

      .sr-only {
        position: absolute; width: 1px; height: 1px;
        padding: 0; margin: -1px; overflow: hidden;
        clip: rect(0,0,0,0); white-space: nowrap; border: 0;
      }
    `;
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────
     Public API
  ───────────────────────────────────────── */

  window.OWL.ui = {
    toast               : toast,
    modal               : modal,
    closeModal          : closeModal,
    confirm             : confirm,
    setTheme            : setTheme,
    loadTheme           : loadTheme,
    updateNav           : updateNav,
    formatXP            : formatXP,
    formatLevel         : formatLevel,
    xpForLevel          : xpForLevel,
    levelFromXP         : levelFromXP,
    progressToNextLevel : progressToNextLevel,
    avatarEmojis        : avatarEmojis,
    showLoader          : showLoader,
    hideLoader          : hideLoader,
    renderStars         : renderStars,
    timeAgo             : timeAgo,
    // internal — used by other modules
    _escHtml            : _escHtml,
    _injectBaseStyles   : _injectBaseStyles
  };

  // Auto-inject base styles when script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _injectBaseStyles);
  } else {
    _injectBaseStyles();
  }

})();
