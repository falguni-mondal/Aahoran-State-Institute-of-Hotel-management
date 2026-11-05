import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  getPublicAlumniHub,
  getStoredAlumniUser,
  fetchCurrentAlumniSession,
  logoutAlumnusAccount,
} from '../api/alumniApi';

import AlumniSubNavbar, { ALUMNI_TABS } from '../components/alumni/AlumniSubNavbar';
import AlumniHero from '../components/alumni/AlumniHero';
import AlumniDistinguishedAndStories from '../components/alumni/AlumniDistinguishedAndStories';
import AlumniCareerNetwork from '../components/alumni/AlumniCareerNetwork';
import AlumniDirectory from '../components/alumni/AlumniDirectory';
import AlumniUpdatesAndReunions from '../components/alumni/AlumniUpdatesAndReunions';
import AlumniTestimonials from '../components/alumni/AlumniTestimonials';
import AlumniRegistrationPortal from '../components/alumni/AlumniRegistrationPortal';

gsap.registerPlugin(ScrollTrigger);

/* =========================================
   CURATED FALLBACK SEED DATA (When DB is empty)
========================================= */
const FALLBACK_DIRECTORY = [
  {
    _id: 'seed-alum-1',
    registrationId: 'SIHM-2019-BSC-AM84K1',
    fullName: 'Arindam Mukherjee',
    photograph: '/fo-management.webp',
    yearOfAdmission: 2016,
    yearOfPassing: 2019,
    batchLabel: '2016 - 2019',
    courseCompleted: 'B.Sc. in Hospitality & Hotel Administration (HHA)',
    industrySector: 'Hotel Operations',
    currentDesignation: 'Associate Director of Rooms',
    organisation: 'The Oberoi Grand, Kolkata',
    currentLocation: 'Kolkata, India',
    linkedInProfile: 'https://www.linkedin.com',
    achievements:
      'Led luxury guest experience transformation and received the Oberoi President’s Pillar Award for operational excellence.',
    isDistinguished: true,
    distinguishedCitation:
      'Recipient of the Luxury Hospitality Leadership Award; oversees 200+ rooms division staff at The Oberoi Grand.',
    isSuccessStory: true,
    successStoryTitle:
      'From Front Office Lab Training at SIHM Durgapur to Leading Luxury Rooms Division at The Oberoi',
    successStoryContent:
      'My three years at SIHM Durgapur instilled an uncompromising eye for detail. The practical simulations in the Front Office and Housekeeping labs prepared me to manage royal delegations and global dignitaries with poise.',
  },
  {
    _id: 'seed-alum-2',
    registrationId: 'SIHM-2020-BSC-SR92B4',
    fullName: 'Soumyadip Roy',
    photograph: '/fp-culinary-art.webp',
    yearOfAdmission: 2017,
    yearOfPassing: 2020,
    batchLabel: '2017 - 2020',
    courseCompleted: 'B.Sc. in Hospitality & Hotel Administration (HHA)',
    industrySector: 'International Hospitality Industry',
    currentDesignation: 'Sous Chef — Fine Dining',
    organisation: 'Atlantis The Royal, Dubai',
    currentLocation: 'Dubai, UAE',
    linkedInProfile: 'https://www.linkedin.com',
    achievements:
      'Part of the pre-opening culinary brigade at Atlantis The Royal, curating contemporary European-Asian tasting menus.',
    isDistinguished: true,
    distinguishedCitation:
      'Led the culinary brigade for Michelin-starred pop-ups in Dubai after graduating top of his culinary batch at SIHM Durgapur.',
    isSuccessStory: true,
    successStoryTitle:
      'Crafting Michelin-Standard Gastronomy in Dubai Built on SIHM Kitchen Foundations',
    successStoryContent:
      'Every knife skill, mother sauce, and kitchen brigade discipline I rely on in Dubai began in the Basic Training Kitchen of SIHM Durgapur under the guidance of our culinary mentors.',
  },
  {
    _id: 'seed-alum-3',
    registrationId: 'SIHM-2021-BSC-PD41E8',
    fullName: 'Priyanka Dasgupta',
    photograph: '/fb-mixology.webp',
    yearOfAdmission: 2018,
    yearOfPassing: 2021,
    batchLabel: '2018 - 2021',
    courseCompleted: 'B.Sc. in Hospitality & Hotel Administration (HHA)',
    industrySector: 'Food & Beverage Service',
    currentDesignation: 'Beverage & Restaurant Manager',
    organisation: 'JW Marriott Mumbai Sahar',
    currentLocation: 'Mumbai, India',
    linkedInProfile: 'https://www.linkedin.com',
    achievements:
      'Certified WSET Level 2 Sommelier managing three specialty restaurants and luxury banquet operations.',
    isDistinguished: true,
    distinguishedCitation:
      'Recognized among Top 30 Under 30 F&B Professionals in Western India.',
    isSuccessStory: false,
  },
  {
    _id: 'seed-alum-4',
    registrationId: 'SIHM-2021-BSC-NR19C7',
    fullName: 'Nikhil Raj',
    photograph: '/fo-service.webp',
    yearOfAdmission: 2018,
    yearOfPassing: 2021,
    batchLabel: '2018 - 2021',
    courseCompleted: 'B.Sc. in Hospitality & Hotel Administration (HHA)',
    industrySector: 'Food & Beverage Service',
    currentDesignation: 'Restaurant Manager (M.T)',
    organisation: 'Taj Bengal',
    currentLocation: 'Kolkata, India',
    linkedInProfile: 'https://www.linkedin.com',
    achievements:
      'Fast-tracked through the Management Trainee programme into full restaurant P&L leadership.',
    isDistinguished: false,
    isSuccessStory: false,
  },
  {
    _id: 'seed-alum-5',
    registrationId: 'SIHM-2022-BSC-SD63M2',
    fullName: 'Subhalaxmi Dal',
    photograph: '/fo-lobby.webp',
    yearOfAdmission: 2019,
    yearOfPassing: 2022,
    batchLabel: '2019 - 2022',
    courseCompleted: 'B.Sc. in Hospitality & Hotel Administration (HHA)',
    industrySector: 'Front Office Operations',
    currentDesignation: 'Duty Manager — Guest Relations',
    organisation: 'Courtyard by Marriott',
    currentLocation: 'Bengaluru, India',
    linkedInProfile: 'https://www.linkedin.com',
    achievements:
      'Awarded Leader of the Quarter for achieving 96% Marriott Bonvoy Elite guest satisfaction scores.',
    isDistinguished: false,
    isSuccessStory: false,
  },
  {
    _id: 'seed-alum-6',
    registrationId: 'SIHM-2022-CFP-AB77T9',
    fullName: 'Anirban Bhattacharya',
    photograph: '/fp-patisserie.webp',
    yearOfAdmission: 2020,
    yearOfPassing: 2022,
    batchLabel: '2020 - 2022',
    courseCompleted: 'Craftsmanship Course in Food Production & Patisserie',
    industrySector: 'Cruise Line Industry',
    currentDesignation: 'Chef de Partie — Pastry',
    organisation: 'Royal Caribbean International',
    currentLocation: 'Miami / International Fleet',
    linkedInProfile: 'https://www.linkedin.com',
    achievements:
      'Heads artisan bread and patisserie production onboard Icon-class luxury cruise liners.',
    isDistinguished: false,
    isSuccessStory: false,
  },
  {
    _id: 'seed-alum-7',
    registrationId: 'SIHM-2023-BSC-SG55L3',
    fullName: 'Saloni Guha',
    photograph: '/hk-suite.webp',
    yearOfAdmission: 2020,
    yearOfPassing: 2023,
    batchLabel: '2020 - 2023',
    courseCompleted: 'B.Sc. in Hospitality & Hotel Administration (HHA)',
    industrySector: 'Airline & Airport Hospitality',
    currentDesignation: 'International Cabin Crew & VIP Lounge Lead',
    organisation: 'Qatar Airways',
    currentLocation: 'Doha, Qatar',
    linkedInProfile: 'https://www.linkedin.com',
    achievements:
      'Transitioned from luxury hotel guest relations to First & Business Class cabin hospitality.',
    isDistinguished: false,
    isSuccessStory: false,
  },
  {
    _id: 'seed-alum-8',
    registrationId: 'SIHM-2023-BSC-DB38N5',
    fullName: 'Debjani Das',
    photograph: '/hk-aesthetics.webp',
    yearOfAdmission: 2020,
    yearOfPassing: 2023,
    batchLabel: '2020 - 2023',
    courseCompleted: 'B.Sc. in Hospitality & Hotel Administration (HHA)',
    industrySector: 'Housekeeping Operations',
    currentDesignation: 'Assistant Housekeeping Manager',
    organisation: 'Novotel Chennai',
    currentLocation: 'Chennai, India',
    linkedInProfile: 'https://www.linkedin.com',
    achievements:
      'Championed Accor Planet 21 sustainable housekeeping initiatives across 250+ luxury rooms.',
    isDistinguished: false,
    isSuccessStory: false,
  },
];

