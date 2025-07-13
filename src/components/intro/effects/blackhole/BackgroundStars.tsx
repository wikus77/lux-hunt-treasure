
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface BackgroundStarsProps {
  stage: number;
}

const BackgroundStars: React.FC<BackgroundStarsProps> = ({ stage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Creiamo stelle di varie dimensioni e luminosità
  const smallStars = Array.from({ length: 100 }).map((_, i) => ({
    id: `small-star-${i}`,
    size: Math.random() * 1.5 + 0.5,
    posX: Math.random() * 100,
    posY: Math.random() * 100,
    opacity: Math.random() * 0.5 + 0.3,
    delay: Math.random() * 5,
    parallaxFactor: Math.random() * 0.5 + 0.5
  }));
  
  const mediumStars = Array.from({ length: 40 }).map((_, i) => ({
    id: `medium-star-${i}`,
    size: Math.random() * 1 + 1.5,
    posX: Math.random() * 100,
    posY: Math.random() * 100,
    opacity: Math.random() * 0.4 + 0.5,
    delay: Math.random() * 5,
    parallaxFactor: Math.random() * 0.3 + 0.7
  }));
  
  const brightStars = Array.from({ length: 15 }).map((_, i) => ({
    id: `bright-star-${i}`,
    size: Math.random() * 1 + 2,
    posX: Math.random() * 100,
    posY: Math.random() * 100,
    opacity: Math.random() * 0.2 + 0.7,
    delay: Math.random() * 5,
    parallaxFactor: Math.random() * 0.2 + 0.8
  }));
  
  const allStars = [...smallStars, ...mediumStars, ...brightStars];

  // Canvas per effetto distorsione
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrame: number;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    // Impostazioni del canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Gestione movimento mouse per distorsione gravitazionale
    const handleMouseMove = (e: MouseEvent) => {
      if (stage >= 4) return; // Disabilita l'effetto mouse negli stadi avanzati
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animazione effetto nebulosa
    const drawNebulaEffect = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Distorsione centrale verso il buco nero
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Sfondo stellare con effetto parallasse
      for (let i = 0; i < 200; i++) {
        const size = Math.random() * 1.5 + 0.5;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        
        // Calcola distanza dal centro
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        
        // Fattore di distorsione gravitazionale
        let distortionFactor = 0;
        
        if (stage >= 2) {
          distortionFactor = Math.max(0, 1 - (distance / maxDistance)) * 0.3;
        }
        
        // Parallasse mouse (solo stadi 0-3)
        let parallaxX = x;
        let parallaxY = y;
        
        if (stage < 4) {
          const mouseDistFactor = Math.max(0, 1 - (distance / (canvas.width * 0.5))) * 0.05;
          parallaxX += (mouseX - centerX) * mouseDistFactor;
          parallaxY += (mouseY - centerY) * mouseDistFactor;
        }
        
        // Effetto di schiaccio gravitazionale verso il centro
        let finalX = parallaxX;
        let finalY = parallaxY;
        
        if (distance < 300 && stage >= 1) {
          const angle = Math.atan2(dy, dx);
          const pull = Math.max(0, 1 - (distance / 300)) * (stage >= 3 ? 0.5 : 0.2);
          
          finalX -= Math.cos(angle) * distance * pull;
          finalY -= Math.sin(angle) * distance * pull;
        }
        
        // Disegna le stelle con effetto di dissolvenza in base allo stage
        let opacity = Math.random() * 0.7 + 0.3;
        
        if (stage >= 5) {
          // Dissolvenza in uscita
          opacity *= Math.max(0, 1 - ((stage - 5) * 0.5));
        }
        
        ctx.globalAlpha = opacity;
        ctx.fillStyle = distance < 150 && stage >= 3 ? 
          `hsl(${200 + Math.random() * 40}, 80%, 70%)` :
          `rgba(255, 255, 255, ${opacity})`;
        
        ctx.beginPath();
        ctx.arc(finalX, finalY, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Effetto nebulosa centrale con colori dinamici
      if (stage >= 1) {
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0, 
          centerX, centerY, 300 - stage * 30
        );
        
        const nebulaIntensity = Math.min(1, stage * 0.3);
        
        gradient.addColorStop(0, `rgba(0, 30, 60, ${0.2 * nebulaIntensity})`);
        gradient.addColorStop(0.4, `rgba(20, 30, 100, ${0.15 * nebulaIntensity})`);
        gradient.addColorStop(0.8, `rgba(5, 15, 45, ${0.1 * nebulaIntensity})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = stage >= 5 ? Math.max(0, 1 - ((stage - 5) * 0.5)) : 1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      animationFrame = requestAnimationFrame(drawNebulaEffect);
    };
    
    animationFrame = requestAnimationFrame(drawNebulaEffect);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, [stage]);

  return (
    <>
      {/* Canvas per effetti di distorsione avanzati */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 0
        }}
      />
      
      {/* Stelle con effetto twinkle e parallasse */}
      {allStars.map(star => (
        <motion.div
          key={star.id}
          animate={{
            opacity: [star.opacity, star.opacity + 0.2, star.opacity],
            scale: [1, 1.2, 1],
            x: stage < 4 ? [0, 2, -2, 0] : 0,
            y: stage < 4 ? [0, -2, 2, 0] : 0,
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: 'white',
            borderRadius: '50%',
            top: `${star.posY}%`,
            left: `${star.posX}%`,
            boxShadow: `0 0 ${star.size + 2}px rgba(255, 255, 255, ${star.opacity + 0.1})`,
            zIndex: 1,
            filter: stage >= 5 ? 'blur(1px)' : 'none',
            transform: `translateZ(${star.parallaxFactor * 10}px)`,
          }}
        />
      ))}
      
      {/* Stelle cadenti occasionali con trail */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`shooting-star-${i}`}
          style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            backgroundColor: 'white',
            borderRadius: '50%',
            zIndex: 2,
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(255, 255, 255, 0.5)',
          }}
          initial={{
            top: `${Math.random() * 50}%`,
            left: `${Math.random() * 30}%`,
            opacity: 0,
          }}
          animate={{
            top: [`${Math.random() * 50}%`, `${50 + Math.random() * 50}%`],
            left: [`${Math.random() * 30}%`, `${30 + Math.random() * 70}%`],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1.5,
            delay: 2 + i * 3 + Math.random() * 5,
            ease: "easeOut",
            times: [0, 0.1, 1],
            repeat: Infinity,
            repeatDelay: 10 + Math.random() * 15
          }}
        >
          {/* Scia della stella cadente */}
          <motion.div 
            style={{
              position: 'absolute',
              top: 0,
              right: '100%',
              width: `${20 + Math.random() * 30}px`,
              height: '1px',
              background: 'linear-gradient(to left, rgba(255,255,255,0.8), rgba(255,255,255,0))',
              transformOrigin: 'right center',
              transform: 'translateY(0.5px)'
            }}
          />
        </motion.div>
      ))}
      
      {/* Lens flare effect */}
      {stage >= 2 && stage < 5 && (
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(70,130,240,0.1) 0%, rgba(0,100,200,0.05) 40%, rgba(0,0,0,0) 70%)',
            transform: 'translate(-50%, -50%)',
            zIndex: 1
          }}
          animate={{
            opacity: [0.4, 0.6, 0.4],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </>
  );
};

export default BackgroundStars;
