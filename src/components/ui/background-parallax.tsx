
import React, { useEffect, useRef } from "react";

const BackgroundParallax: React.FC = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!parallaxRef.current) return;
    
    // Simplified event handler for better performance and reliability
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Apply parallax to background layers with better performance
      const layers = document.querySelectorAll('.parallax-layer');
      layers.forEach((layer) => {
        const speed = parseFloat(layer.getAttribute('data-speed') || '0.5');
        const yPos = scrollPosition * speed;
        (layer as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
    };
    
    // Create minimal stars for background effect
    if (parallaxRef.current) {
      // Clear existing children to prevent duplication
      while (parallaxRef.current.firstChild) {
        parallaxRef.current.removeChild(parallaxRef.current.firstChild);
      }
      
      // Create base layers
      const layer1 = document.createElement('div');
      layer1.className = 'parallax-layer';
      layer1.setAttribute('data-speed', '0.2');
      layer1.innerHTML = '<div class="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black opacity-70"></div>';
      parallaxRef.current.appendChild(layer1);
      
      const layer2 = document.createElement('div');
      layer2.className = 'parallax-layer';
      layer2.setAttribute('data-speed', '0.3');
      layer2.innerHTML = '<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>';
      parallaxRef.current.appendChild(layer2);
      
      // Add minimal stars (reduced quantity for better performance)
      for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = 'absolute rounded-full bg-white opacity-70';
        star.style.width = `${Math.random() * 3 + 1}px`;
        star.style.height = star.style.width;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 150}%`;
        parallaxRef.current.appendChild(star);
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
      className="fixed inset-0 -z-10 overflow-hidden bg-black"
    >
      {/* Layers are added dynamically in useEffect */}
    </div>
  );
};

export default BackgroundParallax;
