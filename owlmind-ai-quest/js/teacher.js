/* teacher.js — OwlMind AI Quest
   Exposes window.OWL.teacher
   Depends on: OWL.state, OWL.courses, OWL.app
   Requires teacher or admin role.
*/
(function (OWL) {
  'use strict';

  var CLASSROOMS_KEY = 'owl_classrooms';
  var ALL_USERS_KEY  = 'owl_all_users';

  /* ─── helpers ─── */
  function _appContent() { return document.getElementById('app-content'); }
  function _user() { return (OWL.state && OWL.state.user) || {}; }

  function _isTeacher() {
    var u = _user();
    return u.role === 'teacher' || u.role === 'admin';
  }

  function _getClassrooms() {
    try { return JSON.parse(localStorage.getItem(CLASSROOMS_KEY) || '[]'); }
    catch(e) { return []; }
  }

  function _saveClassrooms(cls) {
    try { localStorage.setItem(CLASSROOMS_KEY, JSON.stringify(cls)); }
    catch(e) {}
  }

  function _getAllUsers() {
    try { return JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '[]'); }
    catch(e) { return []; }
  }

  function _getUserProgress(userId) {
    try { return JSON.parse(localStorage.getItem('owl_user_progress_' + userId) || '{}'); }
    catch(e) { return {}; }
  }

  function _totalLessonsCompleted(progress) {
    return Object.values(progress).reduce(function(sum, cp) {
      return sum + ((cp.completedLessons || []).length);
    }, 0);
  }

  function _formatDate(str) {
    if (!str) return 'Never';
    var d = new Date(str);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function _levelFromXP(xp) { return Math.floor((xp || 0) / 200) + 1; }

  /* ─── inject styles ─── */
  function _injectStyles() {
    if (document.getElementById('owl-teacher-styles')) return;
    var style = document.createElement('style');
    style.id = 'owl-teacher-styles';
    style.textContent = `
/* ─── Teacher Dashboard ─── */
.teacher-page { max-width: 1100px; margin: 0 auto; padding: 32px 16px; }

/* Header */
.teacher-hero { background: linear-gradient(135deg,#0c4a6e,#075985,#0369a1);
  border-radius: 20px; padding: 36px 40px; color: #fff; margin-bottom: 32px;
  box-shadow: 0 8px 28px rgba(3,105,161,.3); }
.teacher-hero h2 { font-size: 2rem; font-weight: 900; margin: 0 0 6px; }
.teacher-hero p { color: #bae6fd; margin: 0; font-size: 1rem; }
.teacher-hero-actions { margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap; }
.btn-teacher-primary { background: linear-gradient(90deg,#f59e0b,#fbbf24); color: #1e1b4b;
  border: none; border-radius: 10px; padding: 10px 22px; font-weight: 800; cursor: pointer;
  font-size: .9rem; transition: opacity .2s; }
.btn-teacher-primary:hover { opacity: .88; }
.btn-teacher-sec { background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.25);
  border-radius: 10px; padding: 10px 22px; font-weight: 600; cursor: pointer; font-size: .9rem;
  transition: background .15s; }
.btn-teacher-sec:hover { background: rgba(255,255,255,.22); }

/* Classroom cards */
.teacher-section { background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06); border: 1px solid #e0e7ff; }
.teacher-section-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.teacher-section-hdr h3 { font-size: 1.1rem; font-weight: 700; color: #0c4a6e; margin: 0; }

.classrooms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 14px; }
.classroom-card { background: linear-gradient(135deg,#eff6ff,#dbeafe); border-radius: 14px;
  padding: 18px 20px; border: 1px solid #bfdbfe; }
.classroom-name { font-size: 1rem; font-weight: 800; color: #1e3a5f; margin-bottom: 6px; }
.classroom-meta { font-size: .8rem; color: #3b82f6; margin-bottom: 10px; }
.classroom-actions { display: flex; gap: 8px; }
.btn-cls-sm { font-size: .78rem; font-weight: 700; border-radius: 7px; padding: 5px 12px; cursor: pointer; border: none; transition: opacity .15s; }
.btn-cls-view { background: #3b82f6; color: #fff; }
.btn-cls-assign { background: #f59e0b; color: #1e1b4b; }
.btn-cls-view:hover, .btn-cls-assign:hover { opacity: .85; }

/* Student table */
.student-table-wrap { overflow-x: auto; }
.student-table { width: 100%; border-collapse: collapse; font-size: .88rem; }
.student-table th { background: #f0f9ff; color: #0369a1; font-weight: 700; text-align: left;
  padding: 10px 14px; border-bottom: 2px solid #bae6fd; white-space: nowrap; }
.student-table td { padding: 10px 14px; border-bottom: 1px solid #e0f2fe; vertical-align: middle; }
.student-table tr:last-child td { border-bottom: none; }
.student-table tr:hover td { background: #f0f9ff; }
.level-chip { background: #dbeafe; color: #1d4ed8; font-size: .72rem; font-weight: 700;
  padding: 2px 8px; border-radius: 99px; }
.streak-chip { color: #f59e0b; font-weight: 700; }
.role-chip { font-size: .72rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; }
.role-student { background: #dcfce7; color: #15803d; }
.role-teacher { background: #dbeafe; color: #1d4ed8; }
.role-admin { background: #fce7f3; color: #be185d; }
.action-btn-sm { background: none; border: 1px solid #e0e7ff; border-radius: 6px; padding: 4px 10px;
  font-size: .75rem; cursor: pointer; color: #374151; transition: background .15s; }
.action-btn-sm:hover { background: #f3f4f6; }

/* Analytics SVG */
.analytics-wrap { overflow-x: auto; }
.no-data-msg { color: #9ca3af; font-size: .9rem; text-align: center; padding: 20px; }

/* Stats summary row */
.teacher-stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
.t-stat-card { background: #fff; border-radius: 14px; padding: 18px; text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,.06); border: 1px solid #e0e7ff; }
.t-stat-icon { font-size: 1.6rem; margin-bottom: 6px; }
.t-stat-val { font-size: 1.4rem; font-weight: 800; color: #0c4a6e; }
.t-stat-lbl { font-size: .75rem; color: #6b7280; margin-top: 2px; }

/* Assign modal */
.assign-modal { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 10000;
  display: flex; align-items: center; justify-content: center; padding: 20px; }
.assign-modal-box { background: #fff; border-radius: 18px; padding: 28px; max-width: 480px; width: 100%; }
.assign-modal-title { font-size: 1.1rem; font-weight: 800; color: #1e1b4b; margin: 0 0 16px; }
.assign-form-select { width: 100%; border: 2px solid #e0e7ff; border-radius: 10px; padding: 10px 14px;
  font-size: .9rem; margin-bottom: 14px; outline: none; }
.assign-form-select:focus { border-color: #3b82f6; }
.assign-actions { display: flex; gap: 10px; }
.btn-assign-submit { flex: 1; background: #3b82f6; color: #fff; border: none; border-radius: 9px;
  padding: 10px; font-weight: 700; cursor: pointer; font-size: .9rem; }
.btn-assign-cancel { background: #f3f4f6; color: #374151; border: none; border-radius: 9px;
  padding: 10px 18px; font-weight: 600; cursor: pointer; font-size: .9rem; }

/* Add student modal */
.add-student-modal { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 10000;
  display: flex; align-items: center; justify-content: center; padding: 20px; }
.add-student-box { background: #fff; border-radius: 18px; padding: 28px; max-width: 420px; width: 100%; }

/* Access denied */
.access-denied { text-align: center; padding: 80px 20px; }
.access-denied h2 { font-size: 1.6rem; font-weight: 800; color: #ef4444; }
.access-denied p { color: #6b7280; }

@media(max-width:700px){
  .teacher-stats-row { grid-template-columns: repeat(2,1fr); }
}
    `;
    document.head.appendChild(style);
  }

  /* ─── createClassroom ─── */
  function createClassroom(name) {
    if (!name || !name.trim()) return null;
    var u = _user();
    var cls = {
      id: 'cls_' + Date.now(),
      name: name.trim(),
      teacherId: u.id || 'teacher',
      students: [],
      assignments: [],
      createdAt: new Date().toISOString()
    };
    var classrooms = _getClassrooms();
    classrooms.push(cls);
    _saveClassrooms(classrooms);
    return cls;
  }

  /* ─── addStudent ─── */
  function addStudent(email, classroomId) {
    var classrooms = _getClassrooms();
    var cls = classrooms.find(function(c) { return c.id === classroomId; });
    if (!cls) return false;
    if (cls.students.indexOf(email) === -1) {
      cls.students.push(email);
      _saveClassrooms(classrooms);
    }
    return true;
  }

  /* ─── getClassroomStats ─── */
  function getClassroomStats() {
    var classrooms = _getClassrooms();
    var u = _user();
    var myCls = classrooms.filter(function(c) { return c.teacherId === u.id; });
    var allUsers = _getAllUsers();
    var stats = [];

    myCls.forEach(function(cls) {
      var studentData = cls.students.map(function(email) {
        var student = allUsers.find(function(usr) { return usr.email === email || usr.id === email; });
        if (!student) return null;
        var prog = _getUserProgress(student.id);
        return {
          name: student.name || student.username || email,
          email: email,
          level: _levelFromXP(student.xp || 0),
          xp: student.xp || 0,
          lessons: _totalLessonsCompleted(prog),
          streak: student.streak || 0,
          lastActive: student.lastLogin || null
        };
      }).filter(Boolean);

      stats.push({ classroom: cls, students: studentData });
    });

    return stats;
  }

  /* ─── renderAnalytics (pure SVG) ─── */
  function renderAnalytics(students) {
    if (!students || students.length === 0) {
      return '<div class="no-data-msg">No student data to display yet.</div>';
    }

    var W = 560, H = 200;
    var maxXP = Math.max.apply(null, students.map(function(s) { return s.xp || 0; })) || 1;
    var barW = Math.floor((W - 60) / students.length) - 6;
    barW = Math.max(barW, 8);

    var bars = students.map(function(s, i) {
      var barH = Math.round(((s.xp || 0) / maxXP) * (H - 50));
      var x = 40 + i * (barW + 6);
      var y = H - 30 - barH;
      var label = (s.name || '?').substring(0, 4);
      return `
        <rect x="${x}" y="${y}" width="${barW}" height="${barH}"
          fill="url(#teacherBarGrad)" rx="3" opacity=".9">
          <title>${s.name}: ${(s.xp||0).toLocaleString()} XP</title>
        </rect>
        <text x="${x + barW/2}" y="${H - 14}" text-anchor="middle"
          font-size="9" fill="#6b7280" font-family="Inter,Arial,sans-serif">${label}</text>`;
    }).join('');

    // Y-axis labels
    var yLabels = [0, Math.round(maxXP / 2), maxXP].map(function(v, i) {
      var y = H - 30 - Math.round((v / maxXP) * (H - 50));
      return `<text x="34" y="${y + 4}" text-anchor="end" font-size="9" fill="#9ca3af" font-family="Arial">${v}</text>
              <line x1="38" y1="${y}" x2="${W}" y2="${y}" stroke="#f3f4f6" stroke-width="1"/>`;
    }).join('');

    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;overflow:visible">
      <defs>
        <linearGradient id="teacherBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#1d4ed8"/>
        </linearGradient>
      </defs>
      ${yLabels}
      <line x1="38" y1="${H-30}" x2="${W}" y2="${H-30}" stroke="#e0e7ff" stroke-width="1"/>
      ${bars}
      <text x="${W/2}" y="${H-1}" text-anchor="middle" font-size="10" fill="#9ca3af" font-family="Inter,Arial,sans-serif">Student XP Distribution</text>
    </svg>`;
  }

  /* ─── show ─── */
  function show() {
    _injectStyles();

    if (!_isTeacher()) {
      _appContent().innerHTML = `
      <div class="access-denied">
        <div style="font-size:4rem">🚫</div>
        <h2>Access Denied</h2>
        <p>You need Teacher or Admin role to view this page.</p>
        <button onclick="OWL.app.navigate('dashboard')" style="background:#6366f1;color:#fff;border:none;border-radius:10px;padding:10px 24px;font-weight:700;cursor:pointer;margin-top:12px">Back to Dashboard</button>
      </div>`;
      return;
    }

    var u = _user();
    var classrooms = _getClassrooms().filter(function(c) { return c.teacherId === u.id; });
    var allUsers = _getAllUsers();
    var clsStats = getClassroomStats();

    /* Teacher stats */
    var totalStudents = classrooms.reduce(function(sum, c) { return sum + c.students.length; }, 0);
    var totalClassrooms = classrooms.length;
    var avgXP = 0;
    var allStudents = [];
    clsStats.forEach(function(cs) { allStudents = allStudents.concat(cs.students); });
    if (allStudents.length) {
      avgXP = Math.round(allStudents.reduce(function(s, st) { return s + (st.xp || 0); }, 0) / allStudents.length);
    }

    /* Classroom cards */
    var classroomCardsHtml = classrooms.length > 0
      ? classrooms.map(function(cls) {
          return `
          <div class="classroom-card">
            <div class="classroom-name">📚 ${cls.name}</div>
            <div class="classroom-meta">${cls.students.length} students · Created ${_formatDate(cls.createdAt)}</div>
            <div class="classroom-actions">
              <button class="btn-cls-sm btn-cls-view" onclick="OWL.teacher._viewClassroom('${cls.id}')">View Students</button>
              <button class="btn-cls-sm btn-cls-assign" onclick="OWL.teacher._showAssignModal('${cls.id}')">Assign Course</button>
            </div>
          </div>`;
        }).join('')
      : '<p style="color:#9ca3af;font-size:.9rem">No classrooms yet. Create one to get started!</p>';

    /* Student progress table — all students across all classrooms */
    var tableRowsHtml = allStudents.length > 0
      ? allStudents.map(function(s) {
          return `<tr>
            <td>${s.name}</td>
            <td><span class="level-chip">Lv ${s.level}</span></td>
            <td>${(s.xp || 0).toLocaleString()}</td>
            <td>${s.lessons}</td>
            <td><span class="streak-chip">🔥 ${s.streak}</span></td>
            <td>${_formatDate(s.lastActive)}</td>
            <td><button class="action-btn-sm" onclick="OWL.teacher._msgStudent('${s.name}')">💬 Message</button></td>
          </tr>`;
        }).join('')
      : '<tr><td colspan="7" style="text-align:center;color:#9ca3af;padding:20px">Add students to your classrooms to see progress here.</td></tr>';

    /* Analytics */
    var analyticsHtml = renderAnalytics(allStudents);

    _appContent().innerHTML = `
    <div class="teacher-page">
      <div class="teacher-hero">
        <h2>🎓 Teacher Dashboard</h2>
        <p>Welcome, ${u.name || u.username || 'Teacher'}! Manage your classrooms, track student progress, and assign courses.</p>
        <div class="teacher-hero-actions">
          <button class="btn-teacher-primary" onclick="OWL.teacher._showCreateClassroomModal()">+ Create Classroom</button>
          <button class="btn-teacher-sec" onclick="OWL.teacher._showAddStudentModal()">+ Add Student</button>
        </div>
      </div>

      <div class="teacher-stats-row">
        <div class="t-stat-card"><div class="t-stat-icon">🏫</div><div class="t-stat-val">${totalClassrooms}</div><div class="t-stat-lbl">Classrooms</div></div>
        <div class="t-stat-card"><div class="t-stat-icon">👩‍🎓</div><div class="t-stat-val">${totalStudents}</div><div class="t-stat-lbl">Total Students</div></div>
        <div class="t-stat-card"><div class="t-stat-icon">⭐</div><div class="t-stat-val">${avgXP.toLocaleString()}</div><div class="t-stat-lbl">Avg Student XP</div></div>
        <div class="t-stat-card"><div class="t-stat-icon">📋</div><div class="t-stat-val">${classrooms.reduce(function(s,c){return s+c.assignments.length;},0)}</div><div class="t-stat-lbl">Assignments</div></div>
      </div>

      <div class="teacher-section">
        <div class="teacher-section-hdr">
          <h3>🏫 My Classrooms</h3>
          <button class="btn-teacher-primary" onclick="OWL.teacher._showCreateClassroomModal()">+ New Classroom</button>
        </div>
        <div class="classrooms-grid">${classroomCardsHtml}</div>
      </div>

      <div class="teacher-section">
        <div class="teacher-section-hdr">
          <h3>📊 Student Progress</h3>
        </div>
        <div class="student-table-wrap">
          <table class="student-table">
            <thead>
              <tr>
                <th>Name</th><th>Level</th><th>XP</th><th>Lessons</th><th>Streak</th><th>Last Active</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>${tableRowsHtml}</tbody>
          </table>
        </div>
      </div>

      <div class="teacher-section">
        <div class="teacher-section-hdr">
          <h3>📈 XP Analytics</h3>
        </div>
        <div class="analytics-wrap">${analyticsHtml}</div>
      </div>
    </div>`;
  }

  /* ─── modals ─── */
  function _showCreateClassroomModal() {
    var m = document.createElement('div');
    m.className = 'assign-modal';
    m.id = 'teacher-modal';
    m.onclick = function(e) { if (e.target === m) m.remove(); };
    m.innerHTML = `
    <div class="assign-modal-box">
      <div class="assign-modal-title">🏫 Create New Classroom</div>
      <input id="cls-name-input" class="assign-form-select" type="text" placeholder="Classroom name (e.g. AI Fundamentals Fall 2026)" style="display:block;"/>
      <div class="assign-actions">
        <button class="btn-assign-cancel" onclick="document.getElementById('teacher-modal').remove()">Cancel</button>
        <button class="btn-assign-submit" onclick="OWL.teacher._doCreateClassroom()">Create</button>
      </div>
    </div>`;
    document.body.appendChild(m);
    setTimeout(function() { var el = document.getElementById('cls-name-input'); if(el) el.focus(); }, 50);
  }

  function _doCreateClassroom() {
    var inp = document.getElementById('cls-name-input');
    if (!inp || !inp.value.trim()) { alert('Please enter a classroom name.'); return; }
    createClassroom(inp.value.trim());
    var m = document.getElementById('teacher-modal');
    if (m) m.remove();
    show();
    _toast('Classroom created! 🏫');
  }

  function _showAddStudentModal(classroomId) {
    var classrooms = _getClassrooms().filter(function(c) { return c.teacherId === (_user().id); });
    var options = classrooms.map(function(c) {
      var sel = (c.id === classroomId) ? 'selected' : '';
      return `<option value="${c.id}" ${sel}>${c.name}</option>`;
    }).join('');
    if (!options) { alert('Create a classroom first!'); return; }

    var m = document.createElement('div');
    m.className = 'add-student-modal';
    m.id = 'teacher-modal';
    m.onclick = function(e) { if (e.target === m) m.remove(); };
    m.innerHTML = `
    <div class="add-student-box">
      <div class="assign-modal-title">👩‍🎓 Add Student</div>
      <label style="font-size:.83rem;font-weight:600;color:#374151;display:block;margin-bottom:5px">Student Email</label>
      <input id="student-email-inp" class="assign-form-select" type="email" placeholder="student@example.com" style="display:block;margin-bottom:10px"/>
      <label style="font-size:.83rem;font-weight:600;color:#374151;display:block;margin-bottom:5px">Classroom</label>
      <select id="student-cls-select" class="assign-form-select">${options}</select>
      <div class="assign-actions">
        <button class="btn-assign-cancel" onclick="document.getElementById('teacher-modal').remove()">Cancel</button>
        <button class="btn-assign-submit" onclick="OWL.teacher._doAddStudent()">Add Student</button>
      </div>
    </div>`;
    document.body.appendChild(m);
  }

  function _doAddStudent() {
    var email = (document.getElementById('student-email-inp') || {}).value || '';
    var clsId = (document.getElementById('student-cls-select') || {}).value || '';
    if (!email.trim()) { alert('Please enter a student email.'); return; }
    addStudent(email.trim(), clsId);
    var m = document.getElementById('teacher-modal');
    if (m) m.remove();
    show();
    _toast('Student added! 👩‍🎓');
  }

  function _showAssignModal(classroomId) {
    var courses = OWL.courses || [];
    var options = courses.map(function(c) {
      return `<option value="${c.id}">${c.title}</option>`;
    }).join('');

    var m = document.createElement('div');
    m.className = 'assign-modal';
    m.id = 'teacher-modal';
    m.onclick = function(e) { if (e.target === m) m.remove(); };
    m.innerHTML = `
    <div class="assign-modal-box">
      <div class="assign-modal-title">📋 Assign Course to Classroom</div>
      <select id="assign-course-select" class="assign-form-select">${options}</select>
      <div class="assign-actions">
        <button class="btn-assign-cancel" onclick="document.getElementById('teacher-modal').remove()">Cancel</button>
        <button class="btn-assign-submit" onclick="OWL.teacher._doAssign('${classroomId}')">Assign</button>
      </div>
    </div>`;
    document.body.appendChild(m);
  }

  function _doAssign(classroomId) {
    var courseId = (document.getElementById('assign-course-select') || {}).value || '';
    var classrooms = _getClassrooms();
    var cls = classrooms.find(function(c) { return c.id === classroomId; });
    if (cls && courseId) {
      if (!cls.assignments) cls.assignments = [];
      if (cls.assignments.indexOf(courseId) === -1) cls.assignments.push(courseId);
      _saveClassrooms(classrooms);
    }
    var m = document.getElementById('teacher-modal');
    if (m) m.remove();
    _toast('Course assigned! 📋');
  }

  function _viewClassroom(classroomId) {
    var classrooms = _getClassrooms();
    var cls = classrooms.find(function(c) { return c.id === classroomId; });
    if (!cls) return;
    var allUsers = _getAllUsers();
    var rows = cls.students.map(function(email) {
      var student = allUsers.find(function(u) { return u.email === email || u.id === email; });
      var name = student ? (student.name || student.username || email) : email;
      var xp = student ? (student.xp || 0) : 0;
      var level = _levelFromXP(xp);
      return `<tr><td>${name}</td><td>${email}</td><td><span class="level-chip">Lv ${level}</span></td><td>${xp.toLocaleString()}</td></tr>`;
    }).join('') || '<tr><td colspan="4" style="text-align:center;color:#9ca3af;padding:16px">No students yet</td></tr>';

    var m = document.createElement('div');
    m.className = 'assign-modal';
    m.id = 'teacher-modal';
    m.onclick = function(e) { if (e.target === m) m.remove(); };
    m.innerHTML = `
    <div class="assign-modal-box" style="max-width:600px">
      <div class="assign-modal-title">📚 ${cls.name} — Students (${cls.students.length})</div>
      <div style="overflow-x:auto;margin-bottom:14px">
        <table class="student-table">
          <thead><tr><th>Name</th><th>Email</th><th>Level</th><th>XP</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="assign-actions">
        <button class="btn-assign-submit" onclick="document.getElementById('teacher-modal').remove()">Close</button>
      </div>
    </div>`;
    document.body.appendChild(m);
  }

  function _msgStudent(name) {
    var m = document.createElement('div');
    m.className = 'assign-modal';
    m.id = 'teacher-modal';
    m.onclick = function(e) { if (e.target === m) m.remove(); };
    m.innerHTML = `
    <div class="assign-modal-box">
      <div class="assign-modal-title">💬 Message to ${name}</div>
      <textarea id="msg-text" class="assign-form-select" rows="4" style="resize:vertical;min-height:80px" placeholder="Type your message…"></textarea>
      <div class="assign-actions">
        <button class="btn-assign-cancel" onclick="document.getElementById('teacher-modal').remove()">Cancel</button>
        <button class="btn-assign-submit" onclick="OWL.teacher._doSendMsg('${name}')">Send Message</button>
      </div>
    </div>`;
    document.body.appendChild(m);
  }

  function _doSendMsg(name) {
    var text = (document.getElementById('msg-text') || {}).value || '';
    if (!text.trim()) { alert('Please enter a message.'); return; }
    // In a real app, this would send via backend; here we just log
    try {
      var msgs = JSON.parse(localStorage.getItem('owl_teacher_messages') || '[]');
      msgs.push({ to: name, from: (_user().name || 'Teacher'), text: text.trim(), date: new Date().toISOString() });
      localStorage.setItem('owl_teacher_messages', JSON.stringify(msgs));
    } catch(e) {}
    var m = document.getElementById('teacher-modal');
    if (m) m.remove();
    _toast('Message sent to ' + name + '! 💬');
  }

  function _toast(msg) {
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#0369a1;color:#fff;padding:13px 20px;border-radius:12px;font-weight:700;font-size:.9rem;z-index:99999;box-shadow:0 4px 18px rgba(3,105,161,.4);';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { t.remove(); }, 2800);
  }

  /* ─── expose ─── */
  OWL.teacher = {
    show: show,
    createClassroom: createClassroom,
    addStudent: addStudent,
    getClassroomStats: getClassroomStats,
    renderAnalytics: renderAnalytics,
    _showCreateClassroomModal: _showCreateClassroomModal,
    _doCreateClassroom: _doCreateClassroom,
    _showAddStudentModal: _showAddStudentModal,
    _doAddStudent: _doAddStudent,
    _showAssignModal: _showAssignModal,
    _doAssign: _doAssign,
    _viewClassroom: _viewClassroom,
    _msgStudent: _msgStudent,
    _doSendMsg: _doSendMsg
  };

}(window.OWL = window.OWL || {}));
