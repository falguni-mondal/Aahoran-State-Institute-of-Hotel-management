import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function AboutCampusLife() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 1024px)",
      isMobile: "(max-width: 1023px)"
    }, (context) => {
      let { isDesktop } = context.conditions;

      // 1. Header Text Reveal
      gsap.fromTo('.campus-header-anim',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.campus-header',
            start: isDesktop ? "top 85%" : "top 90%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // 2. Image Mask Reveal (Curtain effect on scroll)
      const images = gsap.utils.toArray('.campus-img-container');
      images.forEach((img) => {
        gsap.fromTo(img,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.5,
            ease: "expo.inOut",
            scrollTrigger: {
              trigger: img,
              start: "top 90%",
              toggleActions: "play none none reverse"
            }
          }
        );

        // Subliminal inner image scale
        const innerImg = img.querySelector('img');
        gsap.fromTo(innerImg,
          { scale: 1.3 },
          {
            scale: 1,
            duration: 1.5,
            ease: "expo.inOut",
            scrollTrigger: {
              trigger: img,
              start: "top 90%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });

      // 3. The Asymmetric Parallax Effect (Only on Desktop for performance)
      if (isDesktop) {
        // Left Column: Moves UP slightly faster than scroll
        gsap.to('.parallax-col-1', {
          yPercent: -15,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });

        // Middle Column: Moves DOWN slightly (contrasting the scroll)
        gsap.to('.parallax-col-2', {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });

        // Right Column: Moves UP much faster (creates extreme depth)
        gsap.to('.parallax-col-3', {
          yPercent: -25,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      }

    }); // End matchMedia

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative w-full bg-[var(--background)] text-[var(--text-main)] pt-24 pb-32 md:pt-32 md:pb-40 lg:pt-40 lg:pb-48 overflow-hidden">
      <div className="w-full px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24 mx-auto max-w-[1800px]">
        
        {/* =========================================
           HEADER AREA
        ========================================= */}
        <div className="campus-header flex flex-col items-center text-center mb-16 md:mb-24 lg:mb-32">
          <span className="campus-header-anim text-[10px] md:text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)] mb-4 md:mb-6 block">
            Life at SIHM Durgapur
          </span>
          <h2 className="campus-header-anim head-txt text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] tracking-tighter max-w-4xl">
            Where passion meets practical excellence
          </h2>
        </div>

        {/* =========================================
           MASONRY PARALLAX GALLERY
        ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 xl:gap-16">
          
          {/* COLUMN 1 (Left) */}
          <div className="parallax-col-1 flex flex-col gap-8 md:gap-10 lg:gap-12 xl:gap-16 mt-0 lg:mt-12">
            {/* Portrait Image */}
            <div className="campus-img-container relative w-full aspect-[3/4] overflow-hidden rounded-sm bg-[var(--primary-base)]/5 will-change-transform">
              <img 
                src="/images/food-production/fp-gallery-1.webp" 
                alt="Campus View" 
                className="absolute inset-0 w-full h-full object-cover origin-center will-change-transform"
              />
            </div>
            {/* Square Image */}
            <div className="campus-img-container relative w-full aspect-square overflow-hidden rounded-sm bg-[var(--primary-base)]/5 will-change-transform">
              <img 
                src="/images/front-office/fo-gallery-1.webp" 
                alt="Seminar Hall" 
                className="absolute inset-0 w-full h-full object-cover origin-center will-change-transform"
              />
            </div>
          </div>

          {/* COLUMN 2 (Middle) - Staggered Downward */}
          <div className="parallax-col-2 flex flex-col gap-8 md:gap-10 lg:gap-12 xl:gap-16 mt-0 md:mt-24 lg:mt-32">
            {/* Tall Portrait Image */}
            <div className="campus-img-container relative w-full aspect-[4/5] overflow-hidden rounded-sm bg-[var(--primary-base)]/5 will-change-transform">
              <img 
                src="/images/front-office/fo-gallery-2.webp" 
                alt="Hospitality Facilities" 
                className="absolute inset-0 w-full h-full object-cover origin-center will-change-transform"
              />
            </div>
            {/* Landscape Image */}
            <div className="campus-img-container relative w-full aspect-[4/3] overflow-hidden rounded-sm bg-[var(--primary-base)]/5 will-change-transform">
              <img 
                src="/images/about/ft-bg.webp" 
                alt="Sports Facility" 
                className="absolute inset-0 w-full h-full object-cover origin-center will-change-transform"
              />
            </div>
          </div>

          {/* COLUMN 3 (Right) 
              On Tablet (md): Spans 2 columns and switches to row layout to prevent awkward wrapping. 
              On Desktop (lg): Returns to 1 column vertical layout. 
          */}
          <div className="parallax-col-3 flex flex-col md:flex-row lg:flex-col md:col-span-2 lg:col-span-1 gap-8 md:gap-10 lg:gap-12 xl:gap-16 mt-0 lg:mt-48">
            {/* Square Image */}
            <div className="campus-img-container relative w-full md:w-1/2 lg:w-full aspect-square overflow-hidden rounded-sm bg-[var(--primary-base)]/5 will-change-transform">
              <img 
                src="/images/house-keeping/hk-hero.webp" 
                alt="Students in Seminar" 
                className="absolute inset-0 w-full h-full object-cover origin-center will-change-transform"
              />
            </div>
            {/* Portrait Image */}
            <div className="campus-img-container relative w-full md:w-1/2 lg:w-full aspect-[3/4] overflow-hidden rounded-sm bg-[var(--primary-base)]/5 will-change-transform">
              <img 
                src="/images/home/sports.jpeg" 
                alt="Campus Grounds" 
                className="absolute inset-0 w-full h-full object-cover origin-center will-change-transform"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}