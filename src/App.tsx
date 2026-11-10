import React, { useState, useEffect } from 'react';
import { CMA_QUESTIONS } from './data/cmaQuestions';
import { CMA_CASE_STUDIES, CMA_CASE_QUESTIONS } from './data/cmaCaseStudies';
import {
  Question,
  ExamSession,
  ExamAttemptSummary,
  UserAccount,
  UserRole,
  PricingConfig,
  UserDiscount,
  CouponCode,
  CaseStudyScenario,
  CMAPart,
  ExamMode,
  ThemePreference,
} from './types';
import {
  calculateCMAExamScore,
  calculateDomainStats,
} from './utils/scoring';
import { PrometricExamUI } from './components/PrometricExamUI';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { HeaderNav } from './components/HeaderNav';
import { AdminHeaderNav, AdminTab } from './components/AdminHeaderNav';
import { PublicHeaderNav, PublicTab } from './components/PublicHeaderNav';
import { PublicLandingPage } from './components/PublicLandingPage';
import { BlogsView } from './components/BlogsView';
import { AboutView } from './components/AboutView';
import { TalkToUsModal } from './components/TalkToUsModal';
import { FormulaExhibitModal } from './components/FormulaExhibitModal';
import { PremiumPaywallModal } from './components/PremiumPaywallModal';
import { ExamResultsView } from './components/ExamResultsView';
import { EditProfileModal } from './components/EditProfileModal';
import { AdminPortal } from './components/AdminPortal';
import { CaseStudyViewer } from './components/CaseStudyViewer';
import { OfferUnlockedModal } from './components/OfferUnlockedModal';
import { AuthPage } from './components/AuthPage';
import { FinHornetGeminiChatbot } from './components/FinHornetGeminiChatbot';
import { buildQuestionContext } from './utils/questionContext';
import {
  auth,
  db,
  onAuthStateChanged,
  ADMIN_EMAIL,
  isUserAdmin,
  logOutFirebase,
  FirebaseUser,
} from './services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  getQuestionsFromFirestore,
  addQuestionToFirestore,
  updateQuestionInFirestore,
  deleteQuestionFromFirestore,
  bulkUploadQuestionsToFirestore,
} from './services/questionService';
import {
  getCouponsFromFirestore,
  saveCouponToFirestore,
  deleteCouponFromFirestore,
  toggleCouponStatusInFirestore,
  getUserDiscountsFromFirestore,
  saveUserDiscountToFirestore,
  deleteUserDiscountFromFirestore,
  DEFAULT_COUPONS,
  DEFAULT_USER_DISCOUNTS,
} from './services/discountService';
import {
  BlogPost,
  INITIAL_BLOGS,
  getBlogsFromFirestore,
} from './services/blogService';
import {
  CallbackLead,
  getCallbackLeadsFromFirestore,
} from './services/leadService';
import { ShieldAlert, X } from 'lucide-react';

// Initial seed attempts so performance trends render nicely
const INITIAL_ATTEMPTS: ExamAttemptSummary[] = [
  {
    id: 'att-seed-1',
    date: '2026-10-14',
    timestamp: Date.now() - 10 * 86400000,
    title: 'CMA Part 1 - Diagnostic Assessment',
    part: 'part1',
    mode: 'prometric-timed',
    score: 3,
    total: 5,
    accuracy: 60,
    scaledScore: 316,
    passed: false,
    timeSpentSeconds: 480,
    answers: {
      'cma-p1-001': 'A',
      'cma-p1-002': 'B',
      'cma-p1-003': 'A',
      'cma-p1-004': 'B',
      'cma-p1-005': 'A',
    },
    questionIds: ['cma-p1-001', 'cma-p1-002', 'cma-p1-003', 'cma-p1-004', 'cma-p1-005'],
  },
  {
    id: 'att-seed-2',
    date: '2026-10-18',
    timestamp: Date.now() - 6 * 86400000,
    title: 'CMA Part 1 - Section Simulation',
    part: 'part1',
    mode: 'prometric-timed',
    score: 4,
    total: 5,
    accuracy: 80,
    scaledScore: 400,
    passed: true,
    timeSpentSeconds: 520,
    answers: {
      'cma-p1-001': 'A',
      'cma-p1-002': 'A',
      'cma-p1-003': 'A',
      'cma-p1-004': 'A',
      'cma-p1-005': 'B',
    },
    questionIds: ['cma-p1-001', 'cma-p1-002', 'cma-p1-003', 'cma-p1-004', 'cma-p1-005'],
  },
  {
    id: 'att-seed-3',
    date: '2026-10-22',
    timestamp: Date.now() - 2 * 86400000,
    title: 'CMA Part 1 - Cost & Variance Focus',
    part: 'part1',
    mode: 'practice-immediate',
    score: 5,
    total: 5,
    accuracy: 100,
    scaledScore: 500,
    passed: true,
    timeSpentSeconds: 420,
    answers: {
      'cma-p1-001': 'A',
      'cma-p1-002': 'A',
      'cma-p1-003': 'A',
      'cma-p1-004': 'A',
      'cma-p1-005': 'A',
    },
    questionIds: ['cma-p1-001', 'cma-p1-002', 'cma-p1-003', 'cma-p1-004', 'cma-p1-005'],
  },
];

