import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to safely obtain GoogleGenAI client
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// 1. API: Generate Daily Quest Plan from Syllabus
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { subjectName, syllabusText, examDate, dailyHours } = req.body;

    if (!subjectName || !syllabusText) {
      return res.status(400).json({ error: 'Subject name and syllabus content are required.' });
    }

    const ai = getGenAIClient();

    // If Gemini key is missing, return a synthesized default Solo Leveling study quest plan
    if (!ai) {
      const defaultPlan = generateFallbackCampaign(subjectName, syllabusText, examDate, Number(dailyHours) || 2);
      return res.json({ campaign: defaultPlan, fallbackUsed: true });
    }

    const prompt = `
You are "The Oceanic Sonar System", an elite deep-sea AI study system for bathyscaphe scholars.
Your mission is to transform a student's syllabus into an epic underwater study quest campaign leading up to their exam date (${examDate || 'in 14 days'}).

Subject: ${subjectName}
Daily Study Hours Available: ${dailyHours || 2} hours
Syllabus Content:
${syllabusText.substring(0, 4000)}

Instructions:
Break down the syllabus into sequential daily underwater trench study quests (between 5 to 14 days based on scope).
Each day MUST be a "Deep Sea Trench Floor" / "Hydro-Quest".
For each day, provide:
1. mainTopic: A clear topic title from the syllabus.
2. xpReward: XP integer (between 100 and 300).
3. subQuests: Array of 4 sub-quests with types: 'reading', 'notes', 'audio', 'quiz'.
   Example subquests:
   - "Submerge into Chapter Core Concepts: [Topic]" (reading)
   - "Review Hydro-Log Notes & Pressure Formulas" (notes)
   - "Listen to Sonar Hydrophone Briefing" (audio)
   - "Defeat Trench Kraken Boss Quiz: [Topic]" (quiz)

Return strictly valid JSON in this exact structure:
{
  "totalDays": 7,
  "dailyQuests": [
    {
      "dayNumber": 1,
      "mainTopic": "Fundamental Principles & Hydro Definitions",
      "xpReward": 150,
      "subQuests": [
        { "id": "1-1", "title": "Submerge into Syllabus Overview & Definitions", "description": "Study foundational terminology and abyssal scope.", "estimatedMinutes": 30, "type": "reading" },
        { "id": "1-2", "title": "Review Hydro-Log Cheat Sheet", "description": "Absorb high-yield formulas and key concepts.", "estimatedMinutes": 20, "type": "notes" },
        { "id": "1-3", "title": "Listen to Sonar Hydrophone Briefing", "description": "Listen to audio narration breakdown.", "estimatedMinutes": 15, "type": "audio" },
        { "id": "1-4", "title": "Clear Trench Floor 1 Kraken Boss", "description": "Pass test questions to equalize hull pressure.", "estimatedMinutes": 15, "type": "quiz" }
      ]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    const parsedData = JSON.parse(responseText);

    const now = new Date();
    const formattedQuests = (parsedData.dailyQuests || []).map((dq: any, idx: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() + idx);
      const dateStr = d.toISOString().split('T')[0];

      return {
        dayNumber: dq.dayNumber || idx + 1,
        dateString: dateStr,
        mainTopic: dq.mainTopic || `Topic ${idx + 1}`,
        xpReward: dq.xpReward || 150,
        isCompleted: false,
        subQuests: (dq.subQuests || []).map((sq: any, sIdx: number) => ({
          id: sq.id || `${idx + 1}-${sIdx + 1}`,
          title: sq.title || `Sub-task ${sIdx + 1}`,
          description: sq.description || 'Study topic item',
          estimatedMinutes: sq.estimatedMinutes || 20,
          isCompleted: false,
          type: sq.type || (sIdx === 3 ? 'quiz' : sIdx === 2 ? 'audio' : sIdx === 1 ? 'notes' : 'reading'),
        })),
      };
    });

    const campaign = {
      id: 'camp_' + Date.now(),
      subjectName,
      syllabusText,
      examDate: examDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      dailyHours: Number(dailyHours) || 2,
      createdAt: new Date().toISOString(),
      totalDays: formattedQuests.length,
      dailyQuests: formattedQuests,
    };

    return res.json({ campaign });
  } catch (error: any) {
    console.error('Error generating plan:', error);
    // Fallback if API fails
    const defaultPlan = generateFallbackCampaign(
      req.body.subjectName || 'General Studies',
      req.body.syllabusText || '',
      req.body.examDate,
      Number(req.body.dailyHours) || 2
    );
    return res.json({ campaign: defaultPlan, fallbackUsed: true });
  }
});

// 2. API: Generate Grimoire Notes for a Topic
app.post('/api/generate-lesson-notes', async (req, res) => {
  try {
    const { topic, subjectName } = req.body;
    const ai = getGenAIClient();

    if (!ai) {
      return res.json({ notes: getFallbackNotes(topic, subjectName) });
    }

    const prompt = `
