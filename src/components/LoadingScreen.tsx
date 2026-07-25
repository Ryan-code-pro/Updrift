import React, { useEffect, useState } from 'react';
import { Anchor, Sparkles, Compass, Waves } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Abyssal Hydro-Sonar...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    soundFx.playSystemBeep();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + 4;
        if (next > 25 && next < 50) {
          setStatusText('Connecting to Firebase Neural Vault...');
        } else if (next >= 50 && next < 80) {
          setStatusText('Calibrating Bathyscaphe Gauges...');
        } else if (next >= 80) {
          setStatusText('Updrift Campaign Synchronized.');
        }
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      soundFx.playLevelUp();
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 500);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-cyan-100 font-mono transition-opacity duration-500 overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Animated Deep-Sea Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/40 via-slate-950 to-slate-950" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c70a_1px,transparent_1px),linear-gradient(to_bottom,#0284c70a_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Floating Bubbles Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-1/4 bottom-0 w-2 h-2 rounded-full bg-cyan-400/30 animate-bounce duration-[3000ms]" />
        <div className="absolute right-1/3 bottom-0 w-3 h-3 rounded-full bg-cyan-300/20 animate-pulse duration-[4000ms]" />
        <div className="absolute left-2/3 bottom-0 w-1.5 h-1.5 rounded-full bg-cyan-500/40 animate-ping duration-[2500ms]" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center space-y-8">
        
        {/* Anchor & Updrift Brand Header */}
        <div className="flex items-center gap-4 group">
          <div className="relative p-4 rounded-2xl bg-slate-900 border-2 border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.3)] transform transition-transform group-hover:scale-105 duration-300">
            <Anchor className="w-10 h-10 text-cyan-400 animate-pulse" />
            <Sparkles className="w-4 h-4 text-cyan-300 absolute -top-1 -right-1 animate-ping" />
          </div>

          <div className="text-left">
            <h1 className="text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-100 to-teal-200 uppercase drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              UPDRIFT
            </h1>
            <p className="text-[10px] tracking-widest text-cyan-400/80 uppercase font-bold flex items-center gap-1.5 mt-0.5">
              <Waves className="w-3 h-3 text-cyan-400" />
              ABYSSAL STUDY ENGINE
            </p>
          </div>
        </div>

        {/* Progress Display Box */}
        <div className="w-full space-y-3 bg-slate-900/90 border border-cyan-900/80 p-5 rounded-2xl backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-cyan-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              {statusText}
            </span>
            <span className="text-cyan-400 text-sm font-black">{progress}%</span>
          </div>

          {/* Progress Bar Container */}
          <div className="relative h-2.5 w-full bg-slate-950 rounded-full border border-cyan-900/60 overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-cyan-400/60 font-mono pt-1">
            <span>DEPTH: 10,994M</span>
            <span>FIREBASE SECURE</span>
          </div>
        </div>

      </div>
    </div>
  );
};
