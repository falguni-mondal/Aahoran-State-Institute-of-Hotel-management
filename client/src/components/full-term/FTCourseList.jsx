import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const programDetails = [
  {
    title: "Operational & Managerial Curriculum",
    content: "The syllabus perfectly balances rigorous academic theory with intensive practical laboratory sessions. Students master core operational standards across Food Production, Food & Beverage Service, Front Office, and Housekeeping. Crucially, the program also integrates advanced managerial subjects, including Financial Management, Human Resources, Facility Planning, Strategic Management, and Tourism Marketing."
  },
  {
    title: "NEP 2020 & The Honours Pathway",
    content: "Structured to align seamlessly with the National Education Policy (NEP) 2020, students are granted the exclusive option to extend their studies into a fourth year. This dedicated pathway allows ambitious candidates to graduate with a prestigious Honours Degree, providing a significant competitive edge in the global hospitality market."
  },
  {
    title: "Global Prestige & Rankings",
    content: "Graduates are awarded a degree from Jawaharlal Nehru University (JNU), New Delhi. JNU is globally celebrated for its academic rigor and currently holds the #2 ranking in the university category across India by NIRF. Furthermore, the academic framework is centrally regulated by the NCHMCT, an autonomous body under the Ministry of Tourism, ensuring world-class standards."
  }
];

export default function FTCourseList() {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Image Parallax Effect
    gsap.to('.editorial-image', {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: {
        trigger: '.image-container',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });

    // Top Heading Reveal (Independent Trigger)
    gsap.fromTo('.intro-text',
      { y: 30, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 1, 
        stagger: 0.2, // Staggers the left side and right side of the intro
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.intro-container',
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Bottom Details Grid Reveal (Independent Trigger)
    gsap.fromTo('.detail-column',
      { y: 40, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.8, 
        stagger: 0.15, 
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.editorial-text-content',
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        }
      }
    );

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="w-full bg-[var(--background)] text-[var(--text-main)] py-20 md:py-28 lg:py-36 xl:py-48 border-t border-[var(--primary-base)]/10 overflow-hidden">
      <div className="w-full max-w-[1800px] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24 flex flex-col">
        
        {/* Top Introduction - Added .intro-container for the ScrollTrigger */}
        <div className="intro-container flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-20 mb-16 md:mb-24">
          <div className="w-full lg:w-5/12 intro-text">
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] mb-6 block">
              Program Architecture
            </span>
            <h2 className="head-txt text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tighter leading-[1.05]">
              B.Sc. in Hospitality & Hotel Administration
            </h2>
          </div>
          <div className="w-full lg:w-6/12 intro-text lg:pt-12">
            <p className="text-lg md:text-xl lg:text-2xl font-light leading-[1.7] text-[var(--text-main)]/80 text-justify">
              This three-year, six-semester degree is meticulously designed to transform students into capable leaders. Offered through the National Council for Hotel Management and Catering Technology (NCHMCT) and recognized by Jawharlal Nehru University, New Delhi, it equips graduates with the precise skills, deep knowledge, and professional attitude required to assume supervisory roles effortlessly.
            </p>
          </div>
        </div>

        {/* Massive Parallax Image Break */}
        <div className="image-container w-full h-[50vh] md:h-[60vh] lg:h-[75vh] relative overflow-hidden bg-[var(--primary-base)]/5 mb-20 md:mb-32">
          <img 
            src="/images/front-office/fo-about.webp" 
            alt="Academic Administration" 
            className="editorial-image absolute inset-0 w-full h-[120%] object-cover -translate-y-[10%] will-change-transform"
          />
        </div>

        {/* Bottom Details Grid */}
        <div className="editorial-text-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 lg:gap-20 relative">
          
          {/* Subtle Top Border for the grid on Desktop */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-[var(--primary-base)]/10 hidden md:block"></div>

          {programDetails.map((item, index) => (
            <div key={index} className="detail-column flex flex-col pt-0 md:pt-12">
              
              <div className="flex items-center gap-4 mb-6 opacity-60">
                <span className="text-sm font-light text-[var(--accent)] tracking-widest font-serif">
                  0{index + 1}
                </span>
                <div className="w-full h-[1px] bg-[var(--primary-base)]/20"></div>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-light tracking-tight mb-6 leading-[1.2]">
                {item.title}
              </h3>
              
              <p className="text-base md:text-lg font-light leading-[1.8] text-[var(--text-main)]/70 text-justify">
                {item.content}
              </p>
              
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}