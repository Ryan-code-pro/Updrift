import React, { useState } from 'react';
import { StudyCampaign, HunterProfile, DepthDiagnostic } from '../types';
import {
  Waves,
  Gauge,
  ShieldAlert,
  Compass,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Anchor,
  X,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface DepthAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: StudyCampaign | null;
  profile: HunterProfile;
}

export const DepthAnalyticsModal: React.FC<DepthAnalyticsModalProps> = ({
  isOpen,
  onClose,
  campaign,
  profile,
}) => {
  const [diagnostic, setDiagnostic] = useState<DepthDiagnostic | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Calculate local client-side depth metrics as default fallback
  const totalSubQuests = campaign
    ? campaign.dailyQuests.reduce((acc, dq) => acc + dq.subQuests.length, 0)
    : 0;
  const completedSubQuests = campaign
    ? campaign.dailyQuests.reduce(
        (acc, dq) => acc + dq.subQuests.filter((s) => s.isCompleted).length,
        0
      )
    : 0;

  const completionRatio = totalSubQuests > 0 ? completedSubQuests / totalSubQuests : 0;
  
  // Drowning risk percentage: 100% when 0 completed, decreases as completion rises
  const drowningRiskPct = Math.max(10, Math.round((1 - completionRatio) * 100));
  
  // Current depth in meters: ranges from 1,000m down to 10,000m based on risk
  const calculatedDepthMeters = Math.round(1200 + drowningRiskPct * 88);
  const calculatedPressureAtm = Math.round(calculatedDepthMeters / 10);

  const fetchAIDepthDiagnostics = async () => {
    setIsLoading(true);
    soundFx.playSystemBeep();

    try {
      const response = await fetch('/api/generate-depth-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: campaign?.subjectName || 'Study Syllabus',
          dailyQuests: campaign?.dailyQuests || [],
          clearedQuestsCount: profile.clearedQuestsCount,
          totalQuizzesPassed: profile.totalQuizzesPassed,
          level: profile.level,
        }),
      });

      const data = await response.json();
      if (data.diagnostic) {
        setDiagnostic(data.diagnostic);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeDiagnostic: DepthDiagnostic = diagnostic || {
    currentDepthMeters: calculatedDepthMeters,
    waterPressureAtm: calculatedPressureAtm,
    drowningRiskPercentage: drowningRiskPct,
    statusLabel:
      drowningRiskPct > 60
        ? '⚠️ CRITICAL DEEP SEA PRESSURE - Submarine Leaks Detected'
        : drowningRiskPct > 30
        ? '🌊 MODERATE DEEP TRENCH - Steady Descent'
        : '✨ OPTIMAL BUOYANCY - Surfacing to Mastery',
    summaryDiagnosis:
      drowningRiskPct > 60
        ? `You are currently submerged at ${calculatedDepthMeters} meters in deep study waters. Your pressure hull is taking strain on uncompleted daily quests.`
        : `Your submarine is navigating smoothly through syllabus depth zones with ${completedSubQuests} subquests cleared.`,
    strengths: [
      {
        topic: 'Completed Hydro-Lessons',
        masteryPercentage: Math.min(100, Math.round(completionRatio * 100) + 20),
        buoyancyNote: 'Solid absorption of fundamental definitions & daily quest modules.',
      },
      {
        topic: 'Diver Stamina & Discipline',
        masteryPercentage: profile.stats.discipline * 8,
        buoyancyNote: 'High discipline score reduces oxygen depletion rate during deep study.',
      },
    ],
    weaknesses: [
      {
        topic: 'Uncleared Depth Floors',
        pressureLeakPercentage: drowningRiskPct,
        impactDescription: 'Pending daily quests increase water pressure and risk drowning before exam date.',
        remedyAction: 'Complete the pending reading & listen to the Sonar Audio Briefing today.',
      },
    ],
    resurfaceSteps: [
      'Clear today\'s Daily Quest sub-tasks to equalize hull pressure.',
      'Listen to the Sonar Audio Briefing for quick high-yield concept absorption.',
      'Defeat the Kraken Boss Quiz to earn +250 XP and float 500m towards the surface.',
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-sky-950/90 via-slate-900 to-zinc-950 border border-cyan-500/40 rounded-2xl p-6 text-zinc-100 shadow-2xl shadow-cyan-950/50">
        
        {/* Header Close & Title */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/50 shadow-inner">
              <Waves className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  SUBMARINE SONAR DIAGNOSTICS
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  REAL-TIME DEPTH
                </span>
              </div>
              <h2 className="text-xl font-mono font-black text-white">
                How Under Water Are You?
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playSystemBeep();
              onClose();
            }}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deep Water Gauge Banner */}
        <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-cyan-950/80 to-slate-950 border border-cyan-500/30 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-cyan-500/5 blur-2xl pointer-events-none" />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
            
            {/* Depth Metric */}
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-cyan-900/60 flex flex-col items-center sm:items-start justify-center">
              <span className="text-[11px] font-mono font-bold text-cyan-400/80 flex items-center gap-1.5 uppercase">
                <Anchor className="w-3.5 h-3.5 text-cyan-400" />
                Current Ocean Depth
              </span>
              <div className="text-2xl font-mono font-black text-cyan-200 mt-1">
                -{(activeDiagnostic?.currentDepthMeters ?? 2500).toLocaleString()}m
              </div>
              <span className="text-[10px] font-sans text-cyan-300/70">
                Below Sea Level
              </span>
            </div>

            {/* Pressure Barometer */}
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-cyan-900/60 flex flex-col items-center sm:items-start justify-center">
              <span className="text-[11px] font-mono font-bold text-cyan-400/80 flex items-center gap-1.5 uppercase">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                Water Pressure
              </span>
              <div className="text-2xl font-mono font-black text-sky-200 mt-1">
                {activeDiagnostic.waterPressureAtm} ATM
              </div>
              <span className="text-[10px] font-sans text-sky-300/70">
                Hydrostatic Hull Load
              </span>
            </div>

            {/* Drowning Risk Gauge */}
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-cyan-900/60 flex flex-col items-center sm:items-start justify-center">
              <span className="text-[11px] font-mono font-bold text-cyan-400/80 flex items-center gap-1.5 uppercase">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Study Drowning Risk
              </span>
              <div className={`text-2xl font-mono font-black mt-1 ${
                activeDiagnostic.drowningRiskPercentage > 50 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {activeDiagnostic.drowningRiskPercentage}%
              </div>
              <span className="text-[10px] font-sans text-zinc-400">
                {activeDiagnostic.drowningRiskPercentage > 50 ? 'High Pressure Strain' : 'Safe Buoyancy'}
              </span>
            </div>

          </div>

          {/* Depth Visual Bar */}
          <div className="mt-4 pt-3 border-t border-cyan-900/40">
            <div className="flex justify-between text-[11px] font-mono font-bold text-cyan-300 mb-1.5">
              <span>0m (Surfaced / Prepared)</span>
              <span>11,000m (Mariana Abyss)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-zinc-900 border border-cyan-900 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-rose-500 transition-all duration-700"
                style={{ width: `${Math.min(100, (activeDiagnostic.currentDepthMeters / 11000) * 100)}%` }}
              />
            </div>
            <p className="text-xs font-mono font-semibold text-cyan-300 mt-2 text-center">
              {activeDiagnostic.statusLabel}
            </p>
          </div>
        </div>

        {/* AI Scan Trigger Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={fetchAIDepthDiagnostics}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-cyan-950/50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isLoading ? 'Scanning Deep Trench...' : 'Run Gemini AI Hydro-Scan'}</span>
          </button>
        </div>

        {/* Strengths & Weaknesses Sections */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* 💪 STRENGTHS (Buoyant Currents) */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Buoyant Strengths (Mastered Knowledge)</span>
            </div>

            <div className="space-y-2.5">
              {activeDiagnostic.strengths.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-zinc-900/80 border border-emerald-900/50 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-200">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {item.topic}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px]">
                      {item.masteryPercentage}% Buoyant
                    </span>
                  </div>
                  <p className="text-[11px] font-sans text-zinc-300 leading-normal">
                    {item.buoyancyNote}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ⚠️ WEAKNESSES (Pressure Leaks & Drag) */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Weaknesses & Pressure Points</span>
            </div>

            <div className="space-y-2.5">
              {activeDiagnostic.weaknesses.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-zinc-900/80 border border-rose-900/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-300">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      {item.topic}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px]">
                      -{item.pressureLeakPercentage}% Leak
                    </span>
                  </div>
                  <p className="text-[11px] font-sans text-zinc-300 leading-normal">
                    {item.impactDescription}
                  </p>
                  <div className="mt-1 pt-1 border-t border-rose-900/40 text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                    <span>Fix: {item.remedyAction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 🧭 Resurface Action Plan */}
        <div className="mt-6 p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Submarine Resurface & Mastery Plan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeDiagnostic.resurfaceSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-zinc-900/90 border border-cyan-900/60 text-xs font-sans text-zinc-200 space-y-1 flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-400">
                  <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-[9px]">
                    {idx + 1}
                  </span>
                  <span>STEP {idx + 1}</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Close Action */}
        <div className="mt-6 pt-4 border-t border-cyan-900/60 flex justify-end">
          <button
            onClick={() => {
              soundFx.playSystemBeep();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/30 cursor-pointer"
          >
            Acknowledge Sonar Diagnostics
          </button>
        </div>

      </div>
    </div>
  );
};
