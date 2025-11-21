
"use client";

import { useState, useEffect, useRef, RefObject } from "react";

interface UseIntersectionObserverProps {
  threshold?: number | number[];
  rootMargin?: string;
  once?: boolean;
  rootRef?: RefObject<HTMLElement>;
}

export function useIntersectionObserver({
  threshold = 0.2,
  rootMargin = "0px",
  once = true,
  rootRef,
}: UseIntersectionObserverProps = {}) {
  const [isIntersecting, setIntersecting] = useState<boolean>(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const currentElement = elementRef.current;
    if (!currentElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          
          // If once is true, disconnect after first intersection
          if (once && observerRef.current) {
            observerRef.current.disconnect();
          }
        } else if (!once) {
          setIntersecting(false);
        }
      },
      {
        root: rootRef ? rootRef.current : null,
        rootMargin,
        threshold,
      }
    );
    
    observerRef.current = observer;
    observer.observe(currentElement);
    
    return () => {
      if (observerRef.current && currentElement) {
        observerRef.current.unobserve(currentElement);
        observerRef.current.disconnect();
      }
    };
  }, [rootMargin, threshold, once, rootRef]);

  return { elementRef, isIntersecting };
}
