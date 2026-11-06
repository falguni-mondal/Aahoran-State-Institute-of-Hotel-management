import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Using your existing assets to populate the gallery
const images = [
  "/images/food-production/fp-gallery-1.webp",
  "/images/food-beverage/fb-gallery-1.webp",
  "/images/food-production/fp-gallery-2.webp",
  "/images/house-keeping/hk-hero.webp",
  "/images/front-office/fo-gallery-1.webp",
  "/images/food-production/fp-gallery-4.webp"
];

export default function HSRTGallery() {
  const containerRef = useRef(null);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    // DESKTOP: Asymmetric Parallax & Staggered Reveal
    mm.add("(min-width: 1024px)", () => {
      // Center column moves slightly slower/faster to create parallax depth
      gsap.to('.gallery-col-center', {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.gallery-grid',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });

      // Outer columns move in subtle opposite direction
      gsap.to('.gallery-col-outer', {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: {
          trigger: '.gallery-grid',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });

      // Fade up images as they enter
      gsap.utils.toArray('.gallery-img-wrapper').forEach((img) => {
        gsap.fromTo(img,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: {
              trigger: img,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    });

    // MOBILE/TABLET: Simple Staggered Fade Up
    mm.add("(max-width: 1023px)", () => {
      gsap.utils.toArray('.gallery-img-wrapper').forEach((img) => {
        gsap.fromTo(img,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: {
              trigger: img,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="w-full bg-[var(--background)] text-[var(--text-main)] py-20 md:py-32 lg:py-48 overflow-hidden relative">
      <div className="w-full max-w-[1800px] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24 lg:mb-32">
          <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] mb-6 block">
            Visual Highlights
          </span>
          <h2 className="head-txt text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tighter text-[var(--text-main)]">
            STC Programme
          </h2>
          <div className="w-12 h-[1px] bg-[var(--primary-base)]/20 mt-8"></div>
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          
          {/* Column 1 (Outer) */}
          <div className="gallery-col-outer flex flex-col gap-6 md:gap-8 lg:gap-10">
            <div className="gallery-img-wrapper w-full aspect-[4/5] bg-[var(--primary-base)]/5 overflow-hidden rounded-sm">
              <img src={images[0]} alt="STC Programme Activity" className="w-full h-full object-cover" />
            </div>
            <div className="gallery-img-wrapper w-full aspect-square bg-[var(--primary-base)]/5 overflow-hidden rounded-sm">
              <img src={images[3]} alt="STC Programme Activity" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Column 2 (Center - Offset for Parallax) */}
          <div className="gallery-col-center flex flex-col gap-6 md:gap-8 lg:gap-10 lg:mt-24">
            <div className="gallery-img-wrapper w-full aspect-square bg-[var(--primary-base)]/5 overflow-hidden rounded-sm">
              <img src={images[1]} alt="STC Programme Activity" className="w-full h-full object-cover" />
            </div>
            <div className="gallery-img-wrapper w-full aspect-[4/5] bg-[var(--primary-base)]/5 overflow-hidden rounded-sm">
              <img src={images[4]} alt="STC Programme Activity" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Column 3 (Outer) */}
          <div className="gallery-col-outer flex flex-col gap-6 md:gap-8 lg:gap-10 md:mt-12 lg:mt-0">
            <div className="gallery-img-wrapper w-full aspect-[4/5] bg-[var(--primary-base)]/5 overflow-hidden rounded-sm">
              <img src={images[2]} alt="STC Programme Activity" className="w-full h-full object-cover" />
            </div>
            <div className="gallery-img-wrapper w-full aspect-square bg-[var(--primary-base)]/5 overflow-hidden rounded-sm">
              <img src={images[5]} alt="STC Programme Activity" className="w-full h-full object-cover" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}