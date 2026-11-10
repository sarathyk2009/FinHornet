import React, { useState } from 'react';
import { LogIn, Menu, X, PhoneCall, BookOpen, Info, Home } from 'lucide-react';
import { FinHornetLogo } from './FinHornetLogo';

export type PublicTab = 'home' | 'blogs' | 'about';

interface Props {
  currentTab: PublicTab;
  onSelectTab: (tab: PublicTab) => void;
  onOpenTalkToUs: () => void;
  onOpenAuth: () => void;
  isDark: boolean;
  onToggleDark?: () => void;
}

export const PublicHeaderNav: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  onOpenTalkToUs,
  onOpenAuth,
  isDark,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      className="border-b sticky top-0 z-40 backdrop-blur-md transition-colors shadow-xs w-full max-w-full box-border"
      style={{
        backgroundColor: isDark ? 'rgba(10, 15, 29, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 w-full max-w-full box-border">
        {/* Left: FinHornet Clean Logo (Icon + Text only) */}
        <div className="flex items-center gap-6 shrink-0">
          <div
            onClick={() => {
              onSelectTab('home');
              setMobileMenuOpen(false);
            }}
            className="cursor-pointer transition-opacity hover:opacity-90 shrink-0"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSelectTab('home');
            }}
            title="FinHornet Home"
          >
            <FinHornetLogo size="md" showSubtitle={false} />
          </div>

          {/* Center/Left Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('home')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'home'
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => onSelectTab('blogs')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'blogs'
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Blogs</span>
            </button>

            <button
              onClick={() => onSelectTab('about')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'about'
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </button>

            <button
              onClick={onOpenTalkToUs}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
              <span>Talk to Us</span>
            </button>
          </div>
        </div>

        {/* Right: Sign In / Login Button ONLY (Strictly NO Avatar / Profile Menu before login) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Sign In / Login Button */}
          <button
            onClick={onOpenAuth}
            className="px-3 sm:px-4 py-2 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
            title="Sign in with Google or account credentials"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Login</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-200"
          style={{
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
        >
          <button
            onClick={() => {
              onSelectTab('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              currentTab === 'home'
                ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('blogs');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              currentTab === 'blogs'
                ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Blogs & Study Guides</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('about');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              currentTab === 'about'
                ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About FinHornet</span>
          </button>

          <button
            onClick={() => {
              onOpenTalkToUs();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-amber-500" />
            <span>Talk to Us / Request Callback</span>
          </button>
        </div>
      )}
    </nav>
  );
};
