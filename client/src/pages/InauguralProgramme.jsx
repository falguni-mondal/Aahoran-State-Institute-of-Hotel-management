import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GalleryHero from '../components/gallery/GalleryHero';
import GalleryGrid from '../components/gallery/GalleryGrid';
import { getPublicGalleryByCategory } from '../api/galleryApi';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================
   DEFAULT FALLBACK DATA: INAUGURAL IMAGES
========================================= */
const DEFAULT_INAUGURAL_IMAGES = [
  { id: 1, url: '/inaugural_1.webp', alt: 'Lighting of the Lamp Ceremony', aspect: 'vertical' },
  { id: 2, url: '/inaugural_2.webp', alt: 'Chief Guest Keynote Address', aspect: 'horizontal' },
  { id: 3, url: '/inaugural_3.webp', alt: 'Ribbon Cutting at the Main Entrance', aspect: 'vertical' },
  { id: 4, url: '/inaugural_4.webp', alt: 'Audience and Dignitaries', aspect: 'horizontal' },
  { id: 5, url: '/inaugural_5.webp', alt: 'Unveiling the Foundation Stone', aspect: 'square' },
  { id: 6, url: '/inaugural_6.webp', alt: 'Cultural Performance', aspect: 'vertical' },
  { id: 7, url: '/inaugural_7.webp', alt: 'Felicitation of Guests', aspect: 'horizontal' },
  { id: 8, url: '/inaugural_8.webp', alt: 'Campus Tour with Dignitaries', aspect: 'vertical' },
  { id: 9, url: '/inaugural_9.webp', alt: 'Catering Showcase', aspect: 'square' },
];

export default function InauguralProgramme() {
  const containerRef = useRef(null);
  const [images, setImages] = useState(DEFAULT_INAUGURAL_IMAGES);

  useEffect(() => {
    let isMounted = true;

    const loadGallery = async () => {
      const items = await getPublicGalleryByCategory('inaugural-programme');
      if (isMounted && Array.isArray(items) && items.length > 0) {
        const flattened = items.flatMap((entry) =>
          Array.isArray(entry.images)
            ? entry.images.map((img, idx) => ({
                id: img._id || `${entry._id}-${idx}`,
                url: img.url || img.src,
                alt: img.alt || entry.title || 'Inaugural Programme Capture',
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
        '.inaugural-header',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.inaugural-header',
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
        subtitle="A New Beginning"
        title="Inaugural Programme"
        bgImage="/inaugural_hero.webp"
      />

      <section className="w-full pt-20 md:pt-32 lg:pt-40 pb-20 md:pb-32 lg:pb-40 border-t border-[var(--primary-base)]/10">
        <div className="inaugural-header w-full max-w-[1800px] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24 mb-16 md:mb-24">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="flex flex-col max-w-3xl relative z-10">
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] mb-4 block">
                Historic Milestone
              </span>

              <h2 className="head-txt text-4xl md:text-5xl lg:text-6xl tracking-tighter text-[var(--text-main)] mb-6">
                The Grand Opening
              </h2>

              <p className="text-base md:text-lg font-light leading-[1.8] md:leading-[1.9] text-[var(--text-main)]/70 max-w-2xl text-justify">
                Relive the historic inauguration of the State Institute of Hotel Management. A momentous occasion graced by esteemed dignitaries, marking the dawn of a new era in hospitality education and excellence.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3 opacity-50 pb-2">
              <span className="w-12 h-[1px] bg-[var(--text-main)]"></span>
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[var(--text-main)]">
                {images.length} Captures
              </span>
            </div>
          </div>
        </div>

        <GalleryGrid images={images} />
      </section>
    </main>
  );
}
