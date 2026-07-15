/* projects.js — OwlMind AI Quest
   Exposes window.OWL.projects
   Depends on: OWL.state, OWL.gamification, OWL.app
*/
(function (OWL) {
  'use strict';

  var PROJECTS_KEY = 'owl_community_projects';
  var USER_PROJECTS_PREFIX = 'owl_user_projects_';

  /* ─── project ideas ─── */
  function getProjectIdeas() {
    return [
      {
        id: 'idea_chatbot',
        title: 'AI Chatbot',
        description: 'Build a rule-based or LLM-powered chatbot for a specific domain — customer support, tutor, or companion.',
        difficulty: 'Beginner',
        xp: 100,
        icon: '🤖',
        tags: ['NLP', 'Python', 'LLM'],
        time: '2–4 hours'
      },
      {
        id: 'idea_resume',
        title: 'AI Resume Builder',
        description: 'Create a tool that takes user input and generates a professionally formatted resume using an AI model.',
        difficulty: 'Beginner',
        xp: 100,
        icon: '📄',
        tags: ['Prompt Engineering', 'UI', 'GPT'],
        time: '3–5 hours'
      },
      {
        id: 'idea_study',
        title: 'Study Assistant',
        description: 'Build an AI study buddy that summarizes notes, creates flashcards, and quizzes you on the material.',
        difficulty: 'Intermediate',
        xp: 150,
        icon: '📚',
        tags: ['NLP', 'RAG', 'Education'],
        time: '5–8 hours'
      },
      {
        id: 'idea_business',
        title: 'AI Business Plan Generator',
        description: 'Create a web app where users enter their idea and AI generates a full business plan with market analysis.',
        difficulty: 'Intermediate',
        xp: 150,
        icon: '💼',
        tags: ['LLM', 'Web', 'Prompting'],
        time: '6–10 hours'
      },
      {
        id: 'idea_habits',
        title: 'Habit Tracker with AI Coach',
        description: 'Track daily habits and receive personalized AI-generated motivation, insights, and improvement tips.',
        difficulty: 'Advanced',
        xp: 200,
        icon: '🎯',
        tags: ['ML', 'Analytics', 'AI Coach'],
        time: '8–12 hours'
      },
      {
        id: 'idea_portfolio',
        title: 'AI Portfolio Website',
        description: 'Build a dynamic personal portfolio that uses AI to tailor its presentation based on visitor interests.',
        difficulty: 'Advanced',
        xp: 200,
        icon: '🌐',
        tags: ['Web', 'AI Integration', 'UX'],
        time: '10–15 hours'
      }
    ];
  }

  /* ─── community seed projects ─── */
  var _seedProjects = [
    { id:'cp1', author:'Alex M.', avatar:'👨‍💻', title:'GPT-Powered FAQ Bot', description:'Built a customer support chatbot using GPT-4 API with a React frontend. Handles 200+ FAQs.', tags:['GPT-4','React','Chatbot'], difficulty:'Intermediate', xp:150, likes:34, date:'2025-11-20', status:'completed' },
    { id:'cp2', author:'Priya S.', avatar:'👩‍💻', title:'Resume Analyzer', description:'Upload your resume and get AI-powered feedback on formatting, keywords, and ATS compatibility.', tags:['NLP','Python','Flask'], difficulty:'Beginner', xp:100, likes:28, date:'2025-12-01', status:'completed' },
    { id:'cp3', author:'Jordan L.', avatar:'🧑‍💻', title:'AI Study Planner', description:'Enter your syllabus and exam date — the AI creates a day-by-day study schedule optimized for retention.', tags:['LLM','Scheduling','Education'], difficulty:'Intermediate', xp:150, likes:45, date:'2025-12-10', status:'completed' },
    { id:'cp4', author:'Sam K.', avatar:'👩‍🔬', title:'Sentiment Dashboard', description:'Real-time Twitter/X sentiment analysis for any keyword using a fine-tuned BERT model.', tags:['BERT','NLP','Dashboard'], difficulty:'Advanced', xp:200, likes:62, date:'2026-01-05', status:'completed' },
    { id:'cp5', author:'Riley T.', avatar:'🧑‍🎨', title:'AI Art Prompt Generator', description:'Enter a mood/theme and get 10 creative prompts for Midjourney or DALL-E image generation.', tags:['Prompt Engineering','Creative AI'], difficulty:'Beginner', xp:100, likes:87, date:'2026-01-18', status:'completed' },
    { id:'cp6', author:'Morgan B.', avatar:'👨‍🔬', title:'Habit Coach App', description:'Full habit tracking app with weekly AI reports, streak tracking, and personalized tips powered by Claude.', tags:['Claude','React Native','Analytics'], difficulty:'Advanced', xp:200, likes:41, date:'2026-02-03', status:'completed' },
    { id:'cp7', author:'Casey W.', avatar:'👩‍💻', title:'AI Recipe Generator', description:'Upload what ingredients you have and get personalized recipe suggestions with nutritional info.', tags:['GPT-4V','Vision','Food'], difficulty:'Intermediate', xp:150, likes:55, date:'2026-02-15', status:'completed' },
    { id:'cp8', author:'Dana P.', avatar:'🧑‍💻', title:'AI Business Pitch Deck', description:'Input your startup idea and the tool generates a 10-slide pitch deck with investor-ready content.', tags:['LLM','Presentations','Startup'], difficulty:'Intermediate', xp:150, likes:38, date:'2026-03-02', status:'completed' }
  ];

  function _ensureSeedProjects() {
    try {
      var existing = localStorage.getItem(PROJECTS_KEY);
      if (!existing) {
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(_seedProjects));
      }
    } catch(e) {}
  }

  function _getAllProjects() {
    _ensureSeedProjects();
    try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]'); }
    catch(e) { return _seedProjects.slice(); }
  }

  function _getUserProjects(userId) {
    try { return JSON.parse(localStorage.getItem(USER_PROJECTS_PREFIX + (userId || 'guest')) || '[]'); }
    catch(e) { return []; }
  }

  function _saveUserProjects(userId, projects) {
    try { localStorage.setItem(USER_PROJECTS_PREFIX + (userId || 'guest'), JSON.stringify(projects)); }
    catch(e) {}
  }

  function _saveAllProjects(projects) {
    try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects)); }
    catch(e) {}
  }

  /* ─── styles ─── */
  function _injectStyles() {
    if (document.getElementById('owl-projects-styles')) return;
    var style = document.createElement('style');
    style.id = 'owl-projects-styles';
    style.textContent = `
/* ─── Projects Page ─── */
.projects-page { max-width: 1100px; margin: 0 auto; padding: 32px 16px; }

/* Hero */
.projects-hero { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
  border-radius: 20px; padding: 44px 40px; text-align: center; color: #fff; margin-bottom: 36px;
  box-shadow: 0 8px 32px rgba(99,102,241,.3); }
.projects-hero h2 { font-size: 2.2rem; font-weight: 900; margin: 0 0 12px; }
.projects-hero p { font-size: 1.05rem; color: #c7d2fe; margin: 0 0 24px; max-width: 560px; margin-left: auto; margin-right: auto; }
.btn-submit-project { background: linear-gradient(90deg,#f59e0b,#fbbf24); color: #1e1b4b;
  border: none; border-radius: 12px; padding: 13px 32px; font-weight: 800; font-size: 1rem;
  cursor: pointer; transition: opacity .2s; letter-spacing: .02em; }
.btn-submit-project:hover { opacity: .88; }

/* Section */
.proj-section { margin-bottom: 40px; }
.proj-section-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.proj-section-hdr h3 { font-size: 1.2rem; font-weight: 800; color: #1e1b4b; margin: 0; }
.proj-count-badge { background: #ede9fe; color: #7c3aed; border-radius: 99px;
  padding: 3px 12px; font-size: .78rem; font-weight: 700; }

/* Idea cards grid */
.ideas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 16px; }
.idea-card { background: #fff; border-radius: 16px; padding: 22px; border: 1px solid #e0e7ff;
  box-shadow: 0 2px 12px rgba(0,0,0,.05); transition: transform .2s, box-shadow .2s; }
.idea-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(99,102,241,.12); }
.idea-card-top { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 12px; }
.idea-icon { font-size: 2.2rem; flex-shrink: 0; }
.idea-info { flex: 1; }
.idea-title { font-size: 1.05rem; font-weight: 800; color: #1e1b4b; margin-bottom: 4px; }
.idea-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.diff-badge { font-size: .72rem; font-weight: 700; border-radius: 99px; padding: 2px 9px; }
.diff-Beginner { background: #dcfce7; color: #15803d; }
.diff-Intermediate { background: #fef3c7; color: #b45309; }
.diff-Advanced { background: #fee2e2; color: #991b1b; }
.xp-badge-sm { background: #ede9fe; color: #7c3aed; font-size: .72rem; font-weight: 700; padding: 2px 9px; border-radius: 99px; }
.idea-desc { font-size: .88rem; color: #4b5563; line-height: 1.55; margin-bottom: 14px; }
.idea-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.tag-chip { background: #f3f4f6; color: #374151; font-size: .72rem; font-weight: 600; padding: 3px 9px; border-radius: 99px; }
.idea-footer { display: flex; justify-content: space-between; align-items: center; }
.idea-time { font-size: .78rem; color: #9ca3af; }
.btn-start-idea { background: #6366f1; color: #fff; border: none; border-radius: 8px;
  padding: 7px 16px; font-size: .82rem; font-weight: 700; cursor: pointer; transition: opacity .2s; }
.btn-start-idea:hover { opacity: .88; }

/* My Projects */
.my-projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.proj-empty { text-align: center; padding: 40px; background: #f8f7ff; border-radius: 16px;
  border: 2px dashed #c7d2fe; }
.proj-empty-icon { font-size: 3rem; margin-bottom: 12px; }
.proj-empty p { color: #6b7280; font-size: .9rem; }

/* Community projects */
.community-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.community-card { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #e0e7ff;
  box-shadow: 0 2px 8px rgba(0,0,0,.05); transition: transform .15s, box-shadow .15s; }
.community-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,.1); }
.cc-author { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.cc-avatar { font-size: 1.4rem; }
.cc-name { font-size: .82rem; font-weight: 600; color: #374151; }
.cc-date { font-size: .72rem; color: #9ca3af; }
.cc-title { font-size: 1rem; font-weight: 800; color: #1e1b4b; margin-bottom: 6px; }
.cc-desc { font-size: .85rem; color: #6b7280; line-height: 1.5; margin-bottom: 10px; }
.cc-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
.cc-footer { display: flex; justify-content: space-between; align-items: center; }
.cc-likes { font-size: .82rem; color: #ec4899; font-weight: 600; }
.cc-diff { font-size: .72rem; font-weight: 700; padding: 2px 9px; border-radius: 99px; }

/* Modal */
.proj-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 10000;
  display: flex; align-items: center; justify-content: center; padding: 20px; }
.proj-modal-box { background: #fff; border-radius: 20px; padding: 32px; max-width: 560px; width: 100%;
  max-height: 90vh; overflow-y: auto; position: relative; }
.proj-modal-close { position: absolute; top: 16px; right: 16px; background: #f3f4f6;
  border: none; border-radius: 8px; width: 30px; height: 30px; font-size: 1rem;
  cursor: pointer; display: flex; align-items: center; justify-content: center; }
.proj-modal-close:hover { background: #e5e7eb; }
.proj-modal-title { font-size: 1.3rem; font-weight: 800; color: #1e1b4b; margin: 0 0 20px; }
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: .85rem; font-weight: 600; color: #374151; margin-bottom: 6px; }
.form-input, .form-textarea, .form-select { width: 100%; border: 2px solid #e0e7ff; border-radius: 10px;
  padding: 10px 14px; font-size: .9rem; color: #1e1b4b; outline: none; font-family: inherit;
  transition: border-color .15s; box-sizing: border-box; }
.form-input:focus, .form-textarea:focus, .form-select:focus { border-color: #6366f1; }
.form-textarea { resize: vertical; min-height: 90px; }
.form-actions { display: flex; gap: 10px; margin-top: 20px; }
.btn-submit-form { flex: 1; background: linear-gradient(90deg,#6366f1,#8b5cf6); color: #fff;
  border: none; border-radius: 10px; padding: 12px; font-weight: 700; font-size: .95rem;
  cursor: pointer; transition: opacity .2s; }
.btn-submit-form:hover { opacity: .88; }
.btn-cancel-form { background: #f3f4f6; color: #374151; border: none; border-radius: 10px;
  padding: 12px 20px; font-weight: 600; font-size: .95rem; cursor: pointer; transition: background .15s; }
.btn-cancel-form:hover { background: #e5e7eb; }

/* User project card */
.my-proj-card { background: linear-gradient(135deg,#f8f7ff,#fff); border-radius: 16px; padding: 20px;
  border: 1px solid #e0e7ff; position: relative; }
.my-proj-status { position: absolute; top: 14px; right: 14px; font-size: .72rem; font-weight: 700;
  padding: 3px 10px; border-radius: 99px; }
.status-completed { background: #dcfce7; color: #15803d; }
.status-in-progress { background: #fef3c7; color: #b45309; }
.my-proj-title { font-size: 1rem; font-weight: 800; color: #1e1b4b; margin-bottom: 6px; padding-right: 80px; }
.my-proj-desc { font-size: .85rem; color: #6b7280; margin-bottom: 10px; line-height: 1.5; }
.my-proj-xp { font-size: .85rem; font-weight: 700; color: #7c3aed; }
    `;
    document.head.appendChild(style);
  }

  /* ─── renderProjectCard ─── */
  function renderProjectCard(project) {
    var statusClass = (project.status === 'completed') ? 'status-completed' : 'status-in-progress';
    var statusLabel = (project.status === 'completed') ? '✅ Completed' : '🔄 In Progress';
    var tagsHtml = (project.tags || []).map(function(t) {
      return `<span class="tag-chip">${t}</span>`;
    }).join('');
    return `
    <div class="my-proj-card">
      <span class="my-proj-status ${statusClass}">${statusLabel}</span>
      <div class="my-proj-title">${project.title}</div>
      <div class="my-proj-desc">${project.description}</div>
      <div class="idea-tags">${tagsHtml}</div>
      <div class="my-proj-xp">⭐ +${project.xp || 100} XP earned</div>
    </div>`;
  }

  /* ─── submitProject ─── */
  function submitProject(data) {
    var user = (OWL.state && OWL.state.user) || {};
    var userId = user.id || 'guest';

    var project = {
      id: 'proj_' + Date.now(),
      authorId: userId,
      author: user.name || user.username || 'You',
      avatar: '👤',
      title: data.title || 'Untitled Project',
      description: data.description || '',
      tags: (data.tags || '').split(',').map(function(t) { return t.trim(); }).filter(Boolean),
      difficulty: data.difficulty || 'Intermediate',
      xp: data.difficulty === 'Beginner' ? 100 : data.difficulty === 'Advanced' ? 200 : 150,
      status: data.status || 'completed',
      date: new Date().toISOString().slice(0, 10),
      likes: 0
    };

    // Save to user projects
    var userProjects = _getUserProjects(userId);
    userProjects.push(project);
    _saveUserProjects(userId, userProjects);

    // Also add to community
    var allProjects = _getAllProjects();
    allProjects.push(project);
    _saveAllProjects(allProjects);

    // Award XP
    if (OWL.gamification && OWL.gamification.awardXP) {
      OWL.gamification.awardXP(userId, project.xp, 'Project submitted: ' + project.title);
    }
    if (OWL.gamification && OWL.gamification.checkBadges) {
      var currentUser = OWL.auth.getCurrentUser();
      OWL.gamification.checkBadges(currentUser);
    }

    // Record achievement
    try {
      var achKey = 'owl_achievements_' + userId;
      var ach = JSON.parse(localStorage.getItem(achKey) || '[]');
      ach.unshift({ icon: '🛠️', title: 'Project Submitted: ' + project.title, xp: project.xp, time: new Date().toLocaleDateString() });
      localStorage.setItem(achKey, JSON.stringify(ach.slice(0, 20)));
    } catch(e) {}

    return project;
  }

  /* ─── showSubmitForm ─── */
  function showSubmitForm() {
    var existing = document.getElementById('proj-modal-overlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.className = 'proj-modal-overlay';
    overlay.id = 'proj-modal-overlay';
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = `
    <div class="proj-modal-box">
      <button class="proj-modal-close" onclick="document.getElementById('proj-modal-overlay').remove()">✕</button>
      <div class="proj-modal-title">🛠️ Submit a Project</div>
      <div class="form-group">
        <label class="form-label">Project Title *</label>
        <input class="form-input" id="pf-title" type="text" placeholder="e.g. AI Resume Builder" maxlength="80"/>
      </div>
      <div class="form-group">
        <label class="form-label">Description *</label>
        <textarea class="form-textarea" id="pf-desc" placeholder="Describe what you built, what it does, and what AI tools you used…"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Tags (comma-separated)</label>
        <input class="form-input" id="pf-tags" type="text" placeholder="e.g. Python, GPT-4, NLP"/>
      </div>
      <div class="form-group">
        <label class="form-label">Difficulty Level</label>
        <select class="form-select" id="pf-diff">
          <option value="Beginner">Beginner (+100 XP)</option>
          <option value="Intermediate" selected>Intermediate (+150 XP)</option>
          <option value="Advanced">Advanced (+200 XP)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" id="pf-status">
          <option value="completed">Completed ✅</option>
          <option value="in-progress">In Progress 🔄</option>
        </select>
      </div>
      <div class="form-actions">
        <button class="btn-cancel-form" onclick="document.getElementById('proj-modal-overlay').remove()">Cancel</button>
        <button class="btn-submit-form" onclick="OWL.projects._handleSubmit()">Submit Project 🚀</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
  }

  function _handleSubmit() {
    var title = (document.getElementById('pf-title') || {}).value || '';
    var desc = (document.getElementById('pf-desc') || {}).value || '';
    var tags = (document.getElementById('pf-tags') || {}).value || '';
    var diff = (document.getElementById('pf-diff') || {}).value || 'Intermediate';
    var status = (document.getElementById('pf-status') || {}).value || 'completed';

    if (!title.trim()) { alert('Please enter a project title.'); return; }
    if (!desc.trim()) { alert('Please add a description.'); return; }

    var project = submitProject({ title: title.trim(), description: desc.trim(), tags: tags, difficulty: diff, status: status });
    var overlay = document.getElementById('proj-modal-overlay');
    if (overlay) overlay.remove();

    // Show success toast
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#10b981;color:#fff;padding:14px 20px;border-radius:12px;font-weight:700;font-size:.95rem;z-index:99999;box-shadow:0 4px 20px rgba(16,185,129,.4);';
    toast.textContent = '🎉 Project submitted! +' + project.xp + ' XP earned!';
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); show(); }, 2500);
  }

  /* ─── show ─── */
  function show() {
    _injectStyles();
    _ensureSeedProjects();
    var user = (OWL.state && OWL.state.user) || {};
    var userId = user.id || 'guest';
    var ideas = getProjectIdeas();
    var userProjects = _getUserProjects(userId);
    var allCommunity = _getAllProjects().filter(function(p) { return p.authorId !== userId; }).slice(0, 8);

    /* Idea cards */
    var ideasHtml = ideas.map(function(idea) {
      var tagsHtml = idea.tags.map(function(t) { return `<span class="tag-chip">${t}</span>`; }).join('');
      return `
      <div class="idea-card">
        <div class="idea-card-top">
          <div class="idea-icon">${idea.icon}</div>
          <div class="idea-info">
            <div class="idea-title">${idea.title}</div>
            <div class="idea-meta">
              <span class="diff-badge diff-${idea.difficulty}">${idea.difficulty}</span>
              <span class="xp-badge-sm">+${idea.xp} XP</span>
            </div>
          </div>
        </div>
        <div class="idea-desc">${idea.description}</div>
        <div class="idea-tags">${tagsHtml}</div>
        <div class="idea-footer">
          <span class="idea-time">⏱ ${idea.time}</span>
          <button class="btn-start-idea" onclick="OWL.projects._prefillIdeaAndShow('${idea.id}')">Start This →</button>
        </div>
      </div>`;
    }).join('');

    /* My projects */
    var myProjectsHtml = '';
    if (userProjects.length === 0) {
      myProjectsHtml = `<div class="proj-empty"><div class="proj-empty-icon">🛠️</div><p>You haven't submitted any projects yet.<br>Pick an idea above or submit your own!</p></div>`;
    } else {
      myProjectsHtml = `<div class="my-projects-grid">` + userProjects.map(renderProjectCard).join('') + `</div>`;
    }

    /* Community projects */
    var communityHtml = allCommunity.map(function(p) {
      var tagsHtml = (p.tags || []).map(function(t) { return `<span class="tag-chip">${t}</span>`; }).join('');
      return `
      <div class="community-card">
        <div class="cc-author">
          <span class="cc-avatar">${p.avatar || '👤'}</span>
          <div>
            <div class="cc-name">${p.author}</div>
            <div class="cc-date">${p.date}</div>
          </div>
        </div>
        <div class="cc-title">${p.title}</div>
        <div class="cc-desc">${p.description}</div>
        <div class="cc-tags">${tagsHtml}</div>
        <div class="cc-footer">
          <span class="cc-likes">❤️ ${p.likes} likes</span>
          <span class="cc-diff diff-badge diff-${p.difficulty}">${p.difficulty}</span>
        </div>
      </div>`;
    }).join('');

    _appContent().innerHTML = `
    <div class="projects-page">
      <div class="projects-hero">
        <h2>🛠️ Build Real AI Projects</h2>
        <p>Apply what you've learned by building actual AI projects. Earn XP, showcase your skills, and inspire the community.</p>
        <button class="btn-submit-project" onclick="OWL.projects.showSubmitForm()">+ Submit Your Project</button>
      </div>

      <div class="proj-section">
        <div class="proj-section-hdr">
          <h3>💡 Project Ideas</h3>
          <span class="proj-count-badge">${ideas.length} ideas</span>
        </div>
        <div class="ideas-grid">${ideasHtml}</div>
      </div>

      <div class="proj-section">
        <div class="proj-section-hdr">
          <h3>📁 My Projects</h3>
          <span class="proj-count-badge">${userProjects.length} submitted</span>
        </div>
        ${myProjectsHtml}
      </div>

      <div class="proj-section">
        <div class="proj-section-hdr">
          <h3>🌍 Community Projects</h3>
          <span class="proj-count-badge">${allCommunity.length} projects</span>
        </div>
        <div class="community-grid">${communityHtml}</div>
      </div>
    </div>`;
  }

  function _prefillIdeaAndShow(ideaId) {
    var ideas = getProjectIdeas();
    var idea = ideas.find(function(i) { return i.id === ideaId; });
    showSubmitForm();
    if (idea) {
      setTimeout(function() {
        var titleEl = document.getElementById('pf-title');
        var tagsEl = document.getElementById('pf-tags');
        var diffEl = document.getElementById('pf-diff');
        if (titleEl) titleEl.value = idea.title;
        if (tagsEl) tagsEl.value = idea.tags.join(', ');
        if (diffEl) diffEl.value = idea.difficulty;
      }, 50);
    }
  }

  /* ─── expose ─── */
  OWL.projects = {
    show: show,
    showSubmitForm: showSubmitForm,
    submitProject: submitProject,
    renderProjectCard: renderProjectCard,
    getProjectIdeas: getProjectIdeas,
    _handleSubmit: _handleSubmit,
    _prefillIdeaAndShow: _prefillIdeaAndShow
  };

}(window.OWL = window.OWL || {}));
