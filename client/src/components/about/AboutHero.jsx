import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function AboutHero() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 320px)", () => {
      // ==========================================
      // HERO ANIMATION & INFINITE SCROLL INDICATOR
      // ==========================================
      const heroTl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      
      heroTl.fromTo('.hero-bg-img', 
        { scale: 1.1 }, 
        { scale: 1, duration: 3, ease: 'power2.out' }
      )
      .fromTo('.hero-title-word', 
        { yPercent: 120, skewY: 3 }, 
        { yPercent: 0, skewY: 0, duration: 1.6, stagger: 0.15 }, 
        "-=2.5"
      )
      .fromTo('.hero-sub',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.1 },
        "-=1.2"
      )
      .fromTo('.scroll-indicator-container',
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        "-=0.8"
      );

      gsap.fromTo('.scroll-line', 
        { yPercent: -100 },
        { 
          yPercent: 100, 
          duration: 1.8, 
          ease: 'power2.inOut',
          repeat: -1,
          repeatDelay: 0.2
        }
      );

      // Hero Parallax Scroll Effect
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
    <section ref={sectionRef} className="hero-section relative w-full h-[100dvh] min-h-[600px] overflow-clip flex flex-col justify-end pb-12 md:pb-16 lg:pb-24">
      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img 
          src="/images/about/about_hero.webp"
          alt="SIHM Durgapur Campus" 
          className="hero-bg-img absolute -top-[15%] left-0 w-full h-[130%] object-cover origin-center"
        />
        {/* Strict Primary Base Overlay */}
        <div className="absolute inset-0 bg-[#030812]/75"></div>
      </div>

      {/* Hero Content - Full Screen Flex Layout */}
      <div className="relative z-10 w-full px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24 mx-auto max-w-[1800px] flex flex-col h-full pt-32 lg:pt-40">
        
        {/* Top Framing Context */}
        <div className="flex justify-between items-start w-full shrink-0">
          <span className="hero-sub block text-[9px] md:text-[10px] lg:text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">
            Institution Profile
          </span>
          <span className="hero-sub block text-[9px] md:text-[10px] lg:text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-light)] text-right max-w-[200px] md:max-w-xs">
            State Institute of Hotel Management, Durgapur
          </span>
        </div>

        <div className="flex flex-col w-full my-auto lg:mt-auto lg:mb-0 pb-12 lg:pb-0">
          <div className="overflow-hidden w-full flex justify-start">
            <h1 className="hero-title-word head-txt text-[16vw] md:text-[12vw] lg:text-[12vw] xl:text-[10rem] 2xl:text-[12rem] tracking-tighter leading-[0.85] text-[var(--text-light)]">
              "ABOUT
            </h1>
          </div>
          <div className="overflow-hidden w-full flex justify-end">
            <h1 className="hero-title-word head-txt text-[18vw] md:text-[14vw] lg:text-[14vw] xl:text-[11.5vw] 2xl:text-[10.5vw] tracking-tighter leading-[0.85] text-[var(--accent)] italic pr-4 md:pr-12 lg:pr-24">
              SIHM, DURGAPUR"
            </h1>
          </div>
        </div>

      </div>

      {/* Premium Animated Line Scroll Indicator */}
      <div className="scroll-indicator-container absolute bottom-12 md:bottom-16 right-5 md:right-8 lg:right-12 xl:right-16 2xl:right-24 flex flex-col items-center z-10">
        <span className="text-[8px] md:text-[9px] font-semibold uppercase tracking-[0.4em] text-[var(--text-light)]/80 origin-bottom -rotate-90 mb-10 md:mb-12">
          Scroll
        </span>
        <div className="relative w-[1px] h-16 md:h-24 bg-[var(--text-light)]/20 overflow-hidden">
          <div className="scroll-line absolute top-0 left-0 w-full h-full bg-[var(--accent)]"></div>
        </div>
      </div>
    </section>
  );
}