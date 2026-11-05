import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ALUMNI_SECTORS } from '../../utils/alumniValidation';

export const ALUMNI_TABS = [
  {
    id: 'overview',
    index: '01',
    label: 'Overview & Laureates',
    subTabs: [
      { id: 'intro', label: 'Alumni Introduction' },
      { id: 'distinguished', label: 'Distinguished Alumni' },
      { id: 'stories', label: 'Success Stories' },
    ],
  },
  {
    id: 'directory',
    index: '02',
    label: 'Batch Directory',
    subTabs: [
      { id: 'all', label: 'All Verified Batches' },
      { id: '2023', label: 'Batch of 2023' },
      { id: '2022', label: 'Batch of 2022' },
      { id: '2021', label: 'Batch of 2021' },
      { id: '2020', label: 'Batch of 2020' },
      { id: '2019', label: 'Batch of 2019' },
    ],
  },
  {
    id: 'careers',
    index: '03',
    label: 'Industry Network',
    subTabs: [
      { id: 'all', label: 'All 11 Hospitality Sectors' },
      ...ALUMNI_SECTORS.map((sec) => ({
        id: sec,
        label: sec,
      })),
    ],
  },
  {
    id: 'updates',
    index: '04',
    label: 'Reunions & Updates',
    subTabs: [
      { id: 'all', label: 'All Dispatches' },
      { id: 'reunion', label: 'Upcoming Reunions (RSVP)' },
      { id: 'announcement', label: 'Alumni Announcements' },
      { id: 'achievement', label: 'Professional Achievements' },
      { id: 'institute_news', label: 'Institute News' },
      { id: 'career_opportunity', label: 'Career Opportunities' },
      { id: 'newsletter', label: 'Alumni Newsletters' },
    ],
  },
  {
    id: 'testimonials',
    index: '05',
    label: 'Testimonials Wall',
    subTabs: [
      { id: 'feed', label: 'Reflections & Replies' },
      { id: 'share', label: 'Share Your Experience' },
    ],
  },
  {
    id: 'portal',
    index: '06',
    label: 'Account & Register',
    subTabs: [
      { id: 'register', label: 'Register as an Alumnus' },
      { id: 'login', label: 'Alumni Sign In' },
    ],
  },
];

