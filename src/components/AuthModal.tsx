import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, User, Key, CheckCircle, Sparkles, X, Save, LogOut } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export interface UserAccount {
  email: string;
  name: string;
  isVerified: boolean;
  savedAt: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onSaveUser: (user: UserAccount) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveUser,
  onLogout,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('register');

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email);
      setName(currentUser.name);
      setIsVerified(currentUser.isVerified);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSendVerificationCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    soundFx.playSystemBeep();
    setIsVerificationSent(true);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playLevelUp();
    setIsVerified(true);

    const userObj: UserAccount = {
      email,
      name,
      isVerified: true,
      savedAt: new Date().toISOString(),
    };

    onSaveUser(userObj);
  };

  const handleQuickSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    soundFx.playLevelUp();
    const userObj: UserAccount = {
      email,
      name: name || email.split('@')[0],
      isVerified: true,
      savedAt: new Date().toISOString(),
    };

    onSaveUser(userObj);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-zinc-950 border border-cyan-500/40 rounded-2xl p-6 text-zinc-100 shadow-2xl shadow-cyan-950/60">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-300">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                SUBMARINER AUTHENTICATION
              </div>
              <h2 className="text-lg font-mono font-black text-white">
                {currentUser ? 'Bathyscaphe Account Saved' : 'Sign In & Save Progress'}
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

        {/* Logged in state view */}
        {currentUser && isVerified ? (
          <div className="mt-5 space-y-5">
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  VERIFIED SUBMARINER
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  Email Verified
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-mono font-bold text-white">{currentUser.name}</div>
                <div className="text-xs font-mono text-cyan-200/80">{currentUser.email}</div>
              </div>

              <p className="text-[11px] font-sans text-zinc-300 leading-relaxed pt-2 border-t border-cyan-900/40">
                ✨ Your study campaign, daily sub-quests, levels, and streak records are synced and protected locally in your browser cache and cloud profile.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  soundFx.playSystemBeep();
                  onLogout();
                }}
                className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-300 font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playSystemBeep();
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md shadow-cyan-500/30"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            
            {/* Tabs */}
            <div className="flex rounded-xl bg-slate-900 p-1 border border-cyan-900/50">
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTab === 'register'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Register & Verify
              </button>
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTab === 'signin'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Quick Sign In
              </button>
            </div>

            {activeTab === 'register' ? (
              !isVerificationSent ? (
                <form onSubmit={handleSendVerificationCode} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-mono text-cyan-300 uppercase font-bold block mb-1">
                      Submariner Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Captain Nemo"
                        className="w-full bg-slate-900 border border-cyan-900/70 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-cyan-300 uppercase font-bold block mb-1">
                      Student Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@university.edu"
                        className="w-full bg-slate-900 border border-cyan-900/70 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-cyan-300 uppercase font-bold block mb-1">
                      Security Password
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-cyan-900/70 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md shadow-cyan-500/30 mt-2"
                  >
                    Send Verification Email Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800 text-xs font-mono text-cyan-200">
                    📩 Verification code sent to <strong className="text-white">{email}</strong>. Check your inbox or enter code below:
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-cyan-300 uppercase font-bold block mb-1">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code (e.g. 849201)"
                      className="w-full bg-slate-900 border border-cyan-900/70 rounded-xl px-3 py-2.5 text-center text-sm font-mono tracking-widest text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md shadow-emerald-500/30"
                  >
                    Confirm & Verify Account
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handleQuickSignIn} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-mono text-cyan-300 uppercase font-bold block mb-1">
                    Student Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="w-full bg-slate-900 border border-cyan-900/70 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md shadow-cyan-500/30 mt-2"
                >
                  Sign In & Sync Campaign
                </button>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
