import { useState, useEffect } from 'react';
import { luxuryCarsData } from '@/data/luxuryCarsData';
import { prizesData } from '@/data/prizesData';
import { gamesData } from '@/data/gamesData';

export const useHomeState = () => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [countdown, setCountdown] = useState('');
  const [missionProgress, setMissionProgress] = useState(67);

  // Calcola countdown fino a fine settimana
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const endOfWeek = new Date();
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);

      const diff = endOfWeek.getTime() - now.getTime();
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setCountdown(`${days}g ${hours}h ${minutes}m`);
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000); // Aggiorna ogni minuto

    return () => clearInterval(interval);
  }, []);

  // Simula aggiornamento progresso missione
  useEffect(() => {
    const interval = setInterval(() => {
      setMissionProgress(prev => {
        const newProgress = prev + Math.random() * 2;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 30000); // Aggiorna ogni 30 secondi

    return () => clearInterval(interval);
  }, []);

  return {
    currentWeek,
    countdown,
    missionProgress,
    cars: luxuryCarsData,
    prizes: prizesData,
    games: gamesData
  };
};