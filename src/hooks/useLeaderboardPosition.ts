
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";

interface LeaderboardPosition {
  currentRank: number;
  previousRank: number | null;
  isRising: boolean;
  isFalling: boolean;
  isNew: boolean;
  isInTop10: boolean;
  isInTop100: boolean;
  rankChange: number;
}

export const useLeaderboardPosition = (userId?: string) => {
  const [position, setPosition] = useState<LeaderboardPosition>({
    currentRank: 0,
    previousRank: null,
    isRising: false,
    isFalling: false,
    isNew: false,
    isInTop10: false,
    isInTop100: false,
    rankChange: 0
  });
  
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  
  useEffect(() => {
    // In una implementazione reale, dovresti recuperare i dati dalle API
    // Qui simuliamo il comportamento
    const fetchPositionData = () => {
      // Simuliamo la posizione precedente e attuale
      const currentRank = Math.floor(Math.random() * 120) + 1; // 1-120
      const wasInLeaderboard = Math.random() > 0.3; // 70% probabilità di essere già in classifica
      
      // Se era già in leaderboard, simula una posizione precedente
      const previousRank = wasInLeaderboard ? currentRank + Math.floor(Math.random() * 10) - 5 : null;
      
      // Nuova posizione
      const newPosition: LeaderboardPosition = {
        currentRank,
        previousRank,
        isRising: previousRank !== null && currentRank < previousRank,
        isFalling: previousRank !== null && currentRank > previousRank,
        isNew: previousRank === null,
        isInTop10: currentRank <= 10,
        isInTop100: currentRank <= 100,
        rankChange: previousRank !== null ? previousRank - currentRank : 0
      };
      
      setPosition(newPosition);
      
      // Notifiche per cambiamenti di posizione
      if (newPosition.isNew && newPosition.isInTop100) {
        addNotification({
          title: "🏆 Complimenti!",
          description: "Sei entrato nella classifica dei top 100!"
        });
      } else if (newPosition.isRising && newPosition.rankChange > 0) {
        addNotification({
          title: "📈 Movimento in classifica",
          description: `Hai guadagnato +${newPosition.rankChange} posizioni!`
        });
        
        if (newPosition.isInTop10 && !wasInLeaderboard) {
          setTimeout(() => {
            toast({
              title: "🌟 Wow! Sei nella TOP 10!",
              description: "Un traguardo incredibile! Continua così!",
              className: "bg-gradient-to-r from-projectx-blue to-purple-600 border-0"
            });
          }, 500);
        }
      } else if (newPosition.isFalling && newPosition.rankChange < 0) {
        addNotification({
          title: "📉 Movimento in classifica",
          description: `Hai perso ${Math.abs(newPosition.rankChange)} posizioni.`
        });
      }
    };
    
    fetchPositionData();
    
    // Aggiornamento periodico simulato (ogni 30 secondi in un'app reale)
    const interval = setInterval(fetchPositionData, 30000);
    return () => clearInterval(interval);
  }, [userId]);
  
  return position;
};
