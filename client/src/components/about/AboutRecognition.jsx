import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================
   RECOGNITION DATA
========================================= */
const recognitionData = [
  {
    year: "2025",
    title: "Excellence in Culinary Education",
    organization: "Ministry of Tourism, Govt. of India",
    img: "/images/home/aahoran.webp" 
  },
  {
    year: "2024",
    title: "Best Emerging Hospitality Institute",
    organization: "Eastern India Education Excellence",
    img: "/images/home/sihm.webp"
  },
  {
    year: "2024",
    title: "Outstanding Placement Record",
    organization: "National Council for Hotel Management",
    img: "/images/about/placement.webp"
  },
  {
    year: "2023",
    title: "State Award for Skill Development",
    organization: "Govt. of West Bengal",
    img: "/images/about/award.webp"
  }
];

export default function AboutRecognition() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 320px)", () => {
      const items = gsap.utils.toArray('.award-item');

      items.forEach((item, index) => {
        ScrollTrigger.create({
          trigger: item,
          // When the top of the item hits 55% down the viewport, it activates
          start: "top 55%",
          end: "bottom 55%",
          // Automatically adds this class when in the trigger zone, removes it when out
          toggleClass: { targets: item, className: "is-active" },
          onToggle: (self) => {
            if (self.isActive) {
              // Fade IN the corresponding images (Both Desktop and Mobile containers)
              gsap.to(`.award-img-${index}`, {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "expo.out"
              });
            } else {
              // Fade OUT the images when item leaves the active zone
              gsap.to(`.award-img-${index}`, {
                opacity: 0,
                scale: 1.1,
                duration: 0.8,
                ease: "expo.out"
              });
            }
          }
        });
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      // THEME & DISTINCTION: Light background with a 2% tint of primary-base to subtly distinguish it without borders. Added thick padding (py-24).
      className="relative w-full bg-[var(--primary-base)]/[0.02] text-[var(--text-main)]"
    >
      
      {/* Main Content Grid */}
      <div className="w-full px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24 mx-auto max-w-[1800px] flex flex-col lg:flex-row relative z-10">
        
        {/* =========================================
           LEFT COLUMN: Sticky Header & Image Area
        ========================================= */}
        <div className="lg:w-5/12 flex flex-col lg:sticky lg:top-14 lg:h-screen pt-12 pb-4 lg:py-0 lg:justify-center">
          
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)] mb-4 block">
              Recognition
            </span>
            {/* Theme: Text color changed to match the light theme */}
            <h2 className="head-txt text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] tracking-tighter mb-10 lg:mb-16">
              Awards & <br className="hidden lg:block"/> Accolades
            </h2>
          </div>
          
          {/* DESKTOP IMAGE REVEAL CONTAINER */}
          {/* Theme: Border and shadow adjusted to look clean on a light background */}
          <div className="hidden lg:block relative w-full max-w-md aspect-[16/9] rounded-sm overflow-hidden bg-[var(--background)] shadow-xl border border-[var(--primary-base)]/10">
            {recognitionData.map((item, idx) => (
              <img 
                key={`desk-${idx}`} 
                src={item.img} 
                alt={item.title}
                className={`award-img-${idx} absolute inset-0 w-full h-full object-cover opacity-0 will-change-transform origin-center grayscale-[15%] contrast-[1.05]`}
              />
            ))}
            {/* Lighter inner shadow for depth */}
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none"></div>
          </div>

        </div>

        {/* =========================================
           RIGHT COLUMN: Scrolling Awards List
        ========================================= */}
        <div className="lg:w-7/12 flex flex-col lg:py-[30vh] relative">
          
          <div className="flex flex-col border-t border-[var(--primary-base)]/15 pb-[2vh] lg:pb-0 mt-12 lg:mt-0">
            
            {recognitionData.map((item, index) => (
              <div 
                key={index} 
                // The 'group' class allows us to target children based on the parent's '.is-active' state
                className="award-item group border-b border-[var(--primary-base)]/15 relative flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-8 py-10 md:py-16"
              >
                
                {/* Left Side (Year & Title) */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 lg:gap-16">
                  
                  {/* Year */}
                  {/* Theme: Inactive text is light primary-base, active becomes accent */}
                  <span className="font-mono text-sm md:text-base tracking-widest w-12 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] text-[var(--text-main)]/30 group-[.is-active]:!text-[var(--accent)] group-[.is-active]:opacity-100 group-[.is-active]:translate-x-2 md:group-[.is-active]:translate-x-3">
                    {item.year}
                  </span>
                  
                  {/* Title */}
                  <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light tracking-tight transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] text-[var(--text-main)]/50 group-[.is-active]:!text-[var(--accent)] group-[.is-active]:translate-x-2 md:group-[.is-active]:translate-x-3 text-left">
                    {item.title}
                  </h3>

                </div>

                {/* Right Side (Organization) */}
                <div className="flex items-center md:justify-end mt-2 md:mt-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
                  <p className="text-sm md:text-base font-light text-left md:text-right max-w-[200px] md:max-w-xs transition-colors duration-700 text-[var(--text-main)]/40 group-[.is-active]:!text-[var(--text-main)]/80">
                    {item.organization}
                  </p>
                </div>

              </div>
            ))}
          </div>

          {/* =========================================
             MOBILE BOTTOM IMAGE CARD (Sticky)
          ========================================= */}
          <div className="lg:hidden sticky bottom-6 md:bottom-10 w-full flex justify-center pointer-events-none z-20 mt-8">
            {/* Theme: Updated for light mode visibility */}
            <div className="relative w-full max-w-[90%] sm:max-w-sm aspect-[16/9] rounded-xl overflow-hidden shadow-2xl border border-[var(--primary-base)]/10 bg-[var(--background)]">
              {recognitionData.map((item, idx) => (
                <img 
                  key={`mob-card-${idx}`} 
                  src={item.img} 
                  alt={item.title}
                  className={`award-img-${idx} absolute inset-0 w-full h-full object-cover opacity-0 will-change-transform origin-center grayscale-[15%] contrast-[1.05]`}
                />
              ))}
              <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none"></div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}