export default function AlumniSubNavbar({
  activeTab = 'overview',
  activeSubTab = '',
  onSelectTab,
  currentUser = null,
  onLogout,
  dockUnderMainNav = false,
}) {
  const [mainNavPortalTarget, setMainNavPortalTarget] = useState(null);
  const [heroBottomPortalTarget, setHeroBottomPortalTarget] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState(activeTab);

  // Locate both portal slots (#alumni-subnav-portal-root under main Navbar & #alumni-hero-bottom-nav-slot at bottom of Hero)
  useEffect(() => {
    const mainTarget = document.getElementById('alumni-subnav-portal-root');
    const heroTarget = document.getElementById('alumni-hero-bottom-nav-slot');
    setMainNavPortalTarget(mainTarget || null);
    setHeroBottomPortalTarget(heroTarget || null);
  }, [activeTab, dockUnderMainNav]);

  useEffect(() => {
    setExpandedMobileSection(activeTab);
  }, [activeTab]);

  const currentTabObj =
    ALUMNI_TABS.find((t) => t.id === activeTab) || ALUMNI_TABS[0];
  const currentSubTabObj = currentTabObj.subTabs?.find(
    (s) => s.id === activeSubTab
  );

  // When seated at the bottom edge of the 100dvh Hero on 1st sight, open menus UPWARD so they never clip below the viewport fold.
  // When attached under the main Navbar (on tab change or after scrolling past Hero), open menus DOWNWARD.
  const openMenusUpward = !dockUnderMainNav && activeTab === 'overview';

  const handleDesktopSubTabClick = (tabId, subTabId) => {
    onSelectTab(tabId, subTabId);
  };

  const handleMobileSelect = (tabId, subTabId = '') => {
    onSelectTab(tabId, subTabId);
    setIsMobileMenuOpen(false);
  };

  const subNavbarContent = (
    <div className="w-full bg-[#EFECE6]/95 backdrop-blur-md border-t border-b border-[var(--text-main)]/12 shadow-[0_10px_30px_rgba(48,48,48,0.05)] text-[var(--text-main)] relative z-40">
      <div className="w-full max-w-[1920px] mx-auto px-5 md:px-8 lg:px-8 xl:px-10 2xl:px-16">
        {/* ==========================================
            1. DESKTOP ARCHITECTURAL SUB-NAVBAR (lg+)
        ========================================== */}
        <div className="hidden lg:flex items-center justify-between gap-6 min-h-[50px]">
          <div className="flex items-center gap-6 xl:gap-8">
            {/* Subtle Portal Badge */}
            <div className="flex items-center gap-2 pr-4 border-r border-[var(--text-main)]/15 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span className="font-mono text-[9px] xl:text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-main)]/55">
                Alumni Hub
              </span>
            </div>

            {/* 6 Desktop Tabs with Hover Subtabs */}
            <ul className="flex items-center gap-5 xl:gap-7 2xl:gap-9">
              {ALUMNI_TABS.map((tab) => {
                const isTabActive = activeTab === tab.id;
                return (
                  <li
                    key={tab.id}
                    className="relative group flex items-center py-3"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectTab(tab.id, '')}
                      className={`flex items-center gap-1.5 font-sans text-[10px] xl:text-[11px] uppercase tracking-[0.13em] font-semibold transition-colors duration-300 cursor-pointer outline-none ${
                        isTabActive
                          ? 'text-[var(--accent)]'
                          : 'text-[var(--text-main)]/75 group-hover:text-[var(--accent)]'
                      }`}
                    >
                      <span
                        className={`font-mono text-[9px] ${
                          isTabActive
                            ? 'text-[var(--accent)]'
                            : 'text-[var(--text-main)]/40 group-hover:text-[var(--accent)]'
                        }`}
                      >
                        {tab.index}
                      </span>
                      <span>{tab.label}</span>
                      {tab.subTabs?.length > 0 && (
                        <svg
                          className={`w-2.5 h-2.5 transition-transform duration-300 opacity-60 ${
                            openMenusUpward
                              ? 'rotate-180 group-hover:rotate-0'
                              : 'group-hover:rotate-180'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </button>

                    {/* Active Indicator Bar */}
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] bg-[var(--accent)] transition-[width] duration-300 ${
                        isTabActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />

                    {/* Hover Subtab Dropdown Menu (Opens UPWARD at bottom of Hero; DOWNWARD when attached under Main Nav) */}
                    {tab.subTabs?.length > 0 && (
                      <div
                        className={`absolute left-0 invisible opacity-0 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50 min-w-[245px] ${
                          openMenusUpward
                            ? 'bottom-full pb-1.5 -translate-y-2'
                            : 'top-full pt-1.5 translate-y-2'
                        }`}
                      >
                        <div className="bg-[var(--background)] border border-[#D5CEBF] shadow-2xl p-2 flex flex-col gap-0.5 max-h-[320px] overflow-y-auto">
                          <div className="px-3 py-1.5 border-b border-[#E6E2D8] mb-1 flex items-center justify-between">
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--text-main)]/45">
                              {tab.index} / {tab.label}
                            </span>
                          </div>
                          {tab.subTabs.map((sub) => {
                            const isSubActive =
                              isTabActive && activeSubTab === sub.id;
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() =>
                                  handleDesktopSubTabClick(tab.id, sub.id)
                                }
                                className={`w-full text-left px-3 py-2 text-xs font-sans transition-colors flex items-center justify-between cursor-pointer ${
                                  isSubActive
                                    ? 'bg-[#EFECE6] text-[var(--accent)] font-semibold'
                                    : 'text-[var(--text-main)]/80 hover:bg-[#EFECE6]/70 hover:text-[var(--accent)]'
                                }`}
                              >
                                <span className="truncate pr-2">
                                  {sub.label}
                                </span>
                                {isSubActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Persistent Logged-In Alumnus Identity Badge (No CTA when logged out) */}
          {currentUser && (
            <div className="shrink-0 flex items-center gap-2.5 bg-white border border-[#D5CEBF] px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              <div className="flex items-center gap-2 text-[10px] leading-tight">
                <span className="font-mono font-bold text-[var(--accent)] tracking-wider">
                  {currentUser.registrationId}
                </span>
                <span className="text-[var(--text-main)]/25">|</span>
                <span className="font-sans text-[var(--text-main)]/80 truncate max-w-[180px] xl:max-w-[220px]">
                  {currentUser.email}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="ml-1 pl-2 border-l border-[var(--text-main)]/15 text-[9px] font-sans font-bold uppercase tracking-wider text-[var(--text-main)]/60 hover:text-rose-700 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* ==========================================
            2. MOBILE & TABLET NAVIGATION BAR (<lg)
               (Recognizable Nav Icon + Section Switcher Drawer)
        ========================================== */}
        <div className="lg:hidden relative flex flex-col">
          <div className="flex items-center justify-between gap-2 py-2.5">
            {/* Left: Recognizable Navigation Icon + Active Tab & Subtab Indicator */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center gap-2.5 text-left group cursor-pointer outline-none min-w-0 flex-1"
              aria-expanded={isMobileMenuOpen}
            >
              {/* Recognizable 2x2 Grid Navigation Icon Box */}
              <div
                className={`w-8 h-8 flex items-center justify-center border transition-colors shrink-0 ${
                  isMobileMenuOpen
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                    : 'bg-white border-[#D5CEBF] text-[var(--text-main)]'
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                    Alumni Nav • {currentTabObj.index}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-main)] truncate">
                    {currentTabObj.label}
                  </span>
                  {currentSubTabObj && (
                    <span className="text-[10px] font-normal text-[var(--text-main)]/60 truncate">
                      / {currentSubTabObj.label}
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Right: Logged-in Credential Pill (if signed in) + Section Drawer Toggle Button */}
            <div className="flex items-center gap-2 shrink-0">
              {currentUser && (
                <div className="hidden sm:flex items-center gap-1.5 bg-white border border-[#D5CEBF] px-2.5 py-1 text-[9px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span className="font-mono font-bold text-[var(--accent)]">
                    {currentUser.registrationId}
                  </span>
                  <span className="text-[var(--text-main)]/30">|</span>
                  <span className="truncate max-w-[110px]">
                    {currentUser.email}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border text-[10px] font-sans font-bold uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                  isMobileMenuOpen
                    ? 'bg-[#303030] text-white border-[#303030]'
                    : 'bg-white text-[var(--text-main)] border-[#D5CEBF]'
                }`}
              >
                <span>{isMobileMenuOpen ? 'Close' : 'Sections'}</span>
                <svg
                  className={`w-3 h-3 transition-transform duration-300 ${
                    isMobileMenuOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Compact Logged-In Strip (<sm) */}
          {currentUser && (
            <div className="sm:hidden flex items-center justify-between gap-2 py-1.5 px-2.5 mb-2 bg-white border border-[#D5CEBF] text-[10px]">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                <span className="font-mono font-bold text-[var(--accent)]">
                  {currentUser.registrationId}
                </span>
                <span className="text-[var(--text-main)]/30">|</span>
                <span className="truncate text-[var(--text-main)]/80">
                  {currentUser.email}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="text-[9px] font-bold uppercase tracking-wider text-rose-700 shrink-0 pl-2 border-l border-[#E6E2D8]"
              >
                Sign Out
              </button>
            </div>
          )}

          {/* Mobile Expandable Accordion Navigation Panel (Opens UPWARD when at bottom of Hero; DOWNWARD when under Main Nav) */}
          {isMobileMenuOpen && (
            <div
              data-lenis-prevent="true"
              className={`left-0 right-0 border border-[#D5CEBF] bg-[var(--background)] p-3 max-h-[68dvh] overflow-y-auto space-y-1.5 shadow-2xl z-50 ${
                openMenusUpward
                  ? 'absolute bottom-full mb-1'
                  : 'border-t border-x-0 border-b-0'
              }`}
            >
              <div className="px-2 pb-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-main)]/45">
                <span>Select Alumni Section or Sub-Topic</span>
                <span>6 Modules</span>
              </div>

              {ALUMNI_TABS.map((tab) => {
                const isTabActive = activeTab === tab.id;
                const isExpanded = expandedMobileSection === tab.id;

                return (
                  <div
                    key={tab.id}
                    className={`border transition-colors ${
                      isTabActive
                        ? 'border-[var(--accent)] bg-white'
                        : 'border-[#E6E2D8] bg-white/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleMobileSelect(tab.id, '')}
                        className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 text-left cursor-pointer"
                      >
                        <span
                          className={`font-mono text-[10px] font-bold ${
                            isTabActive
                              ? 'text-[var(--accent)]'
                              : 'text-[var(--text-main)]/45'
                          }`}
                        >
                          {tab.index}
                        </span>
                        <span
                          className={`text-xs font-sans uppercase tracking-[0.12em] font-semibold ${
                            isTabActive
                              ? 'text-[var(--accent)]'
                              : 'text-[var(--text-main)]'
                          }`}
                        >
                          {tab.label}
                        </span>
                      </button>

                      {tab.subTabs?.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedMobileSection(
                              isExpanded ? null : tab.id
                            )
                          }
                          className="px-3.5 py-2.5 border-l border-[#E6E2D8] text-[10px] font-mono uppercase tracking-wider text-[var(--text-main)]/65 hover:text-[var(--accent)] flex items-center gap-1 cursor-pointer"
                        >
                          <span>Subtabs</span>
                          <svg
                            className={`w-3 h-3 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-[var(--accent)]' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {isExpanded && tab.subTabs?.length > 0 && (
                      <div className="border-t border-[#E6E2D8] bg-[#EFECE6]/60 px-3 py-2 flex flex-wrap gap-1.5">
                        {tab.subTabs.map((sub) => {
                          const isSubActive =
                            isTabActive && activeSubTab === sub.id;
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => handleMobileSelect(tab.id, sub.id)}
                              className={`px-2.5 py-1.5 text-[11px] font-sans transition-colors cursor-pointer ${
                                isSubActive
                                  ? 'bg-[var(--accent)] text-white font-semibold'
                                  : 'bg-white border border-[#D5CEBF] text-[var(--text-main)]/80 hover:border-[var(--accent)]'
                              }`}
                            >
                              {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 1. If tab changed or user scrolled past the Hero section, attach directly under the Main Navbar
  if (dockUnderMainNav && mainNavPortalTarget) {
    return createPortal(subNavbarContent, mainNavPortalTarget);
  }

  // 2. Otherwise (on 1st sight of the Overview Hero), mount inside the bottom edge of the Hero section
  if (!dockUnderMainNav && heroBottomPortalTarget) {
    return createPortal(subNavbarContent, heroBottomPortalTarget);
  }

  return subNavbarContent;
}