const DEFAULT_PRICING: PricingConfig = {
  monthlyRegularPrice: 999,
  monthlyOfferPrice: 350,
  sixMonthRegularPrice: 2999,
  sixMonthOfferPrice: 1499,
  discountPercent: 65,
  currencySymbol: 'Rs.',
};

// Helper to resolve dark mode based on theme preference and OS prefers-color-scheme
const resolveIsDark = (pref: ThemePreference): boolean => {
  if (pref === 'dark') return true;
  if (pref === 'light') return false;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

export default function App() {
  // Theme preference ('system' | 'light' | 'dark'), defaults to 'system'
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('finnerd_theme_preference');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved as ThemePreference;
    }
    return 'system';
  });

  // Dynamic active dark mode state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedPref =
      (localStorage.getItem('finnerd_theme_preference') as ThemePreference) || 'system';
    return resolveIsDark(savedPref);
  });

  // Current active navigation tab for students
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'exam' | 'formulas' | 'cases' | 'auth'>('dashboard');

  // Active tab inside Admin Portal
  const [adminTab, setAdminTab] = useState<AdminTab>('questions');

  // Active public tab for pre-login visitors ('home' | 'blogs' | 'about')
  const [publicTab, setPublicTab] = useState<PublicTab>('home');

  // Talk To Us Callback Modal state
  const [isTalkToUsModalOpen, setIsTalkToUsModalOpen] = useState(false);

  // CMA Study Blogs
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);

  // Inbound Callback Leads
  const [leads, setLeads] = useState<CallbackLead[]>([]);

  // Access denied banner state when non-admin tries to access /admin
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  // Dynamic Question Bank
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('finnerd_questions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return CMA_QUESTIONS;
  });

  // Case study scenarios
  const [caseStudies, setCaseStudies] = useState<CaseStudyScenario[]>(() => {
    const saved = localStorage.getItem('finnerd_cases');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return CMA_CASE_STUDIES;
  });

  // Dynamic Pricing Configuration
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(() => {
    const saved = localStorage.getItem('finnerd_pricing');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_PRICING;
  });

  // User-Specific Email Discounts
  const [userDiscounts, setUserDiscounts] = useState<UserDiscount[]>(() => {
    const saved = localStorage.getItem('finnerd_user_discounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_USER_DISCOUNTS;
  });

  // Promotional Coupon Codes
  const [coupons, setCoupons] = useState<CouponCode[]>(() => {
    const saved = localStorage.getItem('finnerd_coupons');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_COUPONS;
  });

  // User Account State: Strictly 2 roles: 'admin' or 'user'
  // Default visitor starts unauthenticated so public landing page is shown
  const [user, setUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('finnerd_user_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.isAuthenticated) {
          if (parsed.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            parsed.role = 'admin';
            parsed.isAuthenticated = true;
            parsed.isGuest = false;
          } else if (parsed.role !== 'admin' && parsed.role !== 'user') {
            parsed.role = 'user';
          }
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return {
      role: 'user',
      name: 'Guest Candidate',
      candidateId: 'FN-GUEST',
      email: '',
      phone: '',
      location: '',
      targetExamWindow: 'Jan/Feb 2027 Testing Window',
      targetExamDate: 'Jan/Feb 2027',
      dailyGoalQuestions: 10,
      preparationTrack: 'US CMA Part 1',
      isPremium: false,
      freeQuestionsUsed: 0,
      maxFreeQuestions: 5,
      selectedPart: 'part1',
      streakDays: 0,
      totalXp: 0,
      isAuthenticated: false,
      isGuest: true,
      claimedOffer: false,
    };
  });

  const [attempts, setAttempts] = useState<ExamAttemptSummary[]>(() => {
    const saved = localStorage.getItem('finnerd_attempts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_ATTEMPTS;
  });

  const [answeredFreeIds, setAnsweredFreeIds] = useState<string[]>([]);
  const [caseAnswers, setCaseAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});

  // Active exam session state
  const [activeSession, setActiveSession] = useState<ExamSession | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isOfferUnlockedModalOpen, setIsOfferUnlockedModalOpen] = useState(false);
  const [offerClaimed, setOfferClaimed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFormulasModalOpen, setIsFormulasModalOpen] = useState(false);
  const [reviewingAttempt, setReviewingAttempt] = useState<ExamAttemptSummary | null>(null);

  // Active viewing question across exam simulator, case study viewer, or review
  const [activeViewingQuestion, setActiveViewingQuestion] = useState<{
    question: Question | null;
    userAnswer?: string;
  }>({ question: null });

  const handleActiveQuestionChange = React.useCallback((question: Question | null, userAnswer?: string) => {
    setActiveViewingQuestion((prev) => {
      if (prev.question?.id === question?.id && prev.userAnswer === userAnswer) {
        return prev;
      }
      return { question, userAnswer };
    });
  }, []);

  // Derive the active question context (full text, options, correct answer, step-by-step explanation)
  const activeQuestionContext = React.useMemo(() => {
    if (activeViewingQuestion.question) {
      return buildQuestionContext(activeViewingQuestion.question, activeViewingQuestion.userAnswer);
    }
    if (activeSession && activeSession.questionIds.length > 0) {
      const qId = activeSession.questionIds[0];
      const q = [...questions, ...CMA_CASE_QUESTIONS].find((item) => item.id === qId);
      if (q) {
        return buildQuestionContext(q, activeSession.userAnswers[q.id]);
      }
    }
    return null;
  }, [activeViewingQuestion, activeSession, questions]);

  const [firestoreSynced, setFirestoreSynced] = useState<boolean>(false);
  const [isLoadingFirestore, setIsLoadingFirestore] = useState<boolean>(true);

  // Strict role-based URL and route guard
  useEffect(() => {
    const checkRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      const isAdminRoute = hash === '#admin' || pathname === '/admin';

      if (isAdminRoute) {
        if (user.role === 'admin') {
          // Admin authorized
        } else {
          // Block regular student from accessing /admin
          window.location.hash = '';
          setAccessDeniedMessage(
            'Access Restricted: The /admin portal is strictly reserved for verified administrators.'
          );
          setTimeout(() => setAccessDeniedMessage(null), 5000);
          setCurrentTab('dashboard');
        }
      }
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, [user.role]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.email) {
        const isAdmin = isUserAdmin(firebaseUser.email);
        setUser((prev) => ({
          ...prev,
          email: firebaseUser.email || prev.email,
          name: firebaseUser.displayName || prev.name,
          role: isAdmin ? 'admin' : 'user',
          isPremium: isAdmin || prev.isPremium,
          isAuthenticated: true,
          isGuest: false,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Pull questions, coupons, and discounts directly from Cloud Firestore
  const loadQuestionsFromFirestore = async () => {
    setIsLoadingFirestore(true);
    try {
      const result = await getQuestionsFromFirestore();
      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions);
        setFirestoreSynced(result.fromFirestore);
      }
    } catch (err) {
      console.error('Failed to load questions from Firestore:', err);
    } finally {
      setIsLoadingFirestore(false);
    }
  };

  const loadDiscountsAndCouponsFromFirestore = async () => {
    try {
      const [couponsRes, discountsRes] = await Promise.all([
        getCouponsFromFirestore(),
        getUserDiscountsFromFirestore(),
      ]);
      if (couponsRes.coupons && couponsRes.coupons.length > 0) {
        setCoupons(couponsRes.coupons);
      }
      if (discountsRes.discounts && discountsRes.discounts.length > 0) {
        setUserDiscounts(discountsRes.discounts);
      }
    } catch (err) {
      console.error('Failed to load coupons/discounts from Firestore:', err);
    }
  };

  const loadBlogsFromFirestore = async () => {
    try {
      const result = await getBlogsFromFirestore();
      if (result && result.length > 0) {
        setBlogs(result);
      }
    } catch (err) {
      console.error('Failed to load blogs from Firestore:', err);
    }
  };

  const loadLeadsFromFirestore = async () => {
    try {
      const result = await getCallbackLeadsFromFirestore();
      setLeads(result);
    } catch (err) {
      console.error('Failed to load callback leads from Firestore:', err);
    }
  };

  useEffect(() => {
    loadQuestionsFromFirestore();
    loadDiscountsAndCouponsFromFirestore();
    loadBlogsFromFirestore();
    loadLeadsFromFirestore();
  }, []);

  // Listen to OS device theme changes (via prefers-color-scheme) and sync dark mode class to HTML
  useEffect(() => {
    const applyTheme = () => {
      const activeDark = resolveIsDark(themePreference);
      setIsDark(activeDark);
      if (activeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemChange = () => {
      if (themePreference === 'system') {
        applyTheme();
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }
  }, [themePreference]);

  // Persist states
  useEffect(() => {
    localStorage.setItem('finnerd_user_state', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('finnerd_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('finnerd_pricing', JSON.stringify(pricingConfig));
  }, [pricingConfig]);

  useEffect(() => {
    localStorage.setItem('finnerd_user_discounts', JSON.stringify(userDiscounts));
  }, [userDiscounts]);

  useEffect(() => {
    localStorage.setItem('finnerd_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('finnerd_attempts', JSON.stringify(attempts));
  }, [attempts]);

  const handleThemePreferenceChange = (pref: ThemePreference) => {
    setThemePreference(pref);
    localStorage.setItem('finnerd_theme_preference', pref);
  };

  // Role Switcher handler: Strictly 'admin' or 'user'
  const handleRoleChange = (newRole: UserRole) => {
    setUser((prev) => ({
      ...prev,
      role: newRole,
      isPremium: newRole === 'admin' ? true : prev.isPremium,
    }));
    if (newRole === 'user') {
      setCurrentTab('dashboard');
      window.location.hash = '';
    } else {
      setAdminTab('questions');
      window.location.hash = '#admin';
    }
  };

  // Find personalized discount for active student
  const matchedUserDiscount = userDiscounts.find(
    (d) => d.email.toLowerCase() === user.email.trim().toLowerCase()
  );

  // Start new mock exam session
  const startExamSession = (
    part: CMAPart | 'both' = 'part1',
    mode: ExamMode = 'prometric-timed'
  ) => {
    if (!user.isPremium && user.freeQuestionsUsed >= user.maxFreeQuestions) {
      setIsUpgradeModalOpen(true);
      return;
    }

    let selectedQuestions: Question[] = [];
    if (!user.isPremium) {
      selectedQuestions = questions.slice(0, 5);
    } else {
      selectedQuestions = questions.filter((q) => q.part === part || part === 'both');
    }

    if (selectedQuestions.length === 0) {
      selectedQuestions = questions.slice(0, 5);
    }

    const questionIds = selectedQuestions.map((q) => q.id);
    const timeAllowed = selectedQuestions.length * 108; // 1.8 mins per question (Prometric standard)

    const newSession: ExamSession = {
      id: `session-${Date.now()}`,
      mode,
      part,
      title: 'FinHornet - US CMA Part 1 CBT Exam Simulation',
      timeAllowedSeconds: timeAllowed,
      timeRemainingSeconds: timeAllowed,
      questionIds,
      userAnswers: {},
      flaggedQuestionIds: [],
      strikethroughs: {},
      notes: {},
      submitted: false,
      startedAt: Date.now(),
    };

    setActiveSession(newSession);
    setReviewingAttempt(null);
    setCurrentTab('exam');
  };

  // Answering a question in CBT exam
  const handleAnswerQuestion = (questionId: string, optionId: 'A' | 'B' | 'C' | 'D') => {
    if (!activeSession) return;

    const hadAnswer = Boolean(activeSession.userAnswers[questionId]);

    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        userAnswers: {
          ...prev.userAnswers,
          [questionId]: optionId,
        },
      };
    });

    if (!hadAnswer && !user.isPremium) {
      const nextAnswered = answeredFreeIds.includes(questionId)
        ? answeredFreeIds
        : [...answeredFreeIds, questionId];
      setAnsweredFreeIds(nextAnswered);

      const nextCount = Math.min(5, nextAnswered.length);

      setUser((prev) => ({
        ...prev,
        freeQuestionsUsed: nextCount,
        totalXp: prev.totalXp + 25,
      }));

      if (nextCount === 5) {
        setIsOfferUnlockedModalOpen(true);
      }
    }
  };

  // Answering a question in Case Studies
  const handleCaseAnswerQuestion = (questionId: string, optionId: 'A' | 'B' | 'C' | 'D') => {
    setCaseAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));

    if (!user.isPremium && !answeredFreeIds.includes(questionId)) {
      const nextAnswered = [...answeredFreeIds, questionId];
      setAnsweredFreeIds(nextAnswered);
      const nextCount = Math.min(5, nextAnswered.length);

      setUser((prev) => ({
        ...prev,
        freeQuestionsUsed: nextCount,
        totalXp: prev.totalXp + 35,
      }));

      if (nextCount === 5) {
        setIsOfferUnlockedModalOpen(true);
      }
    }
  };

  const handleToggleFlag = (questionId: string) => {
    if (!activeSession) return;
    setActiveSession((prev) => {
      if (!prev) return null;
      const flagged = new Set(prev.flaggedQuestionIds);
      if (flagged.has(questionId)) {
        flagged.delete(questionId);
      } else {
        flagged.add(questionId);
      }
      return {
        ...prev,
        flaggedQuestionIds: Array.from(flagged),
      };
    });
  };

  const handleToggleStrikethrough = (questionId: string, optionId: string) => {
    if (!activeSession) return;
    setActiveSession((prev) => {
      if (!prev) return null;
      const currentList = prev.strikethroughs[questionId] || [];
      const updated = currentList.includes(optionId)
        ? currentList.filter((id) => id !== optionId)
        : [...currentList, optionId];
      return {
        ...prev,
        strikethroughs: {
          ...prev.strikethroughs,
          [questionId]: updated,
        },
      };
    });
  };

  const handleUpdateNotes = (questionId: string, note: string) => {
    if (!activeSession) return;
    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        notes: {
          ...prev.notes,
          [questionId]: note,
        },
      };
    });
  };

  const handleEndExam = React.useCallback(() => {
    if (!activeSession) return;

    const allQMap = new Map([...questions, ...CMA_CASE_QUESTIONS].map((q) => [q.id, q]));
    const sessionQuestions = activeSession.questionIds
      .map((id) => allQMap.get(id))
      .filter((q): q is Question => Boolean(q));

    const result = calculateCMAExamScore(activeSession.userAnswers, sessionQuestions);
    const timeSpent = Math.max(10, activeSession.timeAllowedSeconds - activeSession.timeRemainingSeconds);

    const summary: ExamAttemptSummary = {
      id: `att-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      title: activeSession.title,
      part: activeSession.part,
      mode: activeSession.mode,
      score: result.score,
      total: result.total,
      accuracy: result.accuracy,
      scaledScore: result.scaledScore,
      passed: result.passed,
      timeSpentSeconds: timeSpent,
      answers: activeSession.userAnswers,
      questionIds: activeSession.questionIds,
    };

    setAttempts((prev) => [summary, ...prev]);
    setActiveSession(null);
    setReviewingAttempt(summary);

    setUser((prev) => ({
      ...prev,
      totalXp: prev.totalXp + result.score * 50 + (result.passed ? 200 : 0),
    }));
  }, [activeSession, questions]);

  const handleClaimOffer = () => {
    setIsOfferUnlockedModalOpen(false);
    setActiveSession(null);
    setReviewingAttempt(null);
    setOfferClaimed(true);
    setCurrentTab('auth');
  };

  const handleLoginSuccess = (userData: {
    name: string;
    email: string;
    role?: UserRole;
    isPremium?: boolean;
  }) => {
    const isAdmin = isUserAdmin(userData.email);
    const assignedRole: UserRole = isAdmin ? 'admin' : (userData.role || 'user');

    setUser((prev) => ({
      ...prev,
      name: userData.name,
      email: userData.email,
      role: assignedRole,
      isAuthenticated: true,
      isGuest: false,
      isPremium: isAdmin || (userData.isPremium ?? prev.isPremium),
      claimedOffer: true,
    }));

    // Strict role-based routing upon login
    if (assignedRole === 'admin') {
      setAdminTab('questions');
      window.location.hash = '#admin';
    } else {
      setCurrentTab('dashboard');
      window.location.hash = '';
    }
  };

  const handleSignOut = async () => {
    try {
      await logOutFirebase();
    } catch (e) {
      // ignore
    }
    const guestUser: UserAccount = {
      role: 'user',
      name: 'Guest Candidate',
      candidateId: 'FN-GUEST',
      email: '',
      phone: '',
      location: '',
      targetExamWindow: 'Jan/Feb 2027 Testing Window',
      targetExamDate: 'Jan/Feb 2027',
      dailyGoalQuestions: 10,
      preparationTrack: 'US CMA Part 1',
      isPremium: false,
      freeQuestionsUsed: 0,
      maxFreeQuestions: 5,
      selectedPart: 'part1',
      streakDays: 0,
      totalXp: 0,
      isAuthenticated: false,
      isGuest: true,
      claimedOffer: false,
    };
    setUser(guestUser);
    setPublicTab('home');
    setCurrentTab('dashboard');
    localStorage.removeItem('finnerd_user_state');
    window.location.hash = '';
  };

  const handleSaveProfile = (updated: Partial<UserAccount>) => {
    if (updated.themePreference) {
      handleThemePreferenceChange(updated.themePreference);
    }
    setUser((prev) => {
      const next = {
        ...prev,
        ...updated,
      };
      try {
        localStorage.setItem('finnerd_user_state', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const refreshPassStatus = async (targetId?: string) => {
    const id = targetId || user.candidateId || user.email;
    if (id) {
      try {
        const userRef = doc(db, 'users', id);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.hasActivePass || data.isPremium) {
            setUser((prev) => {
              const updated: UserAccount = { ...prev, hasActivePass: true, isPremium: true };
              try {
                localStorage.setItem('finnerd_user_state', JSON.stringify(updated));
              } catch (e) {
                // ignore
              }
              return updated;
            });
            return;
          }
        }
      } catch (e) {
        console.warn('Could not fetch pass status from Firestore:', e);
      }
    }
    setUser((prev) => {
      const updated: UserAccount = { ...prev, hasActivePass: true, isPremium: true };
      try {
        localStorage.setItem('finnerd_user_state', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const handleUpgrade = (info?: { name: string; email: string }) => {
    const targetUserId = user.candidateId || info?.email || user.email;
    if (targetUserId && db) {
      try {
        const userRef = doc(db, 'users', targetUserId);
        setDoc(
          userRef,
          {
            hasActivePass: true,
            isPremium: true,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch((err) => {
          console.warn('Could not sync user pass to Firestore:', err);
        });
      } catch (err) {
        // ignore
      }
    }

    setUser((prev) => {
      const next: UserAccount = {
        ...prev,
        isPremium: true,
        hasActivePass: true,
        isAuthenticated: true,
        isGuest: false,
        name: info?.name || prev.name,
        email: info?.email || prev.email,
      };
      try {
        localStorage.setItem('finnerd_user_state', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
    setIsUpgradeModalOpen(false);
  };

  // Cloud Firestore Question Handlers
  const handleAddQuestion = async (newQuestion: Question) => {
    await addQuestionToFirestore(newQuestion);
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === newQuestion.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newQuestion;
        return next;
      }
      return [newQuestion, ...prev];
    });
  };

  const handleUpdateQuestion = async (updatedQuestion: Question) => {
    await updateQuestionInFirestore(updatedQuestion.id, updatedQuestion);
    setQuestions((prev) =>
      prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
  };

  const handleDeleteQuestion = async (questionId: string) => {
    await deleteQuestionFromFirestore(questionId);
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const handleBulkUploadQuestions = async (newQs: Question[]) => {
    await bulkUploadQuestionsToFirestore(newQs);
    await loadQuestionsFromFirestore();
  };

  const handleUpdatePricing = (newPricing: PricingConfig) => {
    setPricingConfig(newPricing);
  };

  // Coupons Handlers (Firestore persisted)
  const handleAddCoupon = async (coupon: CouponCode) => {
    await saveCouponToFirestore(coupon);
    setCoupons((prev) => [coupon, ...prev.filter((c) => c.id !== coupon.id)]);
  };

  const handleToggleCoupon = async (couponId: string, active: boolean) => {
    await toggleCouponStatusInFirestore(couponId, active);
    setCoupons((prev) => prev.map((c) => (c.id === couponId ? { ...c, isActive: active } : c)));
  };

  const handleDeleteCoupon = async (couponId: string) => {
    await deleteCouponFromFirestore(couponId);
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
  };

  // User Email Discount Handlers (Firestore persisted)
  const handleAddUserDiscount = async (discount: UserDiscount) => {
    await saveUserDiscountToFirestore(discount);
    setUserDiscounts((prev) => [
      discount,
      ...prev.filter((d) => d.email.toLowerCase() !== discount.email.toLowerCase()),
    ]);
  };

  const handleDeleteUserDiscount = async (discountId: string) => {
    await deleteUserDiscountFromFirestore(discountId);
    setUserDiscounts((prev) => prev.filter((d) => d.id !== discountId));
  };

  const domainStats = calculateDomainStats(questions, attempts);

  // =========================================================================
  // ACTIVE EXAM SESSION (PROMETRIC CBT SIMULATOR)
  // Accessible to both guest visitors (5 free sample questions) and candidates
  // =========================================================================
  if (activeSession) {
    return (
      <PrometricExamUI
        session={activeSession}
        questions={activeSession.questionIds
          .map((id) => [...questions, ...CMA_CASE_QUESTIONS].find((q) => q.id === id))
          .filter((q): q is Question => Boolean(q))}
        isDark={isDark}
        onToggleDark={() => handleThemePreferenceChange(isDark ? 'light' : 'dark')}
        candidateName={user.name}
        candidateId={user.candidateId}
        isPremium={user.isPremium}
        freeCount={user.freeQuestionsUsed}
        onAnswerQuestion={handleAnswerQuestion}
        onToggleFlag={handleToggleFlag}
        onToggleStrikethrough={handleToggleStrikethrough}
        onUpdateNotes={handleUpdateNotes}
        onEndExam={handleEndExam}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        onExitToDashboard={() => {
          setActiveSession(null);
          setActiveViewingQuestion({ question: null });
        }}
        onActiveQuestionChange={handleActiveQuestionChange}
      />
    );
  }

  // =========================================================================
  // ADMIN PORTAL VIEW (STRICTLY SEPARATED FOR VERIFIED ADMINS)
  // When user.role === 'admin' && user.isAuthenticated:
  // Render Admin layout exclusively.
  // DO NOT display mock tests, monthly passes, exam marks, results/analytics,
  // practice sessions, pricing checkout, or the AI tutor chat widget.
  // =========================================================================
  if (user.role === 'admin' && user.isAuthenticated) {
    return (
      <div
        className={`min-h-screen transition-colors overflow-x-hidden w-full max-w-full box-border ${
          isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}
      >
        <AdminHeaderNav
          activeAdminTab={adminTab}
          onSelectAdminTab={(tab) => setAdminTab(tab)}
          adminEmail={user.email || ADMIN_EMAIL}
          adminName={user.name || 'Admin'}
          avatarInitials={user.avatarInitials}
          pendingLeadsCount={leads.filter((l) => l.status === 'pending').length}
          isDark={isDark}
          onSignOut={handleSignOut}
          onSwitchToStudentView={() => handleRoleChange('user')}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full max-w-full box-border">
          <AdminPortal
            role="admin"
            activeTab={adminTab}
            onSelectTab={(tab) => setAdminTab(tab)}
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onBulkUploadQuestions={handleBulkUploadQuestions}
            onRefreshFirestore={loadQuestionsFromFirestore}
            pricingConfig={pricingConfig}
            onUpdatePricing={handleUpdatePricing}
            user={user}
            coupons={coupons}
            onAddCoupon={handleAddCoupon}
            onToggleCoupon={handleToggleCoupon}
            onDeleteCoupon={handleDeleteCoupon}
            userDiscounts={userDiscounts}
            onAddUserDiscount={handleAddUserDiscount}
            onDeleteUserDiscount={handleDeleteUserDiscount}
            onResetTrial={() => {
              setUser((prev) => ({ ...prev, freeQuestionsUsed: 0 }));
              setAnsweredFreeIds([]);
            }}
            onToggleUserPremium={() => setUser((prev) => ({ ...prev, isPremium: !prev.isPremium }))}
            onGoogleSignInSuccess={(email, name) => {
              const isAdmin = isUserAdmin(email);
              setUser((prev) => ({
                ...prev,
                email,
                name,
                role: isAdmin ? 'admin' : 'user',
                isPremium: isAdmin || prev.isPremium,
                isAuthenticated: true,
                isGuest: false,
              }));
              if (!isAdmin) {
                handleRoleChange('user');
              }
            }}
            onExitToDashboard={() => handleRoleChange('user')}
            isDark={isDark}
            blogs={blogs}
            onRefreshBlogs={loadBlogsFromFirestore}
            leads={leads}
            onRefreshLeads={loadLeadsFromFirestore}
          />
        </main>

        {/* Edit Profile Modal for Admin */}
        <EditProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
          onSave={handleSaveProfile}
          isDark={isDark}
          themePreference={themePreference}
          onThemePreferenceChange={handleThemePreferenceChange}
        />
      </div>
    );
  }

  // =========================================================================
  // PUBLIC VISITOR VIEW (STRICTLY PRE-LOGIN)
  // When visitor is not logged in:
  // Render clean PublicHeaderNav with NO avatar, NO badges, NO profile dropdown.
  // Nav links: Home, Blogs, About, Talk to Us, Dark/Light, and Sign In / Login button.
  // =========================================================================
  if (!user.isAuthenticated) {
    return (
      <div
        className={`min-h-screen transition-colors overflow-x-hidden w-full max-w-full box-border ${
          isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}
      >
        <PublicHeaderNav
          currentTab={publicTab}
          onSelectTab={(tab) => {
            setPublicTab(tab);
            setCurrentTab('dashboard');
          }}
          onOpenTalkToUs={() => setIsTalkToUsModalOpen(true)}
          onOpenAuth={() => setCurrentTab('auth')}
          isDark={isDark}
        />

        <main className="w-full max-w-full box-border">
          {currentTab === 'auth' ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full max-w-full box-border">
              <div className="mb-4">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="text-xs font-semibold text-slate-500 hover:text-amber-500 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  ← Return to Public Home
                </button>
              </div>
              <AuthPage
                isDark={isDark}
                offerClaimed={offerClaimed}
                pricingConfig={pricingConfig}
                customDiscount={matchedUserDiscount}
                onLoginSuccess={handleLoginSuccess}
                onContinueAsGuest={() => setCurrentTab('dashboard')}
              />
            </div>
          ) : publicTab === 'blogs' ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full max-w-full box-border">
              <BlogsView
                blogs={blogs}
                isDark={isDark}
                onOpenTalkToUs={() => setIsTalkToUsModalOpen(true)}
                onTryExam={() => startExamSession('part1', 'prometric-timed')}
              />
            </div>
          ) : publicTab === 'about' ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full max-w-full box-border">
              <AboutView
                isDark={isDark}
                onOpenTalkToUs={() => setIsTalkToUsModalOpen(true)}
                onTryExam={() => startExamSession('part1', 'prometric-timed')}
              />
            </div>
          ) : (
            <PublicLandingPage
              isDark={isDark}
              pricingConfig={pricingConfig}
              customDiscount={matchedUserDiscount}
              onTryFreeQuestions={() => startExamSession('part1', 'prometric-timed')}
              onEnrollNow={() => setCurrentTab('auth')}
              onGoToBlogs={() => setPublicTab('blogs')}
              onGoToAbout={() => setPublicTab('about')}
              onOpenTalkToUs={() => setIsTalkToUsModalOpen(true)}
            />
          )}
        </main>

        {/* Talk To Us Callback Request Modal */}
        <TalkToUsModal
          isOpen={isTalkToUsModalOpen}
          onClose={() => setIsTalkToUsModalOpen(false)}
          isDark={isDark}
        />

        {/* 50% Offer Unlocked Celebration Modal */}
        <OfferUnlockedModal
          isOpen={isOfferUnlockedModalOpen}
          onClose={() => setIsOfferUnlockedModalOpen(false)}
          onClaimOffer={handleClaimOffer}
          pricingConfig={pricingConfig}
          customDiscount={matchedUserDiscount}
          isDark={isDark}
        />

        {/* Premium Upgrade Modal */}
        <PremiumPaywallModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          onUpgrade={handleUpgrade}
          isDark={isDark}
          freeCount={user.freeQuestionsUsed}
          pricingConfig={pricingConfig}
          userDiscounts={userDiscounts}
          coupons={coupons}
          initialEmail={user.email}
        />
      </div>
    );
  }

  // =========================================================================
  // STUDENT PORTAL VIEW (STRICTLY FOR AUTHENTICATED CANDIDATES)
  // Display only student dashboard, mock tests, results, exam marks, monthly pass,
  // and AI tutor. Profile dropdown in upper right.
  // =========================================================================
  return (
    <div
      className={`min-h-screen transition-colors overflow-x-hidden w-full max-w-full box-border ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Access Denied Banner if non-admin attempted to visit /admin */}
      {accessDeniedMessage && (
        <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-md sticky top-0 z-50">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{accessDeniedMessage}</span>
          </div>
          <button
            onClick={() => setAccessDeniedMessage(null)}
            className="p-1 hover:bg-rose-700 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <HeaderNav
            currentTab={currentTab}
            onSelectTab={(tab) => {
              if (tab === 'formulas') {
                setIsFormulasModalOpen(true);
              } else if (tab === 'exam') {
                startExamSession('part1', 'prometric-timed');
              } else {
                setReviewingAttempt(null);
                setCurrentTab(tab);
                setActiveViewingQuestion({ question: null });
              }
            }}
            onStartPractice={() => {
              setReviewingAttempt(null);
              startExamSession('part1', 'practice-immediate');
            }}
            onStartMock={() => {
              setReviewingAttempt(null);
              startExamSession('part1', 'prometric-timed');
            }}
            onViewMarks={() => {
              setReviewingAttempt(null);
              setCurrentTab('dashboard');
              setTimeout(() => {
                document.getElementById('performance-history')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            onOpenFormulas={() => setIsFormulasModalOpen(true)}
            user={user}
            onRoleChange={handleRoleChange}
            isDark={isDark}
            onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            onSignOut={handleSignOut}
            pricingConfig={pricingConfig}
            isAdminPreview={isUserAdmin(user.email) || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()}
            onSwitchToAdmin={() => handleRoleChange('admin')}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full max-w-full box-border">
            {/* Dedicated Auth Page */}
            {currentTab === 'auth' ? (
              <AuthPage
                isDark={isDark}
                offerClaimed={offerClaimed}
                pricingConfig={pricingConfig}
                customDiscount={matchedUserDiscount}
                onLoginSuccess={handleLoginSuccess}
                onContinueAsGuest={() => setCurrentTab('dashboard')}
              />
            ) : reviewingAttempt ? (
              /* Reviewing an Exam Attempt */
              <ExamResultsView
                attempt={reviewingAttempt}
                questions={[...questions, ...CMA_CASE_QUESTIONS]}
                isDark={isDark}
                onRetake={() => startExamSession(reviewingAttempt.part, reviewingAttempt.mode)}
                onGoToDashboard={() => {
                  setReviewingAttempt(null);
                  setCurrentTab('dashboard');
                  setActiveViewingQuestion({ question: null });
                }}
                onActiveQuestionChange={handleActiveQuestionChange}
              />
            ) : currentTab === 'cases' ? (
              /* Case Study Viewer */
              <CaseStudyViewer
                cases={caseStudies}
                caseQuestions={CMA_CASE_QUESTIONS}
                isDark={isDark}
                onClose={() => {
                  setCurrentTab('dashboard');
                  setActiveViewingQuestion({ question: null });
                }}
                onAnswerQuestion={handleCaseAnswerQuestion}
                userAnswers={caseAnswers}
                onActiveQuestionChange={handleActiveQuestionChange}
              />
            ) : (
              /* Spacious, Non-Congested Performance Dashboard */
              <PerformanceDashboard
                user={user}
                attempts={attempts}
                domainStats={domainStats}
                isDark={isDark}
                onStartExam={startExamSession}
                onStartCaseStudy={() => setCurrentTab('cases')}
                onReviewAttempt={(att) => setReviewingAttempt(att)}
                onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
                onOpenProfileModal={() => setIsProfileModalOpen(true)}
                onOpenAuth={() => setCurrentTab('auth')}
                caseCount={caseStudies.length}
                questionCount={questions.length}
                firestoreSynced={firestoreSynced}
              />
            )}
          </main>

      {/* 50% Offer Unlocked Celebration Modal (Fires on 5th free question completed) */}
      <OfferUnlockedModal
        isOpen={isOfferUnlockedModalOpen}
        onClose={() => setIsOfferUnlockedModalOpen(false)}
        onClaimOffer={handleClaimOffer}
        pricingConfig={pricingConfig}
        customDiscount={matchedUserDiscount}
        isDark={isDark}
      />

      {/* Formulas & Exhibits Sheet */}
      <FormulaExhibitModal
        isOpen={isFormulasModalOpen}
        onClose={() => setIsFormulasModalOpen(false)}
        isDark={isDark}
      />

      {/* Premium Upgrade Modal with coupon & user discount lookup and Razorpay */}
      <PremiumPaywallModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={handleUpgrade}
        isDark={isDark}
        freeCount={user.freeQuestionsUsed}
        pricingConfig={pricingConfig}
        userDiscounts={userDiscounts}
        coupons={coupons}
        initialEmail={user.email}
        userId={user.candidateId || user.email}
        hasActivePass={Boolean(user.hasActivePass || user.isPremium)}
        onRefreshPassStatus={refreshPassStatus}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onSave={handleSaveProfile}
        isDark={isDark}
        themePreference={themePreference}
        onThemePreferenceChange={handleThemePreferenceChange}
      />

      {/* FinHornet Gemini AI Chatbot in Lower Right Corner (Strictly for Students) */}
      <FinHornetGeminiChatbot
        isDark={isDark}
        activeQuestionContext={activeQuestionContext}
      />
    </div>
  );
}
