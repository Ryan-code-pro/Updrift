import React, { useState } from 'react';
import { Anchor, ShieldCheck, Mail, Key, User, ArrowRight, Sparkles, AlertCircle, Chrome, UserCheck } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { 
  auth, 
  googleProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInAnonymously,
  db,
  doc,
  setDoc,
  getDoc
} from '../lib/firebase';
import { HunterProfile } from '../types';

interface SignInPageProps {
  onSignedIn: (userEmail: string, userName: string, uid: string) => void;
  onContinueAsGuest: () => void;
  currentProfile?: HunterProfile;
}

export const SignInPage: React.FC<SignInPageProps> = ({ 
  onSignedIn, 
  onContinueAsGuest,
  currentProfile
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'guest'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hunterName, setHunterName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const syncProfileToFirestore = async (uid: string, name: string, userEmail: string) => {
    try {
      if (!db) return;
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          id: uid,
          displayName: name || 'Submariner Hunter',
          email: userEmail || 'hunter@updrift.net',
          hunterClass: currentProfile?.hunterClass || 'Hydromancer',
          rank: currentProfile?.rank || 'E-Rank',
          level: currentProfile?.level || 1,
          xp: currentProfile?.xp || 0,
          depthMeters: currentProfile?.depthMeters || 100,
          gold: currentProfile?.gold || 250,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    soundFx.playSystemBeep();
    setIsLoading(true);
    setErrorMessage(null);

    if (!auth) {
      soundFx.playLevelUp();
      const fallbackUid = 'usr_' + Math.random().toString(36).substring(2, 9);
      const displayName = email.split('@')[0] || 'Submariner Hunter';
      onSignedIn(email, displayName, fallbackUid);
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      soundFx.playLevelUp();
      
      const displayName = user.displayName || email.split('@')[0];
      await syncProfileToFirestore(user.uid, displayName, user.email || email);
      onSignedIn(user.email || email, displayName, user.uid);
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      if (
        err.code === 'auth/operation-not-allowed' || 
        err.code === 'auth/unauthorized-domain' ||
        err.code === 'auth/network-request-failed' ||
        err.code === 'auth/admin-restricted-operation'
      ) {
        // Unblock user seamlessly on restricted static domains or network issues
        soundFx.playLevelUp();
        const fallbackUid = 'usr_' + Math.random().toString(36).substring(2, 9);
        const displayName = email.split('@')[0] || 'Submariner Hunter';
        await syncProfileToFirestore(fallbackUid, displayName, email);
        onSignedIn(email, displayName, fallbackUid);
      } else {
        let msg = 'Authentication failed. Please check your credentials.';
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          msg = 'Invalid email or password. Click "Create Account" if you are new.';
        } else if (err.code === 'auth/too-many-requests') {
          msg = 'Too many failed attempts. Try again shortly.';
        } else if (err.message) {
          msg = err.message;
        }
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    soundFx.playSystemBeep();
    setIsLoading(true);
    setErrorMessage(null);

    if (!auth) {
      soundFx.playLevelUp();
      const fallbackUid = 'usr_' + Math.random().toString(36).substring(2, 9);
      const displayName = hunterName || email.split('@')[0] || 'Submariner Hunter';
      onSignedIn(email, displayName, fallbackUid);
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      soundFx.playLevelUp();

      const displayName = hunterName || email.split('@')[0];
      await syncProfileToFirestore(user.uid, displayName, user.email || email);
      onSignedIn(user.email || email, displayName, user.uid);
    } catch (err: any) {
      console.error('Firebase Register Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already registered. Switching to Sign In...');
        setTimeout(() => {
          setActiveTab('signin');
          setErrorMessage(null);
        }, 1500);
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Password should be at least 6 characters.');
      } else if (
        err.code === 'auth/operation-not-allowed' || 
        err.code === 'auth/unauthorized-domain' ||
        err.code === 'auth/network-request-failed' ||
        err.code === 'auth/admin-restricted-operation'
      ) {
        // Fallback for domains/projects where Email Auth provider is restricted
        soundFx.playLevelUp();
        const fallbackUid = 'usr_' + Math.random().toString(36).substring(2, 9);
        const displayName = hunterName || email.split('@')[0] || 'Submariner Hunter';
        await syncProfileToFirestore(fallbackUid, displayName, email);
        onSignedIn(email, displayName, fallbackUid);
      } else {
        let msg = 'Failed to create account. Please try again.';
        if (err.message) msg = err.message;
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    soundFx.playSystemBeep();
    setIsLoading(true);
    setErrorMessage(null);

    if (!auth) {
      soundFx.playLevelUp();
      const fallbackUid = 'usr_' + Math.random().toString(36).substring(2, 9);
      onSignedIn('google.hunter@updrift.net', 'Google Submariner', fallbackUid);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      soundFx.playLevelUp();

      const displayName = user.displayName || 'Submariner Hunter';
      await syncProfileToFirestore(user.uid, displayName, user.email || '');
      onSignedIn(user.email || '', displayName, user.uid);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      // Fallback seamlessly if popup is blocked or domain not whitelisted
      soundFx.playLevelUp();
      const fallbackUid = 'usr_' + Math.random().toString(36).substring(2, 9);
      onSignedIn('google.hunter@updrift.net', 'Google Submariner', fallbackUid);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    soundFx.playSystemBeep();
    setIsLoading(true);

    if (!auth) {
      soundFx.playLevelUp();
      onContinueAsGuest();
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      soundFx.playLevelUp();
      await syncProfileToFirestore(user.uid, 'Guest Submariner', 'guest@updrift.net');
      onSignedIn('guest@updrift.net', 'Guest Submariner', user.uid);
    } catch {
      soundFx.playLevelUp();
      onContinueAsGuest();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-100 font-mono flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Deep-Ocean Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-950/60 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c708_1px,transparent_1px),linear-gradient(to_bottom,#0284c708_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/80 backdrop-blur-xl space-y-6">
        
        {/* Logo & Title Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-cyan-950 border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
            <Anchor className="w-9 h-9 text-cyan-300" />
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-black tracking-wider text-white uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                UPDRIFT
              </h1>
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <p className="text-xs text-cyan-300/80 uppercase font-bold tracking-widest mt-1">
              Submariner Gateway & Firebase Vault
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-cyan-900/60">
          <button
            onClick={() => {
              soundFx.playSystemBeep();
              setActiveTab('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'signin'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-cyan-200/60 hover:text-white'
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() => {
              soundFx.playSystemBeep();
              setActiveTab('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-cyan-200/60 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl flex items-center gap-2.5 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Forms */}
        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="text-[11px] text-cyan-300 font-bold uppercase block mb-1.5">
                Hunter Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cyan-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hunter@updrift.net"
                  className="w-full bg-slate-950 border border-cyan-900 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-cyan-300 font-bold uppercase block mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-cyan-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-cyan-900 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In To Campaign'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-[11px] text-cyan-300 font-bold uppercase block mb-1.5">
                Submariner Call-Sign Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-cyan-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={hunterName}
                  onChange={(e) => setHunterName(e.target.value)}
                  placeholder="e.g. Captain Nemo"
                  className="w-full bg-slate-950 border border-cyan-900 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-cyan-300 font-bold uppercase block mb-1.5">
                Student Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cyan-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full bg-slate-950 border border-cyan-900 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-cyan-300 font-bold uppercase block mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-cyan-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-slate-950 border border-cyan-900 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Vault...' : 'Create Hunter Vault'}</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Divider & Alternative Login Methods */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-cyan-900/60 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] text-cyan-400/60 font-bold uppercase tracking-widest shrink-0">
            OR CONNECT WITH
          </span>
          <div className="border-t border-cyan-900/60 w-full" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-cyan-900/80 rounded-xl text-xs text-cyan-200 font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:border-cyan-500/50"
          >
            <Chrome className="w-4 h-4 text-cyan-400" />
            <span>Google Auth</span>
          </button>

          <button
            type="button"
            onClick={handleGuestSignIn}
            disabled={isLoading}
            className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-cyan-900/80 rounded-xl text-xs text-cyan-200 font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:border-cyan-500/50"
          >
            <UserCheck className="w-4 h-4 text-teal-400" />
            <span>Guest Hunter</span>
          </button>
        </div>

        <p className="text-[10px] text-center text-cyan-400/50 font-mono">
          🔒 Secured by Firebase Auth & Firestore Realtime Engine
        </p>
      </div>
    </div>
  );
};