const FALLBACK_UPDATES = [
  {
    _id: 'seed-reunion-1',
    category: 'reunion',
    title: 'AAHORAN Grand Alumni Homecoming & Gala Dinner 2026',
    subtitle: 'All Batches Reunion • SIHM Durgapur Main Campus',
    description:
      'Reconnect with your batchmates, faculty mentors, and current hospitality scholars at our annual Grand Homecoming. Includes Culinary Showcase, Alumni Mentorship Roundtable, and Gala Cultural Night. Log in or enter your Alumni Registration ID to mark yourself as "Coming".',
    eventDate: '19 December 2026 • 4:00 PM Onwards',
    eventVenue: 'SIHM Durgapur Auditorium & Central Lawn, Fuljhore',
    isPinned: true,
    attendeeCount: 42,
    attendeesPreview: [
      { fullName: 'Arindam Mukherjee', batchYear: '2016-2019' },
      { fullName: 'Priyanka Dasgupta', batchYear: '2018-2021' },
      { fullName: 'Nikhil Raj', batchYear: '2018-2021' },
    ],
  },
  {
    _id: 'seed-reunion-2',
    category: 'reunion',
    title: 'Silver Service Chapter Meet — Kolkata & Eastern India Chapter',
    subtitle: 'Regional Networking Evening',
    description:
      'An evening of industry networking for SIHM Durgapur alumni working across Kolkata’s 5-star hotels, aviation, and culinary ventures.',
    eventDate: '14 February 2027 • 6:30 PM',
    eventVenue: 'Banquet Hall, Kolkata',
    isPinned: false,
    attendeeCount: 19,
    attendeesPreview: [
      { fullName: 'Subhalaxmi Dal', batchYear: '2019-2022' },
    ],
  },
  {
    _id: 'seed-career-1',
    category: 'career_opportunity',
    title: 'Management Trainee & Assistant Manager Referrals — Taj & IHCL Properties',
    subtitle: 'Alumni Referral Drive',
    description:
      'Senior SIHM alumni at IHCL are inviting applications from 2022–2025 graduates for Front Office, F&B Service, and Culinary positions across Mumbai, Goa, and Kolkata.',
    company: 'IHCL (Taj Hotels Palaces Resorts Safaris)',
    location: 'Mumbai / Kolkata / Goa',
    actionUrl: 'mailto:tpocell.sihmdgp@gmail.com',
    isPinned: true,
  },
  {
    _id: 'seed-achievement-1',
    category: 'achievement',
    title: 'SIHM Alumnus Soumyadip Roy Appointed Sous Chef at Atlantis The Royal, Dubai',
    subtitle: 'Global Culinary Milestone',
    description:
      'Congratulations to Batch 2017-2020 alumnus Soumyadip Roy for leading the fine-dining brigade at Dubai’s premier ultra-luxury resort.',
    isPinned: false,
  },
  {
    _id: 'seed-news-1',
    category: 'institute_news',
    title: 'Inauguration of Upgraded Advanced Mixology & Digital PMS Simulation Wing',
    subtitle: 'Campus Infrastructure Update',
    description:
      'SIHM Durgapur has expanded its training infrastructure with modern property management software terminals and beverage sensory labs.',
    isPinned: false,
  },
  {
    _id: 'seed-newsletter-1',
    category: 'newsletter',
    title: 'The Aahoran Chronicle — Annual Alumni Newsletter (Autumn-Winter Edition)',
    subtitle: 'Volume IV • Institutional Dispatch',
    description:
      'Featuring global placement spotlights, interviews with our founding batches, campus event highlights, and hospitality research notes.',
    actionUrl: '/notice-board',
    isPinned: false,
  },
  {
    _id: 'seed-announcement-1',
    category: 'announcement',
    title: 'Call for Alumni Guest Lectures & Industry Masterclasses (2026-27 Session)',
    subtitle: 'Alumni-Student Mentorship Initiative',
    description:
      'We invite experienced alumni to conduct hands-on workshops in Culinary Arts, Revenue Management, Mixology, and Cruise Line Recruitment for final-year B.Sc. HHA students.',
    actionUrl: 'mailto:sihmdurgapur@gmail.com',
    isPinned: false,
  },
];

