/**
 * OwlMind AI Quest — app.js
 * Main router and initialization. Load LAST.
 * Exposes window.OWL.app
 * No ES modules. Pure browser script.
 * Depends on: ui.js, gamification.js, auth.js
 */

(function () {
  'use strict';

  window.OWL = window.OWL || {};
  window.OWL.state = window.OWL.state || { user: null, theme: 'dark' };
  var originalLandingHTML = '';
  var _lessonState = {
    courseId: null,
    lessonId: null,
    currentIndex: 0,
    sections: []
  };

  /* ─────────────────────────────────────────
     Route Table
  ───────────────────────────────────────── */

  /**
   * Each entry: { pattern: RegExp, handler: function(params) }
   * Pattern groups become named params.
   */
  var ROUTES = [
    { pattern: /^\/?$/,                            handler: function ()       { showLanding();                      } },
    { pattern: /^\/login\/?$/,                     handler: function ()       { showLogin();                        } },
    { pattern: /^\/signup\/?$/,                    handler: function ()       { showSignup();                       } },
    { pattern: /^\/dashboard\/?$/,                 handler: function ()       { showDashboard();                    } },
    { pattern: /^\/learn\/?$/,                     handler: function ()       { showLearnMap();                     } },
    { pattern: /^\/course\/([^/]+)\/?$/,           handler: function (m)      { showCourse(m[1]);                   } },
    { pattern: /^\/lesson\/([^/]+)\/([^/]+)\/?$/,  handler: function (m)      { showLesson(m[1], m[2]);             } },
    { pattern: /^\/quiz\/([^/]+)\/([^/]+)\/?$/,    handler: function (m)      { showQuiz(m[1], m[2]);               } },
    { pattern: /^\/quiz\/?$/,                      handler: function ()       { showQuiz();                         } },
    { pattern: /^\/mentor\/?$/,                    handler: function ()       { showMentor();                       } },
    { pattern: /^\/projects\/?$/,                  handler: function ()       { showProjects();                     } },
    { pattern: /^\/certificates\/?$/,              handler: function ()       { showCertificates();                 } },
    { pattern: /^\/leaderboard\/?$/,               handler: function ()       { showLeaderboard();                  } },
    { pattern: /^\/teacher\/?$/,                   handler: function ()       { showTeacher();                      } },
    { pattern: /^\/admin\/?$/,                     handler: function ()       { showAdmin();                        } },
    { pattern: /^\/profile\/?$/,                   handler: function ()       { showProfile();                      } }
  ];

  /* ─────────────────────────────────────────
     Router
  ───────────────────────────────────────── */

  /**
   * Navigate to a route by updating the location hash.
   * @param {string} route  e.g. '/', '/dashboard', '/course/ai-foundations'
   */
  function navigate(route) {
    route = route || '/';
    if (!route.startsWith('/')) route = '/' + route;
    window.location.hash = route;
    // hashchange listener will call renderPage
  }

  /**
   * Parse route params from the current route string.
   * @param {string} route
   * @returns {Object}  e.g. { id: 'ai-foundations' } or { courseId, lessonId }
   */
  function getRouteParams(route) {
    route = route || '/';

    // /course/:id
    var courseMatch = route.match(/^\/course\/([^/]+)/);
    if (courseMatch) return { id: courseMatch[1] };

    // /lesson/:courseId/:lessonId
    var lessonMatch = route.match(/^\/lesson\/([^/]+)\/([^/]+)/);
    if (lessonMatch) return { courseId: lessonMatch[1], lessonId: lessonMatch[2] };

    return {};
  }

  /**
   * Dispatch the current hash route to the right page renderer.
   * @param {string} route
   */
  function renderPage(route) {
    route = route || '/';

    // Try each route pattern
    for (var i = 0; i < ROUTES.length; i++) {
      var entry = ROUTES[i];
      var match = route.match(entry.pattern);
      if (match) {
        entry.handler(match);
        return;
      }
    }

    // 404 fallback
    show404(route);
  }

  /* ─────────────────────────────────────────
     Page Placeholder Renderer Helper
  ───────────────────────────────────────── */

  function _getMain() {
    return document.getElementById('owl-main') || document.querySelector('main') || document.body;
  }

  /**
   * Inject HTML into the main content area with a fade-in animation.
   * @param {string} html
   */
  function _renderMain(html) {
    var main = _getMain();
    main.style.opacity = '0';
    main.style.transition = 'opacity 0.2s ease';
    main.innerHTML = html;
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        main.style.opacity = '1';
      });
    });
  }

  /* ─────────────────────────────────────────
     Page Renderers
     (Stub implementations — pages will be
      overridden by their own page scripts if
      window.OWL.pages.showXxx is defined.)
  ───────────────────────────────────────── */

  function _pageStub(title, icon, description, authRequired) {
    if (authRequired && !window.OWL.auth.requireAuth()) return;
    _renderMain(
      '<div style="max-width:720px;margin:4rem auto;padding:2rem;text-align:center">'
      + '<div style="font-size:5rem;margin-bottom:1rem">' + icon + '</div>'
      + '<h1 style="font-size:2rem;font-weight:800;margin:0 0 0.5rem">' + _esc(title) + '</h1>'
      + '<p style="color:var(--text-secondary);font-size:1.05rem;margin:0 0 2rem">' + _esc(description) + '</p>'
      + '<div style="display:inline-block;padding:0.5rem 1rem;border-radius:0.5rem;'
      + 'background:rgba(99,102,241,0.1);color:var(--primary);font-size:0.85rem;font-weight:600">'
      + '🚧 This page is coming soon'
      + '</div>'
      + '</div>'
    );
  }

  function _dispatchPage(fnName /* , ...args */) {
    var args = Array.prototype.slice.call(arguments, 1);
    var pages = window.OWL.pages;
    if (pages && typeof pages[fnName] === 'function') {
      pages[fnName].apply(pages, args);
      return true;
    }
    return false;
  }

  /* ─────────────────────────────────────────
     Landing Page
  ───────────────────────────────────────── */

  function showLanding() {
    if (_dispatchPage('showLanding')) return;

    var user = window.OWL.auth.getCurrentUser();
    if (user) {
      // Logged-in users go straight to dashboard
      navigate('/dashboard');
      return;
    }

    if (originalLandingHTML) {
      _renderMain(originalLandingHTML);
      var landingEl = document.getElementById('page-landing');
      if (landingEl) {
        landingEl.classList.remove('hidden');
      }
      var event = new CustomEvent('owlmind-ready');
      document.dispatchEvent(event);
      return;
    }

    _renderMain(
      '<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;'
      + 'padding:2rem;text-align:center;background:var(--bg-main)">'

      // Hero
      + '<div style="max-width:700px">'
      + '<div style="font-size:6rem;margin-bottom:1rem;animation:owl-float 3s ease-in-out infinite">🦉</div>'
      + '<h1 style="font-size:clamp(2.5rem,6vw,4rem);font-weight:900;margin:0 0 1rem;'
      + 'background:linear-gradient(135deg,var(--primary),var(--secondary));-webkit-background-clip:text;'
      + '-webkit-text-fill-color:transparent;background-clip:text">'
      + 'OwlMind AI Quest'
      + '</h1>'
      + '<p style="font-size:1.2rem;color:var(--text-secondary);margin:0 0 2.5rem;line-height:1.7">'
      + 'Master artificial intelligence through interactive lessons, real projects, and epic challenges. '
      + 'Earn XP, level up, and become an <strong style="color:var(--primary)">AI Legend</strong>.'
      + '</p>'

      // CTA buttons
      + '<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-bottom:2rem">'
      + '<button class="owl-btn owl-btn-primary" onclick="OWL.app.navigate(\'/signup\')" style="font-size:1rem;padding:0.85rem 2rem">'
      + '🚀 Start Your Quest'
      + '</button>'
      + '<button class="owl-btn owl-btn-secondary" onclick="OWL.app.navigate(\'/login\')" style="font-size:1rem;padding:0.85rem 2rem">'
      + 'Log In'
      + '</button>'
      + '<button class="owl-btn owl-btn-secondary" onclick="OWL.auth.loginAsGuest();OWL.app.navigate(\'/dashboard\')" '
      + 'style="font-size:1rem;padding:0.85rem 2rem">'
      + '👾 Try as Guest'
      + '</button>'
      + '</div>'

      // Feature pills
      + '<div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;margin-bottom:3rem">'
      + ['🎮 Gamified Learning', '🤖 AI Mentor', '🏆 Leaderboards', '📜 Certificates', '🏗️ Real Projects']
          .map(function (f) {
            return '<span style="background:var(--card-bg);border:1px solid var(--border-color);'
              + 'border-radius:999px;padding:0.4rem 1rem;font-size:0.85rem;color:var(--text-secondary)">'
              + f + '</span>';
          }).join('')
      + '</div>'
      + '</div>'

      // Demo credentials note
      + '<div style="margin-top:2rem;padding:1rem 1.5rem;border-radius:0.75rem;'
      + 'background:var(--card-bg);border:1px solid var(--border-color);max-width:480px;font-size:0.85rem;color:var(--text-secondary)">'
      + '<strong style="color:var(--text-primary)">Demo accounts:</strong><br>'
      + 'Student: <code>demo@student.com</code> / <code>demo123</code><br>'
      + 'Teacher: <code>demo@teacher.com</code> / <code>demo123</code>'
      + '</div>'

      + _floatKeyframes()
      + '</div>'
    );
  }

  /* ─────────────────────────────────────────
     Login Page
  ───────────────────────────────────────── */

  function showLogin() {
    if (_dispatchPage('showLogin')) return;

    if (window.OWL.auth.isLoggedIn()) { navigate('/dashboard'); return; }

    _renderMain(
      '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;background:var(--bg-main)">'
      + '<div class="owl-card" style="width:100%;max-width:420px">'
      + '<div style="text-align:center;margin-bottom:1.5rem">'
      + '<div style="font-size:3rem">🦉</div>'
      + '<h2 style="margin:0.5rem 0 0;font-size:1.6rem;font-weight:800">Welcome Back</h2>'
      + '<p style="color:var(--text-secondary);margin:0.25rem 0 0;font-size:0.9rem">Sign in to continue your quest</p>'
      + '</div>'

      + '<form id="owl-login-form" onsubmit="OWL.app._handleLogin(event)">'
      + '<div style="margin-bottom:1rem">'
      + '<label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.4rem;color:var(--text-secondary)">Email</label>'
      + '<input id="login-email" type="email" class="owl-input" placeholder="you@example.com" autocomplete="email" required>'
      + '</div>'
      + '<div style="margin-bottom:1.5rem">'
      + '<label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.4rem;color:var(--text-secondary)">Password</label>'
      + '<input id="login-password" type="password" class="owl-input" placeholder="••••••••" autocomplete="current-password" required>'
      + '</div>'
      + '<button type="submit" class="owl-btn owl-btn-primary" style="width:100%;justify-content:center;font-size:1rem">'
      + '🔓 Sign In'
      + '</button>'
      + '</form>'

      + '<div style="text-align:center;margin-top:1.25rem;font-size:0.9rem;color:var(--text-secondary)">'
      + 'New here? <a href="#/signup" style="color:var(--primary);font-weight:600">Create an account</a>'
      + '</div>'

      + '<div style="text-align:center;margin-top:0.75rem">'
      + '<button class="owl-btn owl-btn-secondary" style="font-size:0.85rem;padding:0.5rem 1rem" '
      + 'onclick="OWL.auth.loginAsGuest();OWL.app.navigate(\'/dashboard\')">'
      + '👾 Continue as Guest'
      + '</button>'
      + '</div>'
      + '</div>'
      + '</div>'
    );

    // Auto-focus email
    setTimeout(function () {
      var el = document.getElementById('login-email');
      if (el) el.focus();
    }, 100);
  }

  function _handleLogin(e) {
    e.preventDefault();
    var email    = (document.getElementById('login-email')    || {}).value || '';
    var password = (document.getElementById('login-password') || {}).value || '';

    var result = window.OWL.auth.login(email, password);
    if (result.success) {
      window.OWL.ui.toast('Welcome back, ' + result.user.name + '! 🎉', 'success');
      navigate('/dashboard');
    } else {
      window.OWL.ui.toast(result.error, 'error');
    }
  }

  /* ─────────────────────────────────────────
     Signup Page
  ───────────────────────────────────────── */

  function showSignup() {
    if (_dispatchPage('showSignup')) return;

    if (window.OWL.auth.isLoggedIn()) { navigate('/dashboard'); return; }

    var avatarEmojis = window.OWL.ui ? window.OWL.ui.avatarEmojis : ['🦉', '🐯', '🦁', '🤖'];

    _renderMain(
      '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;background:var(--bg-main)">'
      + '<div class="owl-card" style="width:100%;max-width:460px">'
      + '<div style="text-align:center;margin-bottom:1.5rem">'
      + '<div style="font-size:3rem">🚀</div>'
      + '<h2 style="margin:0.5rem 0 0;font-size:1.6rem;font-weight:800">Begin Your Quest</h2>'
      + '<p style="color:var(--text-secondary);margin:0.25rem 0 0;font-size:0.9rem">Create your OwlMind account</p>'
      + '</div>'

      + '<form id="owl-signup-form" onsubmit="OWL.app._handleSignup(event)">'

      // Avatar picker
      + '<div style="margin-bottom:1rem">'
      + '<label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.5rem;color:var(--text-secondary)">Choose Your Avatar</label>'
      + '<div style="display:flex;flex-wrap:wrap;gap:0.5rem" id="avatar-picker">'
      + avatarEmojis.map(function (em, i) {
          return '<button type="button" class="owl-avatar-opt" data-emoji="' + em + '" '
            + 'onclick="OWL.app._pickAvatar(\'' + em + '\')" '
            + 'style="font-size:1.8rem;background:' + (i === 0 ? 'rgba(99,102,241,0.2)' : 'var(--bg-surface)') + ';'
            + 'border:2px solid ' + (i === 0 ? 'var(--primary)' : 'var(--border-color)') + ';'
            + 'border-radius:0.5rem;padding:0.3rem 0.5rem;cursor:pointer;transition:all 0.15s">'
            + em + '</button>';
        }).join('')
      + '</div>'
      + '<input type="hidden" id="signup-avatar" value="' + avatarEmojis[0] + '">'
      + '</div>'

      + '<div style="margin-bottom:1rem">'
      + '<label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.4rem;color:var(--text-secondary)">Full Name</label>'
      + '<input id="signup-name" type="text" class="owl-input" placeholder="Your name" autocomplete="name" required>'
      + '</div>'

      + '<div style="margin-bottom:1rem">'
      + '<label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.4rem;color:var(--text-secondary)">Email</label>'
      + '<input id="signup-email" type="email" class="owl-input" placeholder="you@example.com" autocomplete="email" required>'
      + '</div>'

      + '<div style="margin-bottom:1rem">'
      + '<label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.4rem;color:var(--text-secondary)">Password</label>'
      + '<input id="signup-password" type="password" class="owl-input" placeholder="Min 6 characters" autocomplete="new-password" required>'
      + '</div>'

      + '<div style="margin-bottom:1.5rem">'
      + '<label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.4rem;color:var(--text-secondary)">I am a…</label>'
      + '<select id="signup-role" class="owl-input">'
      + '<option value="student">Student / Learner</option>'
      + '<option value="teacher">Teacher / Instructor</option>'
      + '</select>'
      + '</div>'

      + '<button type="submit" class="owl-btn owl-btn-primary" style="width:100%;justify-content:center;font-size:1rem">'
      + '🎮 Create Account'
      + '</button>'
      + '</form>'

      + '<div style="text-align:center;margin-top:1.25rem;font-size:0.9rem;color:var(--text-secondary)">'
      + 'Already have an account? <a href="#/login" style="color:var(--primary);font-weight:600">Sign in</a>'
      + '</div>'
      + '</div>'
      + '</div>'
    );

    setTimeout(function () {
      var el = document.getElementById('signup-name');
      if (el) el.focus();
    }, 100);
  }

  function _pickAvatar(emoji) {
    var input = document.getElementById('signup-avatar');
    if (input) input.value = emoji;
    document.querySelectorAll('.owl-avatar-opt').forEach(function (btn) {
      var active = btn.dataset.emoji === emoji;
      btn.style.background = active ? 'rgba(99,102,241,0.2)' : 'var(--bg-surface)';
      btn.style.borderColor = active ? 'var(--primary)' : 'var(--border-color)';
    });
  }

  function _handleSignup(e) {
    e.preventDefault();
    var name     = (document.getElementById('signup-name')     || {}).value || '';
    var email    = (document.getElementById('signup-email')    || {}).value || '';
    var password = (document.getElementById('signup-password') || {}).value || '';
    var role     = (document.getElementById('signup-role')     || {}).value || 'student';
    var avatar   = (document.getElementById('signup-avatar')   || {}).value || '🦉';

    var result = window.OWL.auth.signup(name, email, password, role);
    if (result.success) {
      // Set avatar
      result.user.avatar = avatar;
      window.OWL.gamification.saveUser(result.user);

      // Auto-login
      window.OWL.auth.login(email, password);
      window.OWL.ui.toast('Welcome to OwlMind, ' + name + '! Your quest begins 🎉', 'success');
      navigate('/dashboard');
    } else {
      window.OWL.ui.toast(result.error, 'error');
    }
  }

  /* ─────────────────────────────────────────
     Dashboard
  ───────────────────────────────────────── */

  function showDashboard() {
    if (_dispatchPage('showDashboard')) return;
    if (!window.OWL.auth.requireAuth()) return;

    var user = window.OWL.auth.getCurrentUser();
    var ui   = window.OWL.ui;
    var prog = ui.progressToNextLevel(user.xp);
    var gam  = window.OWL.gamification;

    _renderMain(
      '<div style="max-width:1100px;margin:0 auto;padding:2rem 1rem">'

      // Welcome header
      + '<div style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem;flex-wrap:wrap">'
      + '<div style="font-size:3.5rem">' + (user.avatar || '🦉') + '</div>'
      + '<div>'
      + '<h1 style="margin:0;font-size:1.8rem;font-weight:800">'
      + 'Welcome back, ' + _esc(user.name.split(' ')[0]) + '!'
      + '</h1>'
      + '<p style="margin:0;color:var(--text-secondary)">'
      + gam.getLevelTitle(user.level) + ' · ' + ui.formatLevel(user.level)
      + ' · 🔥 ' + (user.streak || 0) + '-day streak'
      + '</p>'
      + '</div>'
      + '<div style="margin-left:auto;display:flex;gap:0.75rem;flex-wrap:wrap">'
      + '<button class="owl-btn owl-btn-primary" onclick="OWL.app.navigate(\'/learn\')">📚 Continue Learning</button>'
      + '<button class="owl-btn owl-btn-secondary" onclick="OWL.app.navigate(\'/mentor\')">🤖 Ask Mentor</button>'
      + '</div>'
      + '</div>'

      // Stats grid
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:2rem">'
      + _statCard('Total XP', ui.formatXP(user.xp), '💎', 'primary')
      + _statCard('Level', ui.formatLevel(user.level), '⭐', 'success')
      + _statCard('Streak', (user.streak || 0) + ' days', '🔥', 'warning')
      + _statCard('Lessons', (user.completedLessons || []).length, '📖', 'secondary')
      + _statCard('Courses', (user.completedCourses || []).length, '🎓', 'primary')
      + _statCard('Badges', (user.earnedBadges || []).length, '🏅', 'success')
      + '</div>'

      // XP Progress bar
      + '<div class="owl-card" style="margin-bottom:2rem">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">'
      + '<span style="font-weight:700">' + ui.formatLevel(user.level) + ' → ' + ui.formatLevel(user.level + 1) + '</span>'
      + '<span style="color:var(--text-secondary);font-size:0.85rem">'
      + prog.current.toLocaleString() + ' / ' + prog.needed.toLocaleString() + ' XP'
      + '</span>'
      + '</div>'
      + '<div class="owl-progress-bar"><div class="owl-progress-fill" style="width:' + prog.percent + '%"></div></div>'
      + '<p style="margin:0.5rem 0 0;font-size:0.82rem;color:var(--text-secondary)">'
      + (prog.needed - prog.current).toLocaleString() + ' XP until ' + ui.formatLevel(user.level + 1)
      + '</p>'
      + '</div>'

      // Quick actions
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:2rem">'
      + _quickAction('/learn',        '🗺️', 'Learning Map',    'Explore all courses & lessons')
      + _quickAction('/leaderboard',  '🏆', 'Leaderboard',     'See how you rank')
      + _quickAction('/projects',     '🛠️', 'My Projects',     'View & submit projects')
      + _quickAction('/certificates', '📜', 'Certificates',    'Download your certs')
      + _quickAction('/profile',      '👤', 'Profile',         'Edit your avatar & info')
      + _quickAction('/mentor',       '🤖', 'AI Mentor',       'Get help from OwlBot')
      + '</div>'

      // Earned Badges preview
      + '<div class="owl-card">'
      + '<h3 style="margin:0 0 1rem;font-size:1rem;font-weight:700">🏅 Earned Badges</h3>'
      + _renderBadgesPreview(user)
      + '</div>'

      + '</div>'
    );
  }

  function _statCard(label, value, icon, colorKey) {
    var colors = {
      primary  : 'var(--primary)',
      success  : 'var(--success)',
      warning  : 'var(--warning)',
      secondary: 'var(--secondary)'
    };
    var c = colors[colorKey] || 'var(--primary)';
    return '<div class="owl-card" style="text-align:center">'
      + '<div style="font-size:2rem;margin-bottom:0.25rem">' + icon + '</div>'
      + '<div style="font-size:1.4rem;font-weight:800;color:' + c + '">' + value + '</div>'
      + '<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.15rem">' + label + '</div>'
      + '</div>';
  }

  function _quickAction(route, icon, title, desc) {
    return '<div class="owl-card" style="cursor:pointer;text-align:center" '
      + 'onclick="OWL.app.navigate(\'' + route + '\')" '
      + 'onmouseenter="this.style.borderColor=\'var(--primary)\'" '
      + 'onmouseleave="this.style.borderColor=\'var(--border-color)\'">'
      + '<div style="font-size:2rem;margin-bottom:0.4rem">' + icon + '</div>'
      + '<div style="font-weight:700;font-size:0.95rem">' + title + '</div>'
      + '<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.2rem">' + desc + '</div>'
      + '</div>';
  }

  function _renderBadgesPreview(user) {
    var gam = window.OWL.gamification;
    var earned = user.earnedBadges || [];
    if (!earned.length) {
      return '<p style="color:var(--text-secondary);font-size:0.9rem">No badges yet — keep learning! 🏃</p>';
    }
    var html = '<div style="display:flex;flex-wrap:wrap;gap:0.5rem">';
    earned.forEach(function (id) {
      var def = gam.BADGE_DEFS.find(function (b) { return b.id === id; });
      if (!def) return;
      html += '<div title="' + _esc(def.name + ': ' + def.desc) + '" '
        + 'style="display:flex;align-items:center;gap:0.35rem;padding:0.35rem 0.75rem;'
        + 'background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);'
        + 'border-radius:999px;font-size:0.82rem">'
        + '<span>' + def.emoji + '</span>'
        + '<span>' + _esc(def.name) + '</span>'
        + '</div>';
    });
    html += '</div>';
    return html;
  }

  /* ─────────────────────────────────────────
     Remaining Page Stubs
  ───────────────────────────────────────── */

  function showLearnMap() {
    if (_dispatchPage('showLearnMap')) return;
    if (!window.OWL.auth.requireAuth()) return;

    var user = window.OWL.auth.getCurrentUser();
    var courses = window.OWL.courses || [];
    var userProgress = {};
    try {
      userProgress = JSON.parse(localStorage.getItem('owl_user_progress_' + user.id) || '{}');
    } catch (e) {}

    var cardsHtml = courses.map(function (course) {
      var prog = userProgress[course.id] || { completedLessons: [] };
      var completedCount = (prog.completedLessons || []).length;
      var totalCount = (course.lessons || []).length || 1;
      var pct = Math.round((completedCount / totalCount) * 100);
      var isCompleted = completedCount === totalCount && totalCount > 0;
      var courseColor = course.color || '#4F46E5';

      return '<div class="learn-track-card" onclick="OWL.app.navigate(\'/course/' + course.id + '\')">'
        + '  <div class="learn-track-header">'
        + '    <div class="learn-track-icon" style="background:' + courseColor + '20;color:' + courseColor + '">'
        + '      ' + (course.icon || '📚')
        + '    </div>'
        + '    <div class="learn-track-info">'
        + '      <div class="learn-track-title">' + _esc(course.title) + '</div>'
        + '      <div class="learn-track-meta">' + course.level + ' · ' + totalCount + ' Lessons</div>'
        + '    </div>'
        + '  </div>'
        + '  <div class="learn-track-body">'
        + '    <p class="learn-track-desc">' + _esc(course.description) + '</p>'
        + '    <div style="margin-top:1.5rem">'
        + '      <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.4rem">'
        + '        <span>Progress</span>'
        + '        <span style="margin-left:auto">' + completedCount + '/' + totalCount + ' (' + pct + '%)</span>'
        + '      </div>'
        + '      <div class="owl-progress-bar"><div class="owl-progress-fill" style="width:' + pct + '%;background:' + courseColor + '"></div></div>'
        + '    </div>'
        + '  </div>'
        + '  <div class="learn-track-footer">'
        + '    <span style="font-size:0.85rem;font-weight:600;color:' + courseColor + '">'
        + (isCompleted ? '🏆 Completed' : completedCount > 0 ? '🔄 Keep Going' : '🚀 Start Track')
        + '    </span>'
        + '    <button class="owl-btn owl-btn-secondary" style="font-size:0.8rem;padding:0.4rem 0.85rem;border-color:' + courseColor + '40;color:' + courseColor + '">View Details →</button>'
        + '  </div>'
        + '</div>';
    }).join('');

    _renderMain(
      '<div style="max-width:1100px;margin:0 auto;padding:2rem 1rem">'
      + '  <div style="margin-bottom:2.5rem;text-align:center">'
      + '    <span class="owl-badge owl-badge-primary">Learning Path</span>'
      + '    <h1 style="font-size:2.5rem;font-weight:800;margin:0.5rem 0 0.5rem">Master AI Skills Step-by-Step</h1>'
      + '    <p style="color:var(--text-secondary);font-size:1.1rem;max-width:600px;margin:0 auto">Select a track below to begin. Complete lessons, pass quizzes, and earn your official AI certificates!</p>'
      + '  </div>'
      + '  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.5rem">'
      + cardsHtml
      + '  </div>'
      + '</div>'
    );
  }

  function showCourse(courseId) {
    if (_dispatchPage('showCourse', courseId)) return;
    if (!window.OWL.auth.requireAuth()) return;

    var user = window.OWL.auth.getCurrentUser();
    var courses = window.OWL.courses || [];
    var course = courses.find(function (c) { return c.id === courseId; });
    if (!course) {
      show404('/course/' + courseId);
      return;
    }

    var userProgress = {};
    try {
      userProgress = JSON.parse(localStorage.getItem('owl_user_progress_' + user.id) || '{}');
    } catch (e) {}

    var prog = userProgress[course.id] || { completedLessons: [] };
    var completedLessons = prog.completedLessons || [];
    var courseColor = course.color || '#4F46E5';

    var nodesHtml = '';
    var allCompleted = true;

    for (var i = 0; i < course.lessons.length; i++) {
      var lesson = course.lessons[i];
      var isCompleted = completedLessons.indexOf(lesson.id) !== -1;
      var isLocked = false;
      if (i > 0) {
        var prevLesson = course.lessons[i-1];
        var isPrevCompleted = completedLessons.indexOf(prevLesson.id) !== -1;
        isLocked = !isPrevCompleted;
      }
      if (!isCompleted) allCompleted = false;

      var nodeClass = '';
      var nodeStyle = '';
      var statusIcon = '';

      if (isLocked) {
        nodeClass = 'node-locked';
        statusIcon = '🔒';
        nodeStyle = 'background:var(--bg-elevated);border-color:var(--border);cursor:not-allowed;opacity:0.6;';
      } else if (isCompleted) {
        nodeClass = 'node-completed';
        statusIcon = '✅';
        nodeStyle = 'background:var(--success);border-color:var(--success-light);color:#fff;box-shadow:0 0 15px var(--success-glow);cursor:pointer;';
      } else {
        nodeClass = 'node-active';
        statusIcon = (i + 1);
        nodeStyle = 'background:' + courseColor + ';border-color:#fff;color:#fff;box-shadow:0 0 20px ' + courseColor + '60;cursor:pointer;animation:node-pulse 2s infinite;';
      }

      var xOffset = Math.round(Math.sin(i * 1.5) * 80);

      nodesHtml += '<div class="path-node-wrapper" style="margin-left:' + xOffset + 'px;display:flex;flex-direction:column;align-items:center;position:relative;z-index:1">'
        + '  <button class="path-node ' + nodeClass + '" style="' + nodeStyle + 'width:70px;height:70px;border-radius:50%;border:4px solid;font-size:1.4rem;font-weight:800;display:flex;align-items:center;justify-content:center;transition:all var(--transition-bounce)" '
        + '          onclick="OWL.app._handleNodeClick(\'' + course.id + '\',\'' + lesson.id + '\',' + isLocked + ',' + isCompleted + ')">'
        + '    ' + statusIcon
        + '  </button>'
        + '  <div style="margin-top:0.4rem;font-size:0.85rem;font-weight:700;color:var(--text-primary);text-align:center;max-width:140px;text-shadow:0 2px 4px rgba(0,0,0,0.5)">'
        + '    ' + _esc(lesson.title)
        + '  </div>'
        + '</div>';
    }

    var certLocked = !allCompleted;
    var certClass = certLocked ? 'node-locked' : 'node-active';
    var certStyle = certLocked
      ? 'background:var(--bg-elevated);border-color:var(--border);cursor:not-allowed;opacity:0.6;'
      : 'background:var(--gold);border-color:#fff;color:#1e1b4b;box-shadow:0 0 25px rgba(246,201,14,0.6);cursor:pointer;animation:node-pulse 1.8s infinite;';
    var certOffset = Math.round(Math.sin(course.lessons.length * 1.5) * 80);

    nodesHtml += '<div class="path-node-wrapper" style="margin-left:' + certOffset + 'px;display:flex;flex-direction:column;align-items:center;position:relative;z-index:1;margin-top:1rem">'
      + '  <button class="path-node ' + certClass + '" style="' + certStyle + 'width:80px;height:80px;border-radius:50%;border:4px solid;font-size:1.8rem;display:flex;align-items:center;justify-content:center;transition:all var(--transition-bounce)" '
      + '          onclick="OWL.app._handleCertNodeClick(\'' + course.id + '\',' + certLocked + ')">'
      + '    📜'
      + '  </button>'
      + '  <div style="margin-top:0.5rem;font-size:0.9rem;font-weight:800;color:var(--gold);text-align:center;text-shadow:0 2px 8px rgba(246,201,14,0.3)">'
      + '    Course Certificate'
      + '  </div>'
      + '</div>';

    _renderMain(
      '<div style="max-width:800px;margin:0 auto;padding:2rem 1rem">'
      + '  <div style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem">'
      + '    <button class="owl-btn owl-btn-secondary" onclick="OWL.app.navigate(\'/learn\')" style="font-size:0.85rem;padding:0.4rem 1rem">← Learning Map</button>'
      + '    <h2 style="font-size:1.5rem;font-weight:800;margin:0;color:' + courseColor + '">' + _esc(course.title) + '</h2>'
      + '  </div>'
      + '  <div class="owl-card" style="margin-bottom:3rem;background:' + courseColor + '10;border-color:' + courseColor + '30;display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap">'
      + '    <div style="font-size:3.5rem">' + (course.icon || '📚') + '</div>'
      + '    <div style="flex:1">'
      + '      <h3 style="margin:0 0 0.5rem;font-size:1.2rem">' + _esc(course.title) + '</h3>'
      + '      <p style="color:var(--text-secondary);margin:0;font-size:0.95rem">' + _esc(course.description) + '</p>'
      + '    </div>'
      + '  </div>'
      + '  <div style="display:flex;flex-direction:column;align-items:center;gap:2.5rem;position:relative;padding:2rem 0;background:rgba(255,255,255,0.01);border-radius:1.5rem;border:1px solid var(--border)">'
      + '    <div style="position:absolute;width:4px;top:4rem;bottom:5rem;border-left:4px dashed var(--border);left:50%;transform:translateX(-50%);z-index:0"></div>'
      + '    ' + nodesHtml
      + '  </div>'
      + '  <style>'
      + '    @keyframes node-pulse {'
      + '      0% { transform: scale(1); box-shadow: 0 0 0 0 ' + courseColor + '60; }'
      + '      70% { transform: scale(1.05); box-shadow: 0 0 0 15px ' + courseColor + '00; }'
      + '      100% { transform: scale(1); box-shadow: 0 0 0 0 ' + courseColor + '00; }'
      + '    }'
      + '  </style>'
      + '</div>'
    );
  }

  function showLesson(courseId, lessonId) {
    if (_dispatchPage('showLesson', courseId, lessonId)) return;
    if (!window.OWL.auth.requireAuth()) return;

    var courses = window.OWL.courses || [];
    var course = courses.find(function (c) { return c.id === courseId; });
    if (!course) {
      show404('/lesson/' + courseId + '/' + lessonId);
      return;
    }

    var lesson = (course.lessons || []).find(function (l) { return l.id === lessonId; });
    if (!lesson) {
      show404('/lesson/' + courseId + '/' + lessonId);
      return;
    }

    var sections = [];
    if (lesson.content && lesson.content.sections) {
      sections = lesson.content.sections;
    } else {
      sections = [
        { type: 'text', body: 'Welcome to this lesson on ' + lesson.title + '!' },
        { type: 'highlight', body: 'Learn key AI concepts, check real examples, and test your knowledge.' },
        { type: 'text', body: 'This is a brief placeholder slide. Proceed to the next slide to unlock the quiz!' }
      ];
    }

    _lessonState.courseId = courseId;
    _lessonState.lessonId = lessonId;
    _lessonState.currentIndex = 0;
    _lessonState.sections = sections;

    _renderLessonSlide();
  }

  function _renderLessonSlide() {
    var state = _lessonState;
    var course = (window.OWL.courses || []).find(function (c) { return c.id === state.courseId; });
    var lesson = (course.lessons || []).find(function (l) { return l.id === state.lessonId; });
    var section = state.sections[state.currentIndex];
    var totalSlides = state.sections.length;
    var pct = Math.round(((state.currentIndex + 1) / totalSlides) * 100);
    var courseColor = course.color || '#4F46E5';

    var slideContentHtml = '';

    if (section.type === 'text') {
      slideContentHtml = '<div style="font-size:1.15rem;line-height:1.75;color:var(--text-primary);margin-bottom:1.5rem">'
        + '  ' + _esc(section.body)
        + '</div>';
    } else if (section.type === 'highlight') {
      slideContentHtml = '<div style="border-left:5px solid ' + courseColor + ';background:rgba(255,255,255,0.03);padding:1.25rem 1.5rem;border-radius:0.5rem;margin-bottom:1.5rem;font-style:italic">'
        + '  <div style="font-size:1.8rem;margin-bottom:0.5rem">💡</div>'
        + '  <div style="font-size:1.05rem;line-height:1.7;color:var(--text-primary)">' + _esc(section.body) + '</div>'
        + '</div>';
    } else if (section.type === 'list') {
      var listItems = (section.items || []).map(function (item) {
        return '<li style="margin-bottom:0.8rem;display:flex;align-items:start;gap:0.75rem">'
          + '  <span style="color:' + courseColor + ';font-weight:bold;font-size:1.2rem">✓</span>'
          + '  <span style="font-size:1.05rem;line-height:1.6;color:var(--text-primary)">' + _esc(item) + '</span>'
          + '</li>';
      }).join('');
      slideContentHtml = '<ul style="list-style:none;padding:0;margin:0 0 1.5rem">'
        + '  ' + listItems
        + '</ul>';
    } else if (section.type === 'example') {
      slideContentHtml = '<div style="margin-bottom:1.5rem">'
        + '  <div style="font-size:0.9rem;font-weight:700;color:var(--text-secondary);margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:0.05em">💡 ' + _esc(section.title || 'Example') + '</div>'
        + '  <div style="background:var(--bg-base);border:1px solid var(--border);border-radius:0.5rem;padding:1.25rem;font-family:monospace;font-size:0.95rem;line-height:1.6;color:#818cf8;white-space:pre-wrap;overflow-x:auto">'
        + '    ' + _esc(section.body)
        + '  </div>'
        + '</div>';
    } else {
      slideContentHtml = '<div style="font-size:1.1rem;color:var(--text-primary)">' + _esc(section.body || '') + '</div>';
    }

    _renderMain(
      '<div style="max-width:740px;margin:0 auto;padding:2rem 1rem">'
      + '  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">'
      + '    <button class="owl-btn owl-btn-secondary" onclick="OWL.app.navigate(\'/course/' + state.courseId + '\')" style="font-size:0.85rem;padding:0.4rem 1rem">← Quit Lesson</button>'
      + '    <span style="font-size:0.9rem;font-weight:600;color:var(--text-secondary)">' + _esc(lesson.title) + '</span>'
      + '    <span class="owl-badge owl-badge-primary">Slide ' + (state.currentIndex + 1) + ' of ' + totalSlides + '</span>'
      + '  </div>'
      + '  <div class="owl-progress-bar" style="margin-bottom:2.5rem">'
      + '    <div class="owl-progress-fill" style="width:' + pct + '%;background:' + courseColor + '"></div>'
      + '  </div>'
      + '  <div class="owl-card" style="min-height:280px;display:flex;flex-direction:column;justify-content:center;padding:2.5rem 3rem;background:var(--bg-surface);border-color:var(--border);box-shadow:var(--shadow-lg)">'
      + '    ' + slideContentHtml
      + '  </div>'
      + '  <div style="display:flex;justify-content:space-between;margin-top:2rem">'
      + '    <button class="owl-btn owl-btn-secondary" ' + (state.currentIndex === 0 ? 'disabled style="opacity:0.4;cursor:default"' : '') + ' onclick="OWL.app._prevSlide()">← Previous</button>'
      + '    <button class="owl-btn owl-btn-primary" style="background:' + courseColor + ';box-shadow:0 4px 12px ' + courseColor + '40" onclick="OWL.app._nextSlide()">'
      + '      ' + (state.currentIndex + 1 === totalSlides ? 'Start Lesson Quiz 🧠' : 'Continue →')
      + '    </button>'
      + '  </div>'
      + '</div>'
    );
  }

  function _prevSlide() {
    if (_lessonState.currentIndex > 0) {
      _lessonState.currentIndex--;
      _renderLessonSlide();
    }
  }

  function _nextSlide() {
    if (_lessonState.currentIndex + 1 < _lessonState.sections.length) {
      _lessonState.currentIndex++;
      _renderLessonSlide();
    } else {
      var user = window.OWL.auth.getCurrentUser();
      if (user && window.OWL.gamification) {
        window.OWL.gamification.awardXP(user.id, 50, 'Completed reading lesson: ' + _lessonState.lessonId);
      }
      if (window.OWL.quiz && window.OWL.quiz.show) {
        window.OWL.quiz.show(_lessonState.lessonId, _lessonState.courseId);
      } else {
        window.OWL.ui.toast('Quiz module not loaded!', 'error');
        navigate('/course/' + _lessonState.courseId);
      }
    }
  }

  function _handleNodeClick(courseId, lessonId, isLocked, isCompleted) {
    if (isLocked) {
      window.OWL.ui.toast('This lesson is locked! Complete the previous lessons first. 🔒', 'warning');
      return;
    }

    var course = (window.OWL.courses || []).find(function(c) { return c.id === courseId; });
    if (!course) return;
    var lesson = (course.lessons || []).find(function(l) { return l.id === lessonId; });
    if (!lesson) return;

    window.OWL.ui.modal({
      title: '📖 ' + lesson.title,
      body: '<div style="font-size:0.95rem;color:var(--text-secondary)">'
        + '  <p style="margin-bottom:1rem">' + (lesson.description || 'Learn key AI concepts, check real examples, and test your knowledge.') + '</p>'
        + '  <div style="display:flex;gap:1rem;margin-top:1.25rem;background:var(--bg-elevated);padding:0.75rem 1rem;border-radius:0.5rem">'
        + '    <span>⏱ <strong>' + (lesson.duration || '8 min') + '</strong></span>'
        + '    <span>⭐ <strong>+' + (lesson.xp || 50) + ' XP</strong> potential</span>'
        + '  </div>'
        + '</div>',
      buttons: [
        { label: 'Cancel', primary: false, action: function() {} },
        {
          label: isCompleted ? 'Review Lesson 📚' : 'Start Lesson 🚀',
          primary: true,
          action: function() {
            navigate('/lesson/' + courseId + '/' + lessonId);
          }
        }
      ]
    });
  }

  function _handleCertNodeClick(courseId, certLocked) {
    if (certLocked) {
      window.OWL.ui.toast('Complete all lessons in the track to unlock your Certificate! 🎓', 'warning');
      return;
    }

    var user = window.OWL.auth.getCurrentUser();
    var course = (window.OWL.courses || []).find(function(c) { return c.id === courseId; });
    if (!course) return;

    window.OWL.ui.modal({
      title: '🎓 Claim Your Certificate!',
      body: '<p style="color:var(--text-secondary);font-size:0.95rem">'
        + 'Congratulations! You have completed all lessons in <strong>' + course.title + '</strong>. '
        + 'You are ready to claim your official certificate of completion!'
        + '</p>',
      buttons: [
        { label: 'Cancel', primary: false, action: function() {} },
        {
          label: 'Claim Certificate 📜',
          primary: true,
          action: function() {
            var cert = window.OWL.certificates.generate(courseId, user.name);
            window.OWL.ui.toast('Certificate generated successfully! 🎓', 'success');
            navigate('/certificates');
          }
        }
      ]
    });
  }

  function showQuiz(courseId, lessonId) {
    if (_dispatchPage('showQuiz', courseId, lessonId)) return;
    if (!window.OWL.auth.requireAuth()) return;

    if (lessonId && courseId) {
      if (window.OWL.quiz && window.OWL.quiz.show) {
        window.OWL.quiz.show(lessonId, courseId);
      } else {
        window.OWL.ui.toast('Quiz module not loaded!', 'error');
        navigate('/dashboard');
      }
    } else {
      _renderMain(
        '<div style="max-width:600px;margin:3rem auto;padding:2rem 1rem">'
        + '  <div class="owl-card" style="text-align:center">'
        + '    <div style="font-size:4rem;margin-bottom:1rem">🧠</div>'
        + '    <h2 style="margin-bottom:0.5rem">AI Quiz Playground</h2>'
        + '    <p style="color:var(--text-secondary);margin-bottom:2rem">Test your AI knowledge by generating a custom quiz on any topic, or enter a custom prompt!</p>'
        + '    <div class="form-group" style="text-align:left;margin-bottom:1.5rem">'
        + '      <label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.4rem;color:var(--text-secondary)">Select a Topic</label>'
        + '      <select class="owl-input" id="quiz-topic-select" style="margin-bottom:1rem">'
        + '        <option value="machine learning">Machine Learning Basics</option>'
        + '        <option value="prompt engineering">Prompt Engineering</option>'
        + '        <option value="llm">Large Language Models (LLMs)</option>'
        + '        <option value="chatgpt">ChatGPT & OpenAI</option>'
        + '        <option value="claude">Claude & Anthropic</option>'
        + '        <option value="gemini">Gemini & Google AI</option>'
        + '      </select>'
        + '      <label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.4rem;color:var(--text-secondary)">Or type a Custom Topic</label>'
        + '      <input class="owl-input" id="quiz-topic-custom" placeholder="e.g. Deep learning, computer vision">'
        + '    </div>'
        + '    <button class="owl-btn owl-btn-primary" style="width:100%;justify-content:center" onclick="OWL.app._startPlaygroundQuiz()">Launch Quiz 🚀</button>'
        + '  </div>'
        + '</div>'
      );
    }
  }

  function _startPlaygroundQuiz() {
    var sel = document.getElementById('quiz-topic-select').value;
    var cust = document.getElementById('quiz-topic-custom').value.trim();
    var topic = cust || sel;
    
    if (window.OWL.quiz && window.OWL.quiz.show) {
      var questions = window.OWL.quiz.generateAIQuiz(topic);
      window.OWL.quiz.startQuiz(questions, 'custom-' + Date.now(), 'custom');
    } else {
      window.OWL.ui.toast('Quiz module not loaded!', 'error');
    }
  }

  function showMentor() {
    if (_dispatchPage('showMentor')) return;
    if (!window.OWL.auth.requireAuth()) return;
    _pageStub('AI Mentor', '🤖', 'Ask OwlBot anything about AI, ML, or your coursework.', false);
  }

  function showProjects() {
    if (_dispatchPage('showProjects')) return;
    if (!window.OWL.auth.requireAuth()) return;

    var user = window.OWL.auth.getCurrentUser();
    var projects = user.projects || [];

    _renderMain(
      '<div style="max-width:900px;margin:0 auto;padding:2rem 1rem">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">'
      + '<div>'
      + '<h1 style="margin:0;font-size:1.8rem;font-weight:800">🛠️ My Projects</h1>'
      + '<p style="margin:0;color:var(--text-secondary)">Build and share your AI projects to earn XP</p>'
      + '</div>'
      + '<button class="owl-btn owl-btn-primary" onclick="OWL.app._showSubmitProject()">+ Submit Project</button>'
      + '</div>'

      + (projects.length === 0
          ? '<div class="owl-card" style="text-align:center;padding:3rem">'
            + '<div style="font-size:4rem;margin-bottom:1rem">🏗️</div>'
            + '<h3 style="margin:0 0 0.5rem">No projects yet</h3>'
            + '<p style="color:var(--text-secondary)">Submit your first AI project to earn bonus XP!</p>'
            + '</div>'
          : '<div style="display:grid;gap:1rem">'
            + projects.map(function (p) {
                return '<div class="owl-card" style="display:flex;gap:1rem;align-items:flex-start">'
                  + '<div style="font-size:2.5rem">🛠️</div>'
                  + '<div style="flex:1">'
                  + '<h3 style="margin:0 0 0.25rem;font-size:1.1rem">' + _esc(p.title) + '</h3>'
                  + '<p style="margin:0 0 0.5rem;color:var(--text-secondary);font-size:0.9rem">' + _esc(p.description) + '</p>'
                  + (p.url ? '<a href="' + _esc(p.url) + '" target="_blank" style="font-size:0.85rem">🔗 View Project</a>' : '')
                  + '</div>'
                  + '<div style="text-align:right;white-space:nowrap">'
                  + '<span class="owl-badge owl-badge-success">+' + (p.xp || 0) + ' XP</span>'
                  + '</div>'
                  + '</div>';
              }).join('')
            + '</div>'
        )
      + '</div>'
    );
  }

  function _showSubmitProject() {
    window.OWL.ui.modal({
      title: '🛠️ Submit a Project',
      body: '<form id="project-form" style="display:flex;flex-direction:column;gap:0.75rem">'
        + '<div><label style="font-size:0.85rem;font-weight:600;color:var(--text-secondary)">Project Title</label>'
        + '<input id="proj-title" class="owl-input" placeholder="My AI Chatbot" style="margin-top:0.3rem"></div>'
        + '<div><label style="font-size:0.85rem;font-weight:600;color:var(--text-secondary)">Description</label>'
        + '<textarea id="proj-desc" class="owl-input" placeholder="What did you build and what does it do?" '
        + 'rows="3" style="margin-top:0.3rem;resize:vertical"></textarea></div>'
        + '<div><label style="font-size:0.85rem;font-weight:600;color:var(--text-secondary)">Project URL (optional)</label>'
        + '<input id="proj-url" class="owl-input" placeholder="https://github.com/..." style="margin-top:0.3rem"></div>'
        + '</form>',
      buttons: [
        { label: 'Cancel', primary: false, action: function () {} },
        {
          label  : 'Submit Project',
          primary: true,
          action : function () {
            var title = (document.getElementById('proj-title') || {}).value || '';
            var desc  = (document.getElementById('proj-desc')  || {}).value || '';
            var url   = (document.getElementById('proj-url')   || {}).value || '';
            if (!title.trim()) { window.OWL.ui.toast('Please enter a project title.', 'warning'); return; }
            var user = window.OWL.auth.getCurrentUser();
            var proj = {
              id         : 'proj_' + Date.now(),
              title      : title.trim(),
              description: desc.trim(),
              url        : url.trim(),
              courseId   : null,
              xp         : 200,
              submittedAt: new Date().toISOString()
            };
            user.projects = user.projects || [];
            user.projects.push(proj);
            window.OWL.gamification.saveUser(user);
            window.OWL.state.user = user;
            window.OWL.gamification.awardXP(user.id, 200, 'Project submitted');
            window.OWL.ui.toast('Project submitted! +200 XP 🚀', 'success');
            showProjects(); // refresh
          }
        }
      ]
    });
  }

  function showCertificates() {
    if (_dispatchPage('showCertificates')) return;
    if (!window.OWL.auth.requireAuth()) return;

    var user = window.OWL.auth.getCurrentUser();
    var certs = user.certificates || [];

    _renderMain(
      '<div style="max-width:900px;margin:0 auto;padding:2rem 1rem">'
      + '<h1 style="margin:0 0 0.5rem;font-size:1.8rem;font-weight:800">📜 My Certificates</h1>'
      + '<p style="margin:0 0 1.5rem;color:var(--text-secondary)">Proof of your AI mastery</p>'
      + (certs.length === 0
          ? '<div class="owl-card" style="text-align:center;padding:3rem">'
            + '<div style="font-size:4rem;margin-bottom:1rem">🏅</div>'
            + '<h3 style="margin:0 0 0.5rem">No certificates yet</h3>'
            + '<p style="color:var(--text-secondary)">Complete a full course to earn a certificate!</p>'
            + '<button class="owl-btn owl-btn-primary" style="margin-top:1rem" onclick="OWL.app.navigate(\'/learn\')">Start Learning</button>'
            + '</div>'
          : '<div style="display:grid;gap:1rem">'
            + certs.map(function (c) {
                return '<div class="owl-card" style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">'
                  + '<div style="font-size:3rem">📜</div>'
                  + '<div style="flex:1">'
                  + '<h3 style="margin:0 0 0.25rem">' + _esc(c.courseName) + '</h3>'
                  + '<p style="margin:0;color:var(--text-secondary);font-size:0.9rem">'
                  + 'Issued: ' + _esc(c.date) + ' · Verify: <code>' + _esc(c.verifyCode) + '</code>'
                  + '</p>'
                  + '</div>'
                  + '</div>';
              }).join('')
            + '</div>'
        )
      + '</div>'
    );
  }

  function showLeaderboard() {
    if (_dispatchPage('showLeaderboard')) return;

    var board = window.OWL.gamification.getLeaderboard();
    var currentUser = window.OWL.auth.getCurrentUser();
    var ui = window.OWL.ui;

    _renderMain(
      '<div style="max-width:800px;margin:0 auto;padding:2rem 1rem">'
      + '<h1 style="margin:0 0 0.25rem;font-size:1.8rem;font-weight:800">🏆 Leaderboard</h1>'
      + '<p style="margin:0 0 1.5rem;color:var(--text-secondary)">Top AI learners worldwide</p>'

      + '<div style="display:flex;flex-direction:column;gap:0.5rem">'
      + board.map(function (entry) {
          var isCurrent = currentUser && entry.id === currentUser.id;
          var rankEmoji = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '#' + entry.rank;
          return '<div class="owl-card" style="display:flex;align-items:center;gap:1rem;padding:0.75rem 1rem;'
            + (isCurrent ? 'border-color:var(--primary);background:rgba(99,102,241,0.05)' : '') + '">'
            + '<span style="font-size:' + (entry.rank <= 3 ? '1.5rem' : '0.9rem') + ';min-width:2.5rem;text-align:center;font-weight:700">'
            + rankEmoji + '</span>'
            + '<span style="font-size:1.6rem">' + (entry.avatar || '🦉') + '</span>'
            + '<div style="flex:1">'
            + '<div style="font-weight:600">' + _esc(entry.name) + (isCurrent ? ' <span style="color:var(--primary);font-size:0.8rem">(you)</span>' : '') + '</div>'
            + '<div style="font-size:0.8rem;color:var(--text-secondary)">'
            + ui.formatLevel(entry.level) + ' · ' + entry.levelTitle
            + '</div>'
            + '</div>'
            + '<div style="text-align:right">'
            + '<div style="font-weight:700;color:var(--primary)">' + ui.formatXP(entry.xp) + '</div>'
            + '<div style="font-size:0.8rem;color:var(--text-secondary)">🔥 ' + entry.streak + ' day streak</div>'
            + '</div>'
            + '</div>';
        }).join('')
      + '</div>'
      + '</div>'
    );
  }

  function showTeacher() {
    if (_dispatchPage('showTeacher')) return;
    var user = window.OWL.auth.getCurrentUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      window.OWL.ui.toast('Access denied — Teacher account required.', 'error');
      navigate('/dashboard');
      return;
    }
    _pageStub('Teacher Dashboard', '🧑‍🏫', 'Manage your classroom, students, and track progress.', false);
  }

  function showAdmin() {
    if (_dispatchPage('showAdmin')) return;
    var user = window.OWL.auth.getCurrentUser();
    if (!user || user.role !== 'admin') {
      window.OWL.ui.toast('Access denied — Admin account required.', 'error');
      navigate('/dashboard');
      return;
    }
    _pageStub('Admin Panel', '⚙️', 'Manage users, courses, content and platform settings.', false);
  }

  function showProfile() {
    if (_dispatchPage('showProfile')) return;
    if (!window.OWL.auth.requireAuth()) return;

    var user = window.OWL.auth.getCurrentUser();
    var ui   = window.OWL.ui;
    var gam  = window.OWL.gamification;
    var avatars = ui.avatarEmojis;

    _renderMain(
      '<div style="max-width:640px;margin:0 auto;padding:2rem 1rem">'
      + '<h1 style="margin:0 0 1.5rem;font-size:1.8rem;font-weight:800">👤 My Profile</h1>'

      + '<div class="owl-card" style="margin-bottom:1.5rem;text-align:center">'
      + '<div style="font-size:5rem;margin-bottom:0.75rem">' + (user.avatar || '🦉') + '</div>'
      + '<h2 style="margin:0 0 0.25rem">' + _esc(user.name) + '</h2>'
      + '<p style="margin:0;color:var(--text-secondary)">'
      + gam.getLevelTitle(user.level) + ' · ' + ui.formatLevel(user.level)
      + '</p>'
      + '<div style="display:flex;justify-content:center;gap:1.5rem;margin-top:1rem;flex-wrap:wrap">'
      + '<span><strong>' + ui.formatXP(user.xp) + '</strong><br><span style="color:var(--text-secondary);font-size:0.8rem">Total XP</span></span>'
      + '<span><strong>' + (user.completedLessons || []).length + '</strong><br><span style="color:var(--text-secondary);font-size:0.8rem">Lessons</span></span>'
      + '<span><strong>🔥 ' + (user.streak || 0) + '</strong><br><span style="color:var(--text-secondary);font-size:0.8rem">Day Streak</span></span>'
      + '</div>'
      + '</div>'

      // Edit form
      + '<div class="owl-card" style="margin-bottom:1.5rem">'
      + '<h3 style="margin:0 0 1rem;font-size:1rem;font-weight:700">Edit Profile</h3>'

      + '<div style="margin-bottom:1rem">'
      + '<label style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:0.5rem">Avatar</label>'
      + '<div style="display:flex;flex-wrap:wrap;gap:0.4rem" id="profile-avatar-picker">'
      + avatars.map(function (em) {
          var active = em === user.avatar;
          return '<button type="button" class="owl-avatar-opt" data-emoji="' + em + '" '
            + 'onclick="OWL.app._pickProfileAvatar(\'' + em + '\')" '
            + 'style="font-size:1.6rem;background:' + (active ? 'rgba(99,102,241,0.2)' : 'var(--bg-surface)') + ';'
            + 'border:2px solid ' + (active ? 'var(--primary)' : 'var(--border-color)') + ';'
            + 'border-radius:0.5rem;padding:0.25rem 0.4rem;cursor:pointer;transition:all 0.15s">'
            + em + '</button>';
        }).join('')
      + '</div>'
      + '<input type="hidden" id="profile-avatar" value="' + _esc(user.avatar || '🦉') + '">'
      + '</div>'

      + '<div style="margin-bottom:1rem">'
      + '<label style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:0.4rem">Name</label>'
      + '<input id="profile-name" class="owl-input" value="' + _esc(user.name) + '">'
      + '</div>'

      + '<div style="margin-bottom:1.25rem">'
      + '<label style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:0.4rem">Email</label>'
      + '<input id="profile-email" class="owl-input" value="' + _esc(user.email) + '" disabled style="opacity:0.6">'
      + '</div>'

      + '<button class="owl-btn owl-btn-primary" onclick="OWL.app._saveProfile()">💾 Save Changes</button>'
      + '</div>'

      // Danger zone
      + (user.isGuest ? '' :
          '<div class="owl-card" style="border-color:rgba(239,68,68,0.3)">'
          + '<h3 style="margin:0 0 0.5rem;font-size:1rem;font-weight:700;color:var(--error)">⚠️ Danger Zone</h3>'
          + '<p style="font-size:0.9rem;color:var(--text-secondary);margin:0 0 1rem">'
          + 'Permanently delete your account and all data. This cannot be undone.'
          + '</p>'
          + '<button class="owl-btn owl-btn-danger" onclick="OWL.app._confirmDeleteAccount()">🗑️ Delete Account</button>'
          + '</div>'
        )

      + '</div>'
    );
  }

  function _pickProfileAvatar(emoji) {
    var input = document.getElementById('profile-avatar');
    if (input) input.value = emoji;
    document.querySelectorAll('#profile-avatar-picker .owl-avatar-opt').forEach(function (btn) {
      var active = btn.dataset.emoji === emoji;
      btn.style.background = active ? 'rgba(99,102,241,0.2)' : 'var(--bg-surface)';
      btn.style.borderColor = active ? 'var(--primary)' : 'var(--border-color)';
    });
  }

  function _saveProfile() {
    var name   = (document.getElementById('profile-name')   || {}).value || '';
    var avatar = (document.getElementById('profile-avatar') || {}).value || '🦉';
    if (!name.trim()) { window.OWL.ui.toast('Name cannot be empty.', 'warning'); return; }
    var result = window.OWL.auth.updateProfile({ name: name.trim(), avatar: avatar });
    if (result.success) {
      window.OWL.ui.toast('Profile updated! 🎉', 'success');
      showProfile(); // re-render
    } else {
      window.OWL.ui.toast(result.error, 'error');
    }
  }

  function _confirmDeleteAccount() {
    window.OWL.ui.confirm('Are you sure you want to delete your account? This action cannot be undone.').then(function (ok) {
      if (ok) window.OWL.auth.deleteAccount();
    });
  }

  /* ─────────────────────────────────────────
     404 Page
  ───────────────────────────────────────── */

  function show404(route) {
    _renderMain(
      '<div style="min-height:80vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem">'
      + '<div style="font-size:6rem;margin-bottom:1rem">🦉</div>'
      + '<h1 style="font-size:3rem;font-weight:900;margin:0 0 0.5rem">404</h1>'
      + '<p style="color:var(--text-secondary);font-size:1.1rem;margin:0 0 2rem">'
      + 'Hoot! This page doesn\'t exist: <code>' + _esc(route) + '</code>'
      + '</p>'
      + '<button class="owl-btn owl-btn-primary" onclick="OWL.app.navigate(\'/\')">🏠 Go Home</button>'
      + '</div>'
    );
  }

  /* ─────────────────────────────────────────
     Navigation Bar Builder
  ───────────────────────────────────────── */

  function _buildNav() {
    var navEl = document.getElementById('owl-nav');
    if (!navEl) return; // nav not present in this layout

    var user = window.OWL.auth ? window.OWL.auth.getCurrentUser() : null;

    var leftLinks = [
      { route: '/learn',       label: '📚 Learn'        },
      { route: '/leaderboard', label: '🏆 Leaderboard'  },
      { route: '/mentor',      label: '🤖 Mentor'       }
    ];

    var rightLinks = user
      ? [
          { route: '/dashboard',  label: (user.avatar || '🦉') + ' Dashboard' },
          { route: '/profile',    label: '👤 Profile'                         }
        ]
      : [
          { route: '/login',  label: 'Log In'    },
          { route: '/signup', label: '🚀 Sign Up' }
        ];

    navEl.innerHTML =
      '<div style="max-width:1200px;margin:0 auto;display:flex;align-items:center;padding:0 1rem;height:100%">'
      // Logo
      + '<a href="#/" data-nav="/" style="font-size:1.3rem;font-weight:900;color:var(--text-primary);text-decoration:none;margin-right:2rem">'
      + '🦉 OwlMind'
      + '</a>'
      // Left links
      + '<nav style="display:flex;gap:1.25rem;flex:1">'
      + leftLinks.map(function (l) {
          return '<a href="#' + l.route + '" data-nav="' + l.route + '" '
            + 'style="color:var(--text-secondary);font-size:0.9rem;font-weight:500;text-decoration:none;'
            + 'transition:color 0.2s" '
            + 'onmouseenter="this.style.color=\'var(--primary)\'" '
            + 'onmouseleave="this.style.color=\'var(--text-secondary)\'">'
            + l.label + '</a>';
        }).join('')
      + '</nav>'
      // Right links
      + '<div style="display:flex;align-items:center;gap:1rem">'
      + rightLinks.map(function (l) {
          return '<a href="#' + l.route + '" data-nav="' + l.route + '" '
            + 'style="color:var(--text-secondary);font-size:0.9rem;font-weight:500;text-decoration:none">'
            + l.label + '</a>';
        }).join('')
      + (user
          ? '<button onclick="OWL.auth.logout()" style="background:none;border:1px solid var(--border-color);'
            + 'color:var(--text-secondary);border-radius:0.4rem;padding:0.35rem 0.75rem;cursor:pointer;font-size:0.85rem">'
            + 'Log Out</button>'
          : ''
        )
      // Theme toggle
      + '<button data-theme-toggle onclick="OWL.app._toggleTheme()" '
      + 'style="background:none;border:1px solid var(--border-color);border-radius:0.4rem;'
      + 'padding:0.35rem 0.6rem;cursor:pointer;font-size:1rem;color:var(--text-primary)">'
      + (window.OWL.state.theme === 'dark' ? '☀️' : '🌙')
      + '</button>'
      + '</div>'
      + '</div>';

    // Update active nav state
    if (window.OWL.ui) window.OWL.ui.updateNav();
  }

  function _toggleTheme() {
    var current = window.OWL.state.theme || 'dark';
    var next    = current === 'dark' ? 'light' : 'dark';
    window.OWL.ui.setTheme(next);
    window.OWL.state.theme = next;
    // Refresh theme toggle button text
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }

  /* ─────────────────────────────────────────
     Utility
  ───────────────────────────────────────── */

  function _esc(str) {
    return window.OWL.ui ? window.OWL.ui._escHtml(str) : String(str || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c];
    });
  }

  function _floatKeyframes() {
    return '<style>@keyframes owl-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}</style>';
  }

  /* ─────────────────────────────────────────
     Initialization
  ───────────────────────────────────────── */

  /**
   * App entry point. Called once on DOMContentLoaded.
   */
  function init() {
    // 1. Ensure OWL namespace is fully set up
    window.OWL.state = window.OWL.state || { user: null, theme: 'dark' };

    // Backup original landing page html from index.html
    var landingEl = document.getElementById('page-landing');
    if (landingEl) {
      originalLandingHTML = landingEl.outerHTML;
    }

    // Bridging window.OWL.pages to component views
    window.OWL.pages = {
      showDashboard: function () { if (window.OWL.dashboard && window.OWL.dashboard.show) window.OWL.dashboard.show(); },
      showMentor: function () { if (window.OWL.mentor && window.OWL.mentor.show) window.OWL.mentor.show(); },
      showProjects: function () { if (window.OWL.projects && window.OWL.projects.show) window.OWL.projects.show(); },
      showCertificates: function () { if (window.OWL.certificates && window.OWL.certificates.show) window.OWL.certificates.show(); },
      showTeacher: function () { if (window.OWL.teacher && window.OWL.teacher.show) window.OWL.teacher.show(); },
      showAdmin: function () { if (window.OWL.admin && window.OWL.admin.show) window.OWL.admin.show(); },
      showQuiz: function (courseId, lessonId) { if (window.OWL.quiz && window.OWL.quiz.show) window.OWL.quiz.show(lessonId, courseId); }
    };

    // 2. Initialize demo accounts
    if (window.OWL.auth && window.OWL.auth.initDemoAccounts) {
      window.OWL.auth.initDemoAccounts();
    }

    // 3. Load and apply theme
    var theme = 'dark';
    if (window.OWL.ui) {
      theme = window.OWL.ui.loadTheme();
    } else {
      theme = localStorage.getItem('owlmind_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', theme);
    }
    window.OWL.state.theme = theme;

    // 4. Restore session from localStorage if present
    if (window.OWL.auth) {
      var user = window.OWL.auth.getCurrentUser();
      window.OWL.state.user = user;
    }

    // 5. Build nav if present
    _buildNav();

    // 6. Set up global click delegation for [data-nav] elements
    document.addEventListener('click', function (e) {
      var target = e.target.closest('[data-nav]');
      if (target) {
        var route = target.dataset.nav;
        if (route) {
          e.preventDefault();
          navigate(route);
        }
      }
    });

    // 7. Set up theme toggle via data-theme-toggle attribute
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-theme-toggle]')) {
        _toggleTheme();
      }
    });

    // 8. Set up hashchange listener
    window.addEventListener('hashchange', function () {
      var hash  = window.location.hash.replace(/^#/, '') || '/';
      renderPage(hash);
      _buildNav();
      if (window.OWL.ui) window.OWL.ui.updateNav();
    });

    // 9. Handle initial route
    var initialRoute = window.location.hash.replace(/^#/, '') || '/';
    renderPage(initialRoute);
  }

  /* ─────────────────────────────────────────
     Public API
  ───────────────────────────────────────── */

  window.OWL.app = {
    navigate             : navigate,
    init                 : init,
    renderPage           : renderPage,
    getRouteParams       : getRouteParams,

    // Page renderers (also exposed so page scripts can override via OWL.pages)
    showLanding          : showLanding,
    showLogin            : showLogin,
    showSignup           : showSignup,
    showDashboard        : showDashboard,
    showLearnMap         : showLearnMap,
    showCourse           : showCourse,
    showLesson           : showLesson,
    showQuiz             : showQuiz,
    showMentor           : showMentor,
    showProjects         : showProjects,
    showCertificates     : showCertificates,
    showLeaderboard      : showLeaderboard,
    showTeacher          : showTeacher,
    showAdmin            : showAdmin,
    showProfile          : showProfile,

    // Internal helpers exposed for inline HTML event handlers
    _handleLogin         : _handleLogin,
    _handleSignup        : _handleSignup,
    _pickAvatar          : _pickAvatar,
    _pickProfileAvatar   : _pickProfileAvatar,
    _saveProfile         : _saveProfile,
    _confirmDeleteAccount: _confirmDeleteAccount,
    _showSubmitProject   : _showSubmitProject,
    _toggleTheme         : _toggleTheme,
    _buildNav            : _buildNav,
    _prevSlide           : _prevSlide,
    _nextSlide           : _nextSlide,
    _handleNodeClick     : _handleNodeClick,
    _handleCertNodeClick : _handleCertNodeClick,
    _startPlaygroundQuiz : _startPlaygroundQuiz
  };

  /* ─────────────────────────────────────────
     Auto-init on DOM ready
  ───────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already ready (e.g. script loaded at end of body)
    init();
  }

})();
