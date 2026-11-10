import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Hash,
  Calendar,
  MapPin,
  Target,
  Check,
  Phone,
  Sparkles,
  BookOpen,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { UserAccount, ThemePreference } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onSave: (updated: Partial<UserAccount>) => void;
  isDark?: boolean;
  themePreference?: ThemePreference;
  onThemePreferenceChange?: (pref: ThemePreference) => void;
}

export const EditProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  user,
  onSave,
  isDark,
  themePreference,
  onThemePreferenceChange,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemePreference>(
    themePreference ||
      user.themePreference ||
      ((localStorage.getItem('finnerd_theme_preference') as ThemePreference) || 'system')
  );
  const [name, setName] = useState(user.name);
  const [avatarInitials, setAvatarInitials] = useState(
    user.avatarInitials ||
      (user.name
        ? user.name
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : 'SK')
  );
  const [candidateId, setCandidateId] = useState(user.candidateId || 'FN-CMA-849204');
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '+91 98765 43210');
  const [location, setLocation] = useState(user.location || 'India 🇮🇳');
  const [targetExamWindow, setTargetExamWindow] = useState(
    user.targetExamWindow || 'Jan/Feb 2027 Testing Window'
  );
  const [preparationTrack, setPreparationTrack] = useState(
    user.preparationTrack || 'US CMA Part 1 - Financial Planning & Analytics'
  );
  const [dailyGoalQuestions, setDailyGoalQuestions] = useState(
    user.dailyGoalQuestions || 20
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInitials = avatarInitials.trim().slice(0, 3).toUpperCase() || 'SK';
    localStorage.setItem('finnerd_theme_preference', selectedTheme);
    onThemePreferenceChange?.(selectedTheme);
    onSave({
      name: name.trim(),
      avatarInitials: cleanInitials,
      candidateId: candidateId.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      targetExamWindow: targetExamWindow.trim(),
      targetExamDate: targetExamWindow.trim(),
      preparationTrack: preparationTrack.trim(),
      dailyGoalQuestions,
      themePreference: selectedTheme,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-label="Edit Profile & Study Settings"
    >
      <div
        className="w-full max-w-lg rounded-3xl shadow-2xl border flex flex-col overflow-hidden max-h-[92vh] box-border"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#cbd5e1',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b select-none shrink-0"
          style={{
            backgroundColor: isDark ? '#020617' : '#0f172a',
            color: '#ffffff',
            borderColor: isDark ? '#1e293b' : '#334155',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Edit Profile & Study Settings
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400">
                Update display name, avatar, exam window & focus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Profile Editor"
            className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {savedSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 flex items-center gap-2 font-bold animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Profile updated successfully! Dashboard synchronized.</span>
            </div>
          )}

          {/* Avatar Preview & Name Row */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-base flex items-center justify-center shadow-md ring-2 ring-amber-400/40 shrink-0">
              {avatarInitials.slice(0, 2).toUpperCase() || 'SK'}
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Avatar / Initials Badge
              </label>
              <input
                type="text"
                maxLength={3}
                value={avatarInitials}
                onChange={(e) => setAvatarInitials(e.target.value.toUpperCase())}
                placeholder="e.g. SK"
                className="w-24 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-xl border outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-center"
              />
              <span className="text-[10px] text-slate-400 ml-2">Appears in upper-right header</span>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>Display Full Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarathy K"
              className="w-full px-3.5 py-2 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Target Exam Window & Focus Area */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Target Testing Window</span>
              </label>
              <select
                value={targetExamWindow}
                onChange={(e) => setTargetExamWindow(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 cursor-pointer"
              >
                <option value="Jan/Feb 2027 Testing Window">Jan/Feb 2027 Testing Window (IMA)</option>
                <option value="May/June 2027 Testing Window">May/June 2027 Testing Window (IMA)</option>
                <option value="Sep/Oct 2027 Testing Window">Sep/Oct 2027 Testing Window (IMA)</option>
                <option value="January 2027 Sprint">January 2027 Sprint</option>
                <option value="Self-Paced Practice">Self-Paced Practice</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Preparation Focus Area</span>
              </label>
              <select
                value={preparationTrack}
                onChange={(e) => setPreparationTrack(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 cursor-pointer"
              >
                <option value="US CMA Part 1 - Financial Planning & Analytics">
                  US CMA Part 1 - Financial Planning & Analytics (Full Syllabus)
                </option>
                <option value="Cost Management & Variance Analysis">
                  Domain C: Cost Management & Variance Analysis
                </option>
                <option value="External Financial Reporting Decisions">
                  Domain A: External Financial Reporting Decisions
                </option>
                <option value="Planning, Budgeting & Forecasting">
                  Domain B: Planning, Budgeting & Forecasting
                </option>
                <option value="Internal Controls & Risk Management">
                  Domain E: Internal Controls & Risk Management
                </option>
              </select>
            </div>
          </div>

          {/* Candidate ID and Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-sky-500" />
                <span>Candidate / IMA ID</span>
              </label>
              <input
                type="text"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                placeholder="e.g. FN-CMA-849204"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. India 🇮🇳 or Mumbai, India"
                className="w-full px-3 py-2 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@example.com"
              className="w-full px-3.5 py-2 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Daily Goal Questions */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-purple-500" />
                <span>Daily Practice Goal</span>
              </span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {dailyGoalQuestions} Questions / Day
              </span>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={dailyGoalQuestions}
              onChange={(e) => setDailyGoalQuestions(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Theme Appearance (System Auto / Light / Dark) */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Theme Appearance</span>
              </label>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {selectedTheme === 'system'
                  ? 'Auto (follows device OS)'
                  : selectedTheme === 'dark'
                  ? 'Dark Mode'
                  : 'Light Mode'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedTheme('system');
                  onThemePreferenceChange?.('system');
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedTheme === 'system'
                    ? 'bg-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-500/50'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>System</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTheme('light');
                  onThemePreferenceChange?.('light');
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedTheme === 'light'
                    ? 'bg-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-500/50'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTheme('dark');
                  onThemePreferenceChange?.('dark');
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedTheme === 'dark'
                    ? 'bg-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-500/50'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
