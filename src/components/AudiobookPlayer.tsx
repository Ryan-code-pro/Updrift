import React, { useState, useEffect, useRef } from 'react';
import { AudioLesson } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Headphones,
  Sparkles,
  RefreshCw,
  FastForward,
  User,
  Bot,
  CheckCircle,
  HelpCircle,
  Send,
  MessageSquare,
  X,
  Zap,
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface AudiobookPlayerProps {
  topic: string;
  audioLesson?: AudioLesson;
  onFetchAudioLesson: () => Promise<void>;
  isLoading: boolean;
}

export const AudiobookPlayer: React.FC<AudiobookPlayerProps> = ({
  topic,
  audioLesson,
  onFetchAudioLesson,
  isLoading,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);

  // Mid-session doubt state
  const [isDoubtOpen, setIsDoubtOpen] = useState(false);
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtAnswer, setDoubtAnswer] = useState<string | null>(null);
  const [isAskingDoubt, setIsAskingDoubt] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!audioLesson && !isLoading) {
      onFetchAudioLesson();
    }
  }, [topic, audioLesson, isLoading]);

  // Load SpeechSynthesis Voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
        setAvailableVoices(englishVoices.length > 0 ? englishVoices : voices);
      };

      updateVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = updateVoices;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
  };

  const speakLine = (index: number) => {
    if (!audioLesson || !audioLesson.scriptLines[index]) return;

    stopAudio();

    const line = audioLesson.scriptLines[index];
    const utterance = new SpeechSynthesisUtterance(line.text);
    utteranceRef.current = utterance;

    if (availableVoices[selectedVoiceIndex]) {
      utterance.voice = availableVoices[selectedVoiceIndex];
    }
    utterance.rate = playbackRate;
    utterance.pitch = line.speaker === 'Sonar Narrator' ? 0.9 : 1.1;

    utterance.onend = () => {
      if (index + 1 < audioLesson.scriptLines.length) {
        setCurrentLineIndex(index + 1);
        speakLine(index + 1);
      } else {
        stopAudio();
        setCurrentLineIndex(0);
        soundFx.playQuestComplete();
      }
    };

    utterance.onerror = () => {
      stopAudio();
    };

    if (synthRef.current) {
      synthRef.current.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    if (!audioLesson) return;

    if (isPlaying) {
      stopAudio();
    } else {
      speakLine(currentLineIndex);
    }
  };

  const handleReset = () => {
    stopAudio();
    setCurrentLineIndex(0);
  };

  const handleSelectLine = (index: number) => {
    setCurrentLineIndex(index);
    if (isPlaying) {
      speakLine(index);
    }
  };

  // Open Mid-Session Doubt Panel
  const handleOpenDoubt = () => {
    stopAudio();
    setIsDoubtOpen(true);
    soundFx.playSystemBeep();
  };

  // Submit Mid-Session Doubt
  const handleAskDoubtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtQuestion.trim()) return;

    setIsAskingDoubt(true);
    soundFx.playSystemBeep();

    const activeLineText = audioLesson?.scriptLines[currentLineIndex]?.text || '';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          userMessage: `Mid-session Audiobook Question regarding: "${activeLineText}". Question: ${doubtQuestion}`,
          history: [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDoubtAnswer(data.reply || data.response);
      } else {
        throw new Error('API error');
      }
    } catch (err) {
      setDoubtAnswer(
        `[Sonar Hydro AI Explanation]: In regards to "${activeLineText}", the core concept focuses on applying the standard definitions, ensuring unit consistency, and verifying boundary limits in exam questions.`
      );
    } finally {
      setIsAskingDoubt(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-cyan-900/60 rounded-2xl p-5 sm:p-7 space-y-6 text-zinc-100 shadow-xl shadow-cyan-950/40">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-900/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" />
              [SONAR HYDROPHONE AUDIOBOOK BRIEFING]
            </span>
          </div>
          <h2 className="text-2xl font-black font-mono text-white mt-1">
            {topic}
          </h2>
        </div>

        <button
          onClick={() => {
            stopAudio();
            onFetchAudioLesson();
          }}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 border border-cyan-900/50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Regenerate Script</span>
        </button>
      </div>

      {isLoading && (
        <div className="py-16 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <div className="text-sm font-mono text-cyan-300 font-bold">
            Synthesizing Sonar Audio Briefing Dialogue...
          </div>
        </div>
      )}

      {!isLoading && audioLesson && (
        <>
          {/* Key Takeaways Card */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-2">
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
              <Headphones className="w-4 h-4" />
              <span>KEY AUDIO LESSON HIGH-YIELD TAKEAWAYS</span>
            </div>
            <ul className="space-y-1.5 text-xs text-zinc-300 font-sans">
              {audioLesson.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Player Controls */}
          <div className="p-5 rounded-xl bg-slate-950 border border-cyan-500/40 shadow-lg space-y-4">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Main Play/Pause Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePlay}
                  className="w-12 h-12 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center font-bold transition-transform active:scale-95 shadow-md shadow-cyan-400/30 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>

                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
                  title="Reset Audio"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div>
                  <div className="text-xs font-mono text-cyan-400 font-bold">
                    {isPlaying ? 'PLAYING SONAR AUDIO...' : 'AUDIOBOOK READY'}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-200/60">
                    Line {currentLineIndex + 1} of {audioLesson.scriptLines.length}
                  </div>
                </div>
              </div>

              {/* Ask Doubt Mid-Session Button */}
              <button
                onClick={handleOpenDoubt}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-400/60 text-cyan-300 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-cyan-950/50"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Ask Doubt Mid-Session</span>
              </button>

              {/* Speed & Voice Options */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                
                {/* Speed Toggle */}
                <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-cyan-900/60">
                  <FastForward className="w-3.5 h-3.5 text-zinc-400" />
                  {[0.8, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate);
                        if (isPlaying) speakLine(currentLineIndex);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                        playbackRate === rate ? 'bg-cyan-500 text-slate-950' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                {/* Voice Selection */}
                {availableVoices.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-cyan-900/60">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <select
                      value={selectedVoiceIndex}
                      onChange={(e) => {
                        setSelectedVoiceIndex(Number(e.target.value));
                        if (isPlaying) speakLine(currentLineIndex);
                      }}
                      className="bg-transparent text-xs font-mono text-zinc-300 focus:outline-none max-w-[110px] truncate"
                    >
                      {availableVoices.map((v, i) => (
                        <option key={i} value={i} className="bg-slate-900 text-zinc-200">
                          {v.name.replace(/Google|Microsoft|Apple/g, '').trim()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              </div>
            </div>

            {/* Audio Progress Line */}
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-cyan-900/60">
              <div
                className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-blue-400 transition-all duration-300"
                style={{
                  width: `${((currentLineIndex + 1) / audioLesson.scriptLines.length) * 100}%`,
                }}
              />
            </div>

          </div>

          {/* Interactive Mid-Session Doubt Panel */}
          {isDoubtOpen && (
            <div className="p-4 rounded-xl bg-cyan-950/80 border border-cyan-400/60 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-900/60">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>ASK SONAR HYDRO AI A DOUBT (MID-SESSION)</span>
                </div>
                <button
                  onClick={() => setIsDoubtOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-cyan-900 text-xs font-mono text-cyan-200/90">
                📌 Active Line: <em>"{audioLesson.scriptLines[currentLineIndex]?.text}"</em>
              </div>

              <form onSubmit={handleAskDoubtSubmit} className="space-y-2.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={doubtQuestion}
                    onChange={(e) => setDoubtQuestion(e.target.value)}
                    placeholder="Ask a question about this line or concept..."
                    className="flex-1 bg-slate-900 border border-cyan-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    disabled={isAskingDoubt}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/30 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAskingDoubt ? 'Analyzing...' : 'Ask AI'}</span>
                  </button>
                </div>

                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setDoubtQuestion('Explain this formula or concept in plain terms.')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-900/60"
                  >
                    💡 Plain terms explanation
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoubtQuestion('What exam trap should I watch out for here?')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-900/60"
                  >
                    ⚠️ Exam trap alert
                  </button>
                </div>
              </form>

              {doubtAnswer && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs font-sans text-cyan-100 leading-relaxed space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>SONAR AI EXPLANATION</span>
                  </div>
                  <p>{doubtAnswer}</p>
                  <div className="pt-2 border-t border-cyan-900/40 flex justify-end">
                    <button
                      onClick={() => {
                        setIsDoubtOpen(false);
                        speakLine(currentLineIndex);
                      }}
                      className="px-3 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-700"
                    >
                      ▶️ Resume Audiobook
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Synced Script Lines */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono text-cyan-300/80 font-semibold uppercase tracking-wider">
              INTERACTIVE DIALOGUE SCRIPT (Click any line to jump or pause):
            </h3>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {audioLesson.scriptLines.map((line, idx) => {
                const isActive = idx === currentLineIndex;

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectLine(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-md shadow-cyan-950/50 ring-1 ring-cyan-400/30'
                        : 'bg-slate-950 border-cyan-900/60 hover:border-cyan-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {line.speaker === 'Sonar Narrator' ? (
                          <Bot className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-teal-300" />
                        )}
                        <span className={`text-[11px] font-mono font-bold uppercase ${
                          line.speaker === 'Sonar Narrator' ? 'text-cyan-400' : 'text-teal-300'
                        }`}>
                          {line.speaker}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Line #{idx + 1}
                      </span>
                    </div>

                    <p className="text-xs font-sans leading-relaxed">
                      {line.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
