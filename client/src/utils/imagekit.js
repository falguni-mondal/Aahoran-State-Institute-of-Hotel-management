import { useState, useEffect } from 'react';

/**
 * Appends or updates ImageKit width transformation (`tr=w-<width>`) on ImageKit URLs.
 * Leaves local public assets (e.g., '/library_1.jpg') untouched.
 *
 * @param {string} url - Original image URL
 * @param {number} width - Target width in pixels (e.g., 1600, 1200, 800)
 * @returns {string} Transformed URL
 */
export const getImageKitUrl = (url, width) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Keep local static fallback assets and data/blob URLs unchanged
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    !trimmed.startsWith('http')
  ) {
    return trimmed;
  }

  if (!width) return trimmed;

  try {
    const parsedUrl = new URL(trimmed);
    parsedUrl.searchParams.set('tr', `w-${width}`);
    return parsedUrl.toString();
  } catch {
    const separator = trimmed.includes('?') ? '&' : '?';
    return `${trimmed}${separator}tr=w-${width}`;
  }
};

/**
 * Reactive viewport width hook that returns `desktopWidth` on desktop screens
 * and `mobileWidth` on mobile screens.
 *
 * @param {number} desktopWidth - Image width for desktop devices
 * @param {number} mobileWidth - Image width for mobile devices
 * @param {number} breakpoint - Breakpoint in px (default 768)
 * @returns {number} Active target image width
 */
export const useResponsiveImageWidth = (
  desktopWidth = 1600,
  mobileWidth = 1200,
  breakpoint = 768
) => {
  const [targetWidth, setTargetWidth] = useState(() => {
    if (typeof window === 'undefined') return desktopWidth;
    return window.innerWidth < breakpoint ? mobileWidth : desktopWidth;
  });

  useEffect(() => {
    const handleResize = () => {
      const nextWidth =
        window.innerWidth < breakpoint ? mobileWidth : desktopWidth;
      setTargetWidth((prev) => (prev !== nextWidth ? nextWidth : prev));
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [desktopWidth, mobileWidth, breakpoint]);

  return targetWidth;
};

export default getImageKitUrl;