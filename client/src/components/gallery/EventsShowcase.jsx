import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GalleryLightbox from './GalleryLightbox';
import { getPublicGalleryByCategory } from '../../api/galleryApi';
import { getImageKitUrl, useResponsiveImageWidth } from '../../utils/imagekit';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================
   DEFAULT FALLBACK DATA: EVENT CATEGORIES
========================================= */
const aspects = ['vertical', 'horizontal', 'square'];
const getAspect = (index) => aspects[index % aspects.length];

const DEFAULT_EVENTS = [
  {
    id: 'culinary',
    title: 'Culinary Training Program For Army Mess Cooks',
    date: 'September 15, 2026',
    year: '2026',
    images: Array.from({ length: 5 }).map((_, i) => ({
      id: `culinary-${i}`,
      url: `/events/culinary_${i + 1}.webp`,
      alt: 'Army Mess Cooks Training',
      aspect: getAspect(i),
    })),
  },
  {
    id: 'award',
    title: 'Award and Recognition Ceremony',
    date: 'May 22, 2026',
    year: '2026',
    images: Array.from({ length: 4 }).map((_, i) => ({
      id: `award-${i}`,
      url: `/events/award_${i + 1}.webp`,
      alt: 'Award and Recognition Ceremony',
      aspect: getAspect(i),
    })),
  },
  {
    id: 'expert',
    title: 'Expert Guest Session',
    date: 'November 10, 2025',
    year: '2025',
    images: Array.from({ length: 4 }).map((_, i) => ({
      id: `expert-${i}`,
      url: `/events/expert_${i + 1}.webp`,
      alt: 'Expert Guest Session',
      aspect: getAspect(i + 1),
    })),
  },
  {
    id: 'sports',
    title: 'Annual Sports Day',
    date: 'February 18, 2025',
    year: '2025',
    images: Array.from({ length: 4 }).map((_, i) => ({
      id: `sports-${i}`,
      url: `/events/sports_${i + 1}.webp`,
      alt: 'Sports Day Event',
      aspect: getAspect(i + 1),
    })),
  },
  {
    id: 'quiz',
    title: 'All India School Level Quiz Competition',
    date: 'December 05, 2024',
    year: '2024',
    images: Array.from({ length: 5 }).map((_, i) => ({
      id: `quiz-${i}`,
      url: `/events/quiz_${i + 1}.webp`,
      alt: 'All India Quiz Competition',
      aspect: getAspect(i + 2),
    })),
  },
  {
    id: 'tourism',
    title: 'World Tourism Day',
    date: 'September 27, 2023',
    year: '2023',
    images: Array.from({ length: 4 }).map((_, i) => ({
      id: `tourism-${i}`,
      url: `/events/tourism_${i + 1}.webp`,
      alt: 'World Tourism Day',
      aspect: getAspect(i),
    })),
  },
  {
    id: 'independence',
    title: 'Independence Day Celebrations',
    date: 'August 15, 2018',
    year: '2018',
    images: Array.from({ length: 5 }).map((_, i) => ({
      id: `ind-${i}`,
      url: `/events/independence_${i + 1}.webp`,
      alt: 'Independence Day 2018',
      aspect: getAspect(i + 2),
    })),
  },
];

