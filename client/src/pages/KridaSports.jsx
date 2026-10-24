import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GalleryHero from '../components/gallery/GalleryHero';
import GalleryGrid from '../components/gallery/GalleryGrid';
import { getPublicGalleryByCategory } from '../api/galleryApi';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================
   DEFAULT FALLBACK DATA: KRĪḌĀ SPORTS MEET
========================================= */
const DEFAULT_KRIDA_BY_YEAR = [
  {
    year: '2026',
    date: 'January 20, 2026',
    title: 'Krida 2026',
    description:
      'The ultimate display of athletic prowess and teamwork. From the thrilling 100m sprints to the highly anticipated inter-department cricket finals, Krīḍā 2026 brought out the fierce competitors within our future hospitality leaders.',
    images: [
      { id: '26-s1', url: '/sports_1.webp', alt: '100m Sprint Finish', aspect: 'horizontal' },
      { id: '26-s2', url: '/sports_2.webp', alt: 'Cricket Finals', aspect: 'vertical' },
      { id: '26-s3', url: '/sports_3.webp', alt: 'Medal Distribution Ceremony', aspect: 'square' },
    ],
  },
  {
    year: '2025',
    date: 'January 18, 2025',
    title: 'Krida 2025',
    description:
      'A celebration of sportsmanship and endurance. The 2025 meet featured a spectacular tug-of-war showdown, intense volleyball matches, and strategic indoor games like chess and carrom.',
    images: [
      { id: '25-s1', url: '/sports_4.webp', alt: 'Volleyball Match', aspect: 'vertical' },
      { id: '25-s2', url: '/sports_5.webp', alt: 'Tug of War Showdown', aspect: 'horizontal' },
    ],
  },
  {
    year: '2024',
    date: 'January 22, 2024',
    title: 'Krida 2024',
    description:
      'The spirit of unity in action. Krīḍā 2024 saw students and faculty alike taking to the field. Highlights included the inter-batch football tournament and the fast-paced badminton rallies.',
    images: [
      { id: '24-s1', url: '/sports_6.webp', alt: 'Football Tournament', aspect: 'square' },
      { id: '24-s2', url: '/sports_7.webp', alt: 'Badminton Rally', aspect: 'vertical' },
      { id: '24-s3', url: '/sports_8.webp', alt: 'Champion Trophy Lift', aspect: 'horizontal' },
    ],
  },
  {
    year: '2023',
    date: 'January 15, 2023',
    title: 'Krida 2023',
    description:
      'Marking a triumphant return to outdoor athletics. This year was defined by broken records in track and field, and an unforgettable closing ceremony honoring our student athletes.',
    images: [
      { id: '23-s1', url: '/sports_9.webp', alt: 'Relay Race Baton Exchange', aspect: 'horizontal' },
      { id: '23-s2', url: '/sports_10.webp', alt: 'High Jump Competition', aspect: 'vertical' },
    ],
  },
];

export default function KridaSports() {
  const containerRef = useRef(null);
  const [sections, setSections] = useState(DEFAULT_KRIDA_BY_YEAR);

  useEffect(() => {
    let isMounted = true;

    const loadGallery = async () => {
      const items = await getPublicGalleryByCategory('krida');
      if (isMounted && Array.isArray(items) && items.length > 0) {
        const mapped = items.map((entry) => {
          const displayDate = entry.formattedDate || entry.programDate || '';
          const yearMatch = displayDate.match(/\b(19|20)\d{2}\b/);
          const displayYear = entry.year || (yearMatch ? yearMatch[0] : '');

          return {
            id: entry._id,
            year: displayYear,
            date: displayDate,
            title: entry.title || (displayYear ? `Krīḍā ${displayYear}` : displayDate),
            description: entry.description || '',
            images: Array.isArray(entry.images)
              ? entry.images.map((img, i) => ({
                  id: img._id || `${entry._id}-${i}`,
                  url: img.url || img.src,
                  alt: img.alt || entry.title || 'Krīḍā Annual Sports',
                  aspect: img.aspect || 'horizontal',
                }))
              : [],
          };
        });
        setSections(mapped);
      }
    };

    loadGallery();

    return () => {
      isMounted = false;
    };
  }, []);

  useGSAP(
    () => {
      gsap.utils.toArray('.year-header').forEach((header) => {
        gsap.fromTo(
          header,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: header,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
      ScrollTrigger.refresh();
    },
    { scope: containerRef, dependencies: [sections] }
  );

  return (
    <main
      ref={containerRef}
      className="w-full bg-[var(--background)] min-h-screen selection:bg-[var(--accent)] selection:text-[var(--primary-base)]"
    >
      <GalleryHero
        subtitle="Annual Sports Meet"
        title="Krīḍā"
        bgImage="/images/krida/krida-hero.webp"
      />

      <div className="w-full flex flex-col">
        {sections.map((section, index) => (
          <section
            key={section.id || `${section.year}-${index}`}
            className={`w-full pt-20 md:pt-32 pb-24 ${
              index !== 0 ? 'border-t border-[var(--primary-base)]/10' : ''
            }`}
          >
            <div className="w-full max-w-[1800px] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
              <div className="year-header flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16 md:mb-24">
                <div className="flex flex-col max-w-3xl relative z-10">
                  {section.year && (
                    <span className="absolute -top-12 md:-top-20 -left-4 md:-left-8 font-sans text-[120px] md:text-[180px] lg:text-[220px] font-bold leading-none text-[var(--text-main)]/5 select-none pointer-events-none tracking-tighter -z-10">
                      {section.year}
                    </span>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
                      Sports Gallery
                    </span>
                    {section.date && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-[var(--text-main)]/30"></span>
                        <span className="text-[10px] md:text-xs tracking-widest text-[var(--text-main)] font-medium uppercase">
                          {section.date}
                        </span>
                      </>
                    )}
                  </div>

                  {section.title && (
                    <h2 className="head-txt text-4xl md:text-5xl lg:text-6xl tracking-tighter text-[var(--text-main)] mb-6">
                      {section.title}
                    </h2>
                  )}

                  {section.description && (
                    <p className="text-base md:text-lg font-light leading-[1.8] md:leading-[1.9] text-[var(--text-main)]/70 max-w-2xl text-justify">
                      {section.description}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-3 opacity-50 pb-2">
                  <span className="w-12 h-[1px] bg-[var(--text-main)]"></span>
                  <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[var(--text-main)]">
                    {section.images.length} Captures
                  </span>
                </div>
              </div>
            </div>

            <GalleryGrid images={section.images} />
          </section>
        ))}
      </div>
    </main>
  );
}