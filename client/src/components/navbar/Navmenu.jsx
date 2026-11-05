import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/* =========================================
   FALLBACK NAVIGATION DATA
========================================= */
const defaultNavLinks = [
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
      { name: 'Syllabus', path: '/syllabus' },
      { 
        name: 'Study Material', 
        path: '/study-material', 
      },
    ]
  },
  { 
    name: 'Students', 
    hasDropdown: true,
    subLinks: [
      { name: 'Campus facilities', path: '/campus-facilities' },
      { name: 'Placement', path: '/placement' },
      { name: 'Alumni Network', path: '/alumni' },
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
  { name: 'Alumni', hasDropdown: false, path: '/alumni' },
  { name: 'Notice Board', hasDropdown: false, path: '/notice-board' },
  { name: 'Results', hasDropdown: false, path: '/results' },
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

const AccordionItem = ({ link, isOpen, onClick, closeMenu }) => {
  const contentRef = useRef(null);
  const accordionTl = useRef(null);
  const [activeNested, setActiveNested] = useState(null);

  useGSAP(() => {
    gsap.set(contentRef.current, { height: 0, overflow: 'hidden' });
    
    accordionTl.current = gsap.timeline({ paused: true })
      .to(contentRef.current, { 
        height: 'auto', 
        duration: 0.6, 
        ease: 'expo.inOut' 
      })
      .fromTo(contentRef.current.querySelectorAll('.mobile-sub-link'),
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' },
        "-=0.3" 
      );
  }, { scope: contentRef });

  useEffect(() => {
    if (isOpen) {
      accordionTl.current.play();
    } else {
      accordionTl.current.reverse();
      setTimeout(() => setActiveNested(null), 600);
    }
  }, [isOpen]);

  return (
    <div className="flex flex-col border-b border-[var(--text-main)]/10">
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 md:py-6 outline-none text-left group"
      >
        <span className="head-txt text-3xl md:text-4xl lg:text-5xl tracking-tight text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors duration-300">
          {link.name}
        </span>
        
        <div className="relative w-4 h-4 md:w-5 md:h-5 flex items-center justify-center shrink-0 ml-4">
          <span className="absolute w-full h-[2px] bg-[var(--text-main)] group-hover:bg-[var(--accent)] transition-all duration-500 rounded-full"></span>
          <span className={`absolute w-full h-[2px] bg-[var(--text-main)] group-hover:bg-[var(--accent)] transition-all duration-500 rounded-full ${isOpen ? 'rotate-0' : 'rotate-90'}`}></span>
        </div>
      </button>

      <div ref={contentRef} className="will-change-transform">
        <ul className="flex flex-col gap-2 pb-6 pt-2 pl-4 border-l border-[var(--text-main)]/20 ml-2">
          {link.subLinks.map((sub, idx) => (
            <li key={idx} className="mobile-sub-link flex flex-col">
              
              {sub.hasDropdown ? (
                <>
                  <button 
                    onClick={() => setActiveNested(activeNested === idx ? null : idx)}
                    className="flex items-center justify-between w-full group/nested py-2 outline-none text-left"
                  >
                    <span className="font-sans text-sm md:text-base font-medium text-[var(--text-main)]/80 group-hover/nested:text-[var(--accent)] transition-colors duration-300">
                      {sub.name}
                    </span>
                    <svg className={`w-3.5 h-3.5 text-[var(--text-main)]/40 group-hover/nested:text-[var(--accent)] transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeNested === idx ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div className={`grid transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeNested === idx ? 'grid-rows-[1fr] opacity-100 mb-2' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <ul className="flex flex-col gap-3 pl-4 border-l border-[var(--text-main)]/10 ml-1.5 mt-2">
                        {sub.subLinks.map((nestedSub, nIdx) => (
                          <li key={nIdx}>
                            {nestedSub.isExternal ? (
                              <a href={nestedSub.path || '#'} target="_blank" rel="noopener noreferrer" onClick={closeMenu} className="font-sans text-[13px] md:text-sm text-[var(--text-main)]/70 hover:text-[var(--accent)] transition-colors block py-1">
                                {nestedSub.name}
                              </a>
                            ) : (
                              <Link to={nestedSub.path || '#'} onClick={closeMenu} className="font-sans text-[13px] md:text-sm text-[var(--text-main)]/60 hover:text-[var(--accent)] transition-colors block py-1">
                                {nestedSub.name}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                sub.isExternal ? (
                  <a href={sub.path || '#'} target="_blank" rel="noopener noreferrer" onClick={closeMenu} className="flex items-center w-fit group py-2 outline-none">
                    <span className="font-sans text-sm md:text-base font-medium text-[var(--text-main)]/80 group-hover:text-[var(--accent)] transition-colors duration-300">
                      {sub.name}
                    </span>
                    {sub.badge && (
                      <span className="ml-3 bg-[var(--accent)] text-[var(--text-light)] text-[8px] md:text-[9px] font-bold uppercase tracking-wider px-1.5 py-[2px] rounded-sm">
                        {sub.badge}
                      </span>
                    )}
                  </a>
                ) : (
                  <Link to={sub.path || '#'} onClick={closeMenu} className="flex items-center w-fit group py-2 outline-none">
                    <span className="font-sans text-sm md:text-base font-medium text-[var(--text-main)]/80 group-hover:text-[var(--accent)] transition-colors duration-300">
                      {sub.name}
                    </span>
                    {sub.badge && (
                      <span className="ml-3 bg-[var(--accent)] text-[var(--text-light)] text-[8px] md:text-[9px] font-bold uppercase tracking-wider px-1.5 py-[2px] rounded-sm">
                        {sub.badge}
                      </span>
                    )}
                  </Link>
                )
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default function Navmenu({ isOpen, closeMenu, navLinks = defaultNavLinks }) {
  const menuRef = useRef(null);
  const mainTl = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useGSAP(() => {
    gsap.set(menuRef.current, { autoAlpha: 0, yPercent: -100 });

    mainTl.current = gsap.timeline({ 
      paused: true,
      onReverseComplete: () => {
        gsap.set(menuRef.current, { autoAlpha: 0 });
      }
    })
      .set(menuRef.current, { autoAlpha: 1 })
      .fromTo(menuRef.current,
        { yPercent: -100, borderRadius: "0 0 30% 30%" },
        { yPercent: 0, borderRadius: "0% 0% 0% 0%", duration: 0.8, ease: 'expo.inOut' }
      )
      .fromTo('.mobile-nav-item',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' },
        "-=0.6"
      );
  }, { scope: menuRef });

  useEffect(() => {
    if (isOpen) {
      mainTl.current.play();
    } else {
      mainTl.current.reverse();
      setTimeout(() => setActiveIndex(null), 800); 
    }
  }, [isOpen]);

  const handleAccordionClick = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div 
      ref={menuRef}
      data-lenis-prevent="true"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="fixed inset-0 w-full h-[100dvh] bg-[var(--background)]/85 backdrop-blur-md z-40 overflow-y-auto invisible opacity-0"
    >
      <div className="w-full px-5 md:px-8 lg:px-12 pt-28 pb-20 mx-auto max-w-[800px] flex flex-col min-h-full">
        
        <span className="font-sans font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] text-[var(--text-main)]/70 mb-8 block mobile-nav-item">
          Menu
        </span>

        <nav className="flex flex-col w-full">
          {navLinks.map((link, index) => (
            <div key={index} className="mobile-nav-item">
              {link.hasDropdown ? (
                <AccordionItem 
                  link={link} 
                  isOpen={activeIndex === index}
                  onClick={() => handleAccordionClick(index)}
                  closeMenu={closeMenu}
                />
              ) : (
                <Link 
                  to={link.path || '#'}
                  onClick={closeMenu}
                  className="w-full flex items-center justify-between py-5 md:py-6 border-b border-[var(--text-main)]/10 outline-none group"
                >
                  <span className="head-txt text-3xl md:text-4xl lg:text-5xl tracking-tight text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors duration-300">
                    {link.name}
                  </span>
                  {link.badge && (
                    <span className="bg-[var(--accent)] text-[var(--text-light)] text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm">
                      {link.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-16 flex flex-col gap-6 mobile-nav-item">
          <div className="flex flex-col gap-2">
            <span className="font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-[var(--text-main)]/40 block">
              Contact Us
            </span>
            <a href="mailto:sihmdurgapur@gmail.com" className="font-sans text-sm text-[var(--text-main)]/80 hover:text-[var(--accent)] transition-colors w-fit">
              sihmdurgapur@gmail.com
            </a>
            <a href="https://wa.me/918927596669" className="font-sans text-sm text-[var(--text-main)]/80 hover:text-[var(--accent)] transition-colors w-fit">
              +91 892 759 6669
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}