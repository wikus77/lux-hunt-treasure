
import { useState, useEffect, RefObject, useRef } from 'react';

interface UseLazyLoadProps {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

export function useLazyLoad({
  rootMargin = '200px 0px',
  threshold = 0.01,
  triggerOnce = true
}: UseLazyLoadProps = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const currentElement = elementRef.current;
    if (!currentElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        
        if (isIntersecting) {
          setIsVisible(true);
          setHasBeenVisible(true);
          
          if (triggerOnce) {
            observer.unobserve(currentElement);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(currentElement);

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [rootMargin, threshold, triggerOnce]);

  // Only return isVisible if it hasn't been visible before or if triggerOnce is false
  const shouldShow = triggerOnce ? hasBeenVisible : isVisible;

  return { elementRef, isVisible: shouldShow, hasBeenVisible };
}

export default useLazyLoad;
