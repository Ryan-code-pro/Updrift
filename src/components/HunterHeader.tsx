import React from 'react';
import { HunterProfile } from '../types';
import { getRankDetails } from '../data/hunterRanks';
import { Shield, Waves, Zap, Sparkles, PlusCircle, UserCheck, Anchor, Gauge } from 'lucide-react';

interface HunterHeaderProps {
  profile: HunterProfile;
  onOpenStats: () => void;
  onNewSyllabus: () => void;
  onOpenDepthAnalytics: () => void;
}

export const HunterHeader: React.FC<HunterHeaderProps> = ({
  profile,
  onOpenStats,
  onNewSyllabus,
  onOpenDepthAnalytics,
}) => {
  const rankInfo = getRankDetails(profile.rank);
  const xpPercentage = Math.min(100, Math.round((profile.currentXp / profile.requiredXp) * 100));

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/40 text-zinc-100 shadow-xl shadow-cyan-950/60">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: Player Identity & Submarine Rank */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenStats}
                className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 border border-cyan-400/50 shadow-md shadow-cyan-500/20 hover:border-cyan-300 transition-all cursor-pointer"
                title="View Submariner Status"
              >
                <div className="text-xl font-black text-cyan-300 font-mono">
                  L{profile.level}
                </div>
                {profile.stats.unassignedPoints > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-zinc-950 animate-pulse">
                    !
                  </span>
                )}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold">
                    [NAVIGATOR]
                  </span>
                  <h1 className="text-base font-bold text-zinc-100 font-mono tracking-wide">
                    {profile.name}
                  </h1>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono ${rankInfo.badgeColor} ${rankInfo.glowColor}`}
                  >
                    {profile.rank}
                  </span>
                </div>
                <p className="text-xs text-cyan-200/70 font-mono truncate max-w-[200px] sm:max-w-[280px]">
                  {profile.hunterClass} • {profile.title}
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                onClick={onOpenDepthAnalytics}
                className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold"
                title="How Under Water Am I?"
              >
                <Waves className="w-4 h-4 animate-pulse text-cyan-400" />
              </button>
              <button
                onClick={onNewSyllabus}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 text-xs font-mono font-bold text-zinc-950"
              >
                <PlusCircle className="w-3.5 h-3.5 inline mr-1" />
                Syllabus
              </button>
            </div>
          </div>

          {/* Middle: Underwater Gauges & Stats */}
          <div className="flex items-center gap-3 sm:gap-5 w-full md:w-auto justify-center flex-wrap">
            
            {/* "HOW UNDER WATER ARE YOU?" DEPTH TRIGGER BUTTON */}
            <button
              onClick={onOpenDepthAnalytics}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-950 via-cyan-950 to-blue-950 border border-cyan-400/60 text-cyan-200 hover:border-cyan-300 hover:text-white transition-all shadow-md shadow-cyan-950/50 cursor-pointer group"
            >
              <div className="p-1 rounded bg-cyan-900/60 text-cyan-300 group-hover:scale-110 transition-transform">
                <Waves className="w-4 h-4 text-cyan-300 animate-pulse" />
              </div>
              <div className="text-left font-mono">
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide leading-none flex items-center gap-1">
                  <span>How Under Water?</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                </div>
                <div className="text-xs font-black text-cyan-100 leading-tight">
                  -{(profile.currentDepthMeters ?? 2500).toLocaleString()}m Depth Radar
                </div>
              </div>
            </button>

            {/* Oxygen / HP Bar */}
            <div className="flex flex-col min-w-[100px] sm:min-w-[120px]">
              <div className="flex justify-between text-[11px] font-mono text-cyan-200/80 mb-1 font-semibold">
                <span className="text-sky-300 flex items-center gap-1">
                  <Gauge className="w-3 h-3 inline" /> Oxygen
                </span>
                <span>{profile.oxygenLevel || 85}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-sky-800/50">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-cyan-300 transition-all duration-300 rounded-full"
                  style={{ width: `${profile.oxygenLevel || 85}%` }}
                />
              </div>
            </div>

            {/* Sonar MP Bar */}
            <div className="flex flex-col min-w-[100px] sm:min-w-[120px]">
              <div className="flex justify-between text-[11px] font-mono text-cyan-200/80 mb-1 font-semibold">
                <span className="text-cyan-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 inline" /> Sonar MP
                </span>
                <span>{profile.mp}/{profile.maxMp}</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-cyan-900/50">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-teal-400 transition-all duration-300 rounded-full"
                  style={{ width: `${(profile.mp / profile.maxMp) * 100}%` }}
                />
              </div>
            </div>

            {/* XP Level Bar */}
            <div className="flex flex-col min-w-[110px] sm:min-w-[140px]">
              <div className="flex justify-between text-[11px] font-mono text-cyan-200/80 mb-1 font-semibold">
                <span className="text-teal-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 inline" /> XP
                </span>
                <span>{xpPercentage}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-teal-900/50">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-blue-400 transition-all duration-500 rounded-full"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>

          </div>

          {/* Right: Submarine Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenStats}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/60 text-xs font-mono font-semibold text-cyan-200 hover:text-cyan-300 transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Status</span>
            </button>
            <button
              onClick={onNewSyllabus}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs transition-all shadow-md shadow-cyan-500/30 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Awaken Syllabus</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

