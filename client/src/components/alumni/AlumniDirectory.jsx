import React, { useState, useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getImageKitUrl } from '../../utils/imagekit';
import { ALUMNI_SECTORS } from '../../utils/alumniValidation';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function AlumniDirectory({
  directory = [],
  selectedSector = 'ALL',
  onSelectSector,
  initialBatchFilter = 'ALL',
  privacyNotice,
  onCrossTabNavigate,
}) {
  const sectionRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(initialBatchFilter || 'ALL');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [sortBy, setSortBy] = useState('batch_desc');

  // Sync batch filter when subtab changes in 2nd navbar
  useEffect(() => {
    if (initialBatchFilter && initialBatchFilter !== 'all') {
      setSelectedBatch(initialBatchFilter);
    } else if (initialBatchFilter === 'all') {
      setSelectedBatch('ALL');
    }
  }, [initialBatchFilter]);

  const uniqueBatches = useMemo(() => {
    const years = Array.from(
      new Set(directory.map((a) => String(a.yearOfPassing)).filter(Boolean))
    ).sort((a, b) => Number(b) - Number(a));
    return ['ALL', ...years];
  }, [directory]);

  const uniqueCourses = useMemo(() => {
    const courses = Array.from(
      new Set(directory.map((a) => a.courseCompleted).filter(Boolean))
    );
    return ['ALL', ...courses];
  }, [directory]);

  const filteredDirectory = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return directory
      .filter((alum) => {
        const matchesBatch =
          selectedBatch === 'ALL' ||
          String(alum.yearOfPassing) === selectedBatch;
        const matchesCourse =
          selectedCourse === 'ALL' || alum.courseCompleted === selectedCourse;
        const matchesSector =
          selectedSector === 'ALL' || alum.industrySector === selectedSector;

        const matchesSearch =
          !q ||
          alum.fullName?.toLowerCase().includes(q) ||
          alum.registrationId?.toLowerCase().includes(q) ||
          alum.organisation?.toLowerCase().includes(q) ||
          alum.currentDesignation?.toLowerCase().includes(q) ||
          alum.currentLocation?.toLowerCase().includes(q) ||
          String(alum.yearOfPassing).includes(q) ||
          alum.courseCompleted?.toLowerCase().includes(q);

        return matchesBatch && matchesCourse && matchesSector && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'batch_desc') {
          return (b.yearOfPassing || 0) - (a.yearOfPassing || 0);
        }
        if (sortBy === 'batch_asc') {
          return (a.yearOfPassing || 0) - (b.yearOfPassing || 0);
        }
        if (sortBy === 'name_asc') {
          return (a.fullName || '').localeCompare(b.fullName || '');
        }
        return 0;
      });
  }, [directory, searchQuery, selectedBatch, selectedCourse, selectedSector, sortBy]);

  useGSAP(
    () => {
      gsap.killTweensOf('.directory-card');
      gsap.fromTo(
        '.directory-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.04,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'transform',
        }
      );
    },
    { scope: sectionRef, dependencies: [filteredDirectory] }
  );

  return (
    <section
      id="alumni-directory"
      ref={sectionRef}
      className="relative w-full py-16 md:py-24 lg:py-28 bg-[var(--background)] text-[var(--text-main)] border-b border-[var(--text-main)]/10"
    >
      <div className="w-full max-w-[1800px] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] block mb-3">
              05 / Organised Institutional Database
            </span>
            <h2 className="head-txt text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tighter leading-none text-[var(--text-main)]">
              Batch-Wise <span className="italic text-[var(--accent)]">Alumni Directory.</span>
            </h2>
          </div>

          <div className="max-w-md border-l-2 border-[var(--accent)] pl-4 py-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] block">
              Privacy &amp; Consent Safeguard
            </span>
            <p className="text-xs font-light text-[var(--text-main)]/70 mt-1 leading-relaxed">
              {privacyNotice ||
                'Alumni personal contact details are never publicly displayed without explicit consent. Only verified profiles approved by SIHM Administration appear below.'}
            </p>
          </div>
        </div>

        {/* Multi-Dimensional Filter & Search Bar */}
        <div className="bg-white border border-[#E6E2D8] p-5 md:p-6 mb-10 shadow-[0_10px_30px_rgba(48,48,48,0.03)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
            {/* Search Box */}
            <div className="lg:col-span-5">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-main)]/50 mb-1.5">
                Search by Name, Reg ID, Hotel, Role, or City
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. SIHM-2021, Taj Bengal, Executive Chef, Dubai..."
                className="w-full border border-[#D5CEBF] bg-[var(--background)]/60 px-4 py-2.5 text-xs md:text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)] focus:bg-white transition-colors"
              />
            </div>

            {/* Course Filter */}
            <div className="lg:col-span-3">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-main)]/50 mb-1.5">
                Academic Programme
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full border border-[#D5CEBF] bg-[var(--background)]/60 px-3.5 py-2.5 text-xs md:text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
              >
                {uniqueCourses.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Courses & Diplomas' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Industry Sector Filter */}
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-main)]/50 mb-1.5">
                Industry Sector
              </label>
              <select
                value={selectedSector}
                onChange={(e) => onSelectSector?.(e.target.value)}
                className="w-full border border-[#D5CEBF] bg-[var(--background)]/60 px-3.5 py-2.5 text-xs md:text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
              >
                <option value="ALL">All 11 Sectors</option>
                {ALUMNI_SECTORS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-main)]/50 mb-1.5">
                Sort Directory
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-[#D5CEBF] bg-[var(--background)]/60 px-3.5 py-2.5 text-xs md:text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
              >
                <option value="batch_desc">Newest Batch First</option>
                <option value="batch_asc">Senior Batch First</option>
                <option value="name_asc">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Batch Year Quick Tabs */}
          <div className="mt-5 pt-4 border-t border-[#E6E2D8] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-main)]/50 mr-2">
                Batch Year:
              </span>
              {uniqueBatches.map((batch) => {
                const isSelected = selectedBatch === batch;
                return (
                  <button
                    key={batch}
                    type="button"
                    onClick={() => setSelectedBatch(batch)}
                    className={`px-3 py-1 text-xs font-mono uppercase transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#303030] text-[var(--background)] font-semibold'
                        : 'bg-[#EFECE6] text-[var(--text-main)]/75 hover:border-[var(--accent)] hover:text-[var(--accent)]'
                    }`}
                  >
                    {batch === 'ALL' ? 'All Batches' : `Class of ${batch}`}
                  </button>
                );
              })}
            </div>

            <span className="text-xs font-mono text-[var(--text-main)]/60">
              Showing <strong>{filteredDirectory.length}</strong> verified alumni
            </span>
          </div>
        </div>

        {/* Directory Cards Grid */}
        {filteredDirectory.length === 0 ? (
          <div className="py-16 text-center border border-[#E6E2D8] bg-white">
            <p className="head-txt text-2xl md:text-3xl text-[var(--text-main)]/60">
              No verified alumni profiles match the selected filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedBatch('ALL');
                setSelectedCourse('ALL');
                onSelectSector?.('ALL');
              }}
              className="mt-4 px-5 py-2 bg-[var(--accent)] text-white text-xs font-semibold uppercase tracking-widest cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDirectory.map((alum, idx) => (
              <div
                key={alum._id || alum.registrationId || idx}
                className="directory-card group bg-white border border-[#E6E2D8] p-6 flex flex-col justify-between hover:border-[var(--accent)] transition-[border-color,box-shadow] duration-300 shadow-[0_10px_30px_rgba(48,48,48,0.03)]"
              >
                <div>
                  {/* Top Row: Avatar + Badges */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-16 h-20 overflow-hidden bg-[#EFECE6] shrink-0 border border-[#E6E2D8]">
                      <img
                        src={getImageKitUrl(
                          alum.photograph || '/alumni-bg.webp',
                          600
                        )}
                        alt={alum.fullName}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-[#EFECE6] text-[var(--text-main)] font-mono text-[10px] font-semibold">
                          Batch {alum.yearOfAdmission}-{alum.yearOfPassing}
                        </span>
                        {alum.isDistinguished && (
                          <button
                            type="button"
                            onClick={() =>
                              onCrossTabNavigate?.(
                                'overview',
                                'distinguished',
                                '#alumni-distinguished'
                              )
                            }
                            className="px-2 py-0.5 bg-[var(--accent)]/15 text-[var(--accent)] text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Distinguished ↗
                          </button>
                        )}
                      </div>

                      <h3 className="head-txt text-2xl font-normal text-[var(--text-main)] mt-1.5 truncate">
                        {alum.fullName}
                      </h3>
                      <span className="block font-mono text-[10px] text-[var(--text-main)]/50">
                        {alum.registrationId}
                      </span>
                    </div>
                  </div>

                  {/* Designation & Hotel */}
                  <div className="space-y-1 border-t border-[#E6E2D8] pt-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                      {alum.organisation}
                    </div>
                    <div className="text-sm font-medium text-[var(--text-main)]">
                      {alum.currentDesignation}
                    </div>
                    <div className="text-xs text-[var(--text-main)]/60">
                      📍 {alum.currentLocation} • {alum.industrySector}
                    </div>
                    <div className="text-[11px] text-[var(--text-main)]/50 pt-1">
                      🎓 {alum.courseCompleted}
                    </div>
                  </div>

                  {alum.achievements && (
                    <p className="mt-3 text-xs font-light text-[var(--text-main)]/75 line-clamp-3 leading-relaxed">
                      {alum.achievements}
                    </p>
                  )}
                </div>

                {/* Footer Links (Respects Consent) */}
                <div className="mt-5 pt-3 border-t border-[#E6E2D8] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-3">
                    {alum.linkedInProfile && (
                      <a
                        href={alum.linkedInProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold uppercase tracking-wider text-[var(--text-main)] hover:text-[var(--accent)] transition-colors"
                      >
                        LinkedIn ↗
                      </a>
                    )}
                    {alum.email && (
                      <a
                        href={`mailto:${alum.email}`}
                        className="text-[var(--text-main)]/70 hover:text-[var(--accent)] transition-colors"
                      >
                        Email
                      </a>
                    )}
                  </div>

                  <span className="text-[10px] uppercase tracking-widest text-emerald-700 font-semibold">
                    ✓ Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}