const FALLBACK_TESTIMONIALS = [
  {
    _id: 'seed-test-1',
    authorName: 'Arindam Mukherjee',
    batchYear: '2016-2019',
    registrationId: 'SIHM-2019-BSC-AM84K1',
    designation: 'Associate Director of Rooms',
    organisation: 'The Oberoi Grand',
    heading: 'The Foundation of My Luxury Hospitality Career',
    content:
      'SIHM Durgapur provided me with the foundation, practical knowledge and professional confidence that helped me establish my career in the hospitality industry.',
    isApproved: true,
    createdAt: '2026-10-12T10:00:00.000Z',
    replies: [
      {
        _id: 'seed-reply-101',
        parentReplyId: null,
        authorName: 'Nikhil Raj',
        authorBatch: '2018-2021',
        registrationId: 'SIHM-2021-BSC-NR19C7',
        content:
          'Completely agree Dada! Your mentorship during our industrial training at Oberoi was unforgettable.',
        isApproved: true,
        createdAt: '2026-10-14T14:20:00.000Z',
      },
      {
        _id: 'seed-reply-102',
        parentReplyId: 'seed-reply-101',
        authorName: 'Arindam Mukherjee',
        authorBatch: '2016-2019',
        registrationId: 'SIHM-2019-BSC-AM84K1',
        content:
          'So proud of how your batch is excelling at Taj Bengal, Nikhil! See you at the December Homecoming reunion.',
        isApproved: true,
        createdAt: '2026-10-15T09:10:00.000Z',
      },
    ],
  },
  {
    _id: 'seed-test-2',
    authorName: 'Priyanka Dasgupta',
    batchYear: '2018-2021',
    registrationId: 'SIHM-2021-BSC-PD41E8',
    designation: 'Beverage & Restaurant Manager',
    organisation: 'JW Marriott Mumbai',
    heading: 'Discipline, Grace Under Pressure, and Lifelong Mentors',
    content:
      'From rigorous F&B service drills to organizing grand themed banquets on campus, SIHM Durgapur taught us how to turn every guest interaction into an art form.',
    isApproved: true,
    createdAt: '2026-10-18T11:30:00.000Z',
    replies: [
      {
        _id: 'seed-reply-201',
        parentReplyId: null,
        authorName: 'SIHM Alumni Cell',
        authorBatch: 'Official Desk',
        isOfficialAdmin: true,
        content:
          'Thank you Priyanka! We look forward to hosting your Beverage & Sommelier Masterclass for our current 3rd-year students next month.',
        isApproved: true,
        createdAt: '2026-10-19T10:00:00.000Z',
      },
    ],
  },
];

