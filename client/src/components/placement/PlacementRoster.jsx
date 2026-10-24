import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getPublicPlacements } from '../../api/placementApi';
import { getImageKitUrl, useResponsiveImageWidth } from '../../utils/imagekit';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* =========================================
   DEFAULT PLACEHOLDER DATA
   Shown automatically when there is no data in DB
========================================= */
const DEFAULT_PLACEMENT_DATA = [
  {
    id: 1,
    name: 'Nikhil Raj',
    batch: 'B.Sc. HHA (2018-2021)',
    role: 'Restaurant Manager (M.T)',
    company: 'Pizza Hut',
    image: '/student_nikhil.jpg',
  },
  {
    id: 2,
    name: 'Ashish Shaw',
    batch: 'B.Sc. HHA (2018-2021)',
    role: 'Sales Officer (M.T)',
    company: 'Reliance Ajio',
    image: '/student_ashish.jpg',
  },
  {
    id: 3,
    name: 'Anjali Pathak',
    batch: 'B.Sc. HHA (2018-2021)',
    role: 'Guest Service Associate (F&B)',
    company: 'Ramada Encore',
    image: '/student_anjali.jpg',
  },
  {
    id: 4,
    name: 'Deepto Banerjee',
    batch: 'B.Sc. HHA (2018-2021)',
    role: 'Guest Service Associate (F.O)',
    company: 'Ramada Ahmedabad',
    image: '/student_deepto.jpg',
  },
  {
    id: 5,
    name: 'Subhalaxmi Dal',
    batch: 'B.Sc. HHA (2018-2021)',
    role: 'Guest Service Associate (F.O)',
    company: 'Courtyard by Marriott',
    image: '/student_subhalaxmi.jpg',
  },
  {
    id: 6,
    name: 'Debjani Das',
    batch: 'B.Sc. HHA (2018-2021)',
    role: 'Guest Service Associate (H.K)',
    company: 'Novotel Chennai',
    image: '/student_debjani.jpg',
  },
  {
    id: 7,
    name: 'Saloni Guha',
    batch: 'B.Sc. HHA (2017-2020)',
    role: 'Guest Relationship Officer (M.T)',
    company: 'Calvin Klein',
    image: '/student_saloni.jpg',
  },
];

