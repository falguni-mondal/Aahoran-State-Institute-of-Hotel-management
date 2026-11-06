import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const coursesData = [
    {
    id: "food-production",
    title: "Food Production",
    image: "/images/food-production/fp-hero.webp",
    description: [
      "The Diploma in Food Production is a career-focused programme that equips students with practical skills and professional knowledge in culinary arts, kitchen operations, food safety and menu planning. Through hands-on training, students develop the competencies required to work effectively in professional kitchens.",
      "Graduates can pursue opportunities as Commis Chef, Demi Chef de Partie, Kitchen Assistant, Bakery & Confectionery Professional, Food Production Supervisor and other culinary roles in hotels, restaurants, resorts, catering companies, cruise lines and institutional kitchens. The programme also provides a foundation for entrepreneurship and further studies in hospitality and culinary arts.",
    ]
  },
  {
    id: "fb-service",
    title: "Food & Beverage Service",
    image: "/images/food-beverage/fb-hero.webp",
    description: [
      "The Diploma in Food & Beverage Service is a career-focused programme designed to develop skilled professionals in restaurant operations, guest service, beverage service and hospitality etiquette. Through practical training and industry-oriented learning, students develop the skills required to deliver efficient and professional dining experiences.",
      "Graduates can pursue opportunities as Food & Beverage Associate, Steward, Captain, Bartender, Restaurant Supervisor and other service roles in hotels, restaurants, resorts, clubs, catering establishments, cruise lines and institutional food service operations. The programme also provides a foundation for entrepreneurship and further studies in hospitality and food & beverage management.",
    ]
  },
  {
    id: "bakery",
    title: "Bakery & Confectionery",
    image: "/images/food-production/fp-gallery-2.webp",
    description: [
      "The Diploma in Bakery & Confectionery is a career-focused programme designed to develop professional skills in bread making, cakes, pastries, confectionery, desserts and bakery production. Through hands-on training and industry-oriented learning, students gain expertise in production techniques, food safety, presentation and bakery operations.",
      "Graduates can pursue careers as Commis Baker, Bakery Assistant, Pastry Chef, Confectioner, Cake Artist, Bakery Supervisor and other roles in hotels, bakeries, patisseries, restaurants, resorts and catering establishments. The programme also provides opportunities for entrepreneurship, specialised culinary careers and further studies in bakery and hospitality."
    ]
  },
  {
    id: "front-office",
    title: "Front Office",
    image: "/images/front-office/fo-hero.webp",
    description: [
      "The Diploma in Front Office is a career-focused programme designed to develop professional skills in guest relations, reservations, reception operations, check-in/check-out procedures and hotel communication. Through practical and industry-oriented training, students gain the knowledge and confidence required to deliver efficient and courteous guest services.",
      "Graduates can pursue opportunities as Front Office Associate, Receptionist, Guest Relations Executive, Reservation Associate, Front Desk Supervisor and other roles in hotels, resorts, serviced apartments, clubs, travel and hospitality establishments. The programme also provides a foundation for career advancement and further studies in hospitality management."
    ]
  },
  {
    id: "house-keeping",
    title: "House Keeping",
    image: "/images/house-keeping/hk-hero.webp",
    description: [
      "The Diploma in Housekeeping is a career-focused programme designed to develop professional skills in guestroom operations, cleaning and maintenance, hygiene, laundry and linen management, and housekeeping supervision. Through practical and industry-oriented training, students gain the skills required to maintain high standards of cleanliness, comfort and guest satisfaction.",
      "Graduates can pursue opportunities as Housekeeping Associate, Room Attendant, Public Area Attendant, Laundry Associate, Housekeeping Supervisor and other roles in hotels, resorts, hospitals, serviced apartments, cruise lines and other hospitality establishments. The programme also provides a foundation for career advancement and further studies in hospitality management.",
    ]
  },
];

