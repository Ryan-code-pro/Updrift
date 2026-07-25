import React, { useState } from 'react';
import { DailyQuestDay, DailySubQuest, StudyCampaign } from '../types';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  BookOpen,
  Headphones,
  FileText,
  Swords,
  ChevronRight,
  Calendar,
  Award,
  Trophy,
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface DailyQuestsViewProps {
  campaign: StudyCampaign;
  onToggleSubQuest: (dayNumber: number, subQuestId: string) => void;
  onOpenNotes: (dayNumber: number) => void;
  onOpenAudio: (dayNumber: number) => void;
  onOpenQuiz: (dayNumber: number) => void;
  onAwakenSyllabus: () => void;
}

export const DailyQuestsView: React.FC<DailyQuestsViewProps> = ({
  campaign,
  onToggleSubQuest,
  onOpenNotes,
  onOpenAudio,
  onOpenQuiz,
  onAwakenSyllabus,
}) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  const activeDay = campaign.dailyQuests.find((q) => q.dayNumber === selectedDayNumber) || campaign.dailyQuests[0];

  const getSubQuestIcon = (type: DailySubQuest['type']) => {
    switch (type) {
      case 'reading':
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case 'notes':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'audio':
        return <Headphones className="w-4 h-4 text-amber-400" />;
      case 'quiz':
        return <Swords className="w-4 h-4 text-rose-400" />;
    }
  };

  const completedCount = campaign.dailyQuests.filter((d) => d.isCompleted).length;
  const overallProgress = Math.round((completedCount / campaign.dailyQuests.length) * 100);

  return (
    <div className="space-y-6">
      
      {/* Campaign Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-cyan-950/60 to-zinc-900 border border-cyan-500/40 p-5 sm:p-6 shadow-xl shadow-cyan-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold">
                [ACTIVE STUDY QUEST CAMPAIGN]
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">
                {campaign.dailyHours} hrs/day
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-mono text-zinc-100 tracking-tight">
              {campaign.subjectName}
            </h2>
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Target Exam: <strong className="text-zinc-200">{campaign.examDate}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                {campaign.totalDays} Daily Dungeon Floors
              </span>
            </div>
          </div>

          {/* Campaign Progress Gauge */}
          <div className="flex items-center gap-4 bg-zinc-950/80 p-4 rounded-xl border border-zinc-800">
            <div className="text-center">
              <div className="text-2xl font-black font-mono text-cyan-400">
                {overallProgress}%
              </div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase">
                Campaign Cleared
              </div>
            </div>
            <div className="h-10 w-px bg-zinc-800" />
            <button
              onClick={onAwakenSyllabus}
              className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-mono font-semibold text-zinc-200 transition-colors cursor-pointer"
            >
              Change Syllabus
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Days Navigation & Active Day Quests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Timeline of Days */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Swords className="w-4 h-4 text-cyan-400" />
            <span>DUNGEON FLOORS LOG ({campaign.dailyQuests.length} DAYS)</span>
          </h3>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {campaign.dailyQuests.map((day) => {
              const isSelected = day.dayNumber === selectedDayNumber;
              const subCompleted = day.subQuests.filter((s) => s.isCompleted).length;
              const subTotal = day.subQuests.length;
              const dayProgress = Math.round((subCompleted / subTotal) * 100);

              return (
                <div
                  key={day.dayNumber}
                  onClick={() => {
                    soundFx.playSystemBeep();
                    setSelectedDayNumber(day.dayNumber);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-500/20 text-zinc-100'
                      : day.isCompleted
                      ? 'bg-zinc-900/90 border-emerald-600/50 text-zinc-300 hover:border-emerald-500'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-md ${
                        day.isCompleted
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                          : isSelected
                          ? 'bg-cyan-900 text-cyan-200 border border-cyan-500'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        FLOOR {day.dayNumber}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {day.dateString}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-semibold">
                      <Sparkles className="w-3 h-3" />
                      <span>+{day.xpReward} XP</span>
                    </div>
                  </div>

                  <div className="mt-2 text-sm font-semibold font-mono line-clamp-1">
                    {day.mainTopic}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className={`h-full transition-all duration-300 ${
                          day.isCompleted ? 'bg-emerald-400' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${dayProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {subCompleted}/{subTotal}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Day Quest Details */}
        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-6">
          {activeDay && (
            <>
              {/* Active Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                      [DAY {activeDay.dayNumber} QUEST]
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      {activeDay.dateString}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-mono text-zinc-100 mt-0.5">
                    {activeDay.mainTopic}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>+{activeDay.xpReward} XP REWARD</span>
                  </div>
                </div>
              </div>

              {/* Sub-Quests List */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                  SUB-QUEST REQUIREMENTS:
                </h4>

                {activeDay.subQuests.map((sub) => (
                  <div
                    key={sub.id}
                    className={`p-4 rounded-xl border transition-all ${
                      sub.isCompleted
                        ? 'bg-zinc-950/60 border-emerald-800/60 text-zinc-400'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => onToggleSubQuest(activeDay.dayNumber, sub.id)}
                          className="mt-0.5 text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer"
                        >
                          {sub.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                          ) : (
                            <Circle className="w-5 h-5 text-zinc-600 hover:text-cyan-400" />
                          )}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            {getSubQuestIcon(sub.type)}
                            <span className={`text-sm font-mono font-bold ${sub.isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                              {sub.title}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1 font-sans">
                            {sub.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {sub.estimatedMinutes}m
                        </span>

                        {/* Special Launcher Buttons depending on quest type */}
                        {sub.type === 'notes' && (
                          <button
                            onClick={() => onOpenNotes(activeDay.dayNumber)}
                            className="px-3 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700 text-purple-200 text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Read Grimoire</span>
                          </button>
                        )}

                        {sub.type === 'audio' && (
                          <button
                            onClick={() => onOpenAudio(activeDay.dayNumber)}
                            className="px-3 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-amber-200 text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Headphones className="w-3.5 h-3.5" />
                            <span>Listen Audiobook</span>
                          </button>
                        )}

                        {sub.type === 'quiz' && (
                          <button
                            onClick={() => onOpenQuiz(activeDay.dayNumber)}
                            className="px-3 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Swords className="w-3.5 h-3.5" />
                            <span>Challenge Boss</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons Footer for Active Day */}
              <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenNotes(activeDay.dayNumber)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-semibold text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>View Notes</span>
                  </button>

                  <button
                    onClick={() => onOpenAudio(activeDay.dayNumber)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-semibold text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Headphones className="w-4 h-4 text-amber-400" />
                    <span>Listen Audio</span>
                  </button>
                </div>

                <button
                  onClick={() => onOpenQuiz(activeDay.dayNumber)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-zinc-100 font-mono font-black text-xs uppercase tracking-wider shadow-md shadow-rose-950/50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Swords className="w-4 h-4" />
                  <span>Fight Floor Boss Quiz</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
};
