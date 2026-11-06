import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================
   FACILITIES DATA
========================================= */
const facilitiesData = [
  "Built on a sprawling 5-acre campus with 75,000 sq ft of total constructed area.",
  "Architecturally engineered to efficiently cater to over 600 students.",
  "Equipped with 4 modern Training Kitchens and 2 advanced Bakery & Confectionery labs.",
  "2 well-equipped Food & Beverage Labs featuring dedicated bar and service facilities.",
  "State-of-the-art Housekeeping and dedicated Laundry Labs.",
  "Modern Demo Guest Rooms designed for practical, real-world accommodation training.",
  "Dedicated Computer and Property Management Software (PMS) Labs.",
  "Advanced Front Office Labs, a large Auditorium, and a professional Conference Hall.",
  "State-of-the-Art Library providing comprehensive reference and study materials.",
  "Fully Wi-Fi enabled campus with recreational facilities, separate common rooms, and games arena."
];

export default function AboutFacilities() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 1024px)",
      isMobile: "(max-width: 1023px)"
    }, (context) => {
      let { isDesktop } = context.conditions;

      const facilityItems = gsap.utils.toArray('.facility-item');
      facilityItems.forEach((item) => {
        gsap.fromTo(item,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: isDesktop ? "top 85%" : "top 95%", 
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative w-full bg-[var(--background)] text-[var(--text-main)] pt-20 pb-32 md:pt-28 md:pb-40 lg:pt-32 lg:pb-48 border-t border-[var(--primary-base)]/10 text-justify">
      <div className="w-full px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24 mx-auto max-w-[1800px]">
        
        <div className="flex flex-col lg:flex-row gap-12 md:gap-16 lg:gap-24 2xl:gap-32 relative">
          
          {/* Left: Sticky Title & Image Area */}
          <div className="lg:w-5/12 flex flex-col relative">
            <div className="lg:sticky lg:top-32">
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 md:mb-5 block">
                Infrastructure
              </span>
              <h2 className="head-txt text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-6 md:mb-10 lg:mb-12 leading-[0.95] tracking-tighter">
                World-Class <br className="hidden lg:block"/> Facilities
              </h2>
              
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm bg-[var(--primary-base)]/5 mt-4 lg:mt-0">
                <img 
                  src="/images/front-office/fo-gallery-1.webp" 
                  alt="SIHM Facilities and Labs" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.1)]"></div>
              </div>
            </div>
          </div>

          {/* Right: Scrolling Premium Index List */}
          <div className="lg:w-7/12 flex flex-col mt-4 lg:mt-32">
            <div className="flex flex-col border-t border-[var(--primary-base)]/15">
              
              {facilitiesData.map((facility, index) => (
                <div 
                  key={index} 
                  className="facility-item relative flex flex-col md:flex-row md:items-start gap-3 md:gap-6 lg:gap-8 py-6 md:py-8 lg:py-10 border-b border-[var(--primary-base)]/15"
                >
                  <div className="shrink-0 flex items-center md:items-start md:pt-1.5">
                    <span className="text-xs md:text-sm lg:text-base font-medium text-[var(--accent)]/50 w-6 md:w-8">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-light text-[var(--text-main)]/80 leading-snug tracking-tight">
                    {facility}
                  </p>
                </div>
              ))}
              
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}