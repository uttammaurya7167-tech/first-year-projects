window.OWL = window.OWL || {};

window.OWL.courses = [
  {
    id: 'ai-foundations',
    title: 'AI Foundations',
    icon: '🧠',
    color: '#4F46E5',
    description: 'Master the core concepts of artificial intelligence — from what AI actually is to how large language models work, and how to use AI responsibly and ethically.',
    level: 'Beginner',
    totalXP: 200,
    lessons: [
      {
        id: 'what-is-ai',
        title: 'What is AI?',
        duration: '8 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Artificial Intelligence (AI) is the field of computer science dedicated to building systems that can perform tasks that normally require human intelligence. These tasks include understanding language, recognizing images, making decisions, and learning from experience. Unlike traditional software that follows rigid rules, AI systems learn patterns from data.'
            },
            {
              type: 'highlight',
              body: '💡 Key Insight: AI is not magic — it\'s sophisticated pattern matching. A model trained on millions of cat photos learns to identify patterns (pointy ears, whiskers, fur) that define a "cat". The same principle applies to language, images, and more.'
            },
            {
              type: 'list',
              items: [
                '🤖 Narrow AI: Excels at one specific task (e.g., chess-playing, spam detection, image recognition)',
                '🌐 General AI (AGI): Hypothetical AI that matches human-level reasoning across all domains — does not yet exist',
                '🚀 Superintelligence: AI that surpasses human intelligence — purely theoretical today',
                '🧩 Machine Learning (ML): A subset of AI where systems learn from data without explicit programming',
                '🔮 Deep Learning: A subset of ML using neural networks with many layers, powering most modern AI'
              ]
            },
            {
              type: 'example',
              title: 'Real World AI You Use Daily',
              body: 'When Netflix recommends a movie, that\'s a recommendation AI analyzing your watch history. When Gmail marks an email as spam, that\'s a classification model. When your phone unlocks with your face, that\'s computer vision. When you ask Siri a question, that\'s natural language processing. AI is already embedded in your daily life — modern AI assistants like ChatGPT, Claude, and Gemini are just the most visible examples of this technology.'
            }
          ]
        }
      },
      {
        id: 'llm-basics',
        title: 'How LLMs Work',
        duration: '10 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Large Language Models (LLMs) are AI systems trained on enormous amounts of text to understand and generate human language. Models like GPT-4, Claude, and Gemini have been trained on hundreds of billions of words from books, websites, code, and research papers. They learn the statistical patterns of language — which words follow which other words — at an incredibly deep level.'
            },
            {
              type: 'highlight',
              body: '🔑 How it works: LLMs use a "transformer" architecture. They break text into tokens (roughly word-pieces), convert them to numerical vectors, and use "attention" mechanisms to understand how each word relates to every other word in context. They then predict the most likely next token, one at a time.'
            },
            {
              type: 'list',
              items: [
                '📚 Pre-training: The model reads massive datasets and learns to predict missing words — this is unsupervised learning',
                '🎯 Fine-tuning: The model is further trained on curated examples to be helpful, harmless, and honest',
                '👥 RLHF: Reinforcement Learning from Human Feedback — humans rate outputs, teaching the model what "good" responses look like',
                '🪙 Tokens: LLMs don\'t see words, they see tokens (~4 characters each). "Unbelievable" = 3-4 tokens',
                '📏 Context Window: How much text the model can "remember" at once — GPT-4 can hold ~128K tokens in context'
              ]
            },
            {
              type: 'example',
              title: 'Why LLMs Sometimes Hallucinate',
              body: 'LLMs generate text by predicting what comes next, based on patterns. They don\'t "look things up" in real time (unless given tools). If asked about a very rare fact they didn\'t see in training, they may confidently generate a plausible-sounding but incorrect answer. This is called "hallucination." Always verify critical facts from LLM outputs using primary sources.'
            }
          ]
        }
      },
      {
        id: 'responsible-ai',
        title: 'Using AI Responsibly',
        duration: '9 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'As AI becomes more powerful and embedded in society, using it responsibly becomes a critical skill. Responsible AI use means understanding limitations, being transparent when AI was used, protecting privacy, and ensuring AI outputs don\'t cause harm. This isn\'t just for developers — it applies to everyone who uses AI tools.'
            },
            {
              type: 'highlight',
              body: '⚠️ The Golden Rule of AI Use: Always verify critical information from AI outputs. AI is a powerful assistant, not an infallible oracle. Medical, legal, financial, and safety-critical decisions should always involve qualified human experts.'
            },
            {
              type: 'list',
              items: [
                '🔒 Privacy: Never input sensitive personal data (SSNs, passwords, medical records) into public AI tools',
                '✅ Verification: Fact-check AI-generated content before sharing or publishing it',
                '🏷️ Transparency: Disclose AI assistance where required (academic work, journalism, legal documents)',
                '♻️ Over-reliance: Use AI to augment your thinking, not replace it — preserve your own critical thinking skills',
                '🌍 Environmental Impact: Large AI models consume significant energy — use AI purposefully, not frivolously'
              ]
            },
            {
              type: 'example',
              title: 'A Responsible AI Workflow',
              body: 'Instead of: "ChatGPT, write my entire report for me." Try: "I\'m writing a report on climate change. Can you help me outline the key arguments and suggest credible sources I should research?" Then you research those sources, verify the information, write the report yourself, and use AI to help refine your draft. This gives you the speed benefits of AI while maintaining accuracy and developing your own expertise.'
            }
          ]
        }
      },
      {
        id: 'ai-ethics',
        title: 'AI Ethics & Bias',
        duration: '11 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'AI systems can encode and amplify biases present in their training data. A hiring algorithm trained on historical resumes might learn to discriminate against women if men were historically more likely to be hired. A facial recognition system trained mostly on light-skinned faces may perform poorly on darker skin tones. Understanding AI bias is essential for building and using fair AI systems.'
            },
            {
              type: 'highlight',
              body: '⚖️ Bias isn\'t always intentional: Most AI bias comes from historical data that reflects past human biases. The model simply learns what was, not what should be. This is why diverse training data and ongoing auditing are critical components of ethical AI development.'
            },
            {
              type: 'list',
              items: [
                '📊 Data Bias: Training data that over- or under-represents certain groups leads to unequal performance',
                '🔄 Feedback Loops: Biased AI decisions create biased outcomes, which feed back into future training data',
                '🚔 High-Stakes AI: Facial recognition, predictive policing, and credit scoring carry significant societal risk',
                '🌐 Explainability: "Black box" AI makes it hard to audit decisions — explainable AI (XAI) is an active research field',
                '📋 AI Governance: The EU AI Act, US AI Executive Order, and other regulations are emerging to address these concerns'
              ]
            },
            {
              type: 'example',
              title: 'The COMPAS Recidivism Algorithm',
              body: 'COMPAS was an AI tool used in US courts to predict recidivism (re-offending) risk to inform sentencing decisions. Investigative journalism by ProPublica found it was twice as likely to falsely flag Black defendants as future criminals compared to white defendants. This case became a landmark example of algorithmic bias in high-stakes settings. It shows why AI systems making consequential decisions about people\'s lives require rigorous auditing, transparency, and human oversight.'
            }
          ]
        }
      }
    ]
  },

  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering',
    icon: '✍️',
    color: '#7C3AED',
    description: 'Learn the art and science of communicating with AI. Master techniques from basic prompting to advanced strategies that unlock the full potential of any AI model.',
    level: 'Beginner',
    totalXP: 250,
    lessons: [
      {
        id: 'beginner-prompting',
        title: 'Your First Great Prompt',
        duration: '8 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'A prompt is the instruction you give to an AI model. The quality of your prompt directly determines the quality of the output. Vague prompts get vague answers. Specific, detailed prompts get precise, useful responses. Prompt engineering is the skill of crafting inputs that reliably produce excellent AI outputs.'
            },
            {
              type: 'highlight',
              body: '🎯 The CLEAR Framework: Context (background info), Length (desired output length), Examples (show don\'t just tell), Action (exact task verb), Result (desired format/style). Use this checklist to upgrade any weak prompt.'
            },
            {
              type: 'list',
              items: [
                '❌ Weak: "Write about climate change" → AI writes a generic essay',
                '✅ Strong: "Write a 300-word explainer on how rising sea levels affect coastal cities, for a 12-year-old audience, using one relatable analogy"',
                '📋 Include format: Specify bullet points, tables, numbered lists, code blocks, or prose',
                '🎭 Specify audience: "for a beginner", "for an expert", "for a 10-year-old" dramatically changes output quality',
                '🔁 Iterate: Treat prompting as a conversation. Refine based on output, don\'t expect perfection first try'
              ]
            },
            {
              type: 'example',
              title: 'Prompt Transformation Exercise',
              body: 'Bad prompt: "Help me with my email." Good prompt: "Rewrite the following email to be more professional and concise. Keep it under 100 words, maintain a friendly but assertive tone, and ensure the call-to-action is clear. Original email: [paste email here]." The good prompt defines the task (rewrite), constraints (100 words), style (professional, friendly), and goal (clear CTA). This specificity is what separates expert prompt engineers from casual AI users.'
            }
          ]
        }
      },
      {
        id: 'role-prompting',
        title: 'Role & Persona Prompting',
        duration: '9 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Role prompting involves assigning a specific persona or expertise to the AI before asking your question. By telling the AI to act as a domain expert, it draws more heavily on knowledge and communication patterns from that domain. This technique dramatically improves the relevance and depth of AI responses for specialized topics.'
            },
            {
              type: 'highlight',
              body: '🎭 Role prompting syntax: "You are a [role] with [X years] of experience in [domain]. Your communication style is [style]. You specialize in [specifics]." The more detailed the role definition, the more calibrated the response.'
            },
            {
              type: 'list',
              items: [
                '👨‍⚕️ Medical: "Act as a doctor explaining a diagnosis to a patient in simple terms"',
                '💼 Business: "You are a McKinsey consultant. Analyze this business problem using a structured framework"',
                '🧑‍🏫 Education: "You are a patient high school teacher. Explain calculus to a struggling student"',
                '🔍 Critic: "You are a skeptical editor. Find weaknesses and logical gaps in this argument"',
                '⚠️ Limitation: Roles don\'t give AI real credentials — a "doctor" role still can\'t replace actual medical advice'
              ]
            },
            {
              type: 'example',
              title: 'Role Prompt in Action',
              body: 'Without role: "What\'s wrong with my business plan?" — gets generic feedback. With role: "You are a Series A venture capitalist who has reviewed 500+ startup pitches. Review my business plan from an investor\'s perspective. Be critical. Identify the top 3 weaknesses that would cause you to pass on this investment, and suggest specific improvements." This generates investor-calibrated, actionable critique instead of polite generalities.'
            }
          ]
        }
      },
      {
        id: 'few-shot-prompting',
        title: 'Few-Shot & Chain-of-Thought',
        duration: '10 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Few-shot prompting means providing examples of the desired input-output pattern before your actual request. Instead of describing what you want, you show the AI 2-5 examples of it. This is one of the most powerful techniques for getting consistent, format-perfect outputs from AI models.'
            },
            {
              type: 'highlight',
              body: '🧠 Chain-of-Thought (CoT): Adding "Think step by step" or showing reasoning steps in your examples dramatically improves AI performance on math, logic, and complex reasoning tasks. CoT forces the model to reason before concluding.'
            },
            {
              type: 'list',
              items: [
                '0-shot: Just the question — good for simple tasks',
                '1-shot: One example before your question — good for format matching',
                'Few-shot (2-5): Multiple examples — best for complex patterns and consistency',
                '🔗 Chain-of-Thought: Examples include reasoning steps, not just answers',
                '📐 Use cases: Data transformation, sentiment analysis, classification, code review with consistent format'
              ]
            },
            {
              type: 'example',
              title: 'Few-Shot for Consistent Data Extraction',
              body: 'Task: Extract structured data from messy text.\n\nExample 1:\nInput: "John Smith joined us last Tuesday for the 3pm meeting"\nOutput: {name: "John Smith", date: "last Tuesday", time: "3pm", event: "meeting"}\n\nExample 2:\nInput: "Sarah will present her quarterly review on the 15th at 10am"\nOutput: {name: "Sarah", date: "the 15th", time: "10am", event: "quarterly review"}\n\nNow extract: "Dr. Chen has a consultation scheduled for Friday morning at 9:30"\n\nThis pattern-matching approach ensures perfect format consistency across hundreds of extractions.'
            }
          ]
        }
      },
      {
        id: 'structured-prompting',
        title: 'Structured & Template Prompting',
        duration: '9 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Structured prompting uses templates, delimiters, and clear sections to organize complex requests. When you have multiple pieces of information, instructions, and context to provide, structure prevents ambiguity and helps the AI process each component correctly. Professional prompt engineers use XML tags, markdown headers, and delimiters to separate prompt components.'
            },
            {
              type: 'highlight',
              body: '📐 Use delimiters to separate content from instructions. Triple quotes ("""), XML tags (<document>), or markdown headers (## Section) make it crystal clear to the AI what is instruction vs. what is input data to process.'
            },
            {
              type: 'list',
              items: [
                '🏷️ XML Tags: <context>, <instructions>, <examples>, <input> — clear, unambiguous separation',
                '📝 Markdown: ## Task, ## Context, ## Format — readable and well-structured',
                '🔧 Template reuse: Build prompt templates with [PLACEHOLDER] variables you can fill in',
                '📊 Output schemas: Specify exact JSON/CSV/table structure in your prompt for reliable parsing',
                '🔢 Numbered instructions: "1. First do X. 2. Then do Y. 3. Finally format as Z." — reduces ambiguity'
              ]
            },
            {
              type: 'example',
              title: 'A Production-Ready Prompt Template',
              body: '## Role\nYou are a senior UX researcher with 10 years of experience.\n\n## Task\nAnalyze the following user feedback and produce a structured report.\n\n## Input Data\n"""\n[PASTE USER FEEDBACK HERE]\n"""\n\n## Output Format\nProvide your analysis as:\n1. Top 3 pain points (with frequency estimate)\n2. Top 3 positive themes\n3. One priority recommendation\n4. Confidence level (High/Medium/Low)\n\n## Constraints\n- Keep the total response under 300 words\n- Use plain language, no jargon\n- Focus on actionable insights only'
            }
          ]
        }
      },
      {
        id: 'advanced-prompting',
        title: 'Advanced Prompt Techniques',
        duration: '12 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Advanced prompt engineering combines multiple techniques and introduces meta-strategies like self-consistency, tree-of-thought reasoning, and prompt chaining. These approaches are used by AI researchers and power users to tackle problems that simple prompts can\'t handle — complex multi-step reasoning, high-stakes accuracy requirements, and automated pipelines.'
            },
            {
              type: 'highlight',
              body: '🌲 Tree of Thought (ToT): Ask the AI to explore multiple reasoning paths before selecting the best one. Prompt: "Think of 3 different ways to approach this problem. Evaluate each approach. Then solve using the best approach." This simulates deliberate human problem-solving.'
            },
            {
              type: 'list',
              items: [
                '🔗 Prompt Chaining: Break complex tasks into a sequence of prompts where each output feeds the next',
                '📊 Self-Consistency: Ask the same question 3 times with temperature > 0, take the most common answer',
                '🪞 Self-Critique: Ask AI to generate a response, then critique it, then improve it — 3-step quality loop',
                '🎲 Adversarial Prompting: Anticipate misunderstandings and add "Do NOT do X" guardrails',
                '🔬 Meta-Prompting: Ask the AI to write a better prompt for your task, then use that improved prompt'
              ]
            },
            {
              type: 'example',
              title: 'The Self-Critique Loop',
              body: 'Step 1 — Generate: "Write a headline for our new productivity app."\nStep 2 — Critique: "Review the headline you just wrote. What are its weaknesses? Is it clear, compelling, and memorable? Does it communicate the core value?"\nStep 3 — Improve: "Now rewrite the headline addressing all the weaknesses you identified."\n\nThis 3-step loop consistently produces higher quality outputs than a single generation step. It mirrors the human writing process of draft → review → revise, and works for writing, code, analysis, and creative work alike.'
            }
          ]
        }
      }
    ]
  },

  {
    id: 'chatgpt-mastery',
    title: 'ChatGPT Mastery',
    icon: '💬',
    color: '#10A37F',
    description: 'Unlock the full power of ChatGPT for research, writing, coding, and productivity. Learn advanced techniques used by power users to get 10x better results.',
    level: 'Intermediate',
    totalXP: 200,
    lessons: [
      {
        id: 'chatgpt-research',
        title: 'ChatGPT for Research',
        duration: '10 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'ChatGPT is a powerful research accelerator when used correctly. It can help you understand complex topics quickly, identify key concepts, generate research questions, and summarize large bodies of information. However, because GPT models have a training cutoff and can hallucinate, research use requires a verification mindset — use ChatGPT to explore and understand, then verify with primary sources.'
            },
            {
              type: 'highlight',
              body: '🔍 The Research Stack: Use ChatGPT for concept explanation and literature mapping, then Google Scholar/PubMed for actual papers, then the AI again to help you understand the papers. ChatGPT + primary sources = research superpower.'
            },
            {
              type: 'list',
              items: [
                '📚 "Explain this concept as if I\'m a PhD student in a different field" — deep but accessible explanations',
                '🗺️ "What are the 5 most important papers in the field of X?" — use as a starting map, verify existence',
                '❓ "Generate 10 research questions about X that haven\'t been well-studied" — spark original inquiry',
                '📝 "Summarize the key arguments for and against X" — balanced literature overview',
                '🔗 Enable Browsing: ChatGPT with web search can access current information beyond its training data'
              ]
            },
            {
              type: 'example',
              title: 'Research Deep-Dive Workflow',
              body: 'Topic: "Impact of microplastics on human health"\n1. Ask ChatGPT: "Give me a structured overview of what we currently know about microplastics and human health — key mechanisms, major studies, and areas of uncertainty."\n2. Ask: "What are the most credible institutions and researchers studying this topic?"\n3. Google Scholar search for papers by those institutions\n4. Paste a paper abstract into ChatGPT: "Explain this research and its significance in plain language"\n5. Ask: "What questions does this paper leave unanswered?" — builds critical reading skills\nResult: Deep understanding in 30 minutes vs. 5 hours of solo research.'
            }
          ]
        }
      },
      {
        id: 'chatgpt-writing',
        title: 'ChatGPT for Writing',
        duration: '10 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'ChatGPT is one of the most versatile writing assistants ever created. From blog posts to marketing copy, from cover letters to technical documentation, ChatGPT can accelerate every stage of the writing process: brainstorming, outlining, drafting, editing, and repurposing. The key is to use it as a collaborative partner, not a replacement for your voice and judgment.'
            },
            {
              type: 'highlight',
              body: '✍️ Preserve your voice: Always give ChatGPT examples of your writing before asking it to write in your style. Paste 2-3 paragraphs you\'ve written and say "Match this writing style: [your text]" — this prevents the generic "ChatGPT voice" that readers can detect.'
            },
            {
              type: 'list',
              items: [
                '🧠 Brainstorm: "Give me 20 angle ideas for an article about remote work" — pick the ones that resonate',
                '📋 Outline first: Have ChatGPT create an outline, refine it yourself, then use it to guide drafting',
                '✂️ Edit ruthlessly: "Make this paragraph 30% shorter without losing meaning" — great for tight copy',
                '🔄 Repurpose: "Transform this blog post into: a tweet thread, a LinkedIn post, and an email newsletter"',
                '🎯 Audience rewrite: "Rewrite this for a skeptical CFO who cares primarily about ROI and risk"'
              ]
            },
            {
              type: 'example',
              title: 'The Writing Accelerator Workflow',
              body: 'Goal: Write a 1,500-word thought leadership article.\n1. Brainstorm (ChatGPT): "Give me 10 counterintuitive takes on [topic]" — pick the most interesting one\n2. Outline (ChatGPT): "Create a detailed outline for an article with this thesis: [thesis]"\n3. Draft sections (you + ChatGPT): Write key sections yourself, use ChatGPT for transitions and supporting points\n4. Edit (ChatGPT): "Improve the flow of this draft. Flag any weak arguments or unsupported claims."\n5. Polish (you): Read aloud, adjust for your voice, verify all facts\nTime saved: 4 hours of solo writing becomes 90 minutes of collaborative writing.'
            }
          ]
        }
      },
      {
        id: 'chatgpt-coding',
        title: 'ChatGPT for Coding',
        duration: '11 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'ChatGPT (especially GPT-4) is a capable coding assistant that can write, debug, explain, refactor, and document code across dozens of programming languages. Studies show developers using AI coding assistants complete tasks 55% faster. The key is knowing how to communicate your coding intent clearly and how to critically evaluate the code you receive.'
            },
            {
              type: 'highlight',
              body: '🐛 Debugging superpower: Paste your error message AND the relevant code and ask "Why is this throwing this error and how do I fix it?" ChatGPT can identify bugs that take humans hours to find, especially in areas like async code, regex, and API integrations.'
            },
            {
              type: 'list',
              items: [
                '📖 Code explanation: "Explain this code line by line as if I\'m a beginner" — great for onboarding to new codebases',
                '🔧 Refactoring: "Refactor this function to be more readable and follow SOLID principles"',
                '🧪 Test generation: "Write unit tests for this function covering edge cases and error conditions"',
                '📚 Documentation: "Write JSDoc comments for every function in this file"',
                '🌐 Language translation: "Convert this Python function to JavaScript/Rust/Go"'
              ]
            },
            {
              type: 'example',
              title: 'The Code Review Partnership',
              body: 'Before submitting a PR, paste your changed code and ask ChatGPT: "Review this code change. Check for: 1) Security vulnerabilities 2) Performance issues 3) Edge cases not handled 4) Violations of clean code principles 5) Missing error handling. Be specific and critical."\n\nThis catches issues before code review, making you look sharp to your team. One developer reported this caught an SQL injection vulnerability in their first week using this technique. ChatGPT caught what a rushed human reviewer missed.'
            }
          ]
        }
      },
      {
        id: 'chatgpt-productivity',
        title: 'ChatGPT for Productivity',
        duration: '9 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Beyond research and writing, ChatGPT is a productivity multiplier for everyday cognitive work. Email drafting, meeting preparation, decision-making frameworks, learning acceleration, and task planning — these are areas where conversational AI genuinely saves hours every week. Power users build personal prompt libraries for their most common tasks.'
            },
            {
              type: 'highlight',
              body: '⚡ Custom Instructions: In ChatGPT\'s settings, set Custom Instructions to provide your background, preferences, and how you want it to respond. This context persists across all conversations, saving you from re-explaining yourself every session.'
            },
            {
              type: 'list',
              items: [
                '📧 Email drafting: "Draft a polite but firm follow-up to a client who missed two deadlines"',
                '📅 Meeting prep: "I have a 30-min meeting with a skeptical VP about my project. Help me anticipate objections and prepare responses"',
                '🧩 Decision frameworks: "I\'m deciding between X and Y. Ask me 5 clarifying questions, then help me build a decision matrix"',
                '📚 Learning acceleration: "I have 30 minutes to understand [topic] well enough to discuss it in a meeting. What are the 5 most important concepts?"',
                '✅ Task breakdown: "I\'m procrastinating on [complex project]. Break it into 15-minute tasks I can start immediately"'
              ]
            },
            {
              type: 'example',
              title: 'Building Your Personal Prompt Library',
              body: 'Power users maintain a document (Notion, Obsidian, or Google Docs) of their best prompts organized by category. Example categories: Email Templates, Code Review, Writing Assistant, Research Framework, Decision Making. When you find a prompt that works brilliantly, save it with [PLACEHOLDERS] for the variable parts. Example saved prompt: "Explain [TOPIC] to me using the Feynman technique. Start with a simple analogy, then gradually increase complexity. End with 3 questions that would test my understanding." Over time, this library becomes your personal AI operating system.'
            }
          ]
        }
      }
    ]
  },

  {
    id: 'claude-mastery',
    title: 'Claude Mastery',
    icon: '🎭',
    color: '#D97706',
    description: 'Master Anthropic\'s Claude for deep analysis, long-document processing, and strategic thinking. Learn why Claude excels at nuanced reasoning and how to leverage its unique strengths.',
    level: 'Intermediate',
    totalXP: 150,
    lessons: [
      {
        id: 'claude-analysis',
        title: 'Claude for Deep Analysis',
        duration: '10 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Claude, built by Anthropic, is specifically designed for careful, nuanced reasoning. It tends to be more cautious about making strong claims without evidence, more likely to flag uncertainty, and more thorough in exploring multiple perspectives. These traits make Claude exceptional for analytical tasks where accuracy and depth matter more than speed.'
            },
            {
              type: 'highlight',
              body: '🔭 Claude\'s Superpower: Claude is trained with "Constitutional AI" — a values-based approach that makes it particularly good at reasoning about complex, ambiguous situations. It\'s more likely to say "this is nuanced because..." and walk you through the complexity, rather than giving an oversimplified answer.'
            },
            {
              type: 'list',
              items: [
                '⚖️ Argument analysis: Claude excels at "steelmanning" — presenting the strongest version of an opposing argument',
                '🔬 Research critique: Ask Claude to find flaws in a study\'s methodology — it approaches this rigorously',
                '🧩 Scenario planning: Claude handles "what if" analysis with multiple branches and second-order effects',
                '📊 Data interpretation: Paste a dataset and ask Claude to identify patterns, anomalies, and possible explanations',
                '🤔 Socratic dialogue: Claude is excellent at asking probing questions to help you clarify your own thinking'
              ]
            },
            {
              type: 'example',
              title: 'Strategic Analysis with Claude',
              body: 'Prompt: "I\'m considering entering the project management software market with a product targeting construction companies. Analyze this opportunity rigorously. Consider: market size and competition, why existing players may be failing this segment, what a defensible wedge strategy looks like, key risks, and what I should validate before investing significant resources. Be direct about where my thinking might be wrong."\n\nClaude will typically produce a structured analysis that challenges assumptions, identifies blind spots, and provides a framework for decision-making — going well beyond surface-level observations.'
            }
          ]
        }
      },
      {
        id: 'claude-documents',
        title: 'Claude for Document Processing',
        duration: '11 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Claude offers one of the largest context windows of any AI model — up to 200,000 tokens, equivalent to roughly 150,000 words or a 500-page book. This makes Claude uniquely capable for tasks that require reading and reasoning over entire documents: legal contracts, research papers, financial reports, codebases, and entire book manuscripts.'
            },
            {
              type: 'highlight',
              body: '📄 200K token context = your entire company knowledge base. You can paste entire legal contracts (and ask Claude to find risky clauses), full financial reports (and ask for a CFO-style summary), or entire codebases (and ask Claude to explain the architecture and identify technical debt).'
            },
            {
              type: 'list',
              items: [
                '⚖️ Contract review: "Review this contract and flag any clauses that are unusually one-sided or represent significant risk"',
                '📑 Report summarization: "Summarize this 80-page annual report for a non-technical board member"',
                '🔍 Comparative analysis: Upload two documents and ask Claude to compare, contrast, and identify discrepancies',
                '📚 Literature synthesis: Paste multiple research papers and ask for a synthesized overview of key findings',
                '🗂️ Information extraction: "Extract all deadlines, payment terms, and penalty clauses from this contract into a table"'
              ]
            },
            {
              type: 'example',
              title: 'The Contract Review Workflow',
              body: 'Before signing any business contract, paste the full text into Claude and ask: "1. Identify the top 5 clauses that most favor the other party. 2. Flag any unusual indemnification, liability, or IP assignment language. 3. Identify what\'s missing that\'s standard in similar contracts. 4. Summarize my key obligations and what happens if I breach them."\n\nOne startup founder reported this review caught a clause that would have assigned all future IP created during the contract period to the client — a potentially company-ending issue that was buried on page 23 of a 30-page document.'
            }
          ]
        }
      },
      {
        id: 'claude-strategy',
        title: 'Claude for Strategic Thinking',
        duration: '10 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Claude is a remarkable thinking partner for strategic decisions. Unlike systems that give quick confident answers, Claude tends to explore the full problem space — surfacing assumptions, identifying second-order effects, and asking clarifying questions before concluding. This deliberate approach makes Claude particularly valuable for high-stakes decisions where getting it wrong has significant consequences.'
            },
            {
              type: 'highlight',
              body: '🏛️ Pre-Mortem with Claude: Ask Claude to assume your plan failed catastrophically and explain why. This technique (pioneered by psychologist Gary Klein) forces examination of risks you\'d otherwise rationalize away. Claude is especially good at this because it doesn\'t have emotional investment in your plan succeeding.'
            },
            {
              type: 'list',
              items: [
                '🔮 Scenario planning: "Describe 3 scenarios for my business in 2 years: optimistic, realistic, and pessimistic"',
                '🎯 Strategy critique: "Here is my go-to-market strategy. What are the 3 most likely ways it fails?"',
                '📐 Framework application: "Apply Porter\'s Five Forces to analyze competition in the electric vehicle market"',
                '🔄 Devil\'s advocate: "Argue as forcefully as possible against my proposed strategy"',
                '🌊 Second-order thinking: "What are the non-obvious second and third-order effects of this decision?"'
              ]
            },
            {
              type: 'example',
              title: 'The Pre-Mortem Technique',
              body: 'You\'re launching a new product. Before you commit fully, prompt Claude: "We\'re about to launch [product description]. It\'s now 18 months in the future and the launch has failed completely. Looking back, what were the top 5 reasons it failed? For each failure mode, what early warning signs should we watch for? What actions could we take now to reduce the probability of each failure?"\n\nThis structured pessimism exercise reveals risks hidden by optimism bias. Teams that run pre-mortems launch more successfully because they address failure modes proactively rather than reactively.'
            }
          ]
        }
      }
    ]
  },

  {
    id: 'gemini-mastery',
    title: 'Gemini Mastery',
    icon: '✨',
    color: '#1D4ED8',
    description: 'Harness Google\'s Gemini for multimodal tasks — analyzing images, understanding video, and combining text with visual reasoning in ways no other AI can match.',
    level: 'Intermediate',
    totalXP: 150,
    lessons: [
      {
        id: 'gemini-multimodal',
        title: 'Gemini\'s Multimodal Power',
        duration: '9 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Gemini is Google\'s most capable AI model family, built from the ground up to be natively multimodal — meaning it processes and reasons across text, images, audio, and video simultaneously, not as bolt-on capabilities. This is a fundamental architectural difference that enables richer cross-modal reasoning than systems where modalities were added separately.'
            },
            {
              type: 'highlight',
              body: '🌐 Native Multimodality: Most AI models process images by "captioning" them into text first, then reasoning from that text. Gemini reasons directly from pixels, audio waveforms, and text tokens together. This means it catches visual nuances that a text-only description would miss.'
            },
            {
              type: 'list',
              items: [
                '🖼️ Image + Text: Ask questions about an image, get answers that reason from visual content',
                '📊 Chart analysis: Upload a chart and ask "What is the trend and what does it imply for Q4?"',
                '🏗️ Diagram interpretation: Upload architecture diagrams, schematics, or flowcharts for expert analysis',
                '📄 Document OCR+: Upload a scanned document with handwriting and ask complex questions about it',
                '🔬 Scientific imagery: Gemini can analyze microscope slides, X-rays, and satellite imagery'
              ]
            },
            {
              type: 'example',
              title: 'Multimodal Business Intelligence',
              body: 'Upload your competitor\'s product screenshot + website screenshot to Gemini and ask: "Compare these two products from a UX perspective. What are the key design philosophy differences? What does each design communicate about the target user? Which approach would resonate better with enterprise buyers, and why?"\n\nGemini can analyze both screenshots simultaneously, extracting layout, typography choices, color philosophy, CTA placement, and information hierarchy — then synthesize this into actionable competitive intelligence. This type of visual reasoning is Gemini\'s distinctive edge.'
            }
          ]
        }
      },
      {
        id: 'gemini-images',
        title: 'Gemini for Image Analysis',
        duration: '10 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Gemini\'s image understanding capabilities go far beyond simple object recognition. It can analyze composition, infer context, understand text within images (OCR), interpret diagrams and charts, assess damage or defects, and reason about what an image implies — not just what it literally shows. This makes it powerful for professional applications in medicine, engineering, design, and research.'
            },
            {
              type: 'highlight',
              body: '📸 Pro tip: The more context you provide alongside an image, the better Gemini\'s analysis. Instead of just uploading an image, tell it: your role, what decision you\'re making, and what you specifically want to understand. This context dramatically improves the relevance of its visual analysis.'
            },
            {
              type: 'list',
              items: [
                '🏡 Real estate: Upload interior photos and ask for renovation priority recommendations',
                '🔧 Equipment inspection: Photo a machine part and ask if visible wear indicates needed maintenance',
                '📈 Data visualization: Upload a graph and ask for a plain-language interpretation of the trend',
                '🎨 Design feedback: "Critique this UI design for usability, visual hierarchy, and accessibility"',
                '🌿 Plant/nature ID: Upload a photo of a plant or insect for identification and information'
              ]
            },
            {
              type: 'example',
              title: 'Image Analysis for E-commerce',
              body: 'An online retailer uploads product photos to Gemini with this prompt: "You are an e-commerce product photographer. Review these product images. For each, tell me: 1) What the image does well 2) Why it might cause customers to hesitate 3) Specific photography or editing changes that would increase conversion. Focus on: background, lighting, angle, context/lifestyle appeal, and whether the main benefit is visually clear."\n\nGemini provides specific, actionable feedback that would typically require hiring a professional product photographer consultant. Teams use this to prioritize which product images to reshoot first.'
            }
          ]
        }
      },
      {
        id: 'gemini-video',
        title: 'Gemini for Video Understanding',
        duration: '11 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Gemini Ultra and Gemini 1.5 Pro can analyze video content — understanding what happens, who is speaking, what is shown on screen, and how events unfold over time. This opens up entirely new workflows: analyzing meeting recordings, extracting insights from lecture videos, reviewing customer service call recordings, and understanding training videos at scale.'
            },
            {
              type: 'highlight',
              body: '🎬 Video understanding at scale: Gemini can process up to 1 hour of video in a single context window. You can upload an entire lecture, board meeting, or product demo and ask detailed questions about any moment in it — like having an AI that watched the whole thing with you.'
            },
            {
              type: 'list',
              items: [
                '📹 Meeting analysis: "Summarize key decisions made in this meeting and list all action items with owners"',
                '🎓 Lecture extraction: "From this 1-hour lecture, extract the 10 most important concepts with timestamps"',
                '💼 Sales call review: "Identify moments in this call where the customer expressed hesitation and how the rep responded"',
                '🔧 Tutorial comprehension: "Explain step-by-step what the instructor did in this coding tutorial"',
                '📊 Presentation analysis: "What were the key arguments in this pitch? What questions should the investor ask?"'
              ]
            },
            {
              type: 'example',
              title: 'Transforming Video Content into Knowledge',
              body: 'A company records all their internal training sessions. Traditionally, employees had to watch hours of video to find relevant information. With Gemini\'s video understanding:\n1. Upload recorded training videos to Gemini\n2. Ask: "Create a structured summary of this training with key concepts, procedures, and Q&A highlights"\n3. Ask: "At what timestamp does the instructor explain [specific procedure]?"\n4. Ask: "Generate 10 quiz questions to test comprehension of this training"\n\nThis transforms passive video archives into searchable, interactive knowledge bases — reducing onboarding time by 60% in companies that have implemented this workflow.'
            }
          ]
        }
      }
    ]
  },

  {
    id: 'grok-ai',
    title: 'Grok AI',
    icon: '⚡',
    color: '#1F2937',
    description: 'Master xAI\'s Grok for real-time information, sharp reasoning, and cutting-edge research. Learn how Grok\'s X/Twitter integration and reasoning models give it unique capabilities.',
    level: 'Intermediate',
    totalXP: 150,
    lessons: [
      {
        id: 'grok-research',
        title: 'Grok for Real-Time Research',
        duration: '9 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Grok, built by xAI (Elon Musk\'s AI company), has a unique integration with the X (formerly Twitter) platform, giving it access to real-time information from the world\'s largest real-time information network. While other AI models have training cutoffs, Grok can access what people are talking about right now — breaking news, emerging trends, and live events.'
            },
            {
              type: 'highlight',
              body: '📡 Real-time advantage: When something major happens in the world — a product launch, a market event, a scientific discovery — Grok can access discussions happening on X within minutes of the event. This makes it invaluable for staying on top of fast-moving fields like tech, crypto, and markets.'
            },
            {
              type: 'list',
              items: [
                '📰 Breaking news synthesis: Ask Grok to summarize what\'s being said about a developing story across X',
                '🔥 Trend identification: "What are the most discussed topics in AI this week on X?"',
                '💹 Market sentiment: "What is the current sentiment around [stock/crypto] on X?"',
                '🧑‍💻 Developer community: Grok tracks what developers are building and discussing in real time',
                '🎯 Influencer tracking: "What has [key expert] been saying about [topic] recently?"'
              ]
            },
            {
              type: 'example',
              title: 'Real-Time Competitive Intelligence',
              body: 'You\'re launching a SaaS product. Before your launch date, ask Grok: "Search recent X posts about [competitor product]. What are users complaining about most? What features do they wish it had? What do power users praise about it?"\n\nGrok pulls real-time customer sentiment from X, giving you a live competitive intelligence feed that traditional market research (which takes months) can\'t match. You can use these insights to adjust your positioning, refine your messaging, and launch with a pitch that directly addresses the gaps your competitor has left open.'
            }
          ]
        }
      },
      {
        id: 'grok-reasoning',
        title: 'Grok\'s Reasoning Models',
        duration: '10 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Grok-3 and its reasoning variants (Grok-3 Thinking) introduce extended thinking capabilities where the model works through problems step-by-step before producing a final answer. This "reasoning" mode is particularly valuable for mathematics, logic puzzles, complex planning problems, and scientific analysis where getting the right answer matters more than response speed.'
            },
            {
              type: 'highlight',
              body: '🧮 When to use Reasoning Mode: Use Grok Thinking for math problems, code debugging, logical puzzles, strategic planning, and any task where methodical step-by-step analysis outweighs the need for speed. For casual questions, standard mode is faster and usually sufficient.'
            },
            {
              type: 'list',
              items: [
                '📐 Math problems: Grok Thinking solves complex multi-step math with shown work and error-checking',
                '🔍 Logic puzzles: Extended reasoning significantly improves performance on logic and deduction problems',
                '⚙️ Algorithm design: Reason through algorithm correctness before writing code',
                '🧪 Hypothesis testing: "Walk through whether this hypothesis is logically consistent with the evidence"',
                '📊 Quantitative analysis: Grok Thinking can set up and reason through financial models step by step'
              ]
            },
            {
              type: 'example',
              title: 'Using Thinking Mode for Complex Decisions',
              body: 'Decision: Should a startup raise a $2M seed round now or wait 6 months?\n\nPrompt to Grok Thinking: "Reason through the following decision carefully. [Company details, current revenue, runway, market conditions, investor interest]. Consider: opportunity cost of dilution now vs. later, what milestones in 6 months would improve valuation, current market conditions for seed fundraising, execution risk of running the company on tight runway, and optionality value of waiting. Work through each consideration methodically before giving a recommendation."\n\nThe extended thinking mode will produce a more thorough analysis than a standard response, showing its reasoning and often catching considerations that quick responses miss.'
            }
          ]
        }
      },
      {
        id: 'grok-current-info',
        title: 'Grok for Current Events & Trends',
        duration: '9 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'One of Grok\'s defining capabilities is its ability to discuss current events, recent research, and emerging trends with significantly more up-to-date knowledge than other AI models. For professionals who need to stay current in fast-moving fields — technology, finance, healthcare, policy — this real-time awareness is a meaningful competitive advantage.'
            },
            {
              type: 'highlight',
              body: '⚡ The freshness advantage: While Claude and ChatGPT know the world up to their training cutoff (months or years ago), Grok knows what\'s happening this week. For rapidly evolving topics like AI model releases, regulatory changes, and market dynamics, this recency difference is significant.'
            },
            {
              type: 'list',
              items: [
                '🤖 AI landscape: "What AI models have been released in the last 30 days and how do they compare?"',
                '⚖️ Regulatory updates: "What are the latest developments in AI regulation globally?"',
                '🏢 Company news: "What are the most significant tech company announcements this week?"',
                '🔬 Research breakthroughs: "What recent research papers are people in AI research most excited about?"',
                '📈 Market intelligence: "What emerging trends in [industry] are being discussed by founders and investors right now?"'
              ]
            },
            {
              type: 'example',
              title: 'Building a Living Intelligence Brief',
              body: 'For professionals who need to stay at the cutting edge, Grok can be used to create a personalized weekly intelligence brief. Prompt: "Create my weekly intelligence brief for [your industry]. Include: 1) Top 5 most significant news stories this week 2) Emerging trends gaining momentum 3) Notable people and companies making moves 4) One contrarian perspective worth considering 5) What I should be watching next week."\n\nThis takes 2 minutes instead of 2 hours of newsletter reading, and because Grok accesses X in real time, it often surfaces information that hasn\'t made it into mainstream tech publications yet.'
            }
          ]
        }
      }
    ]
  },

  {
    id: 'vibe-coding',
    title: 'Vibe Coding',
    icon: '🚀',
    color: '#DC2626',
    description: 'Build real software with AI using modern "vibe coding" tools. From no-code AI builders to professional IDEs — learn to ship products faster than ever before.',
    level: 'Intermediate',
    totalXP: 250,
    lessons: [
      {
        id: 'vibe-replit',
        title: 'Building with Replit Agent',
        duration: '10 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Replit Agent is an AI system embedded in the Replit cloud development environment. It can create entire applications from plain English descriptions — writing code, installing packages, setting up databases, and deploying — all in a browser-based environment without any local setup. It\'s particularly powerful for quickly prototyping web apps, APIs, and bots.'
            },
            {
              type: 'highlight',
              body: '🌐 Zero setup power: Replit Agent runs in a cloud environment, so there\'s no local installation needed. Describe your app, watch it build, click Deploy. Your app gets a public URL within minutes. This is genuinely magical for non-technical founders and students who need working software fast.'
            },
            {
              type: 'list',
              items: [
                '📝 Be specific: "A web app where users can submit their email to join a waitlist, with a simple admin dashboard showing all submissions"',
                '🔄 Iterate visually: See the app live as it\'s built, click through it, tell the agent what to change',
                '🗄️ Database support: Replit includes built-in key-value stores and PostgreSQL for data persistence',
                '🤝 Collaboration: Share your Repl with teammates for collaborative vibe coding sessions',
                '⚠️ Production caveat: Replit Agent is great for MVPs; production apps with 10k+ users need more robust infrastructure'
              ]
            },
            {
              type: 'example',
              title: 'Building a Waitlist App in 10 Minutes',
              body: 'Prompt to Replit Agent: "Build a waitlist landing page for a new AI writing tool called Quill. The page should have: a hero section with the tagline \'Write 10x faster with AI\', an email capture form that stores submissions in a database, a simple counter showing how many people have joined, and a success message after signup. Use a clean, modern design with a dark background and blue accent color."\n\nReplit Agent will:\n1. Generate HTML/CSS/JS for the frontend\n2. Create a server (Node.js or Python Flask)\n3. Set up a database for email storage\n4. Connect frontend to backend\n5. Provide a live URL\n\nTotal time: 8-15 minutes. Without AI: 4-8 hours.'
            }
          ]
        }
      },
      {
        id: 'vibe-lovable',
        title: 'Building with Lovable',
        duration: '10 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Lovable is an AI-powered full-stack development platform that specializes in building beautiful, production-ready React applications from natural language. It integrates with Supabase for databases and authentication, and deploys to the web with one click. Lovable is particularly strong for SaaS applications, dashboards, and any product that needs a polished, modern UI.'
            },
            {
              type: 'highlight',
              body: '💎 Production-quality UI: Lovable generates React + Tailwind CSS code that looks professionally designed out of the box. Unlike some AI builders that produce functional but ugly UIs, Lovable understands modern design principles and applies them automatically.'
            },
            {
              type: 'list',
              items: [
                '🔗 Supabase integration: Authentication, database, storage — all connected automatically with one click',
                '💰 Pricing page: Lovable can build complete SaaS pricing pages with plan comparison and checkout',
                '🎨 Design system: It maintains consistent colors, fonts, and spacing across your entire app',
                '📱 Responsive by default: All generated UIs are mobile-responsive without extra prompting',
                '🔧 GitHub sync: Connect to GitHub and Lovable\'s code is exportable — you\'re never locked in'
              ]
            },
            {
              type: 'example',
              title: 'SaaS Dashboard in a Day',
              body: 'Lovable prompt: "Build a SaaS analytics dashboard for a social media management tool. Include: a sidebar nav with sections for Overview, Posts, Analytics, and Settings. The Overview tab should show: total followers card, posts this month card, average engagement rate card, and a line chart of follower growth over the last 30 days. Use a clean dashboard design with a white sidebar and blue primary color. The user should be able to log in and each user sees their own data."\n\nLovable builds this with real authentication (via Supabase Auth), a real database schema, proper routing, and a polished UI — in under an hour. This level of quality would take a full-stack developer 2-3 days to build from scratch.'
            }
          ]
        }
      },
      {
        id: 'vibe-antigravity',
        title: 'Building with Antigravity',
        duration: '10 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Antigravity is an AI development environment that enables conversational software building with a focus on agentic workflows. It supports building AI-powered applications — not just traditional web apps — where the software itself uses AI to do things autonomously. Antigravity is ideal for building AI agents, automation tools, and intelligent applications that process, reason, and act on data.'
            },
            {
              type: 'highlight',
              body: '🤖 AI-native apps: Antigravity makes it straightforward to build apps where AI is the core feature, not just a chatbot bolted on. Think: AI that reads your emails and drafts responses, AI that monitors a website and alerts you to changes, or AI that processes customer support tickets automatically.'
            },
            {
              type: 'list',
              items: [
                '🔌 API integrations: Antigravity helps connect your app to external services and APIs quickly',
                '🤖 Agent workflows: Build multi-step AI workflows where the AI takes sequences of actions',
                '📊 Data pipelines: Create apps that ingest, process, and surface insights from data automatically',
                '🔔 Event-driven apps: Build applications that react to triggers (new data, webhooks, schedules)',
                '🛠️ Extensibility: Export clean code that you can continue building on in any IDE'
              ]
            },
            {
              type: 'example',
              title: 'Building an AI Content Monitor',
              body: 'Antigravity prompt: "Build an app that monitors a list of competitor websites (user inputs the URLs) and sends me a daily email summarizing any significant changes — new features, pricing changes, new blog posts, or job listings. The app should run on a daily schedule, scrape the pages, use AI to identify meaningful changes (not just whitespace changes), and format a clean email digest."\n\nAntigravity will help you assemble this as an agentic workflow: URL fetcher → content differ → AI change analyzer → email formatter → scheduler. This type of AI-native automation is Antigravity\'s sweet spot.'
            }
          ]
        }
      },
      {
        id: 'vibe-cursor',
        title: 'Building with Cursor',
        duration: '11 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Cursor is an AI-native code editor (built on VS Code) that integrates powerful AI assistance directly into the development workflow. Unlike standalone AI chatbots, Cursor knows your entire codebase — it can read all your files, understand your project structure, and make changes across multiple files simultaneously. It\'s the tool of choice for professional developers who want AI assistance without giving up control.'
            },
            {
              type: 'highlight',
              body: '🧠 Codebase-aware AI: Cursor\'s AI has access to your entire project, so it can say "I see that in auth.js you use JWT tokens, so I\'ll update the middleware to check for those." This codebase context makes the AI assistance dramatically more accurate and relevant than context-free AI chatbots.'
            },
            {
              type: 'list',
              items: [
                '⌨️ Cmd+K: Inline code generation and editing within any file',
                '💬 Cursor Chat: AI assistant with full codebase context, similar to asking a senior dev who knows your project',
                '🔮 Tab Completion: Multi-line intelligent autocomplete that understands what you\'re trying to do next',
                '📁 @file, @codebase: Reference specific files or your entire codebase in chat for targeted assistance',
                '🔄 Composer: Multi-file editing — Cursor can make coordinated changes across 10+ files at once'
              ]
            },
            {
              type: 'example',
              title: 'Professional Vibe Coding Workflow',
              body: 'Real workflow used by indie hackers building SaaS:\n\n1. Use Lovable/Replit to get 60-70% of the app built quickly\n2. Export the code to GitHub\n3. Open in Cursor for refinement\n4. Use Cursor Chat: "@codebase I want to add Stripe subscription billing. What files need to change and what\'s the implementation plan?"\n5. Use Cursor Composer to implement the plan across multiple files simultaneously\n6. Use Cursor\'s inline editing (Cmd+K) for fine-tuning individual functions\n\nThis hybrid approach combines the speed of no-code builders with the precision of a professional AI-assisted IDE. Many solo developers now ship products in days that previously took teams weeks.'
            }
          ]
        }
      },
      {
        id: 'vibe-windsurf',
        title: 'Building with Windsurf',
        duration: '10 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Windsurf (by Codeium) is an AI-native IDE that introduces the concept of "Cascade" — an agentic AI that doesn\'t just respond to prompts but can autonomously plan and execute multi-step coding tasks. While Cursor is conversational, Windsurf\'s Cascade is more autonomous: you describe an outcome, and Cascade figures out all the steps needed to get there, executes them, and reports back.'
            },
            {
              type: 'highlight',
              body: '🌊 Cascade Mode: Windsurf\'s standout feature. You give it a high-level goal — "Implement user authentication with Google OAuth, JWT tokens, and a refresh token system" — and Cascade figures out which files to create, what code to write, what packages to install, and how to wire it all together. It\'s more autonomous than Cursor.'
            },
            {
              type: 'list',
              items: [
                '🎯 Goal-oriented: Give outcomes, not step-by-step instructions — Cascade plans the path',
                '🔍 Deep search: Windsurf searches your codebase to understand context before making changes',
                '⚡ Flows: Multi-step autonomous agents that can handle complex, multi-file refactors',
                '🧪 Test-aware: Cascade can run your tests and iterate until they pass',
                '📦 Dependency management: Automatically installs and configures required packages'
              ]
            },
            {
              type: 'example',
              title: 'Autonomous Feature Implementation',
              body: 'Windsurf Cascade prompt: "This app currently has basic username/password auth. Implement a complete notifications system: 1) In-app notification bell with unread badge 2) Notification preferences page where users can control what they receive 3) Email notifications via SendGrid for critical alerts 4) Real-time notifications using WebSockets 5) Notification history page. Follow the existing code patterns in the project."\n\nCascade will: analyze the existing codebase, design a notifications schema, create the database migrations, build the backend endpoints, implement WebSocket logic, create frontend components matching the existing design system, and wire everything together. This autonomous, goal-oriented execution is Windsurf\'s differentiating capability vs. more conversational AI editors.'
            }
          ]
        }
      }
    ]
  },

  {
    id: 'automation',
    title: 'AI Automation',
    icon: '⚙️',
    color: '#059669',
    description: 'Build powerful no-code automations with Zapier, Make, and n8n. Connect AI to your apps and create workflows that run 24/7 without writing a single line of code.',
    level: 'Intermediate',
    totalXP: 150,
    lessons: [
      {
        id: 'automation-zapier',
        title: 'Automation with Zapier',
        duration: '10 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Zapier is the world\'s largest no-code automation platform, connecting 6,000+ apps with AI-powered workflows. A "Zap" is an automated workflow triggered by an event in one app (e.g., a new email) that performs actions in other apps (e.g., create a task, send a Slack message, update a spreadsheet). Zapier\'s AI features let you incorporate ChatGPT, Claude, and other AI models as steps in your workflows.'
            },
            {
              type: 'highlight',
              body: '⚡ The Zapier formula: Trigger + Action(s). Every Zap starts with a trigger (something that happens) and then performs one or more actions. Add an AI step in the middle to transform, analyze, or enhance the data as it flows through your workflow.'
            },
            {
              type: 'list',
              items: [
                '📧 Email to task: New email with "urgent" in subject → AI extracts key info → creates Asana task with deadline',
                '📝 Form to CRM: New form submission → AI qualifies the lead → adds to HubSpot with AI-generated notes',
                '📊 Report automation: Weekly trigger → AI fetches and summarizes key metrics → sends Slack digest',
                '🎙️ Meeting to notes: Zoom recording → transcription → AI extracts action items → adds to Notion',
                '🛒 Review response: New Google review → AI drafts personalized response → sends for approval'
              ]
            },
            {
              type: 'example',
              title: 'Building a Lead Qualification Bot',
              body: 'Trigger: New form submission on your website (Typeform)\nStep 1: Zapier extracts the submission data\nStep 2: AI step (ChatGPT via Zapier) — "Based on this form submission, rate this lead 1-10 on fit for our product. Provide reasoning and suggest a personalized follow-up message. Submission: {{data}}"\nStep 3: If score ≥ 7, add to HubSpot as "Hot Lead" with AI notes\nStep 4: Send personalized AI-drafted follow-up email via Gmail\nStep 5: If score < 7, add to nurture sequence instead\n\nThis Zap qualifies leads 24/7, sends personalized follow-ups instantly, and routes leads correctly — tasks that previously required a human SDR\'s time for every inbound lead.'
            }
          ]
        }
      },
      {
        id: 'automation-make',
        title: 'Automation with Make',
        duration: '11 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'Make (formerly Integromat) is a visual automation platform known for its power and flexibility. Where Zapier is simpler and linear, Make uses a visual canvas where you build complex workflows with conditional branches, loops, error handling, and data transformation. Make is favored by power users who need to build automation logic that Zapier\'s simpler interface can\'t handle.'
            },
            {
              type: 'highlight',
              body: '🎨 Visual workflow design: Make\'s canvas approach lets you see your entire automation as a visual diagram. You can build loops (process every item in a list), branches (if/else logic), iterators, and aggregators — making it possible to build complex data processing workflows without code.'
            },
            {
              type: 'list',
              items: [
                '🔄 Loops & iterators: Process each item in an array separately — ideal for batch processing',
                '🌿 Conditional branches: Route different data to different paths based on conditions',
                '🔀 Error handling: Build fallback paths for when a step fails — critical for production automations',
                '📊 Data mapping: Visual field mapping between apps with built-in functions for transforming data',
                '🕐 Scheduling: Run scenarios on custom schedules — every 15 minutes, daily at 9am, first Monday of month'
              ]
            },
            {
              type: 'example',
              title: 'Content Repurposing Factory',
              body: 'A content creator uses Make to build a content factory:\n\nTrigger: New blog post published on WordPress\n→ Extract post content\n→ AI Module (OpenAI): Generate 5 tweet variations from the post\n→ AI Module: Create a LinkedIn article summary (300 words)\n→ AI Module: Generate 10 Instagram caption options\n→ AI Module: Create a YouTube video script outline\n→ Store all in Airtable (one row per content piece, columns for each platform)\n→ Send Slack message with Airtable link for review and scheduling\n\nThis turns one blog post into a week\'s worth of social content in 2 minutes. The same workflow that would require a 3-person content team runs automatically every time a new post is published.'
            }
          ]
        }
      },
      {
        id: 'automation-n8n',
        title: 'Automation with n8n',
        duration: '12 min',
        xp: 50,
        content: {
          sections: [
            {
              type: 'text',
              body: 'n8n (pronounced "nodemation") is an open-source workflow automation platform that you can self-host, giving you complete control over your data. Unlike Zapier and Make, n8n is free for self-hosted use, which makes it the choice for developers, privacy-conscious teams, and businesses that need to process sensitive data without sending it through third-party servers.'
            },
            {
              type: 'highlight',
              body: '🔓 Self-hosted = full control: With n8n self-hosted, your data never leaves your servers. This is crucial for healthcare (HIPAA), finance (SOC2), and enterprise workflows that can\'t share data with external SaaS platforms. Run it on your own VPS for under $10/month with unlimited workflows.'
            },
            {
              type: 'list',
              items: [
                '💻 Code nodes: Execute JavaScript or Python directly within your workflow for complex transformations',
                '🤖 AI Agent nodes: n8n has native AI agent nodes — build multi-step AI agents without code',
                '🔗 400+ integrations: Connects to all major apps and services with official nodes',
                '🌐 Webhook triggers: Any app can trigger n8n workflows via webhooks — ultimate flexibility',
                '☁️ n8n Cloud: If self-hosting seems complex, n8n Cloud offers the same power with managed infrastructure'
              ]
            },
            {
              type: 'example',
              title: 'Building an AI Customer Support Agent',
              body: 'n8n workflow for AI-powered customer support:\n\nTrigger: Webhook receives new support ticket\n→ Read ticket content and customer history from database\n→ AI Agent node: "You are a customer support agent for [Company]. Review this ticket and the customer\'s history. If this is a simple FAQ-type question you can answer confidently, draft a response. If it needs human review, categorize it as [billing/technical/refund] and summarize the key issue for the human agent."\n→ Condition node: Was the AI confident enough to auto-respond?\n  → Yes: Send automated response email, log as resolved\n  → No: Route to appropriate human queue with AI summary, notify agent via Slack\n\nThis workflow resolves 40-60% of tickets automatically and ensures the remaining tickets reach the right human agent with context — reducing average handle time by 35%.'
            }
          ]
        }
      }
    ]
  }
];
