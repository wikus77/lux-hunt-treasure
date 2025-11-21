
import React, { useEffect, useRef } from "react";

const BackgroundParallax: React.FC = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrollPosition = window.scrollY;
        const elements = document.querySelectorAll('[data-parallax="scroll"]');
        
        elements.forEach((element) => {
          const speed = parseFloat(element.getAttribute('data-parallax-speed') || '0.5');
          const rect = element.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
          
          if (isVisible) {
            const yPos = Math.round((rect.top - window.innerHeight) * speed);
            (element as HTMLElement).style.backgroundPositionY = `${yPos}px`;
          }
        });
        
        // Apply parallax to background layers
        const layers = document.querySelectorAll('.parallax-layer');
        layers.forEach((layer) => {
          const speed = parseFloat(layer.getAttribute('data-speed') || '0.5');
          const yPos = scrollPosition * speed;
          (layer as HTMLElement).style.transform = `translateY(${yPos}px)`;
        });
      }
    };
    
    // Create parallax background elements
    if (parallaxRef.current) {
      // Create stars
      for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'absolute rounded-full bg-white opacity-70';
        star.style.width = `${Math.random() * 3 + 1}px`;
        star.style.height = star.style.width;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 150}%`;
        star.setAttribute('data-parallax', 'element');
        star.setAttribute('data-parallax-speed', (Math.random() * 0.3 + 0.2).toString());
        parallaxRef.current.appendChild(star);
      }
      
      // Create nebulas/glows
      for (let i = 0; i < 8; i++) {
        const nebula = document.createElement('div');
        nebula.className = 'absolute rounded-full opacity-10 z-0 pointer-events-none';
        nebula.style.width = `${Math.random() * 200 + 100}px`;
        nebula.style.height = nebula.style.width;
        nebula.style.background = i % 3 === 0 ? '#00E5FF' : i % 3 === 1 ? '#8A2BE2' : '#FF0080';
        nebula.style.left = `${Math.random() * 100}%`;
        nebula.style.top = `${Math.random() * 150}%`;
        nebula.style.filter = 'blur(70px)';
        nebula.setAttribute('data-parallax', 'element');
        nebula.setAttribute('data-parallax-speed', (Math.random() * 0.5 + 0.1).toString());
        parallaxRef.current.appendChild(nebula);
      }
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial positioning
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div 
      ref={parallaxRef} 
      className="fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="parallax-layer" data-speed="0.2">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black opacity-70"></div>
      </div>
      
      <div className="parallax-layer" data-speed="0.3">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
      </div>
    </div>
  );
};

export default BackgroundParallax;
