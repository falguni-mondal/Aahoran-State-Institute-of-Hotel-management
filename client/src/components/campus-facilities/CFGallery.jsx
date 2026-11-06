import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getImageKitUrl, useResponsiveImageWidth } from '../../utils/imagekit';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function CFGallery({ id, title, images = [], index }) {
  const sectionRef = useRef(null);
  // 1600w for desktop devices, 1200w for mobile devices
  const activeWidth = useResponsiveImageWidth(1600, 1200);

  useGSAP(
    () => {
      let mm = gsap.matchMedia();

      mm.add('(min-width: 320px)', () => {
        // 1. Fade up the Section Title when it enters the viewport
        gsap.fromTo(
          '.cf-title-container',
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // 2. Animate each image wrapper individually
        const wrappers = gsap.utils.toArray('.cf-img-wrapper');

        wrappers.forEach((wrapper) => {
          const img = wrapper.querySelector('.cf-parallax-img');

          // A. Cinematic Wipe Reveal (Masking)
          gsap.fromTo(
            wrapper,
            { clipPath: 'inset(100% 0% 0% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.5,
              ease: 'expo.inOut',
              scrollTrigger: {
                trigger: wrapper,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );

          // B. Internal Image Parallax (moves inside the mask on scroll)
          if (img) {
            gsap.to(img, {
              yPercent: 15,
              ease: 'none',
              scrollTrigger: {
                trigger: wrapper,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            });
          }
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [images] }
  );

  const formattedIndex = String(index + 1).padStart(2, '0');

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`relative w-full px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-20 lg:py-32 xl:py-40 bg-[var(--background)] ${
        index !== 0 ? 'border-t border-[var(--primary-base)]/10' : ''
      }`}
    >
      <div className="w-full max-w-[1800px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20 xl:gap-32">
        {/* ==========================================
            LEFT COLUMN: STICKY TITLE
        ========================================== */}
        <div className="w-full lg:w-1/3 relative z-10">
          <div className="cf-title-container lg:sticky lg:top-[40vh] flex flex-col gap-4">
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
              Facility {formattedIndex}
            </span>
            <h2 className="head-txt text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl 2xl:text-9xl text-[var(--text-main)] uppercase tracking-tighter leading-[0.85] break-words">
              {title}
            </h2>
          </div>
        </div>

        {/* ==========================================
            RIGHT COLUMN: EDITORIAL IMAGE GALLERY
            (1600w on desktop, 1200w on mobile)
        ========================================== */}
        <div className="w-full lg:w-2/3 flex flex-col gap-12 md:gap-20 lg:gap-32 mt-8 lg:mt-0">
          {images.map((img, i) => {
            const rawUrl = img.url || img.src;
            const desktopSrc = getImageKitUrl(rawUrl, 1600);
            const mobileSrc = getImageKitUrl(rawUrl, 1200);
            const currentSrc = getImageKitUrl(rawUrl, activeWidth);

            return (
              <div
                key={img._id || i}
                className={`cf-img-wrapper relative w-full overflow-hidden ${
                  i % 2 !== 0 ? 'md:w-[85%] md:ml-auto' : 'md:w-[90%]'
                }`}
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-[var(--primary-base)]/5">
                  <picture>
                    <source media="(min-width: 768px)" srcSet={desktopSrc} />
                    <source media="(max-width: 767px)" srcSet={mobileSrc} />
                    <img
                      src={currentSrc}
                      srcSet={`${mobileSrc} 1200w, ${desktopSrc} 1600w`}
                      sizes="(max-width: 767px) 1200px, 1600px"
                      alt={img.alt || title}
                      loading="lazy"
                      className="cf-parallax-img absolute inset-0 w-full h-[120%] top-[-10%] object-cover origin-center"
                    />
                  </picture>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}