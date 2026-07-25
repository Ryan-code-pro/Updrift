import { StudyCampaign, LessonNotes, AudioLesson, Quiz } from '../types';

export function createClientFallbackCampaign(
  subjectName: string,
  syllabusText: string,
  examDate?: string,
  dailyHours = 2
): StudyCampaign {
  const lines = syllabusText.split('\n').filter((l) => l.trim().length > 3);
  const topics = lines.length > 0 ? lines.slice(0, 7) : [
    'Fundamental Ocean & Subject Concepts',
    'Core Hydrostatic Formulas & Definitions',
    'Bathyscaphe Navigation & Advanced Applications',
    'Deep Sea Trench Pressure Problem Solving',
    'Abyssal Theory & Case Studies',
    'Comprehensive Hydro-Log Practice',
    'Final Oceanic Mastery & Exam Simulation',
  ];

  const dailyQuests = topics.map((topic, index) => {
    const day = index + 1;
    const cleanTopic = topic.replace(/^[#*\-0-9.\s]+/, '').trim();
    const targetDate = new Date(Date.now() + index * 86400000).toISOString().split('T')[0];

    return {
      dayNumber: day,
      dateString: targetDate,
      mainTopic: cleanTopic || `Hydro Module ${day}`,
      xpReward: 150 + day * 10,
      subQuests: [
        {
          id: `${day}-1`,
          title: `Submerge into Reading: ${cleanTopic.substring(0, 35)}`,
          description: `Study core principles and definitions for ${cleanTopic}.`,
          estimatedMinutes: Math.round(dailyHours * 20),
          isCompleted: false,
          type: 'reading' as const,
        },
        {
          id: `${day}-2`,
          title: `Review Hydro-Log Cheat Sheet`,
          description: `Absorb high-yield formulas and key concept definitions.`,
          estimatedMinutes: Math.round(dailyHours * 15),
          isCompleted: false,
          type: 'notes' as const,
        },
        {
          id: `${day}-3`,
          title: `Listen to Sonar Audio Briefing`,
          description: `Listen to audio narration breakdown for ${cleanTopic}.`,
          estimatedMinutes: Math.round(dailyHours * 10),
          isCompleted: false,
          type: 'audio' as const,
        },
        {
          id: `${day}-4`,
          title: `Defeat Floor ${day} Kraken Boss Quiz`,
          description: `Pass test questions to equalize hull pressure and unlock next floor.`,
          estimatedMinutes: Math.round(dailyHours * 15),
          isCompleted: false,
          type: 'quiz' as const,
        },
      ],
      isCompleted: false,
    };
  });

  return {
    id: `campaign-${Date.now()}`,
    subjectName,
    syllabusText,
    dailyHours,
    createdAt: new Date().toISOString(),
    totalDays: dailyQuests.length,
    dailyQuests,
    examDate: examDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  };
}

export function createClientFallbackNotes(topic: string, subjectName?: string): LessonNotes {
  return {
    topic,
    summary: `Comprehensive abyssal study notes covering foundational elements and deep-sea problem-solving strategies for ${topic} in ${subjectName || 'Study Syllabus'}.`,
    keyConcepts: [
      {
        term: `${topic} Core Mechanics`,
        definition: `The fundamental framework governing ${topic} and its primary application in problem scenarios.`,
        example: `Applying standard equations to verify accuracy under test conditions.`,
      },
      {
        term: `Hydrostatic Balance Principle`,
        definition: `Method of balancing variables and avoiding common pressure trap errors during calculations.`,
        example: `Check boundary conditions and verify units before final answer submission.`,
      },
    ],
    cheatSheetFormulae: [
      'Primary Equation: Result = Sum(Input_Variables * Efficiency_Factor)',
      'Pressure Check: Ensure consistency across all dimensional units.',
    ],
    mnemonicTricks: [
      `HYDRO: High Yield Reading & Optimization for ${topic}`,
    ],
    studyTips: [
      `Always start with standard definitions before complex calculations in ${topic}.`,
      'Identify key given variables first.',
      'Watch out for negative signs and boundary condition limits.',
    ],
  };
}

export function createClientFallbackAudio(topic: string, subjectName?: string): AudioLesson {
  return {
    topic,
    durationMinutes: 8,
    scriptLines: [
      {
        speaker: 'Sonar Narrator',
        text: `Welcome submariner. Today's sonar hydrophone briefing covers ${topic} for ${subjectName || 'your course'}.`,
      },
      {
        speaker: 'Abyssal Hydro-Guide',
        text: `When approaching ${topic}, break the problem into core components, list known variables, and verify unit consistency.`,
      },
      {
        speaker: 'Sonar Narrator',
        text: `Let us examine the foundational formula. Always state general equations first before numerical substitution.`,
      },
      {
        speaker: 'Abyssal Hydro-Guide',
        text: `Pay close attention to boundary constraints. Applying equations outside valid ranges leads to incorrect derivations.`,
      },
      {
        speaker: 'Sonar Narrator',
        text: `Beware of unit traps! Converting milliseconds to seconds or grams to kilograms prevents costly mark loss.`,
      },
      {
        speaker: 'Abyssal Hydro-Guide',
        text: `When answering conceptual questions, start with a crisp 1-sentence definition before expanding into details.`,
      },
      {
        speaker: 'Sonar Narrator',
        text: `You can pause this audio at any point to ask Sonar Hydro AI a doubt mid-session if any concept feels unclear.`,
      },
      {
        speaker: 'Abyssal Hydro-Guide',
        text: `Review your Hydro-Log notes and proceed to challenge the Kraken Boss Quiz to equalize hull pressure!`,
      },
    ],
    keyTakeaways: [
      `Master the core equations and definitions for ${topic}.`,
      'Verify boundary constraints and unit conversions before final calculation.',
      'Always start conceptual exam answers with a 1-sentence core definition.',
      'Practice past exam questions to build speed and accuracy.',
    ],
  };
}

export function createClientFallbackQuiz(topic: string, subjectName?: string): Quiz {
  return {
    bossName: `Deep Trench Kraken: ${topic.substring(0, 25)}`,
    topic,
    xpReward: 250,
    questions: [
      {
        id: 'q1',
        question: `What is the primary governing principle of ${topic}?`,
        options: [
          'A) Standard conservation and balance equations',
          'B) Arbitrary random variable distribution',
          'C) Static non-interacting constants',
          'D) Empirical trial without theoretical basis',
        ],
        correctAnswerIndex: 0,
        explanation: `The foundational foundation of ${topic} relies on standard conservation and balance principles.`,
      },
      {
        id: 'q2',
        question: `When solving exam problems on ${topic}, what is the first step you should perform?`,
        options: [
          'A) Skip directly to final numerical estimation',
          'B) Identify given variables, target outputs, and unit consistency',
          'C) Ignore initial boundary constraints',
          'D) Guess based on multiple choice options',
        ],
        correctAnswerIndex: 1,
        explanation: `Always identify known variables and ensure consistent units before applying primary formulas.`,
      },
    ],
  };
}
