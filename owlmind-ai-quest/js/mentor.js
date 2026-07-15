/* mentor.js — OwlMind AI Quest
   Exposes window.OWL.mentor
   Depends on: OWL.state, OWL.app
   Chat history is persisted in localStorage.
*/
(function (OWL) {
  'use strict';

  /* ─── constants ─────────────────────────────────────────────── */
  var STORAGE_KEY_PREFIX = 'owl_mentor_chat_';
  var MAX_HISTORY = 100;

  /* ─── topic knowledge base ──────────────────────────────────── */
  var _responses = [
    {
      keywords: ['what is ai','what is artificial intelligence','define ai','explain ai','ai meaning'],
      answer: "Great question! 🤖 **Artificial Intelligence (AI)** is the simulation of human intelligence by machines. It includes things like understanding language, recognizing images, making decisions, and learning from data. AI is a broad field that includes subfields like Machine Learning, Deep Learning, Computer Vision, and Natural Language Processing (NLP). Think of it as teaching computers to be smart! 🧠"
    },
    {
      keywords: ['machine learning','what is ml','ml meaning','how does ml work'],
      answer: "**Machine Learning (ML)** is a subset of AI where computers learn from data without being explicitly programmed for each task. 📊\n\nThere are 3 main types:\n• **Supervised** — Learn from labeled examples (like spam detection)\n• **Unsupervised** — Find patterns in unlabeled data (like clustering customers)\n• **Reinforcement** — Learn by trial & reward (like training a game-playing agent)\n\nML powers things like Netflix recommendations, fraud detection, and self-driving cars!"
    },
    {
      keywords: ['llm','large language model','what is llm','how llm works','transformer','gpt architecture'],
      answer: "**Large Language Models (LLMs)** are neural networks trained on massive amounts of text data to understand and generate human language. 📝\n\nThey're based on the **Transformer architecture** (introduced by Google in 2017). LLMs learn to predict the next word given context, and through this simple objective they develop rich understanding of language, facts, and reasoning.\n\nKey LLMs include: GPT-4, Claude 3, Gemini, LLaMA, Mistral. They power chatbots, code assistants, and much more!"
    },
    {
      keywords: ['prompt engineering','how to write prompts','better prompts','prompt tips','prompting'],
      answer: "**Prompt Engineering** is the art of crafting inputs to get the best outputs from AI models! ✍️\n\nHere are key techniques:\n• **Be specific** — Clear instructions beat vague ones\n• **Give examples** (few-shot) — Show the model what you want\n• **Chain-of-thought** — Ask it to 'think step by step'\n• **Role prompting** — 'You are an expert in…'\n• **Constrain output** — 'Answer in 3 bullet points'\n• **Iterate** — Refine your prompts based on results\n\nWant me to help you write a specific prompt? Just ask! 🎯"
    },
    {
      keywords: ['chatgpt','gpt-4','gpt4','openai','open ai'],
      answer: "**ChatGPT** is OpenAI's conversational AI assistant, powered by the GPT (Generative Pre-trained Transformer) models. 🤖\n\nKey facts:\n• GPT-4 is OpenAI's most capable model\n• Released to the public in November 2022 (GPT-3.5)\n• Used for writing, coding, analysis, tutoring, and more\n• Available at chat.openai.com\n• Has a free tier and a paid ChatGPT Plus tier\n\nTip: For best results, be specific in your prompts and ask it to reason step-by-step for complex tasks!"
    },
    {
      keywords: ['claude','anthropic','claude 3'],
      answer: "**Claude** is Anthropic's AI assistant, known for being helpful, harmless, and honest! 🛡️\n\nKey facts:\n• Created by Anthropic (founded by ex-OpenAI researchers)\n• Claude 3 includes Haiku (fast), Sonnet (balanced), and Opus (powerful) variants\n• Known for strong reasoning, long context handling (up to 200K tokens!), and safety focus\n• Available at claude.ai\n\nClaude is particularly great for long documents, coding, and nuanced analysis!"
    },
    {
      keywords: ['gemini','google ai','bard','google gemini'],
      answer: "**Gemini** is Google DeepMind's flagship AI model family! ✨\n\nKey facts:\n• Succeeds Google's Bard and PaLM models\n• Available in Nano, Flash, and Pro variants\n• Natively multimodal (text, images, audio, video, code)\n• Powers Google Search AI Overviews, Google Workspace features\n• Available at gemini.google.com\n\nGemini Ultra is Google's most powerful model, competing with GPT-4 and Claude 3 Opus!"
    },
    {
      keywords: ['coding','code','python','javascript','programming','debug','write code'],
      answer: "I love helping with coding! 💻 Here are some AI-powered coding tips:\n\n• **GitHub Copilot** — AI pair programmer in VS Code\n• **ChatGPT/Claude** — Great for explaining code, debugging, and generating functions\n• **Cursor** — AI-first code editor\n\nFor learning AI/ML programming:\n1. Start with **Python** (industry standard)\n2. Learn **NumPy & Pandas** for data handling\n3. Try **scikit-learn** for ML basics\n4. Explore **PyTorch or TensorFlow** for deep learning\n\nWhat specific coding question can I help with? 🐍"
    },
    {
      keywords: ['career','job','ai career','ai jobs','work in ai','ai industry','get hired'],
      answer: "Great ambition! 🚀 The AI field is booming with opportunities. Here's a roadmap:\n\n**Entry-level paths:**\n• AI/ML Engineer — Build and deploy models\n• Data Scientist — Analyze data, build predictive models\n• AI Product Manager — Define AI-powered products\n• Prompt Engineer — Optimize LLM interactions\n\n**Skills to build:**\n✅ Python programming\n✅ Statistics & linear algebra\n✅ ML frameworks (PyTorch, TensorFlow)\n✅ Cloud platforms (AWS, GCP, Azure)\n✅ Communication & problem-solving\n\n**Resources:** Complete all courses on OwlMind, contribute to open source, and build a portfolio of AI projects!"
    },
    {
      keywords: ['recommend course','which course','what should i learn','best course','start learning','beginner'],
      answer: "Welcome to your AI learning journey! 🦉 Here are my personalized recommendations:\n\n**If you're a complete beginner:**\n→ Start with **AI Fundamentals** — covers the basics of what AI is and how it works\n\n**If you want to use AI tools:**\n→ **ChatGPT & AI Tools Mastery** — learn to use AI in your daily work\n\n**If you want to build AI things:**\n→ **Machine Learning Basics** → **Python for AI** → **Deep Learning Fundamentals**\n\n**If you're interested in LLMs:**\n→ **Prompt Engineering** is the perfect starting point!\n\nCheck the Courses page to see all available courses. Want more specific advice? Tell me your goals! 🎯"
    },
    {
      keywords: ['deep learning','neural network','neural net','cnn','rnn','lstm','attention'],
      answer: "**Deep Learning** is a subset of ML using multi-layered artificial neural networks! 🧠\n\nKey architectures:\n• **CNN (Convolutional)** — Image recognition, computer vision\n• **RNN/LSTM** — Sequential data, early NLP\n• **Transformer** — Modern NLP, the backbone of all LLMs\n• **GAN** — Generate realistic images, videos\n• **Diffusion Models** — Stable Diffusion, DALL-E, Midjourney\n\nDeep learning requires large datasets and significant compute (GPUs), but it's behind most AI breakthroughs including AlphaGo, GPT, and image generation!"
    },
    {
      keywords: ['natural language processing','nlp','text','sentiment','summarize','translation'],
      answer: "**Natural Language Processing (NLP)** is AI's ability to understand and generate human language! 📖\n\nCommon NLP tasks:\n• **Sentiment Analysis** — Is this review positive or negative?\n• **Summarization** — Condense a long document\n• **Translation** — Convert between languages\n• **Question Answering** — Answer questions from text\n• **Named Entity Recognition** — Find people, places, dates\n• **Text Generation** — Write new content\n\nModern NLP is dominated by Transformer-based models like BERT, GPT, T5, and their descendants. LLMs are essentially extremely powerful NLP systems!"
    },
    {
      keywords: ['badge','xp','points','reward','gamification','level up','achievement'],
      answer: "You're asking about the OwlMind gamification system! 🏆\n\nHere's how to earn rewards:\n• **Complete lessons** — XP for each lesson finished\n• **Pass quizzes** — 10 XP per correct answer + 25 XP bonus if >80%\n• **Daily streak** — Keep learning daily to maintain your streak 🔥\n• **Submit projects** — 100-200 XP for project submissions\n• **Earn badges** — Special achievements for milestones\n\nCheck your Dashboard to see your current XP, level, and badges. Aim for the top of the Leaderboard! 🥇"
    },
    {
      keywords: ['hi','hello','hey','good morning','good evening','howdy','sup','greetings'],
      answer: "Hello! 👋 I'm the OwlMind AI Mentor — your personal AI learning assistant! 🦉\n\nI'm here to help you with:\n• Understanding AI concepts (ML, LLMs, NLP, etc.)\n• Prompt engineering tips\n• Course recommendations\n• Career advice for the AI field\n• Coding questions\n• Any AI-related questions!\n\nWhat would you like to learn today? You can also click the suggested topic chips below!"
    },
    {
      keywords: ['thank','thanks','great','awesome','perfect','helpful','good job'],
      answer: "You're very welcome! 😊 That's what I'm here for! Keep up the great learning momentum. Remember, every lesson completed and quiz passed brings you closer to mastering AI! 🚀\n\nIs there anything else I can help you with? You can always check back for more questions!"
    }
  ];

  var _fallbackResponses = [
    "That's an interesting question! 🤔 While I might not have a specific answer ready, I'd suggest exploring the **Courses** section for structured learning on that topic. You can also try asking more specifically about AI, machine learning, prompt engineering, or career advice!",
    "Hmm, I'm not sure about that one, but I'm always learning! 🦉 For the best answer, I'd recommend checking the course materials or the community projects. In the meantime, is there an AI-related topic I can help clarify?",
    "Great curiosity! 🌟 That's a bit outside my current knowledge base, but you might find answers in the course lessons or by submitting a project about it. For AI topics like machine learning, LLMs, or prompt engineering — I'm your owl! 🦉"
  ];

  var _fallbackIndex = 0;

  /* ─── response engine ───────────────────────────────────────── */
  function generateResponse(userMessage) {
    var lc = (userMessage || '').toLowerCase().trim();
    for (var i = 0; i < _responses.length; i++) {
      var item = _responses[i];
      for (var j = 0; j < item.keywords.length; j++) {
        if (lc.indexOf(item.keywords[j]) !== -1) {
          return item.answer;
        }
      }
    }
    // Fallback
    var fb = _fallbackResponses[_fallbackIndex % _fallbackResponses.length];
    _fallbackIndex++;
    return fb;
  }

  /* ─── suggested topics ──────────────────────────────────────── */
  function suggestTopics() {
    return [
      'What is AI?',
      'How does machine learning work?',
      'Explain LLMs to me',
      'Tips for prompt engineering',
      'ChatGPT vs Claude vs Gemini',
      'How to start an AI career?',
      'Recommend a course for me',
      'What is deep learning?'
    ];
  }

  /* ─── persistence ───────────────────────────────────────────── */
  function _getHistory(userId) {
    try {
      var raw = localStorage.getItem(STORAGE_KEY_PREFIX + (userId || 'guest'));
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function _saveHistory(userId, history) {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + (userId || 'guest'), JSON.stringify(history.slice(-MAX_HISTORY)));
    } catch (e) {}
  }

  /* ─── styles ────────────────────────────────────────────────── */
  function _injectStyles() {
    if (document.getElementById('owl-mentor-styles')) return;
    var style = document.createElement('style');
    style.id = 'owl-mentor-styles';
    style.textContent = `
/* ─── Mentor Chat Page ─── */
.mentor-page { max-width: 860px; margin: 0 auto; padding: 24px 16px; display: flex; flex-direction: column; height: calc(100vh - 80px); }
.mentor-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; flex-shrink: 0; }
.mentor-owl-avatar { width: 52px; height: 52px; background: linear-gradient(135deg,#4c1d95,#6366f1);
  border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
  box-shadow: 0 4px 12px rgba(99,102,241,.3); flex-shrink: 0; }
.mentor-header-info { flex: 1; }
.mentor-header-name { font-size: 1.2rem; font-weight: 800; color: #1e1b4b; margin: 0 0 2px; }
.mentor-header-status { font-size: .8rem; color: #10b981; display: flex; align-items: center; gap: 5px; }
.mentor-status-dot { width: 7px; height: 7px; background: #10b981; border-radius: 50%; display: inline-block; }
.mentor-clear-btn { background: none; border: 2px solid #e0e7ff; border-radius: 8px; padding: 6px 14px;
  color: #6b7280; cursor: pointer; font-size: .82rem; font-weight: 600; transition: all .15s; }
.mentor-clear-btn:hover { border-color: #6366f1; color: #6366f1; }

/* Chat window */
.chat-window { flex: 1; overflow-y: auto; background: #f8f7ff; border-radius: 16px;
  border: 1px solid #e0e7ff; padding: 20px 16px; display: flex; flex-direction: column;
  gap: 16px; margin-bottom: 12px; scroll-behavior: smooth; }
.chat-window::-webkit-scrollbar { width: 6px; }
.chat-window::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 99px; }

/* Bubbles */
.msg-row { display: flex; gap: 10px; align-items: flex-end; }
.msg-row.user-row { flex-direction: row-reverse; }
.msg-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg,#4c1d95,#6366f1);
  display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
.msg-avatar.user-avatar { background: linear-gradient(135deg,#6366f1,#a78bfa); }
.msg-bubble { max-width: 75%; padding: 12px 16px; border-radius: 18px; font-size: .92rem; line-height: 1.55; }
.owl-bubble { background: #fff; color: #1e1b4b; border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,.06); border: 1px solid #e0e7ff; }
.user-bubble { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff;
  border-bottom-right-radius: 4px; box-shadow: 0 2px 8px rgba(99,102,241,.2); }
.msg-bubble strong { font-weight: 700; }
.msg-time { font-size: .68rem; color: #9ca3af; margin-top: 4px; text-align: right; }
.user-row .msg-time { text-align: left; }

/* Typing indicator */
.typing-indicator { display: flex; gap: 4px; align-items: center; padding: 8px 16px; }
.typing-dot { width: 7px; height: 7px; background: #6366f1; border-radius: 50%;
  animation: typingBounce .9s infinite ease-in-out; }
.typing-dot:nth-child(2) { animation-delay: .15s; }
.typing-dot:nth-child(3) { animation-delay: .3s; }
@keyframes typingBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }

/* Suggestions */
.suggestions-area { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; flex-shrink: 0; }
.suggest-chip { background: #ede9fe; color: #7c3aed; border: none; border-radius: 99px;
  padding: 6px 14px; font-size: .8rem; font-weight: 600; cursor: pointer; transition: background .15s, transform .15s; }
.suggest-chip:hover { background: #ddd6fe; transform: translateY(-1px); }

/* Input area */
.chat-input-area { display: flex; gap: 10px; flex-shrink: 0; }
.chat-input { flex: 1; border: 2px solid #e0e7ff; border-radius: 12px; padding: 13px 16px;
  font-size: .95rem; color: #1e1b4b; outline: none; resize: none; font-family: inherit;
  transition: border-color .15s; line-height: 1.4; }
.chat-input:focus { border-color: #6366f1; }
.chat-send-btn { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border: none;
  border-radius: 12px; padding: 13px 20px; cursor: pointer; font-size: 1.1rem; flex-shrink: 0;
  transition: opacity .2s; display: flex; align-items: center; justify-content: center; }
.chat-send-btn:hover { opacity: .88; }
.chat-send-btn:disabled { opacity: .5; cursor: default; }

/* Markdown-like rendering */
.owl-bubble p { margin: 0 0 6px; }
.owl-bubble p:last-child { margin: 0; }
.owl-bubble ul { margin: 6px 0; padding-left: 20px; }
.owl-bubble li { margin-bottom: 3px; }
    `;
    document.head.appendChild(style);
  }

  /* ─── markdown-lite renderer ─── */
  function _renderText(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/→/g, '<span style="color:#6366f1">→</span>')
      .replace(/✅|✓/g, '<span style="color:#10b981">$&</span>')
      .replace(/\n• /g, '</p><ul><li>')
      .replace(/• /g, '<li>')
      .replace(/\n/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      .replace(/<\/ul><\/p>/g, '</ul>')
      .replace(/<p><\/p>/g, '');
  }

  function _timeStr() {
    var d = new Date();
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  }

  /* ─── append message ─── */
  function _appendMsg(who, text, history, userId) {
    var chatWindow = document.getElementById('mentor-chat-window');
    if (!chatWindow) return;

    var row = document.createElement('div');
    row.className = 'msg-row' + (who === 'user' ? ' user-row' : '');
    var avatarHtml = who === 'user'
      ? '<div class="msg-avatar user-avatar">👤</div>'
      : '<div class="msg-avatar">🦉</div>';

    var bubbleClass = who === 'user' ? 'user-bubble' : 'owl-bubble';
    var content = who === 'owl' ? _renderText(text) : _escapeHtml(text);

    row.innerHTML = avatarHtml + `
      <div>
        <div class="msg-bubble ${bubbleClass}">${content}</div>
        <div class="msg-time">${_timeStr()}</div>
      </div>`;
    chatWindow.appendChild(row);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Save to history
    history.push({ who: who, text: text, time: _timeStr() });
    _saveHistory(userId, history);
  }

  function _escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ─── typing animation ─── */
  function _showTyping() {
    var chatWindow = document.getElementById('mentor-chat-window');
    if (!chatWindow) return;
    var el = document.createElement('div');
    el.className = 'msg-row';
    el.id = 'typing-row';
    el.innerHTML = `<div class="msg-avatar">🦉</div>
      <div class="msg-bubble owl-bubble">
        <div class="typing-indicator">
          <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
      </div>`;
    chatWindow.appendChild(el);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function _hideTyping() {
    var el = document.getElementById('typing-row');
    if (el) el.remove();
  }

  /* ─── sendMessage ─── */
  var _sending = false;
  function sendMessage(text) {
    if (_sending) return;
    text = (text || '').trim();
    if (!text) return;
    _sending = true;

    var user = (OWL.state && OWL.state.user) || {};
    var userId = user.id || 'guest';
    var history = _getHistory(userId);

    // Clear input
    var inp = document.getElementById('mentor-input');
    if (inp) inp.value = '';
    var sendBtn = document.getElementById('mentor-send-btn');
    if (sendBtn) sendBtn.disabled = true;

    // Add user message
    _appendMsg('user', text, history, userId);

    // Simulate AI thinking delay
    _showTyping();
    var delay = 600 + Math.random() * 900;
    setTimeout(function() {
      _hideTyping();
      var response = generateResponse(text);
      _appendMsg('owl', response, history, userId);
      _sending = false;
      if (sendBtn) sendBtn.disabled = false;
    }, delay);
  }

  /* ─── clearChat ─── */
  function clearChat() {
    var user = (OWL.state && OWL.state.user) || {};
    var userId = user.id || 'guest';
    localStorage.removeItem(STORAGE_KEY_PREFIX + userId);
    var chatWindow = document.getElementById('mentor-chat-window');
    if (chatWindow) {
      chatWindow.innerHTML = '';
      // Re-add greeting
      var history = [];
      _appendMsg('owl', "Chat cleared! 🧹 How can I help you today? Feel free to ask anything about AI, machine learning, or your learning journey!", history, userId);
    }
  }

  /* ─── show ─── */
  function show() {
    _injectStyles();

    var user = (OWL.state && OWL.state.user) || {};
    var userId = user.id || 'guest';
    var history = _getHistory(userId);
    var topics = suggestTopics();

    var appContent = document.getElementById('app-content');

    var suggestChips = topics.map(function(t) {
      return `<button class="suggest-chip" onclick="OWL.mentor.sendMessage('${t.replace(/'/g,"\\'")}')">
        ${t}
      </button>`;
    }).join('');

    appContent.innerHTML = `
    <div class="mentor-page">
      <div class="mentor-header">
        <div class="mentor-owl-avatar">🦉</div>
        <div class="mentor-header-info">
          <div class="mentor-header-name">OwlMind AI Mentor</div>
          <div class="mentor-header-status">
            <span class="mentor-status-dot"></span>
            Online — Ask me anything about AI!
          </div>
        </div>
        <button class="mentor-clear-btn" onclick="OWL.mentor.clearChat()">Clear Chat 🗑️</button>
      </div>

      <div class="chat-window" id="mentor-chat-window"></div>

      <div class="suggestions-area" id="suggest-area">${suggestChips}</div>

      <div class="chat-input-area">
        <textarea class="chat-input" id="mentor-input" rows="1"
          placeholder="Ask me anything about AI, prompts, courses, or career advice…"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();OWL.mentor._onSend();}"
          oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'"></textarea>
        <button class="chat-send-btn" id="mentor-send-btn" onclick="OWL.mentor._onSend()">➤</button>
      </div>
    </div>`;

    // Populate history
    var chatWindow = document.getElementById('mentor-chat-window');
    if (history.length === 0) {
      var greeting = "Hey there! 👋 I'm **Owly**, your AI learning mentor! I'm here to help you understand AI concepts, get course recommendations, master prompt engineering, and plan your AI career.\n\nWhat would you like to learn today?";
      _appendMsg('owl', greeting, history, userId);
    } else {
      // Replay history
      history.forEach(function(msg) {
        var row = document.createElement('div');
        row.className = 'msg-row' + (msg.who === 'user' ? ' user-row' : '');
        var avatarHtml = msg.who === 'user'
          ? '<div class="msg-avatar user-avatar">👤</div>'
          : '<div class="msg-avatar">🦉</div>';
        var bubbleClass = msg.who === 'user' ? 'user-bubble' : 'owl-bubble';
        var content = msg.who === 'owl' ? _renderText(msg.text) : _escapeHtml(msg.text);
        row.innerHTML = avatarHtml + `
          <div>
            <div class="msg-bubble ${bubbleClass}">${content}</div>
            <div class="msg-time">${msg.time || ''}</div>
          </div>`;
        chatWindow.appendChild(row);
      });
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }

  function _onSend() {
    var inp = document.getElementById('mentor-input');
    if (inp) sendMessage(inp.value);
  }

  /* ─── expose ─── */
  OWL.mentor = {
    show: show,
    sendMessage: sendMessage,
    generateResponse: generateResponse,
    clearChat: clearChat,
    suggestTopics: suggestTopics,
    _onSend: _onSend
  };

}(window.OWL = window.OWL || {}));
