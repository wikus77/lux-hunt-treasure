
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
    
    // Create background layers for parallax effect
    const createParallaxBg = () => {
      const sections = document.querySelectorAll('section');
      sections.forEach((section, index) => {
        if (!section.getAttribute('data-parallax-bg')) {
          const bgLayer = document.createElement('div');
          bgLayer.className = 'absolute inset-0 z-0';
          bgLayer.style.background = `radial-gradient(circle at 50% ${50 + (index % 3) * 10}%, rgba(0,229,255,0.${index % 3 + 1}) 0%, transparent ${20 + (index % 4) * 10}%)`;
          bgLayer.setAttribute('data-parallax', 'background');
          bgLayer.setAttribute('data-parallax-speed', (-0.3 - (index % 4) * 0.1).toString());
          section.setAttribute('data-parallax-bg', 'true');
          section.style.position = 'relative';
          section.style.overflow = 'hidden';
          section.insertBefore(bgLayer, section.firstChild);
        }
      });
      
      // Add additional floating elements
      for (let i = 0; i < 15; i++) {
        const floater = document.createElement('div');
        floater.className = 'absolute rounded-full opacity-10 z-0';
        floater.style.width = `${Math.random() * 300 + 50}px`;
        floater.style.height = `${Math.random() * 300 + 50}px`;
        floater.style.background = i % 3 === 0 ? '#00E5FF' : i % 3 === 1 ? '#8A2BE2' : '#FF0080';
        floater.style.left = `${Math.random() * 100}%`;
        floater.style.top = `${Math.random() * 200}%`;
        floater.style.filter = 'blur(40px)';
        floater.setAttribute('data-parallax', 'floater');
        floater.setAttribute('data-parallax-speed', (-0.4 - Math.random() * 0.4).toString());
        containerRef.current.appendChild(floater);
      }
    };
    
    createParallaxBg();
    
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
        } else if (type === 'scale-on-scroll') {
          // Scale effect based on scroll position
          const rect = layer.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const scrollPercentage = 1 - (rect.top / window.innerHeight);
            const scale = 1 + scrollPercentage * 0.1; // Max 10% scale
            layer.style.transform = `scale(${scale})`;
          }
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