export default function STCourseList() {
  const containerRef = useRef(null);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    // DESKTOP ANIMATIONS: Pinned Parallax Crossfade
    mm.add("(min-width: 1024px)", () => {
      ScrollTrigger.create({
        trigger: ".lookbook-container",
        start: "top top",
        end: "bottom bottom",
        pin: ".image-pin-container",
      });

      const blocks = gsap.utils.toArray('.course-block');
      const images = gsap.utils.toArray('.course-img');

      // Set initial state: first image visible, rest hidden
      gsap.set(images, { opacity: 0 });
      gsap.set(images[0], { opacity: 1 });

      blocks.forEach((block, index) => {
        // Crossfade images based on which text block is in the center of the screen
        ScrollTrigger.create({
          trigger: block,
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => {
            if (self.isActive) {
              gsap.to(images, { opacity: 0, duration: 0.8, ease: "power2.inOut" });
              gsap.to(images[index], { opacity: 1, duration: 0.8, ease: "power2.inOut" });
            }
          }
        });

        // Fade up the text blocks as they enter the screen
        gsap.fromTo(block, 
          { opacity: 0, y: 50 },
          { 
            opacity: 1, y: 0, duration: 1, ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    });

    // MOBILE ANIMATIONS: Simple Scroll Reveals
    mm.add("(max-width: 1023px)", () => {
       gsap.utils.toArray('.mobile-course').forEach((card) => {
          gsap.fromTo(card,
            { opacity: 0, y: 40 },
            {
              opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse"
              }
            }
          );
       });
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="w-full bg-[var(--background)] text-[var(--text-main)] relative border-t border-[var(--primary-base)]/10 pb-32">
      <div className="lookbook-container w-full max-w-[1800px] mx-auto flex flex-col lg:flex-row relative">
        
        {/* ==========================================
            DESKTOP: LEFT PINNED IMAGE GALLERY 
            (Hidden on mobile)
        ========================================== */}
        <div className="hidden lg:flex w-5/12 h-[100svh] image-pin-container relative z-10 flex-col justify-center mt-14 p-12 xl:p-16 2xl:p-24">
          <div className="w-full aspect-[4/5] relative overflow-hidden bg-[var(--primary-base)]/5 shadow-2xl">
            {coursesData.map((course) => (
              <img 
                key={`${course.id}-img`}
                src={course.image}
                alt={course.title}
                className="course-img absolute inset-0 w-full h-full object-cover"
              />
            ))}
          </div>
        </div>

        {/* ==========================================
            DESKTOP: RIGHT SCROLLING TEXT BLOCKS 
            (Hidden on mobile)
        ========================================== */}
        <div className="hidden lg:flex w-7/12 flex-col z-20 py-[50vh] px-12 xl:px-16 2xl:px-24">
          {coursesData.map((course, index) => (
            <div key={`${course.id}-desc`} className="course-block flex flex-col justify-center min-h-[70vh] mb-32 last:mb-0">
              
              <div className="flex items-center gap-6 mb-8 opacity-80">
                <span className="text-xl md:text-2xl font-light text-[var(--accent)] tracking-widest font-serif">
                  0{index + 1}
                </span>
                <div className="w-16 h-[1px] bg-[var(--primary-base)]/20"></div>
              </div>

              <h3 className="head-txt text-5xl xl:text-6xl 2xl:text-7xl font-light tracking-tighter mb-10 leading-[0.95] text-[var(--text-main)]">
                Diploma in <br/> {course.title}
              </h3>
              
              <div className="flex flex-col gap-6">
                {course.description.map((para, pIndex) => (
                  <p key={pIndex} className="text-lg xl:text-xl font-light leading-[1.8] text-[var(--text-main)]/80 max-w-2xl text-justify">
                    {para}
                  </p>
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* ==========================================
            MOBILE: STACKED ALTERNATING LAYOUT 
            (Hidden on desktop)
        ========================================== */}
        <div className="lg:hidden w-full flex flex-col px-5 md:px-8 py-20 md:py-32 gap-24 md:gap-32">
          {coursesData.map((course, index) => (
            <div key={`${course.id}-mobile`} className="mobile-course flex flex-col gap-8">
              
              <div className="w-full aspect-[4/5] overflow-hidden bg-[var(--primary-base)]/5 shadow-lg">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-4 mb-6 opacity-80">
                  <span className="text-lg font-light text-[var(--accent)] tracking-widest font-serif">
                    0{index + 1}
                  </span>
                  <div className="w-12 h-[1px] bg-[var(--primary-base)]/20"></div>
                </div>

                <h3 className="head-txt text-4xl md:text-5xl font-light tracking-tighter mb-6 leading-[0.95] text-[var(--text-main)]">
                  Diploma in <br/> {course.title}.
                </h3>
                
                <div className="flex flex-col gap-5">
                  {course.description.map((para, pIndex) => (
                    <p key={pIndex} className="text-base md:text-lg font-light leading-[1.8] text-[var(--text-main)]/80 text-justify">
                      {para}
                    </p>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}