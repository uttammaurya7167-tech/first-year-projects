/* dashboard.js — OwlMind AI Quest
   Exposes window.OWL.dashboard
   Depends on: OWL.state, OWL.gamification, OWL.courses, OWL.badges, OWL.ui, OWL.app
*/
(function (OWL) {
  'use strict';

  /* ─── helpers ─────────────────────────────────────────────── */
  function _el(sel) { return document.getElementById(sel); }
  function _appContent() { return document.getElementById('app-content'); }

  function _xpForLevel(level) { return level * 200; }
  function _levelFromXP(xp) { return Math.floor(xp / 200) + 1; }
  function _xpProgress(xp) {
    const lvl = _levelFromXP(xp);
    const base = (lvl - 1) * 200;
    const needed = 200;
    return Math.min(100, Math.round(((xp - base) / needed) * 100));
  }

  function _avatarSVG(name, size) {
    size = size || 64;
    const colors = ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#10b981'];
    const letter = (name || 'U').charAt(0).toUpperCase();
    const color = colors[letter.charCodeAt(0) % colors.length];
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}"/>
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        font-size="${size*0.42}" font-family="Inter,sans-serif" font-weight="700" fill="#fff">${letter}</text>
    </svg>`;
  }

  function _rankLabel(rank) {
    if (rank === 1) return '🥇 1st';
    if (rank === 2) return '🥈 2nd';
    if (rank === 3) return '🥉 3rd';
    return `#${rank}`;
  }

  /* ─── course progress helpers ─────────────────────────────── */
  function _getUserProgress(user) {
    try {
      const raw = localStorage.getItem('owl_user_progress_' + user.id);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function _getCourseProgress(progress, courseId) {
    const cp = progress[courseId];
    if (!cp) return { completed: 0, total: 0, lastLesson: null, percent: 0 };
    const total = cp.total || 1;
    const completed = (cp.completedLessons || []).length;
    return {
      completed,
      total,
      lastLesson: cp.lastLesson || null,
      percent: Math.round((completed / total) * 100)
    };
  }

  function _getEarnedBadges(user) {
    try {
      const raw = localStorage.getItem('owl_user_badges_' + user.id);
      return raw ? JSON.parse(raw) : (user.badges || []);
    } catch (e) { return user.badges || []; }
  }

  function _getRecentAchievements(user) {
    try {
      const raw = localStorage.getItem('owl_achievements_' + user.id);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  /* ─── section renderers ────────────────────────────────────── */

  function _renderWelcomeBanner(user) {
    const xp = user.xp || 0;
    const level = _levelFromXP(xp);
    const progress = _xpProgress(xp);
    const xpInLevel = xp - (level - 1) * 200;
    return `
    <div class="dash-banner">
      <div class="dash-avatar">${_avatarSVG(user.name || user.username, 72)}</div>
      <div class="dash-banner-info">
        <h2 class="dash-welcome">Welcome back, <span>${user.name || user.username || 'Learner'}</span>! 🦉</h2>
        <div class="dash-level-row">
          <span class="dash-level-badge">Level ${level}</span>
          <div class="dash-xp-bar-wrap">
            <div class="dash-xp-bar" style="width:${progress}%"></div>
          </div>
          <span class="dash-xp-label">${xpInLevel}/200 XP</span>
        </div>
        <p class="dash-tagline">Keep going — you're making great progress! 🚀</p>
      </div>
    </div>`;
  }

  function _renderStatsRow(user, leaderboard) {
    const xp = user.xp || 0;
    const streak = user.streak || 0;
    const badges = _getEarnedBadges(user).length;
    let rank = leaderboard.findIndex(u => u.id === user.id) + 1;
    if (rank === 0) rank = leaderboard.length + 1;
    return `
    <div class="dash-stats-row">
      <div class="stat-card stat-xp">
        <div class="stat-icon">⭐</div>
        <div class="stat-value">${xp.toLocaleString()}</div>
        <div class="stat-label">Total XP</div>
      </div>
      <div class="stat-card stat-streak">
        <div class="stat-icon">🔥</div>
        <div class="stat-value">${streak}</div>
        <div class="stat-label">Day Streak</div>
      </div>
      <div class="stat-card stat-badges">
        <div class="stat-icon">🏅</div>
        <div class="stat-value">${badges}</div>
        <div class="stat-label">Badges</div>
      </div>
      <div class="stat-card stat-rank">
        <div class="stat-icon">🏆</div>
        <div class="stat-value">${_rankLabel(rank)}</div>
        <div class="stat-label">Leaderboard</div>
      </div>
    </div>`;
  }

  function _renderActiveCourses(user, courses, progress) {
    const enrolled = (user.enrolledCourses || []);
    if (!enrolled.length) return '';
    const items = enrolled.map(cid => {
      const course = courses.find(c => c.id === cid);
      if (!course) return '';
      const cp = _getCourseProgress(progress, cid);
      const pct = cp.percent;
      return `
      <div class="course-card" onclick="OWL.app.navigate('course/${cid}')">
        <div class="course-card-icon">${course.icon || '📚'}</div>
        <div class="course-card-body">
          <div class="course-card-title">${course.title}</div>
          <div class="course-card-meta">${cp.completed}/${cp.total || course.lessons?.length || '?'} lessons</div>
          <div class="course-progress-bar-wrap">
            <div class="course-progress-bar" style="width:${pct}%"></div>
          </div>
          <div class="course-pct">${pct}% complete</div>
        </div>
        <button class="btn-continue">Continue →</button>
      </div>`;
    }).join('');
    return `
    <div class="dash-section">
      <h3 class="section-title">📖 Active Courses</h3>
      <div class="course-cards-grid">${items || '<p class="empty-msg">No courses yet.</p>'}</div>
    </div>`;
  }

  function _renderBadgesGrid(user, allBadges) {
    const earned = _getEarnedBadges(user);
    if (!earned.length) return '';
    const items = earned.map(bid => {
      const badge = allBadges.find(b => b.id === bid) || { name: bid, icon: '🏅', description: '' };
      return `
      <div class="badge-card" title="${badge.description || badge.name}">
        <span class="badge-icon">${badge.icon || '🏅'}</span>
        <span class="badge-name">${badge.name}</span>
      </div>`;
    }).join('');
    return `
    <div class="dash-section">
      <h3 class="section-title">🏅 Earned Badges</h3>
      <div class="badges-grid">${items}</div>
    </div>`;
  }

  function _renderRecentAchievements(user) {
    const achievements = _getRecentAchievements(user).slice(0, 5);
    if (!achievements.length) return '';
    const items = achievements.map(a => `
      <div class="achievement-item">
        <span class="ach-icon">${a.icon || '✨'}</span>
        <div class="ach-body">
          <div class="ach-title">${a.title}</div>
          <div class="ach-time">${a.time || ''}</div>
        </div>
        <span class="ach-xp">+${a.xp || 0} XP</span>
      </div>`).join('');
    return `
    <div class="dash-section">
      <h3 class="section-title">✨ Recent Achievements</h3>
      <div class="achievements-list">${items}</div>
    </div>`;
  }

  function _renderLeaderboard(leaderboard, currentUserId) {
    const top5 = leaderboard.slice(0, 5);
    const rows = top5.map((u, i) => {
      const isSelf = u.id === currentUserId;
      return `
      <div class="lb-row${isSelf ? ' lb-self' : ''}">
        <span class="lb-rank">${_rankLabel(i + 1)}</span>
        <span class="lb-avatar">${_avatarSVG(u.name || u.username, 28)}</span>
        <span class="lb-name">${u.name || u.username}${isSelf ? ' (You)' : ''}</span>
        <span class="lb-xp">${(u.xp || 0).toLocaleString()} XP</span>
      </div>`;
    }).join('');
    return `
    <div class="dash-section dash-lb">
      <h3 class="section-title">🏆 Leaderboard</h3>
      <div class="lb-list">${rows}</div>
      <button class="btn-link" onclick="OWL.app.navigate('leaderboard')">View Full Leaderboard →</button>
    </div>`;
  }

  function _renderOnboardingCTA() {
    return `
    <div class="onboarding-cta">
      <div class="onboarding-owl">🦉</div>
      <h3>Start Your AI Learning Journey!</h3>
      <p>You haven't started any lessons yet. Pick a course and begin earning XP!</p>
      <button class="btn-primary btn-lg" onclick="OWL.app.navigate('courses')">Browse Courses</button>
    </div>`;
  }

  function _renderQuickActions() {
    return `
    <div class="dash-section">
      <h3 class="section-title">⚡ Quick Actions</h3>
      <div class="quick-actions">
        <button class="qa-btn qa-learn" onclick="OWL.app.navigate('courses')">
          <span>📖</span><span>Continue Learning</span>
        </button>
        <button class="qa-btn qa-quiz" onclick="OWL.app.navigate('quiz')">
          <span>🧠</span><span>Take a Quiz</span>
        </button>
        <button class="qa-btn qa-mentor" onclick="OWL.app.navigate('mentor')">
          <span>🤖</span><span>Chat with Mentor</span>
        </button>
        <button class="qa-btn qa-projects" onclick="OWL.app.navigate('projects')">
          <span>🛠️</span><span>My Projects</span>
        </button>
      </div>
    </div>`;
  }

  /* ─── styles ───────────────────────────────────────────────── */
  function _injectStyles() {
    if (document.getElementById('owl-dash-styles')) return;
    const style = document.createElement('style');
    style.id = 'owl-dash-styles';
    style.textContent = `
/* ── Dashboard Layout ── */
.dash-page { max-width: 1100px; margin: 0 auto; padding: 24px 16px; display: flex; flex-direction: column; gap: 28px; }

/* Banner */
.dash-banner { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
  border-radius: 20px; padding: 32px 36px; display: flex; align-items: center; gap: 24px;
  box-shadow: 0 8px 32px rgba(99,102,241,.3); color: #fff; }
.dash-avatar { flex-shrink: 0; }
.dash-avatar svg { border-radius: 50%; box-shadow: 0 0 0 4px rgba(255,255,255,.2); display: block; }
.dash-banner-info { flex: 1; min-width: 0; }
.dash-welcome { font-size: 1.6rem; font-weight: 700; margin: 0 0 10px; color: #fff; }
.dash-welcome span { color: #a5b4fc; }
.dash-level-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.dash-level-badge { background: linear-gradient(90deg,#f59e0b,#fbbf24); color: #1e1b4b;
  font-weight: 800; font-size: .85rem; padding: 3px 12px; border-radius: 99px; flex-shrink: 0; }
.dash-xp-bar-wrap { flex: 1; height: 10px; background: rgba(255,255,255,.15); border-radius: 99px; overflow: hidden; max-width: 320px; }
.dash-xp-bar { height: 100%; background: linear-gradient(90deg,#a78bfa,#818cf8); border-radius: 99px;
  transition: width .6s cubic-bezier(.4,0,.2,1); }
.dash-xp-label { font-size: .82rem; color: #c7d2fe; flex-shrink: 0; }
.dash-tagline { margin: 0; font-size: .9rem; color: #c7d2fe; }

/* Stats Row */
.dash-stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
.stat-card { background: #fff; border-radius: 16px; padding: 20px 16px; text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,.06); border: 1px solid #e0e7ff; }
.stat-icon { font-size: 1.8rem; margin-bottom: 6px; }
.stat-value { font-size: 1.5rem; font-weight: 800; color: #1e1b4b; }
.stat-label { font-size: .78rem; color: #6b7280; margin-top: 2px; font-weight: 500; }
.stat-xp { border-top: 4px solid #6366f1; }
.stat-streak { border-top: 4px solid #f59e0b; }
.stat-badges { border-top: 4px solid #10b981; }
.stat-rank { border-top: 4px solid #ec4899; }

/* Section */
.dash-section { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,.06); border: 1px solid #e0e7ff; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #1e1b4b; margin: 0 0 18px; }

/* Course Cards */
.course-cards-grid { display: flex; flex-direction: column; gap: 12px; }
.course-card { display: flex; align-items: center; gap: 16px; background: #f8f7ff; border-radius: 12px;
  padding: 14px 18px; cursor: pointer; border: 1px solid #e0e7ff; transition: transform .15s, box-shadow .15s; }
.course-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(99,102,241,.12); }
.course-card-icon { font-size: 2rem; flex-shrink: 0; }
.course-card-body { flex: 1; min-width: 0; }
.course-card-title { font-weight: 700; color: #1e1b4b; font-size: .95rem; margin-bottom: 2px; }
.course-card-meta { font-size: .8rem; color: #6b7280; margin-bottom: 6px; }
.course-progress-bar-wrap { height: 6px; background: #e0e7ff; border-radius: 99px; overflow: hidden; }
.course-progress-bar { height: 100%; background: linear-gradient(90deg,#6366f1,#8b5cf6); border-radius: 99px; transition: width .6s; }
.course-pct { font-size: .75rem; color: #6b7280; margin-top: 3px; }
.btn-continue { background: #6366f1; color: #fff; border: none; border-radius: 8px; padding: 7px 16px;
  font-weight: 600; cursor: pointer; font-size: .82rem; flex-shrink: 0; transition: background .2s; }
.btn-continue:hover { background: #4f46e5; }

/* Badges */
.badges-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.badge-card { display: flex; flex-direction: column; align-items: center; gap: 4px; background: #faf5ff;
  border: 1px solid #e9d5ff; border-radius: 12px; padding: 12px 16px; min-width: 80px; text-align: center;
  transition: transform .15s; cursor: default; }
.badge-card:hover { transform: scale(1.05); }
.badge-icon { font-size: 1.8rem; }
.badge-name { font-size: .72rem; font-weight: 600; color: #6b21a8; }

/* Achievements */
.achievements-list { display: flex; flex-direction: column; gap: 10px; }
.achievement-item { display: flex; align-items: center; gap: 12px; background: #f8f7ff;
  border-radius: 10px; padding: 10px 14px; border: 1px solid #e0e7ff; }
.ach-icon { font-size: 1.4rem; }
.ach-body { flex: 1; min-width: 0; }
.ach-title { font-weight: 600; font-size: .88rem; color: #1e1b4b; }
.ach-time { font-size: .75rem; color: #9ca3af; }
.ach-xp { font-weight: 700; color: #7c3aed; font-size: .88rem; white-space: nowrap; }

/* Leaderboard */
.dash-lb { }
.lb-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.lb-row { display: flex; align-items: center; gap: 10px; background: #f8f7ff;
  border-radius: 10px; padding: 8px 12px; border: 1px solid #e0e7ff; }
.lb-self { background: #ede9fe; border-color: #7c3aed; }
.lb-rank { font-weight: 700; font-size: .85rem; color: #6366f1; min-width: 46px; }
.lb-avatar svg { border-radius: 50%; display: block; }
.lb-name { flex: 1; font-weight: 600; font-size: .88rem; color: #1e1b4b; }
.lb-xp { font-size: .82rem; font-weight: 700; color: #7c3aed; }
.btn-link { background: none; border: none; color: #6366f1; font-weight: 600; cursor: pointer; font-size: .88rem; padding: 0; }
.btn-link:hover { text-decoration: underline; }

/* Quick Actions */
.quick-actions { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
.qa-btn { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 18px 10px;
  border-radius: 14px; border: 2px solid; cursor: pointer; font-weight: 700; font-size: .88rem;
  transition: transform .15s, box-shadow .15s; background: #fff; }
.qa-btn:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,0,0,.1); }
.qa-btn span:first-child { font-size: 1.6rem; }
.qa-learn { border-color: #6366f1; color: #6366f1; }
.qa-quiz { border-color: #10b981; color: #10b981; }
.qa-mentor { border-color: #f59e0b; color: #f59e0b; }
.qa-projects { border-color: #ec4899; color: #ec4899; }

/* Onboarding CTA */
.onboarding-cta { background: linear-gradient(135deg,#1e1b4b,#4c1d95); border-radius: 20px;
  padding: 48px 32px; text-align: center; color: #fff; }
.onboarding-owl { font-size: 4rem; margin-bottom: 16px; }
.onboarding-cta h3 { font-size: 1.8rem; font-weight: 800; margin: 0 0 12px; }
.onboarding-cta p { font-size: 1rem; color: #c7d2fe; margin: 0 0 24px; }
.btn-primary { background: linear-gradient(90deg,#6366f1,#8b5cf6); color: #fff; border: none;
  border-radius: 10px; padding: 12px 28px; font-weight: 700; cursor: pointer; font-size: 1rem; transition: opacity .2s; }
.btn-primary:hover { opacity: .88; }
.btn-lg { padding: 14px 36px; font-size: 1.1rem; }

.empty-msg { color: #9ca3af; font-size: .9rem; }

@media(max-width:700px){
  .dash-stats-row { grid-template-columns: repeat(2,1fr); }
  .quick-actions { grid-template-columns: repeat(2,1fr); }
  .dash-banner { flex-direction: column; text-align: center; }
  .dash-level-row { justify-content: center; }
}
    `;
    document.head.appendChild(style);
  }

  /* ─── main show() ──────────────────────────────────────────── */
  function show() {
    _injectStyles();
    const user = (OWL.state && OWL.state.user) || {};
    const courses = OWL.courses || [];
    const allBadges = OWL.badges || [];
    const gamification = OWL.gamification || {};
    const leaderboard = (gamification.getLeaderboard ? gamification.getLeaderboard() : []).slice(0, 10);
    const progress = _getUserProgress(user);

    // Determine if user has done anything
    const totalCompleted = Object.values(progress).reduce((sum, cp) => {
      return sum + ((cp.completedLessons || []).length);
    }, 0);
    const hasStarted = totalCompleted > 0 || (user.xp || 0) > 0;

    let html = `<div class="dash-page">`;
    html += _renderWelcomeBanner(user);
    html += _renderStatsRow(user, leaderboard);

    if (!hasStarted) {
      html += _renderOnboardingCTA();
    } else {
      html += _renderActiveCourses(user, courses, progress);
    }

    html += _renderQuickActions();

    const earnedBadgesHtml = _renderBadgesGrid(user, allBadges);
    if (earnedBadgesHtml) html += earnedBadgesHtml;

    const achievementsHtml = _renderRecentAchievements(user);
    if (achievementsHtml) html += achievementsHtml;

    html += _renderLeaderboard(leaderboard, user.id);
    html += `</div>`;

    _appContent().innerHTML = html;

    // Animate XP bar after render
    requestAnimationFrame(() => {
      const bar = document.querySelector('.dash-xp-bar');
      if (bar) { bar.style.width = '0%'; setTimeout(() => { bar.style.width = _xpProgress(user.xp || 0) + '%'; }, 50); }
    });
  }

  /* ─── expose ───────────────────────────────────────────────── */
  OWL.dashboard = { show };

}(window.OWL = window.OWL || {}));
