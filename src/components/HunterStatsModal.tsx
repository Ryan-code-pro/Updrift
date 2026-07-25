import React from 'react';
import { HunterProfile, HunterStats } from '../types';
import { HUNTER_RANKS, getRankDetails } from '../data/hunterRanks';
import { Shield, Flame, Zap, Award, Sparkles, X, Plus, Trophy, Brain, Target, Compass, Swords } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface HunterStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: HunterProfile;
  onAllocateStat: (statKey: keyof HunterStats) => void;
}

export const HunterStatsModal: React.FC<HunterStatsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onAllocateStat,
}) => {
  if (!isOpen) return null;

  const currentRankInfo = getRankDetails(profile.rank);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border-2 border-cyan-500/60 rounded-2xl shadow-2xl shadow-cyan-950/80 p-6 text-zinc-100 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold">
                [SYSTEM HUNTER STATUS WINDOW]
              </div>
              <h2 className="text-xl font-bold font-mono text-zinc-100">
                {profile.name} • Level {profile.level}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Player Identity & Stat Allocation */}
          <div className="md:col-span-6 space-y-4">
            
            {/* Identity Card */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">HUNTER CLASS</span>
                <span className="text-xs font-mono font-bold text-cyan-400">{profile.hunterClass}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">CURRENT RANK</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${currentRankInfo.badgeColor}`}>
                  {profile.rank}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">TITLE</span>
                <span className="text-xs font-mono text-amber-300 font-semibold">{profile.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">DAILY STREAK</span>
                <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" /> {profile.streakDays} Days
                </span>
              </div>
            </div>

            {/* Stat Points Allocation */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <span>STAT POINTS ALLOCATION</span>
                </h3>

                {profile.stats.unassignedPoints > 0 ? (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold animate-pulse">
                    {profile.stats.unassignedPoints} Points Available
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-500">
                    0 Points Available
                  </span>
                )}
              </div>

              {/* Stats List */}
              <div className="space-y-3">
                {[
                  { key: 'intellect', label: 'INTELLECT', desc: 'Accelerates concept retention & XP gain', val: profile.stats.intellect, icon: Brain, color: 'text-cyan-400' },
                  { key: 'focus', label: 'FOCUS', desc: 'Increases quiz critical accuracy & MP capacity', val: profile.stats.focus, icon: Target, color: 'text-indigo-400' },
                  { key: 'stamina', label: 'STAMINA', desc: 'Prevents study fatigue & expands HP bar', val: profile.stats.stamina, icon: Shield, color: 'text-emerald-400' },
                  { key: 'discipline', label: 'DISCIPLINE', desc: 'Protects streak & daily quest bonuses', val: profile.stats.discipline, icon: Compass, color: 'text-amber-400' },
                ].map((stat) => (
                  <div key={stat.key} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                        <span className="text-xs font-mono font-bold text-zinc-200">{stat.label}</span>
                        <span className={`text-xs font-mono font-black ${stat.color}`}>{stat.val}</span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">{stat.desc}</div>
                    </div>

                    {profile.stats.unassignedPoints > 0 && (
                      <button
                        onClick={() => {
                          soundFx.playSystemBeep();
                          onAllocateStat(stat.key as keyof HunterStats);
                        }}
                        className="p-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer"
                        title={`Increase ${stat.label}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Hunter Rank Roadmap */}
          <div className="md:col-span-6 space-y-4">
            <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>HUNTER RANK ROADMAP</span>
            </h3>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {HUNTER_RANKS.map((rk) => {
                const isCurrent = rk.rank === profile.rank;
                const isUnlocked = profile.level >= rk.minLevel;

                return (
                  <div
                    key={rk.rank}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-500/20 text-zinc-100'
                        : isUnlocked
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-300'
                        : 'bg-zinc-950/40 border-zinc-900 text-zinc-600 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${rk.badgeColor}`}>
                          {rk.rank}
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-200">
                          Min Level {rk.minLevel}
                        </span>
                      </div>

                      {isCurrent && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500 text-zinc-950">
                          CURRENT RANK
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-sans text-zinc-400 mt-1.5">
                      {rk.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
