import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart3,
  BookOpen,
  Moon,
  Sun,
  Play,
  LogOut,
  Tag,
  ShieldCheck,
  ChevronDown,
  Check,
  Award,
  Sparkles,
  Zap,
  CreditCard,
  UserCheck,
  LogIn,
  UserCog,
} from 'lucide-react';
import { UserAccount, UserRole, PricingConfig } from '../types';
import { FinHornetLogo } from './FinHornetLogo';

interface Props {
  currentTab: 'dashboard' | 'exam' | 'formulas' | 'cases' | 'auth';
  onSelectTab: (tab: 'dashboard' | 'exam' | 'formulas' | 'cases' | 'auth') => void;
  user: UserAccount;
  onRoleChange: (role: UserRole) => void;
  isDark: boolean;
  onToggleDark?: () => void;
  onOpenUpgradeModal: () => void;
  onOpenProfileModal: () => void;
  onSignOut?: () => void;
  pricingConfig?: PricingConfig;
  onStartPractice?: () => void;
  onStartMock?: () => void;
  onViewMarks?: () => void;
  onOpenFormulas?: () => void;
  isAdminPreview?: boolean;
  onSwitchToAdmin?: () => void;
  activeSection?: 'dashboard' | 'practice' | 'marks' | 'billing' | 'formulas';
}