You are "The System" Grimoire Generator.
Generate high-yield revision notes for the study topic: "${topic}" in the subject "${subjectName || 'Syllabus'}".

Return strictly valid JSON in this format:
{
  "topic": "${topic}",
  "summary": "A concise 2-sentence executive summary of the topic core.",
  "keyConcepts": [
    {
      "term": "Term Name",
      "definition": "Clear, precise explanation.",
      "example": "Real-world example or scenario."
    }
  ],
  "cheatSheetFormulae": [
    "Key Formula or Rule 1",
    "Key Formula or Rule 2"
  ],
  "mnemonicTricks": [
    "Memory trick or acronym to easily recall this concept"
  ],
  "studyTips": [
    "High-yield exam tip 1",
    "Common mistake to avoid in exam"
  ]
}
Provide 4-6 key concepts, 3-4 formulas/rules, 2 mnemonics, and 3 study tips.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const notes = JSON.parse(response.text || '{}');
    return res.json({ notes });
  } catch (error) {
    console.error('Error generating notes:', error);
    return res.json({ notes: getFallbackNotes(req.body.topic, req.body.subjectName) });
  }
});

// 3. API: Generate Audiobook Script
app.post('/api/generate-audiobook', async (req, res) => {
  try {
    const { topic, subjectName } = req.body;
    const ai = getGenAIClient();

    if (!ai) {
      return res.json({ audioLesson: getFallbackAudioLesson(topic) });
    }

    const prompt = `
You are "The System Audio Briefing Engine". Create an engaging, high-retention audio lesson script breakdown for the student studying "${topic}" (${subjectName || 'Subject'}).

The script should be structured as an interactive dialogue/narration between "System Narrator" and "Concept Guide".
Make it clear, conversational, engaging, and perfect for listening while walking or relaxing!

Return strictly valid JSON in this structure:
{
  "topic": "${topic}",
  "durationMinutes": 6,
  "keyTakeaways": [
    "Takeaway 1: ...",
    "Takeaway 2: ...",
    "Takeaway 3: ..."
  ],
  "scriptLines": [
    {
      "speaker": "System Narrator",
      "text": "Welcome Hunter. Today's audio briefing covers ${topic}. Let's break down the core mechanics."
    },
    {
      "speaker": "Concept Guide",
      "text": "First, understand that..."
    }
  ]
}
Include at least 8-12 dialogue exchanges.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const audioLesson = JSON.parse(response.text || '{}');
    return res.json({ audioLesson });
  } catch (error) {
    console.error('Error generating audio lesson:', error);
    return res.json({ audioLesson: getFallbackAudioLesson(req.body.topic) });
  }
});

// 4. API: Generate Floor Boss Quiz
app.post('/api/generate-boss-quiz', async (req, res) => {
  try {
    const { topic, subjectName } = req.body;
    const ai = getGenAIClient();

    if (!ai) {
      return res.json({ quiz: getFallbackQuiz(topic) });
    }

    const prompt = `
You are "The System Dungeon Master". Create a Solo Leveling Boss Fight Quiz for the lesson topic: "${topic}".

Generate 4 challenging multiple-choice questions.
Also create a cool Boss Name (e.g. "Igris the Crimson Commander of ${topic}", "Kargalgan Monarch of ${topic}").

Return strictly valid JSON:
{
  "topic": "${topic}",
  "bossName": "Igris the Crimson Commander of ${topic}",
  "xpReward": 250,
  "questions": [
    {
      "id": "q1",
      "question": "What is the primary mechanism of...",
      "options": [
        "Option A text",
        "Option B text",
        "Option C text",
        "Option D text"
      ],
      "correctAnswerIndex": 0,
      "explanation": "Detailed step-by-step breakdown of why Option A is correct."
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const quiz = JSON.parse(response.text || '{}');
    return res.json({ quiz });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return res.json({ quiz: getFallbackQuiz(req.body.topic) });
  }
});

// 5. API: System AI Doubt Assistant
app.post('/api/system-chat', async (req, res) => {
  try {
    const { message, topic, history } = req.body;
    const ai = getGenAIClient();

    if (!ai) {
      return res.json({
        reply: `System Notification: Regarding "${topic || 'this lesson'}", remember to focus on core principles and practice key problems. If you need a quick hint: break complex equations down step-by-step!`,
      });
    }

    const systemInstruction = `You are "The System" AI Assistant from Solo Leveling. Speak directly to the Hunter student with an authoritative yet highly encouraging system UI voice. Keep answers concise, clear, and focused on helping them defeat their study doubts and level up.`;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
      },
    });

    const fullPrompt = `Topic Context: ${topic || 'General Syllabus'}\nStudent Doubt: ${message}`;
    const response = await chat.sendMessage({ message: fullPrompt });

    return res.json({ reply: response.text });
  } catch (error) {
    console.error('Error in system chat:', error);
    return res.json({
      reply: 'System Error: Reconnecting mana channel... Key rule: Master the foundational terms and test yourself with the quiz!',
    });
  }
});

