import React, { useState, useEffect } from 'react';
import {
  HunterProfile,
  HunterStats,
  StudyCampaign,
  LessonNotes,
  AudioLesson,
  Quiz,
  DailyQuestDay,
} from './types';
import { INITIAL_HUNTER_PROFILE, calculateXpForLevel, getRankForLevel } from './data/hunterRanks';
import { HunterHeader } from './components/HunterHeader';
import { SyllabusUploadModal } from './components/SyllabusUploadModal';
import { DailyQuestsView } from './components/DailyQuestsView';
import { GrimoireNotesView } from './components/GrimoireNotesView';
import { AudiobookPlayer } from './components/AudiobookPlayer';
import { BossQuizModal } from './components/BossQuizModal';
import { HunterStatsModal } from './components/HunterStatsModal';
import { SystemChatDrawer } from './components/SystemChatDrawer';
import { DepthAnalyticsModal } from './components/DepthAnalyticsModal';
import { AuthModal, UserAccount } from './components/AuthModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LoadingScreen } from './components/LoadingScreen';
import { SignInPage } from './components/SignInPage';
import { auth, onAuthStateChanged, signOut as firebaseSignOut } from './lib/firebase';
import { soundFx } from './utils/soundEffects';
import {
  createClientFallbackCampaign,
  createClientFallbackNotes,
  createClientFallbackAudio,
  createClientFallbackQuiz,
} from './utils/clientFallback';
import {
  Swords,
  BookOpen,
  Headphones,
  FileText,
  Bot,
  Flame,
  Award,
  Sparkles,
  Zap,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  // --- Persistent State ---
  const [profile, setProfile] = useState<HunterProfile>(() => {
    try {
      const saved = localStorage.getItem('solo_leveler_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...INITIAL_HUNTER_PROFILE,
            ...parsed,
            stats: {
              ...INITIAL_HUNTER_PROFILE.stats,
              ...(parsed.stats || {}),
            },
          };
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_HUNTER_PROFILE;
  });

  const [campaign, setCampaign] = useState<StudyCampaign | null>(() => {
    try {
      const saved = localStorage.getItem('solo_leveler_campaign');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return null;
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('solo_leveler_profile', JSON.stringify(profile));
    } catch {
      // Storage guard
    }
  }, [profile]);

  useEffect(() => {
    if (campaign) {
      try {
        localStorage.setItem('solo_leveler_campaign', JSON.stringify(campaign));
      } catch {
        // Storage guard
      }
    }
  }, [campaign]);

  // --- Active View & Modal Navigation ---
  const [activeTab, setActiveTab] = useState<'quests' | 'grimoire' | 'audio' | 'quiz'>('quests');
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);

  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isBossQuizOpen, setIsBossQuizOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [isDepthModalOpen, setIsDepthModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // --- App Loading & Authentication Gate ---
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isGuestSession, setIsGuestSession] = useState(false);

  // User Account state synced with Firebase Auth & LocalCache
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('solo_leveler_user');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Firebase Auth listener
  useEffect(() => {
    if (!auth) return;
    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const acc: UserAccount = {
            email: firebaseUser.email || 'guest@updrift.net',
            name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Guest Submariner'),
            isVerified: true,
            savedAt: new Date().toISOString(),
          };
          setCurrentUser(acc);
          setProfile((prev) => ({
            ...prev,
            name: acc.name,
          }));
          try {
            localStorage.setItem('solo_leveler_user', JSON.stringify(acc));
          } catch {
            // Guard
          }
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firebase onAuthStateChanged error:', err);
    }
  }, []);

  const handleLogout = async () => {
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch {
        // Guard
      }
    }
    setCurrentUser(null);
    setIsGuestSession(false);
    setIsAuthModalOpen(false);
    try {
      localStorage.removeItem('solo_leveler_user');
    } catch {
      // Guard
    }
  };

  const handleLoginSuccess = (account: UserAccount) => {
    setCurrentUser(account);
    setProfile((prev) => ({
      ...prev,
      name: account.name || prev.name,
    }));
    try {
      localStorage.setItem('solo_leveler_user', JSON.stringify(account));
    } catch {
      // Storage guard
    }
  };

  const handleSaveUser = (account: UserAccount) => {
    handleLoginSuccess(account);
  };

  // --- AI Loaded Cache for Active Topic ---
  const [notesCache, setNotesCache] = useState<Record<number, LessonNotes>>({});
  const [audioCache, setAudioCache] = useState<Record<number, AudioLesson>>({});
  const [quizCache, setQuizCache] = useState<Record<number, Quiz>>({});

  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);

  // Open syllabus modal on first load if no active campaign exists
  useEffect(() => {
    if (!campaign) {
      setIsSyllabusModalOpen(true);
    }
  }, [campaign]);

  const activeDay: DailyQuestDay | undefined = campaign?.dailyQuests.find(
    (q) => q.dayNumber === activeDayNumber
  ) || campaign?.dailyQuests[0];

  const activeTopic = activeDay?.mainTopic || 'General Syllabus';

  // --- Gain XP & Handle Level Up ---
  const addXp = (amount: number) => {
    setProfile((prev) => {
      let newXp = prev.currentXp + amount;
      let newLevel = prev.level;
      let reqXp = prev.requiredXp;
      let leveledUp = false;
      let unassigned = prev.stats.unassignedPoints;

      while (newXp >= reqXp) {
        newXp -= reqXp;
        newLevel += 1;
        reqXp = calculateXpForLevel(newLevel);
        unassigned += 3;
        leveledUp = true;
      }

      const newRank = getRankForLevel(newLevel);

      if (leveledUp) {
        soundFx.playLevelUp();
        setLevelUpMessage(`SYSTEM ALERT: LEVEL UP! You reached Level ${newLevel} [${newRank}]! +3 Stat Points Earned!`);
        setTimeout(() => setLevelUpMessage(null), 6000);
      }

      return {
        ...prev,
        level: newLevel,
        currentXp: newXp,
        requiredXp: reqXp,
        rank: newRank,
        hp: prev.maxHp,
        mp: prev.maxMp,
        stats: {
          ...prev.stats,
          unassignedPoints: unassigned,
        },
      };
    });
  };

  // --- Campaign Generation Handler ---
  const handleGenerateCampaign = async (params: {
    subjectName: string;
    syllabusText: string;
    examDate: string;
    dailyHours: number;
    hunterClass: string;
  }) => {
    let loadedCampaign = null;

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.campaign) {
          loadedCampaign = data.campaign;
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable, using client-side fallback:', err);
    }

    if (!loadedCampaign) {
      loadedCampaign = createClientFallbackCampaign(
        params.subjectName,
        params.syllabusText,
        params.examDate,
        params.dailyHours
      );
    }

    setCampaign(loadedCampaign);
    setActiveDayNumber(1);
    setProfile((prev) => ({
      ...prev,
      hunterClass: params.hunterClass,
    }));
    setNotesCache({});
    setAudioCache({});
    setQuizCache({});
  };

  // --- Toggle Sub-Quest Completion ---
  const handleToggleSubQuest = (dayNumber: number, subQuestId: string) => {
    if (!campaign) return;

    soundFx.playQuestComplete();

    setCampaign((prev) => {
      if (!prev) return null;
      const updatedQuests = prev.dailyQuests.map((dq) => {
        if (dq.dayNumber !== dayNumber) return dq;

        const updatedSubs = dq.subQuests.map((sq) => {
          if (sq.id !== subQuestId) return sq;
          const newCompleted = !sq.isCompleted;
          if (newCompleted) {
            addXp(30);
          }
          return { ...sq, isCompleted: newCompleted };
        });

        const allDone = updatedSubs.every((s) => s.isCompleted);
        return {
          ...dq,
          subQuests: updatedSubs,
          isCompleted: allDone,
        };
      });

      return {
        ...prev,
        dailyQuests: updatedQuests,
      };
    });
  };

  // --- Fetch AI Lesson Notes ---
  const handleFetchNotes = async () => {
    if (!activeDay) return;
    setIsNotesLoading(true);

    try {
      const res = await fetch('/api/generate-lesson-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeDay.mainTopic,
          subjectName: campaign?.subjectName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.notes) {
          setNotesCache((prev) => ({ ...prev, [activeDay.dayNumber]: data.notes }));
          setIsNotesLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable, using client fallback notes:', err);
    }

    const fallback = createClientFallbackNotes(activeDay.mainTopic, campaign?.subjectName);
    setNotesCache((prev) => ({ ...prev, [activeDay.dayNumber]: fallback }));
    setIsNotesLoading(false);
  };

  // --- Fetch AI Audiobook Script ---
  const handleFetchAudioLesson = async () => {
    if (!activeDay) return;
    setIsAudioLoading(true);

    try {
      const res = await fetch('/api/generate-audiobook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeDay.mainTopic,
          subjectName: campaign?.subjectName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioLesson) {
          setAudioCache((prev) => ({ ...prev, [activeDay.dayNumber]: data.audioLesson }));
          setIsAudioLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable, using client fallback audio:', err);
    }

    const fallback = createClientFallbackAudio(activeDay.mainTopic, campaign?.subjectName);
    setAudioCache((prev) => ({ ...prev, [activeDay.dayNumber]: fallback }));
    setIsAudioLoading(false);
  };

  // --- Fetch AI Boss Quiz ---
  const handleFetchQuiz = async () => {
    if (!activeDay) return;
    setIsQuizLoading(true);

    try {
      const res = await fetch('/api/generate-boss-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeDay.mainTopic,
          subjectName: campaign?.subjectName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.quiz) {
          setQuizCache((prev) => ({ ...prev, [activeDay.dayNumber]: data.quiz }));
          setIsQuizLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable, using client fallback quiz:', err);
    }

    const fallback = createClientFallbackQuiz(activeDay.mainTopic, campaign?.subjectName);
    setQuizCache((prev) => ({ ...prev, [activeDay.dayNumber]: fallback }));
    setIsQuizLoading(false);
  };

  // --- Boss Quiz Cleared Handler ---
  const handleBossQuizPassed = (xpEarned: number, scorePercentage: number) => {
    addXp(xpEarned);

    // Update streak and quiz counters
    setProfile((prev) => ({
      ...prev,
      streakDays: prev.streakDays + 1,
      totalQuizzesPassed: prev.totalQuizzesPassed + 1,
      clearedQuestsCount: prev.clearedQuestsCount + 1,
    }));

    // Mark quiz sub-quest complete
    if (activeDay) {
      const quizSub = activeDay.subQuests.find((s) => s.type === 'quiz');
      if (quizSub && !quizSub.isCompleted) {
        handleToggleSubQuest(activeDay.dayNumber, quizSub.id);
      }
    }
  };

  // --- Allocate Stat Points ---
  const handleAllocateStat = (statKey: keyof HunterStats) => {
    setProfile((prev) => {
      if (prev.stats.unassignedPoints <= 0) return prev;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          [statKey]: prev.stats[statKey] + 1,
          unassignedPoints: prev.stats.unassignedPoints - 1,
        },
      };
    });
  };

  if (isAppLoading) {
    return <LoadingScreen onComplete={() => setIsAppLoading(false)} />;
  }

  if (!currentUser && !isGuestSession) {
    return (
      <SignInPage
        onSignedIn={(email, name) => {
          setCurrentUser({
            email,
            name,
            isVerified: true,
            savedAt: new Date().toISOString(),
          });
        }}
        onContinueAsGuest={() => setIsGuestSession(true)}
        currentProfile={profile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-cyan-500 selection:text-zinc-950">
      
      {/* Top Header Bar */}
      <HunterHeader
        profile={profile}
        onOpenStats={() => {
          soundFx.playSystemBeep();
          setIsStatsModalOpen(true);
        }}
        onNewSyllabus={() => {
          soundFx.playSystemBeep();
          setIsSyllabusModalOpen(true);
        }}
        onOpenDepthAnalytics={() => {
          soundFx.playSystemBeep();
          setIsDepthModalOpen(true);
        }}
        onOpenAuth={() => {
          soundFx.playSystemBeep();
          setIsAuthModalOpen(true);
        }}
        onOpenLeaderboard={() => {
          soundFx.playSystemBeep();
          setIsLeaderboardOpen(true);
        }}
        currentUser={currentUser}
      />

      {/* Level Up Banner Alert */}
      {levelUpMessage && (
        <div className="bg-gradient-to-r from-cyan-950 via-teal-900 to-sky-950 border-b border-cyan-400 p-3 text-center text-xs font-mono font-bold text-cyan-200 animate-pulse shadow-lg flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>{levelUpMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        
        {campaign ? (
          <div className="space-y-6">
            
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-cyan-900/40 pb-3 flex-wrap gap-3">
              <div className="flex items-center gap-1 sm:gap-2 bg-slate-900 p-1.5 rounded-xl border border-cyan-900/50">
                <button
                  onClick={() => {
                    soundFx.playSystemBeep();
                    setActiveTab('quests');
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'quests'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                      : 'text-cyan-200/70 hover:text-cyan-100'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Trench Quests</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playSystemBeep();
                    setActiveTab('grimoire');
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'grimoire'
                      ? 'bg-teal-600 text-slate-950 shadow-md shadow-teal-500/30'
                      : 'text-cyan-200/70 hover:text-cyan-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Hydro-Log Notes</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playSystemBeep();
                    setActiveTab('audio');
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'audio'
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                      : 'text-cyan-200/70 hover:text-cyan-100'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Sonar Hydrophone</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playSystemBeep();
                    setIsBossQuizOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-lg text-xs font-mono font-bold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Swords className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kraken Boss</span>
                </button>
              </div>

              {/* System Assistant Chat Drawer Toggle */}
              <button
                onClick={() => {
                  soundFx.playSystemBeep();
                  setIsChatDrawerOpen(!isChatDrawerOpen);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Ask Hydro System AI</span>
              </button>
            </div>

            {/* Active Tab View Render */}
            {activeTab === 'quests' && (
              <DailyQuestsView
                campaign={campaign}
                onToggleSubQuest={handleToggleSubQuest}
                onOpenNotes={(dayNum) => {
                  setActiveDayNumber(dayNum);
                  setActiveTab('grimoire');
                }}
                onOpenAudio={(dayNum) => {
                  setActiveDayNumber(dayNum);
                  setActiveTab('audio');
                }}
                onOpenQuiz={(dayNum) => {
                  setActiveDayNumber(dayNum);
                  setIsBossQuizOpen(true);
                }}
                onAwakenSyllabus={() => setIsSyllabusModalOpen(true)}
              />
            )}

            {activeTab === 'grimoire' && (
              <GrimoireNotesView
                topic={activeTopic}
                subjectName={campaign.subjectName}
                notes={notesCache[activeDayNumber]}
                onFetchNotes={handleFetchNotes}
                isLoading={isNotesLoading}
              />
            )}

            {activeTab === 'audio' && (
              <AudiobookPlayer
                topic={activeTopic}
                audioLesson={audioCache[activeDayNumber]}
                onFetchAudioLesson={handleFetchAudioLesson}
                isLoading={isAudioLoading}
              />
            )}

          </div>
        ) : (
          /* Empty State if No Campaign */
          <div className="py-24 text-center max-w-xl mx-auto space-y-6">
            <div className="inline-flex p-5 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 shadow-2xl">
              <Swords className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black font-mono text-cyan-100">
                THE OCEANIC ABYSS HAS AWAKENED
              </h2>
              <p className="text-sm font-sans text-cyan-200/70 leading-relaxed">
                Upload your syllabus or study outline to generate a deep-sea bathyscaphe quest campaign, sonar audiobooks, hydro-log notes, underwater depth diagnostics, and Kraken boss fights!
              </p>
            </div>
            <button
              onClick={() => setIsSyllabusModalOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/30 inline-flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>AWAKEN STUDY SYLLABUS NOW</span>
            </button>
          </div>
        )}

      </main>

      {/* Modals & Drawers */}
      <SyllabusUploadModal
        isOpen={isSyllabusModalOpen}
        onClose={() => setIsSyllabusModalOpen(false)}
        onGenerateCampaign={handleGenerateCampaign}
      />

      <BossQuizModal
        isOpen={isBossQuizOpen}
        onClose={() => setIsBossQuizOpen(false)}
        quiz={quizCache[activeDayNumber]}
        topic={activeTopic}
        subjectName={campaign?.subjectName || 'Syllabus'}
        onFetchQuiz={handleFetchQuiz}
        isLoading={isQuizLoading}
        onQuizPassed={handleBossQuizPassed}
      />

      <HunterStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        profile={profile}
        onAllocateStat={handleAllocateStat}
      />

      <DepthAnalyticsModal
        isOpen={isDepthModalOpen}
        onClose={() => setIsDepthModalOpen(false)}
        campaign={campaign}
        profile={profile}
      />

      <SystemChatDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        activeTopic={activeTopic}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSaveUser={handleSaveUser}
        onLogout={handleLogout}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentUserProfile={profile}
      />

    </div>
  );
}
