import { HunterProfile, AbyssRank } from '../types';

export interface RankInfo {
  rank: AbyssRank;
  minLevel: number;
  badgeColor: string;
  glowColor: string;
  borderColor: string;
  description: string;
  depthThresholdMeters: number;
}

export const HUNTER_RANKS: RankInfo[] = [
  {
    rank: 'Surface Diver',
    minLevel: 1,
    badgeColor: 'bg-cyan-950 text-cyan-300 border border-cyan-800',
    glowColor: 'shadow-cyan-500/20',
    borderColor: 'border-cyan-600',
    description: 'A novice diver entering the shallow coastal waters of study.',
    depthThresholdMeters: 50,
  },
  {
    rank: 'Coastal Explorer',
    minLevel: 5,
    badgeColor: 'bg-teal-950 text-teal-300 border border-teal-700',
    glowColor: 'shadow-teal-500/30',
    borderColor: 'border-teal-500',
    description: 'Navigating sunlit coral reefs of foundational knowledge with stable buoyancy.',
    depthThresholdMeters: 200,
  },
  {
    rank: 'Bathyscaphe Pilot',
    minLevel: 10,
    badgeColor: 'bg-sky-950 text-sky-300 border border-sky-700',
    glowColor: 'shadow-sky-500/30',
    borderColor: 'border-sky-500',
    description: 'Submerging into the twilight ocean zone, equipped with sonar mapping.',
    depthThresholdMeters: 1000,
  },
  {
    rank: 'Twilight Submariner',
    minLevel: 20,
    badgeColor: 'bg-blue-950 text-blue-300 border border-blue-600',
    glowColor: 'shadow-blue-500/40',
    borderColor: 'border-blue-500',
    description: 'High-tier abyssal scholar able to withstand heavy study water pressure.',
    depthThresholdMeters: 3000,
  },
  {
    rank: 'Abyssal Navigator',
    minLevel: 35,
    badgeColor: 'bg-indigo-950 text-indigo-300 border border-indigo-600',
    glowColor: 'shadow-indigo-500/50',
    borderColor: 'border-indigo-500',
    description: 'An elite deep-sea commander conquering hydrothermal vent boss quizzes.',
    depthThresholdMeters: 6000,
  },
  {
    rank: 'Mariana Trench Master',
    minLevel: 50,
    badgeColor: 'bg-violet-950 text-violet-300 border border-violet-600',
    glowColor: 'shadow-violet-500/50',
    borderColor: 'border-violet-500',
    description: 'Near-total mastery over deep sea trench syllabus topics.',
    depthThresholdMeters: 8500,
  },
  {
    rank: 'Hadopelagic Monarch',
    minLevel: 75,
    badgeColor: 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-600',
    glowColor: 'shadow-fuchsia-500/60',
    borderColor: 'border-fuchsia-500',
    description: 'Top 0.1% deep-sea explorer with flawless hydro-recall and zero pressure leaks.',
    depthThresholdMeters: 10000,
  },
  {
    rank: 'Oceanus Sovereign',
    minLevel: 100,
    badgeColor: 'bg-gradient-to-r from-cyan-900 via-teal-900 to-blue-900 text-cyan-200 border border-cyan-400',
    glowColor: 'shadow-cyan-400/80',
    borderColor: 'border-cyan-400',
    description: 'Supreme ruler of the Oceanic Abyss. All deep water pressure submits to your intellect.',
    depthThresholdMeters: 11034,
  },
];

export function getRankForLevel(level: number): AbyssRank {
  for (let i = HUNTER_RANKS.length - 1; i >= 0; i--) {
    if (level >= HUNTER_RANKS[i].minLevel) {
      return HUNTER_RANKS[i].rank;
    }
  }
  return 'Surface Diver';
}

export function getRankDetails(rank: AbyssRank): RankInfo {
  return HUNTER_RANKS.find((r) => r.rank === rank) || HUNTER_RANKS[0];
}

export function calculateXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.25, level - 1));
}

export const INITIAL_HUNTER_PROFILE: HunterProfile = {
  name: 'Captain Submariner',
  title: 'Novice Diver -> Oceanus Monarch in Training',
  hunterClass: 'Hydro Navigator',
  level: 1,
  currentXp: 0,
  requiredXp: 100,
  rank: 'Surface Diver',
  streakDays: 1,
  lastCompletedDate: null,
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  stats: {
    intellect: 10,
    focus: 10,
    stamina: 10,
    discipline: 10,
    unassignedPoints: 3,
  },
  clearedQuestsCount: 0,
  totalQuizzesPassed: 0,
  currentDepthMeters: 2500, // E.g., 2,500m under water initially
  oxygenLevel: 85,
  buoyancyIndex: 68,
};

