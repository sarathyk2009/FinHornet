import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  BookOpen,
  UploadCloud,
  Tag,
  Database,
  Moon,
  Sun,
  LogOut,
  GraduationCap,
  ChevronDown,
  Check,
  UserCog,
  PhoneCall,
  FileText,
} from 'lucide-react';
import { FinHornetLogo } from './FinHornetLogo';

export type AdminTab = 'questions' | 'bulkupload' | 'discounts' | 'seeding' | 'blogs' | 'leads';

interface Props {
  activeAdminTab: AdminTab;
  onSelectAdminTab: (tab: AdminTab) => void;
  adminEmail: string;
  adminName: string;
  avatarInitials?: string;
  pendingLeadsCount?: number;
  isDark: boolean;
  onToggleDark?: () => void;
  onSignOut: () => void;
  onSwitchToStudentView: () => void;
  onOpenProfileModal: () => void;
}

export const AdminHeaderNav: React.FC<Props> = ({
  activeAdminTab,
  onSelectAdminTab,
  adminEmail,
  adminName,
  avatarInitials,
  pendingLeadsCount = 0,
  isDark,
  onToggleDark,
  onSignOut,
  onSwitchToStudentView,
  onOpenProfileModal,
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
    avatarInitials?.trim() ||
    (adminName
      ? adminName
          .split(' ')
          .map((p) => p[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'AD');

  return (
    <nav
      className="border-b sticky top-0 z-40 backdrop-blur-md transition-colors shadow-xs w-full max-w-full box-border"
      style={{
        backgroundColor: isDark ? 'rgba(10, 15, 29, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 w-full max-w-full box-border">
        {/* Far Left: Clean FinHornet Logo (Yellow Hornet icon + clean text) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <FinHornetLogo size="md" showSubtitle={false} />
          {/* Admin Console Badge: hidden on narrow mobile screens (< 640px) to prevent header crowding */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-black uppercase tracking-wider">Admin Console</span>
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
                  ? 'bg-amber-500/15 border-amber-500/40 ring-2 ring-amber-500/20 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700'
              }`}
              title="Open Admin Profile Menu"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-xs shrink-0 ring-1 ring-amber-400/30">
                {initials}
              </div>

              <div className="text-left leading-tight hidden sm:block max-w-[120px] md:max-w-[150px]">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block truncate">
                  {adminName || 'Admin'}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block truncate">
                  {adminEmail}
                </span>
              </div>

              {pendingLeadsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title={`${pendingLeadsCount} pending leads`} />
              )}

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 shrink-0 ${
                  isDropdownOpen ? 'rotate-180 text-amber-500' : ''
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
                {/* User Info Header */}
                <div className="p-3 mb-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-xs shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate block">
                          {adminName || 'Admin'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate block mb-1.5">
                        {adminEmail}
                      </span>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                        <span>Verified Admin</span>
                      </div>
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
                  <UserCog className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="text-left flex-1">
                    <span className="block font-bold">Edit Profile</span>
                    <span className="text-[10px] text-slate-400 block">
                      Update display name, initials & study settings
                    </span>
                  </div>
                </button>

                {/* Primary Admin Navigation Options with Active Highlighting */}
                <div className="space-y-1">
                  {/* Option 1: Question Bank */}
                  <button
                    onClick={() => {
                      onSelectAdminTab('questions');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeAdminTab === 'questions'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen
                        className={`w-4 h-4 ${
                          activeAdminTab === 'questions' ? 'text-slate-950' : 'text-amber-500'
                        }`}
                      />
                      <div className="text-left">
                        <span className="block leading-tight font-bold">Question Bank</span>
                        <span
                          className={`text-[10px] block ${
                            activeAdminTab === 'questions' ? 'text-slate-950/80' : 'text-slate-400'
                          }`}
                        >
                          Manage, Add, Edit, Delete questions
                        </span>
                      </div>
                    </div>
                    {activeAdminTab === 'questions' && <Check className="w-4 h-4 text-slate-950" />}
                  </button>

                  {/* Option 2: Bulk Upload */}
                  <button
                    onClick={() => {
                      onSelectAdminTab('bulkupload');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeAdminTab === 'bulkupload'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <UploadCloud
                        className={`w-4 h-4 ${
                          activeAdminTab === 'bulkupload' ? 'text-slate-950' : 'text-blue-500'
                        }`}
                      />
                      <div className="text-left">
                        <span className="block leading-tight font-bold">Bulk Upload</span>
                        <span
                          className={`text-[10px] block ${
                            activeAdminTab === 'bulkupload' ? 'text-slate-950/80' : 'text-slate-400'
                          }`}
                        >
                          CSV / JSON schema import
                        </span>
                      </div>
                    </div>
                    {activeAdminTab === 'bulkupload' && <Check className="w-4 h-4 text-slate-950" />}
                  </button>

                  {/* Option 3: Discounts & Coupons */}
                  <button
                    onClick={() => {
                      onSelectAdminTab('discounts');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeAdminTab === 'discounts'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Tag
                        className={`w-4 h-4 ${
                          activeAdminTab === 'discounts' ? 'text-slate-950' : 'text-emerald-500'
                        }`}
                      />
                      <div className="text-left">
                        <span className="block leading-tight font-bold">Discounts & Coupons</span>
                        <span
                          className={`text-[10px] block ${
                            activeAdminTab === 'discounts' ? 'text-slate-950/80' : 'text-slate-400'
                          }`}
                        >
                          Codes & email-assigned discounts
                        </span>
                      </div>
                    </div>
                    {activeAdminTab === 'discounts' && <Check className="w-4 h-4 text-slate-950" />}
                  </button>

                  {/* Option 4: Database & Seeding */}
                  <button
                    onClick={() => {
                      onSelectAdminTab('seeding');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeAdminTab === 'seeding'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Database
                        className={`w-4 h-4 ${
                          activeAdminTab === 'seeding' ? 'text-slate-950' : 'text-purple-500'
                        }`}
                      />
                      <div className="text-left">
                        <span className="block leading-tight font-bold">Database & Seeding</span>
                        <span
                          className={`text-[10px] block ${
                            activeAdminTab === 'seeding' ? 'text-slate-950/80' : 'text-slate-400'
                          }`}
                        >
                          Sync Firestore & reset seed data
                        </span>
                      </div>
                    </div>
                    {activeAdminTab === 'seeding' && <Check className="w-4 h-4 text-slate-950" />}
                  </button>

                  {/* Option 5: Manage Blogs */}
                  <button
                    onClick={() => {
                      onSelectAdminTab('blogs');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeAdminTab === 'blogs'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText
                        className={`w-4 h-4 ${
                          activeAdminTab === 'blogs' ? 'text-slate-950' : 'text-orange-500'
                        }`}
                      />
                      <div className="text-left">
                        <span className="block leading-tight font-bold">Manage Blogs</span>
                        <span
                          className={`text-[10px] block ${
                            activeAdminTab === 'blogs' ? 'text-slate-950/80' : 'text-slate-400'
                          }`}
                        >
                          Create, edit & publish articles
                        </span>
                      </div>
                    </div>
                    {activeAdminTab === 'blogs' && <Check className="w-4 h-4 text-slate-950" />}
                  </button>

                  {/* Option 6: Callback Requests (Leads) */}
                  <button
                    onClick={() => {
                      onSelectAdminTab('leads');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeAdminTab === 'leads'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <PhoneCall
                        className={`w-4 h-4 ${
                          activeAdminTab === 'leads' ? 'text-slate-950' : 'text-emerald-500'
                        }`}
                      />
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="leading-tight font-bold">Callback Requests</span>
                          {pendingLeadsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white">
                              {pendingLeadsCount}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] block ${
                            activeAdminTab === 'leads' ? 'text-slate-950/80' : 'text-slate-400'
                          }`}
                        >
                          Candidate inquiries & callback leads
                        </span>
                      </div>
                    </div>
                    {activeAdminTab === 'leads' && <Check className="w-4 h-4 text-slate-950" />}
                  </button>
                </div>

                {/* Divider Line */}
                <div className="my-2 border-t border-slate-200 dark:border-slate-800" />

                {/* Test Student View (Allows Admin to preview Student UI) */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onSwitchToStudentView();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="text-left">
                    <span className="block font-bold">Test Student View</span>
                    <span className="text-[10px] text-slate-400 block">
                      Preview candidate test environment
                    </span>
                  </div>
                </button>

                {/* Divider Line */}
                <div className="my-2 border-t border-slate-200 dark:border-slate-800" />

                {/* Sign Out / Logout (Styled in Red at bottom) */}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
