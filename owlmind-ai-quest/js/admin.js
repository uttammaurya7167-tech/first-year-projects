/* admin.js — OwlMind AI Quest
   Exposes window.OWL.admin
   Depends on: OWL.state, OWL.courses, OWL.badges, OWL.app
   Requires admin role.
*/
(function (OWL) {
  'use strict';

  var ALL_USERS_KEY   = 'owl_all_users';
  var CERT_KEY        = 'owl_certificates';
  var COMMUNITY_KEY   = 'owl_community_projects';

  /* ─── helpers ─── */
  function _appContent() { return document.getElementById('app-content'); }
  function _user() { return (OWL.state && OWL.state.user) || {}; }

  function _isAdmin() { return _user().role === 'admin'; }

  function _getAllUsers() {
    try { return JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]'); }
    catch(e) { return []; }
  }
  function _saveAllUsers(users) {
    try { localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users)); }
    catch(e) {}
  }

  function _getCerts() {
    try { return JSON.parse(localStorage.getItem(CERT_KEY) || '[]'); }
    catch(e) { return []; }
  }

  function _levelFromXP(xp) { return Math.floor((xp || 0) / 200) + 1; }

  function _totalXPAwarded() {
    return _getAllUsers().reduce(function(sum, u) { return sum + (u.xp || 0); }, 0);
  }

  function _formatDate(str) {
    if (!str) return '—';
    var d = new Date(str);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function _formatDateShort(str) {
    if (!str) return '—';
    var d = new Date(str);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function _activeToday() {
    var today = new Date().toDateString();
    return _getAllUsers().filter(function(u) {
      return u.lastLogin && new Date(u.lastLogin).toDateString() === today;
    }).length;
  }

  /* ─── getStats ─── */
  function getStats() {
    var users = _getAllUsers();
    var certs = _getCerts();
    var courses = OWL.courses || [];
    var badges = OWL.badges || [];
    return {
      totalUsers: users.length,
      activeToday: _activeToday(),
      totalXP: _totalXPAwarded(),
      totalCerts: certs.length,
      totalCourses: courses.length,
      totalBadges: badges.length
    };
  }

  /* ─── inject styles ─── */
  function _injectStyles() {
    if (document.getElementById('owl-admin-styles')) return;
    var style = document.createElement('style');
    style.id = 'owl-admin-styles';
    style.textContent = `
/* ─── Admin Dashboard ─── */
.admin-page { max-width: 1150px; margin: 0 auto; padding: 32px 16px; }

/* Hero */
.admin-hero { background: linear-gradient(135deg,#1a0535,#2d1659,#4a1d96);
  border-radius: 20px; padding: 36px 40px; color: #fff; margin-bottom: 28px;
  box-shadow: 0 8px 32px rgba(109,40,217,.35); }
.admin-hero h2 { font-size: 2rem; font-weight: 900; margin: 0 0 6px; }
.admin-hero p { color: #ddd6fe; margin: 0; font-size: 1rem; }
.admin-badge { display: inline-block; background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.2);
  border-radius: 99px; padding: 3px 14px; font-size: .78rem; font-weight: 700; letter-spacing: .05em;
  color: #ddd6fe; margin-top: 12px; }

/* Stats cards */
.admin-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
.admin-stat-card { background: #fff; border-radius: 16px; padding: 22px 18px; text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,.06); border: 1px solid #ede9fe; }
.admin-stat-icon { font-size: 1.8rem; margin-bottom: 8px; }
.admin-stat-val { font-size: 1.6rem; font-weight: 900; color: #1e1b4b; }
.admin-stat-lbl { font-size: .75rem; color: #6b7280; margin-top: 2px; font-weight: 500; }
.admin-stat-card:nth-child(1) { border-top: 4px solid #6366f1; }
.admin-stat-card:nth-child(2) { border-top: 4px solid #10b981; }
.admin-stat-card:nth-child(3) { border-top: 4px solid #f59e0b; }
.admin-stat-card:nth-child(4) { border-top: 4px solid #ec4899; }

/* Panel */
.admin-panel { background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06); border: 1px solid #ede9fe; }
.admin-panel-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.admin-panel-hdr h3 { font-size: 1.1rem; font-weight: 800; color: #1e1b4b; margin: 0; }
.admin-count { background: #ede9fe; color: #7c3aed; border-radius: 99px; padding: 3px 12px;
  font-size: .78rem; font-weight: 700; }

/* Table */
.admin-table-wrap { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; font-size: .86rem; }
.admin-table th { background: #faf5ff; color: #7c3aed; font-weight: 700; text-align: left;
  padding: 10px 14px; border-bottom: 2px solid #ede9fe; white-space: nowrap; }
.admin-table td { padding: 10px 14px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr:hover td { background: #faf5ff; }

/* Role badges */
.role-badge { font-size: .72rem; font-weight: 700; padding: 2px 9px; border-radius: 99px; display: inline-block; }
.role-badge.student { background: #dcfce7; color: #15803d; }
.role-badge.teacher { background: #dbeafe; color: #1d4ed8; }
.role-badge.admin   { background: #fce7f3; color: #be185d; }

/* Action buttons */
.admin-action-btn { font-size: .75rem; font-weight: 700; padding: 4px 10px; border-radius: 6px;
  border: none; cursor: pointer; transition: opacity .15s; margin-right: 4px; }
.admin-action-btn:hover { opacity: .78; }
.btn-promote { background: #6366f1; color: #fff; }
.btn-ban { background: #ef4444; color: #fff; }
.btn-reset { background: #f59e0b; color: #1e1b4b; }
.btn-toggle-course { font-size: .75rem; font-weight: 700; padding: 4px 12px; border-radius: 6px;
  border: none; cursor: pointer; transition: opacity .15s; }
.btn-enable { background: #10b981; color: #fff; }
.btn-disable { background: #ef4444; color: #fff; }

/* Course row */
.course-row-icon { font-size: 1.4rem; }
.completion-bar-wrap { width: 100px; height: 7px; background: #e0e7ff; border-radius: 99px; overflow: hidden; display: inline-block; vertical-align: middle; }
.completion-bar { height: 100%; background: linear-gradient(90deg,#6366f1,#8b5cf6); border-radius: 99px; }
.completion-pct { font-size: .78rem; color: #6b7280; margin-left: 6px; }

/* Health indicators */
.health-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(200px,1fr)); gap: 12px; }
.health-card { background: #f8f7ff; border-radius: 12px; padding: 16px; border: 1px solid #e0e7ff; }
.health-card-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.health-label { font-size: .82rem; font-weight: 600; color: #374151; }
.health-status { font-size: .72rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; }
.hs-healthy { background: #dcfce7; color: #15803d; }
.hs-warning { background: #fef3c7; color: #b45309; }
.hs-critical { background: #fee2e2; color: #991b1b; }
.health-val { font-size: 1.2rem; font-weight: 800; color: #1e1b4b; }
.health-sub { font-size: .72rem; color: #9ca3af; }

/* Badge chart SVG */
.badge-chart-wrap { overflow-x: auto; }

/* Recent signups */
.signup-list { display: flex; flex-direction: column; gap: 8px; }
.signup-item { display: flex; align-items: center; gap: 10px; background: #faf5ff;
  border-radius: 10px; padding: 10px 14px; border: 1px solid #ede9fe; }
.signup-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg,#6366f1,#8b5cf6);
  display: flex; align-items: center; justify-content: center; font-size: .9rem; color: #fff;
  font-weight: 800; flex-shrink: 0; }
.signup-name { flex: 1; font-weight: 600; font-size: .88rem; color: #1e1b4b; }
.signup-date { font-size: .78rem; color: #9ca3af; }
.signup-role { font-size: .72rem; }

/* Admin search */
.admin-search { border: 2px solid #ede9fe; border-radius: 10px; padding: 9px 14px;
  font-size: .88rem; outline: none; width: 220px; font-family: inherit; transition: border-color .15s; }
.admin-search:focus { border-color: #6366f1; }

/* Tabs */
.admin-tabs { display: flex; gap: 6px; margin-bottom: 20px; background: #f3f4f6; border-radius: 10px; padding: 4px; width: fit-content; }
.admin-tab { padding: 7px 18px; border-radius: 7px; border: none; cursor: pointer; font-weight: 600;
  font-size: .85rem; color: #6b7280; background: transparent; transition: all .15s; }
.admin-tab.active { background: #fff; color: #6366f1; box-shadow: 0 1px 4px rgba(0,0,0,.08); }

/* Modal */
.admin-modal { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 10000;
  display: flex; align-items: center; justify-content: center; padding: 20px; }
.admin-modal-box { background: #fff; border-radius: 18px; padding: 28px; max-width: 480px; width: 100%; }
.admin-modal-title { font-size: 1.1rem; font-weight: 800; color: #1e1b4b; margin: 0 0 16px; }
.admin-modal-select { width: 100%; border: 2px solid #ede9fe; border-radius: 10px; padding: 10px 14px;
  font-size: .9rem; margin-bottom: 14px; outline: none; }
.admin-modal-actions { display: flex; gap: 10px; }
.btn-admin-submit { flex:1; background:#6366f1; color:#fff; border:none; border-radius:9px;
  padding:10px; font-weight:700; cursor:pointer; font-size:.9rem; }
.btn-admin-cancel { background:#f3f4f6; color:#374151; border:none; border-radius:9px;
  padding:10px 18px; font-weight:600; cursor:pointer; font-size:.9rem; }

/* Access denied */
.admin-denied { text-align:center; padding:80px 20px; }
.admin-denied h2 { font-size:1.6rem; font-weight:800; color:#ef4444; }
.admin-denied p { color:#6b7280; }

@media(max-width:700px){
  .admin-stats-grid { grid-template-columns: repeat(2,1fr); }
}
    `;
    document.head.appendChild(style);
  }

  /* ─── manageUsers ─── */
  function manageUsers(filter) {
    var users = _getAllUsers();
    if (filter) {
      var lc = filter.toLowerCase();
      users = users.filter(function(u) {
        return (u.name || '').toLowerCase().indexOf(lc) !== -1 ||
               (u.email || '').toLowerCase().indexOf(lc) !== -1 ||
               (u.username || '').toLowerCase().indexOf(lc) !== -1;
      });
    }
    return users;
  }

  /* ─── manageCourses ─── */
  function manageCourses() {
    var courses = OWL.courses || [];
    var allUsers = _getAllUsers();
    return courses.map(function(c) {
      var enrolled = allUsers.filter(function(u) {
        return (u.enrolledCourses || []).indexOf(c.id) !== -1;
      }).length;
      var completedCount = 0;
      allUsers.forEach(function(u) {
        try {
          var prog = JSON.parse(localStorage.getItem('owl_user_progress_' + u.id) || '{}');
          if (prog[c.id] && (prog[c.id].completedLessons || []).length >= (prog[c.id].total || 10)) {
            completedCount++;
          }
        } catch(e) {}
      });
      return {
        id: c.id,
        title: c.title,
        icon: c.icon || '📚',
        enrolled: enrolled,
        completed: completedCount,
        pct: enrolled > 0 ? Math.round((completedCount / enrolled) * 100) : 0,
        enabled: c.enabled !== false
      };
    });
  }

  /* ─── manageBadges ─── */
  function manageBadges() {
    return OWL.badges || [];
  }

  /* ─── platformAnalytics (SVG chart) ─── */
  function platformAnalytics() {
    var users = _getAllUsers();
    // Group by signup date (last 7 days)
    var days = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      days.push({ label: d.toLocaleDateString('en-US',{weekday:'short'}), date: d.toDateString(), count: 0 });
    }
    users.forEach(function(u) {
      if (!u.createdAt) return;
      var ds = new Date(u.createdAt).toDateString();
      var day = days.find(function(d) { return d.date === ds; });
      if (day) day.count++;
    });

    var W = 560, H = 200;
    var maxCount = Math.max.apply(null, days.map(function(d) { return d.count; })) || 1;
    var barW = Math.floor((W - 60) / days.length) - 8;
    barW = Math.max(barW, 16);

    var bars = days.map(function(day, i) {
      var barH = Math.max(4, Math.round((day.count / maxCount) * (H - 55)));
      var x = 40 + i * (barW + 8);
      var y = H - 35 - barH;
      return `
        <rect x="${x}" y="${y}" width="${barW}" height="${barH}" fill="url(#adminBarGrad)" rx="4" opacity=".9">
          <title>${day.label}: ${day.count} signups</title>
        </rect>
        <text x="${x + barW/2}" y="${H - 16}" text-anchor="middle" font-size="10" fill="#6b7280" font-family="Inter,Arial,sans-serif">${day.label}</text>
        ${day.count > 0 ? `<text x="${x + barW/2}" y="${y - 4}" text-anchor="middle" font-size="9" fill="#6366f1" font-weight="700">${day.count}</text>` : ''}`;
    }).join('');

    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%">
      <defs>
        <linearGradient id="adminBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8b5cf6"/>
          <stop offset="100%" stop-color="#6366f1"/>
        </linearGradient>
      </defs>
      <line x1="38" y1="${H-35}" x2="${W-10}" y2="${H-35}" stroke="#e0e7ff" stroke-width="1"/>
      ${bars}
      <text x="${W/2}" y="10" text-anchor="middle" font-size="11" fill="#9ca3af" font-family="Inter,Arial,sans-serif">Daily Signups — Last 7 Days</text>
    </svg>`;
  }

  function _badgeDistChart() {
    var users = _getAllUsers();
    var badges = manageBadges();
    if (!badges.length) return '<div class="no-data-msg" style="color:#9ca3af;text-align:center;padding:20px">No badges defined.</div>';

    // Count badge distributions
    var counts = {};
    badges.forEach(function(b) { counts[b.id] = 0; });
    users.forEach(function(u) {
      try {
        var ub = JSON.parse(localStorage.getItem('owl_user_badges_' + u.id) || 'null') || u.badges || [];
        ub.forEach(function(bid) { if (counts[bid] !== undefined) counts[bid]++; });
      } catch(e) {}
    });

    var W = 560, H = 200;
    var maxCount = Math.max.apply(null, Object.values(counts)) || 1;
    var items = badges.slice(0, 8);
    var barW = Math.floor((W - 60) / items.length) - 6;
    barW = Math.max(barW, 16);

    var bars = items.map(function(badge, i) {
      var count = counts[badge.id] || 0;
      var barH = Math.max(2, Math.round((count / maxCount) * (H - 55)));
      var x = 40 + i * (barW + 6);
      var y = H - 35 - barH;
      return `
        <rect x="${x}" y="${y}" width="${barW}" height="${barH}" fill="url(#badgeBarGrad)" rx="3" opacity=".85">
          <title>${badge.name}: ${count} earners</title>
        </rect>
        <text x="${x + barW/2}" y="${H - 16}" text-anchor="middle" font-size="9" fill="#6b7280" font-family="Inter,Arial,sans-serif">${(badge.name||'').substr(0,5)}</text>
        ${count > 0 ? `<text x="${x + barW/2}" y="${y - 4}" text-anchor="middle" font-size="9" fill="#7c3aed" font-weight="700">${count}</text>` : ''}`;
    }).join('');

    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%">
      <defs>
        <linearGradient id="badgeBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#c084fc"/>
          <stop offset="100%" stop-color="#7c3aed"/>
        </linearGradient>
      </defs>
      <line x1="38" y1="${H-35}" x2="${W-10}" y2="${H-35}" stroke="#e0e7ff" stroke-width="1"/>
      ${bars}
      <text x="${W/2}" y="10" text-anchor="middle" font-size="11" fill="#9ca3af" font-family="Inter,Arial,sans-serif">Badge Distribution</text>
    </svg>`;
  }

  /* ─── actions ─── */
  function _promoteUser(userId) {
    var users = _getAllUsers();
    var u = users.find(function(x) { return x.id === userId; });
    if (!u) return;
    var roles = ['student','teacher','admin'];
    var idx = roles.indexOf(u.role || 'student');
    u.role = roles[Math.min(idx + 1, roles.length - 1)];
    _saveAllUsers(users);
    _toast('User promoted to ' + u.role);
    show();
  }

  function _demoteUser(userId) {
    var users = _getAllUsers();
    var u = users.find(function(x) { return x.id === userId; });
    if (!u) return;
    var roles = ['student','teacher','admin'];
    var idx = roles.indexOf(u.role || 'student');
    u.role = roles[Math.max(idx - 1, 0)];
    _saveAllUsers(users);
    _toast('User role updated to ' + u.role);
    show();
  }

  function _resetUserXP(userId) {
    if (!confirm('Reset this user\'s XP to 0?')) return;
    var users = _getAllUsers();
    var u = users.find(function(x) { return x.id === userId; });
    if (!u) return;
    u.xp = 0;
    _saveAllUsers(users);
    _toast('XP reset for user.');
    show();
  }

  function _toggleCourse(courseId) {
    var courses = OWL.courses || [];
    var c = courses.find(function(x) { return x.id === courseId; });
    if (!c) return;
    c.enabled = c.enabled === false ? true : false;
    _toast('Course ' + (c.enabled ? 'enabled' : 'disabled') + ': ' + c.title);
    show();
  }

  function _toast(msg) {
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#7c3aed;color:#fff;padding:13px 20px;border-radius:12px;font-weight:700;font-size:.9rem;z-index:99999;box-shadow:0 4px 18px rgba(124,58,237,.4);';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { t.remove(); }, 2800);
  }

  /* ─── show ─── */
  function show() {
    _injectStyles();

    if (!_isAdmin()) {
      _appContent().innerHTML = `
      <div class="admin-denied">
        <div style="font-size:4rem">🚫</div>
        <h2>Access Denied</h2>
        <p>You need Administrator role to access this panel.</p>
        <button onclick="OWL.app.navigate('dashboard')" style="background:#6366f1;color:#fff;border:none;border-radius:10px;padding:10px 24px;font-weight:700;cursor:pointer;margin-top:12px">Back to Dashboard</button>
      </div>`;
      return;
    }

    var stats = getStats();
    var users = _getAllUsers();
    var courses = manageCourses();
    var badges = manageBadges();

    /* Stats row */
    var statsHtml = `
    <div class="admin-stats-grid">
      <div class="admin-stat-card"><div class="admin-stat-icon">👥</div><div class="admin-stat-val">${stats.totalUsers}</div><div class="admin-stat-lbl">Total Users</div></div>
      <div class="admin-stat-card"><div class="admin-stat-icon">✅</div><div class="admin-stat-val">${stats.activeToday}</div><div class="admin-stat-lbl">Active Today</div></div>
      <div class="admin-stat-card"><div class="admin-stat-icon">⭐</div><div class="admin-stat-val">${(stats.totalXP).toLocaleString()}</div><div class="admin-stat-lbl">Total XP Awarded</div></div>
      <div class="admin-stat-card"><div class="admin-stat-icon">🏆</div><div class="admin-stat-val">${stats.totalCerts}</div><div class="admin-stat-lbl">Certificates Issued</div></div>
    </div>`;

    /* Users table */
    var usersTableHtml = `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr><th>Name / Username</th><th>Email</th><th>Role</th><th>Level</th><th>XP</th><th>Joined</th><th>Last Active</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${users.length > 0
            ? users.map(function(u) {
                var role = u.role || 'student';
                var initial = (u.name || u.username || 'U').charAt(0).toUpperCase();
                return `<tr>
                  <td style="display:flex;align-items:center;gap:8px">
                    <span style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:.78rem;flex-shrink:0">${initial}</span>
                    <span>${u.name || u.username || '—'}</span>
                  </td>
                  <td>${u.email || '—'}</td>
                  <td><span class="role-badge ${role}">${role}</span></td>
                  <td>Lv ${_levelFromXP(u.xp)}</td>
                  <td>${(u.xp||0).toLocaleString()}</td>
                  <td>${_formatDateShort(u.createdAt)}</td>
                  <td>${_formatDateShort(u.lastLogin)}</td>
                  <td>
                    <button class="admin-action-btn btn-promote" onclick="OWL.admin._promoteUser('${u.id}')">↑ Promote</button>
                    <button class="admin-action-btn btn-reset" onclick="OWL.admin._resetUserXP('${u.id}')">Reset XP</button>
                  </td>
                </tr>`;
              }).join('')
            : '<tr><td colspan="8" style="text-align:center;color:#9ca3af;padding:24px">No registered users yet.</td></tr>'
          }
        </tbody>
      </table>
    </div>`;

    /* Courses table */
    var coursesTableHtml = `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr><th>Icon</th><th>Course Title</th><th>Enrolled</th><th>Completion Rate</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${courses.length > 0
            ? courses.map(function(c) {
                var status = c.enabled !== false ? '🟢 Active' : '🔴 Disabled';
                return `<tr>
                  <td class="course-row-icon">${c.icon}</td>
                  <td style="font-weight:600">${c.title}</td>
                  <td>${c.enrolled}</td>
                  <td>
                    <div class="completion-bar-wrap"><div class="completion-bar" style="width:${c.pct}%"></div></div>
                    <span class="completion-pct">${c.pct}%</span>
                  </td>
                  <td>${status}</td>
                  <td>
                    <button class="btn-toggle-course ${c.enabled !== false ? 'btn-disable' : 'btn-enable'}"
                      onclick="OWL.admin._toggleCourse('${c.id}')">
                      ${c.enabled !== false ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>`;
              }).join('')
            : '<tr><td colspan="6" style="text-align:center;color:#9ca3af;padding:24px">No courses configured.</td></tr>'
          }
        </tbody>
      </table>
    </div>`;

    /* Badges table */
    var badgesTableHtml = `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Icon</th><th>Name</th><th>Description</th><th>Threshold</th></tr></thead>
        <tbody>
          ${badges.length > 0
            ? badges.map(function(b) {
                return `<tr>
                  <td style="font-size:1.4rem">${b.icon || '🏅'}</td>
                  <td style="font-weight:700">${b.name}</td>
                  <td style="color:#6b7280;font-size:.85rem">${b.description || '—'}</td>
                  <td style="font-size:.82rem;color:#7c3aed;font-weight:600">${b.condition || '—'}</td>
                </tr>`;
              }).join('')
            : '<tr><td colspan="4" style="text-align:center;color:#9ca3af;padding:24px">No badges defined.</td></tr>'
          }
        </tbody>
      </table>
    </div>`;

    /* Recent signups */
    var recentUsers = users.slice().sort(function(a,b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }).slice(0, 6);
    var signupsHtml = recentUsers.map(function(u) {
      var initial = (u.name || u.username || '?').charAt(0).toUpperCase();
      var role = u.role || 'student';
      return `
      <div class="signup-item">
        <div class="signup-avatar">${initial}</div>
        <div class="signup-name">${u.name || u.username || u.email || 'Unknown'}</div>
        <span class="role-badge ${role} signup-role">${role}</span>
        <div class="signup-date">${_formatDateShort(u.createdAt)}</div>
      </div>`;
    }).join('') || '<p style="color:#9ca3af;text-align:center;font-size:.88rem">No recent signups.</p>';

    /* Health indicators */
    var storageUsed = 0;
    try {
      var keys = Object.keys(localStorage);
      keys.forEach(function(k) { storageUsed += localStorage.getItem(k).length; });
    } catch(e) {}
    var storageKB = Math.round(storageUsed / 1024);
    var storageStatus = storageKB < 2048 ? 'hs-healthy' : storageKB < 4096 ? 'hs-warning' : 'hs-critical';
    var storageLabel = storageKB < 2048 ? 'Healthy' : storageKB < 4096 ? 'Warning' : 'Critical';

    var healthHtml = `
    <div class="health-grid">
      <div class="health-card">
        <div class="health-card-hdr"><span class="health-label">💾 Storage</span><span class="health-status ${storageStatus}">${storageLabel}</span></div>
        <div class="health-val">${storageKB} KB</div>
        <div class="health-sub">localStorage used</div>
      </div>
      <div class="health-card">
        <div class="health-card-hdr"><span class="health-label">👥 Users</span><span class="health-status hs-healthy">Online</span></div>
        <div class="health-val">${users.length}</div>
        <div class="health-sub">${stats.activeToday} active today</div>
      </div>
      <div class="health-card">
        <div class="health-card-hdr"><span class="health-label">📚 Courses</span><span class="health-status hs-healthy">Active</span></div>
        <div class="health-val">${courses.filter(function(c){return c.enabled!==false;}).length}/${courses.length}</div>
        <div class="health-sub">enabled courses</div>
      </div>
      <div class="health-card">
        <div class="health-card-hdr"><span class="health-label">🏆 Certs</span><span class="health-status hs-healthy">Healthy</span></div>
        <div class="health-val">${stats.totalCerts}</div>
        <div class="health-sub">issued certificates</div>
      </div>
    </div>`;

    _appContent().innerHTML = `
    <div class="admin-page">
      <div class="admin-hero">
        <h2>⚙️ Admin Dashboard</h2>
        <p>Platform overview, user management, course control, and analytics.</p>
        <span class="admin-badge">🔑 ADMINISTRATOR</span>
      </div>

      ${statsHtml}

      <div class="admin-panel">
        <div class="admin-panel-hdr">
          <h3>👥 User Management</h3>
          <span class="admin-count">${users.length} users</span>
        </div>
        ${usersTableHtml}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px">
        <div class="admin-panel" style="margin:0">
          <div class="admin-panel-hdr"><h3>📈 Signup Analytics</h3></div>
          ${platformAnalytics()}
        </div>
        <div class="admin-panel" style="margin:0">
          <div class="admin-panel-hdr"><h3>🏅 Badge Distribution</h3></div>
          <div class="badge-chart-wrap">${_badgeDistChart()}</div>
        </div>
      </div>

      <div class="admin-panel">
        <div class="admin-panel-hdr">
          <h3>📚 Course Management</h3>
          <span class="admin-count">${courses.length} courses</span>
        </div>
        ${coursesTableHtml}
      </div>

      <div class="admin-panel">
        <div class="admin-panel-hdr">
          <h3>🏅 Badge Management</h3>
          <span class="admin-count">${badges.length} badges</span>
        </div>
        ${badgesTableHtml}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px">
        <div class="admin-panel" style="margin:0">
          <div class="admin-panel-hdr"><h3>🆕 Recent Signups</h3></div>
          <div class="signup-list">${signupsHtml}</div>
        </div>
        <div class="admin-panel" style="margin:0">
          <div class="admin-panel-hdr"><h3>❤️ Platform Health</h3></div>
          ${healthHtml}
        </div>
      </div>
    </div>`;
  }

  /* ─── expose ─── */
  OWL.admin = {
    show: show,
    getStats: getStats,
    manageUsers: manageUsers,
    manageCourses: manageCourses,
    manageBadges: manageBadges,
    platformAnalytics: platformAnalytics,
    _promoteUser: _promoteUser,
    _demoteUser: _demoteUser,
    _resetUserXP: _resetUserXP,
    _toggleCourse: _toggleCourse
  };

}(window.OWL = window.OWL || {}));
