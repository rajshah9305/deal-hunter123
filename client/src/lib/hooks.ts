import { useState, useEffect } from 'react';

/**
 * Custom hook for detecting if the screen size is mobile
 * @param breakpoint The pixel width to consider as mobile (default: 768)
 * @returns Boolean indicating if viewport is mobile width
 */
export function useMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Custom hook for animations based on scroll position
 * @param threshold The threshold for triggering the animation (default: 0.1)
 * @returns The ref to attach to the element and a boolean indicating if it's in view
 */
export function useScrollAnimation(threshold = 0.1) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return { ref, isInView };
}

// Add the missing import for useRef
import { useRef } from 'react';
