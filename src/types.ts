export type AbyssRank = 
  | 'Surface Diver' 
  | 'Coastal Explorer' 
  | 'Bathyscaphe Pilot' 
  | 'Twilight Submariner' 
  | 'Abyssal Navigator' 
  | 'Mariana Trench Master' 
  | 'Hadopelagic Monarch' 
  | 'Oceanus Sovereign';

// Backward compatibility alias
export type HunterRank = AbyssRank;

export interface HunterStats {
  intellect: number;
  focus: number;
  stamina: number;
  discipline: number;
  unassignedPoints: number;
}

export interface HunterProfile {
  name: string;
  title: string;
  hunterClass: string;
  level: number;
  currentXp: number;
  requiredXp: number;
  rank: AbyssRank;
  streakDays: number;
  lastCompletedDate: string | null;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stats: HunterStats;
  clearedQuestsCount: number;
  totalQuizzesPassed: number;
  currentDepthMeters: number; // Current depth below water (e.g. 2400m)
  oxygenLevel: number; // 0-100%
  buoyancyIndex: number; // 0-100%
}

export interface StrengthItem {
  topic: string;
  masteryPercentage: number;
  buoyancyNote: string;
}

export interface WeaknessItem {
  topic: string;
  pressureLeakPercentage: number;
  impactDescription: string;
  remedyAction: string;
}

export interface DepthDiagnostic {
  currentDepthMeters: number;
  waterPressureAtm: number;
  drowningRiskPercentage: number;
  statusLabel: string; // e.g. "HEAVY PRESSURE - Leaking Pressure Hull!" or "OPTIMAL BUOYANCY - Deep Sea Glide"
  summaryDiagnosis: string;
  strengths: StrengthItem[];
  weaknesses: WeaknessItem[];
  resurfaceSteps: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  topic: string;
  questions: QuizQuestion[];
  xpReward: number;
  bossName: string;
}

export interface AudioLesson {
  topic: string;
  durationMinutes: number;
  scriptLines: {
    speaker: 'Sonar Narrator' | 'Abyssal Hydro-Guide';
    text: string;
  }[];
  keyTakeaways: string[];
}

export interface LessonNotes {
  topic: string;
  summary: string;
  keyConcepts: {
    term: string;
    definition: string;
    example?: string;
  }[];
  cheatSheetFormulae: string[];
  mnemonicTricks: string[];
  studyTips: string[];
}

export interface DailySubQuest {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  isCompleted: boolean;
  type: 'reading' | 'audio' | 'notes' | 'quiz';
}

export interface DailyQuestDay {
  dayNumber: number;
  dateString: string;
  mainTopic: string;
  subQuests: DailySubQuest[];
  xpReward: number;
  isCompleted: boolean;
  notes?: LessonNotes;
  audioLesson?: AudioLesson;
  quiz?: Quiz;
  quizPassed?: boolean;
  quizScore?: number;
}

export interface StudyCampaign {
  id: string;
  subjectName: string;
  syllabusText: string;
  examDate: string;
  dailyHours: number;
  createdAt: string;
  totalDays: number;
  dailyQuests: DailyQuestDay[];
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'level_up' | 'quest_complete' | 'streak_fire' | 'system_alert';
  timestamp: string;
}

