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

  const speakLine = (index: number) => {
    if (!audioLesson || !audioLesson.scriptLines[index] || !synthRef.current) return;

    synthRef.current.cancel();

    const line = audioLesson.scriptLines[index];
    const utterance = new SpeechSynthesisUtterance(line.text);
    utteranceRef.current = utterance;

    if (availableVoices[selectedVoiceIndex]) {
      utterance.voice = availableVoices[selectedVoiceIndex];
    }
    utterance.rate = playbackRate;
    utterance.pitch = line.speaker === 'System Narrator' ? 0.9 : 1.1;

    utterance.onend = () => {
      if (index + 1 < audioLesson.scriptLines.length) {
        setCurrentLineIndex(index + 1);
        speakLine(index + 1);
      } else {
        setIsPlaying(false);
        setCurrentLineIndex(0);
        soundFx.playQuestComplete();
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    synthRef.current.speak(utterance);
  };

  const handleTogglePlay = () => {
    if (!synthRef.current || !audioLesson) return;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
        setIsPlaying(true);
      } else {
        setIsPlaying(true);
        speakLine(currentLineIndex);
      }
    }
  };

  const handleReset = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setCurrentLineIndex(0);
  };

  const handleSelectLine = (index: number) => {
    setCurrentLineIndex(index);
    if (isPlaying) {
      speakLine(index);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-7 space-y-6 text-zinc-100 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              [SYSTEM AUDIO BRIEFING ENGINE]
            </span>
          </div>
          <h2 className="text-2xl font-black font-mono text-zinc-100 mt-1">
            {topic}
          </h2>
        </div>

        <button
          onClick={onFetchAudioLesson}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Regenerate Script</span>
        </button>
      </div>

      {isLoading && (
        <div className="py-16 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <div className="text-sm font-mono text-amber-300 font-bold">
            Synthesizing System Audio Briefing Dialogue...
          </div>
        </div>
      )}

      {!isLoading && audioLesson && (
        <>
          {/* Key Takeaways Card */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-2">
            <div className="text-xs font-mono text-amber-400 font-bold uppercase flex items-center gap-1.5">
              <Headphones className="w-4 h-4" />
              <span>KEY AUDIO LESSON TAKEAWAYS</span>
            </div>
            <ul className="space-y-1.5 text-xs text-zinc-300 font-sans">
              {audioLesson.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Player Controls */}
          <div className="p-5 rounded-xl bg-zinc-950 border border-amber-500/30 shadow-lg space-y-4">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Main Play/Pause Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePlay}
                  className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center font-bold transition-transform active:scale-95 shadow-md shadow-amber-500/30 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>

                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
                  title="Reset Audio"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div>
                  <div className="text-xs font-mono text-amber-400 font-bold">
                    {isPlaying ? 'PLAYING SYSTEM AUDIO...' : 'AUDIOBOOK READY'}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    Line {currentLineIndex + 1} of {audioLesson.scriptLines.length}
                  </div>
                </div>
              </div>

              {/* Speed & Voice Options */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                
                {/* Speed Toggle */}
                <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                  <FastForward className="w-3.5 h-3.5 text-zinc-400" />
                  {[0.8, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setPlaybackRate(rate)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                        playbackRate === rate ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                {/* Voice Selection */}
                {availableVoices.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <select
                      value={selectedVoiceIndex}
                      onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
                      className="bg-transparent text-xs font-mono text-zinc-300 focus:outline-none max-w-[120px] truncate"
                    >
                      {availableVoices.map((v, i) => (
                        <option key={i} value={i} className="bg-zinc-900 text-zinc-200">
                          {v.name.replace(/Google|Microsoft|Apple/g, '').trim()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              </div>
            </div>

            {/* Audio Progress Line */}
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
                style={{
                  width: `${((currentLineIndex + 1) / audioLesson.scriptLines.length) * 100}%`,
                }}
              />
            </div>

          </div>

          {/* Synced Script Lines */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono text-zinc-400 font-semibold uppercase tracking-wider">
              INTERACTIVE DIALOGUE SCRIPT (Click any line to jump):
            </h3>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {audioLesson.scriptLines.map((line, idx) => {
                const isActive = idx === currentLineIndex;

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectLine(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-950/60 border-amber-500 text-amber-100 shadow-md shadow-amber-950/50'
                        : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {line.speaker === 'System Narrator' ? (
                        <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span className={`text-[11px] font-mono font-bold uppercase ${
                        line.speaker === 'System Narrator' ? 'text-cyan-400' : 'text-amber-400'
                      }`}>
                        {line.speaker}
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
