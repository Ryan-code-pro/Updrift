import React, { useState } from 'react';
import { Upload, Sparkles, Calendar, Clock, BookOpen, AlertCircle, FileText, Swords, X } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface SyllabusUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateCampaign: (params: {
    subjectName: string;
    syllabusText: string;
    examDate: string;
    dailyHours: number;
    hunterClass: string;
  }) => Promise<void>;
}

const SAMPLE_SYLLABI = [
  {
    title: 'CS 101: Data Structures & Algorithms',
    class: 'Shadow Necromancer Code',
    hours: 2,
    text: `Chapter 1: Time Complexity & Big-O Notation
Chapter 2: Arrays, Linked Lists & Dynamic Memory
Chapter 3: Stacks, Queues & Monotonic Sequences
Chapter 4: Binary Search Trees & AVL Trees
Chapter 5: Graph Theory, BFS, DFS & Dijkstra Algorithm
Chapter 6: Dynamic Programming & Greedy Strategies
Chapter 7: Sorting Algorithms & Hash Tables Review`,
  },
  {
    title: 'CHEM 201: Organic Chemistry & Reactions',
    class: 'Alchemist of Elements',
    hours: 2.5,
    text: `Unit 1: Structure, Bonding & Molecular Geometry
Unit 2: Alkanes, Cycloalkanes & Stereochemistry
Unit 3: Nucleophilic Substitution (SN1 vs SN2) & Elimination (E1 vs E2)
Unit 4: Alkenes, Alkynes & Addition Reactions
Unit 5: Aromaticity & Electrophilic Substitution
Unit 6: Spectrometry (NMR, IR & Mass Spectroscopy)
Unit 7: Synthesis Strategies & Final Review`,
  },
  {
    title: 'MATH 302: Multivariable Calculus',
    class: 'Monarch of Mathematics',
    hours: 2,
    text: `Topic 1: Vector Functions & Space Curves
Topic 2: Partial Derivatives & Gradient Vectors
Topic 3: Lagrange Multipliers & Optimization
Topic 4: Double & Triple Integrals in Cylindrical/Spherical Coordinates
Topic 5: Vector Fields, Line Integrals & Fundamental Theorem
Topic 6: Green's Theorem & Stokes' Theorem
Topic 7: Divergence Theorem & Comprehensive Final Prep`,
  },
];

export const SyllabusUploadModal: React.FC<SyllabusUploadModalProps> = ({
  isOpen,
  onClose,
  onGenerateCampaign,
}) => {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 14);
  const formattedDefaultDate = defaultDate.toISOString().split('T')[0];

  const [subjectName, setSubjectName] = useState('');
  const [syllabusText, setSyllabusText] = useState('');
  const [examDate, setExamDate] = useState(formattedDefaultDate);
  const [dailyHours, setDailyHours] = useState(2);
  const [hunterClass, setHunterClass] = useState('Shadow Scholar');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSyllabusText(content);
      if (!subjectName) {
        setSubjectName(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = (sample: typeof SAMPLE_SYLLABI[0]) => {
    soundFx.playSystemBeep();
    setSubjectName(sample.title);
    setSyllabusText(sample.text);
    setHunterClass(sample.class);
    setDailyHours(sample.hours);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !syllabusText.trim()) {
      setErrorMessage('Please provide both a Subject Name and Syllabus Content.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    soundFx.playSystemBeep();

    try {
      await onGenerateCampaign({
        subjectName,
        syllabusText,
        examDate,
        dailyHours,
        hunterClass,
      });
      soundFx.playLevelUp();
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setErrorMessage('Failed to generate daily quest plan. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-900 border-2 border-cyan-500/60 rounded-2xl shadow-2xl shadow-cyan-950/80 p-6 text-zinc-100 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold">
                [SYSTEM INITIATION]
              </div>
              <h2 className="text-xl font-bold font-mono text-zinc-100">
                Awaken Study Syllabus
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div className="mt-4 p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl">
          <div className="text-xs font-mono text-zinc-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 inline" />
            <span>QUICK DEMO PRESETS (Click to autofill):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SYLLABI.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadSample(sample)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-cyan-950/60 border border-zinc-700 hover:border-cyan-500 text-xs font-mono text-zinc-300 hover:text-cyan-300 transition-all cursor-pointer"
              >
                + {sample.title.split(':')[0]}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-600/50 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subject Name */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1 font-semibold">
                SUBJECT / COURSE TITLE
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Advanced Physics & Thermodynamics"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-cyan-500 focus:outline-none text-sm font-mono text-zinc-100 placeholder-zinc-600"
                  required
                />
              </div>
            </div>

            {/* Hunter Class */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1 font-semibold">
                HUNTER CLASS
              </label>
              <select
                value={hunterClass}
                onChange={(e) => setHunterClass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-cyan-500 focus:outline-none text-sm font-mono text-zinc-100"
              >
                <option value="Shadow Scholar">Shadow Scholar (Balanced)</option>
                <option value="Monarch of Science">Monarch of Science</option>
                <option value="Blade of Code & Logic">Blade of Code & Logic</option>
                <option value="Alchemist of Elements">Alchemist of Elements</option>
                <option value="Grand Master of Humanities">Grand Master of Humanities</option>
              </select>
            </div>
          </div>

          {/* Exam Date & Daily Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1 font-semibold">
                EXAM DATE / DEADLINE
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-cyan-500 focus:outline-none text-sm font-mono text-zinc-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1 font-semibold">
                DAILY STUDY AVAILABILITY: <span className="text-cyan-400 font-bold">{dailyHours} Hours/Day</span>
              </label>
              <div className="flex items-center gap-3 pt-2">
                <Clock className="w-4 h-4 text-zinc-500" />
                <input
                  type="range"
                  min="0.5"
                  max="6"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Syllabus Text & File Upload */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-mono text-zinc-300 font-semibold">
                SYLLABUS CONTENT / CHAPTER OUTLINE
              </label>
              <label className="cursor-pointer text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File (.txt, .md)</span>
                <input
                  type="file"
                  accept=".txt,.md,.text"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={6}
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
              placeholder="Paste syllabus chapters, topics, learning objectives, or exam scope here..."
              className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-cyan-500 focus:outline-none text-xs font-mono text-zinc-200 placeholder-zinc-600 resize-y"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-zinc-950 font-mono font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin text-zinc-950" />
                  <span>ANALYZING SYLLABUS... GENERATING QUESTS...</span>
                </>
              ) : (
                <>
                  <Swords className="w-5 h-5" />
                  <span>AWAKEN DAILY QUEST CAMPAIGN</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
