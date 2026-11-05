import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getImageKitUrl } from '../../utils/imagekit';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function AlumniDistinguishedAndStories({
  distinguishedAlumni = [],
  successStories = [],
  onCrossTabNavigate,
}) {
  const sectionRef = useRef(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  const activeStory =
    successStories.length > 0
      ? successStories[activeStoryIndex % successStories.length]
      : null;

  useGSAP(
    () => {
      let mm = gsap.matchMedia();

      mm.add('(min-width: 320px)', () => {
        gsap.fromTo(
          '.distinguished-header',
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: '.distinguished-header',
              start: 'top 86%',
              toggleActions: 'play none none none',
            },
          }
        );

        gsap.fromTo(
          '.distinguished-card',
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.09,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: '.distinguished-grid',
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );

        gsap.fromTo(
          '.stories-block',
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: '.stories-block',
              start: 'top 86%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="alumni-distinguished"
      ref={sectionRef}
      className="relative w-full py-20 md:py-28 lg:py-36 bg-[#EFECE6] text-[var(--text-main)] border-b border-[var(--text-main)]/10 overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        {/* ==========================================
            PART A: DISTINGUISHED ALUMNI HALL OF FAME
        ========================================== */}
        <div className="distinguished-header flex flex-col md:flex-row justify-between items-start md:items-end mb-14 md:mb-20 gap-6">
          <div>
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] block mb-3">
              02 / Institutional Laureates
            </span>
            <h2 className="head-txt text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-none text-[var(--text-main)]">
              Distinguished <span className="italic text-[var(--accent)]">Alumni.</span>
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
            <p className="text-sm md:text-base font-light text-[var(--text-main)]/70 max-w-md md:text-right">
              Showcasing industry leaders, executive chefs, general managers, and hospitality pioneers who elevate SIHM Durgapur&apos;s global standing.
            </p>
            <button
              type="button"
              onClick={() =>
                onCrossTabNavigate?.('directory', 'all', '#alumni-directory')
              }
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] hover:underline cursor-pointer"
            >
              Explore Full Batch Directory →
            </button>
          </div>
        </div>

        <div className="distinguished-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {distinguishedAlumni.map((alum, idx) => (
            <div
              key={alum._id || idx}
              className="distinguished-card group relative flex flex-col justify-between border border-[#D5CEBF] bg-white p-6 md:p-8 hover:border-[var(--accent)] transition-[border-color,background-color,box-shadow] duration-300 shadow-[0_10px_30px_rgba(48,48,48,0.03)]"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="w-20 h-24 md:w-24 md:h-28 overflow-hidden bg-[#EFECE6] shrink-0 border border-[#E6E2D8]">
                    <img
                      src={getImageKitUrl(alum.photograph || '/alumni-bg.webp', 800)}
                      alt={alum.fullName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() =>
                        onCrossTabNavigate?.(
                          'directory',
                          String(alum.yearOfPassing || 'all'),
                          '#alumni-directory'
                        )
                      }
                      className="inline-block px-2.5 py-1 bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-[var(--accent)] hover:text-white transition-colors cursor-pointer"
                    >
                      Batch {alum.batchLabel || alum.yearOfPassing} ↗
                    </button>
                    <span className="block font-mono text-[10px] text-[var(--text-main)]/50 mt-2">
                      {alum.registrationId}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                  {alum.organisation} • {alum.currentLocation}
                </span>
                <h3 className="head-txt text-2xl md:text-3xl font-normal text-[var(--text-main)] mt-1">
                  {alum.fullName}
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-main)]/75 mt-1 font-medium">
                  {alum.currentDesignation}
                </p>

                <p className="mt-4 pt-4 border-t border-[var(--text-main)]/10 text-xs md:text-sm font-light leading-relaxed text-[var(--text-main)]/80">
                  {alum.distinguishedCitation || alum.achievements}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--text-main)]/10 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[var(--text-main)]/60">
                <button
                  type="button"
                  onClick={() =>
                    onCrossTabNavigate?.(
                      'careers',
                      alum.industrySector || 'all',
                      '#alumni-careers'
                    )
                  }
                  className="hover:text-[var(--accent)] transition-colors cursor-pointer text-left"
                >
                  {alum.industrySector} →
                </button>
                {alum.linkedInProfile && (
                  <a
                    href={alum.linkedInProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] hover:underline font-semibold"
                  >
                    LinkedIn ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ==========================================
            PART B: ALUMNI SUCCESS STORIES SPOTLIGHT
        ========================================== */}
        {activeStory && (
          <div
            id="alumni-stories"
            className="stories-block mt-24 md:mt-32 pt-16 md:pt-24 border-t border-[var(--text-main)]/15"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] block mb-3">
                  03 / Inspiring Existing Students
                </span>
                <h2 className="head-txt text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-none text-[var(--text-main)]">
                  Alumni <span className="italic text-[var(--accent)]">Success Stories.</span>
                </h2>
              </div>

              {successStories.length > 1 && (
                <div className="flex flex-wrap items-center gap-2.5">
                  {successStories.map((st, idx) => (
                    <button
                      key={st._id || idx}
                      type="button"
                      onClick={() => setActiveStoryIndex(idx)}
                      className={`px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] border transition-colors cursor-pointer ${
                        idx === activeStoryIndex
                          ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--text-light)]'
                          : 'border-[#D5CEBF] bg-white text-[var(--text-main)]/75 hover:border-[var(--text-main)]/50'
                      }`}
                    >
                      0{idx + 1} • {st.fullName.split(' ')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center border border-[#D5CEBF] bg-white p-6 sm:p-8 md:p-12 shadow-[0_10px_30px_rgba(48,48,48,0.03)]">
              <div className="lg:col-span-5 aspect-[4/3] w-full overflow-hidden border border-[#E6E2D8] bg-[#EFECE6]">
                <img
                  src={getImageKitUrl(activeStory.photograph || '/alumni-bg.webp', 1200)}
                  alt={activeStory.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="lg:col-span-7 flex flex-col justify-between">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                    Featured Journey
                  </span>
                  <span className="text-xs font-mono text-[var(--text-main)]/65">
                    {activeStory.courseCompleted} ({activeStory.batchLabel || activeStory.yearOfPassing})
                  </span>
                </div>

                <h3 className="head-txt text-2xl sm:text-3xl md:text-4xl font-light text-[var(--text-main)] leading-snug">
                  &ldquo;
                  {activeStory.successStoryTitle ||
                    `From SIHM Durgapur classrooms to ${activeStory.currentDesignation} at ${activeStory.organisation}`}
                  &rdquo;
                </h3>

                <p className="mt-5 text-sm md:text-base font-light leading-relaxed text-[var(--text-main)]/80">
                  {activeStory.successStoryContent || activeStory.achievements}
                </p>

                <div className="mt-8 pt-6 border-t border-[var(--text-main)]/10 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="head-txt text-2xl text-[var(--text-main)]">
                      {activeStory.fullName}
                    </div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--accent)] mt-0.5">
                      {activeStory.currentDesignation} — {activeStory.organisation} ({activeStory.currentLocation})
                    </div>
                  </div>

                  <span className="font-mono text-xs text-[var(--text-main)]/50">
                    ID: {activeStory.registrationId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}