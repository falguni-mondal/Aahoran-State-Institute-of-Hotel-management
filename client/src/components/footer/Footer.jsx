import React, { useRef, useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getPublicNavBadges } from "../../api/alumniApi";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* =========================================
   BASE FOOTER NAVIGATION DATA
========================================= */
const baseFooterNav = [
  {
    title: "Academics & Departments",
    links: [
      { name: "Departments Overview", url: "/department-overview" },
      { name: "Full Term Courses", url: "/ug-program" },
      { name: "Short Term Courses", url: "/short-term-courses" },
      { name: "Hunar Se Rozgar Tak", url: "/hunar-se-rozgar" },
      { name: "Our Mentors", url: "/about#faculty" },
    ],
  },
  {
    title: "Campus & Outcomes",
    links: [
      { name: "Placement", url: "/placement" },
      { name: "Campus Facilities", url: "/campus-facilities" },
      { name: "Alumni Network", url: "/alumni", badgeKey: "alumni" },
      { name: "Gallery & Events", url: "/programme-and-events" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { name: "Notice Board", url: "/notice-board", badgeKey: "noticeBoard" },
      { name: "Results", url: "/results", badgeKey: "results" },
      { name: "Syllabus", url: "/syllabus", badgeKey: "syllabus" },
      { name: "Study Material", url: "/study-material", badgeKey: "studyMaterial" },
      { name: "Contact Us", url: "/contact" },
    ],
  },
];

const statutoryLinks = [
  { name: "Rules & Regulations", url: "/about/rules" },
  { name: "Anti Ragging Policy", url: "/anti-ragging" },
  { name: "NCHMCT", url: "https://nchm.gov.in/" },
  { name: "JNU", url: "https://www.jnu.ac.in/" },
];

export default function Footer() {
  const footerRef = useRef(null);
  const svgRef = useRef(null);
  const [navBadges, setNavBadges] = useState({
    syllabus: false,
    studyMaterial: false,
    noticeBoard: false,
    results: false,
    alumni: false,
  });

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
  }, []);

  const footerNav = useMemo(() => {
    return baseFooterNav.map((col) => ({
      ...col,
      links: col.links.map((link) => ({
        ...link,
        isNew: Boolean(link.badgeKey && navBadges[link.badgeKey]),
      })),
    }));
  }, [navBadges]);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 320px)", () => {
      
      // 1. The Cascading Waterfall Reveal for all individual items
      gsap.fromTo(
        ".footer-reveal-item",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // 2. The Premium SVG Draw Animation (Watermark)
      const paths = svgRef.current.querySelectorAll(".svg-path");
      paths.forEach((path) => {
        const length = path.getTotalLength();
        
        gsap.set(path, { 
          strokeDasharray: length, 
          strokeDashoffset: length 
        });
        
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 2.5,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          }
        });
      });

      // 3. Fast cascading reveal for the bottom statutory bar
      gsap.fromTo(
        ".footer-bottom-item",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.04,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".footer-bottom",
            start: "top 95%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // 4. GSAP expo.inOut Easing for Pure Text Links on Hover
      const hoverLinks = gsap.utils.toArray('.gsap-hover-link');
      
      hoverLinks.forEach((link) => {
        const topText = link.querySelector('.hover-text-top');
        const bottomText = link.querySelector('.hover-text-bottom');

        const tl = gsap.timeline({ paused: true });

        if (topText && bottomText) {
          tl.to([topText, bottomText], { 
            yPercent: -100, 
            duration: 0.75, 
            ease: "expo.inOut" 
          });
        }

        link.addEventListener('mouseenter', () => tl.play());
        link.addEventListener('mouseleave', () => tl.reverse());
      });

    });

    return () => mm.revert();
  }, { scope: footerRef });

  return (
    <footer
      ref={footerRef}
      className="w-full bg-[#f2f2f4] text-[var(--text-main)] relative z-20 overflow-hidden border-t border-[var(--primary-base)]/15 pt-20 md:pt-28 pb-8"
    >
      {/* The Animated SVG Watermark */}
      <div className="absolute top-10 right-5 md:top-16 md:right-16 opacity-5 pointer-events-none z-0">
        <svg 
          ref={svgRef} 
          className="w-48 h-48 md:w-80 md:h-80 text-[var(--text-main)]" 
          viewBox="0 0 100 100" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path className="svg-path" d="M10 70 H90" />
          <path className="svg-path" d="M20 70 V75 C20 78.3 33.4 81 50 81 C66.6 81 80 78.3 80 75 V70" />
          <path className="svg-path" d="M20 70 C20 35 33.4 25 50 25 C66.6 25 80 35 80 70" />
          <path className="svg-path" d="M50 17 A4 4 0 1 0 50 25 A4 4 0 1 0 50 17" />
          <path className="svg-path" d="M50 3 L50 11 M46 7 L54 7" />
          <path className="svg-path" d="M17 22 L23 28 M17 28 L23 22" />
          <path className="svg-path" d="M77 22 L83 28 M77 28 L83 22" />
        </svg>
      </div>

      <div className="w-full px-5 md:px-8 lg:px-12 xl:px-16 mx-auto max-w-[1800px] relative z-10">
        
        {/* ================= MAIN GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 mb-20 lg:mb-28">
          
          {/* COLUMN 1: Brand & Contact */}
          <div className="lg:col-span-4 flex flex-col items-start border-b lg:border-b-0 border-[var(--primary-base)]/15 pb-10 lg:pb-0">
            
            {/* The College Logos */}
            <div className="mb-8 flex flex-wrap items-center gap-5 md:gap-6 footer-reveal-item w-full">
              <img 
                src="/logo.svg" 
                alt="SIHM Durgapur Logo" 
                className="w-auto h-20 md:h-20 object-contain shrink-0"
              />
              <img 
                src="/logos/wb_tourism_logo.webp" 
                alt="West Bengal Tourism Logo" 
                className="w-auto h-8 md:h-12 max-w-[160px] object-contain shrink-0"
              />
            </div>

            {/* Address */}
            <p className="text-sm md:text-base text-[var(--text-main)]/70 leading-relaxed mb-8 max-w-sm footer-reveal-item">
              An Autonomous Body under Department of Tourism, Govt. of West Bengal. Affiliated to NCHMCT.
            </p>

            {/* Contact Details */}
            <div className="flex flex-col gap-3 w-full">
              <a href="mailto:sihmdurgapur@gmail.com" className="gsap-hover-link group flex items-center gap-3 w-fit footer-reveal-item">
                <div className="w-8 h-8 rounded-full border border-[var(--primary-base)]/20 flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] transition-colors duration-300 shrink-0">
                  <svg className="w-3.5 h-3.5 text-[var(--text-main)]/70 group-hover:text-[var(--background)] transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="relative overflow-hidden flex flex-col h-[1.3em]">
                  <span className="hover-text-top text-[var(--text-main)]/80 text-sm tracking-wide h-full flex items-center">
                    sihmdurgapur@gmail.com
                  </span>
                  <span className="hover-text-bottom text-[var(--accent)] text-sm tracking-wide h-full flex items-center">
                    sihmdurgapur@gmail.com
                  </span>
                </div>
              </a>
              
              <a href="https://wa.me/918927596669" target="_blank" rel="noopener noreferrer" className="gsap-hover-link group flex items-start gap-3 w-fit mt-1 footer-reveal-item">
                <div className="w-8 h-8 rounded-full border border-[var(--primary-base)]/20 flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] transition-colors duration-300 shrink-0">
                  <svg className="w-3.5 h-3.5 text-[var(--text-main)]/70 group-hover:text-[var(--background)] transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <div className="relative overflow-hidden flex flex-col h-[1.3em]">
                  <span className="hover-text-top text-[var(--text-main)]/80 text-sm tracking-wide h-full flex items-center">
                    +91 892 759 6669
                  </span>
                  <span className="hover-text-bottom text-[var(--accent)] text-sm tracking-wide h-full flex items-center">
                    +91 892 759 6669
                  </span>
                </div>
                <span className="text-sm">(Mon - Fri: 9AM - 5PM)<br/>except Public Holidays</span>
                </div>
              </a>

              <a href="tel:0343-2500775" className="gsap-hover-link group flex items-center gap-3 w-fit mt-1 footer-reveal-item">
                <div className="w-8 h-8 rounded-full border border-[var(--primary-base)]/20 flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] transition-colors duration-300 shrink-0">
                  <svg className="w-3.5 h-3.5 text-[var(--text-main)]/70 group-hover:text-[var(--background)] transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="relative overflow-hidden flex flex-col h-[1.3em]">
                  <span className="hover-text-top text-[var(--text-main)]/80 text-sm tracking-wide h-full flex items-center">
                    0343-2500775
                  </span>
                  <span className="hover-text-bottom text-[var(--accent)] text-sm tracking-wide h-full flex items-center">
                    0343-2500775
                  </span>
                </div>
              </a>
            </div>

          </div>

          {/* COLUMNS 2, 3, 4: Navigation Links + Socials */}
          <div className="lg:col-span-8 flex flex-col h-full">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8 w-full">
              {footerNav.map((col, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="font-bold text-[11px] xl:text-[12px] uppercase tracking-[0.2em] text-[var(--text-main)]/40 mb-6 block footer-reveal-item">
                    {col.title}
                  </span>
                  <ul className="flex flex-col gap-4">
                    {col.links.map((link, linkIdx) => {
                      
                      const isExternal = link.url.startsWith('http') || link.url === '#';
                      const LinkComponent = isExternal ? 'a' : Link;
                      const linkProps = isExternal 
                        ? { href: link.url, ...(link.url !== '#' && { target: "_blank", rel: "noopener noreferrer" }) } 
                        : { to: link.url };

                      return (
                        <li key={linkIdx} className="footer-reveal-item">
                          <LinkComponent {...linkProps} className="gsap-hover-link flex items-center w-fit cursor-pointer">
                            
                            <div className="relative overflow-hidden flex flex-col h-[1.4em]">
                              <span className="hover-text-top text-sm md:text-[15px] text-[var(--text-main)]/80 font-medium h-full flex items-center">
                                {link.name}
                              </span>
                              <span className="hover-text-bottom text-sm md:text-[15px] text-[var(--accent)] font-medium h-full flex items-center">
                                {link.name}
                              </span>
                            </div>

                            {link.isNew && (
                              <div className="ml-3 relative flex h-4 items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-40"></span>
                                <span className="relative inline-flex rounded-sm px-1.5 py-[2px] bg-[var(--accent)] text-[var(--background)] text-[8px] font-bold uppercase tracking-wider">
                                  New
                                </span>
                              </div>
                            )}
                          </LinkComponent>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {/* SOCIAL MEDIA ICONS */}
            <div className="flex items-center lg:justify-end gap-4 mt-16 lg:mt-auto footer-reveal-item">
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[var(--primary-base)]/20 flex items-center justify-center group hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all duration-300">
                <svg className="w-4 h-4 text-[var(--text-main)]/70 group-hover:text-[var(--background)] transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[var(--primary-base)]/20 flex items-center justify-center group hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all duration-300">
                <svg className="w-4 h-4 text-[var(--text-main)]/70 group-hover:text-[var(--background)] transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[var(--primary-base)]/20 flex items-center justify-center group hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all duration-300">
                <svg className="w-4 h-4 text-[var(--text-main)]/70 group-hover:text-[var(--background)] transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418zM15.194 12 10 15V9l5.194 3z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[var(--primary-base)]/20 flex items-center justify-center group hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all duration-300">
                <svg className="w-4 h-4 text-[var(--text-main)]/70 group-hover:text-[var(--background)] transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>

          </div>

        </div>

        {/* ================= BOTTOM STATUTORY BAR ================= */}
        <div className="footer-bottom flex flex-col lg:flex-row items-center justify-between pt-8 border-t border-[var(--primary-base)]/15 gap-6 lg:gap-0">
          
          <ul className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3">
            {statutoryLinks.map((link, idx) => {
              
              const isExternal = link.url.startsWith('http') || link.url === '#';
              const LinkComponent = isExternal ? 'a' : Link;
              const linkProps = isExternal 
                ? { href: link.url, ...(link.url !== '#' && { target: "_blank", rel: "noopener noreferrer" }) } 
                : { to: link.url };

              return (
                <li key={idx} className="flex items-center footer-bottom-item">
                  <LinkComponent {...linkProps} className="gsap-hover-link flex items-center w-fit cursor-pointer">
                    <div className="relative overflow-hidden flex flex-col h-[1.2em]">
                      <span className="hover-text-top font-medium text-[10px] xl:text-[11px] uppercase tracking-[0.1em] text-[var(--text-main)]/50 h-full flex items-center">
                        {link.name}
                      </span>
                      <span className="hover-text-bottom font-medium text-[10px] xl:text-[11px] uppercase tracking-[0.1em] text-[var(--accent)] h-full flex items-center">
                        {link.name}
                      </span>
                    </div>
                  </LinkComponent>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center shrink-0 footer-bottom-item">
            <span className="text-xs text-[var(--text-main)] tracking-wide text-center lg:text-right">
              &copy; {new Date().getFullYear()} SIHM Durgapur. All Rights Reserved.
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}