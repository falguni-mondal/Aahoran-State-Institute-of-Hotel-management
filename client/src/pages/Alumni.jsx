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

const SECTION_HASH_MAP = {
  overview: '#alumni-intro',
  careers: '#alumni-careers',
  directory: '#alumni-directory',
  updates: '#alumni-updates',
  testimonials: '#alumni-testimonials',
};

export default function Alumni() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hash } = useLocation();
  const lenis = useLenis();
  const heroSectionRef = useRef(null);

  // Active section & sub-filter state for single-page navigation & ScrollSpy
  const [activeSection, setActiveSection] = useState('overview');
  const [activeSubFilter, setActiveSubFilter] = useState('');

  // Full-Page Login / Registration Popup State
  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState(false);
  const [authPopupMode, setAuthPopupMode] = useState('register');

  // Data & Filter State across all single-page sections
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
  const [batchFilter, setBatchFilter] = useState('ALL');
  const [updateCategoryFilter, setUpdateCategoryFilter] = useState('all');
  const [autoOpenShareTestimonial, setAutoOpenShareTestimonial] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => getStoredAlumniUser());
  const [isHeroScrolledPast, setIsHeroScrolledPast] = useState(false);

  // Smoothly scroll to any section on the single page
  const scrollToElement = useCallback(
    (targetHash) => {
      if (!targetHash) return;
      setTimeout(() => {
        const el = document.querySelector(targetHash);
        if (!el) return;
        const headerEl = document.querySelector('header');
        const headerOffset = headerEl
          ? -(headerEl.getBoundingClientRect().height + 16)
          : -135;

        if (lenis) {
          lenis.scrollTo(el, { offset: headerOffset, duration: 1.1 });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 80);
    },
    [lenis]
  );

  // Open the Full-Page Login / Registration Popup
  const handleOpenAuthPopup = useCallback(
    (mode = 'register') => {
      setAuthPopupMode(mode === 'login' ? 'login' : 'register');
      setIsAuthPopupOpen(true);
    },
    []
  );

  const handleCloseAuthPopup = useCallback(() => {
    setIsAuthPopupOpen(false);
    // Clean up ?tab=portal if present in URL
    if (searchParams.get('tab') === 'portal') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('tab');
      nextParams.delete('subtab');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Unified handler for 2nd Sub-Navbar & Hero / Cross-Section actions on the Single Page
  const handleSectionOrPopupNavigate = useCallback(
    (sectionId, subId = '', customHash = null, extraOptions = {}) => {
      // 1. If user clicked "Alumni Registration" / "Alumni Login" CTA in Hero or "Account & Register" in Sub-Navbar -> Open Full-Page Popup!
      if (sectionId === 'portal') {
        handleOpenAuthPopup(subId === 'login' ? 'login' : 'register');
        return;
      }

      setActiveSection(sectionId);
      setActiveSubFilter(subId || '');

      if (extraOptions.sector) {
        setSelectedSector(extraOptions.sector);
      }

      // 2. Apply section-specific filters & determine target scroll anchor on the single page
      if (sectionId === 'overview') {
        if (subId === 'distinguished') {
          scrollToElement('#alumni-distinguished');
        } else if (subId === 'stories') {
          scrollToElement('#alumni-stories');
        } else if (subId === 'intro') {
          scrollToElement('#alumni-intro');
        } else {
          scrollToElement(customHash || '#alumni-intro');
        }
        return;
      }

      if (sectionId === 'directory') {
        if (subId && subId !== 'all') {
          setBatchFilter(subId);
        } else {
          setBatchFilter('ALL');
        }
        scrollToElement(customHash || '#alumni-directory');
        return;
      }

      if (sectionId === 'careers') {
        if (subId && subId !== 'all') {
          setSelectedSector(subId);
        } else {
          setSelectedSector('ALL');
        }
        scrollToElement(customHash || '#alumni-careers');
        return;
      }

      if (sectionId === 'updates') {
        setUpdateCategoryFilter(subId || 'all');
        scrollToElement(customHash || '#alumni-updates');
        return;
      }

      if (sectionId === 'testimonials') {
        if (subId === 'share') {
          setAutoOpenShareTestimonial(true);
          setTimeout(() => setAutoOpenShareTestimonial(false), 600);
        }
        scrollToElement(customHash || '#alumni-testimonials');
        return;
      }

      const fallbackHash = customHash || SECTION_HASH_MAP[sectionId];
      if (fallbackHash) {
        scrollToElement(fallbackHash);
      }
    },
    [handleOpenAuthPopup, scrollToElement]
  );

  // Track scroll position to dock the 2nd Navbar under Main Navbar after scrolling past Hero + update active section ScrollSpy
  useEffect(() => {
    const handleScroll = () => {
      if (heroSectionRef.current) {
        const headerEl = document.querySelector('header');
        const mainNavHeight = headerEl ? headerEl.offsetHeight : 82;
        const heroRect = heroSectionRef.current.getBoundingClientRect();
        setIsHeroScrolledPast(heroRect.bottom - 50 <= mainNavHeight);
      }

      // ScrollSpy across the single page sections
      const spyOrder = [
        { id: 'testimonials', selector: '#alumni-testimonials' },
        { id: 'updates', selector: '#alumni-updates' },
        { id: 'directory', selector: '#alumni-directory' },
        { id: 'careers', selector: '#alumni-careers' },
        { id: 'overview', selector: '#alumni-intro' },
      ];

      const triggerLine = 220;
      for (const item of spyOrder) {
        const el = document.querySelector(item.selector);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerLine) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Support deep links (?tab=portal or #hash)
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    const urlSubTab = searchParams.get('subtab');
    if (urlTab === 'portal') {
      handleOpenAuthPopup(urlSubTab === 'login' ? 'login' : 'register');
    } else if (urlTab && ALUMNI_TABS.some((t) => t.id === urlTab)) {
      handleSectionOrPopupNavigate(urlTab, urlSubTab || '');
    }
  }, []);

  useEffect(() => {
    if (!hash) return;
    if (hash === '#alumni-register') {
      handleOpenAuthPopup('register');
    } else {
      scrollToElement(hash);
    }
  }, [hash, handleOpenAuthPopup, scrollToElement]);

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

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
    };

    loadHubAndSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Clicking a sector card in Industry Network filters the Directory and scrolls smoothly to #alumni-directory
  const handleSectorSelectFromCareers = (sectorName) => {
    setSelectedSector(sectorName);
    if (sectorName !== 'ALL') {
      scrollToElement('#alumni-directory');
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
      {/* 1. Hero Section & Institutional Legacy Introduction (Untouched Hero UI) */}
      <AlumniHero
        config={config}
        showIntro={true}
        currentUser={currentUser}
        onCrossTabNavigate={handleSectionOrPopupNavigate}
        heroSectionRef={heroSectionRef}
      />

      {/* 2 & 3. Distinguished Alumni Hall of Fame & Alumni Success Stories */}
      <AlumniDistinguishedAndStories
        distinguishedAlumni={distinguishedAlumni}
        successStories={successStories}
        onCrossTabNavigate={handleSectionOrPopupNavigate}
      />

      {/* 4. Alumni Career & Industry Network (11 Hospitality Sectors) */}
      <AlumniCareerNetwork
        careerSectors={config?.careerSectors}
        directory={directory}
        selectedSector={selectedSector}
        onSelectSector={handleSectorSelectFromCareers}
      />

      {/* 5. Batch-Wise Organised Alumni Directory */}
      <AlumniDirectory
        directory={directory}
        selectedSector={selectedSector}
        onSelectSector={setSelectedSector}
        initialBatchFilter={batchFilter}
        privacyNotice={config?.privacyNotice}
        onCrossTabNavigate={handleSectionOrPopupNavigate}
      />

      {/* 6. Alumni Newsletter, Upcoming Reunions (Mark as Coming), News & Career Opportunities */}
      <AlumniUpdatesAndReunions
        updates={updates}
        initialCategoryFilter={updateCategoryFilter}
        currentUser={currentUser}
        onUpdateRsvpSuccess={handleUpdateRsvpSuccess}
        onCrossTabNavigate={handleSectionOrPopupNavigate}
      />

      {/* 7. Alumni Testimonials & Infinite Nested Replies Wall */}
      <AlumniTestimonials
        testimonials={testimonials}
        currentUser={currentUser}
        autoOpenShareModal={autoOpenShareTestimonial}
        onCrossTabNavigate={handleSectionOrPopupNavigate}
      />

      {/* 2nd Sub-Navbar (Sits at bottom of Hero on 1st sight; docks under Main Nav on scroll; scrolls smoothly to any section) */}
      <AlumniSubNavbar
        activeTab={activeSection}
        activeSubTab={activeSubFilter}
        onSelectTab={handleSectionOrPopupNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
        dockUnderMainNav={isHeroScrolledPast}
      />

      {/* Full-Page Responsive Popup for Alumni Registration & Login (With Cross ✕ Close Icon) */}
      <AlumniRegistrationPortal
        isOpen={isAuthPopupOpen}
        onClose={handleCloseAuthPopup}
        initialMode={authPopupMode}
        currentUser={currentUser}
        onAuthSuccess={handleAuthSuccess}
        onLogout={handleLogout}
        onCrossTabNavigate={handleSectionOrPopupNavigate}
      />
    </main>
  );
}