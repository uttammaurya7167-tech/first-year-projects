/* quiz.js — OwlMind AI Quest
   Exposes window.OWL.quiz
   Depends on: OWL.state, OWL.quizzes, OWL.gamification, OWL.app, OWL.ui
*/
(function (OWL) {
  'use strict';

  /* ── internal state ── */
  var _state = {
    questions: [],
    currentIndex: 0,
    answers: [],       // {questionId, selectedIndex, correct}
    lessonId: null,
    courseId: null,
    startTime: null
  };

  /* ── helpers ── */
  function _appContent() { return document.getElementById('app-content'); }

  function _shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function _injectStyles() {
    if (document.getElementById('owl-quiz-styles')) return;
    var style = document.createElement('style');
    style.id = 'owl-quiz-styles';
    style.textContent = `
/* ─── Quiz Styles ─── */
.quiz-page { max-width: 740px; margin: 0 auto; padding: 32px 16px; }

/* Header */
.quiz-header { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
.quiz-back-btn { background: none; border: 2px solid #e0e7ff; border-radius: 8px; padding: 6px 12px;
  cursor: pointer; font-size: .9rem; color: #6366f1; font-weight: 600; transition: background .2s; }
.quiz-back-btn:hover { background: #e0e7ff; }
.quiz-title { flex: 1; font-size: 1.3rem; font-weight: 800; color: #1e1b4b; }
.quiz-xp-badge { background: linear-gradient(90deg,#f59e0b,#fbbf24); color: #1e1b4b;
  font-weight: 800; font-size: .85rem; padding: 5px 14px; border-radius: 99px; }

/* Progress */
.quiz-progress-bar-wrap { height: 8px; background: #e0e7ff; border-radius: 99px; overflow: hidden; margin-bottom: 8px; }
.quiz-progress-bar { height: 100%; background: linear-gradient(90deg,#6366f1,#8b5cf6);
  border-radius: 99px; transition: width .4s cubic-bezier(.4,0,.2,1); }
.quiz-progress-label { font-size: .8rem; color: #6b7280; text-align: right; margin-bottom: 24px; }

/* Question card */
.question-card { background: #fff; border-radius: 20px; padding: 32px 36px;
  box-shadow: 0 4px 24px rgba(99,102,241,.1); border: 1px solid #e0e7ff;
  animation: qSlideIn .35s ease; }
@keyframes qSlideIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }

.question-type-badge { display: inline-block; font-size: .72rem; font-weight: 700; padding: 3px 10px;
  border-radius: 99px; margin-bottom: 14px; letter-spacing: .04em; text-transform: uppercase; }
.qtype-mcq { background: #ede9fe; color: #7c3aed; }
.qtype-tf { background: #dcfce7; color: #15803d; }
.qtype-fill { background: #fef3c7; color: #b45309; }

.question-text { font-size: 1.15rem; font-weight: 700; color: #1e1b4b; margin-bottom: 24px; line-height: 1.5; }

/* Options */
.options-list { display: flex; flex-direction: column; gap: 12px; }
.option-btn { display: flex; align-items: center; gap: 12px; background: #f8f7ff; border: 2px solid #e0e7ff;
  border-radius: 12px; padding: 14px 18px; cursor: pointer; text-align: left;
  font-size: .95rem; color: #1e1b4b; font-weight: 500; transition: all .15s; }
.option-btn:hover:not(:disabled) { border-color: #6366f1; background: #ede9fe; }
.option-btn.selected { border-color: #6366f1; background: #ede9fe; }
.option-btn.correct { border-color: #10b981; background: #dcfce7; color: #065f46; }
.option-btn.wrong { border-color: #ef4444; background: #fee2e2; color: #991b1b; }
.option-btn:disabled { cursor: default; }
.option-letter { width: 28px; height: 28px; border-radius: 50%; background: #e0e7ff;
  display: flex; align-items: center; justify-content: center; font-weight: 800;
  font-size: .82rem; flex-shrink: 0; }
.option-btn.correct .option-letter { background: #10b981; color: #fff; }
.option-btn.wrong .option-letter { background: #ef4444; color: #fff; }
.option-btn.selected:not(.correct):not(.wrong) .option-letter { background: #6366f1; color: #fff; }

/* Fill-in input */
.fill-input-wrap { display: flex; gap: 10px; }
.fill-input { flex: 1; border: 2px solid #e0e7ff; border-radius: 10px; padding: 12px 16px;
  font-size: 1rem; color: #1e1b4b; outline: none; transition: border-color .15s; }
.fill-input:focus { border-color: #6366f1; }
.fill-submit-btn { background: #6366f1; color: #fff; border: none; border-radius: 10px;
  padding: 12px 22px; font-weight: 700; cursor: pointer; font-size: .95rem; transition: opacity .2s; }
.fill-submit-btn:hover { opacity: .88; }

/* Feedback */
.feedback-box { border-radius: 12px; padding: 16px 18px; margin-top: 18px;
  display: flex; gap: 12px; align-items: flex-start; }
.feedback-box.correct-fb { background: #dcfce7; border: 1px solid #86efac; }
.feedback-box.wrong-fb { background: #fee2e2; border: 1px solid #fca5a5; }
.feedback-icon { font-size: 1.4rem; flex-shrink: 0; }
.feedback-body { flex: 1; }
.feedback-title { font-weight: 800; font-size: .95rem; margin-bottom: 4px; }
.correct-fb .feedback-title { color: #065f46; }
.wrong-fb .feedback-title { color: #991b1b; }
.feedback-explain { font-size: .88rem; color: #374151; line-height: 1.5; }
.feedback-xp { font-weight: 700; font-size: .88rem; }
.correct-fb .feedback-xp { color: #059669; }

/* Next button */
.quiz-next-btn { margin-top: 22px; width: 100%; background: linear-gradient(90deg,#6366f1,#8b5cf6);
  color: #fff; border: none; border-radius: 12px; padding: 14px; font-weight: 800;
  font-size: 1rem; cursor: pointer; transition: opacity .2s; letter-spacing: .02em; }
.quiz-next-btn:hover { opacity: .88; }

/* Results screen */
.results-page { max-width: 680px; margin: 0 auto; padding: 32px 16px; text-align: center; }
.results-emoji { font-size: 5rem; margin-bottom: 16px; }
.results-title { font-size: 2rem; font-weight: 800; color: #1e1b4b; margin-bottom: 8px; }
.results-subtitle { font-size: 1rem; color: #6b7280; margin-bottom: 28px; }
.results-score-ring { width: 140px; height: 140px; border-radius: 50%; margin: 0 auto 28px;
  background: conic-gradient(#6366f1 var(--pct), #e0e7ff 0); display: flex; align-items: center;
  justify-content: center; position: relative; }
.results-score-ring::before { content:''; position:absolute; inset: 14px; background:#fff; border-radius:50%; }
.results-score-inner { position: relative; z-index:1; text-align: center; }
.results-score-num { font-size: 1.8rem; font-weight: 900; color: #6366f1; display: block; }
.results-score-label { font-size: .7rem; color: #6b7280; font-weight: 600; }
.results-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 28px; }
.rs-card { background: #f8f7ff; border-radius: 14px; padding: 16px 10px; border: 1px solid #e0e7ff; }
.rs-val { font-size: 1.5rem; font-weight: 800; color: #6366f1; }
.rs-lbl { font-size: .75rem; color: #6b7280; margin-top: 2px; }
.results-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn-results-primary { background: linear-gradient(90deg,#6366f1,#8b5cf6); color: #fff;
  border: none; border-radius: 10px; padding: 12px 28px; font-weight: 700; cursor: pointer;
  font-size: .95rem; transition: opacity .2s; }
.btn-results-primary:hover { opacity: .88; }
.btn-results-sec { background: #fff; color: #6366f1; border: 2px solid #6366f1;
  border-radius: 10px; padding: 12px 28px; font-weight: 700; cursor: pointer;
  font-size: .95rem; transition: background .2s; }
.btn-results-sec:hover { background: #ede9fe; }
.review-list { text-align: left; margin-top: 28px; display: flex; flex-direction: column; gap: 12px; }
.review-item { background: #fff; border-radius: 12px; padding: 14px 18px;
  border-left: 4px solid #10b981; box-shadow: 0 1px 6px rgba(0,0,0,.05); }
.review-item.wrong-item { border-left-color: #ef4444; }
.review-q { font-weight: 600; font-size: .92rem; color: #1e1b4b; margin-bottom: 6px; }
.review-a { font-size: .82rem; color: #6b7280; }
.review-a span { font-weight: 600; }

/* Confetti */
.confetti-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 9999; }

/* Quiz intro screen */
.quiz-intro { background: #fff; border-radius: 20px; padding: 40px 36px; text-align: center;
  box-shadow: 0 4px 24px rgba(99,102,241,.1); border: 1px solid #e0e7ff; }
.quiz-intro-owl { font-size: 4rem; margin-bottom: 16px; }
.quiz-intro h2 { font-size: 1.6rem; font-weight: 800; color: #1e1b4b; margin-bottom: 8px; }
.quiz-intro p { color: #6b7280; margin-bottom: 24px; font-size: .95rem; }
.quiz-meta-chips { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
.qmeta-chip { background: #ede9fe; color: #7c3aed; border-radius: 99px; padding: 5px 14px; font-size: .82rem; font-weight: 600; }
.btn-start-quiz { background: linear-gradient(90deg,#6366f1,#8b5cf6); color: #fff; border: none;
  border-radius: 12px; padding: 14px 40px; font-weight: 800; font-size: 1.05rem; cursor: pointer;
  transition: opacity .2s; letter-spacing: .02em; }
.btn-start-quiz:hover { opacity: .88; }
    `;
    document.head.appendChild(style);
  }

  /* ── mock AI quiz generator ── */
  var _aiTopicBank = {
    'machine learning': [
      { id:'ai_ml_1', type:'mcq', text:'What is the primary goal of supervised learning?', options:['Cluster data without labels','Learn from labeled examples','Reduce data dimensions','Generate new data'], correct:1, explanation:'Supervised learning trains on input-output pairs to predict outputs for new inputs.' },
      { id:'ai_ml_2', type:'tf', text:'True or False: Overfitting means a model performs poorly on training data.', options:['True','False'], correct:1, explanation:'Overfitting means the model performs too well on training data but poorly on unseen data.' },
      { id:'ai_ml_3', type:'mcq', text:'Which of these is a common regularization technique?', options:['Backpropagation','Dropout','Softmax','Tokenization'], correct:1, explanation:'Dropout randomly disables neurons during training to prevent overfitting.' }
    ],
    'prompt engineering': [
      { id:'ai_pe_1', type:'mcq', text:'What is "chain-of-thought" prompting?', options:['Linking multiple API calls','Asking the model to reason step-by-step','Fine-tuning on chain data','A retrieval method'], correct:1, explanation:'Chain-of-thought prompting guides models to show intermediate reasoning steps.' },
      { id:'ai_pe_2', type:'tf', text:'True or False: Giving examples in a prompt is called few-shot prompting.', options:['True','False'], correct:0, explanation:'Providing examples within the prompt is exactly what few-shot prompting means.' },
      { id:'ai_pe_3', type:'mcq', text:'What does "temperature" control in an LLM?', options:['Processing speed','Randomness of output','Model size','Context window'], correct:1, explanation:'Temperature controls how random or deterministic the model\'s output is.' }
    ],
    'default': [
      { id:'ai_gen_1', type:'mcq', text:'What does "AI" stand for?', options:['Automated Interface','Artificial Intelligence','Algorithmic Input','Advanced Integration'], correct:1, explanation:'AI stands for Artificial Intelligence — machines simulating human-like cognition.' },
      { id:'ai_gen_2', type:'tf', text:'True or False: ChatGPT is an example of a Large Language Model (LLM).', options:['True','False'], correct:0, explanation:'ChatGPT is built on GPT, which is indeed a Large Language Model.' },
      { id:'ai_gen_3', type:'mcq', text:'Which company created the Gemini AI model?', options:['OpenAI','Anthropic','Google','Meta'], correct:2, explanation:'Gemini was developed by Google DeepMind.' }
    ]
  };

  function generateAIQuiz(topic) {
    var lc = (topic || '').toLowerCase();
    var bank = _aiTopicBank['default'];
    Object.keys(_aiTopicBank).forEach(function(key) {
      if (lc.indexOf(key) !== -1) bank = _aiTopicBank[key];
    });
    return _shuffle(bank).slice(0, 3);
  }

  /* ── render question ── */
  function renderQuestion(q, index, total) {
    var letters = ['A','B','C','D','E'];
    var typeLabel = q.type === 'tf' ? 'True / False' : q.type === 'fill' ? 'Fill in the Blank' : 'Multiple Choice';
    var typeClass = q.type === 'tf' ? 'qtype-tf' : q.type === 'fill' ? 'qtype-fill' : 'qtype-mcq';

    var optionsHtml = '';
    if (q.type === 'fill') {
      optionsHtml = `<div class="fill-input-wrap">
        <input class="fill-input" id="fill-answer" type="text" placeholder="Type your answer…" autocomplete="off"/>
        <button class="fill-submit-btn" onclick="OWL.quiz.submitAnswer('${q.id}', -1)">Submit</button>
      </div>`;
    } else {
      var opts = (q.options || []).map(function(opt, i) {
        return `<button class="option-btn" id="opt-${i}" onclick="OWL.quiz.submitAnswer('${q.id}', ${i})">
          <span class="option-letter">${letters[i]}</span>
          <span>${opt}</span>
        </button>`;
      }).join('');
      optionsHtml = `<div class="options-list">${opts}</div>`;
    }

    return `
    <div class="question-card" id="question-card">
      <span class="question-type-badge ${typeClass}">${typeLabel}</span>
      <div class="question-text">${q.text}</div>
      ${optionsHtml}
      <div id="feedback-area"></div>
      <button class="quiz-next-btn" id="next-btn" style="display:none" onclick="OWL.quiz._nextQuestion()">
        ${index + 1 < total ? 'Next Question →' : 'See Results 🎉'}
      </button>
    </div>`;
  }

  /* ── submit answer ── */
  function submitAnswer(questionId, selectedIndex) {
    var q = _state.questions.find(function(x) { return x.id === questionId; });
    if (!q) return;

    // Handle fill-in-the-blank
    if (q.type === 'fill') {
      var inp = document.getElementById('fill-answer');
      if (!inp) return;
      selectedIndex = inp.value.trim();
    }

    // Check already answered
    if (_state.answers.some(function(a) { return a.questionId === questionId; })) return;

    var isCorrect;
    if (q.type === 'fill') {
      isCorrect = (selectedIndex || '').toLowerCase() === (String(q.correct) || '').toLowerCase();
    } else {
      isCorrect = selectedIndex === q.correct;
    }

    _state.answers.push({ questionId: questionId, selectedIndex: selectedIndex, correct: isCorrect });

    // Disable options
    if (q.type !== 'fill') {
      var opts = document.querySelectorAll('.option-btn');
      opts.forEach(function(btn, i) {
        btn.disabled = true;
        if (i === q.correct) btn.classList.add('correct');
        if (i === selectedIndex && !isCorrect) btn.classList.add('wrong');
        if (i === selectedIndex) btn.classList.add('selected');
      });
    } else {
      var inp2 = document.getElementById('fill-answer');
      if (inp2) inp2.disabled = true;
      var sub = document.querySelector('.fill-submit-btn');
      if (sub) sub.disabled = true;
    }

    // Feedback
    var fb = document.getElementById('feedback-area');
    if (fb) {
      var xpGain = isCorrect ? 10 : 0;
      fb.innerHTML = `<div class="feedback-box ${isCorrect ? 'correct-fb' : 'wrong-fb'}">
        <span class="feedback-icon">${isCorrect ? '✅' : '❌'}</span>
        <div class="feedback-body">
          <div class="feedback-title">${isCorrect ? 'Correct!' : 'Not quite!'}</div>
          <div class="feedback-explain">${q.explanation || ''}</div>
          ${isCorrect ? '<div class="feedback-xp">+10 XP</div>' : ''}
        </div>
      </div>`;
    }

    // Show next button
    var nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.style.display = 'block';
  }

  /* ── next question ── */
  function _nextQuestion() {
    _state.currentIndex++;
    if (_state.currentIndex >= _state.questions.length) {
      showResults(_state.answers, _state.lessonId, _state.courseId);
    } else {
      var q = _state.questions[_state.currentIndex];
      var card = document.getElementById('question-card');
      if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateX(-40px)';
        card.style.transition = 'opacity .2s, transform .2s';
        setTimeout(function() {
          var pct = ((_state.currentIndex) / _state.questions.length) * 100;
          var pb = document.querySelector('.quiz-progress-bar');
          if (pb) pb.style.width = pct + '%';
          var pl = document.querySelector('.quiz-progress-label');
          if (pl) pl.textContent = 'Question ' + (_state.currentIndex + 1) + ' of ' + _state.questions.length;
          card.outerHTML = renderQuestion(q, _state.currentIndex, _state.questions.length);
        }, 200);
      }
    }
  }

  /* ── confetti ── */
  function _launchConfetti() {
    var canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var pieces = [];
    var colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#fff'];
    for (var i = 0; i < 180; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        w: 8 + Math.random() * 8,
        h: 6 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - .5) * 4,
        vy: 2 + Math.random() * 3,
        rot: Math.random() * 360,
        vrot: (Math.random() - .5) * 6,
        alpha: 1
      });
    }
    var frame = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(function(p) {
        p.x += p.vx; p.y += p.vy; p.rot += p.vrot;
        if (frame > 120) p.alpha = Math.max(0, p.alpha - .012);
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x + p.w/2, p.y + p.h/2);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      });
      frame++;
      if (frame < 200) requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
  }

  /* ── show results ── */
  function showResults(answers, lessonId, courseId) {
    var total = _state.questions.length;
    var correct = answers.filter(function(a) { return a.correct; }).length;
    var pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    var xpEarned = correct * 10 + (pct >= 80 ? 25 : 0); // Bonus XP for >80%
    var timeSec = Math.round((Date.now() - _state.startTime) / 1000);

    var user = (OWL.state && OWL.state.user) || {};

    // Award XP & mark complete
    if (user.id && OWL.gamification && OWL.gamification.awardXP) {
      OWL.gamification.awardXP(user.id, xpEarned, 'Quiz completed: ' + lessonId);
    }
    if (user.id && OWL.gamification && OWL.gamification.checkBadges) {
      OWL.gamification.checkBadges(user);
    }

    // Mark lesson complete in progress
    if (lessonId && courseId) {
      try {
        var user = (OWL.state && OWL.state.user) || {};
        if (user.id) {
          var key = 'owl_user_progress_' + user.id;
          var prog = JSON.parse(localStorage.getItem(key) || '{}');
          if (!prog[courseId]) prog[courseId] = { completedLessons: [], total: 10, lastLesson: null };
          if (!prog[courseId].completedLessons) prog[courseId].completedLessons = [];
          if (prog[courseId].completedLessons.indexOf(lessonId) === -1) {
            prog[courseId].completedLessons.push(lessonId);
          }
          prog[courseId].lastLesson = lessonId;
          localStorage.setItem(key, JSON.stringify(prog));
        }
      } catch(e) {}
    }

    // Record achievement
    _recordAchievement(pct, xpEarned);

    var emoji = pct >= 90 ? '🌟' : pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';
    var msg = pct >= 90 ? 'Outstanding performance!' : pct >= 80 ? 'Great job!' : pct >= 60 ? 'Good effort!' : 'Keep practicing!';

    // Build review list
    var reviewHtml = _state.questions.map(function(q, i) {
      var a = answers[i] || {};
      var correct = a.correct;
      var userAns = q.type === 'fill' ? a.selectedIndex : (q.options[a.selectedIndex] || 'No answer');
      var correctAns = q.type === 'fill' ? q.correct : (q.options[q.correct] || '');
      return `<div class="review-item ${correct ? '' : 'wrong-item'}">
        <div class="review-q">${i+1}. ${q.text}</div>
        <div class="review-a">
          Your answer: <span style="color:${correct?'#059669':'#dc2626'}">${userAns}</span>
          ${!correct ? ' · Correct: <span style="color:#059669">' + correctAns + '</span>' : ''}
        </div>
      </div>`;
    }).join('');

    _appContent().innerHTML = `
    <div class="results-page">
      <div class="results-emoji">${emoji}</div>
      <div class="results-title">${msg}</div>
      <div class="results-subtitle">You scored ${correct}/${total} on this quiz</div>
      <div class="results-score-ring" style="--pct:${pct}%">
        <div class="results-score-inner">
          <span class="results-score-num">${pct}%</span>
          <span class="results-score-label">Score</span>
        </div>
      </div>
      <div class="results-stats">
        <div class="rs-card"><div class="rs-val">+${xpEarned}</div><div class="rs-lbl">XP Earned</div></div>
        <div class="rs-card"><div class="rs-val">${correct}/${total}</div><div class="rs-lbl">Correct</div></div>
        <div class="rs-card"><div class="rs-val">${timeSec}s</div><div class="rs-lbl">Time Taken</div></div>
      </div>
      <div class="results-actions">
        <button class="btn-results-primary" onclick="OWL.app.navigate('course/${courseId || ''}')">Continue Course →</button>
        <button class="btn-results-sec" onclick="OWL.app.navigate('dashboard')">Back to Dashboard</button>
      </div>
      <div class="review-list">${reviewHtml}</div>
    </div>`;

    if (pct >= 80) {
      setTimeout(_launchConfetti, 300);
    }
  }

  function _recordAchievement(pct, xpEarned) {
    try {
      var user = (OWL.state && OWL.state.user) || {};
      if (!user.id) return;
      var key = 'owl_achievements_' + user.id;
      var ach = JSON.parse(localStorage.getItem(key) || '[]');
      ach.unshift({
        icon: pct >= 80 ? '🌟' : '📝',
        title: 'Quiz Completed — ' + pct + '% score',
        xp: xpEarned,
        time: new Date().toLocaleDateString()
      });
      ach = ach.slice(0, 20);
      localStorage.setItem(key, JSON.stringify(ach));
    } catch(e) {}
  }

  /* ── startQuiz ── */
  function startQuiz(questions, lessonId, courseId) {
    _injectStyles();
    _state.questions = questions;
    _state.currentIndex = 0;
    _state.answers = [];
    _state.lessonId = lessonId;
    _state.courseId = courseId;
    _state.startTime = Date.now();

    var q = questions[0];
    var progressPct = (0 / questions.length) * 100;
    var totalXP = questions.length * 10 + 25;

    _appContent().innerHTML = `
    <div class="quiz-page">
      <div class="quiz-header">
        <button class="quiz-back-btn" onclick="OWL.app.navigate('course/${courseId}')">← Back</button>
        <span class="quiz-title">🧠 Quiz</span>
        <span class="quiz-xp-badge">Up to +${totalXP} XP</span>
      </div>
      <div class="quiz-progress-bar-wrap">
        <div class="quiz-progress-bar" style="width:${progressPct}%"></div>
      </div>
      <div class="quiz-progress-label">Question 1 of ${questions.length}</div>
      ${renderQuestion(q, 0, questions.length)}
    </div>`;
  }

  /* ── show (intro screen) ── */
  function show(lessonId, courseId) {
    _injectStyles();

    // Get questions from quiz bank
    var quizzes = OWL.quizzes || {};
    var questions = null;

    if (lessonId && quizzes[lessonId]) {
      questions = quizzes[lessonId];
    } else if (courseId && quizzes[courseId]) {
      questions = quizzes[courseId];
    }

    // If no questions found, use AI-generated defaults
    if (!questions || !questions.length) {
      var course = (OWL.courses || []).find(function(c) { return c.id === courseId; });
      var topic = (course && course.title) || 'machine learning';
      questions = generateAIQuiz(topic);
    }

    var totalXP = questions.length * 10 + 25;
    _appContent().innerHTML = `
    <div class="quiz-page">
      <div class="quiz-intro">
        <div class="quiz-intro-owl">🧠</div>
        <h2>Ready for the Quiz?</h2>
        <p>Test your knowledge and earn XP. Answer carefully — explanations are provided after each question.</p>
        <div class="quiz-meta-chips">
          <span class="qmeta-chip">📋 ${questions.length} Questions</span>
          <span class="qmeta-chip">⭐ Up to +${totalXP} XP</span>
          <span class="qmeta-chip">💡 Explanations Included</span>
          <span class="qmeta-chip">🎉 Confetti if &gt;80%</span>
        </div>
        <button class="btn-start-quiz" onclick="OWL.quiz.startQuiz(OWL.quiz._pendingQuestions, '${lessonId}', '${courseId}')">
          Start Quiz 🚀
        </button>
      </div>
    </div>`;
    OWL.quiz._pendingQuestions = questions;
  }

  /* ─── expose ─── */
  OWL.quiz = {
    show: show,
    startQuiz: startQuiz,
    renderQuestion: renderQuestion,
    submitAnswer: submitAnswer,
    showResults: showResults,
    generateAIQuiz: generateAIQuiz,
    _nextQuestion: _nextQuestion,
    _pendingQuestions: []
  };

}(window.OWL = window.OWL || {}));
