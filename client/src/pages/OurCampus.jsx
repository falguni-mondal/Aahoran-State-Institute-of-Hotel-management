import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GalleryHero from '../components/gallery/GalleryHero';
import GalleryGrid from '../components/gallery/GalleryGrid';
import { getPublicGalleryByCategory } from '../api/galleryApi';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================
   DEFAULT FALLBACK DATA: CAMPUS IMAGES
========================================= */
const DEFAULT_CAMPUS_IMAGES = [
  { id: 1, url: '/campus_1.webp', alt: 'SIHM Main Facade', aspect: 'vertical' },
  { id: 2, url: '/campus_2.webp', alt: 'Advanced Culinary Lab', aspect: 'horizontal' },
  { id: 3, url: '/campus_3.webp', alt: 'Student Lounge Architecture', aspect: 'vertical' },
  { id: 4, url: '/campus_4.webp', alt: 'Library Archives', aspect: 'horizontal' },
  { id: 5, url: '/campus_5.webp', alt: 'Lecture Theater', aspect: 'square' },
  { id: 6, url: '/campus_6.webp', alt: 'Front Office Training Area', aspect: 'vertical' },
  { id: 7, url: '/campus_7.webp', alt: 'Training Restaurant', aspect: 'horizontal' },
  { id: 8, url: '/campus_8.webp', alt: 'Campus Courtyard', aspect: 'vertical' },
  { id: 9, url: '/campus_9.webp', alt: 'Mock Guest Room', aspect: 'square' },
];

export default function OurCampus() {
  const containerRef = useRef(null);
  const [images, setImages] = useState(DEFAULT_CAMPUS_IMAGES);

  useEffect(() => {
    let isMounted = true;

    const loadGallery = async () => {
      const items = await getPublicGalleryByCategory('our-campus');
      if (isMounted && Array.isArray(items) && items.length > 0) {
        const flattened = items.flatMap((entry) =>
          Array.isArray(entry.images)
            ? entry.images.map((img, idx) => ({
                id: img._id || `${entry._id}-${idx}`,
                url: img.url || img.src,
                alt: img.alt || entry.title || 'SIHM Campus Architecture',
                aspect: img.aspect || 'horizontal',
              }))
            : []
        );
        if (flattened.length > 0) {
          setImages(flattened);
        }
      }
    };

    loadGallery();

    return () => {
      isMounted = false;
    };
  }, []);

  useGSAP(
    () => {
      gsap.fromTo(
        '.campus-header',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.campus-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <main
      ref={containerRef}
      className="w-full bg-[var(--background)] min-h-screen selection:bg-[var(--accent)] selection:text-[var(--primary-base)]"
    >
      <GalleryHero
        subtitle="Institution Infrastructure"
        title="Our Campus"
        bgImage="/campus_hero.webp"
      />

      <section className="w-full pt-20 md:pt-32 lg:pt-40 pb-20 md:pb-32 lg:pb-40 border-t border-[var(--primary-base)]/10">
        <div className="campus-header w-full max-w-[1800px] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24 mb-16 md:mb-24">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="flex flex-col max-w-3xl relative z-10">
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] mb-4 block">
                Visual Tour
              </span>

              <h2 className="head-txt text-4xl md:text-5xl lg:text-6xl tracking-tighter text-[var(--text-main)] mb-6">
                Discover SIHM
              </h2>

              <p className="text-base md:text-lg font-light leading-[1.8] md:leading-[1.9] text-[var(--text-main)]/70 max-w-2xl text-justify">
                Explore our state-of-the-art infrastructure designed to foster excellence in hospitality education. From advanced culinary labs to comprehensive library archives, every space is crafted for immersive learning.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3 opacity-50 pb-2">
              <span className="w-12 h-[1px] bg-[var(--text-main)]"></span>
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[var(--text-main)]">
                {images.length} Spaces
              </span>
            </div>
          </div>
        </div>

        <GalleryGrid images={images} />
      </section>
    </main>
  );
}