const VALID_TAB_IDS = ALUMNI_TABS.map((t) => t.id);

export default function Alumni() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hash } = useLocation();
  const lenis = useLenis();
  const heroSectionRef = useRef(null);

  // Read active tab and subtab from URL query params (?tab=...&subtab=...)
  const rawTab = searchParams.get('tab') || 'overview';
  const activeTab = VALID_TAB_IDS.includes(rawTab) ? rawTab : 'overview';
  const activeSubTab = searchParams.get('subtab') || '';

  const [config, setConfig] = useState(null);
  const [directory, setDirectory] = useState(FALLBACK_DIRECTORY);
  const [distinguishedAlumni, setDistinguishedAlumni] = useState(
    FALLBACK_DIRECTORY.filter((a) => a.isDistinguished)
  );
  const [successStories, setSuccessStories] = useState(
    FALLBACK_DIRECTORY.filter((a) => a.isSuccessStory)
  );
  const [updates, setUpdates] = useState(FALLBACK_UPDATES);
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS);
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [currentUser, setCurrentUser] = useState(() => getStoredAlumniUser());
  const [isHeroScrolledPast, setIsHeroScrolledPast] = useState(false);

  // Track whether the 2nd Navbar at the bottom of the Hero has reached the Main Navbar on scroll
  useEffect(() => {
    if (activeTab !== 'overview') {
      setIsHeroScrolledPast(true);
      return;
    }

    const handleScrollCheck = () => {
      if (!heroSectionRef.current) return;
      const headerEl = document.querySelector('header');
      const mainNavHeight = headerEl ? headerEl.offsetHeight : 82;
      const heroRect = heroSectionRef.current.getBoundingClientRect();
      // When the bottom of the Hero (minus the 50px sub-navbar height) touches the Main Navbar, dock it under Main Nav
      setIsHeroScrolledPast(heroRect.bottom - 50 <= mainNavHeight);
    };

    handleScrollCheck();
    window.addEventListener('scroll', handleScrollCheck, { passive: true });
    window.addEventListener('resize', handleScrollCheck);
    return () => {
      window.removeEventListener('scroll', handleScrollCheck);
      window.removeEventListener('resize', handleScrollCheck);
    };
  }, [activeTab]);

  // The 2nd Navbar sits at the bottom of the Hero on 1st sight (`overview` with no subtab & not scrolled past Hero),
  // and attaches under the Main Navbar as soon as the tab changes or the user scrolls past the Hero.
  const dockUnderMainNav =
    activeTab !== 'overview' || Boolean(activeSubTab) || isHeroScrolledPast;

  const scrollToElement = useCallback(
    (targetHash) => {
      setTimeout(() => {
        ScrollTrigger.refresh();
        if (!targetHash) {
          if (lenis) {
            lenis.scrollTo(0, { duration: 0.85 });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          return;
        }

        const el = document.querySelector(targetHash);
        if (!el) return;
        const headerEl = document.querySelector('header');
        const headerOffset = headerEl
          ? -(headerEl.getBoundingClientRect().height + 16)
          : -140;

        if (lenis) {
          lenis.scrollTo(el, { offset: headerOffset, duration: 1.05 });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
    },
    [lenis]
  );

  // Sync URL tab & subtab changes + optional scroll target
  const handleSelectTab = useCallback(
    (tabId, subTabId = '', hashTarget = null) => {
      const nextTab = VALID_TAB_IDS.includes(tabId) ? tabId : 'overview';
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('tab', nextTab);
      if (subTabId) {
        nextParams.set('subtab', subTabId);
      } else {
        nextParams.delete('subtab');
      }
      setSearchParams(nextParams, { replace: false });

      if (hashTarget) {
        scrollToElement(hashTarget);
      } else if (nextTab === 'overview' && subTabId === 'distinguished') {
        scrollToElement('#alumni-distinguished');
      } else if (nextTab === 'overview' && subTabId === 'stories') {
        scrollToElement('#alumni-stories');
      } else if (nextTab === 'overview' && subTabId === 'intro') {
        scrollToElement('#alumni-intro');
      } else {
        scrollToElement(null);
      }
    },
    [searchParams, setSearchParams, scrollToElement]
  );

  // Cross-tab navigation handler: allows any element in one tab to jump to another tab/subtab/hash
  const handleCrossTabNavigate = useCallback(
    (targetTabId, targetSubTabId = '', targetHash = null, extraOptions = {}) => {
      if (extraOptions.sector) {
        setSelectedSector(extraOptions.sector);
      }
      handleSelectTab(targetTabId, targetSubTabId, targetHash);
    },
    [handleSelectTab]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Refresh ScrollTrigger whenever activeTab or activeSubTab changes
  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 180);
    return () => clearTimeout(timer);
  }, [activeTab, activeSubTab]);

  // Load Alumni Hub data + verify active Alumni Session
  useEffect(() => {
    let isMounted = true;

    const loadHubAndSession = async () => {
      const [hubData, verifiedSessionUser] = await Promise.all([
        getPublicAlumniHub(),
        fetchCurrentAlumniSession(),
      ]);

      if (!isMounted) return;

      if (verifiedSessionUser) {
        setCurrentUser(verifiedSessionUser);
      } else if (hubData?.currentUser) {
        setCurrentUser(hubData.currentUser);
      }

      if (!hubData) return;

      if (hubData.config) {
        setConfig(hubData.config);
      }

      if (Array.isArray(hubData.directory) && hubData.directory.length > 0) {
        setDirectory(hubData.directory);
        setDistinguishedAlumni(
          hubData.distinguishedAlumni?.length > 0
            ? hubData.distinguishedAlumni
            : hubData.directory.filter((a) => a.isDistinguished)
        );
        setSuccessStories(
          hubData.successStories?.length > 0
            ? hubData.successStories
            : hubData.directory.filter((a) => a.isSuccessStory)
        );
      }

      if (Array.isArray(hubData.updates) && hubData.updates.length > 0) {
        setUpdates(hubData.updates);
      }

      if (
        Array.isArray(hubData.testimonials) &&
        hubData.testimonials.length > 0
      ) {
        setTestimonials(hubData.testimonials);
      }
    };

    loadHubAndSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Support deep links using #hash by mapping them to the right tab automatically
  useEffect(() => {
    if (!hash) return;
    const hashToTabMap = {
      '#alumni-intro': { tab: 'overview', subtab: 'intro' },
      '#alumni-distinguished': { tab: 'overview', subtab: 'distinguished' },
      '#alumni-stories': { tab: 'overview', subtab: 'stories' },
      '#alumni-directory': { tab: 'directory', subtab: 'all' },
      '#alumni-careers': { tab: 'careers', subtab: 'all' },
      '#alumni-updates': { tab: 'updates', subtab: 'all' },
      '#alumni-testimonials': { tab: 'testimonials', subtab: 'feed' },
      '#alumni-register': { tab: 'portal', subtab: 'register' },
    };

    const mapped = hashToTabMap[hash];
    if (mapped && mapped.tab !== activeTab) {
      handleSelectTab(mapped.tab, mapped.subtab, hash);
    } else {
      scrollToElement(hash);
    }
  }, [hash]);

  const handleSectorSelectFromCareers = (sectorName) => {
    setSelectedSector(sectorName);
    if (sectorName !== 'ALL') {
      handleSelectTab('directory', 'all', '#alumni-directory');
    }
  };

  const handleUpdateRsvpSuccess = (reunionId, rsvpData, newCount) => {
    setUpdates((prev) =>
      prev.map((item) => {
        if (item._id !== reunionId) return item;
        const previewList = Array.isArray(item.attendeesPreview)
          ? item.attendeesPreview
          : [];
        return {
          ...item,
          attendeeCount: newCount || (item.attendeeCount || 0) + 1,
          attendeesPreview: [
            {
              fullName: rsvpData.fullName,
              batchYear: rsvpData.batchYear,
              registrationId: rsvpData.registrationId,
            },
            ...previewList,
          ],
        };
      })
    );
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await logoutAlumnusAccount();
    setCurrentUser(null);
  };

  return (
    <main className="w-full min-h-screen bg-[var(--background)] text-[var(--text-main)] selection:bg-[var(--accent)] selection:text-white">
      {/* Dynamic Tab Viewport */}
      <div
        id="alumni-tab-viewport"
        className={
          activeTab === 'overview'
            ? 'w-full'
            : 'w-full pt-36 sm:pt-40 md:pt-44 lg:pt-48'
        }
      >
        {activeTab === 'overview' && (
          <>
            <AlumniHero
              config={config}
              showIntro={true}
              currentUser={currentUser}
              onCrossTabNavigate={handleCrossTabNavigate}
              heroSectionRef={heroSectionRef}
            />
            <AlumniDistinguishedAndStories
              distinguishedAlumni={distinguishedAlumni}
              successStories={successStories}
              onCrossTabNavigate={handleCrossTabNavigate}
            />
          </>
        )}

        {activeTab === 'directory' && (
          <AlumniDirectory
            directory={directory}
            selectedSector={selectedSector}
            onSelectSector={setSelectedSector}
            initialBatchFilter={activeSubTab || 'ALL'}
            privacyNotice={config?.privacyNotice}
            onCrossTabNavigate={handleCrossTabNavigate}
          />
        )}

        {activeTab === 'careers' && (
          <AlumniCareerNetwork
            careerSectors={config?.careerSectors}
            directory={directory}
            selectedSector={
              activeSubTab && activeSubTab !== 'all'
                ? activeSubTab
                : selectedSector
            }
            onSelectSector={handleSectorSelectFromCareers}
          />
        )}

        {activeTab === 'updates' && (
          <AlumniUpdatesAndReunions
            updates={updates}
            initialCategoryFilter={activeSubTab || 'all'}
            currentUser={currentUser}
            onUpdateRsvpSuccess={handleUpdateRsvpSuccess}
            onCrossTabNavigate={handleCrossTabNavigate}
          />
        )}

        {activeTab === 'testimonials' && (
          <AlumniTestimonials
            testimonials={testimonials}
            currentUser={currentUser}
            autoOpenShareModal={activeSubTab === 'share'}
            onCrossTabNavigate={handleCrossTabNavigate}
          />
        )}

        {activeTab === 'portal' && (
          <AlumniRegistrationPortal
            initialMode={activeSubTab === 'login' ? 'login' : 'register'}
            currentUser={currentUser}
            onAuthSuccess={handleAuthSuccess}
            onLogout={handleLogout}
            onCrossTabNavigate={handleCrossTabNavigate}
          />
        )}
      </div>

      {/* 2nd Sub-Navbar (Rendered after AlumniHero so #alumni-hero-bottom-nav-slot exists on mount;
          sits at the bottom of the Hero on 1st sight and attaches under Main Nav on tab change or scroll) */}
      <AlumniSubNavbar
        activeTab={activeTab}
        activeSubTab={activeSubTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        dockUnderMainNav={dockUnderMainNav}
      />
    </main>
  );
}