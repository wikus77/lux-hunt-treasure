
import React, { useEffect, useRef, ReactNode } from 'react';

interface ParallaxContainerProps {
  children: ReactNode;
}

const ParallaxContainer: React.FC<ParallaxContainerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Find all elements with data-parallax attribute
    const parallaxLayers = Array.from(document.querySelectorAll('[data-parallax]')) as HTMLElement[];
    
    // Create background layers for parallax effect
    const createParallaxBg = () => {
      const sections = document.querySelectorAll('section');
      sections.forEach((section, index) => {
        if (!section.getAttribute('data-parallax-bg')) {
          const bgLayer = document.createElement('div');
          bgLayer.className = 'absolute inset-0 z-0';
          bgLayer.style.background = `radial-gradient(circle at 50% ${50 + (index % 3) * 10}%, rgba(0,229,255,0.${index % 3 + 1}) 0%, transparent ${20 + (index % 4) * 10}%)`;
          bgLayer.setAttribute('data-parallax', 'background');
          bgLayer.setAttribute('data-parallax-speed', (-0.2 - (index % 3) * 0.1).toString());
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
        floater.setAttribute('data-parallax-speed', (-0.3 - Math.random() * 0.3).toString());
        containerRef.current.appendChild(floater);
      }
    };
    
    createParallaxBg();
    
    // Update all layers with parallax effect
    const updateParallaxLayers = () => {
      const scrollY = window.scrollY;
      
      parallaxLayers.forEach(layer => {
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
          const yPos = fromCenter * speed * 0.1;
          
          layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
        } else if (type === 'image') {
          // For images with parallax effect
          const containerRect = layer.parentElement?.getBoundingClientRect();
          if (containerRect) {
            const containerCenterY = containerRect.top + containerRect.height / 2;
            const viewportCenterY = window.innerHeight / 2;
            const offset = (containerCenterY - viewportCenterY) * speed * 0.15;
            
            layer.style.transform = `translate3d(0, ${offset}px, 0)`;
          }
        }
      });
    };
    
    // Initial update
    updateParallaxLayers();
    
    // Add scroll listener
    window.addEventListener('scroll', updateParallaxLayers);
    window.addEventListener('resize', updateParallaxLayers);
    
    // Add requestAnimationFrame to make animations smoother
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateParallaxLayers();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', updateParallaxLayers);
      window.removeEventListener('resize', updateParallaxLayers);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="relative overflow-x-hidden min-h-screen will-change-transform"
    >
      {children}
    </div>
  );
};

export default ParallaxContainer;
