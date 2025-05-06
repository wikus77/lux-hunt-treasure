
import React, { useEffect, useRef, ReactNode } from 'react';

interface ParallaxContainerProps {
  children: ReactNode;
}

const ParallaxContainer: React.FC<ParallaxContainerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Simplified parallax effect to ensure stability
    const handleScroll = () => {
      const scrollY = window.scrollY;
      document.documentElement.style.setProperty('--scrollY', scrollY.toString());
      
      // Find elements with parallax attribute and apply effect
      const elements = document.querySelectorAll('[data-parallax]');
      elements.forEach((element: Element) => {
        const speed = parseFloat((element as HTMLElement).getAttribute('data-parallax-speed') || '0');
        const type = (element as HTMLElement).getAttribute('data-parallax');
        
        if (type && speed) {
          const yPos = scrollY * speed;
          (element as HTMLElement).style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
      });
    };
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Execute once to position elements correctly on initial load
    setTimeout(() => {
      handleScroll();
    }, 100);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="relative overflow-x-hidden min-h-screen"
    >
      {children}
    </div>
  );
};

export default ParallaxContainer;
