import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navmenu from './Navmenu';
import { getPublicNavBadges } from '../../api/alumniApi';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================
   BASE NAVIGATION DATA (Badges computed dynamically from DB)
========================================= */
const baseNavLinks = [
  { 
    name: 'About SIHM', 
    hasDropdown: true,
    subLinks: [
      { name: 'About Us', path: '/about' },
      { name: 'Rules & Regulations', path: '/about/rules' },
      { name: 'NCHMCT', path: 'https://nchm.gov.in/', isExternal: true },
      { name: 'JNU', path: 'https://www.jnu.ac.in/', isExternal: true },
    ]
  },
  { 
    name: 'Department', 
    hasDropdown: true,
    subLinks: [
      { name: 'Food Production', path: '/food-production' },
      { name: 'Food and Beverage', path: '/food-and-beverage' },
      { name: 'Front Office', path: '/front-office' },
      { name: 'House Keeping', path: '/house-keeping' },
    ]
  },
  { 
    name: 'Academic', 
    hasDropdown: true,
    subLinks: [
      { name: 'Short Term Courses', path: '/short-term-courses' },
      { name: 'Under Graduate Program', path: '/ug-program' },
      { name: 'Hunar Se Rozgar Tak', path: '/hunar-se-rozgar' },
      { name: 'Syllabus', path: '/syllabus', badgeKey: 'syllabus' },
      { 
        name: 'Study Material', 
        path: '/study-material',
        badgeKey: 'studyMaterial',
      },
    ]
  },
  { 
    name: 'Students', 
    hasDropdown: true,
    subLinks: [
      { name: 'Campus facilities', path: '/campus-facilities' },
      { name: 'Placement', path: '/placement' },
      { name: 'Alumni Network', path: '/alumni', badgeKey: 'alumni' },
      { name: 'Anti Ragging', path: '/anti-ragging' },
      { 
        name: 'Scholarship', 
        path: '#', 
        hasDropdown: true,
        subLinks: [
          { name: 'SWAMI VIVEKANANDA', path: 'https://svmcm.wb.gov.in/', isExternal: true },
          { name: 'NSP', path: 'https://scholarships.gov.in/', isExternal: true },
          { name: 'OASIS', path: 'https://oasis.wb.gov.in/', isExternal: true },
          { name: 'AIKYASHREE', path: 'https://wbmdfcscholarship.in/', isExternal: true },
          { name: 'WBSCC', path: 'https://wbscc.wb.gov.in/', isExternal: true },
          { name: 'MNSSBY', path: 'https://www.7nishchay-yuvaupmission.bihar.gov.in/', isExternal: true },
        ]
      },
    ]
  },
  { name: 'Alumni', hasDropdown: false, path: '/alumni', badgeKey: 'alumni' },
  { name: 'Notice Board', hasDropdown: false, path: '/notice-board', badgeKey: 'noticeBoard' },
  { name: 'Results', hasDropdown: false, path: '/results', badgeKey: 'results' },
  { 
    name: 'Gallery', 
    hasDropdown: true,
    subLinks: [
      { name: 'Our Campus', path: '/our-campus' },
      { name: 'Inaugural Programme', path: '/inaugural-programme' },
      { name: "Nabayon (Fresher's Welcome)", path: '/freshers-welcome' },
      { name: "Anujñā (Farewell)", path: '/farewell' },
      { name: "Krīḍā (Annual Sports)", path: '/krida' },
      { name: "STCP & Skill Development", path: '/stcp' },
      { name: 'Programme and Events', path: '/programme-and-events' },
    ]
  },
  { name: 'Contact', hasDropdown: false, path: '/contact' },
];

