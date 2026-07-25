import React from 'react';
import { Flame, Trophy, Award, Anchor, Waves, Sparkles, X, UserCheck } from 'lucide-react';
import { HunterProfile } from '../types';
import { soundFx } from '../utils/soundEffects';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile: HunterProfile;
}

export interface LeaderboardEntry {
  id: string;
  rankPosition: number;
  name: string;
  title: string;
  abyssRank: string;
  level: number;
  streakDays: number;
  depthMeters: number;
  totalXp: number;
  badgeColor: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUserProfile,
}) => {
  if (!isOpen) return null;

  // Mocked leaderboard dataset representing top deep-sea bathyscaphe scholars across universities
  const leaderboardData: LeaderboardEntry[] = [
    {
      id: '1',
      rankPosition: 1,
      name: 'Commander Sarah Lin',
      title: 'Oceanus Sovereign',
      abyssRank: 'Oceanus Sovereign',
      level: 104,
      streakDays: 48,
      depthMeters: 11034,
      totalXp: 18450,
      badgeColor: 'bg-gradient-to-r from-cyan-900 to-blue-900 border-cyan-400 text-cyan-200',
    },
    {
      id: '2',
      rankPosition: 2,
      name: 'Dr. Marcus Vance',
      title: 'Hadopelagic Monarch',
      abyssRank: 'Hadopelagic Monarch',
      level: 82,
      streakDays: 35,
      depthMeters: 10200,
      totalXp: 14200,
      badgeColor: 'bg-fuchsia-950 border-fuchsia-600 text-fuchsia-300',
    },
    {
      id: '3',
      rankPosition: 3,
      name: 'Elena Rostova',
      title: 'Mariana Trench Master',
      abyssRank: 'Mariana Trench Master',
      level: 56,
      streakDays: 27,
      depthMeters: 8900,
      totalXp: 9800,
      badgeColor: 'bg-violet-950 border-violet-600 text-violet-300',
    },
    {
      id: 'me',
      rankPosition: 4,
      name: currentUserProfile.name || 'Captain Submariner',
      title: currentUserProfile.title,
      abyssRank: currentUserProfile.rank,
      level: currentUserProfile.level,
      streakDays: currentUserProfile.streakDays,
      depthMeters: currentUserProfile.currentDepthMeters ?? 2500,
      totalXp: currentUserProfile.level * 100 + currentUserProfile.currentXp,
      badgeColor: 'bg-cyan-950 border-cyan-500 text-cyan-300 ring-2 ring-cyan-400/50',
    },
    {
      id: '5',
      rankPosition: 5,
      name: 'Arthur Pendelton',
      title: 'Abyssal Navigator',
      abyssRank: 'Abyssal Navigator',
      level: 38,
      streakDays: 14,
      depthMeters: 6200,
      totalXp: 5400,
      badgeColor: 'bg-indigo-950 border-indigo-600 text-indigo-300',
    },
    {
      id: '6',
      rankPosition: 6,
      name: 'Kaito Tanaka',
      title: 'Twilight Submariner',
      abyssRank: 'Twilight Submariner',
      level: 22,
      streakDays: 9,
      depthMeters: 3100,
      totalXp: 2800,
      badgeColor: 'bg-blue-950 border-blue-600 text-blue-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-950 to-zinc-950 border border-cyan-500/40 rounded-2xl p-6 text-zinc-100 shadow-2xl shadow-cyan-950/60">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950 border border-amber-500/50 text-amber-400">
              <Trophy className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                GLOBAL BATHYSCAPHE NETWORK
              </div>
              <h2 className="text-xl font-mono font-black text-white">
                Deep Sea Streak Leaderboard
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playSystemBeep();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Quick Banner */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-amber-950 border border-cyan-500/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500 text-slate-950 font-mono font-black flex items-center justify-center text-sm shadow-md">
              #4
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Your Current Network Rank</span>
              </div>
              <div className="text-sm font-mono font-bold text-white">
                {currentUserProfile.name} • L{currentUserProfile.level}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-600/50 text-amber-300">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span>{currentUserProfile.streakDays} Day Streak</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-600/50 text-cyan-300">
              <Anchor className="w-4 h-4 text-cyan-400" />
              <span>-{(currentUserProfile.currentDepthMeters ?? 2500).toLocaleString()}m Depth</span>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="mt-5 space-y-2.5">
          {leaderboardData.map((entry) => {
            const isMe = entry.id === 'me';

            return (
              <div
                key={entry.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  isMe
                    ? 'bg-cyan-950/50 border-cyan-400 ring-1 ring-cyan-400/40 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900/80 border-cyan-900/50 hover:border-cyan-700/60'
                }`}
              >
                {/* Left Rank & Name */}
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg font-mono font-black text-xs flex items-center justify-center border ${
                    entry.rankPosition === 1
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/40'
                      : entry.rankPosition === 2
                      ? 'bg-slate-300 text-slate-950 border-slate-200'
                      : entry.rankPosition === 3
                      ? 'bg-amber-800 text-amber-100 border-amber-700'
                      : 'bg-slate-800 text-cyan-300 border-slate-700'
                  }`}>
                    #{entry.rankPosition}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-white">
                        {entry.name}
                      </span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500 text-slate-950 uppercase">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${entry.badgeColor}`}>
                        {entry.abyssRank}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-200/70">
                        L{entry.level}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Stats: Streak & Depth */}
                <div className="flex items-center gap-4 text-xs font-mono justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-cyan-900/40">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{entry.streakDays} Days</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                    <Waves className="w-3.5 h-3.5 text-cyan-400" />
                    <span>-{entry.depthMeters.toLocaleString()}m</span>
                  </div>

                  <div className="text-[11px] text-zinc-400 font-semibold">
                    {entry.totalXp.toLocaleString()} XP
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-cyan-900/60 flex items-center justify-between">
          <p className="text-[11px] font-mono text-cyan-300/70">
            🔥 Complete daily trench sub-quests to maintain your streak & climb global bathyscaphe ranks!
          </p>

          <button
            onClick={() => {
              soundFx.playSystemBeep();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/30 cursor-pointer"
          >
            Close Leaderboard
          </button>
        </div>

      </div>
    </div>
  );
};
