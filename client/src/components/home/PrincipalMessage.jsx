import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getPrincipalMentor } from "../../api/mentorApi";
import { getImageKitUrl, useResponsiveImageWidth } from "../../utils/imagekit";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const DEFAULT_PRINCIPAL = {
  name: "Dr. Santanu Dasgupta",
  role: "Principal, SIHM Durgapur",
  image: "/images/sihm_principal.webp",
};

export default function PrincipalMessage() {
  const sectionRef = useRef(null);
  const imageWrapperRef = useRef(null);
  const imageRef = useRef(null);

  // Split the refs so they trigger independently when scrolled into view
  const topContentRef = useRef(null);
  const paragraphsRef = useRef(null);

  const [principalData, setPrincipalData] = useState(DEFAULT_PRINCIPAL);
  const activeWidth = useResponsiveImageWidth(1200, 800);

  // Fetch Principal from Mentors Directory (regardless of whether hidden from About page)
  useEffect(() => {
    let isMounted = true;

    const fetchPrincipal = async () => {
      const principal = await getPrincipalMentor();
      if (isMounted && principal) {
        const hasCustomImage =
          principal.image && principal.image !== "/nchmct-bg.webp";
        const formattedRole =
          principal.role && /durgapur/i.test(principal.role)
            ? principal.role
            : `${principal.role || "Principal"}, SIHM Durgapur`;

        setPrincipalData({
          name: principal.name || DEFAULT_PRINCIPAL.name,
          role: formattedRole,
          image: hasCustomImage ? principal.image : DEFAULT_PRINCIPAL.image,
        });
      }
    };

    fetchPrincipal();

    return () => {
      isMounted = false;
    };
  }, []);

  const principalImageUrl = getImageKitUrl(principalData.image, activeWidth);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    // 1. UNIVERSAL IMAGE ANIMATIONS
    gsap.fromTo(
      imageWrapperRef.current,
      { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1.5,
        ease: "expo.inOut",
        scrollTrigger: {
          trigger: imageWrapperRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      }
    );

    gsap.fromTo(
      imageRef.current,
      { scale: 1.15 },
      {
        scale: 1,
        duration: 2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: imageWrapperRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // 2. DESKTOP / LARGE SCREENS ANIMATIONS
    mm.add("(min-width: 1024px)", () => {
      gsap.fromTo(
        topContentRef.current.children,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: topContentRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        paragraphsRef.current.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: paragraphsRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // 3. MOBILE / TABLET ANIMATIONS
    mm.add("(max-width: 1023px)", () => {
      gsap.fromTo(
        topContentRef.current.children,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: topContentRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        paragraphsRef.current.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: paragraphsRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="w-full relative z-10 bg-[var(--background)] py-24 md:py-32 xl:py-40 2xl:py-48 border-y border-[var(--primary-base)]/10"
    >
      <div className="relative z-10 w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        {/* LEFT COLUMN: THE STICKY PORTRAIT */}
        <div className="col-span-1 lg:col-span-4 relative min-w-0">
          <div className="lg:sticky lg:top-[14vh] xl:top-[17vh] flex flex-col w-full h-fit">
            {/* The Accent Frame */}
            <div className="absolute top-5 left-5 md:top-8 md:left-8 w-full aspect-[3/4] border border-[var(--accent)]/30 z-0 hidden md:block"></div>

            {/* The Image Mask Wrapper */}
            <div
              ref={imageWrapperRef}
              className="relative z-10 w-full aspect-[3/4] overflow-hidden bg-[var(--primary-base)]/5 shadow-2xl"
            >
              <img
                ref={imageRef}
                src={principalImageUrl}
                alt={principalData.name}
                onError={(e) => {
                  if (e.currentTarget.src !== window.location.origin + DEFAULT_PRINCIPAL.image) {
                    e.currentTarget.src = DEFAULT_PRINCIPAL.image;
                  }
                }}
                className="w-full h-full object-cover object-top origin-center transform-gpu grayscale-[20%] contrast-125"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary-base)]/30 via-transparent to-transparent"></div>
            </div>

            {/* Name Plate Overlay */}
            <div className="absolute bottom-6 -right-2 md:bottom-10 md:-right-8 lg:-right-10 z-20 bg-[var(--background)] border border-[var(--primary-base)]/10 px-6 py-4 md:px-8 md:py-6 shadow-xl">
              <h4 className="head-txt text-xl md:text-2xl lg:text-3xl text-[var(--primary-base)] mb-1">
                {principalData.name}
              </h4>
              <p className="font-sans font-semibold text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]">
                {principalData.role}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: THE SCROLLING MESSAGE */}
        <div className="col-span-1 lg:col-span-7 lg:col-start-6 flex flex-col items-start min-w-0 pt-8 md:pt-16 lg:pt-0 pb-12 lg:pb-32">
          {/* Giant Background Quote */}
          <div className="absolute -top-4 lg:-top-8 left-0 text-[8rem] lg:text-[12rem] text-[var(--primary-base)] opacity-[0.03] font-serif leading-none select-none pointer-events-none">
            &ldquo;
          </div>

          {/* TOP TEXT BLOCK */}
          <div ref={topContentRef} className="relative z-10 flex flex-col items-start w-full">
            {/* 1. Kicker */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-[1px] bg-[var(--accent)]"></div>
              <span className="font-sans font-bold text-[10px] xl:text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
                Message from the Desk
              </span>
            </div>

            {/* 2. Hero Quote */}
            <h3 className="w-full head-txt text-2xl md:text-3xl lg:text-4xl xl:text-[2.5rem] leading-[1.4] text-[var(--primary-base)] mb-10 text-justify">
              Hospitality is not merely a profession — it is a way of life rooted in{" "}
              <span className="italic font-light text-[var(--accent)]">
                values, service, and human connection.
              </span>
            </h3>

            {/* 3. Swami Vivekananda Quote */}
            <div className="relative w-full py-8 md:py-10 my-6 border-y border-[var(--primary-base)]/10">
              <h4 className="w-full head-txt text-lg md:text-xl lg:text-2xl text-[var(--accent)] leading-relaxed italic mb-6 text-justify">
                &ldquo;Education is the manifestation of the perfection already in man.&rdquo;
              </h4>
              <div className="flex items-center gap-4">
                <div className="w-8 h-[1px] bg-[var(--primary-base)]/30"></div>
                <p className="font-sans font-semibold text-[10px] xl:text-[11px] uppercase tracking-[0.2em] text-[var(--primary-base)]/60">
                  Swami Vivekananda
                </p>
              </div>
            </div>
          </div>

          {/* BOTTOM TEXT BLOCK: Justified Paragraphs */}
          <div
            ref={paragraphsRef}
            className="relative z-10 flex flex-col gap-6 font-sans text-base lg:text-lg text-[var(--primary-base)]/80 leading-[1.8] w-full mt-4"
          >
            <p className="w-full text-justify">
              At{" "}
              <span className="text-[var(--primary-base)] font-medium">
                State Institute of Hotel Management, Durgapur,
              </span>{" "}
              we believe education must ignite inner potential, nurture character, and empower students to create impact. Our vision of Hotel Management education goes far beyond traditional roles.
            </p>

            <p className="w-full text-justify">
              The future belongs to those who can innovate, lead with empathy, embrace technology, and build enterprises that generate employment and meaningful experiences. Whether your aspiration is to manage world-class hotels, launch your own food venture, become a hospitality technologist, or contribute to tourism and service innovation, SIHM Durgapur provides the right foundation.
            </p>

            <p className="w-full text-justify pt-4 text-[var(--primary-base)]/90 font-medium">
              Your journey to serve the world with skill, dignity, and vision begins here. Welcome to a future full of possibilities.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