export default function EventsShowcase() {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [eventsList, setEventsList] = useState(DEFAULT_EVENTS);
  const activeWidth = useResponsiveImageWidth(1600, 1200);

  // Global Mouse State
  const mousePos = useRef({ x: -100, y: -100 });
  const isHovering = useRef(false);
  const xMove = useRef(null);
  const yMove = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      const items = await getPublicGalleryByCategory('programme-and-events');
      if (isMounted && Array.isArray(items) && items.length > 0) {
        const mapped = items.map((entry) => {
          const displayDate = entry.formattedDate || entry.programDate || '';
          const yearMatch = displayDate.match(/\b(19|20)\d{2}\b/);
          const displayYear = entry.year || (yearMatch ? yearMatch[0] : '');

          return {
            id: entry._id,
            title: entry.title || displayDate || `Campus Event ${displayYear}`,
            description: entry.description || '',
            date: displayDate,
            year: displayYear,
            images: Array.isArray(entry.images)
              ? entry.images.map((img, i) => ({
                  id: img._id || `${entry._id}-${i}`,
                  url: img.url || img.src,
                  alt: img.alt || entry.title || displayDate || 'Programme and Events',
                  aspect: img.aspect || getAspect(i),
                }))
              : [],
          };
        });
        setEventsList(mapped);
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    xMove.current = gsap.quickTo(cursorRef.current, 'x', {
      duration: 0.4,
      ease: 'power3.out',
    });
    yMove.current = gsap.quickTo(cursorRef.current, 'y', {
      duration: 0.4,
      ease: 'power3.out',
    });
  }, []);

  const checkHoverState = () => {
    if (!cursorRef.current || mousePos.current.x < 0) return;

    const el = document.elementFromPoint(
      mousePos.current.x,
      mousePos.current.y
    );
    const isOverImage = el?.closest('.showcase-item');

    if (isOverImage && !selectedImage) {
      if (!isHovering.current) {
        isHovering.current = true;
        gsap.to(cursorRef.current, {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(1.5)',
          overwrite: 'auto',
        });
      }
    } else if (isHovering.current) {
      isHovering.current = false;
      gsap.to(cursorRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power3.in',
        overwrite: 'auto',
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      xMove.current?.(e.clientX - 40);
      yMove.current?.(e.clientY - 40);
      checkHoverState();
    };

    const handleScroll = () => checkHoverState();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [selectedImage]);

  useGSAP(
    () => {
      const items = gsap.utils.toArray('.showcase-item');

      items.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      ScrollTrigger.refresh();
    },
    { scope: containerRef, dependencies: [eventsList] }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[var(--background)] z-20 pb-32 cursor-default"
    >
      {/* SINGLE GLOBAL CURSOR */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-[80px] h-[80px] bg-[var(--accent)] text-[var(--text-light)] rounded-full flex items-center justify-center font-sans text-[10px] font-bold tracking-[0.2em] pointer-events-none z-[100] scale-0 opacity-0"
        style={{ transformOrigin: 'center center' }}
      >
        VIEW
      </div>

      <div className="w-full max-w-[1800px] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24 pt-16">
        {eventsList.map((category, index) => {
          const images = category.images || [];

          return (
            <div
              key={category.id || index}
              className={`flex flex-col lg:flex-row items-start gap-12 lg:gap-24 py-16 md:py-24 ${
                index !== 0 ? 'border-t border-[var(--primary-base)]/15' : ''
              }`}
            >
              {/* LEFT: STICKY EVENT TYPOGRAPHY */}
              <div className="w-full lg:w-[35%] shrink-0 lg:sticky lg:top-32 flex flex-col gap-4 pt-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
                    Event Gallery
                  </span>
                  {category.date && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-[var(--text-main)]/30"></span>
                      <span className="text-[10px] md:text-xs tracking-widest text-[var(--text-main)] font-medium uppercase">
                        {category.date}
                      </span>
                    </>
                  )}
                </div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light tracking-tight leading-[1.1] text-[var(--text-main)] pr-8">
                  {category.title}
                </h2>

                {category.description && (
                  <p className="text-sm md:text-base font-light leading-relaxed text-[var(--text-main)]/70 pr-6">
                    {category.description}
                  </p>
                )}
              </div>

              {/* RIGHT: MASONRY EVENT GALLERY */}
              <div className="w-full lg:w-[65%]">
                <div className="columns-1 md:columns-2 gap-5 md:gap-8 w-full">
                  {images.map((img, i) => {
                    const rawUrl = img.url || img.src;
                    const optimizedUrl = getImageKitUrl(rawUrl, activeWidth);

                    return (
                      <div
                        key={img.id || i}
                        onClick={() =>
                          setSelectedImage({
                            ...img,
                            url: getImageKitUrl(rawUrl, 1600),
                          })
                        }
                        className="showcase-item group relative break-inside-avoid mb-5 md:mb-8 cursor-none overflow-hidden"
                      >
                        <div className="relative w-full h-full bg-[var(--text-main)]/5 overflow-hidden rounded-sm">
                          <img
                            src={optimizedUrl}
                            alt={img.alt}
                            loading="lazy"
                            className="w-full h-auto object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* LIGHTBOX COMPONENT */}
      <GalleryLightbox
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </section>
  );
}
