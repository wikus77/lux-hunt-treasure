
import { useRef, useState, useCallback, useEffect } from "react";

// Definizione dei tipi
export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  angle: number;
  speed: number;
  distance: number;
  orbit: boolean;
  opacity: number;
  distortionFactor: number;
  trailLength: number;
  colorVariation: number;
}

// Genera un array di particelle con proprietà casuali
export const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => {
    const distance = Math.random() * 80 + 10; // Distanza dal centro
    const angle = Math.random() * Math.PI * 2; // Angolo iniziale casuale
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const orbit = Math.random() > 0.3; // Alcune particelle orbitano, altre vengono risucchiate
    
    return {
      id: i,
      x,
      y,
      size: Math.random() * 2 + 0.5,
      color: getParticleColor(),
      angle,
      speed: (Math.random() * 0.5 + 0.2) * (orbit ? 1 : 3),
      distance,
      orbit,
      opacity: Math.random() * 0.7 + 0.3,
      distortionFactor: Math.random() * 0.3 + 0.1,
      trailLength: Math.floor(Math.random() * 4) + 1,
      colorVariation: Math.random() * 0.2
    };
  });
};

// Colori per le particelle con effetto realistico
const getParticleColor = () => {
  const colors = [
    'rgb(100, 180, 255)', // Azzurro
    'rgb(150, 200, 255)', // Azzurro chiaro
    'rgb(120, 160, 240)', // Blu elettrico
    'rgb(200, 220, 255)', // Bianco-azzurro
    'rgb(70, 130, 230)'    // Blu neon
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Hook personalizzato per gestire l'animazione delle particelle
export const useParticleAnimation = (initialParticles: Particle[], stage: number, visible: boolean) => {
  const [currentParticles, setCurrentParticles] = useState<Particle[]>(initialParticles);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  // Funzione per aggiornare lo stato delle particelle
  const updateParticles = useCallback((customUpdate?: (particles: Particle[]) => Particle[]) => {
    if (customUpdate) {
      setCurrentParticles(prev => customUpdate(prev));
      return;
    }

    setCurrentParticles(prevParticles => {
      // Incrementa il contatore di frame
      frameCountRef.current += 1;
      
      return prevParticles.map(particle => {
        // Comportamento basato sullo stage dell'animazione
        if (stage >= 5) {
          // Stage finale: le particelle si disperdono verso l'esterno
          const newDistance = particle.distance + particle.speed * 0.5;
          const newAngle = particle.angle + 0.002 / (particle.distance * 0.1);
          const newX = Math.cos(newAngle) * newDistance;
          const newY = Math.sin(newAngle) * newDistance;
          
          return {
            ...particle,
            x: newX,
            y: newY,
            angle: newAngle,
            distance: newDistance,
            opacity: Math.max(0, particle.opacity - 0.01),
            size: Math.max(0.1, particle.size - 0.01)
          };
        } else if (stage >= 4) {
          // Stage di stabilizzazione: orbite più regolari
          const newAngle = particle.angle + (0.005 / (particle.distance * 0.2));
          const newDistance = particle.orbit 
            ? particle.distance + Math.sin(frameCountRef.current * 0.01 + particle.id) * 0.1
            : Math.max(5, particle.distance - 0.1);
            
          const newX = Math.cos(newAngle) * newDistance;
          const newY = Math.sin(newAngle) * newDistance;
          
          return {
            ...particle,
            x: newX,
            y: newY,
            angle: newAngle,
            distance: newDistance,
            opacity: particle.orbit ? particle.opacity : particle.opacity * 0.98
          };
        } else if (stage >= 3) {
          // Stage di implosione/esplosione
          // Alcune particelle vengono risucchiate, altre espulse
          const newAngle = particle.angle + (0.01 / (particle.distance * 0.1));
          let newDistance = particle.orbit 
            ? particle.distance * 1.015
            : Math.max(2, particle.distance * 0.97);
            
          // Dopo una certa distanza, anche le particelle in orbita vengono risucchiate
          if (particle.orbit && newDistance > 100) {
            newDistance *= 0.98;
          }
          
          const newX = Math.cos(newAngle) * newDistance;
          const newY = Math.sin(newAngle) * newDistance;
          
          const sizeChange = particle.orbit ? 1.01 : 0.98;
          
          return {
            ...particle,
            x: newX,
            y: newY,
            angle: newAngle,
            distance: newDistance,
            size: particle.size * sizeChange,
            opacity: particle.orbit ? particle.opacity * 1.01 : particle.opacity * 0.98
          };
        } else {
          // Stage iniziale: formazione del disco di accrezione
          const distortionStrength = 1 + (particle.distortionFactor * (Math.sin(frameCountRef.current * 0.05 + particle.id) * 0.5 + 0.5));
          const newAngle = particle.angle + (0.003 / (particle.distance * 0.1)) * distortionStrength;
          const newDistance = particle.orbit 
            ? particle.distance + Math.sin(frameCountRef.current * 0.02 + particle.id) * 0.2
            : Math.max(8, particle.distance - 0.1);
            
          const newX = Math.cos(newAngle) * newDistance;
          const newY = Math.sin(newAngle) * newDistance;
          
          const flickerEffect = 0.9 + Math.sin(frameCountRef.current * 0.1 + particle.id * 10) * 0.1;
          
          return {
            ...particle,
            x: newX,
            y: newY,
            angle: newAngle,
            distance: newDistance,
            opacity: particle.opacity * flickerEffect
          };
        }
      });
    });
  }, [stage]);

  // Timer per l'animazione
  useEffect(() => {
    if (!visible) return;

    const animateParticles = (timestamp: number) => {
      if (!lastTimeRef.current || timestamp - lastTimeRef.current > 16) {
        updateParticles();
        lastTimeRef.current = timestamp;
      }
    };

    const animationFrame = requestAnimationFrame(animateParticles);
    return () => cancelAnimationFrame(animationFrame);
  }, [updateParticles, visible]);

  return { currentParticles, updateParticles };
};

// Effetto di distorsione gravitazionale per testo e immagini
export const applyGravitationalLensing = (element: HTMLElement | null, strength: number = 1, centerX: number = 0.5, centerY: number = 0.5) => {
  if (!element) return;
  
  const rect = element.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  
  // Applica distorsione CSS
  element.style.transform = `perspective(1000px) rotateX(${Math.sin(centerY * Math.PI) * 5 * strength}deg) rotateY(${Math.sin(centerX * Math.PI) * 5 * strength}deg)`;
  
  // Applica sfocatura dinamica
  const distance = Math.sqrt(Math.pow(centerX - 0.5, 2) + Math.pow(centerY - 0.5, 2));
  element.style.filter = `blur(${distance * 2 * strength}px)`;
  
  // Effetto di allungamento più realistico con matrix3d
  if (strength > 0.7) {
    const stretchFactor = 1 + (distance * strength * 0.5);
    element.style.transform += ` matrix3d(
      ${stretchFactor}, 0, 0, 0,
      0, ${stretchFactor}, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    )`;
  }
};

// Effetto di dissoluzione tra stadi
export const useDissolveEffect = (currentStage: number, targetStage: number, duration: number = 1000) => {
  const [opacity, setOpacity] = useState(currentStage === targetStage ? 1 : 0);
  
  useEffect(() => {
    if (currentStage === targetStage) {
      const timer = setTimeout(() => {
        setOpacity(1);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setOpacity(0);
    }
  }, [currentStage, targetStage]);
  
  return {
    opacity,
    style: {
      opacity,
      transition: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
    }
  };
};