export const HeaderNav: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  user,
  onRoleChange,
  isDark,
  onToggleDark,
  onOpenUpgradeModal,
  onOpenProfileModal,
  onSignOut,
  pricingConfig,
  onStartPractice,
  onStartMock,
  onViewMarks,
  onOpenFormulas,
  isAdminPreview,
  onSwitchToAdmin,
  activeSection = 'dashboard',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Compute initials for avatar (prioritize custom avatarInitials if set)
  const initials =
    user.avatarInitials?.trim() ||
    (user.name
      ? user.name
          .split(' ')
          .map((p) => p[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'U');

  const curr = pricingConfig?.currencySymbol || 'Rs.';
  const offerPrice = pricingConfig?.monthlyOfferPrice || 350;

  return (
    <nav
      className="border-b sticky top-0 z-40 backdrop-blur-md transition-colors shadow-xs w-full max-w-full box-border"
      style={{
        backgroundColor: isDark ? 'rgba(11, 17, 32, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 w-full max-w-full box-border">
        {/* Far Left: Clean FinHornet Logo (Yellow Hornet icon + clean text, NO CMA badge box, NO tagline) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div
            onClick={() => onSelectTab('dashboard')}
            className="cursor-pointer transition-opacity hover:opacity-90 shrink-0"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSelectTab('dashboard');
            }}
          >
            <FinHornetLogo size="md" showSubtitle={false} />
          </div>

          {/* Candidate Badge: hidden on narrow mobile screens (< 640px) to prevent header crowding */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 shrink-0">
            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Candidate</span>
          </div>
        </div>

        {/* Far Right: Interactive Profile Button ONLY */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Interactive Profile Button & Dropdown Menu */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
              className={`flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-2.5 pr-2.5 sm:pr-3 py-1.5 rounded-2xl border transition-all cursor-pointer ${
                isDropdownOpen
                  ? 'bg-blue-500/15 border-blue-500/40 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700'
              }`}
              title="Open User Profile & Navigation Menu"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0 ring-1 ring-blue-400/30">
                {initials}
              </div>

              <div className="text-left leading-tight hidden sm:block max-w-[120px] md:max-w-[150px]">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                  {user.email || user.candidateId || 'Candidate'}
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 shrink-0 ${
                  isDropdownOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl shadow-2xl border backdrop-blur-xl p-2 z-50 animate-in fade-in zoom-in-95"
                style={{
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                }}
              >
                {/* User Info Header with Active Pass Status */}
                <div className="p-3 mb-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate block">
                          {user.name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate block mb-1.5">
                        {user.email || user.candidateId || 'guest@candidate.edu'}
                      </span>

                      {/* Active Pass Status Badge */}
                      {user.hasActivePass || user.isPremium ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                          <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                          <span>Active CMA Pass</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Free Plan ({user.freeQuestionsUsed}/{user.maxFreeQuestions} Qs)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Profile Action Button right below header */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenProfileModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 mb-1 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-dashed border-slate-200 dark:border-slate-700"
                >
                  <UserCog className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="text-left flex-1">
                    <span className="block font-bold">Edit Profile</span>
                    <span className="text-[10px] text-slate-400 block">
                      Update display name, initials & study settings
                    </span>
                  </div>
                </button>

                {/* Primary Student Navigation Options with Active Highlighting */}
                <div className="space-y-1">
                  {/* Option 1: Dashboard / Mock Tests */}
                  <button
                    onClick={() => {
                      onSelectTab('dashboard');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentTab === 'dashboard'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BarChart3
                        className={`w-4 h-4 ${currentTab === 'dashboard' ? 'text-white' : 'text-blue-500'}`}
                      />
                      <div className="text-left">
                        <span className="block leading-tight font-bold">Dashboard / Mock Tests</span>
                        <span
                          className={`text-[10px] block ${
                            currentTab === 'dashboard' ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          CMA Part 1 Exam Simulation & Overview
                        </span>
                      </div>
                    </div>
                    {currentTab === 'dashboard' && <Check className="w-4 h-4 text-white" />}
                  </button>

                  {/* Option 2: Practice Sessions */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (onStartPractice) {
                        onStartPractice();
                      } else {
                        onSelectTab('exam');
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentTab === 'exam'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Play
                        className={`w-4 h-4 ${
                          currentTab === 'exam' ? 'text-white' : 'text-emerald-500'
                        }`}
                      />
                      <div className="text-left">
                        <span className="block leading-tight font-bold">Practice Sessions</span>
                        <span
                          className={`text-[10px] block ${
                            currentTab === 'exam' ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          Immediate feedback & step-by-step math
                        </span>
                      </div>
                    </div>
                    {currentTab === 'exam' && <Check className="w-4 h-4 text-white" />}
                  </button>

                  {/* Option 3: Exam Marks & Analytics */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (onViewMarks) {
                        onViewMarks();
                      } else {
                        onSelectTab('dashboard');
                      }
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      <div className="text-left">
                        <span className="block leading-tight font-bold">Exam Marks & Analytics</span>
                        <span className="text-[10px] text-slate-400 block">
                          Recent simulation scores & passing trends
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Option 4: Monthly Pass & Billing */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenUpgradeModal();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Tag className="w-4 h-4 text-orange-500" />
                      <div className="text-left">
                        <span className="block leading-tight font-bold">Monthly Pass & Billing</span>
                        <span className="text-[10px] text-slate-400 block">
                          Redeem coupons & email-specific discounts
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      50% OFF
                    </span>
                  </button>

                  {/* Bonus Option: Formulas & Exhibits */}
                  {onOpenFormulas && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenFormulas();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        <div className="text-left">
                          <span className="block leading-tight font-bold">Formulas & Exhibits</span>
                          <span className="text-[10px] text-slate-400 block">
                            CMA Part 1 variance & inventory formulas
                          </span>
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                {/* If Admin is Previewing Student View: Option to Switch Back to Admin Console */}
                {isAdminPreview && onSwitchToAdmin && (
                  <>
                    <div className="my-2 border-t border-slate-200 dark:border-slate-800" />
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSwitchToAdmin();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                      <div className="text-left">
                        <span className="block font-bold">Switch to Admin Console</span>
                        <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 block">
                          Return to Question Bank & Operations
                        </span>
                      </div>
                    </button>
                  </>
                )}

                {/* If Guest: Offer Sign In */}
                {user.isGuest && (
                  <>
                    <div className="my-2 border-t border-slate-200 dark:border-slate-800" />
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSelectTab('auth');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
                    >
                      <LogIn className="w-4 h-4 shrink-0" />
                      <span>Sign In with Google</span>
                    </button>
                  </>
                )}

                {/* Divider Line */}
                <div className="my-2 border-t border-slate-200 dark:border-slate-800" />

                {/* Sign Out / Logout (Styled in Red at bottom) */}
                {onSignOut && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>Sign Out / Logout</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
