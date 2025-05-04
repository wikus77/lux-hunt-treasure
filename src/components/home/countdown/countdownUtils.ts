
// Utility per il calcolo del tempo rimanente
export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Data target per il countdown (modificabile in base alle esigenze)
const TARGET_DATE = new Date('2025-05-31T00:00:00'); // Impostazione di default

// Funzione principale per calcolare il tempo rimanente
export function getTimeRemaining(): TimeRemaining {
  const now = new Date();
  const difference = TARGET_DATE.getTime() - now.getTime();
  
  // Se il countdown è terminato, ritorniamo tutti zeri
  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }
  
  // Calcoliamo i valori in modo corretto
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);
  
  return {
    days,
    hours,
    minutes,
    seconds
  };
}

// Verifica se il countdown è completato
export function isCountdownComplete(time: TimeRemaining): boolean {
  return time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;
}

// Funzione per configurare una nuova data target
export function setTargetDate(newDate: Date) {
  // In una implementazione reale, questa funzione potrebbe salvare la data nel localStorage
  // o in un database tramite API
  console.log("Nuova data impostata:", newDate);
}