// 6. API: Deep Sea Depth & Pressure Diagnostics ("How under the water you are")
app.post('/api/generate-depth-analytics', async (req, res) => {
  try {
    const { subjectName, dailyQuests, clearedQuestsCount, totalQuizzesPassed, level } = req.body;
    const ai = getGenAIClient();

    const questsArr = Array.isArray(dailyQuests) ? dailyQuests : [];
    const totalSubs = questsArr.reduce((acc: number, dq: any) => acc + (dq.subQuests ? dq.subQuests.length : 0), 0);
    const completedSubs = questsArr.reduce(
      (acc: number, dq: any) => acc + (dq.subQuests ? dq.subQuests.filter((s: any) => s.isCompleted).length : 0),
      0
    );

    const ratio = totalSubs > 0 ? completedSubs / totalSubs : 0;
    const drowningRiskPct = Math.max(10, Math.round((1 - ratio) * 100));
    const currentDepthMeters = Math.round(1500 + drowningRiskPct * 85);
    const waterPressureAtm = Math.round(currentDepthMeters / 10);

    if (!ai) {
      return res.json({
        diagnostic: {
          currentDepthMeters,
          waterPressureAtm,
          drowningRiskPercentage: drowningRiskPct,
          statusLabel: drowningRiskPct > 50 ? '⚠️ HEAVY WATER PRESSURE - Hull Repair Needed' : '✨ OPTIMAL BUOYANCY - Deep Sea Glide',
          summaryDiagnosis: `Your bathyscaphe is currently at -${currentDepthMeters}m depth in ${subjectName || 'Study Syllabus'}. You have cleared ${completedSubs} of ${totalSubs} subquests.`,
          strengths: [
            {
              topic: 'Completed Sub-Quests',
              masteryPercentage: Math.min(100, Math.round(ratio * 100) + 15),
              buoyancyNote: 'Solid recall on completed hydro-notes and sonar briefings.',
            },
            {
              topic: 'Submariner Level & Leveling Progress',
              masteryPercentage: Math.min(100, level * 10),
              buoyancyNote: 'Increased intellect and focus stats reduce oxygen loss rate.',
            },
          ],
          weaknesses: [
            {
              topic: 'Pending Syllabus Floors',
              pressureLeakPercentage: drowningRiskPct,
              impactDescription: 'Unfinished study quests create drag and increase water pressure on your hull.',
              remedyAction: 'Complete today\'s reading and clear the Kraken Boss Quiz to equalize pressure.',
            },
          ],
          resurfaceSteps: [
            'Complete today\'s reading assignment to seal hull leaks.',
            'Listen to the Sonar Audio Briefing for quick revision.',
            'Clear the Kraken Boss Quiz to earn XP and resurface 500 meters.',
          ],
        },
      });
    }

    const prompt = `
You are the "Oceanic Sonar Diagnostic System".
Analyze the student's study campaign metrics for subject: "${subjectName || 'Syllabus'}":
- Total Daily Subquests: ${totalSubs}
- Completed Subquests: ${completedSubs}
- Quizzes Cleared: ${totalQuizzesPassed}
- Submariner Level: ${level}

Evaluate "HOW UNDER WATER THEY ARE" in their studies (i.e. study drowning risk, strengths, weaknesses, and resurface steps).

Return strictly valid JSON in this exact structure:
{
  "currentDepthMeters": ${currentDepthMeters},
  "waterPressureAtm": ${waterPressureAtm},
  "drowningRiskPercentage": ${drowningRiskPct},
  "statusLabel": "CRITICAL PRESSURE / STABLE BUOYANCY status title",
  "summaryDiagnosis": "2-sentence overall diagnosis of how deep under water they are in their studies.",
  "strengths": [
    {
      "topic": "Mastered Concept or Habit",
      "masteryPercentage": 85,
      "buoyancyNote": "Why this gives them strong buoyancy in exams."
    }
  ],
  "weaknesses": [
    {
      "topic": "Lagging Topic or Pressure Leak",
      "pressureLeakPercentage": 40,
      "impactDescription": "How this weak area increases study drowning risk.",
      "remedyAction": "Exact step to repair this leak."
    }
  ],
  "resurfaceSteps": [
    "Step 1 to float up to mastery",
    "Step 2 to float up to mastery",
    "Step 3 to float up to mastery"
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const diagnostic = JSON.parse(response.text || '{}');
    return res.json({ diagnostic });
  } catch (error) {
    console.error('Error generating depth analytics:', error);
    return res.json({
      diagnostic: {
        currentDepthMeters: 3200,
        waterPressureAtm: 320,
        drowningRiskPercentage: 45,
        statusLabel: '🌊 STABLE OCEAN NAVIGATION',
        summaryDiagnosis: 'Sonar telemetry active. Keep clearing daily sub-quests to resurface toward exam readiness.',
        strengths: [
          { topic: 'Hydro-Log Recall', masteryPercentage: 75, buoyancyNote: 'Good understanding of core definitions.' },
        ],
        weaknesses: [
          { topic: 'Revision Speed', pressureLeakPercentage: 30, impactDescription: 'Slow review increases pressure.', remedyAction: 'Use Sonar audiobooks for faster coverage.' },
        ],
        resurfaceSteps: ['Review Grimoire notes', 'Listen to Sonar audio', 'Pass Boss Quiz'],
      },
    });
  }
});

// --- Fallback Generators ---
function generateFallbackCampaign(subjectName: string, syllabusText: string, examDate?: string, dailyHours = 2) {
  const lines = syllabusText.split('\n').filter((l) => l.trim().length > 3);
  const topics = lines.length >= 4 ? lines.slice(0, 7) : [
    `${subjectName}: Foundations & Core Concepts`,
    `${subjectName}: Principles & Key Mechanics`,
    `${subjectName}: Analytical Methods & Equations`,
    `${subjectName}: Advanced Applications & Case Studies`,
    `${subjectName}: Comprehensive Problem Solving`,
    `${subjectName}: Exam Preparation & High-Yield Review`,
  ];

  const now = new Date();
  const dailyQuests = topics.map((top, idx) => {
    const d = new Date(now);
    d.setDate(d.getDate() + idx);
    const dateStr = d.toISOString().split('T')[0];
    const cleanTopic = top.replace(/^[-*#\d.]+\s*/, '').trim();

    return {
      dayNumber: idx + 1,
      dateString: dateStr,
      mainTopic: cleanTopic,
      xpReward: 150 + idx * 20,
      isCompleted: false,
      subQuests: [
        {
          id: `${idx + 1}-1`,
          title: `Master Core Theory: ${cleanTopic}`,
          description: `Study key concepts and textbook sections for ${cleanTopic}.`,
          estimatedMinutes: Math.round((dailyHours * 60) * 0.35),
          isCompleted: false,
          type: 'reading',
        },
        {
          id: `${idx + 1}-2`,
          title: `Study Grimoire Notes & Cheat Sheet`,
          description: `Absorb formulas, definitions, and high-yield mnemonics.`,
          estimatedMinutes: Math.round((dailyHours * 60) * 0.25),
          isCompleted: false,
          type: 'notes',
        },
        {
          id: `${idx + 1}-3`,
          title: `Listen to System Audio Briefing`,
          description: `Listen to the narrator breakdown for ${cleanTopic}.`,
          estimatedMinutes: Math.round((dailyHours * 60) * 0.2),
          isCompleted: false,
          type: 'audio',
        },
        {
          id: `${idx + 1}-4`,
          title: `Clear Floor ${idx + 1} Boss Quiz`,
          description: `Pass the 4-question boss quiz to complete the daily quest.`,
          estimatedMinutes: Math.round((dailyHours * 60) * 0.2),
          isCompleted: false,
          type: 'quiz',
        },
      ],
    };
  });

  return {
    id: 'camp_' + Date.now(),
    subjectName,
    syllabusText,
    examDate: examDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    dailyHours,
    createdAt: new Date().toISOString(),
    totalDays: dailyQuests.length,
    dailyQuests,
  };
}

function getFallbackNotes(topic: string, subjectName?: string) {
  return {
    topic: topic || 'Study Lesson',
    summary: `Essential guide for ${topic}. Master the core definitions, standard equations, and key applications to maximize your exam score.`,
    keyConcepts: [
      {
        term: 'Core Principle',
        definition: `The underlying foundational law governing ${topic}.`,
        example: 'Used in solving standard textbook and exam problems.',
      },
      {
        term: 'Operational Variable',
        definition: 'Key measurable metric or factor that influences system output.',
        example: 'Varying this parameter alters the primary results directly.',
      },
      {
        term: 'Boundary Condition',
        definition: 'Limits or standard constraints under which the primary model applies.',
        example: 'Standard temperature, closed system, or ideal constraints.',
      },
      {
        term: 'High-Yield Application',
        definition: 'Direct practical scenario frequently tested on final examinations.',
        example: 'Solving multi-step analytical questions.',
      },
    ],
    cheatSheetFormulae: [
      `Primary Equation: Output = Input × Efficiency Factor`,
      `Rate Law: Rate = k · [Concentration]^n`,
      `Conservation Rule: Σ (Initial) = Σ (Final)`,
    ],
    mnemonicTricks: [
      `REMEMBER "F-O-C-U-S": Fundamentals, Operations, Constraints, Units, Solution`,
    ],
    studyTips: [
      'Always double check your units before calculating final numerical answers.',
      'Identify key terms in the exam prompt before choosing your method.',
      'Practice drawing quick diagrams to visualize abstract concepts.',
    ],
  };
}

function getFallbackAudioLesson(topic: string) {
  return {
    topic: topic || 'Lesson Briefing',
    durationMinutes: 5,
    keyTakeaways: [
      `Mastering ${topic} requires understanding cause-and-effect relationships.`,
      `Focus on key variables and their direct mathematical or logical proportionalities.`,
      `Test your recall immediately after listening by clearing the Floor Boss Quiz.`,
    ],
    scriptLines: [
      {
        speaker: 'System Narrator',
        text: `Welcome Hunter. Initiating System Audio Briefing for topic: ${topic}.`,
      },
      {
        speaker: 'Concept Guide',
        text: `Let's break this down into three essential parts. First, what is the core purpose of ${topic}? It allows us to systematically analyze complex system behavior.`,
      },
      {
        speaker: 'System Narrator',
        text: `Exactly. When studying for exams, professors test your ability to explain both the 'How' and the 'Why'.`,
      },
      {
        speaker: 'Concept Guide',
        text: `Second, pay close attention to boundary conditions. Many students lose easy marks by applying formulas where conditions do not hold.`,
      },
      {
        speaker: 'System Narrator',
        text: `System Alert: Keep these key rules in mind. Now prepare to review the Grimoire notes and challenge the Floor Boss Quiz!`,
      },
    ],
  };
}

