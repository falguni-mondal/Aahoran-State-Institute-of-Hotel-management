import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const pillarsData = [
  {
    id: "01",
    title: "NCHMCT",
    kicker: "Ministry of Tourism, Govt. of India",
    desc: "National Council for Hotel Management & Catering Technology (NCHMCT) is an autonomous body centrally regulating academics for B.Sc. Hospitality & Hotel Administration.",
    img: "/images/logos/nchmct.webp",
    link: "https://nchm.gov.in/",
  },
  {
    id: "02",
    title: "Our Mentors",
    kicker: "Industry-Trained Experts",
    desc: "SIHM Durgapur houses a well-groomed, highly educated team of faculties dedicated to the profession, bringing years of direct exposure and experience from 5-star luxury hotels.",
    img: "/images/food-production/fp-gallery-5.webp",
    link: "/about#faculty",
  },
  {
    id: "03",
    title: "Our Alumni",
    kicker: "A Global Professional Network",
    desc: "Our alumni carry the SIHM Durgapur legacy across leading hotels, cruise lines, airlines, and global service brands—representing the excellence of Indian hospitality worldwide.",
    img: "/alumni-bg.webp",
    link: "/placement#alumni",
  },
];

/* =========================================
   INDIVIDUAL PILLAR CARD (ARCHITECTURAL STYLE)
========================================= */
const PillarCard = ({ pillar, isLast }) => {
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);
  const btnRef = useRef(null);
  const hoverTl = useRef(null);
  const iconRef = useRef(null);

  useGSAP(() => {
    let mm = gsap.matchMedia();
    const image = imageRef.current;
    const btn = btnRef.current;
    const icon = iconRef.current;
    const textBlock = textRef.current;

    mm.add("(min-width: 1024px)", () => {
      hoverTl.current = gsap.timeline({ paused: true });

      hoverTl.current.to(image, { opacity: 0.15, scale: 1, duration: 0.6, ease: "power3.out" }, 0);
      hoverTl.current.to(icon, { rotate: 90, color: "var(--accent)", duration: 0.4, ease: "expo.out" }, 0);

      // Replaced word-by-word animation with a smooth block-level fade-up
      hoverTl.current.fromTo(textBlock,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        0.1
      );

      hoverTl.current.fromTo(
        btn, 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.4, ease: "expo.out" }, 
        "-=0.4"
      );
    });

    mm.add("(max-width: 1023px)", () => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 70%",
          end: "bottom 30%",
        }
      });

      scrollTl.to(image, { opacity: 0.1, scale: 1, duration: 0.4, ease: "power3.out" }, 0);
      scrollTl.to(icon, { rotate: 90, color: "var(--accent)", duration: 0.3, ease: "expo.out" }, 0);
      
      // Block-level fade-up for mobile scrolling
      scrollTl.fromTo(textBlock,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        0.1
      );

      scrollTl.fromTo(
        btn, 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, 
        "-=0.2"
      );
    });

    return () => mm.revert();
  }, { scope: cardRef });

  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024 && hoverTl.current) hoverTl.current.play();
  };
  
  const handleMouseLeave = () => {
    if (window.innerWidth >= 1024 && hoverTl.current) hoverTl.current.reverse();
  };

  // Determine routing logic for internal vs external links
  const isExternal = pillar.link.startsWith('http');
  const LinkComponent = isExternal ? 'a' : Link;
  const linkProps = isExternal 
    ? { href: pillar.link, target: "_blank", rel: "noopener noreferrer" } 
    : { to: pillar.link };

  return (
    <div 
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative flex-1 flex flex-col justify-end p-8 md:p-12 xl:p-16 border-[var(--primary-base)]/15 overflow-hidden cursor-crosshair min-h-[60vh] lg:min-h-full group/card transition-colors duration-700 bg-[var(--background)] ${isLast ? '' : 'border-b lg:border-b-0 lg:border-r'}`}
    >
      {/* Hover Micro-Tint */}
      <div className="absolute inset-0 z-0 bg-[var(--primary-base)]/[0.02] opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

      {/* Accent Line Reveal */}
      <div className="absolute bottom-0 left-0 w-0 h-[3px] bg-[var(--accent)] group-hover/card:w-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] z-20"></div>

      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          ref={imageRef}
          src={pillar.img} 
          alt={pillar.title}
          className="w-full h-full object-cover opacity-0 scale-[1.05] mix-blend-multiply grayscale-[30%] will-change-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/30 to-transparent opacity-80"></div>
      </div>

      {/* Card Content */}
      <div className="relative z-10 flex flex-col h-full justify-between w-full group-hover/card:translate-x-2 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
        
        {/* Top Header */}
        <div className="w-full flex justify-between items-start mb-24 lg:mb-0">
          <span className="font-sans font-light text-2xl xl:text-3xl text-[var(--accent)]">
            {pillar.id}
          </span>
          <svg 
            ref={iconRef}
            className="w-5 h-5 text-[var(--primary-base)]/30 will-change-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v16m8-8H4" />
          </svg>
        </div>

        {/* Bottom Content Area */}
        <div className="flex flex-col items-start w-full">
          
          <span className="font-sans font-bold text-[9px] md:text-[10px] xl:text-[11px] uppercase tracking-[0.2em] text-[var(--accent)] mb-4 block">
            {pillar.kicker}
          </span>
          
          <h3 className="head-txt text-5xl lg:text-[2.7rem] xl:text-[4rem] 2xl:text-[5.5rem] leading-none tracking-tight mb-6 lg:mb-8 text-[var(--primary-base)] group-hover/card:translate-x-1 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
            {pillar.title}
          </h3>

          {/* Justified Paragraph Reveal */}
          <div ref={textRef} className="w-full mb-8 opacity-0">
            <p className="font-sans text-sm md:text-base xl:text-lg text-[var(--primary-base)]/70 leading-relaxed text-justify">
              {pillar.desc}
            </p>
          </div>

          {/* Button CTA */}
          <LinkComponent
            {...linkProps}
            ref={btnRef}
            className="opacity-0 group/btn relative overflow-hidden flex items-center gap-3 border border-[var(--text-main)]/20 hover:border-[var(--accent)] px-6 py-3 rounded-sm cursor-pointer outline-none transition-colors duration-500 bg-[var(--background)]"
          >
            <div className="absolute inset-0 w-full h-full bg-[var(--accent)] translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"></div>
            <span className="relative z-10 text-[var(--accent)] group-hover/btn:text-[var(--text-light)] transition-colors duration-500 font-sans text-[10px] xl:text-[11px] font-bold uppercase tracking-[0.15em]">
              Explore More
            </span>
            <svg 
              className="relative z-10 w-3.5 h-3.5 text-[var(--accent)] group-hover/btn:text-[var(--text-light)] group-hover/btn:translate-x-1 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </LinkComponent>
          
        </div>
      </div>
    </div>
  );
};

/* =========================================
   MAIN SECTION COMPONENT
========================================= */
export default function Pillars() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      ".pillar-card-wrapper",
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        }
      }
    );
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      className="w-full bg-[var(--primary-base)]/[0.03] py-20 md:py-28 lg:py-32 border-y border-[var(--primary-base)]/10 relative z-10"
    >
      <div className="w-full px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24 mx-auto max-w-[1920px]">
        <div className="w-full flex flex-col lg:flex-row min-h-[100vh] lg:min-h-[80vh] bg-[var(--background)] border border-[var(--primary-base)]/15 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
          {pillarsData.map((pillar, index) => (
            <div key={pillar.id} className="pillar-card-wrapper flex-1 flex flex-col">
              <PillarCard pillar={pillar} isLast={index === pillarsData.length - 1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}