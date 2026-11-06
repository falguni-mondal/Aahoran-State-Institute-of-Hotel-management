import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function CFHero() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 320px)", () => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      // 1. Cinematic Wipe Reveal & Scale Down
      tl.fromTo('.hero-img-wrapper',
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'expo.inOut' }
      )
      .fromTo('.hero-bg-img',
        { scale: 1.2 },
        { scale: 1, duration: 3, ease: 'power2.out' },
        "-=1.2" // Overlap the scale with the wipe
      )
      // 2. Text Elements Fade & Drift Up
      .fromTo('.hero-sub',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' },
        "-=2"
      )
      .fromTo('.hero-title',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, ease: 'power3.out' },
        "-=1.8"
      )
      // 3. Scroll Indicator Fade In
      .fromTo('.scroll-indicator',
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        "-=1"
      );

      // 4. Parallax Effect on Scroll
      gsap.to('.hero-bg-img', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full h-[100dvh] min-h-[600px] flex flex-col justify-center items-center overflow-hidden bg-[var(--text-main)]"
    >
      {/* ==========================================
          FULL BLEED BACKGROUND MEDIA
      ========================================== */}
      <div className="hero-img-wrapper absolute inset-0 w-full h-full z-0 overflow-hidden">
        <img 
          src="/images/home/campus_front.webp" 
          alt="SIHM Campus Exterior" 
          className="hero-bg-img absolute top-[-10%] left-0 w-full h-[120%] object-cover origin-center"
        />
        {/* Dark Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10"></div>
      </div>

      {/* ==========================================
          CENTERED CINEMATIC TYPOGRAPHY
      ========================================== */}
      <div className="relative z-20 w-full px-5 md:px-8 lg:px-12 text-center flex flex-col items-center mt-12 md:mt-0">
        <span className="hero-sub block text-[10px] md:text-xs lg:text-sm font-semibold uppercase tracking-[0.3em] md:tracking-[0.4em] text-[var(--accent)] mb-6 md:mb-8">
          Institution Infrastructure
        </span>
        
        <h1 className="hero-title head-txt text-5xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] tracking-tighter leading-none text-[var(--text-light)] uppercase">
          Campus <br className="md:hidden" />
          <span className="italic font-light">Facilities</span>
        </h1>
      </div>

      {/* ==========================================
          DELICATE SCROLL INDICATOR
      ========================================== */}
      <div className="scroll-indicator absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20">
        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-medium text-[var(--text-light)]/60">
          Scroll to explore
        </span>
        
        <div className="w-[1px] h-12 md:h-16 bg-[var(--text-light)]/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-[var(--text-light)] animate-[scrollDown_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
      
      {/* CSS Animation for Scroll Line */}
      <style>{`
        @keyframes scrollDown {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
      
    </section>
  );
}