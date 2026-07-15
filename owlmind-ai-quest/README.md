# 🦉 OwlMind AI Quest

A gamified, interactive learning portal and developer challenge quest dashboard. The project features a frontend interface built on HTML5/CSS/JS (ready for Next.js restructuring) paired with a robust Python-based Netlify API deployment automation script.

---

## 🏗️ Architecture & Deployment Automation

```
              ┌──────────────────────────────────────────────┐
              │             OwlMind AI Quest                 │
              │  (HTML5/CSS/JS - Next.js compatible app)     │
              └──────────────────────┬───────────────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │    Netlify Deployer     │ (deploy_netlify.py)
                        └────────────┬────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │   Netlify API Gateway   │
                        └────────────┬────────────┘
                                     │ (Uploads zip, monitors status)
                        ┌────────────▼────────────┐
                        │       Live Website      │
                        └─────────────────────────┘
```

### 1. The Learning Dashboard
* Contains gamified components tracking coding achievements, certificates, challenges, and leaderboards.
* Leverages CSS transitions and animations to create a responsive, fluid learner user experience.
* Includes custom course database files (`courses.js`) and modular quiz handlers (`quiz.js`).

### 2. Netlify Deployment Automation Pipeline (`deploy_netlify.py`)
Provides an automated CLI tool to bundle and push updates directly to Netlify hosting servers without requiring Node CLI overhead:
* **Directory Compactor**: Dynamically scans the workspace directory, zipping assets while automatically excluding `.git`, `node_modules`, and the `automation/` folder itself to minimize payload size.
* **Zip Deployment Payload**: Posts binary data directly to Netlify's site deploys endpoint.
* **Asynchronous Polling**: Tracks the deployment status across state transitions:
  `processing` ➔ `uploaded` ➔ `ready`.
* **Persisted Site State**: Caches the Netlify `site_id` and `ssl_url` in a local `netlify_state.json` file. Subsequent runs update the existing site instead of creating duplicates.

---

## 📦 Project Layout

```
owlmind-ai-quest/
├── index.html                  # Gamified learner landing page
├── package.json                # Project script registry
│
├── css/                        # Responsive stylesheet design system
│   ├── design-system.css       # Visual tokens & colors
│   ├── components.css          # Cards, achievements, badges
│   ├── pages.css               # Section layout overrides
│   └── animations.css          # Interactive hover states and transitions
│
├── js/                         # Interface controller code
│   ├── app.js                  # Main dashboard state router
│   ├── auth.js                 # Authentication simulators
│   ├── quiz.js                 # Quiz controllers and timer systems
│   ├── teacher.js              # Educator dashboards
│   ├── gamification.js         # XP, Level and badge awarders
│   │
│   └── data/                   # JSON schemas
│       ├── courses.js          # Course modules list
│       └── quizzes.js          # Quiz question repositories
│
└── automation/                 # Devops automation engine
    ├── deploy_netlify.py       # Python site packager and deploy pipeline
    └── netlify_state.json      # Local cached deployment records
```

---

## 🚀 Setup & Execution

### Deploying to Netlify
1. Set up your Netlify credentials. Get a Personal Access Token from your Netlify account settings.
2. Run the deployment script:
   ```bash
   python automation/deploy_netlify.py
   ```
   *The script will prompt you for the token if it is not found in your environment variables. It will output the live URL upon completion.*
