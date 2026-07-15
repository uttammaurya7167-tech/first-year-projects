/* badges.js — OwlMind AI Quest */
window.OWL = window.OWL || {};

window.OWL.badges = [
  {
    id: 'first-lesson',
    name: 'First Step',
    description: 'Complete your very first lesson',
    icon: '🌟',
    rarity: 'common',
    condition: { type: 'lessons_completed', value: 1 },
    xpBonus: 25
  },
  {
    id: 'ai-explorer',
    name: 'AI Explorer',
    description: 'Complete 5 lessons across any tracks',
    icon: '🔭',
    rarity: 'common',
    condition: { type: 'lessons_completed', value: 5 },
    xpBonus: 50
  },
  {
    id: 'quiz-ace',
    name: 'Quiz Ace',
    description: 'Answer 10 quiz questions correctly',
    icon: '🎯',
    rarity: 'common',
    condition: { type: 'correct_answers', value: 10 },
    xpBonus: 50
  },
  {
    id: 'streak-3',
    name: 'On Fire!',
    description: 'Maintain a 3-day learning streak',
    icon: '🔥',
    rarity: 'common',
    condition: { type: 'streak', value: 3 },
    xpBonus: 30
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '⚡',
    rarity: 'rare',
    condition: { type: 'streak', value: 7 },
    xpBonus: 100
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day learning streak',
    icon: '🌙',
    rarity: 'epic',
    condition: { type: 'streak', value: 30 },
    xpBonus: 500
  },
  {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reach Level 5',
    icon: '⭐',
    rarity: 'common',
    condition: { type: 'level', value: 5 },
    xpBonus: 75
  },
  {
    id: 'level-10',
    name: 'AI Apprentice',
    description: 'Reach Level 10',
    icon: '💫',
    rarity: 'rare',
    condition: { type: 'level', value: 10 },
    xpBonus: 150
  },
  {
    id: 'level-25',
    name: 'AI Expert',
    description: 'Reach Level 25 — you\'re a true AI practitioner',
    icon: '🏅',
    rarity: 'epic',
    condition: { type: 'level', value: 25 },
    xpBonus: 500
  },
  {
    id: 'prompt-master',
    name: 'Prompt Master',
    description: 'Complete the Prompt Engineering course',
    icon: '✍️',
    rarity: 'rare',
    condition: { type: 'course_completed', value: 'prompt-engineering' },
    xpBonus: 200
  },
  {
    id: 'automation-wizard',
    name: 'Automation Wizard',
    description: 'Complete the Automation course',
    icon: '⚙️',
    rarity: 'rare',
    condition: { type: 'course_completed', value: 'automation' },
    xpBonus: 200
  },
  {
    id: 'vibe-coder',
    name: 'Vibe Coder',
    description: 'Complete the Vibe Coding course',
    icon: '💻',
    rarity: 'rare',
    condition: { type: 'course_completed', value: 'vibe-coding' },
    xpBonus: 200
  },
  {
    id: 'first-project',
    name: 'Builder',
    description: 'Submit your first AI project',
    icon: '🔨',
    rarity: 'common',
    condition: { type: 'projects_submitted', value: 1 },
    xpBonus: 100
  },
  {
    id: 'first-cert',
    name: 'Graduate',
    description: 'Earn your first certificate',
    icon: '🎓',
    rarity: 'rare',
    condition: { type: 'certificates_earned', value: 1 },
    xpBonus: 150
  },
  {
    id: 'ai-entrepreneur',
    name: 'AI Entrepreneur',
    description: 'Complete ALL 8 AI learning tracks',
    icon: '🚀',
    rarity: 'legendary',
    condition: { type: 'courses_completed', value: 8 },
    xpBonus: 1000
  }
];
