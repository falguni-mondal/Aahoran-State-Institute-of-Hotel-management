import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function AlumniHero({
  config,
  showIntro = true,
  currentUser = null,
  onCrossTabNavigate,
  heroSectionRef,
}) {
  const containerRef = useRef(null);
  const currentYear = new Date().getFullYear();

  const heroEyebrow =
    config?.heroEyebrow || 'Global Hospitality Brotherhood & Sisterhood';
  const heroTitleLine1 = config?.heroTitleLine1 || 'ALUMNI';
  const heroTitleLine2 = config?.heroTitleLine2 || 'NETWORK';
  const introHeading =
    config?.introHeading || 'Once a Student, Always a Part of SIHM Family';
  const introParagraph1 =
    config?.introParagraph1 ||
    'The State Institute of Hotel Management, Durgapur, takes immense pride in its alumni, who represent the institute across various segments of the hospitality and tourism industry. Our alumni are ambassadors of our institution, carrying forward the values of professionalism, excellence, dedication and service.';
  const introParagraph2 =
    config?.introParagraph2 ||
    'The Alumni Network aims to strengthen lifelong connections, encourage professional collaboration, celebrate achievements and create opportunities for present and future generations of hospitality professionals.';

  const stats =
    Array.isArray(config?.stats) && config.stats.length > 0
      ? config.stats
      : [
          { label: 'Global Alumni Network', value: '1,800', suffix: '+' },
          { label: 'Hospitality & Luxury Brands', value: '140', suffix: '+' },
          { label: 'Countries Represented', value: '18', suffix: '+' },
          { label: 'Industry Leadership Roles', value: '94', suffix: '%' },
        ];

  useGSAP(
    () => {
      let mm = gsap.matchMedia();

      mm.add('(min-width: 320px)', () => {
        gsap.to('.ambient-orb-1', {
          xPercent: 20,
          yPercent: 30,
          duration: 15,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          overwrite: 'auto',
        });

        gsap.to('.ambient-orb-2', {
          xPercent: -30,
          yPercent: -20,
          duration: 20,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          overwrite: 'auto',
        });

        const heroTl = gsap.timeline({ defaults: { ease: 'expo.out' } });

        heroTl
          .fromTo(
            '.hero-title-word',
            { yPercent: 115, skewY: 3 },
            {
              yPercent: 0,
              skewY: 0,
              duration: 1.5,
              stagger: 0.12,
              overwrite: 'auto',
            },
            '+=0.1'
          )
          .fromTo(
            '.hero-sub',
            { opacity: 0, y: 14 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              stagger: 0.08,
              overwrite: 'auto',
            },
            '-=1.2'
          );

        gsap.fromTo(
          '.alumni-intro-reveal',
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.1,
            ease: 'power3.out',
            overwrite: 'auto',
            scrollTrigger: {
              trigger: '.alumni-intro-section',
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="w-full">
      {/* ==========================================
          PART 1: 1ST-SIGHT LIGHT THEME EDITORIAL HERO (100dvh)
          - All Hero elements + 2nd Sub-Navbar at the bottom fit inside 100dvh
          - 2 CTAs ("Alumni Registration" & "Alumni Login") placed on the LEFT side
      ========================================== */}
      <section
        ref={heroSectionRef}
        className="hero-section relative w-full h-[100dvh] min-h-[580px] max-h-[100dvh] flex flex-col justify-between overflow-visible bg-[var(--background)] text-[var(--text-main)]"
      >
        {/* Cinematic Abstract Orbs (Clipped to background layer so hover menus on 2nd nav can overflow cleanly) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="ambient-orb-1 absolute -top-[10%] -left-[10%] w-[46vw] h-[46vw] max-w-[560px] max-h-[560px] rounded-full bg-[var(--accent)]/10 blur-[80px] md:blur-[120px] mix-blend-screen will-change-transform"></div>
          <div className="ambient-orb-2 absolute top-[35%] -right-[10%] w-[38vw] h-[38vw] max-w-[480px] max-h-[480px] rounded-full bg-[var(--accent)]/15 blur-[80px] md:blur-[120px] mix-blend-screen will-change-transform"></div>
        </div>

        {/* Hero Main Content Wrapper (Fits comfortably between Main Navbar at top and 2nd Navbar at bottom) */}
        <div className="relative z-10 w-full px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24 mx-auto max-w-[1800px] flex-1 flex flex-col justify-between pt-22 sm:pt-24 md:pt-28 lg:pt-30 xl:pt-34 pb-4 md:pb-6 min-h-0">
          {/* 1. Top Framing Context Row */}
          <div className="flex justify-between items-center w-full shrink-0 gap-4">
            <span className="hero-sub block text-[9px] md:text-[10px] lg:text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">
              {heroEyebrow}
            </span>
            <span className="hero-sub block text-[9px] md:text-[10px] lg:text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-main)]/60 text-right">
              Institutional Directory {currentYear}
            </span>
          </div>

          {/* 2. Center Massive Asymmetric Title (Scaled to guarantee 1st-sight fit on all laptop & mobile screens) */}
          <div className="flex flex-col justify-center w-full my-auto py-1 md:py-2">
            <div className="overflow-hidden w-full flex justify-center md:justify-start">
              <h1 className="hero-title-word head-txt text-[14vw] md:text-[14vw] lg:text-[12vw] xl:text-[11vw] 2xl:text-[10vw] tracking-tighter leading-[0.84] text-[var(--text-main)] text-center md:text-left will-change-transform">
                {heroTitleLine1}
              </h1>
            </div>
            <div className="overflow-hidden w-full flex justify-center md:justify-end mt-1 md:mt-0">
              <h1 className="hero-title-word head-txt text-[16vw] md:text-[16vw] lg:text-[14vw] xl:text-[13vw] 2xl:text-[12vw] tracking-tighter leading-[0.84] text-[var(--accent)] italic pr-0 md:pr-10 lg:pr-20 text-center md:text-right will-change-transform">
                {heroTitleLine2}
              </h1>
            </div>
          </div>

          {/* 3. Bottom Action & Narrative Row (LEFT: 2 CTAs | RIGHT: Subtitle & Status) */}
          <div className="w-full flex flex-col-reverse md:flex-row items-center md:items-end justify-between gap-4 md:gap-8 shrink-0 pt-2">
            {/* LEFT SIDE: The 2 Primary CTAs ("Alumni Registration" & "Alumni Login") */}
            <div className="hero-sub flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 w-full md:w-auto">
              {/* CTA 1: Alumni Registration */}
              <button
                type="button"
                onClick={() =>
                  onCrossTabNavigate?.(
                    'portal',
                    'register',
                    '#alumni-register'
                  )
                }
                className="group relative overflow-hidden flex items-center gap-3 bg-[#303030] text-[var(--background)] border border-[#303030] px-5 sm:px-6 lg:px-7 py-3 sm:py-3.5 cursor-pointer outline-none transition-colors duration-500"
              >
                <div className="absolute inset-0 w-full h-full bg-[var(--accent)] translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"></div>
                <span className="relative z-10 font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--background)]">
                  Alumni Registration
                </span>
                <svg
                  className="relative z-10 w-3.5 h-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>

              {/* CTA 2: Alumni Login */}
              <button
                type="button"
                onClick={() =>
                  onCrossTabNavigate?.(
                    'portal',
                    'login',
                    '#alumni-register'
                  )
                }
                className="group relative overflow-hidden flex items-center gap-2.5 bg-white/85 text-[var(--text-main)] border border-[var(--text-main)]/35 hover:border-[var(--accent)] px-5 sm:px-6 lg:px-7 py-3 sm:py-3.5 cursor-pointer outline-none transition-colors duration-500"
              >
                <div className="absolute inset-0 w-full h-full bg-[#303030] translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"></div>
                <span className="relative z-10 font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] group-hover:text-[var(--background)] transition-colors duration-500">
                  {currentUser
                    ? `Signed In (${currentUser.registrationId})`
                    : 'Alumni Login'}
                </span>
                <svg
                  className="relative z-10 w-3.5 h-3.5 text-[var(--accent)] group-hover:text-[var(--background)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
                  />
                </svg>
              </button>
            </div>

            {/* RIGHT SIDE: Editorial Description */}
            <div className="hero-sub max-w-md text-center md:text-right pr-0 md:pr-10 lg:pr-20">
              <p className="text-xs sm:text-sm lg:text-base font-light text-[var(--text-main)]/70 leading-relaxed">
                Strengthening lifelong bonds, celebrating global hospitality leadership, and mentoring future generations of SIHM Durgapur scholars.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Bottom Slot for 2nd Sub-Navbar at First Sight (Sits at the very bottom of the 100dvh Hero) */}
        <div
          id="alumni-hero-bottom-nav-slot"
          className="relative z-30 w-full shrink-0 min-h-[50px]"
        ></div>
      </section>

      {/* ==========================================
          PART 2: ALUMNI INTRODUCTION & PILLARS
      ========================================== */}
      {showIntro && (
        <section
          id="alumni-intro"
          className="alumni-intro-section relative w-full py-20 md:py-28 lg:py-36 bg-[var(--background)] text-[var(--text-main)] border-b border-[var(--text-main)]/10"
        >
          <div className="w-full max-w-[1800px] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Left Column: Eyebrow & Institutional Cornerstones */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div className="alumni-intro-reveal">
                  <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] block mb-4">
                    01 / Institutional Legacy
                  </span>
                  <h2 className="head-txt text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-[1.02] text-[var(--text-main)]">
                    {introHeading}
                  </h2>
                </div>

                <div className="alumni-intro-reveal mt-8 pt-6 border-t border-[var(--text-main)]/10">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-main)]/50 font-semibold">
                    Four Cornerstones of the Portal
                  </p>
                  <ul className="mt-4 space-y-2.5 text-xs md:text-sm text-[var(--text-main)]/80">
                    <li className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                      <span>Batch-wise Organised Alumni Directory</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                      <span>Distinguished Alumni Hall of Fame</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                      <span>Inspiring Alumni Success Stories</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                      <span>Verified Registration &amp; Reunion Portal</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Narrative & Telemetry */}
              <div className="lg:col-span-7 flex flex-col justify-between lg:pl-10 lg:border-l border-[var(--text-main)]/10">
                <div className="space-y-6 alumni-intro-reveal">
                  <p className="text-lg md:text-xl lg:text-2xl font-light leading-relaxed text-[var(--text-main)]/90 text-justify">
                    {introParagraph1}
                  </p>
                  <blockquote className="border-l-2 border-[var(--accent)] pl-6 py-1 text-base md:text-lg lg:text-xl font-light italic head-txt leading-relaxed text-[var(--text-main)]/80 text-justify">
                    {introParagraph2}
                  </blockquote>
                </div>

                {/* Impact Metrics Bar */}
                <div className="alumni-intro-reveal grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8 mt-12 pt-10 border-t border-[var(--text-main)]/10">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="head-txt text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-[var(--text-main)]">
                        {stat.value}
                        <span className="text-[var(--accent)]">{stat.suffix}</span>
                      </span>
                      <span className="mt-2 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-main)]/50">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}