import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GalleryLightbox from './GalleryLightbox';
import { getImageKitUrl, useResponsiveImageWidth } from '../../utils/imagekit';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function GalleryGrid({ images = [] }) {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const activeWidth = useResponsiveImageWidth(1600, 1200);

  // Global Mouse State
  const mousePos = useRef({ x: -100, y: -100 });
  const isHovering = useRef(false);
  const xMove = useRef(null);
  const yMove = useRef(null);

  // Initialize GSAP quickTo for extreme performance
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

  // Universal Hit-Test Function
  const checkHoverState = () => {
    if (!cursorRef.current || mousePos.current.x < 0) return;

    const el = document.elementFromPoint(
      mousePos.current.x,
      mousePos.current.y
    );
    const isOverImage = el?.closest('.gallery-item');

    if (isOverImage) {
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

  // Bind Global Listeners
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      xMove.current?.(e.clientX - 40);
      yMove.current?.(e.clientY - 40);
      checkHoverState();
    };

    const handleScroll = () => {
      checkHoverState();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Force reset cursor if Lightbox is opened
  useEffect(() => {
    if (selectedImage && cursorRef.current) {
      isHovering.current = false;
      gsap.to(cursorRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        overwrite: 'auto',
      });
    }
  }, [selectedImage]);

  // Scroll Entrance Animations
  useGSAP(
    () => {
      const items = gsap.utils.toArray('.gallery-item');

      items.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      let mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        gsap.to('.gallery-item:nth-child(even)', {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      ScrollTrigger.refresh();

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [images] }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[var(--background)] z-20 cursor-default"
    >
      {/* CUSTOM "VIEW" CURSOR */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-[80px] h-[80px] bg-[var(--accent)] text-[var(--text-light)] rounded-full flex items-center justify-center font-sans text-[10px] font-bold tracking-[0.2em] pointer-events-none z-[100] scale-0 opacity-0"
        style={{ transformOrigin: 'center center' }}
      >
        VIEW
      </div>

      <div className="w-full max-w-[1800px] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        {/* ASYMMETRIC MASONRY LAYOUT */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 md:gap-8 lg:gap-12 w-full">
          {images.map((img, idx) => {
            const rawUrl = img.url || img.src;
            const optimizedUrl = getImageKitUrl(rawUrl, activeWidth);

            return (
              <div
                key={img._id || img.id || idx}
                onClick={() =>
                  setSelectedImage({
                    ...img,
                    url: getImageKitUrl(rawUrl, 1600),
                  })
                }
                className="gallery-item group relative break-inside-avoid mb-5 md:mb-8 lg:mb-12 cursor-none overflow-hidden"
              >
                <div className="relative w-full h-full bg-[var(--text-main)]/5 overflow-hidden rounded-sm">
                  <img
                    src={optimizedUrl}
                    alt={img.alt || 'SIHM Gallery'}
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

      {/* LIGHTBOX COMPONENT */}
      <GalleryLightbox
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </section>
  );
}
