import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ALUMNI_SECTORS } from '../../utils/alumniValidation';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function AlumniCareerNetwork({
  careerSectors = [],
  directory = [],
  selectedSector,
  onSelectSector,
}) {
  const sectionRef = useRef(null);

  const sectorsToRender =
    Array.isArray(careerSectors) && careerSectors.length > 0
      ? careerSectors
      : ALUMNI_SECTORS.map((name) => ({
          name,
          tagline: 'Global Hospitality & Tourism Leadership',
          description:
            'SIHM Durgapur graduates actively lead operations, service standards, and culinary innovation in this sector.',
          featuredCompanies: 'Taj, Oberoi, ITC, Marriott, Hyatt, Accor',
          alumniCountLabel: 'Active Chapter',
        }));

  const sectorCounts = directory.reduce((acc, alum) => {
    const sec = alum.industrySector || 'Hotel Operations';
    acc[sec] = (acc[sec] || 0) + 1;
    return acc;
  }, {});

  useGSAP(
    () => {
      let mm = gsap.matchMedia();

      mm.add('(min-width: 320px)', () => {
        gsap.killTweensOf('.career-sector-card');
        gsap.fromTo(
          '.career-sector-card',
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.05,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'transform',
          }
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="alumni-careers"
      ref={sectionRef}
      className="relative w-full py-16 md:py-24 lg:py-28 bg-[var(--background)] text-[var(--text-main)] border-b border-[var(--text-main)]/10"
    >
      <div className="w-full max-w-[1800px] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 md:mb-20 gap-6">
          <div>
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] block mb-3">
              04 / Alumni Career &amp; Industry Network
            </span>
            <h2 className="head-txt text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tighter leading-none text-[var(--text-main)]">
              Professional <span className="italic text-[var(--accent)]">Domains.</span>
            </h2>
          </div>
          <p className="text-sm md:text-base font-light text-[var(--text-main)]/65 max-w-md">
            Explore the 11 specialized hospitality, aviation, maritime, and entrepreneurial sectors where SIHM Durgapur alumni hold leadership positions. Click any sector to open the Batch Directory filtered by that domain.
          </p>
        </div>

        {/* 11 Sectors Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sectorsToRender.map((sector, idx) => {
            const isSelected = selectedSector === sector.name;
            const liveDirectoryCount = sectorCounts[sector.name] || 0;

            return (
              <div
                key={sector.name || idx}
                onClick={() =>
                  onSelectSector?.(isSelected ? 'ALL' : sector.name)
                }
                className={`career-sector-card group cursor-pointer flex flex-col justify-between p-6 border transition-[border-color,background-color,color,box-shadow] duration-300 ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[#303030] text-[var(--background)] shadow-xl'
                    : 'border-[#E6E2D8] bg-white hover:border-[var(--accent)] hover:bg-[#EFECE6]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`font-mono text-xs font-semibold ${
                        isSelected
                          ? 'text-[var(--accent)]'
                          : 'text-[var(--text-main)]/40 group-hover:text-[var(--accent)]'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        isSelected
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-[#EFECE6] text-[var(--text-main)]/75'
                      }`}
                    >
                      {sector.alumniCountLabel || `${liveDirectoryCount + 40}+ Alumni`}
                    </span>
                  </div>

                  <h3 className="head-txt text-2xl font-normal tracking-tight leading-snug">
                    {sector.name}
                  </h3>

                  {sector.tagline && (
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                      {sector.tagline}
                    </p>
                  )}

                  <p
                    className={`mt-3 text-xs leading-relaxed font-light ${
                      isSelected
                        ? 'text-[var(--background)]/80'
                        : 'text-[var(--text-main)]/70'
                    }`}
                  >
                    {sector.description}
                  </p>
                </div>

                <div
                  className={`mt-6 pt-3 border-t flex items-center justify-between text-[10px] uppercase tracking-widest ${
                    isSelected
                      ? 'border-white/15 text-white/80'
                      : 'border-[var(--text-main)]/10 text-[var(--text-main)]/50'
                  }`}
                >
                  <span className="truncate max-w-[72%]">
                    {sector.featuredCompanies || 'Global Hospitality Partners'}
                  </span>
                  <span className="font-semibold text-[var(--accent)] shrink-0">
                    {isSelected ? 'Selected ✓' : 'View Alumni →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}