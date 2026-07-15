/**
 * OwlMind AI Quest — auth.js
 * Exposes window.OWL.auth
 * No ES modules. Pure browser script.
 * Depends on: gamification.js, ui.js
 */

(function () {
  'use strict';

  window.OWL = window.OWL || {};

  /* ─────────────────────────────────────────
     Constants
  ───────────────────────────────────────── */

  const LS_PREFIX        = 'owlmind_';
  const LS_CURRENT_USER  = 'owlmind_current_user_id';
  const LS_USERS_KEY     = 'owlmind_users';
  const SALT             = 'owlmind_s@lt_2024';

  /* ─────────────────────────────────────────
     Utility Helpers
  ───────────────────────────────────────── */

  function _uid() {
    return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function _todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  /**
   * Simple deterministic hash: btoa(salt + password).
   * Not cryptographically strong but sufficient for a client-side demo.
   * @param {string} password
   * @returns {string}
   */
  function hashPassword(password) {
    try {
      return btoa(SALT + String(password));
    } catch (e) {
      // btoa may throw on non-Latin1; encode first
      return btoa(unescape(encodeURIComponent(SALT + String(password))));
    }
  }

  /**
   * Validate email format.
   * @param {string} email
   * @returns {boolean}
   */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  }

  /* ─────────────────────────────────────────
     Storage Helpers (mirror gamification)
  ───────────────────────────────────────── */

  function _getAllUsers() {
    // Prefer gamification module if loaded
    if (window.OWL.gamification) return window.OWL.gamification.getAllUsers();
    try {
      return JSON.parse(localStorage.getItem(LS_USERS_KEY) || '{}');
    } catch (e) { return {}; }
  }

  function _saveUser(user) {
    if (window.OWL.gamification) {
      window.OWL.gamification.saveUser(user);
      return;
    }
    if (!user || !user.id) return;
    var users = _getAllUsers();
    users[user.id] = user;
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
    localStorage.setItem(LS_PREFIX + 'user_' + user.id, JSON.stringify(user));
  }

  function _loadUser(userId) {
    if (window.OWL.gamification) return window.OWL.gamification.loadUser(userId);
    var raw = localStorage.getItem(LS_PREFIX + 'user_' + userId);
    if (raw) { try { return JSON.parse(raw); } catch (e) {} }
    return (_getAllUsers())[userId] || null;
  }

  /* ─────────────────────────────────────────
     User Lookup
  ───────────────────────────────────────── */

  /**
   * Find a user record by email address.
   * @param {string} email
   * @returns {Object|null}
   */
  function findUserByEmail(email) {
    email = String(email || '').trim().toLowerCase();
    var users = _getAllUsers();
    var keys  = Object.keys(users);
    for (var i = 0; i < keys.length; i++) {
      var u = users[keys[i]];
      if (u && String(u.email || '').trim().toLowerCase() === email) {
        return u;
      }
    }
    return null;
  }

  /* ─────────────────────────────────────────
     Demo Accounts
  ───────────────────────────────────────── */

  /**
   * Create built-in demo accounts if they don't exist yet.
   * Safe to call multiple times.
   */
  function initDemoAccounts() {
    var demos = [
      {
        id             : 'demo_student',
        name           : 'Alex Johnson',
        email          : 'demo@student.com',
        password       : hashPassword('demo123'),
        role           : 'student',
        avatar         : '🦉',
        xp             : 1250,
        level          : 4,
        streak         : 7,
        lastLoginDate  : _todayStr(),
        completedLessons: ['lesson_intro_1', 'lesson_intro_2', 'lesson_prompt_1'],
        completedCourses: [],
        earnedBadges   : ['first_login', 'streak_7', 'xp_1000', 'first_lesson', 'lessons_10'],
        certificates   : [],
        projects       : [],
        classroom      : null,
        classroomStudents: [],
        createdAt      : '2024-01-15'
      },
      {
        id             : 'demo_teacher',
        name           : 'Ms. Sarah Chen',
        email          : 'demo@teacher.com',
        password       : hashPassword('demo123'),
        role           : 'teacher',
        avatar         : '🧙',
        xp             : 3200,
        level          : 6,
        streak         : 14,
        lastLoginDate  : _todayStr(),
        completedLessons: [],
        completedCourses: [],
        earnedBadges   : ['first_login', 'streak_7'],
        certificates   : [],
        projects       : [],
        classroom      : 'class_sarah_01',
        classroomStudents: ['demo_student'],
        createdAt      : '2024-01-01'
      },
      {
        id             : 'demo_admin',
        name           : 'Admin',
        email          : 'admin@owlmind.ai',
        password       : hashPassword('admin123'),
        role           : 'admin',
        avatar         : '🤖',
        xp             : 9999,
        level          : 10,
        streak         : 365,
        lastLoginDate  : _todayStr(),
        completedLessons: [],
        completedCourses: [],
        earnedBadges   : ['first_login'],
        certificates   : [],
        projects       : [],
        classroom      : null,
        classroomStudents: [],
        createdAt      : '2024-01-01'
      }
    ];

    demos.forEach(function (demo) {
      // Only create if this id doesn't exist yet
      var existing = _loadUser(demo.id);
      if (!existing) {
        _saveUser(demo);
      }
    });
  }

  /* ─────────────────────────────────────────
     Sign Up
  ───────────────────────────────────────── */

  /**
   * Register a new account.
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {'student'|'teacher'|'admin'} role
   * @returns {{ success: boolean, user: Object|null, error: string|null }}
   */
  function signup(name, email, password, role) {
    name     = String(name     || '').trim();
    email    = String(email    || '').trim().toLowerCase();
    password = String(password || '').trim();
    role     = role || 'student';

    // Validation
    if (!name || name.length < 2) {
      return { success: false, user: null, error: 'Name must be at least 2 characters.' };
    }
    if (!validateEmail(email)) {
      return { success: false, user: null, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, user: null, error: 'Password must be at least 6 characters.' };
    }
    if (['student', 'teacher', 'admin'].indexOf(role) === -1) {
      role = 'student';
    }

    // Check duplicate email
    if (findUserByEmail(email)) {
      return { success: false, user: null, error: 'An account with this email already exists.' };
    }

    // Pick a random default avatar
    var defaultAvatars = window.OWL.ui ? window.OWL.ui.avatarEmojis : ['🦉', '🐯', '🦁'];
    var avatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    var newUser = {
      id               : _uid(),
      name             : name,
      email            : email,
      password         : hashPassword(password),
      role             : role,
      avatar           : avatar,
      xp               : 0,
      level            : 1,
      streak           : 0,
      lastLoginDate    : null,
      completedLessons : [],
      completedCourses : [],
      earnedBadges     : [],
      certificates     : [],
      projects         : [],
      classroom        : null,
      classroomStudents: [],
      createdAt        : new Date().toISOString().slice(0, 10)
    };

    _saveUser(newUser);

    // Award first-login badge immediately
    if (window.OWL.gamification) {
      window.OWL.gamification.awardXP(newUser.id, 50, 'Welcome bonus');
    }

    return { success: true, user: newUser, error: null };
  }

  /* ─────────────────────────────────────────
     Log In
  ───────────────────────────────────────── */

  /**
   * Authenticate with email + password.
   * @param {string} email
   * @param {string} password
   * @returns {{ success: boolean, user: Object|null, error: string|null }}
   */
  function login(email, password) {
    email    = String(email    || '').trim().toLowerCase();
    password = String(password || '').trim();

    if (!validateEmail(email)) {
      return { success: false, user: null, error: 'Please enter a valid email address.' };
    }
    if (!password) {
      return { success: false, user: null, error: 'Password is required.' };
    }

    var user = findUserByEmail(email);
    if (!user) {
      return { success: false, user: null, error: 'No account found with that email.' };
    }

    var hashed = hashPassword(password);
    if (user.password !== hashed) {
      return { success: false, user: null, error: 'Incorrect password.' };
    }

    // Update streak
    var streakResult = { streak: user.streak || 1, bonusXP: 0 };
    if (window.OWL.gamification) {
      streakResult = window.OWL.gamification.updateStreak(user);
      if (streakResult.bonusXP > 0) {
        user.xp = (user.xp || 0) + streakResult.bonusXP;
      }
    } else {
      user.lastLoginDate = new Date().toISOString().slice(0, 10);
    }

    // Check badges after streak update
    if (window.OWL.gamification) {
      var newBadges = window.OWL.gamification.checkBadges(user);
      newBadges.forEach(function (b) {
        if ((user.earnedBadges || []).indexOf(b.id) === -1) {
          user.earnedBadges = user.earnedBadges || [];
          user.earnedBadges.push(b.id);
        }
      });
    }

    _saveUser(user);

    // Set session
    localStorage.setItem(LS_CURRENT_USER, user.id);
    window.OWL.state = window.OWL.state || {};
    window.OWL.state.user = user;

    return { success: true, user: user, error: null };
  }

  /* ─────────────────────────────────────────
     Guest Login
  ───────────────────────────────────────── */

  /**
   * Create a temporary guest account (stored in localStorage for the session).
   * @returns {{ success: boolean, user: Object, error: null }}
   */
  function loginAsGuest() {
    var guestNum = Math.floor(Math.random() * 9000) + 1000;
    var guestUser = {
      id               : 'guest_' + Date.now().toString(36),
      name             : 'Guest ' + guestNum,
      email            : 'guest_' + guestNum + '@guest.owlmind',
      password         : '',
      role             : 'student',
      avatar           : '👾',
      xp               : 0,
      level            : 1,
      streak           : 0,
      lastLoginDate    : _todayStr(),
      completedLessons : [],
      completedCourses : [],
      earnedBadges     : [],
      certificates     : [],
      projects         : [],
      classroom        : null,
      classroomStudents: [],
      isGuest          : true,
      createdAt        : _todayStr()
    };

    _saveUser(guestUser);
    localStorage.setItem(LS_CURRENT_USER, guestUser.id);
    window.OWL.state = window.OWL.state || {};
    window.OWL.state.user = guestUser;

    return { success: true, user: guestUser, error: null };
  }

  /* ─────────────────────────────────────────
     Logout
  ───────────────────────────────────────── */

  /** Clear session and redirect to landing. */
  function logout() {
    localStorage.removeItem(LS_CURRENT_USER);
    window.OWL.state = window.OWL.state || {};
    window.OWL.state.user = null;

    if (window.OWL.ui) {
      window.OWL.ui.toast('Logged out. See you soon! 👋', 'info');
    }

    // Navigate to landing after a brief delay so toast shows
    setTimeout(function () {
      if (window.OWL.app) {
        window.OWL.app.navigate('/');
      } else {
        window.location.hash = '/';
      }
    }, 600);
  }

  /* ─────────────────────────────────────────
     Session Helpers
  ───────────────────────────────────────── */

  /**
   * Get the currently logged-in user object.
   * Reads from OWL.state first, then localStorage.
   * @returns {Object|null}
   */
  function getCurrentUser() {
    if (window.OWL.state && window.OWL.state.user) {
      return window.OWL.state.user;
    }
    var uid = localStorage.getItem(LS_CURRENT_USER);
    if (!uid) return null;
    var user = _loadUser(uid);
    if (user) {
      window.OWL.state = window.OWL.state || {};
      window.OWL.state.user = user;
    }
    return user || null;
  }

  /** @returns {boolean} */
  function isLoggedIn() {
    return getCurrentUser() !== null;
  }

  /**
   * Guard pages that require authentication.
   * Redirects to /login if not logged in.
   */
  function requireAuth() {
    if (!isLoggedIn()) {
      if (window.OWL.ui) {
        window.OWL.ui.toast('Please log in to continue.', 'warning');
      }
      if (window.OWL.app) {
        window.OWL.app.navigate('/login');
      } else {
        window.location.hash = '/login';
      }
      return false;
    }
    return true;
  }

  /* ─────────────────────────────────────────
     Profile Management
  ───────────────────────────────────────── */

  /**
   * Update fields on the current user.
   * @param {Object} updates  Partial user object (id and email not changed here)
   * @returns {{ success: boolean, user: Object|null, error: string|null }}
   */
  function updateProfile(updates) {
    var user = getCurrentUser();
    if (!user) return { success: false, user: null, error: 'Not logged in.' };

    // Whitelist of safe fields to update
    var allowed = ['name', 'avatar', 'classroom', 'classroomStudents'];
    allowed.forEach(function (key) {
      if (updates.hasOwnProperty(key)) {
        user[key] = updates[key];
      }
    });

    _saveUser(user);
    window.OWL.state.user = user;

    return { success: true, user: user, error: null };
  }

  /**
   * Change password for current user.
   * @param {string} oldPass
   * @param {string} newPass
   * @returns {{ success: boolean, error: string|null }}
   */
  function changePassword(oldPass, newPass) {
    var user = getCurrentUser();
    if (!user) return { success: false, error: 'Not logged in.' };

    if (user.password !== hashPassword(String(oldPass || ''))) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    user.password = hashPassword(newPass);
    _saveUser(user);
    window.OWL.state.user = user;

    return { success: true, error: null };
  }

  /**
   * Permanently delete the current user account.
   * @returns {{ success: boolean, error: string|null }}
   */
  function deleteAccount() {
    var user = getCurrentUser();
    if (!user) return { success: false, error: 'Not logged in.' };

    // Remove from users map
    try {
      var users = _getAllUsers();
      delete users[user.id];
      localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
    } catch (e) {}

    // Remove individual key
    localStorage.removeItem(LS_PREFIX + 'user_' + user.id);
    localStorage.removeItem(LS_CURRENT_USER);

    window.OWL.state.user = null;

    if (window.OWL.ui) {
      window.OWL.ui.toast('Account deleted. Goodbye!', 'info');
    }

    setTimeout(function () {
      if (window.OWL.app) window.OWL.app.navigate('/');
      else window.location.hash = '/';
    }, 800);

    return { success: true, error: null };
  }

  /* ─────────────────────────────────────────
     Public API
  ───────────────────────────────────────── */

  window.OWL.auth = {
    signup           : signup,
    login            : login,
    loginAsGuest     : loginAsGuest,
    logout           : logout,
    getCurrentUser   : getCurrentUser,
    isLoggedIn       : isLoggedIn,
    requireAuth      : requireAuth,
    updateProfile    : updateProfile,
    changePassword   : changePassword,
    deleteAccount    : deleteAccount,
    findUserByEmail  : findUserByEmail,
    validateEmail    : validateEmail,
    hashPassword     : hashPassword,
    initDemoAccounts : initDemoAccounts
  };

  // Auto-init demo accounts when script loads (safe to call multiple times)
  initDemoAccounts();

})();
