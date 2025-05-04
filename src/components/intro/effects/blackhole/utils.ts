
import { useCallback, useState } from "react";

// Tipi di particelle
export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  angle: number;
  distance: number;
}

// Funzione helper per generare particelle avanzate per l'effetto buco nero
export const generateParticles = (count: number = 300): Particle[] => {
  return Array.from({ length: count }, (_, i) => {
    // Generiamo pattern più realistici per le particelle
    const distance = Math.random() < 0.2 
      ? 15 + Math.random() * 15  // Particelle interne
      : 30 + Math.random() * 25; // Particelle esterne
    const angle = Math.random() * Math.PI * 2;
    
    // Varianza nelle dimensioni delle particelle
    const size = Math.random() < 0.1 
      ? 1.5 + Math.random() * 1.5  // Particelle grandi (più rare)
      : 0.8 + Math.random() * 1.2; // Particelle normali
    
    // Colori più realistici per simulare temperatura e composizione
    const blueValue = Math.floor(128 + Math.random() * 127);
    const greenValue = Math.floor(180 + Math.random() * 75);
    
    // Aggiungiamo varietà di colori: più blu/cyan per particelle fredde, 
    // più bianche/viola per le particelle calde
    let color;
    if (Math.random() < 0.15) {
      // Particelle viola/bianche (più calde)
      const purpleValue = Math.floor(100 + Math.random() * 155);
      color = `rgb(${purpleValue}, ${greenValue * 0.7}, 255)`;
    } else if (Math.random() < 0.3) {
      // Particelle bianche
      const whiteValue = Math.floor(200 + Math.random() * 55);
      color = `rgb(${whiteValue}, ${whiteValue}, 255)`;
    } else {
      // Particelle blu/ciano (più fredde)
      color = `rgb(${blueValue > 200 ? blueValue : 50}, ${greenValue}, 255)`;
    }
    
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size,
      color,
      speed: 0.01 + Math.random() * 0.04, // Velocità variabile
      angle,
      distance
    };
  });
};

// Hook personalizzato per l'animazione delle particelle basata sulla fase
export const useParticleAnimation = (
  particles: Particle[], 
  stage: number, 
  visible: boolean
) => {
  const [currentParticles, setCurrentParticles] = useState<Particle[]>(particles);
  
  const updateParticles = useCallback((customUpdateFn?: (particles: Particle[]) => Particle[]) => {
    setCurrentParticles(prevParticles => {
      // Se viene fornita una funzione di aggiornamento personalizzata, usala
      if (customUpdateFn) {
        return customUpdateFn(prevParticles);
      }
      
      // Comportamenti diversi in base alla fase di animazione
      return prevParticles.map(particle => {
        // Comportamenti di fase
        if (stage === 2) {
          // Effetto di orbita con velocità diverse in base alla dimensione della particella
          const speedFactor = 0.5 * (1 / (particle.size * 0.8));
          const newAngle = particle.angle + particle.speed * speedFactor;
          
          // Fattore di spirale che varia per particelle di dimensioni diverse
          const spiralFactor = Math.min(0.999, 0.997 + (particle.size * 0.001));
          
          return {
            ...particle,
            angle: newAngle,
            distance: particle.distance * spiralFactor,
            x: Math.cos(newAngle) * particle.distance * spiralFactor,
            y: Math.sin(newAngle) * particle.distance * spiralFactor
          };
        } 
        else if (stage === 3) {
          // Effetto di implosione più veloce per particelle grandi
          const attractFactor = 0.97 - (particle.size * 0.01);
          
          // Aggiungiamo accelerazione durante l'implosione
          const speedIncrease = 1.005;
          
          return {
            ...particle,
            angle: particle.angle + particle.speed * 1.2,
            speed: particle.speed * speedIncrease,
            distance: particle.distance * attractFactor,
            x: particle.x * attractFactor,
            y: particle.y * attractFactor
          };
        } 
        else if (stage >= 4) {
          // Effetto di esplosione più drammatico con traiettorie caotiche
          const explodeFactor = 1.015 + (Math.random() * 0.004);
          
          // Introduciamo un leggero movimento casuale
          const chaosX = Math.random() * 0.4 - 0.2;
          const chaosY = Math.random() * 0.4 - 0.2;
          
          return {
            ...particle,
            angle: particle.angle + particle.speed * 0.3,
            distance: particle.distance * explodeFactor,
            x: particle.x * explodeFactor + chaosX,
            y: particle.y * explodeFactor + chaosY
          };
        }
        
        // Rotazione standard nelle fasi iniziali, con leggere variazioni
        const newAngle = particle.angle + particle.speed * 0.2;
        const pulseFactor = 1 + Math.sin(Date.now() * 0.001 + particle.id * 0.1) * 0.01;
        
        return {
          ...particle,
          angle: newAngle,
          x: Math.cos(newAngle) * particle.distance * pulseFactor,
          y: Math.sin(newAngle) * particle.distance * pulseFactor
        };
      });
    });
  }, [stage]);
  
  return { currentParticles, updateParticles };
};
