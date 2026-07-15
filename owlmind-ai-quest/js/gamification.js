/**
 * OwlMind AI Quest — gamification.js
 * Exposes window.OWL.gamification
 * No ES modules. Pure browser script.
 * Depends on: ui.js (window.OWL.ui)
 */

(function () {
  'use strict';

  window.OWL = window.OWL || {};

  /* ─────────────────────────────────────────
     Constants
  ───────────────────────────────────────── */

  const LS_PREFIX    = 'owlmind_';
  const LS_USERS_KEY = 'owlmind_users';

  /* ─────────────────────────────────────────
     Level Titles (50 levels)
  ───────────────────────────────────────── */

  const LEVEL_TITLES = [
    /* 1-5 */
    'AI Curious', 'AI Curious', 'AI Curious', 'AI Curious', 'AI Curious',
    /* 6-10 */
    'Prompt Learner', 'Prompt Learner', 'Prompt Learner', 'Prompt Learner', 'Prompt Learner',
    /* 11-15 */
    'AI Apprentice', 'AI Apprentice', 'AI Apprentice', 'AI Apprentice', 'AI Apprentice',
    /* 16-20 */
    'AI Practitioner', 'AI Practitioner', 'AI Practitioner', 'AI Practitioner', 'AI Practitioner',
    /* 21-25 */
    'AI Expert', 'AI Expert', 'AI Expert', 'AI Expert', 'AI Expert',
    /* 26-30 */
    'AI Expert', 'AI Expert', 'AI Expert', 'AI Expert', 'AI Expert',
    /* 31-35 */
    'AI Master', 'AI Master', 'AI Master', 'AI Master', 'AI Master',
    /* 36-40 */
    'AI Master', 'AI Master', 'AI Master', 'AI Master', 'AI Master',
    /* 41-45 */
    'AI Legend', 'AI Legend', 'AI Legend', 'AI Legend', 'AI Legend',
    /* 46-50 */
    'AI Legend', 'AI Legend', 'AI Legend', 'AI Legend', 'AI Legend'
  ];

  /* ─────────────────────────────────────────
     Badge Definitions
  ───────────────────────────────────────── */

  const BADGE_DEFS = [
    // Onboarding
    { id: 'first_login',       name: 'First Steps',       emoji: '👶', desc: 'Logged in for the first time',          check: function (u) { return true; } },
    { id: 'profile_complete',  name: 'Identity Unlocked',  emoji: '🪪', desc: 'Completed your profile',               check: function (u) { return !!(u.name && u.email && u.avatar); } },
    // Streak
    { id: 'streak_3',          name: 'On a Roll',          emoji: '🔥', desc: '3-day learning streak',                check: function (u) { return u.streak >= 3; } },
    { id: 'streak_7',          name: 'Week Warrior',       emoji: '🗓️', desc: '7-day learning streak',                check: function (u) { return u.streak >= 7; } },
    { id: 'streak_30',         name: 'Monthly Master',     emoji: '📆', desc: '30-day learning streak',               check: function (u) { return u.streak >= 30; } },
    { id: 'streak_100',        name: 'Century Streak',     emoji: '💯', desc: '100-day learning streak',              check: function (u) { return u.streak >= 100; } },
    // XP milestones
    { id: 'xp_100',            name: 'XP Hoarder',         emoji: '💎', desc: 'Earned 100 XP',                        check: function (u) { return u.xp >= 100; } },
    { id: 'xp_1000',           name: 'XP Collector',       emoji: '💰', desc: 'Earned 1,000 XP',                      check: function (u) { return u.xp >= 1000; } },
    { id: 'xp_5000',           name: 'XP Magnate',         emoji: '🏦', desc: 'Earned 5,000 XP',                      check: function (u) { return u.xp >= 5000; } },
    { id: 'xp_10000',          name: 'XP Legend',          emoji: '👑', desc: 'Earned 10,000 XP',                     check: function (u) { return u.xp >= 10000; } },
    // Levels
    { id: 'level_5',           name: 'Level 5 Achieved',   emoji: '⭐', desc: 'Reached Level 5',                      check: function (u) { return u.level >= 5; } },
    { id: 'level_10',          name: 'Double Digits',      emoji: '🌟', desc: 'Reached Level 10',                     check: function (u) { return u.level >= 10; } },
    { id: 'level_20',          name: 'Score Seeker',       emoji: '🚀', desc: 'Reached Level 20',                     check: function (u) { return u.level >= 20; } },
    { id: 'level_50',          name: 'AI Legend',          emoji: '🏆', desc: 'Reached Level 50 — the apex',          check: function (u) { return u.level >= 50; } },
    // Lessons & Courses
    { id: 'first_lesson',      name: 'Lesson One',         emoji: '📖', desc: 'Completed your first lesson',          check: function (u) { return u.completedLessons && u.completedLessons.length >= 1; } },
    { id: 'lessons_10',        name: 'Lesson Adept',       emoji: '📚', desc: 'Completed 10 lessons',                 check: function (u) { return u.completedLessons && u.completedLessons.length >= 10; } },
    { id: 'lessons_50',        name: 'Lesson Master',      emoji: '🎓', desc: 'Completed 50 lessons',                 check: function (u) { return u.completedLessons && u.completedLessons.length >= 50; } },
    { id: 'first_course',      name: 'Course Complete',    emoji: '🎖️', desc: 'Completed your first course',          check: function (u) { return u.completedCourses && u.completedCourses.length >= 1; } },
    { id: 'courses_5',         name: 'Multi-Scholar',      emoji: '📜', desc: 'Completed 5 courses',                  check: function (u) { return u.completedCourses && u.completedCourses.length >= 5; } },
    // Projects
    { id: 'first_project',     name: 'Project Pioneer',    emoji: '🛠️', desc: 'Submitted your first project',         check: function (u) { return u.projects && u.projects.length >= 1; } },
    { id: 'projects_5',        name: 'Builder',            emoji: '🏗️', desc: 'Submitted 5 projects',                 check: function (u) { return u.projects && u.projects.length >= 5; } },
    // Certificates
    { id: 'first_certificate', name: 'Certified',          emoji: '📋', desc: 'Earned your first certificate',        check: function (u) { return u.certificates && u.certificates.length >= 1; } },
    // Special
    { id: 'night_owl',         name: 'Night Owl',          emoji: '🌙', desc: 'Studied after midnight',               check: function (u) { return false; /* triggered externally */ } },
    { id: 'speed_runner',      name: 'Speed Runner',       emoji: '⚡', desc: 'Completed a lesson in under 2 minutes', check: function (u) { return false; /* triggered externally */ } }
  ];

  /* ─────────────────────────────────────────
     Seed Leaderboard Data
  ───────────────────────────────────────── */

  const SEED_USERS = [
    { id: 'seed_1',  name: 'Mia Tanaka',    avatar: '🦉', xp: 12400, level: 12, role: 'student' },
    { id: 'seed_2',  name: 'Jake Rivera',   avatar: '🐯', xp: 10800, level: 11, role: 'student' },
    { id: 'seed_3',  name: 'Priya Sharma',  avatar: '🦋', xp: 9500,  level: 10, role: 'student' },
    { id: 'seed_4',  name: 'Liam O\'Brien', avatar: '🦁', xp: 8700,  level: 10, role: 'student' },
    { id: 'seed_5',  name: 'Aisha Diallo',  avatar: '🐸', xp: 7600,  level: 9,  role: 'student' },
    { id: 'seed_6',  name: 'Noah Kim',      avatar: '🤖', xp: 6900,  level: 9,  role: 'student' },
    { id: 'seed_7',  name: 'Sofia Cruz',    avatar: '🌟', xp: 5800,  level: 8,  role: 'student' },
    { id: 'seed_8',  name: 'Ethan Müller',  avatar: '🐺', xp: 5200,  level: 8,  role: 'student' },
    { id: 'seed_9',  name: 'Yuki Sato',     avatar: '🦄', xp: 4700,  level: 7,  role: 'student' },
    { id: 'seed_10', name: 'Zara Ahmed',    avatar: '🧙', xp: 4100,  level: 7,  role: 'student' },
    { id: 'seed_11', name: 'Carlos Vega',   avatar: '🦊', xp: 3600,  level: 6,  role: 'student' },
    { id: 'seed_12', name: 'Emma Wilson',   avatar: '🐨', xp: 3100,  level: 6,  role: 'student' },
    { id: 'seed_13', name: 'Raj Patel',     avatar: '🧑‍🚀', xp: 2700, level: 6,  role: 'student' },
    { id: 'seed_14', name: 'Lena Fischer',  avatar: '🦈', xp: 2300,  level: 5,  role: 'student' },
    { id: 'seed_15', name: 'Tom Anderson',  avatar: '🐼', xp: 1900,  level: 5,  role: 'student' }
  ];

  /* ─────────────────────────────────────────
     Storage Helpers
  ───────────────────────────────────────── */

  function getAllUsers() {
    try {
      var raw = localStorage.getItem(LS_USERS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error('[OWL] getAllUsers parse error:', e);
      return {};
    }
  }

  function saveUser(user) {
    if (!user || !user.id) return;
    var users = getAllUsers();
    users[user.id] = user;
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
    // Also keep a quick key for direct look-up
    localStorage.setItem(LS_PREFIX + 'user_' + user.id, JSON.stringify(user));
  }

  function loadUser(userId) {
    if (!userId) return null;
    // Try direct key first (faster)
    var raw = localStorage.getItem(LS_PREFIX + 'user_' + userId);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* fallthrough */ }
    }
    var users = getAllUsers();
    return users[userId] || null;
  }

  /* ─────────────────────────────────────────
     XP & Level Logic
  ───────────────────────────────────────── */

  function _xpForLevel(level) {
    // Delegate to ui if available, otherwise replicate formula
    if (window.OWL.ui && window.OWL.ui.xpForLevel) {
      return window.OWL.ui.xpForLevel(level);
    }
    level = Math.max(1, level);
    return (level - 1) * (level - 1) * 100;
  }

  function _levelFromXP(xp) {
    if (window.OWL.ui && window.OWL.ui.levelFromXP) {
      return window.OWL.ui.levelFromXP(xp);
    }
    xp = Math.max(0, xp);
    return Math.min(Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1), 50);
  }

  /* ─────────────────────────────────────────
     Level Title
  ───────────────────────────────────────── */

  function getLevelTitle(level) {
    level = Math.max(1, Math.min(50, level || 1));
    return LEVEL_TITLES[level - 1] || 'AI Legend';
  }

  /* ─────────────────────────────────────────
     Badge Checking
  ───────────────────────────────────────── */

  /**
   * Check all badge conditions against user.
   * Returns array of newly earned badge objects.
   * @param {Object} user
   * @returns {Array}
   */
  function checkBadges(user) {
    var earned    = user.earnedBadges || [];
    var newBadges = [];

    BADGE_DEFS.forEach(function (def) {
      if (earned.indexOf(def.id) !== -1) return; // already has it
      try {
        if (def.check(user)) {
          newBadges.push(def);
        }
      } catch (e) {
        // ignore individual check errors
      }
    });

    return newBadges;
  }

  /* ─────────────────────────────────────────
     Streak Update
  ───────────────────────────────────────── */

  /**
   * Update daily login streak.
   * @param {Object} user  (mutated in place)
   * @returns {{ streak: number, isNewDay: boolean, bonusXP: number }}
   */
  function updateStreak(user) {
    var today   = _todayStr();
    var lastDay = user.lastLoginDate || '';
    var bonusXP = 0;
    var isNewDay = false;

    if (lastDay === today) {
      // Same day — no change
      return { streak: user.streak || 1, isNewDay: false, bonusXP: 0 };
    }

    var yesterday = _yesterdayStr();

    if (lastDay === yesterday) {
      // Consecutive day
      user.streak = (user.streak || 0) + 1;
      isNewDay    = true;
    } else if (!lastDay) {
      // First time
      user.streak = 1;
      isNewDay    = true;
    } else {
      // Streak broken
      user.streak = 1;
      isNewDay    = true;
    }

    // Milestone bonus XP for streaks
    var streak = user.streak;
    if (streak > 0 && streak % 7 === 0)   bonusXP = 100; // weekly
    if (streak > 0 && streak % 30 === 0)  bonusXP = 500; // monthly

    user.lastLoginDate = today;
    return { streak: user.streak, isNewDay: isNewDay, bonusXP: bonusXP };
  }

  function _todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function _yesterdayStr() {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  /* ─────────────────────────────────────────
     Award XP
  ───────────────────────────────────────── */

  /**
   * Award XP to a user, recalculate level, check badges, persist.
   * @param {string} userId
   * @param {number} amount
   * @param {string} reason
   * @returns {{ newXP: number, newLevel: number, leveledUp: boolean, badgesEarned: Array }}
   */
  function awardXP(userId, amount, reason) {
    var user = loadUser(userId);
    if (!user) {
      console.warn('[OWL] awardXP: user not found:', userId);
      return { newXP: 0, newLevel: 1, leveledUp: false, badgesEarned: [] };
    }

    var oldLevel = user.level || 1;
    user.xp      = (user.xp || 0) + amount;
    var newLevel = _levelFromXP(user.xp);
    user.level   = newLevel;

    var leveledUp  = newLevel > oldLevel;
    var newBadges  = checkBadges(user);

    // Grant new badges
    if (newBadges.length) {
      user.earnedBadges = user.earnedBadges || [];
      newBadges.forEach(function (b) {
        if (user.earnedBadges.indexOf(b.id) === -1) {
          user.earnedBadges.push(b.id);
        }
      });
    }

    // Persist
    saveUser(user);

    // Sync to OWL state if this is the current user
    if (window.OWL.state && window.OWL.state.user && window.OWL.state.user.id === userId) {
      window.OWL.state.user = user;
    }

    // Toast notifications
    if (window.OWL.ui) {
      if (amount > 0) {
        window.OWL.ui.toast('+' + amount + ' XP' + (reason ? ' — ' + reason : ''), 'success');
      }
      if (leveledUp) {
        window.OWL.ui.toast('🎉 Level Up! ' + window.OWL.ui.formatLevel(newLevel) + ' — ' + getLevelTitle(newLevel), 'success');
      }
      newBadges.forEach(function (b) {
        window.OWL.ui.toast(b.emoji + ' Badge Unlocked: ' + b.name, 'info');
      });
    }

    return {
      newXP       : user.xp,
      newLevel    : newLevel,
      leveledUp   : leveledUp,
      badgesEarned: newBadges
    };
  }

  /* ─────────────────────────────────────────
     Leaderboard
  ───────────────────────────────────────── */

  /**
   * Build global leaderboard (real users + seed data), sorted by XP.
   * @returns {Array}
   */
  function getLeaderboard() {
    var realUsers  = Object.values(getAllUsers());
    var combined   = [].concat(realUsers, SEED_USERS);

    // Deduplicate by id
    var seen = {};
    var deduped = combined.filter(function (u) {
      if (seen[u.id]) return false;
      seen[u.id] = true;
      return true;
    });

    // Only students for leaderboard
    var students = deduped.filter(function (u) { return u.role !== 'teacher' && u.role !== 'admin'; });

    // Sort by XP descending
    students.sort(function (a, b) { return (b.xp || 0) - (a.xp || 0); });

    // Add rank
    return students.slice(0, 50).map(function (u, i) {
      return {
        rank      : i + 1,
        id        : u.id,
        name      : u.name || 'Anonymous',
        avatar    : u.avatar || '🦉',
        xp        : u.xp || 0,
        level     : u.level || 1,
        levelTitle: getLevelTitle(u.level || 1),
        streak    : u.streak || 0,
        isReal    : !u.id.startsWith('seed_')
      };
    });
  }

  /**
   * Leaderboard filtered to a specific classroom.
   * @param {string} classroomId
   * @returns {Array}
   */
  function getClassroomLeaderboard(classroomId) {
    if (!classroomId) return [];
    var users = Object.values(getAllUsers());
    var members = users.filter(function (u) {
      return u.classroom === classroomId || (u.classroomStudents && u.classroomStudents.indexOf(classroomId) !== -1);
    });

    members.sort(function (a, b) { return (b.xp || 0) - (a.xp || 0); });

    return members.slice(0, 50).map(function (u, i) {
      return {
        rank      : i + 1,
        id        : u.id,
        name      : u.name || 'Anonymous',
        avatar    : u.avatar || '🦉',
        xp        : u.xp || 0,
        level     : u.level || 1,
        levelTitle: getLevelTitle(u.level || 1),
        streak    : u.streak || 0
      };
    });
  }

  /* ─────────────────────────────────────────
     Public API
  ───────────────────────────────────────── */

  window.OWL.gamification = {
    awardXP                : awardXP,
    checkBadges            : checkBadges,
    updateStreak           : updateStreak,
    getLevelTitle          : getLevelTitle,
    getLeaderboard         : getLeaderboard,
    getClassroomLeaderboard: getClassroomLeaderboard,
    saveUser               : saveUser,
    loadUser               : loadUser,
    getAllUsers             : getAllUsers,
    LEVEL_TITLES           : LEVEL_TITLES,
    BADGE_DEFS             : BADGE_DEFS
  };

})();
