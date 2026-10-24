import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GalleryHero from '../components/gallery/GalleryHero';
import GalleryGrid from '../components/gallery/GalleryGrid';
import { getPublicGalleryByCategory } from '../api/galleryApi';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================
   DEFAULT FALLBACK DATA: FAREWELL IMAGES
========================================= */
const DEFAULT_FAREWELL_BY_YEAR = [
  {
    year: '2026',
    date: 'May 15, 2026',
    title: 'Batch of 2023-26',
    description:
      'Celebrating the graduation of the 2023-26 batch. A bittersweet night of nostalgia, outstanding awards, and bidding adieu to our future hospitality leaders.',
    images: [
      { id: '26-1', url: '/farewell_1.webp', alt: 'Graduating Batch Group Portrait', aspect: 'vertical' },
      { id: '26-2', url: '/farewell_2.webp', alt: 'Award Ceremony and Felicitations', aspect: 'horizontal' },
    ],
  },
  {
    year: '2025',
    date: 'May 10, 2025',
    title: 'Batch of 2022-25',
    description:
      'Honoring the perseverance and success of the 2022-25 class. An elegant banquet filled with touching speeches, cultural performances, and cherished memories.',
    images: [
      { id: '25-1', url: '/farewell_3.webp', alt: 'Passing the Torch to Juniors', aspect: 'vertical' },
      { id: '25-2', url: '/farewell_4.webp', alt: 'Valedictorian Speech', aspect: 'horizontal' },
      { id: '25-3', url: '/farewell_5.webp', alt: 'Candid Moments at the Farewell Banquet', aspect: 'square' },
    ],
  },
  {
    year: '2024',
    date: 'May 12, 2024',
    title: 'Batch of 2021-24',
    description:
      'A grand farewell to the 2021-24 graduates. The ceremony highlighted outstanding academic achievements and concluded with a memorable feast.',
    images: [
      { id: '24-1', url: '/farewell_6.webp', alt: 'Farewell Cultural Performances', aspect: 'vertical' },
      { id: '24-2', url: '/farewell_7.webp', alt: 'Final Address by the Principal', aspect: 'horizontal' },
    ],
  },
  {
    year: '2023',
    date: 'May 08, 2023',
    title: 'Batch of 2020-23',
    description:
      'Bidding farewell to a resilient batch. The event was marked by emotional autograph signings, traditional attires, and the symbolic hat toss.',
    images: [
      { id: '23-1', url: '/farewell_8.webp', alt: 'Students Signing Autograph Books', aspect: 'vertical' },
      { id: '23-2', url: '/farewell_9.webp', alt: 'Tossing Hats in Celebration', aspect: 'square' },
    ],
  },
  {
    year: '2022',
    date: 'May 14, 2022',
    title: 'Batch of 2019-22',
    description:
      'Celebrating the triumphant completion of their journey. A highly anticipated gathering where students shared their future aspirations and final goodbyes.',
    images: [
      { id: '22-1', url: '/farewell_10.webp', alt: 'Farewell Cake Cutting Ceremony', aspect: 'horizontal' },
      { id: '22-2', url: '/farewell_11.webp', alt: 'Faculty Blessing the Graduates', aspect: 'vertical' },
    ],
  },
];

export default function Farewell() {
  const containerRef = useRef(null);
  const [sections, setSections] = useState(DEFAULT_FAREWELL_BY_YEAR);

  useEffect(() => {
    let isMounted = true;

    const loadGallery = async () => {
      const items = await getPublicGalleryByCategory('farewell');
      if (isMounted && Array.isArray(items) && items.length > 0) {
        const mapped = items.map((entry) => {
          const displayDate = entry.formattedDate || entry.programDate || '';
          const yearMatch = displayDate.match(/\b(19|20)\d{2}\b/);
          const displayYear = entry.year || (yearMatch ? yearMatch[0] : '');

          return {
            id: entry._id,
            year: displayYear,
            date: displayDate,
            title: entry.title || (displayYear ? `Anujñā ${displayYear}` : displayDate),
            description: entry.description || '',
            images: Array.isArray(entry.images)
              ? entry.images.map((img, i) => ({
                  id: img._id || `${entry._id}-${i}`,
                  url: img.url || img.src,
                  alt: img.alt || entry.title || 'Anujñā Farewell',
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
        subtitle="The Farewell"
        title="Anujñā"
        bgImage="/images/farewell/farewell_hero.webp"
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
                      Farewell Gallery
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
