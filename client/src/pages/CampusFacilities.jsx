import React, { useEffect, useState } from "react";
import CFHero from "../components/campus-facilities/CFHero";
import CFGallery from "../components/campus-facilities/CFGallery";
import { useLocation } from "react-router-dom";
import { useLenis } from "lenis/react";
import { getPublicFacilities } from "../api/campusFacilityApi";

// Default placeholder facilities when no custom facilities are stored in DB yet
const DEFAULT_FACILITIES_DATA = [
  // {
  //   id: "library",
  //   title: "Library",
  //   images: [
  //     {
  //       src: "/library_1.jpg",
  //       alt: "Students studying at desks in the library",
  //     },
  //     {
  //       src: "/library_2.jpg",
  //       alt: "Student reading newspaper in the library",
  //     },
  //     { src: "/library_3.jpg", alt: "Students researching in the library" },
  //   ],
  // },
  {
    id: "activities",
    title: "Activities",
    images: [
      {
        src: "/images/home/event.webp",
        alt: "Students participating in extracurricular activities",
      },
      {
        src: "/images/home/sports.jpeg",
        alt: "Students engaged in a group discussion",
      },
      {
        src: "/images/food-production/fp-gallery-4.webp",
        alt: "Students participating in a sports event",
      },
    ],
  },
];

export default function CampusFacilities() {
  const { hash } = useLocation();
  const lenis = useLenis();

  const [facilities, setFacilities] = useState(DEFAULT_FACILITIES_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadFacilities = async () => {
      try {
        const data = await getPublicFacilities();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            const normalized = data.map((item) => ({
              id:
                item.slug ||
                String(item.title || "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "") ||
                item._id,
              title: item.title,
              images: Array.isArray(item.images)
                ? item.images.map((img) => ({
                    src: img.url || img.src,
                    alt: img.alt || item.title,
                  }))
                : [],
            }));
            setFacilities(normalized);
          } else {
            setFacilities(DEFAULT_FACILITIES_DATA);
          }
        }
      } catch {
        if (isMounted) {
          setFacilities(DEFAULT_FACILITIES_DATA);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadFacilities();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!lenis || isLoading) return;

    if (hash) {
      const timer = setTimeout(() => {
        lenis.scrollTo(hash, {
          offset: -100,
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [hash, lenis, isLoading]);

  return (
    <main className="w-full bg-[var(--background)] min-h-screen selection:bg-[var(--accent)] selection:text-[var(--primary-base)]">
      {/* 1. Immersive Cinematic Hero */}
      <CFHero />

      {/* 2. Editorial Gallery Sections */}
      <div className="flex flex-col">
        {facilities.map((facility, index) => (
          <CFGallery
            key={facility.id || index}
            id={facility.id}
            title={facility.title}
            images={facility.images}
            index={index}
          />
        ))}
      </div>
    </main>
  );
}