import React, { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const facilitiesData = [
  {
    id: "01",
    title: "Our Campus",
    img: "/images/home/campus_front.webp",
    gridClass: "col-span-1 md:col-span-2 lg:col-span-8", 
    link: "/our-campus",
  },
  {
    id: "02",
    title: "Events at SIHM",
    img: "/events-facility.webp",
    gridClass: "col-span-1 md:col-span-1 lg:col-span-4",
    link: "/programme-and-events"
  },
  {
    id: "03",
    title: "Activities",
    img: "/activities.webp",
    gridClass: "col-span-1 md:col-span-1 lg:col-span-4",
    link: "/campus-facilities#activities"
  },
  {
    id: "04",
    title: "Library",
    img: "/images/home/library.webp",
    gridClass: "col-span-1 md:col-span-1 lg:col-span-4",
    link: "/campus-facilities#library"
  },
  {
    id: "05",
    title: "Computer Lab",
    img: "/images/home/computer-lab.webp",
    gridClass: "col-span-1 md:col-span-2 lg:col-span-4",
    // UPDATED: Now points to the Front Office page with the specific hash
    link: "/front-office#computer-lab" 
  },
];

/* =========================================
   INDIVIDUAL FACILITY CARD (GALLERY FRAME)
========================================= */
const FacilityCard = ({ facility }) => {
  const cardRef = useRef(null);
  const imgWrapperRef = useRef(null);
  const imgRef = useRef(null);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 320px)", () => {
      // 1. The Card Entrance (Instant, clean fade-up)
      gsap.fromTo(
        cardRef.current,
        { y: 40, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 95%", 
            toggleActions: "play none none reverse",
          }
        }
      );

      // 2. The Subtle Image Settle (Provides that premium, heavy feel)
      gsap.fromTo(
        imgRef.current,
        { scale: 1.15 },
        { 
          scale: 1, 
          duration: 1.2, 
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 95%",
            toggleActions: "play none none reverse",
          }
        }
      );
    });

    return () => mm.revert();
  }, { scope: cardRef });

  return (
    // Changed div to Link to make the entire card clickable
    <Link
      to={facility.link}
      ref={cardRef}
      className={`group w-full flex flex-col p-5 md:p-6 lg:p-8 xl:p-10 border-r border-b border-[var(--text-main)]/15 bg-transparent cursor-pointer outline-none ${facility.gridClass}`}
    >
      <div 
        ref={imgWrapperRef}
        className="w-full h-[30vh] md:h-[35vh] lg:h-[45vh] overflow-hidden will-change-transform mb-6 lg:mb-8 bg-[var(--text-main)]/5"
      >
        <img
          ref={imgRef}
          src={facility.img}
          alt={facility.title}
          className="w-full h-full object-cover grayscale-[25%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
        />
      </div>

      <div className="flex flex-row items-end justify-between w-full mt-auto">
        <div className="flex flex-col items-start">
          <span className="font-sans font-semibold text-[10px] md:text-[11px] xl:text-xs tracking-[0.2em] text-[var(--text-main)]/50 mb-2 md:mb-3 block">
            {facility.id}
          </span>
          <h3 className="head-txt text-2xl md:text-3xl lg:text-[2rem] xl:text-[2.25rem] text-[var(--text-main)] leading-tight tracking-tight drop-shadow-none group-hover:text-[var(--accent)] transition-colors duration-500">
            {facility.title}
          </h3>
        </div>

        <div className="shrink-0 mb-1">
          <svg 
            className="w-5 h-5 md:w-6 md:h-6 text-[var(--text-main)]/40 group-hover:text-[var(--accent)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-hover:-translate-y-1" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

/* =========================================
   MAIN SECTION COMPONENT
========================================= */
export default function Facilities() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 320px)", () => {
      gsap.fromTo(
        headerRef.current.querySelectorAll('.facility-word'),
        { y: "120%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 0.8,
          stagger: 0.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 90%", 
            toggleActions: "play none none reverse",
          }
        }
      );
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      className="w-full bg-[var(--background)] py-24 md:py-32 xl:py-40 2xl:py-48 relative z-10"
    >
      <div className="w-full px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24 mx-auto max-w-[1800px] mb-10 md:mb-16">
        <div ref={headerRef} className="flex flex-col items-start w-full">
          <span className="font-sans font-bold text-xs xl:text-sm 2xl:text-base uppercase tracking-[0.2em] text-[var(--text-main)]/60 mb-3 block">
            Infrastructure & Environment
          </span>
          <h2 className="head-txt text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5.5rem] text-[var(--text-main)] leading-[1.05] tracking-tight max-w-3xl">
            <div className="overflow-hidden pb-1">
              <span className="facility-word block will-change-transform">Experience our</span>
            </div>
            <div className="overflow-hidden pb-3">
              <span className="facility-word block will-change-transform italic font-light text-[var(--accent)]">Facilities</span>
            </div>
          </h2>
        </div>
      </div>

      <div className="w-full px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24 mx-auto max-w-[1800px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 w-full border-t border-l border-[var(--text-main)]/15">
          {facilitiesData.map((facility) => (
            <FacilityCard 
              key={facility.id} 
              facility={facility} 
            />
          ))}
        </div>
      </div>
      
    </section>
  );
}