function getFallbackQuiz(topic: string) {
  return {
    topic: topic || 'Lesson Quiz',
    bossName: `Igris the Crimson Commander of ${topic}`,
    xpReward: 250,
    questions: [
      {
        id: 'q1',
        question: `What is the most fundamental objective when analyzing ${topic}?`,
        options: [
          'To establish relationships between primary inputs and output results',
          'To memorize superficial equations without understanding units',
          'To skip initial boundary condition checks',
          'To guess values without logical reasoning',
        ],
        correctAnswerIndex: 0,
        explanation: 'Establishing the core relationships between system inputs and outputs provides the foundation for solving complex exam problems.',
      },
      {
        id: 'q2',
        question: `When solving problems under ${topic}, what is the first critical step?`,
        options: [
          'Directly plug random numbers into any formula',
          'Identify given variables, target unknowns, and verified boundary constraints',
          'Skip reading the full problem prompt',
          'Assume ideal conditions without checking constraints',
        ],
        correctAnswerIndex: 1,
        explanation: 'Clearly identifying given data and target unknowns prevents mistakes and ensures you select the correct solution pathway.',
      },
      {
        id: 'q3',
        question: `Which common error causes most lost marks in ${topic} exam questions?`,
        options: [
          'Inconsistent units and dimensional mismatch',
          'Writing clear step-by-step logic',
          'Checking answer reasonableness',
          'Highlighting key terms',
        ],
        correctAnswerIndex: 0,
        explanation: 'Unit mismatches are the #1 source of avoidable point losses in analytical and numerical exam questions.',
      },
      {
        id: 'q4',
        question: `How can you verify that your solution for ${topic} is correct?`,
        options: [
          'Perform a sanity check on magnitude, sign, and unit consistency',
          'Rely solely on luck',
          'Leave the answer blank',
          'Erase all working steps',
        ],
        correctAnswerIndex: 0,
        explanation: 'Checking magnitude, sign, and dimensional balance confirms the logical validity of your answer before submission.',
      },
    ],
  };
}

// Vite or Static file middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[System Activated] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
