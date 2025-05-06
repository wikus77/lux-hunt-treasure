
import React, { useRef, useEffect, ReactNode } from 'react';

interface ParallaxContainerProps {
  children: ReactNode;
  sensitivity?: number;
}

const ParallaxContainer: React.FC<ParallaxContainerProps> = ({ 
  children, 
  sensitivity = 1.0 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const parallaxElements = container.querySelectorAll('[data-parallax]');
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      parallaxElements.forEach((element) => {
        const el = element as HTMLElement;
        const type = el.getAttribute('data-parallax');
        const speed = parseFloat(el.getAttribute('data-parallax-speed') || '0') * sensitivity;
        
        if (type === 'background') {
          // Background elements move in opposite direction
          const yPos = scrollY * speed;
          el.style.transform = `translate3d(0, ${yPos}px, 0)`;
        } else if (type === 'card') {
          // Card elements move slightly
          const rect = el.getBoundingClientRect();
          const elementY = rect.top + scrollY;
          const offset = (scrollY - elementY) * speed * 0.1;
          el.style.transform = `translate3d(0, ${offset}px, 0)`;
        } else if (type === 'scroll') {
          // Elements that move as they enter viewport
          const rect = el.getBoundingClientRect();
          const elementY = rect.top + scrollY;
          const windowHeight = window.innerHeight;
          const distanceFromBottom = windowHeight - rect.top;
          
          if (distanceFromBottom > 0 && rect.bottom > 0) {
            const scrollPercent = distanceFromBottom / (windowHeight + rect.height);
            const offset = (1 - scrollPercent) * speed * 100;
            el.style.transform = `translate3d(0, ${offset}px, 0)`;
          }
        } else if (type === 'element') {
          // Simple elements that move with scroll
          const yPos = scrollY * speed;
          el.style.transform = `translate3d(0, ${yPos}px, 0)`;
        } else if (type === 'section') {
          // Section background parallax effect
          const rect = el.getBoundingClientRect();
          const elementY = rect.top + scrollY;
          const relativeY = scrollY - elementY;
          const sectionHeight = el.offsetHeight;
          
          // Only apply effect when section is in viewport
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            // Get all data-parallax="background" within this section
            const bgElements = el.querySelectorAll('[data-parallax="background"]');
            bgElements.forEach((bgEl) => {
              const bgSpeed = parseFloat((bgEl as HTMLElement).getAttribute('data-parallax-speed') || '0') * sensitivity;
              const yPos = relativeY * bgSpeed;
              (bgEl as HTMLElement).style.transform = `translate3d(0, ${yPos}px, 0)`;
            });
          }
        }
      });
    };

    // Initial call to position elements
    handleScroll();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sensitivity]);

  return (
    <div ref={containerRef} className="parallax-container">
      {children}
    </div>
  );
};

export default ParallaxContainer;