export default function Navbar() {
  const navContainerRef = useRef(null);
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navBadges, setNavBadges] = useState({
    syllabus: false,
    studyMaterial: false,
    noticeBoard: false,
    results: false,
    alumni: false,
  });

  // Dynamic Theme Logic: includes '/alumni' since AlumniHero is light-themed
  const lightHeroRoutes = [
    '/about/rules',
    '/short-term-courses',
    '/ug-program',
    '/hunar-se-rozgar',
    '/syllabus',
    '/study-material',
    '/anti-ragging',
    '/placement',
    '/alumni',
    '/contact',
    '',
  ];
  const isLightHero = lightHeroRoutes.includes(location.pathname);

  const useDarkText = isScrolled || isMobileMenuOpen || isLightHero;

  // Fetch dynamic NEW badge flags from backend DB
  useEffect(() => {
    let isMounted = true;
    getPublicNavBadges().then((badges) => {
      if (isMounted && badges) {
        setNavBadges(badges);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  // Attach "NEW" badge only when live DB records exist for that page
  const navLinks = useMemo(() => {
    return baseNavLinks.map((item) => {
      const topBadge = item.badgeKey && navBadges[item.badgeKey] ? 'NEW' : null;
      const subLinks = item.subLinks
        ? item.subLinks.map((sub) => ({
            ...sub,
            badge: sub.badgeKey && navBadges[sub.badgeKey] ? 'NEW' : null,
          }))
        : undefined;
      return {
        ...item,
        badge: topBadge,
        subLinks,
      };
    });
  }, [navBadges]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      tl.fromTo(
        '.nav-logo',
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5 }
      ).fromTo(
        '.nav-link-item',
        { y: -15, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.05 },
        "<0.2" 
      );
    });

    return () => mm.revert();
  }, { scope: navContainerRef });

  return (
    <div className="w-full relative z-50 border-b border-[var(--text-main)]/10">
      
      {/* =========================================
          DARK VIGNETTE OVERLAY
      ========================================= */}
      <div 
        className={`absolute top-0 left-0 w-full h-[250px] pointer-events-none -z-20 bg-gradient-to-b from-black/70 via-black/20 to-transparent transition-opacity duration-500 ${
          useDarkText ? 'opacity-0' : 'opacity-100'
        }`}
      ></div>

      <nav
        ref={navContainerRef}
        className={`relative w-full max-w-[1920px] mx-auto px-5 md:px-8 lg:px-8 xl:px-10 2xl:px-16 flex items-center justify-between transition-[padding] duration-500 ${
          isScrolled || isMobileMenuOpen ? 'py-3' : 'py-4 md:py-5 lg:py-6 xl:py-7 2xl:py-8'
        }`}
      >
        <div 
          className={`absolute inset-0 -z-10 transition-colors duration-500 ${
            isScrolled || location.pathname === '/alumni'
              ? 'bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--text-main)]/8 shadow-lg shadow-[#111111]/5' 
              : 'bg-transparent border-transparent'
          }`}
        ></div>

        {/* 1. Logo */}
        <div className="nav-logo flex flex-col cursor-pointer group shrink-0 relative z-50 mr-4 lg:mr-6 xl:mr-8">
          <Link to="/">
            <img 
              className="w-[90px] md:w-[100px] lg:w-[105px] xl:w-[115px] 2xl:w-[130px] transition-[width] duration-500" 
              src={useDarkText ? "/logo.svg" : "/logo_white.svg"}
              alt="SIHM Logo" 
            />
          </Link>
        </div>

        {/* 2. Desktop Navigation */}
        <div className="hidden lg:flex items-center h-full flex-grow justify-end space-x-4 lg:space-x-5 xl:space-x-6 2xl:space-x-8">
          <ul className="flex items-center space-x-4 lg:space-x-5 xl:space-x-6 2xl:space-x-8 h-full shrink-0" id='main-nav'>
            {navLinks.map((link, index) => (
              <li key={index} className="nav-link-item relative group cursor-pointer flex items-center h-full py-2 shrink-0">
                
                {/* Main Link Trigger */}
                {(() => {
                  const TriggerContent = (
                    <>
                      <span className={`whitespace-nowrap font-sans text-[9px] xl:text-[10px] 2xl:text-[11px] uppercase tracking-[0.1em] font-semibold transition-colors duration-300 ${
                        useDarkText 
                          ? 'text-[var(--primary-base)]/80 group-hover:text-[var(--accent)]' 
                          : 'text-[var(--text-light)]/80 group-hover:text-[var(--accent)]'
                      }`}>
                        {link.name}
                      </span>
                      
                      {link.hasDropdown && (
                        <svg 
                          className={`w-2.5 h-2.5 xl:w-3 xl:h-3 ml-1.5 transition-transform duration-300 group-hover:rotate-180 ${
                            useDarkText
                              ? 'text-[var(--primary-base)]/50 group-hover:text-[var(--accent)]/90'
                              : 'text-[var(--text-light)]/50 group-hover:text-[var(--accent)]/90'
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}

                      {link.badge && (
                        <span className="absolute -top-1.5 xl:-top-2 -right-4 xl:-right-5 bg-[var(--accent)] text-[var(--text-light)] text-[7px] xl:text-[8px] font-bold px-1 xl:px-1.5 py-0.5 rounded-sm">
                          {link.badge}
                        </span>
                      )}

                      <span className={`absolute -bottom-0 left-0 w-0 h-[1px] transition-[width] duration-300 group-hover:w-full ${
                        useDarkText ? 'bg-[var(--accent)]' : 'bg-[var(--accent)]'
                      }`}></span>
                    </>
                  );

                  return link.hasDropdown ? (
                    <div className="flex items-center">{TriggerContent}</div>
                  ) : (
                    <Link to={link.path || '#'} className="flex items-center">{TriggerContent}</Link>
                  );
                })()}

                {/* Dropdowns */}
                {link.hasDropdown && (
                  <div className="absolute top-[100%] left-0 pt-6 invisible opacity-0 translate-y-4 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-50 w-max hidden lg:block">
                    <div className="bg-[var(--background)]/95 backdrop-blur-md border border-[var(--primary-base)]/10 shadow-2xl rounded-sm p-3 xl:p-4 flex flex-col gap-1.5 min-w-[220px]">
                      {link.subLinks.map((sub, subIdx) => {
                        
                        const SubLinkContent = () => (
                          <div className="overflow-hidden w-full">
                            <div 
                              className="flex items-center justify-between w-full translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                              style={{ transitionDelay: `${subIdx * 40}ms` }}
                            >
                              <span className="font-sans text-[12px] xl:text-[13px] font-medium text-[var(--primary-base)]/80 group-hover/nested:text-[var(--accent)] transition-colors duration-300">
                                {sub.name}
                              </span>
                              <div className="flex items-center">
                                {sub.badge && (
                                  <span className="ml-3 bg-[var(--accent)] text-[var(--text-light)] text-[8px] font-bold uppercase tracking-wider px-1.5 py-[1px] rounded-sm">
                                    {sub.badge}
                                  </span>
                                )}
                                {sub.hasDropdown && (
                                  <svg className="w-3 h-3 ml-3 text-[var(--primary-base)]/30 group-hover/nested:text-[var(--accent)] transition-all duration-300 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        );

                        return (
                          <div key={subIdx} className="group/nested relative">
                            
                            {sub.isExternal ? (
                              <a href={sub.path || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full cursor-pointer px-3 py-2 rounded-sm hover:bg-[var(--primary-base)]/5 transition-colors duration-300">
                                <SubLinkContent />
                              </a>
                            ) : (
                              <Link to={sub.path || '#'} className="flex items-center justify-between w-full cursor-pointer px-3 py-2 rounded-sm hover:bg-[var(--primary-base)]/5 transition-colors duration-300">
                                <SubLinkContent />
                              </Link>
                            )}

                            {sub.hasDropdown && sub.subLinks && (
                              <div className="absolute top-0 left-[100%] pl-2 invisible opacity-0 [clip-path:inset(0_100%_0_0)] pointer-events-none group-hover/nested:visible group-hover/nested:opacity-100 group-hover/nested:[clip-path:inset(0_0_0_0)] group-hover/nested:pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-50 w-max">
                                <div className="bg-[var(--background)]/95 backdrop-blur-md border border-[var(--primary-base)]/10 shadow-2xl rounded-sm p-3 xl:p-4 flex flex-col gap-1.5 min-w-[180px]">
                                  {sub.subLinks.map((nestedSub, nestedIdx) => (
                                    nestedSub.isExternal ? (
                                      <a key={nestedIdx} href={nestedSub.path || '#'} target="_blank" rel="noopener noreferrer" className="group/deep flex items-center justify-between w-full cursor-pointer px-3 py-2 rounded-sm hover:bg-[var(--primary-base)]/5 transition-colors duration-300">
                                        <div className="overflow-hidden w-full">
                                          <div 
                                            className="flex items-center justify-between w-full translate-y-[120%] group-hover/nested:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                            style={{ transitionDelay: `${nestedIdx * 40}ms` }}
                                          >
                                            <span className="font-sans text-[12px] xl:text-[13px] font-medium text-[var(--primary-base)]/80 group-hover/deep:text-[var(--accent)] transition-colors duration-300">
                                              {nestedSub.name}
                                            </span>
                                          </div>
                                        </div>
                                      </a>
                                    ) : (
                                      <Link key={nestedIdx} to={nestedSub.path || '#'} className="group/deep flex items-center justify-between w-full cursor-pointer px-3 py-2 rounded-sm hover:bg-[var(--primary-base)]/5 transition-colors duration-300">
                                        <div className="overflow-hidden w-full">
                                          <div 
                                            className="flex items-center justify-between w-full translate-y-[120%] group-hover/nested:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                            style={{ transitionDelay: `${nestedIdx * 40}ms` }}
                                          >
                                            <span className="font-sans text-[12px] xl:text-[13px] font-medium text-[var(--primary-base)]/80 group-hover/deep:text-[var(--accent)] transition-colors duration-300">
                                              {nestedSub.name}
                                            </span>
                                          </div>
                                        </div>
                                      </Link>
                                    )
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className={`nav-link-item w-[1px] h-4 xl:h-5 shrink-0 transition-colors duration-300 ${
            useDarkText ? 'bg-[var(--primary-base)]/30' : 'bg-[var(--text-light)]/20'
          }`}></div>

          <button className={`nav-link-item shrink-0 group relative overflow-hidden flex items-center gap-2 border px-4 xl:px-5 2xl:px-6 py-2 xl:py-2.5 cursor-pointer outline-none transition-colors duration-500 ${
            useDarkText 
              ? 'border-[var(--text-main)]/40 hover:border-[var(--text-light)]' 
              : 'border-[var(--text-light)]/40 hover:border-[var(--text-light)]/40'
          }`}>
            <div className={`absolute inset-0 w-full h-full translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              useDarkText ? 'bg-[var(--accent)]' : 'bg-[var(--accent)]'
            }`}></div>
            <span className={`whitespace-nowrap relative z-10 font-sans text-[9px] xl:text-[10px] 2xl:text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-500 ${
              useDarkText 
                ? 'text-[var(--text-main)] group-hover:text-[var(--text-light)]' 
                : 'text-[var(--text-light)] group-hover:text-[var(--text-light)]'
            }`}>
              Pay Fee
            </span>
            <svg className={`relative z-10 w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 ${
                useDarkText 
                  ? 'text-[var(--primary-base)] group-hover:text-[var(--background)]'
                  : 'text-[var(--text-light)] group-hover:text-[var(--background)]'
              }`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

        {/* 3. Mobile Navigation Controls */}
        <div className="lg:hidden flex items-center gap-4 md:gap-6 shrink-0 relative z-50">
          <button className={`nav-link-item group relative overflow-hidden flex items-center justify-center border px-4 md:px-5 py-1.5 md:py-2 cursor-pointer outline-none transition-colors duration-500 ${
            useDarkText 
              ? 'border-[var(--text-main)]/60 hover:border-[var(--text-main)]' 
              : 'border-[var(--text-light)]/60 hover:border-[var(--text-light)]'
          }`}>
            <div className="absolute inset-0 w-full h-full bg-[var(--accent)] translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"></div>
            <span className={`relative z-10 font-sans text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] transition-colors duration-500 ${
               useDarkText 
                ? 'text-[var(--text-main)] group-hover:text-[var(--background)]' 
                : 'text-[var(--text-light)] group-hover:text-[var(--text-main)]'
            }`}>
              Pay Fee
            </span>
          </button>

          <div 
            className="nav-link-item relative w-6 md:w-7 h-5 flex flex-col justify-center items-center cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className={`absolute w-full h-[1.5px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                useDarkText ? 'bg-[var(--primary-base)]' : 'bg-[var(--text-light)]'
              } ${isMobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`}
            ></span>
            <span className={`absolute w-full h-[1.5px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                useDarkText ? 'bg-[var(--primary-base)]' : 'bg-[var(--text-light)]'
              } ${isMobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`}
            ></span>
          </div>
        </div>
      </nav>

      {/* Dedicated Normal-Flow Mount Slot for 2nd Sub-Navbar on /alumni (Never overlaps main nav) */}
      <div id="alumni-subnav-portal-root" className="w-full relative z-40"></div>

      <Navmenu
        isOpen={isMobileMenuOpen}
        closeMenu={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
      />
    </div>
  );
}