export default function PlacementRoster() {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);

  const [rosterItems, setRosterItems] = useState(DEFAULT_PLACEMENT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(DEFAULT_PLACEMENT_DATA[0].image);

  // 1200w for desktop devices, 800w for mobile devices
  const activeWidth = useResponsiveImageWidth(1200, 800);

  const xToRef = useRef(null);
  const yToRef = useRef(null);

  // Fetch live Executive Roster items from DB; fallback to placeholder data if empty
  useEffect(() => {
    let isMounted = true;

    const fetchRoster = async () => {
      try {
        const data = await getPublicPlacements();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setRosterItems(data);
            setActiveImage(data[0].image);
          } else {
            setRosterItems(DEFAULT_PLACEMENT_DATA);
            setActiveImage(DEFAULT_PLACEMENT_DATA[0].image);
          }
        }
      } catch {
        if (isMounted) {
          setRosterItems(DEFAULT_PLACEMENT_DATA);
          setActiveImage(DEFAULT_PLACEMENT_DATA[0].image);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRoster();

    return () => {
      isMounted = false;
    };
  }, []);

  useGSAP(
    () => {
      let mm = gsap.matchMedia();

      // 1. Initial fade-up animation for the roster rows
      gsap.fromTo(
        '.roster-row',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // 2. Custom Mouse Follower Logic
      mm.add('(min-width: 1024px)', () => {
        xToRef.current = gsap.quickTo(cursorRef.current, 'x', {
          duration: 0.4,
          ease: 'power3',
        });
        yToRef.current = gsap.quickTo(cursorRef.current, 'y', {
          duration: 0.4,
          ease: 'power3',
        });

        const handleMouseMove = (e) => {
          if (xToRef.current && yToRef.current) {
            xToRef.current(e.clientX - 150);
            yToRef.current(e.clientY - 200);
          }
        };

        const section = containerRef.current;
        if (section) {
          section.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
          if (section) {
            section.removeEventListener('mousemove', handleMouseMove);
          }
        };
      });

      ScrollTrigger.refresh();

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [rosterItems, isLoading] }
  );

  const handleMouseEnter = (e, image) => {
    setActiveImage(image);

    if (window.innerWidth >= 1024 && cursorRef.current) {
      gsap.set(cursorRef.current, {
        x: e.clientX - 150,
        y: e.clientY - 200,
      });
    }

    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: 'expo.out',
      });
    }
  };

  const handleMouseLeave = () => {
    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.4,
        ease: 'expo.out',
      });
    }
  };

  const transformedDesktopCursorImage = getImageKitUrl(activeImage, activeWidth);

  return (
    <section
      id="alumni"
      ref={containerRef}
      className="relative w-full py-20 md:py-32 lg:py-40 bg-[var(--background)] text-[var(--text-main)] border-b border-[var(--primary-base)]/10"
    >
      <div className="w-full max-w-[1800px] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-8">
          <div>
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)] mb-4 block">
              Alumni Outcomes
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tighter leading-none">
              The Executive <br /> Roster.
            </h2>
          </div>
          <p className="text-sm md:text-base font-light text-[var(--text-main)]/60 max-w-sm">
            A curated directory of our distinguished graduates and their current placements in the global hospitality and luxury sectors.
          </p>
        </div>

        {/* ==========================================
            INTERACTIVE ROSTER LIST
        ========================================== */}
        <div className="flex flex-col border-t border-[var(--primary-base)]/10">
          {/* Table Headers (Hidden on mobile) */}
          <div className="hidden lg:grid grid-cols-12 gap-8 py-6 border-b border-[var(--primary-base)]/10 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-main)]/40">
            <div className="col-span-4">Candidate &amp; Batch</div>
            <div className="col-span-5">Appointed Role</div>
            <div className="col-span-3 text-right">Hiring Organization</div>
          </div>

          {/* Table Rows */}
          {rosterItems.map((student, idx) => {
            const mobileImgSrc = getImageKitUrl(student.image, 800);
            const desktopImgSrc = getImageKitUrl(student.image, 1200);
            const responsiveImgSrc = getImageKitUrl(student.image, activeWidth);

            return (
              <div
                key={student._id || student.id || idx}
                onMouseEnter={(e) => handleMouseEnter(e, student.image)}
                onMouseLeave={handleMouseLeave}
                className="roster-row group flex flex-col lg:grid lg:grid-cols-12 gap-2 lg:gap-8 py-6 md:py-8 lg:py-10 border-b border-[var(--primary-base)]/10 hover:bg-[var(--primary-base)]/5 transition-colors duration-500 cursor-pointer -mx-5 md:-mx-8 lg:mx-0 px-5 md:px-8 lg:px-4"
              >
                {/* Mobile Avatar (Only shows on < lg screens, loaded at 800w on mobile) */}
                <div className="lg:hidden w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden mb-3 bg-[var(--primary-base)]/10 shrink-0">
                  <picture>
                    <source media="(min-width: 768px)" srcSet={desktopImgSrc} />
                    <source media="(max-width: 767px)" srcSet={mobileImgSrc} />
                    <img
                      src={responsiveImgSrc}
                      srcSet={`${mobileImgSrc} 800w, ${desktopImgSrc} 1200w`}
                      sizes="(max-width: 767px) 800px, 1200px"
                      alt={student.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </picture>
                </div>

                {/* Column 1: Name & Batch */}
                <div className="col-span-4 flex flex-col justify-center transition-transform duration-500 lg:group-hover:translate-x-4">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors duration-300">
                    {student.name}
                  </h3>
                  <span className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-[var(--text-main)]/40 mt-1 md:mt-2">
                    {student.batch}
                  </span>
                </div>

                {/* Column 2: Role */}
                <div className="col-span-5 flex items-center mt-2 lg:mt-0">
                  <p className="text-base md:text-lg lg:text-xl font-serif text-[var(--text-main)]/80">
                    {student.role}
                  </p>
                </div>

                {/* Column 3: Company */}
                <div className="col-span-3 flex lg:justify-end items-center mt-1 lg:mt-0">
                  <span className="text-xs md:text-sm font-semibold uppercase tracking-[0.1em] text-[var(--text-main)]">
                    {student.company}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==========================================
          GLOBAL FLOATING CURSOR IMAGE (Desktop Only - 1200w)
      ========================================== */}
      <div
        ref={cursorRef}
        className="hidden lg:block fixed top-0 left-0 w-[300px] h-[400px] pointer-events-none z-50 overflow-hidden scale-75 opacity-0 rounded-sm shadow-2xl"
      >
        <img
          src={transformedDesktopCursorImage}
          alt="Student Portrait"
          className="w-full h-full object-cover bg-[var(--primary-base)]/10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary-base)]/40 to-transparent"></div>
      </div>
    </section>
  );
}