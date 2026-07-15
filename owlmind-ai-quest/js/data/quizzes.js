window.OWL = window.OWL || {};

window.OWL.quizzes = {

  /* ===================== AI FOUNDATIONS ===================== */

  'what-is-ai': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is the fundamental difference between traditional software and AI systems?',
      options: [
        'AI is faster than traditional software',
        'Traditional software follows explicit rules; AI systems learn patterns from data',
        'AI requires more hardware than traditional software',
        'Traditional software can only run on desktop computers'
      ],
      correct: 1,
      explanation: 'Traditional software executes a set of rules written by programmers. AI systems, especially machine learning models, learn patterns from data without being explicitly programmed for every case — this is the key distinction.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      question: 'Which of the following correctly describes the relationship between AI, Machine Learning, and Deep Learning?',
      options: [
        'They are three completely separate fields with no overlap',
        'Machine Learning is a subset of Deep Learning, which is a subset of AI',
        'Deep Learning is a subset of Machine Learning, which is a subset of AI',
        'AI is a subset of Machine Learning'
      ],
      correct: 2,
      explanation: 'AI is the broadest field. Machine Learning is a subset of AI focused on learning from data. Deep Learning is a subset of ML that uses multi-layer neural networks. Think of nested circles: AI > ML > Deep Learning.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'scenario',
      question: 'You\'re explaining AI to a friend who thinks AI will immediately replace all human jobs. What is the most accurate response?',
      options: [
        '"You\'re right — AI will replace all jobs within 5 years"',
        '"AI is just hype and won\'t change anything significant"',
        '"Current AI excels at narrow, well-defined tasks. AGI that matches human reasoning across all domains doesn\'t exist yet, and most scenarios involve AI augmenting humans rather than fully replacing them"',
        '"AI can only play board games and recognize cats in photos"'
      ],
      correct: 2,
      explanation: 'Current AI is "narrow AI" — extremely good at specific tasks but lacking general reasoning. AGI (Artificial General Intelligence) remains theoretical. The realistic near-term scenario is AI augmenting human workers, automating routine tasks, and changing the nature of work rather than eliminating all jobs overnight.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'Why do AI language models sometimes "hallucinate" facts?',
      options: [
        'They are deliberately programmed to make up answers',
        'They generate text by predicting likely next words based on patterns, not by retrieving verified facts from a database',
        'They have too little training data',
        'Hallucination only happens in older AI models'
      ],
      correct: 1,
      explanation: 'LLMs generate text by predicting what tokens most likely come next based on statistical patterns learned during training. They don\'t "look up" facts. When asked about something rare or outside their training, they produce plausible-sounding but potentially incorrect text — this is hallucination.',
      xp: 10
    }
  ],

  'llm-basics': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is a "token" in the context of large language models?',
      options: [
        'A cryptocurrency used to pay for AI services',
        'A security credential for API access',
        'A chunk of text (roughly 4 characters or 3/4 of a word) that LLMs use as their basic unit of processing',
        'A complete sentence that the model processes at once'
      ],
      correct: 2,
      explanation: 'Tokens are the basic processing units of LLMs. A token is roughly 4 characters or ¾ of a word on average. "Unbelievable" might be 3-4 tokens. Understanding tokens is important because LLM pricing, context limits, and performance are all measured in tokens.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      question: 'What does RLHF (Reinforcement Learning from Human Feedback) accomplish in LLM training?',
      options: [
        'It makes LLMs faster at generating responses',
        'It increases the size of the model\'s context window',
        'It teaches the model to produce responses that humans rate as helpful, harmless, and honest',
        'It reduces the cost of running the model in production'
      ],
      correct: 2,
      explanation: 'RLHF is a training technique where human raters evaluate model outputs, and the model is rewarded for producing better-rated responses. This "alignment" process transforms a raw text predictor into a helpful, safer assistant — it\'s why ChatGPT feels different from earlier GPT models.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'scenario',
      question: 'You need an AI to analyze a 50,000-word business document in a single conversation. Which model capability should you specifically look for?',
      options: [
        'High temperature setting',
        'A large context window (ideally 100K+ tokens)',
        'Fast response speed',
        'Multi-language support'
      ],
      correct: 1,
      explanation: '50,000 words ≈ 65,000-70,000 tokens. You need a model with a context window large enough to hold the entire document — Claude 3 offers 200K tokens, Gemini 1.5 Pro offers up to 1M tokens. Without sufficient context, the model would need to truncate the document.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'What is the "transformer" architecture, which underlies most modern LLMs?',
      options: [
        'A type of robotics actuator used in AI hardware',
        'A neural network design using "attention" mechanisms that allow the model to understand how different words in a sequence relate to each other',
        'A compression algorithm that reduces model file sizes',
        'A technique for converting images into text descriptions'
      ],
      correct: 1,
      explanation: 'The transformer architecture, introduced in the 2017 "Attention Is All You Need" paper, uses self-attention mechanisms to process all words in a sequence simultaneously and understand their relationships. This was the breakthrough that enabled modern LLMs like GPT, BERT, and Claude.',
      xp: 10
    }
  ],

  'responsible-ai': [
    {
      id: 'q1',
      type: 'scenario',
      question: 'A colleague asks you to use ChatGPT to analyze 500 customer medical records to find trends. What is the primary concern?',
      options: [
        'ChatGPT might analyze the data too slowly',
        'Inputting protected health information (PHI) into a public AI tool likely violates HIPAA and patient privacy agreements',
        'ChatGPT doesn\'t understand medical terminology',
        'The analysis results would not be accurate enough'
      ],
      correct: 1,
      explanation: 'Medical records are Protected Health Information (PHI) under HIPAA. Sending PHI to public AI tools like ChatGPT violates patient privacy and potentially HIPAA regulations. For medical data analysis, you need HIPAA-compliant tools with Business Associate Agreements (BAAs) — or to use anonymized/de-identified data.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      question: 'Why might over-reliance on AI for all writing tasks be harmful to your career long-term?',
      options: [
        'AI writing is always lower quality than human writing',
        'It could atrophy your writing skills and critical thinking, making you dependent on a tool and unable to communicate effectively without it',
        'Employers can always detect AI-generated writing',
        'AI writing tools are too expensive for regular use'
      ],
      correct: 1,
      explanation: 'Skills not practiced deteriorate. If AI always writes for you, your own writing, reasoning, and communication skills may weaken over time. Additionally, when AI tools are unavailable, expensive, or wrong, you need the underlying skills to catch errors and work independently. AI should augment, not replace, fundamental skills.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What is the most responsible way to use AI for research on a critical topic?',
      options: [
        'Accept AI outputs as facts since AI is very knowledgeable',
        'Use AI to understand concepts and map the space, then verify key claims against primary sources before drawing conclusions',
        'Only use AI for topics where accuracy doesn\'t matter',
        'Never use AI for research at all'
      ],
      correct: 1,
      explanation: 'The responsible research workflow uses AI\'s speed for exploration and comprehension, then applies human verification against primary sources for critical facts. AI excels at explaining and synthesizing; humans must verify. This combines the best of both without the risks of blind AI trust.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'scenario',
      question: 'You\'re a student and used AI to help brainstorm and outline your essay, but wrote all the actual text yourself. What should you do?',
      options: [
        'Nothing — AI assistance is always acceptable in academic work',
        'Claim the essay was entirely your own work',
        'Check your institution\'s AI policy and disclose AI assistance in the manner required by those guidelines',
        'Delete the AI conversation history to avoid detection'
      ],
      correct: 2,
      explanation: 'Academic AI policies vary widely — some institutions prohibit any AI use, others permit it with disclosure. The responsible approach is to know your institution\'s policy and follow it. Failing to disclose where required is a form of academic dishonesty regardless of how the AI was used.',
      xp: 10
    }
  ],

  'ai-ethics': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'A facial recognition system performs with 99% accuracy on light-skinned faces but only 65% accuracy on darker-skinned faces. What type of problem is this?',
      options: [
        'A hardware malfunction',
        'Algorithmic bias resulting from unrepresentative training data',
        'A deliberate design choice by the developers',
        'A problem only affecting low-quality cameras'
      ],
      correct: 1,
      explanation: 'This is algorithmic bias — the model performs unequally across demographic groups. It typically results from training data that overrepresents light-skinned faces and underrepresents darker-skinned faces. The algorithm learned from biased data and its bias manifests as performance disparities.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      question: 'What is an "AI feedback loop" and why is it problematic?',
      options: [
        'When AI systems learn from their own outputs, amplifying existing biases over time',
        'When users repeatedly ask the same question to an AI',
        'A programming error that causes AI to run in infinite loops',
        'When AI models are trained too many times on the same data'
      ],
      correct: 0,
      explanation: 'An AI feedback loop occurs when a biased AI system makes decisions that create biased outcomes, which then feed back as training data, reinforcing the original bias. Example: A biased hiring algorithm rejects certain candidates → only certain people get hired → future training data reflects this hiring pattern → the bias grows stronger.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'scenario',
      question: 'A hospital wants to use AI to prioritize which patients receive follow-up care. What ethical concern is most important to address?',
      options: [
        'Whether the AI interface is visually appealing',
        'Whether the AI system produces fair outcomes across racial, gender, and socioeconomic groups, and whether there is human oversight for consequential decisions',
        'Whether the AI responds fast enough for clinical settings',
        'Whether the AI is more accurate than doctors at diagnosis'
      ],
      correct: 1,
      explanation: 'Healthcare AI decisions are life-or-death. The primary concerns are fairness (does the AI discriminate against any demographic group?), transparency (can clinicians understand why the AI made a recommendation?), and oversight (is a qualified human making the final decision?). In high-stakes domains, these ethical considerations must be addressed before deployment.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'What is "explainable AI" (XAI) and why does it matter?',
      options: [
        'AI systems that can explain jokes',
        'Making AI models that are simpler and less capable so they\'re easier to understand',
        'Methods and techniques that make AI decisions interpretable and understandable to humans, enabling auditing and trust',
        'AI that writes documentation for software automatically'
      ],
      correct: 2,
      explanation: 'Explainable AI (XAI) refers to techniques that make AI decision-making interpretable. This matters for accountability (understanding why an AI decided something), debugging (finding and fixing biases), legal compliance (GDPR\'s "right to explanation"), and trust-building (humans need to understand AI before they can appropriately trust it).',
      xp: 10
    }
  ],

  /* ===================== PROMPT ENGINEERING ===================== */

  'beginner-prompting': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'Which prompt will produce the most useful AI response for a business email?',
      options: [
        '"Write an email"',
        '"Help me with email"',
        '"Write a professional email to a client who missed two payment deadlines. The tone should be firm but polite. Keep it under 150 words and end with a clear call-to-action for payment within 5 business days"',
        '"Email writing task: client, payment, late"'
      ],
      correct: 2,
      explanation: 'The third option specifies the recipient (client), situation (missed two payment deadlines), tone (firm but polite), length (under 150 words), and desired outcome (payment within 5 days). This specificity eliminates ambiguity and gives the AI everything needed to produce a useful output.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You ask an AI to "explain machine learning" and get a highly technical response you don\'t understand. What\'s the best next step?',
      options: [
        'Accept that AI is too advanced for you to understand',
        'Switch to a different AI model',
        'Refine your prompt: "Explain machine learning to someone with no technical background, using an everyday analogy"',
        'Search for a different topic'
      ],
      correct: 2,
      explanation: 'Prompting is iterative. When the initial output misses the mark, refine the prompt rather than giving up. Adding "for someone with no technical background" and "using an everyday analogy" tells the AI exactly what level and style of explanation you need. Good prompt engineers iterate quickly.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What does specifying the audience ("Explain this for a 10-year-old" vs "Explain this for a PhD student") accomplish?',
      options: [
        'It changes how fast the AI responds',
        'It calibrates vocabulary, depth, analogies, and assumed prior knowledge to match the target reader\'s level',
        'It determines which language the AI responds in',
        'It has no real effect on the output quality'
      ],
      correct: 1,
      explanation: 'Audience specification is one of the most powerful prompting levers. The AI adjusts everything: vocabulary complexity, assumed knowledge, use of technical terms, depth of explanation, and choice of analogies. "For a 10-year-old" might get: "AI is like teaching a dog tricks." "For a PhD student" might get a discussion of gradient descent and loss functions.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'Which element is MOST commonly missing from weak AI prompts?',
      options: [
        'The topic of the request',
        'Context, desired format, audience, and specific constraints — the "why" and "how" that shapes the output',
        'The word "please"',
        'A greeting like "Hello AI"'
      ],
      correct: 1,
      explanation: 'Most people write prompts that state the topic but omit context (why you need this, what you\'ll use it for), format (how you want the output structured), audience (who will read it), and constraints (length, tone, complexity). These details are what separate expert prompt outputs from mediocre ones.',
      xp: 10
    }
  ],

  'role-prompting': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is the primary benefit of role prompting?',
      options: [
        'It makes the AI respond faster',
        'It causes the AI to draw more heavily on domain-specific knowledge and communication patterns appropriate to that role',
        'It prevents the AI from making any errors',
        'It allows the AI to access real-time internet data'
      ],
      correct: 1,
      explanation: 'Role prompting leverages the AI\'s knowledge of how domain experts think, communicate, and structure information. A "UX researcher" role produces research-style analysis with specific frameworks; a "Python expert" role produces code with best practices for that language. The role acts as a lens that filters and focuses the AI\'s knowledge.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You want to get critical, honest feedback on your business plan. Which role assignment is most effective?',
      options: [
        '"You are a supportive friend reviewing my business plan"',
        '"You are a Series A venture capitalist who has reviewed 500+ pitches and has a reputation for direct, critical feedback. Identify the top weaknesses that would cause you to decline investing"',
        '"You are an AI assistant. Review my business plan"',
        '"You are the world\'s best business expert"'
      ],
      correct: 1,
      explanation: 'The best role prompts are specific: they name the exact role (Series A VC), provide relevant experience (500+ pitches), clarify the communication style (direct, critical), and specify the task aligned with that role (decline reasons). Vague roles ("best business expert") produce generic responses; specific roles produce calibrated expertise.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What important limitation should you always remember when using role prompting?',
      options: [
        'Role prompts only work with expensive AI models',
        'The AI with a "doctor" or "lawyer" role does not have actual professional credentials — critical decisions still require real professionals',
        'You can only use role prompting once per conversation',
        'Role prompting makes AI responses less accurate'
      ],
      correct: 1,
      explanation: 'Role prompting improves AI output quality but doesn\'t grant the AI actual credentials, accountability, or access to your specific legal/medical situation. "AI acting as a doctor" cannot examine you, access your medical history, or be held medically liable. Always use AI role-based advice as a starting point, not a final decision for high-stakes domains.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'How does the "skeptical editor" role improve writing quality?',
      options: [
        'It makes the AI write in a more poetic style',
        'It causes the AI to review writing from a critical perspective, finding logical gaps, weak arguments, and unsupported claims that the writer\'s bias would make them miss',
        'It shortens the AI\'s responses',
        'It makes the AI refuse to help with the task'
      ],
      correct: 1,
      explanation: 'A "skeptical editor" role inverts the AI\'s usual helpful-and-affirming mode into critical-and-probing mode. The AI will flag unsupported claims, identify logical leaps, question evidence quality, and find structural weaknesses — acting like a rigorous peer reviewer rather than a supportive collaborator. This is invaluable for strengthening arguments before they face real scrutiny.',
      xp: 10
    }
  ],

  'few-shot-prompting': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is the key difference between zero-shot and few-shot prompting?',
      options: [
        'Few-shot prompting only works with fewer words',
        'Zero-shot asks the AI directly; few-shot provides 2-5 input-output examples before the actual request to establish the desired pattern',
        'Zero-shot is more advanced than few-shot',
        'Few-shot prompting requires a paid AI subscription'
      ],
      correct: 1,
      explanation: 'Zero-shot: "Classify this review as positive or negative: [review]" — no examples given. Few-shot: [2-3 example review/classification pairs] then "Now classify: [new review]." Few-shot is more reliable for pattern-sensitive tasks because you show the AI exactly what you want rather than just describing it.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You need to extract structured data (name, date, amount) from 1,000 invoice emails in a consistent JSON format. What prompting technique will give the most reliable results?',
      options: [
        'Zero-shot: just describe what you want extracted',
        'Few-shot: provide 3-4 example invoice emails with their correct JSON outputs, then process each new invoice',
        'Role prompting: "Act as a data extraction expert"',
        'Just ask the AI to "do its best" with the emails'
      ],
      correct: 1,
      explanation: 'For structured data extraction requiring consistent format, few-shot is the gold standard. By showing exact input-output examples with the correct JSON structure, the AI learns the exact format to follow — critical for downstream data processing that depends on consistent structure. This reduces format errors dramatically compared to zero-shot approaches.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'How does Chain-of-Thought (CoT) prompting improve AI performance on math problems?',
      options: [
        'It makes the AI work faster by skipping intermediate steps',
        'It forces the model to show its reasoning step-by-step before concluding, catching logical errors before they produce wrong final answers',
        'It reduces the number of tokens used in the response',
        'It connects the AI to a math calculator'
      ],
      correct: 1,
      explanation: 'Without CoT, the AI might jump straight to an answer and guess wrong. With CoT ("Let\'s think step by step"), the model must reason through each step sequentially. This serializes the reasoning process and allows the model to catch errors at each step before they propagate to a wrong conclusion. CoT improves math accuracy by 15-30% in studies.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'When is few-shot prompting MOST valuable compared to just describing what you want?',
      options: [
        'When you\'re asking simple factual questions',
        'When the task requires a very specific output format, style, or pattern that\'s easier to show than describe',
        'When you want shorter AI responses',
        'When asking for creative writing'
      ],
      correct: 1,
      explanation: '"Show, don\'t tell" is the core principle behind few-shot prompting. Some output patterns are hard to describe but easy to demonstrate. A specific JSON schema, a particular writing tone, a custom classification taxonomy, a specialized data transformation — these are all better communicated through examples than through description.',
      xp: 10
    }
  ],

  'structured-prompting': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'Why should you use delimiters (like triple quotes or XML tags) when including user-provided content in a prompt?',
      options: [
        'It makes the prompt look more professional',
        'It clearly separates instructions from data, preventing the AI from confusing user content with your instructions — which could lead to prompt injection attacks',
        'It reduces the token count of the prompt',
        'Delimiters are required by all AI APIs'
      ],
      correct: 1,
      explanation: 'Without delimiters, malicious user input could be interpreted as instructions (prompt injection). With delimiters like <user_input>...</user_input>, the AI treats the enclosed content as data to process, not instructions to follow. This is both a security and reliability practice in production AI applications.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You\'re building a prompt template that will process hundreds of different customer emails. What\'s the best practice?',
      options: [
        'Write a new prompt from scratch for each email',
        'Build a reusable template with [PLACEHOLDER] variables for the email content, and fixed sections for role, task, and output format',
        'Use the same vague prompt for all emails and accept inconsistent results',
        'Let each team member write their own prompt'
      ],
      correct: 1,
      explanation: 'Template prompts with placeholders enable consistency at scale. The fixed sections (role, task, output format) are refined once and reused across all inputs. Only the variable content (the email) changes. This ensures consistent output quality, reduces per-user prompt skill requirements, and makes it easy to improve quality by updating one template.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What is the advantage of specifying an output format (like JSON or a specific table structure) in your prompt?',
      options: [
        'The AI will respond faster with a specified format',
        'Specifying the output format makes AI responses reliably parseable and processable downstream, critical when AI outputs are consumed by code or other systems',
        'AI always produces perfect JSON without being asked',
        'Output format specification is only needed for very long responses'
      ],
      correct: 1,
      explanation: 'When AI output feeds into code, databases, or other systems, inconsistent formats break the pipeline. By specifying exact output structure (e.g., "respond only with valid JSON with the schema {name: string, score: 1-10, reasoning: string}"), you make outputs reliably machine-readable and eliminate format variation that causes downstream errors.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'Which structured prompt element is most effective for reducing AI misinterpretation of complex tasks?',
      options: [
        'Making the prompt as long as possible',
        'Using numbered step-by-step instructions that clearly sequence the task components',
        'Repeating the main request three times in different ways',
        'Writing the prompt in all capital letters'
      ],
      correct: 1,
      explanation: 'Numbered sequential instructions ("1. First do X. 2. Then do Y. 3. Finally format as Z.") reduce ambiguity by establishing a clear processing order. The AI knows exactly what to do first, what depends on what, and what the final output should look like. This is especially important for multi-step tasks where order matters.',
      xp: 10
    }
  ],

  'advanced-prompting': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is "prompt chaining" and when should you use it?',
      options: [
        'Linking multiple AI accounts together for faster responses',
        'Breaking complex tasks into a sequence of prompts where each output feeds the next, used for tasks too complex for a single prompt to handle well',
        'Repeating the same prompt until you get a good answer',
        'Using multiple AI models simultaneously for the same task'
      ],
      correct: 1,
      explanation: 'Prompt chaining decomposes complex tasks: Prompt 1 researches the topic → its output feeds Prompt 2 which analyzes the research → that output feeds Prompt 3 which writes the final document. Each step is simpler and more reliable than asking one prompt to do everything. This mirrors how expert humans break complex work into stages.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You\'re using an AI to generate high-stakes recommendations and want maximum accuracy. What technique should you use?',
      options: [
        'Just trust whatever the AI says first',
        'Self-consistency: generate the same request 3 times with slight variations and choose the most commonly occurring answer or insight',
        'Use the longest response as it contains the most information',
        'Ask the AI to be "extra careful" in its response'
      ],
      correct: 1,
      explanation: 'Self-consistency sampling generates multiple independent responses to the same question and aggregates the results. Consistent answers across multiple generations are more reliable than any single generation. This is especially powerful for factual questions and reasoning tasks — if 3 out of 3 responses give the same answer, confidence is much higher.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What is meta-prompting?',
      options: [
        'Writing prompts using metadata from files',
        'Asking the AI to generate or improve prompts for your task — using AI to make your prompts better',
        'Writing prompts about AI itself',
        'A technique only available in the OpenAI API'
      ],
      correct: 1,
      explanation: 'Meta-prompting: "I need to ask you [type of question]. Write the ideal prompt for this task that would get the best possible response from an AI system like you." The AI understands its own architecture and capabilities better than most users, so it can often generate prompts that elicit superior outputs — effectively bootstrapping prompt quality.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'scenario',
      question: 'You use the self-critique loop (generate → critique → improve) on a business email. What is the expected outcome compared to a single-pass generation?',
      options: [
        'The final email will be shorter but not necessarily better',
        'The process mirrors human writing (draft → review → revise), producing higher quality output that addresses weaknesses the first draft overlooked',
        'The three-step process produces the same quality as a single well-written prompt',
        'Self-critique loops always make AI responses longer and harder to read'
      ],
      correct: 1,
      explanation: 'The self-critique loop is a process improvement, not just a length multiplier. Step 1 generates a first draft. Step 2 applies critical analysis (the AI as editor finds flaws). Step 3 revises specifically to address those flaws. Research shows multi-step refinement produces meaningfully higher quality than single-pass generation, especially for argumentative writing, code, and complex analysis.',
      xp: 10
    }
  ],

  /* ===================== CHATGPT MASTERY ===================== */

  'chatgpt-research': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'Why should you verify academic paper suggestions from ChatGPT using Google Scholar?',
      options: [
        'Google Scholar has better paper recommendations',
        'ChatGPT sometimes generates plausible-sounding but non-existent paper titles and authors (hallucination)',
        'ChatGPT doesn\'t know about academic research',
        'Google Scholar papers are always more recent'
      ],
      correct: 1,
      explanation: 'ChatGPT has been documented "hallucinating" paper citations — inventing paper titles, author names, and journal names that sound legitimate but don\'t exist. Always search for specific citations on Google Scholar, PubMed, or Semantic Scholar before citing them. Use ChatGPT to identify research areas and key authors, then verify specific papers independently.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You need to understand a complex paper on quantum computing for a presentation. What\'s the most effective ChatGPT research workflow?',
      options: [
        'Ask ChatGPT to summarize the paper from memory',
        'Paste the paper\'s abstract and key sections into ChatGPT and ask: "Explain the key contributions of this paper, its methodology, main findings, and significance for someone with basic physics knowledge"',
        'Ask ChatGPT "what do you know about quantum computing?"',
        'Use ChatGPT to find a simpler paper on the same topic'
      ],
      correct: 1,
      explanation: 'Pasting the actual content (abstract, key sections) grounds ChatGPT in the real paper rather than relying on potentially imperfect recall. This ensures accuracy. Asking for explanation at "basic physics knowledge" level calibrates the depth. This workflow combines ChatGPT\'s explanation ability with primary source accuracy.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What is ChatGPT\'s most significant limitation for research on very recent events (last 3-6 months)?',
      options: [
        'ChatGPT responds too slowly for time-sensitive research',
        'ChatGPT has a training data cutoff — it doesn\'t know about events after its cutoff date unless browsing is enabled',
        'ChatGPT can only research topics in English',
        'ChatGPT doesn\'t allow research questions'
      ],
      correct: 1,
      explanation: 'LLMs like ChatGPT are trained on data up to a cutoff date and don\'t have real-time knowledge unless given access to web search tools. For very recent developments (product launches, policy changes, new research, market movements), either enable ChatGPT\'s browsing feature or use a tool with live internet access like Grok or Perplexity.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'What is the most effective prompt for generating novel research questions?',
      options: [
        '"What questions should I research?"',
        '"Give me a question about climate change"',
        '"Generate 10 specific, understudied research questions about [topic] that would make strong thesis topics. For each, explain why it\'s underexplored and what methodology might best address it"',
        '"What are the biggest problems in [field]?"'
      ],
      correct: 2,
      explanation: 'The third option is specific ("10 questions"), focused on originality ("understudied"), provides context for quality assessment ("strong thesis topics"), and asks for reasoning ("why underexplored") and methodology — all elements that make the output immediately actionable. Vague questions get vague responses; specific meta-criteria get specific, usable outputs.',
      xp: 10
    }
  ],

  'chatgpt-writing': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is the best way to prevent AI-generated writing from sounding generic and impersonal?',
      options: [
        'Use a more expensive AI model',
        'Ask for "creative" writing',
        'Share 2-3 examples of your own writing and ask the AI to match that specific voice, tone, and style',
        'Use very simple, direct language in your prompts'
      ],
      correct: 2,
      explanation: 'AI has a recognizable "default style" that readers can detect. The most effective way to get AI to write in your voice is to show it examples of your actual writing. The AI analyzes your sentence structure, vocabulary preferences, rhythm, and stylistic quirks — then emulates them. This produces outputs that sound like you, not like a generic AI assistant.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You have a 1,500-word blog post to write. What is the most effective AI-assisted workflow?',
      options: [
        'Ask ChatGPT to write the entire article in one shot and publish it directly',
        'Brainstorm angle → AI creates outline → you refine outline → write key points yourself → AI assists with transitions and supporting content → you edit for voice and verify facts',
        'Write the article yourself first, then ask AI to make minor edits',
        'Use AI only to write the introduction, write the rest yourself'
      ],
      correct: 1,
      explanation: 'The collaborative workflow combines your judgment and voice with AI\'s speed and drafting ability. Brainstorming with AI finds better angles faster. Outlines from AI are refined by you for structure. You write the substance; AI helps with fluency. You do final editing for accuracy and voice. This approach produces better articles faster than either solo writing or fully AI-generated content.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What prompt best demonstrates the "content repurposing" use case?',
      options: [
        '"Make this blog post longer"',
        '"Transform this 1,500-word blog post into: a 280-character tweet, a 5-tweet thread, a 200-word LinkedIn post, and a 100-word email newsletter intro"',
        '"Write a summary of this blog post"',
        '"Convert this blog post to HTML"'
      ],
      correct: 1,
      explanation: 'Content repurposing multiplies the value of existing content by reformatting it for different platforms and audiences. The prompt specifies exact character/word counts for each platform — critical because Twitter, LinkedIn, and email have very different optimal lengths and formats. One well-researched piece becomes a week\'s worth of social content.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'When asking ChatGPT to edit your writing, what instruction produces the most useful feedback?',
      options: [
        '"Make this better"',
        '"Fix any typos"',
        '"Edit this piece for: clarity (eliminate jargon), flow (smooth paragraph transitions), conciseness (cut 20%), and argument strength (flag unsupported claims)"',
        '"Rewrite this completely in your own style"'
      ],
      correct: 2,
      explanation: 'Specific editing criteria produce targeted, useful feedback. Each criterion gives the AI a clear editing lens: clarity (vocabulary choices), flow (transitions), conciseness (word reduction target), and argument strength (logical analysis). Vague instructions like "make this better" produce vague, generic edits. Specific criteria produce precise, actionable improvements.',
      xp: 10
    }
  ],

  'chatgpt-coding': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What information should you always include when asking ChatGPT to debug an error?',
      options: [
        'Only the error message',
        'Only the problematic line of code',
        'The full error message, the relevant code section, what you were trying to do, and what you\'ve already tried',
        'Your entire codebase'
      ],
      correct: 2,
      explanation: 'Debugging context is critical. The error message tells ChatGPT what went wrong. The code section shows where it went wrong. "What you were trying to do" provides intent. "What you\'ve tried" prevents duplicate suggestions. Without this context, ChatGPT guesses at causes rather than diagnosing them accurately.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You ask ChatGPT to write a function and it provides working code, but it looks different from your project\'s style. What should you do?',
      options: [
        'Accept the code as is and use it',
        'Ask ChatGPT to rewrite it: "Refactor this to use [your language version], follow [your style guide/pattern], and match this existing function as a style reference: [paste similar function]"',
        'Give up and write it manually',
        'Ask a different AI model'
      ],
      correct: 1,
      explanation: 'Code consistency matters for maintainability. Give ChatGPT a style reference by pasting an existing function from your codebase, and specify your project\'s language version and any relevant conventions. ChatGPT can match coding style with high accuracy when given concrete examples — this prevents the jarring inconsistency of AI-generated code that looks like it\'s from a different project.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What makes ChatGPT particularly useful for unit test generation?',
      options: [
        'ChatGPT can run the tests to verify they work',
        'ChatGPT can systematically identify edge cases, boundary conditions, and error scenarios that developers often overlook when writing their own tests',
        'ChatGPT writes tests faster than humans can type',
        'ChatGPT knows which tests are required by law'
      ],
      correct: 1,
      explanation: 'Developers tend to test the happy path and obvious edge cases. ChatGPT, having been trained on vast amounts of code and bug reports, systematically surfaces edge cases like: null inputs, empty arrays, maximum values, concurrent calls, network failures, and type mismatches — scenarios that human developers, focused on making code work, tend to underprioritize.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'What critical step should you always take before using AI-generated code in production?',
      options: [
        'Print the code and have a manager sign off',
        'Wait 24 hours before using it',
        'Read and understand the code, test it thoroughly, and verify it handles edge cases and security requirements for your specific use case',
        'Run it through a second AI model for validation'
      ],
      correct: 2,
      explanation: 'AI-generated code can contain subtle bugs, security vulnerabilities, deprecated APIs, or performance issues that aren\'t obvious at first glance. You are responsible for the code in your codebase. Reading and understanding it is non-negotiable — "blind copy-paste" coding is a serious professional risk. Test it, review it, and understand it before shipping it.',
      xp: 10
    }
  ],

  'chatgpt-productivity': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What are ChatGPT\'s Custom Instructions, and why are they valuable for regular users?',
      options: [
        'A way to teach ChatGPT new capabilities it doesn\'t have by default',
        'Persistent context about who you are, what you do, and how you want ChatGPT to respond — saved across all conversations so you don\'t re-explain yourself every session',
        'A method to restrict what topics ChatGPT can discuss',
        'A way to increase ChatGPT\'s response speed'
      ],
      correct: 1,
      explanation: 'Custom Instructions let you set persistent preferences: your profession, technical level, preferred response format, communication style, etc. Without them, you re-explain context in every new conversation. With them, ChatGPT always knows you\'re, say, "a solo developer building SaaS tools who prefers concise technical answers without caveats" — saving significant time across hundreds of sessions.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You have 30 minutes before a high-stakes meeting with a new client in an industry you know little about. How should you use ChatGPT to prepare?',
      options: [
        '"Tell me about the company"',
        '"I have 30 minutes before a meeting with [Company Name], a [industry] company. I need to: understand their business model, know the key industry trends and challenges they face, anticipate the questions they\'ll ask, and have 5 smart questions to ask them. Be concise and practical."',
        '"What should I say in a client meeting?"',
        '"Help me make small talk for my meeting"'
      ],
      correct: 1,
      explanation: 'The second prompt is a complete preparation brief with a time constraint, specific company context, and four distinct outputs needed. It tells ChatGPT exactly what "prepared for this meeting" means. This level of specificity produces a focused, actionable preparation guide rather than a generic guide to client meetings.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What is a "prompt library" and why should AI power users maintain one?',
      options: [
        'A paid service that sells pre-written prompts',
        'A personal collection of high-performing prompt templates for frequently recurring tasks, enabling consistent quality and time savings',
        'A feature built into ChatGPT for saving prompts',
        'A book of prompts published by OpenAI'
      ],
      correct: 1,
      explanation: 'A prompt library is a personal knowledge asset. When you discover a prompt that consistently produces great outputs, saving it (with [PLACEHOLDER] variables) means you only develop it once and reuse it forever. Over time, this library becomes your personal AI operating system — a set of battle-tested tools for your most common tasks.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'Which ChatGPT productivity use case has the highest time-to-value ratio for most knowledge workers?',
      options: [
        'Generating complex data visualizations',
        'Writing professional emails and communications with the right tone for tricky situations',
        'Managing calendar and scheduling',
        'Running automated financial calculations'
      ],
      correct: 1,
      explanation: 'Professional communication (emails, Slack messages, performance reviews, difficult feedback, negotiation messages) is a daily, high-stakes activity for knowledge workers. Getting the tone exactly right often takes 20-30 minutes per message. ChatGPT can draft a well-toned message in 30 seconds, which the user then edits for 2-3 minutes. This 85%+ time saving applies to multiple messages daily — the cumulative weekly saving is significant.',
      xp: 10
    }
  ],

  /* ===================== CLAUDE MASTERY ===================== */

  'claude-analysis': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What distinguishes Claude\'s analytical approach from many other LLMs?',
      options: [
        'Claude is always faster to respond',
        'Claude tends to be more nuanced and calibrated — more willing to acknowledge uncertainty and explore multiple perspectives rather than giving overconfident single answers',
        'Claude refuses to analyze complex topics',
        'Claude only analyzes topics related to technology'
      ],
      correct: 1,
      explanation: 'Claude\'s Constitutional AI training emphasizes epistemic honesty — being calibrated about what it knows vs. doesn\'t know. Claude is more likely to say "this is genuinely contested" or "the evidence supports X but Y is also plausible because..." rather than giving a falsely confident single answer. This calibrated uncertainty is especially valuable for complex analytical tasks.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You want Claude to produce the most rigorous analysis of a business decision. What additional instruction improves output quality most?',
      options: [
        '"Be thorough"',
        '"Use bullet points"',
        '"Steelman the opposing viewpoint, identify my cognitive biases, and tell me where my assumptions might be wrong — be direct about flaws in my thinking"',
        '"Keep the analysis under 200 words"'
      ],
      correct: 2,
      explanation: '"Steelmanning" (presenting the strongest opposing argument) + bias identification + assumption challenge is a powerful analytical triplet. It combats confirmation bias and forces Claude to play devil\'s advocate rigorously. Claude is particularly good at this because it\'s trained to consider multiple perspectives and isn\'t emotionally invested in your plan succeeding.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What is "Constitutional AI" and how does it affect Claude\'s behavior?',
      options: [
        'A system where Claude can quote legal constitutions',
        'An Anthropic training approach that teaches Claude a set of principles (like being helpful, harmless, and honest) and uses them to guide behavior during training',
        'A government-mandated AI safety framework',
        'A technical architecture that makes Claude\'s responses more structured'
      ],
      correct: 1,
      explanation: 'Constitutional AI (CAI) is Anthropic\'s approach to AI alignment. Instead of only relying on human feedback, they give the AI a "constitution" — a set of principles — and train it to evaluate and revise its own outputs according to those principles. This results in more consistent values-based behavior and contributes to Claude\'s tendency toward nuanced, honest analysis.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'When is Claude\'s Socratic dialogue mode most useful?',
      options: [
        'When you want quick, simple answers',
        'When you want Claude to ask you probing questions to help you clarify your thinking, surface assumptions, and refine your understanding of a problem',
        'When you need Claude to teach you a specific skill',
        'When you want Claude to debate itself'
      ],
      correct: 1,
      explanation: 'Socratic dialogue (Claude asking YOU questions) is valuable when you\'re grappling with an unclear problem, trying to make a complex decision, or developing your thinking on a topic. Rather than Claude telling you what to think, it probes your reasoning, challenges your assumptions, and guides you to clearer thinking yourself. This is education, not just information delivery.',
      xp: 10
    }
  ],

  'claude-documents': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'How many pages of text can Claude\'s 200K token context window approximately hold?',
      options: [
        '10-15 pages',
        '50-75 pages',
        'Approximately 150,000 words — equivalent to a 500+ page book or a large research report',
        '10,000 pages'
      ],
      correct: 2,
      explanation: '200,000 tokens ≈ 150,000 words ≈ 500+ pages of text. This enables Claude to read an entire book, full legal contract, complete financial report, or large codebase in a single conversation. This is a fundamental capability advantage for document-heavy professional work compared to models with smaller context windows.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You receive a 60-page vendor contract. What is the most valuable prompt for an initial Claude review?',
      options: [
        '"Summarize this contract"',
        '"Is this contract good?"',
        '"Review this contract and: 1) Flag the 5 riskiest clauses for my company 2) Identify unusual indemnification or liability language 3) Note what\'s missing that\'s standard in vendor contracts 4) Summarize my payment obligations and penalty terms"',
        '"What type of contract is this?"'
      ],
      correct: 2,
      explanation: 'The specific multi-part prompt converts a vague "review" into actionable deliverables. Each question addresses a specific risk dimension: clause risk, unusual language, standard gap analysis, and financial obligations. This structured approach ensures Claude\'s analysis covers the areas most likely to contain costly terms — not just a general summary.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What task is Claude\'s large context window particularly valuable for that smaller-context models struggle with?',
      options: [
        'Writing short email replies',
        'Answering simple factual questions',
        'Analyzing and synthesizing multiple long documents simultaneously — comparing, contrasting, and finding cross-document patterns',
        'Generating images from text descriptions'
      ],
      correct: 2,
      explanation: 'With a large context window, you can paste multiple complete documents — several research papers, competing proposals, different contract versions, multiple quarterly reports — and ask Claude to compare them, find contradictions, or synthesize insights across all of them simultaneously. Smaller context models must process documents separately, losing the ability to make direct cross-document comparisons.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'scenario',
      question: 'After having Claude review a contract, it flags a concerning IP assignment clause. What should be your next step?',
      options: [
        'Accept Claude\'s assessment as definitive legal advice and make a decision based solely on it',
        'Ignore Claude\'s flag since AI isn\'t always accurate',
        'Use Claude\'s flag as a starting point — understand what the clause means, then discuss it with a qualified lawyer before signing',
        'Ask Claude to rewrite the clause for you'
      ],
      correct: 2,
      explanation: 'Claude\'s document review is a powerful first-pass triage, not a substitute for legal advice. Claude can identify potentially risky language efficiently (saving attorney time), but a lawyer provides: jurisdiction-specific advice, negotiation strategy, professional accountability, and knowledge of what\'s actually enforceable. Use Claude to identify issues, a lawyer to navigate them.',
      xp: 10
    }
  ],

  'claude-strategy': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is a "pre-mortem" technique and why is Claude well-suited for it?',
      options: [
        'A medical procedure that Claude helps plan',
        'Imagining a plan has already failed and analyzing why — Claude excels at this because it\'s not emotionally invested in your plan succeeding and applies rigorous critical analysis',
        'A business planning exercise only useful in large corporations',
        'Claude\'s technique for summarizing failed projects'
      ],
      correct: 1,
      explanation: 'Pre-mortem (Gary Klein\'s technique) combats planning optimism bias by asking "It\'s the future and we failed — what went wrong?" Claude is particularly effective here because it doesn\'t have emotional attachment to your idea. It applies systematic critical analysis without the cognitive bias that causes humans to downplay risks they want to ignore.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You ask Claude to create a "Porter\'s Five Forces" analysis of the streaming video market. What indicates a high-quality response?',
      options: [
        'The response is very long',
        'The response uses academic language',
        'Each of the five forces is analyzed with specific examples from the actual streaming market, quantified where possible, and the analysis leads to clear strategic implications',
        'Claude acknowledges it cannot perform business analysis'
      ],
      correct: 2,
      explanation: 'A high-quality framework analysis is grounded in specific real-world examples (not generic descriptions), quantified where possible (market share numbers, switching costs), and concludes with actionable implications — not just a description of what the framework is. Framework application is only valuable when it drives to insight.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What does "second-order thinking" mean in strategic analysis, and how does Claude apply it?',
      options: [
        'Thinking about a problem twice',
        'Considering not just the immediate effects of a decision but the downstream effects those effects cause — and asking Claude to trace these cascading consequences',
        'Using two different analytical frameworks',
        'Getting a second opinion from another AI'
      ],
      correct: 1,
      explanation: 'Second-order thinking: "If I do X, Y happens. But if Y happens, then Z follows. And Z causes..." Most people stop at first-order effects. Strategic thinking traces the chain. Prompt Claude: "What are the second and third-order effects of [decision]?" This reveals non-obvious consequences that first-order analysis misses — often the most important strategic considerations.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'When asking Claude to play devil\'s advocate against your strategy, what makes this exercise most valuable?',
      options: [
        'Asking Claude to only find minor, easily fixable problems',
        'Asking Claude to argue as forcefully as possible against your position — including steelmanning objections you\'ve already considered and raising new ones you haven\'t',
        'Asking Claude to confirm which parts of your strategy are correct',
        'Having Claude identify one weakness and suggest a fix'
      ],
      correct: 1,
      explanation: 'The value of devil\'s advocate comes from rigorous adversarial thinking — not gentle suggestions. Asking Claude to argue "as forcefully as possible" forces it to surface its best counter-arguments. Including "steelman" ensures it handles your existing counterarguments properly rather than superficially. Weak devil\'s advocate gives you a false sense of security; strong devil\'s advocate actually strengthens your thinking.',
      xp: 10
    }
  ],

  /* ===================== GEMINI MASTERY ===================== */

  'gemini-multimodal': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is the key architectural advantage of Gemini\'s "native multimodality" vs. adding vision to a text model?',
      options: [
        'Native multimodality makes Gemini cheaper to use',
        'Gemini reasons directly across all modalities simultaneously — not by first converting images to text — enabling richer cross-modal reasoning that catches visual nuances text descriptions miss',
        'Native multimodality allows Gemini to process more tokens per second',
        'Gemini\'s native multimodality means it works offline'
      ],
      correct: 1,
      explanation: 'Models with "bolted-on" vision first caption images into text, then reason from text. Gemini was designed with multimodal reasoning from scratch — it processes pixels, text, and audio in a unified representation. This enables it to reason about visual relationships, spatial arrangements, and visual context that would be lost in a text-only description.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'A product manager wants to use Gemini to compare two competitor product screenshots for UX analysis. What is the ideal approach?',
      options: [
        'Describe both products in text and ask Gemini to compare them based on the descriptions',
        'Upload both screenshots simultaneously and ask Gemini to compare UX philosophy, design language, target user assumptions, and competitive positioning based on what it visually observes',
        'Ask Gemini to find the competitors\' product screenshots online',
        'Upload one screenshot at a time and ask the same question twice'
      ],
      correct: 1,
      explanation: 'Gemini\'s multimodal capability means uploading both screenshots simultaneously allows it to directly compare them — noticing differences in layout, typography, information hierarchy, button design, and visual philosophy that a text-based comparison would miss. Uploading simultaneously is key; sequential analysis prevents direct visual comparison.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'Which type of content can Gemini 1.5 Pro analyze in its extended context window?',
      options: [
        'Only text documents',
        'Text, images, audio, and video simultaneously — up to 1 million tokens',
        'Only images and text together',
        'Any content type but in separate conversations'
      ],
      correct: 1,
      explanation: 'Gemini 1.5 Pro\'s 1M token context window can hold approximately: 1 hour of video, 11 hours of audio, 30,000 lines of code, or 700,000 words of text. Crucially, these can be combined — you could analyze a video alongside a transcript alongside reference documents all in one conversation.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'How does providing context alongside an image improve Gemini\'s visual analysis?',
      options: [
        'Context makes Gemini process images faster',
        'Context tells Gemini your role, decision context, and what you specifically want to understand — which dramatically improves the relevance and depth of visual analysis for your actual needs',
        'Context increases the image resolution Gemini can process',
        'Context prevents Gemini from describing the image incorrectly'
      ],
      correct: 1,
      explanation: 'The same image analyzed by a doctor asking about injury patterns vs. an engineer asking about structural integrity vs. a designer asking about aesthetic quality produces radically different useful analysis. Context focuses Gemini\'s visual analysis on what\'s relevant to your specific role and decision — without it, you get generic description instead of targeted professional insight.',
      xp: 10
    }
  ],

  'gemini-images': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What makes Gemini particularly useful for analyzing business charts and data visualizations?',
      options: [
        'Gemini can regenerate charts with better formatting',
        'Gemini can read chart values, identify trends, interpret statistical patterns, and synthesize business implications — connecting visual data to real-world meaning without manual data extraction',
        'Gemini automatically creates spreadsheets from chart images',
        'Gemini\'s chart analysis feature is available in a separate app'
      ],
      correct: 1,
      explanation: 'Gemini doesn\'t just describe what a chart looks like — it interprets what the data means. It can read approximate values from axes, identify trends (linear, exponential, cyclical), flag anomalies, and synthesize business implications ("This declining trend in Q3 suggests seasonal demand, which would require inventory adjustments in Q2"). This converts visual data into actionable insight.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'An e-commerce company wants to use Gemini to improve product photography. What\'s the most effective use?',
      options: [
        'Ask Gemini to create new product images',
        'Upload existing product photos and ask Gemini to critique them on: background quality, lighting, angle effectiveness, lifestyle appeal, clarity of product benefits — and prioritize which images to reshoot first',
        'Ask Gemini what makes a good product photo in general',
        'Use Gemini to add filters to existing product photos'
      ],
      correct: 1,
      explanation: 'Gemini\'s image analysis provides specific, actionable feedback about existing photos rather than generic photography advice. By uploading actual product images, you get critique grounded in what\'s visible in those specific photos — not hypothetical advice. Prioritizing which to reshoot first maximizes ROI from the photography investment.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What is Gemini\'s Optical Character Recognition (OCR) capability most useful for?',
      options: [
        'Translating text between languages in real time',
        'Extracting and understanding text from scanned documents, handwritten notes, screenshots of forms, or images containing text — enabling analysis of documents that aren\'t digital text files',
        'Generating new text in different handwriting styles',
        'Converting audio to text transcription'
      ],
      correct: 1,
      explanation: 'Gemini can read text embedded in images: scanned invoices, handwritten meeting notes, screenshots of software interfaces, product labels, whiteboard photos, and form images. This bridges the gap between physical/visual content and digital analysis — making even old paper documents or visual media analyzable without manual transcription.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'scenario',
      question: 'A construction manager uploads a photo of a concrete wall and asks Gemini if maintenance is needed. What should they keep in mind?',
      options: [
        'Gemini\'s structural assessment is sufficient for making maintenance decisions',
        'Gemini\'s visual analysis can help identify visible signs of concern, but a qualified structural engineer must make actual safety determinations — AI visual analysis is a screening tool, not a replacement for professional inspection',
        'Gemini cannot analyze construction photos at all',
        'Gemini will contact a contractor automatically based on its assessment'
      ],
      correct: 1,
      explanation: 'Gemini can identify visible deterioration (cracks, spalling, staining) and flag potential issues for follow-up. But structural safety determinations require: physical inspection, testing, professional engineering judgment, and liability acceptance. AI visual analysis is a helpful first screen that can prioritize which areas need professional attention — not a substitute for the professional inspection itself.',
      xp: 10
    }
  ],

  'gemini-video': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is the practical business value of Gemini\'s ability to analyze hour-long video recordings?',
      options: [
        'Gemini can edit video content automatically',
        'Hours of meeting recordings, training sessions, and sales calls can be converted to searchable summaries, action items, and structured insights in minutes — transforming passive video archives into active knowledge bases',
        'Gemini can generate video responses to video inputs',
        'Gemini\'s video analysis is only useful for entertainment content'
      ],
      correct: 1,
      explanation: 'The key value is the time asymmetry: a 2-hour board meeting recording that takes 2 hours to watch can be analyzed by Gemini in minutes, extracting: decisions made, action items assigned, key debate points, and follow-up needed. Organizations with rich video archives but poor discoverability gain immediately by processing these with Gemini.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'A company has 50 hours of recorded sales calls and wants to improve their sales process. How should they use Gemini video analysis?',
      options: [
        'Watch all 50 hours themselves to take notes',
        'Upload representative sample calls and ask Gemini to identify: common objection patterns, moments of customer hesitation, successful objection handling techniques, and missed opportunities — then synthesize across calls',
        'Ask Gemini to generate a sales script based on the recordings',
        'Use Gemini to transcribe all 50 hours first, then analyze the transcripts'
      ],
      correct: 1,
      explanation: 'Gemini can analyze video (not just transcripts), catching non-verbal cues, pacing, and tone alongside content. Asking for patterns across calls enables meta-analysis: what do successful calls have in common? What do deals that closed look like vs. deals that didn\'t? This systematic video analysis would take a sales coach weeks to do manually.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What prompt element is most important when asking Gemini to analyze a lecture video?',
      options: [
        'Specifying the exact video file format',
        'Specifying what you want to learn FROM the lecture and how you\'ll use the extracted information — whether you want a comprehensive summary, specific concepts, test questions, or practical applications',
        'Asking Gemini to watch the video at 2x speed',
        'Telling Gemini how long the video is'
      ],
      correct: 1,
      explanation: '"Analyze this lecture" produces generic output. "Extract the 10 most important concepts with timestamps and create 5 test questions per concept for a biology student" produces structured, actionable educational content. The intended use case shapes what Gemini extracts and how it presents it.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'How does Gemini\'s video understanding compare to simple video transcription services?',
      options: [
        'They are functionally equivalent — Gemini just adds a chatbot interface',
        'Gemini understands visual context alongside audio — seeing what\'s shown on screen, speaker body language, and visual demonstrations — not just transcribing spoken words',
        'Gemini is slower but produces longer transcripts',
        'Transcription services are more accurate than Gemini for video content'
      ],
      correct: 1,
      explanation: 'Transcription converts speech to text. Gemini understands the full video — what\'s displayed on screen (slides, demos, diagrams), speaker gestures and emphasis, visual demonstrations, on-screen text, and how the visual and audio components relate. A coding tutorial transcription shows spoken words; Gemini understands what the instructor coded and demonstrated on screen.',
      xp: 10
    }
  ],

  /* ===================== GROK AI ===================== */

  'grok-research': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What unique data source does Grok have access to that most other AI models lack?',
      options: [
        'Access to classified government databases',
        'Real-time access to posts and discussions on X (formerly Twitter), providing current information beyond training cutoffs',
        'Access to all academic journals published in the last year',
        'Access to private corporate databases'
      ],
      correct: 1,
      explanation: 'Grok\'s integration with X gives it access to what\'s being discussed in real time on the world\'s largest public real-time discourse platform. For emerging trends, breaking news, and current sentiment, this is a genuine differentiator. Other AI models rely on training data with a cutoff date.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You want to understand current user sentiment about a competitor\'s product. Which tool is best suited?',
      options: [
        'ChatGPT, because it has the largest training dataset',
        'Grok, because it can search current X posts for real-time user opinions and frustrations',
        'Claude, because it specializes in document analysis',
        'Gemini, because it can analyze product images'
      ],
      correct: 1,
      explanation: 'Real-time sentiment analysis from social media is Grok\'s niche. X is where people share immediate product experiences, frustrations, and enthusiasm — often before reviews appear on traditional platforms. Grok can synthesize this live discourse into actionable competitive intelligence that no other AI can provide from training data alone.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What is the key advantage of using Grok to monitor an industry\'s X discourse vs. traditional news monitoring?',
      options: [
        'Grok is more accurate than news sources',
        'X discourse surfaces emerging discussions among practitioners, founders, and experts often before mainstream media covers them — Grok captures this early signal',
        'Traditional news monitoring is illegal',
        'Grok can access subscriber-only news articles'
      ],
      correct: 1,
      explanation: 'News lags reality — journalists write about things after they happen. X discourse is where domain experts, founders, and practitioners discuss emerging ideas in real time. An AI researcher posting about a new technique, a founder sharing a market observation, an analyst noting a trend — these signals appear on X weeks before mainstream coverage.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'When is Grok\'s real-time data access LEAST useful?',
      options: [
        'When researching breaking news events',
        'When researching historical scientific concepts, classical literature, or established academic knowledge that doesn\'t change',
        'When monitoring competitor product launches',
        'When tracking market sentiment'
      ],
      correct: 1,
      explanation: 'Real-time data access adds value when recency matters. For stable knowledge — how photosynthesis works, the themes of a Dickens novel, foundational statistics — the information hasn\'t changed and any well-trained model answers equally well. Grok\'s recency advantage is only valuable for time-sensitive topics where the training cutoff of other models is a meaningful limitation.',
      xp: 10
    }
  ],

  'grok-reasoning': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'When should you use Grok\'s "Thinking" (reasoning) mode vs. standard mode?',
      options: [
        'Always use Thinking mode for every question',
        'Use Thinking mode for complex problems requiring methodical step-by-step analysis (math, logic, strategic planning); use standard mode for conversational queries where speed matters more than depth',
        'Use standard mode for math and Thinking mode for creative tasks',
        'Only use Thinking mode when the question mentions numbers'
      ],
      correct: 1,
      explanation: 'Extended thinking mode applies additional computational reasoning — producing more thorough analysis at the cost of response speed. For casual questions, this overhead is unnecessary. For complex multi-step problems where accuracy matters significantly more than speed, Thinking mode produces meaningfully better outputs by catching reasoning errors that quick responses miss.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You want to use Grok Thinking to analyze a complex business investment decision. What instruction makes the analysis most valuable?',
      options: [
        '"Analyze this investment"',
        '"Work through each consideration methodically before concluding: financial return, strategic fit, opportunity cost, execution risk, and market timing. Show your reasoning for each, then integrate into a recommendation with confidence level"',
        '"Give me a quick yes or no on this investment"',
        '"What are the pros and cons of this investment?"'
      ],
      correct: 1,
      explanation: 'The structured instruction with explicit dimensions (financial, strategic, execution, timing) and a requirement to show reasoning makes Thinking mode\'s extended analysis targeted and useful. "Show your reasoning for each" allows you to evaluate the analysis quality, not just accept the conclusion. A confidence level adds calibration.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'How does extended reasoning mode improve performance on logic puzzles?',
      options: [
        'It gives the AI access to a logic puzzle database',
        'Extended reasoning forces the model to trace through each logical step sequentially, catching contradictions and constraint violations before reaching a conclusion — rather than jumping to a plausible-looking but incorrect answer',
        'It slows the AI down, giving it more time to think',
        'Logic puzzles are actually solved by pattern matching, not reasoning'
      ],
      correct: 1,
      explanation: 'Logic puzzles require tracking multiple constraints simultaneously and following implication chains to a valid conclusion. Without explicit step-by-step reasoning, models often make plausible guesses that violate some constraints. Extended reasoning serializes the process — checking each constraint at each step — which catches errors that fast-mode inference misses.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'What xAI company developed Grok?',
      options: [
        'Google DeepMind',
        'Anthropic',
        'xAI, founded by Elon Musk',
        'Meta AI'
      ],
      correct: 2,
      explanation: 'Grok is developed by xAI, the AI company founded by Elon Musk in 2023. xAI\'s mission is to "understand the true nature of the universe." Grok is distributed through X (formerly Twitter) and xAI\'s own API, with its integration into the X platform being a key differentiator from competitors like OpenAI\'s ChatGPT and Anthropic\'s Claude.',
      xp: 10
    }
  ],

  'grok-current-info': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'For which type of research task is Grok\'s recency advantage MOST significant?',
      options: [
        'Explaining how the internet works',
        'Analyzing AI model releases and capabilities from the last 30 days — where the landscape changes weekly and training cutoffs render other models outdated',
        'Writing a history essay about World War II',
        'Explaining basic calculus concepts'
      ],
      correct: 1,
      explanation: 'The AI space moves at a pace where a 6-month training cutoff means missing dozens of significant model releases, research breakthroughs, and competitive shifts. For AI researchers, founders, and practitioners who need current knowledge, Grok\'s recency in this specific domain is a meaningful practical advantage.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You want to create a weekly intelligence brief for your industry. What prompt structure works best with Grok?',
      options: [
        '"What happened this week?"',
        '"Create my weekly [industry] intelligence brief. Include: top 5 developments, emerging trends gaining momentum, notable company moves, one contrarian perspective, and what to watch next week"',
        '"Summarize the news"',
        '"Tell me about [industry] trends from 2023"'
      ],
      correct: 1,
      explanation: 'A structured brief prompt specifies exactly what dimensions to cover, producing a complete, ready-to-use intelligence document. "Top 5 developments" covers news. "Emerging trends" covers early signals. "Notable company moves" covers competitive intelligence. "Contrarian perspective" adds critical thinking. "What to watch" provides forward-looking value. Together these create a comprehensive situational awareness report.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What should you keep in mind when using Grok for current regulatory or legal updates?',
      options: [
        'Grok\'s regulatory information is always 100% accurate and current',
        'While Grok can surface recent regulatory discussions and news, consequential legal/compliance decisions always require verification with qualified legal counsel',
        'Regulatory information doesn\'t change frequently enough to make Grok useful',
        'Grok cannot access regulatory information'
      ],
      correct: 1,
      explanation: 'Grok can quickly surface recent regulatory developments — new rules, enforcement actions, proposed legislation — giving you a useful awareness briefing. However, compliance decisions must be verified: regulatory text is precise and context-dependent in ways that summarization can lose. Use Grok to track what\'s changing; use legal counsel to determine how it applies to your situation.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'Why do emerging topics often appear on X before mainstream tech publications?',
      options: [
        'Tech publications refuse to cover emerging topics until they\'re fully established',
        'X (formerly Twitter) is where researchers, founders, and practitioners discuss ideas in real time — often before they write or are written about in formal publications',
        'X posts are automatically indexed by AI systems before other content',
        'Mainstream publications are banned from covering new topics for 30 days'
      ],
      correct: 1,
      explanation: 'The information flow is: researcher/practitioner posts observation on X → discussion and validation among peers on X → journalist notices the X conversation → article appears in tech press → concept enters mainstream. Grok captures information at step 1-2, while training cutoff models may only know what was published at steps 3-4, weeks or months later.',
      xp: 10
    }
  ],

  /* ===================== VIBE CODING ===================== */

  'vibe-replit': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is "vibe coding" and why has it become popular?',
      options: [
        'Coding while listening to music',
        'Using AI to build software through natural language conversation rather than writing every line of code manually — dramatically reducing development time',
        'A style of coding that prioritizes aesthetics over functionality',
        'A Python library for building music applications'
      ],
      correct: 1,
      explanation: '"Vibe coding" (coined in Andrej Karpathy\'s 2025 tweet) describes the emerging practice of having AI do most of the coding while the developer focuses on direction, review, and iteration. It\'s popular because it enables non-technical founders to build MVPs and lets technical developers ship 3-5x faster.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You want to use Replit Agent to build a waitlist landing page. Which prompt produces the best result?',
      options: [
        '"Make a website"',
        '"Build a waitlist page"',
        '"Build a waitlist landing page for [App Name]. Include: hero section with tagline \'[tagline]\', email capture form storing submissions in a database, a live counter of signups, and a success message after submission. Clean dark design with [color] accent. Deploy it with a public URL."',
        '"Code a full-stack web application with React, Node.js, PostgreSQL"'
      ],
      correct: 2,
      explanation: 'Replit Agent performs best with prompts that specify: the product name, all UI sections needed, key functionality (database storage), interaction design (success message), visual style (dark with color accent), and the deployment requirement. Technical stack details are usually unnecessary — Replit Agent chooses appropriate technologies automatically.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What is the main advantage of Replit\'s browser-based cloud environment for vibe coding?',
      options: [
        'It produces faster code than local development',
        'No local setup required — the entire development environment, runtime, database, and deployment are in the cloud, accessible from any browser on any device',
        'It automatically generates better UI designs',
        'Replit has access to more AI models than other platforms'
      ],
      correct: 1,
      explanation: 'The zero-setup advantage is real: no Node.js installation, no Python version conflicts, no database configuration, no deployment pipeline setup. The environment, language runtime, package manager, database, and deployment infrastructure are all provisioned automatically. This removes the entire "setup tax" that often consumes hours before a line of application code is written.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'When does a Replit-built MVP need to be migrated to more robust infrastructure?',
      options: [
        'Immediately after building — Replit is only for prototyping',
        'When the application needs to handle significant scale (thousands of daily users), requires enterprise security standards, or needs performance guarantees that Replit\'s shared infrastructure doesn\'t provide',
        'After exactly 30 days of operation',
        'When the development team grows beyond 3 people'
      ],
      correct: 1,
      explanation: 'Replit is excellent for MVPs, prototypes, and small-scale apps. As an app scales to significant user loads, or requires specific compliance certifications, custom infrastructure, or performance SLAs, migrating to dedicated cloud infrastructure (AWS, GCP, Vercel, etc.) becomes necessary. Replit wisely lets you export your code to facilitate this migration.',
      xp: 10
    }
  ],

  'vibe-lovable': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What tech stack does Lovable use for building applications?',
      options: [
        'PHP and MySQL',
        'React (frontend) + Tailwind CSS + Supabase (auth and database)',
        'Vue.js and Firebase',
        'Angular and MongoDB'
      ],
      correct: 1,
      explanation: 'Lovable generates React components styled with Tailwind CSS — a modern, production-standard combination. It integrates with Supabase for authentication and database, which handles user management, Postgres database, and file storage. This is a well-regarded, production-viable stack used by thousands of real SaaS applications.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'A non-technical founder wants to build a SaaS analytics dashboard. Why is Lovable particularly suitable?',
      options: [
        'Lovable doesn\'t require any AI prompting skill',
        'Lovable generates professionally designed, mobile-responsive React UIs with real authentication and database connectivity — producing production-quality results from conversational descriptions, not just mockups',
        'Lovable is free for unlimited projects',
        'Lovable automatically markets the product after building it'
      ],
      correct: 1,
      explanation: 'Lovable\'s differentiator is the gap between what it accepts (plain English) and what it produces (production-quality React with real auth and database). A non-technical founder can describe their dashboard idea and get a deployable application with real user accounts, real data persistence, and professional design — not a static mockup.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What is the significance of Lovable\'s GitHub sync feature?',
      options: [
        'It automatically deploys to GitHub Pages',
        'It exports the generated code to a GitHub repository, preventing lock-in and allowing developers to continue building in any IDE or with any team',
        'It imports code from GitHub to improve AI suggestions',
        'GitHub sync is only available on paid plans'
      ],
      correct: 1,
      explanation: 'Vendor lock-in is a real risk with AI builders. Lovable\'s GitHub sync ensures you always own your code — it\'s standard React/Tailwind/Supabase that any developer can work with. If you want to scale beyond Lovable\'s interface, bring in developers, or switch tools, the exported code is your asset to keep and continue developing.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'Which describes the best use of Lovable in a hybrid "vibe coding" workflow?',
      options: [
        'Use Lovable to build the entire app including complex business logic',
        'Use Lovable to quickly build 60-70% of the application (UI, auth, basic CRUD), then export to GitHub and use Cursor or VS Code for complex business logic and production refinements',
        'Use Lovable only for generating UI mockups, then rebuild everything from scratch',
        'Lovable is not suitable for use alongside professional IDEs'
      ],
      correct: 1,
      explanation: 'The hybrid workflow is the professional approach: Lovable for rapid scaffolding (the 60-70% that\'s standard across most SaaS apps: auth, layout, CRUD), then professional IDE tools for the differentiating logic. This combines Lovable\'s speed advantage with the precision and control of traditional development for the complex parts.',
      xp: 10
    }
  ],

  'vibe-antigravity': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What type of applications is Antigravity particularly well-suited for?',
      options: [
        'Static marketing websites',
        'AI-native applications where AI is the core feature — agents, automation workflows, and intelligent data processing pipelines',
        'Simple CRUD databases',
        'Video games requiring 3D graphics'
      ],
      correct: 1,
      explanation: 'Antigravity is designed for the new category of AI-native software — applications where the value IS the AI capability, not just apps with AI bolted on. If you\'re building something that should autonomously monitor, process, analyze, or act on information, Antigravity provides tools specifically designed for these agentic workflows.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You want to build an AI system that monitors competitor websites and emails you a daily digest of significant changes. What makes this an appropriate Antigravity use case?',
      options: [
        'It involves a lot of JavaScript',
        'It\'s a static website',
        'It requires an agentic workflow: scheduled trigger → web scraping → AI analysis → content diffing → formatted email delivery — components that Antigravity is specifically designed to orchestrate',
        'It needs a mobile app'
      ],
      correct: 2,
      explanation: 'The competitor monitor requires multiple coordinated steps that run autonomously: scheduled execution, web requests, content comparison, AI reasoning (is this change significant?), and notification delivery. This multi-step autonomous workflow is the exact pattern Antigravity is designed to support — an AI-powered agent that acts independently on your behalf.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What is an "event-driven" application architecture, and why is it important for AI automation?',
      options: [
        'Applications that track calendar events',
        'Applications that react to triggers (new data, webhooks, schedules, API events) and execute processing pipelines in response — enabling AI automation that runs without constant human initiation',
        'Applications built during hackathon events',
        'Applications that run continuously checking for updates every second'
      ],
      correct: 1,
      explanation: 'Event-driven architecture is the foundation of automation: instead of a human pressing a button, something happening (new email, form submission, scheduled time, API event) automatically triggers your AI workflow. This enables genuine automation — processes that run while you sleep. Antigravity\'s design supports building these reactive, autonomous systems.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'What practical benefit does Antigravity provide for building applications that integrate multiple external APIs?',
      options: [
        'Antigravity provides unlimited free API calls to all services',
        'Antigravity helps orchestrate the connection and data flow between multiple APIs and AI processing steps, reducing the complexity of building integrations that would otherwise require significant custom code',
        'Antigravity automatically creates API keys for external services',
        'Antigravity only works with its own proprietary APIs'
      ],
      correct: 1,
      explanation: 'Complex integrations typically require: authentication handling for each service, error handling, rate limiting, data format transformation, retry logic, and orchestration. Antigravity helps manage this integration complexity, allowing you to focus on the business logic and AI capabilities rather than the plumbing that connects services together.',
      xp: 10
    }
  ],

  'vibe-cursor': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What makes Cursor fundamentally different from using an AI chatbot for coding help?',
      options: [
        'Cursor is faster than AI chatbots',
        'Cursor has access to your entire codebase as context — it knows your file structure, existing code patterns, dependencies, and conventions, making AI assistance far more relevant and accurate than context-free chatbots',
        'Cursor uses a different AI model than other coding tools',
        'Cursor can execute code in the cloud'
      ],
      correct: 1,
      explanation: 'The codebase context is the game-changer. A chatbot can\'t see your `auth.js` file when it helps you modify `middleware.js`. Cursor can. This allows suggestions that correctly use your actual data types, match your existing function signatures, follow your naming conventions, and account for your project\'s architecture — preventing the "AI help that doesn\'t fit my code" problem.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You need to add a new feature that touches 8 different files in your project. What Cursor feature handles this best?',
      options: [
        'Tab completion — it\'ll auto-complete across files',
        'Cursor Composer — the multi-file editing feature that can make coordinated changes across many files simultaneously based on a high-level goal description',
        'Cursor Chat — ask 8 separate questions about each file',
        'Cursor doesn\'t support multi-file changes'
      ],
      correct: 1,
      explanation: 'Cursor Composer is specifically designed for coordinated multi-file changes — the kind of feature addition that touches routes, controllers, models, tests, and documentation simultaneously. Rather than editing each file separately, Composer generates a holistic plan and implements it across all affected files, maintaining consistency throughout.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What does using "@codebase" in Cursor Chat enable?',
      options: [
        'It uploads your code to a public database',
        'It allows you to ask questions about your entire project, not just the currently open file — enabling questions like "Where is authentication handled in this project?" or "What pattern does this codebase use for error handling?"',
        'It automatically documents your entire codebase',
        'It connects your codebase to GitHub Copilot'
      ],
      correct: 1,
      explanation: '@codebase expands Cursor\'s AI context to your entire project, enabling architectural-level questions and changes. This is essential for understanding unfamiliar codebases quickly, planning changes that span multiple modules, and getting assistance that\'s consistent with the project\'s overall patterns rather than just the file you\'re currently editing.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'In the hybrid vibe coding workflow, when does Cursor typically enter the process?',
      options: [
        'Cursor is used first to set up the project structure',
        'After initial rapid scaffolding in tools like Lovable or Replit — when the project is exported to GitHub and needs professional-level refinement, complex feature implementation, and production hardening',
        'Cursor is used for final deployment only',
        'Cursor replaces all other tools in the workflow'
      ],
      correct: 1,
      explanation: 'The hybrid workflow: no-code builder (speed) → export to GitHub → Cursor (precision). Lovable/Replit handles the generic SaaS scaffolding quickly. Cursor handles the complex, custom, differentiating features that require real programming expertise. This sequence captures the speed benefit of AI builders and the control benefit of professional AI-assisted IDEs.',
      xp: 10
    }
  ],

  'vibe-windsurf': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is Windsurf\'s "Cascade" and how does it differ from Cursor\'s Chat?',
      options: [
        'Cascade is Windsurf\'s name for the autocomplete feature',
        'Cascade is a more autonomous AI agent — given a goal, it plans and executes all the steps needed to achieve it. Cursor Chat is more conversational and requires more user direction for each step',
        'Cascade is a version control feature',
        'Cascade and Cursor Chat are functionally identical'
      ],
      correct: 1,
      explanation: 'The autonomy spectrum: Cursor Chat (conversational, human-directed, step-by-step) → Windsurf Cascade (goal-oriented, agent-directed, plans and executes autonomously). Cascade is appropriate when you can clearly define the outcome and trust the AI to figure out the steps. Cursor Chat is better when you want to maintain control of each decision in the implementation.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'What type of goal-oriented prompt works best with Windsurf Cascade?',
      options: [
        '"Change this variable from `x` to `count`"',
        '"Fix the typo on line 47"',
        '"Implement a complete real-time notifications system: in-app bell with unread count, user preference settings, WebSocket for live updates, and email fallback via SendGrid. Follow existing code patterns."',
        '"Add a comment explaining what this function does"'
      ],
      correct: 2,
      explanation: 'Cascade is powerful for complex, multi-component feature implementations that touch many files. Single-file, single-line changes are better handled with inline editing (Cmd+K) — using Cascade for small tasks is like using a sledgehammer to hang a picture. Cascade\'s value emerges with system-level features requiring architecture, multiple integrations, and coordinated file changes.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What does Windsurf\'s "test-aware" capability enable?',
      options: [
        'Windsurf writes tests that always pass',
        'Cascade can run your existing test suite and iteratively refine its code changes until the tests pass — using test results as feedback to drive implementation quality',
        'Windsurf automatically deploys code when tests pass',
        'Windsurf generates test reports in PDF format'
      ],
      correct: 1,
      explanation: 'Test-driven Cascade is a powerful pattern: write the tests for what you want (defining expected behavior), then ask Cascade to implement until tests pass. Cascade runs the tests, sees failures, understands what\'s wrong, refines the implementation, and iterates until green. This produces code that demonstrably meets specifications — not just code that looks right.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'Who created Windsurf and what is Codeium known for?',
      options: [
        'Microsoft, known for VS Code',
        'Codeium, an AI code completion company that has been praised for its fast, accurate, free-tier code completion before expanding into Windsurf as a full AI-native IDE',
        'JetBrains, known for IntelliJ IDEA',
        'GitHub, known for Copilot'
      ],
      correct: 1,
      explanation: 'Codeium built a reputation for providing fast, high-quality AI code completion as a free alternative to GitHub Copilot. Windsurf represents their evolution from a completion tool to a full AI-native IDE with Cascade as the centerpiece agent capability. Their background in high-performance code AI informs Windsurf\'s technical capabilities.',
      xp: 10
    }
  ],

  /* ===================== AUTOMATION ===================== */

  'automation-zapier': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is a "Zap" in Zapier?',
      options: [
        'A unit of data storage in Zapier\'s database',
        'An automated workflow consisting of a trigger (something that happens in one app) and one or more actions (tasks performed in other apps)',
        'A type of API request',
        'Zapier\'s premium subscription tier'
      ],
      correct: 1,
      explanation: 'A Zap is the fundamental unit of Zapier automation: [Trigger] → [Action(s)]. Example: "New email with attachment [trigger] → Save attachment to Google Drive [action] → Send Slack notification [action]." Each Zap runs automatically every time the trigger fires, 24/7, without manual intervention.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You want to automatically qualify leads from your website form and send personalized follow-up emails. How would a Zapier + AI workflow handle this?',
      options: [
        'Zapier can\'t integrate with AI models',
        'Trigger: New form submission → AI step (ChatGPT) rates lead quality and drafts personalized email → If high-quality lead: send email immediately and create CRM record → If low-quality lead: add to nurture sequence',
        'You need to manually review each form submission before Zapier acts',
        'Zapier would send all leads the same generic email template'
      ],
      correct: 1,
      explanation: 'This Zap-with-AI pattern represents the modern automation stack: a standard trigger feeds data into an AI reasoning step, which makes a judgment call (lead quality), and routes the workflow accordingly. The AI handles the nuanced classification that would otherwise require a human SDR\'s time for every single lead submission.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What is a key limitation of Zapier compared to Make (formerly Integromat) for complex automation?',
      options: [
        'Zapier connects to fewer apps than Make',
        'Zapier\'s linear, step-by-step workflow structure makes it harder to build complex logic with loops, branches, and error handling that Make\'s visual canvas handles naturally',
        'Zapier is more expensive than Make',
        'Zapier doesn\'t support AI integrations'
      ],
      correct: 1,
      explanation: 'Zapier is designed for linear workflows: Step 1 → Step 2 → Step 3. For simple automations, this is ideal. For complex workflows with conditional branching ("if X then Y, else Z"), loops over multiple items, or sophisticated error handling, Zapier\'s structure becomes limiting. Make\'s canvas-based approach handles these complex patterns more naturally.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'What makes Zapier\'s 6,000+ app library its most significant competitive advantage?',
      options: [
        'More apps means better performance',
        'The breadth of integrations means almost any app you use already has a Zapier connector — enabling automations between obscure combinations of tools that would otherwise require custom API development',
        'More apps means lower pricing',
        'All 6,000 apps are supported equally in all pricing tiers'
      ],
      correct: 1,
      explanation: 'Integration breadth is Zapier\'s moat. When you can connect your niche CRM to your project management tool to your AI model to your Slack to your accounting software — all without writing code — the combinatorial value of automation becomes accessible to every business regardless of technical capability. Custom API development for each integration would cost $10k-$100k+ in developer time.',
      xp: 10
    }
  ],

  'automation-make': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is Make\'s primary advantage over Zapier for complex automation workflows?',
      options: [
        'Make connects to more apps than Zapier',
        'Make\'s visual canvas enables complex logic with loops, conditional branches, error handling, iterators, and aggregators — making it possible to build sophisticated data processing workflows that Zapier\'s linear model can\'t handle',
        'Make is always cheaper than Zapier',
        'Make has better AI integration than Zapier'
      ],
      correct: 1,
      explanation: 'Make\'s canvas shows your entire automation as a visual diagram with branches and loops. An "iterator" processes each item in a list separately. A "router" branches to different paths based on conditions. An "aggregator" collects results back into a single stream. These visual, composable building blocks enable automation complexity that Zapier\'s linear approach makes awkward.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'You want to automatically create social media content for all future blog posts. How would a Make scenario accomplish this?',
      options: [
        'Make can\'t integrate with WordPress or social media',
        'Trigger: New WordPress post → Extract content → AI generates tweet thread, LinkedIn post, Instagram captions, and YouTube script → Store all variations in Airtable → Notify team on Slack with Airtable link for review',
        'Make would publish social posts immediately without human review',
        'You need a developer to build this custom integration'
      ],
      correct: 1,
      explanation: 'This Make scenario demonstrates content multiplication: one input (blog post) generates four distinct outputs (social formats) through multiple parallel AI processing paths, stores results in a structured way (Airtable), and triggers a human review step (Slack notification). Make\'s branching capability enables the parallel AI generation paths that Zapier would handle less elegantly.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What is an "iterator" module in Make, and when would you use it?',
      options: [
        'A module that repeats the same action multiple times with the same data',
        'A module that splits an array of items (like a list of emails, records, or files) into individual items so subsequent modules can process each one separately',
        'A module for mathematical calculations in workflows',
        'A special module only available in Make\'s enterprise tier'
      ],
      correct: 1,
      explanation: 'Iterators solve the "batch processing" problem. If an API returns 50 customer records as an array, you can\'t process all 50 at once. An iterator breaks the array into 50 individual items, each flowing through the rest of the scenario separately — allowing you to update each customer\'s record in your CRM, send each a personalized email, or analyze each record with AI individually.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'Why is error handling important in production Make scenarios?',
      options: [
        'Make scenarios never encounter errors',
        'Without error handling, one failed step can silently break an entire workflow — proper error paths catch failures, alert you, and prevent data loss or missed processing of important events',
        'Error handling is only needed in developer-written code, not no-code automation',
        'Error handling makes Make scenarios run slower'
      ],
      correct: 1,
      explanation: 'Production automations face real-world failures: API timeouts, rate limits, unexpected data formats, network errors, and service outages. Without error routes, a failed API call can silently drop data — your workflow thinks it processed a customer record but it actually failed. Error handlers catch these failures, log them, alert the right person, and optionally retry — making automation reliable rather than brittle.',
      xp: 10
    }
  ],

  'automation-n8n': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is n8n\'s primary differentiator from Zapier and Make?',
      options: [
        'n8n has more app integrations',
        'n8n is open-source and can be self-hosted — meaning all workflow data stays on your own servers, critical for privacy compliance and avoiding per-task pricing at scale',
        'n8n has better AI capabilities',
        'n8n is easier to use than other automation platforms'
      ],
      correct: 1,
      explanation: 'Self-hosting means: your data never leaves your infrastructure (critical for HIPAA, GDPR, SOC2 compliance), no per-task charges at scale (Zapier and Make charge per operation — at millions of tasks, costs skyrocket), and full customization freedom. For mature businesses with sensitive data or high automation volume, self-hosted n8n often becomes dramatically more cost-effective than SaaS alternatives.',
      xp: 10
    },
    {
      id: 'q2',
      type: 'scenario',
      question: 'A healthcare company needs to automate patient appointment reminders. Why is n8n self-hosted particularly appropriate?',
      options: [
        'Healthcare companies can\'t use Zapier or Make',
        'Patient data is Protected Health Information (PHI) under HIPAA. Self-hosting n8n ensures PHI never passes through third-party SaaS automation servers — maintaining HIPAA compliance while still enabling powerful automation',
        'n8n has built-in HIPAA certification',
        'Self-hosted n8n is the only tool that can send SMS messages'
      ],
      correct: 1,
      explanation: 'HIPAA requires organizations to control where PHI travels. Sending patient appointment data through Zapier\'s servers requires a Business Associate Agreement (BAA) with Zapier and introduces compliance risk. Self-hosted n8n keeps data entirely within your HIPAA-compliant infrastructure — Zapier and Make can also achieve compliance with BAAs, but n8n\'s self-hosted option provides stronger data locality guarantees.',
      xp: 10
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What does n8n\'s Code node enable that distinguishes it from purely visual automation tools?',
      options: [
        'The Code node allows you to view the generated code behind no-code blocks',
        'The Code node lets you execute custom JavaScript or Python within a workflow step — enabling arbitrary data transformation, complex calculations, and custom business logic that no pre-built node handles',
        'The Code node connects to external code repositories',
        'The Code node is only for testing workflows, not production use'
      ],
      correct: 1,
      explanation: 'Pure no-code tools limit you to what their pre-built modules support. When you need something specific — parsing a custom XML format, applying a proprietary business calculation, implementing a specific algorithm — pre-built nodes fall short. The Code node in n8n gives you an escape hatch: any transformation computable in JS or Python can be added as a workflow step without abandoning the visual orchestration.',
      xp: 10
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'What is n8n\'s AI Agent node designed to enable?',
      options: [
        'Connecting n8n to ChatGPT for simple Q&A',
        'Building multi-step AI agents that can make decisions, use tools (like web search, database queries, and API calls), and execute complex reasoning workflows autonomously within n8n',
        'Automatic workflow creation using AI',
        'The AI Agent node only supports text classification tasks'
      ],
      correct: 1,
      explanation: 'n8n\'s AI Agent node enables real agentic behavior: the AI can receive a goal, decide which tools to use, execute those tools (running other n8n nodes), process results, and iterate until the goal is achieved. This is the foundation for building truly autonomous AI agents — not just API wrappers — using n8n\'s visual workflow environment as the orchestration layer.',
      xp: 10
    }
  ]

};
