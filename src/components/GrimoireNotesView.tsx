import React, { useState, useEffect } from 'react';
import { LessonNotes } from '../types';
import { FileText, Sparkles, Lightbulb, Zap, HelpCircle, Check, Copy, RefreshCw, BookOpen } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface GrimoireNotesViewProps {
  topic: string;
  subjectName: string;
  notes?: LessonNotes;
  onFetchNotes: () => Promise<void>;
  isLoading: boolean;
}

export const GrimoireNotesView: React.FC<GrimoireNotesViewProps> = ({
  topic,
  subjectName,
  notes,
  onFetchNotes,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);
  const [flippedConceptIndex, setFlippedConceptIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!notes && !isLoading) {
      onFetchNotes();
    }
  }, [topic, notes, isLoading]);

  const handleCopyNotes = () => {
    if (!notes) return;
    const text = `
=== SYSTEM GRIMOIRE NOTES: ${notes.topic} ===
Subject: ${subjectName}

SUMMARY:
${notes.summary}

KEY CONCEPTS:
${notes.keyConcepts.map((c) => `- ${c.term}: ${c.definition} (Example: ${c.example || 'N/A'})`).join('\n')}

CHEAT SHEET FORMULAE & RULES:
${notes.cheatSheetFormulae.map((f) => `- ${f}`).join('\n')}

MNEMONICS:
${notes.mnemonicTricks.map((m) => `- ${m}`).join('\n')}

STUDY TIPS:
${notes.studyTips.map((t) => `- ${t}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundFx.playSystemBeep();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-7 space-y-6 text-zinc-100 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
              [SYSTEM REVISION GRIMOIRE]
            </span>
            <span className="text-xs font-mono text-zinc-500">
              {subjectName}
            </span>
          </div>
          <h2 className="text-2xl font-black font-mono text-zinc-100 mt-1">
            {topic}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onFetchNotes}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
            <span>Regenerate Notes</span>
          </button>

          {notes && (
            <button
              onClick={handleCopyNotes}
              className="px-3.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700 text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Grimoire'}</span>
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="py-16 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <div className="text-sm font-mono text-purple-300 font-bold">
            Extracting Knowledge Mana... Synthesizing Grimoire...
          </div>
        </div>
      )}

      {!isLoading && notes && (
        <>
          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-1.5">
            <div className="text-xs font-mono text-purple-300 font-bold flex items-center gap-1.5 uppercase">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Core Executive Summary</span>
            </div>
            <p className="text-sm font-sans text-zinc-200 leading-relaxed">
              {notes.summary}
            </p>
          </div>

          {/* Key Concepts Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>KEY CONCEPTS & DEFINITIONS (Click card to reveal example)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.keyConcepts.map((concept, idx) => {
                const isFlipped = flippedConceptIndex === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      soundFx.playSystemBeep();
                      setFlippedConceptIndex(isFlipped ? null : idx);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isFlipped
                        ? 'bg-cyan-950/60 border-cyan-500 shadow-lg shadow-cyan-950/50'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-black text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                        CONCEPT #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {isFlipped ? 'Showing Example' : 'Click to flip'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold font-mono text-zinc-100 mb-1">
                      {concept.term}
                    </h4>

                    {!isFlipped ? (
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {concept.definition}
                      </p>
                    ) : (
                      <div className="mt-2 pt-2 border-t border-cyan-800/60 text-xs text-cyan-200">
                        <strong>Example / Context:</strong>
                        <p className="mt-1 text-zinc-300 leading-relaxed">
                          {concept.example || 'Standard problem solving scenario.'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cheat Sheet Formulae & Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <h3 className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>CHEAT SHEET FORMULAE & LAWS</span>
              </h3>
              <ul className="space-y-2">
                {notes.cheatSheetFormulae.map((formula, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-200 text-left"
                  >
                    • {formula}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <h3 className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>MNEMONICS & MEMORY TRICKS</span>
              </h3>
              <ul className="space-y-2">
                {notes.mnemonicTricks.map((mne, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50 font-mono text-xs text-indigo-200"
                  >
                    ⚡ {mne}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* High-Yield Study Tips */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
            <h3 className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              HIGH-YIELD EXAM TIPS:
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-zinc-300">
              {notes.studyTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold font-mono">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

    </div>
  );
};
