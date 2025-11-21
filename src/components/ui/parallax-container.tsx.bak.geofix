
import React, { useEffect, useRef, ReactNode } from 'react';

interface ParallaxContainerProps {
  children: ReactNode;
}

const ParallaxContainer: React.FC<ParallaxContainerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const parallaxLayers = useRef<HTMLElement[]>([]);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Find all elements with data-parallax attribute
    const layers = Array.from(document.querySelectorAll('[data-parallax]')) as HTMLElement[];
    parallaxLayers.current = layers;
    
    // Create background parallax elements
    const createParallaxEffects = () => {
      // Add some random floating elements for enhanced visual effect
      for (let i = 0; i < 8; i++) {
        const floater = document.createElement('div');
        floater.className = 'absolute rounded-full opacity-10 z-0 pointer-events-none';
        floater.style.width = `${Math.random() * 200 + 50}px`;
        floater.style.height = `${Math.random() * 200 + 50}px`;
        floater.style.background = i % 3 === 0 ? '#00E5FF' : i % 3 === 1 ? '#8A2BE2' : '#FF0080';
        floater.style.left = `${Math.random() * 100}%`;
        floater.style.top = `${Math.random() * 200}%`;
        floater.style.filter = 'blur(70px)';
        floater.setAttribute('data-parallax', 'floater');
        floater.setAttribute('data-parallax-speed', (-0.2 - Math.random() * 0.2).toString());
        
        if (containerRef.current) {
          containerRef.current.appendChild(floater);
        }
      }
    };
    
    createParallaxEffects();
    
    // Update all layers with parallax effect
    const updateParallaxLayers = () => {
      const scrollY = window.scrollY;
      
      // Store the scroll position as a CSS variable
      document.documentElement.style.setProperty('--scrollY', scrollY.toString());
      
      parallaxLayers.current.forEach(layer => {
        const speed = parseFloat(layer.getAttribute('data-parallax-speed') || '-0.2');
        const type = layer.getAttribute('data-parallax');
        
        if (type === 'background' || type === 'floater') {
          // Apply parallax to background elements
          const yPos = scrollY * speed;
          layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
        } else if (type === 'scroll') {
          // For content with parallax scroll effect
          const rect = layer.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          const viewportHeight = window.innerHeight;
          const fromCenter = centerY - viewportHeight / 2;
          const yPos = fromCenter * speed * 0.2;
          
          layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
      });
    };
    
    // Initial update
    updateParallaxLayers();
    
    // Add scroll listener
    window.addEventListener('scroll', updateParallaxLayers);
    
    // Add resize listener to recalculate positions
    window.addEventListener('resize', updateParallaxLayers);
    
    return () => {
      window.removeEventListener('scroll', updateParallaxLayers);
      window.removeEventListener('resize', updateParallaxLayers);
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
