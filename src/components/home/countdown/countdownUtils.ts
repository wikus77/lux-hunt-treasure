
// Interfaccia per il tempo rimanente
export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Data di destinazione corretta per il countdown (primo giorno del mese prossimo)
export const getTargetDate = (): Date => {
  const now = new Date();
  // Imposta il target al primo giorno del mese prossimo
  return new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
};

// Funzione migliorata per calcolare il tempo rimanente
export const getTimeRemaining = (): TimeRemaining => {
  const now = new Date();
  const target = getTargetDate();
  const diff = Math.max(0, target.getTime() - now.getTime());
  
  // Calcola i valori di tempo rimanente
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  
  return { days, hours, minutes, seconds };
};

// Verifica se il countdown è completo
export const isCountdownComplete = (time: TimeRemaining): boolean => {
  return time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;
};

// Verifica se è l'ultimo minuto del countdown
export const isLastMinute = (time: TimeRemaining): boolean => {
  return time.days === 0 && time.hours === 0 && time.minutes === 0;
};
