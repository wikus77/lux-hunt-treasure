
import { Clue } from "@/data/cluesData";

// Interfaccia per la tipizzazione del risultato dell'analisi
interface LocationInfo {
  lat: number | null;
  lng: number | null;
  confidence: "alta" | "media" | "bassa" | null;
  description: string | null;
}

// Database semplificato di località
const locationDatabase = {
  // Regioni italiane
  lombardia: { lat: 45.4773, lng: 9.1815, radius: 150 },
  sicilia: { lat: 37.5873, lng: 14.1254, radius: 150 },
  campania: { lat: 40.8518, lng: 14.2681, radius: 150 },
  toscana: { lat: 43.7711, lng: 11.2486, radius: 150 },
  
  // Città italiane principali
  milano: { lat: 45.4642, lng: 9.1900, radius: 50 },
  roma: { lat: 41.9028, lng: 12.4964, radius: 50 },
  napoli: { lat: 40.8518, lng: 14.2681, radius: 50 },
  firenze: { lat: 43.7696, lng: 11.2558, radius: 50 },
  torino: { lat: 45.0703, lng: 7.6869, radius: 50 },
  palermo: { lat: 38.1157, lng: 13.3615, radius: 50 },
  como: { lat: 45.8081, lng: 9.0852, radius: 25 },
  catania: { lat: 37.5079, lng: 15.0830, radius: 30 },
  
  // Punti di interesse generici
  confinesvizzero: { lat: 45.8275, lng: 8.9727, radius: 70 }, // Area di confine Italia-Svizzera
  nord: { lat: 46.0664, lng: 11.1242, radius: 200 }, // Nord Italia generico
  sud: { lat: 40.0000, lng: 15.0000, radius: 200 }, // Sud Italia generico
  est: { lat: 45.6495, lng: 13.7768, radius: 200 }, // Est Italia (es. Trieste)
  ovest: { lat: 44.4056, lng: 8.9463, radius: 200 } // Ovest Italia (es. Genova)
};

// Parole chiave e associazioni
const keywordAssociations: { [key: string]: string[] } = {
  sicilia: ["sicilia", "cannoli", "ricotta", "palermo", "catania", "isola", "etna", "trinacria"],
  napoli: ["napoli", "pulcinella", "pizza", "vesuvio", "campania", "golfo", "mare", "spaccanapoli"],
  como: ["como", "confine", "svizzera", "lago", "lombardia", "nord", "frontiera"],
  milano: ["milano", "madonnina", "duomo", "navigli", "lombardia", "moda", "design"],
  roma: ["roma", "colosseo", "vaticano", "tevere", "lazio", "capitale", "fori", "imperiali"],
  firenze: ["firenze", "toscana", "arno", "ponte vecchio", "duomo", "uffizi", "rinascimento"],
  nord: ["nord", "settentrionale", "alpi", "montagna", "freddo"],
  sud: ["sud", "meridionale", "mediterraneo", "caldo", "mare"]
};

// La funzione principale che analizza gli indizi e determina la posizione
export function analyzeCluesForLocation(clues: Clue[], notifications: any[]): LocationInfo {
  // Estraiamo tutte le descrizioni dagli indizi sbloccati
  const clueTexts = clues
    .filter(clue => !clue.isLocked)
    .map(clue => clue.description.toLowerCase());
  
  // Estraiamo tutte le descrizioni dalle notifiche
  const notificationTexts = notifications.map(n => n.description?.toLowerCase() || "");
  
  // Combiniamo tutti i testi per l'analisi
  const allTexts = [...clueTexts, ...notificationTexts].join(" ");
  
  // Prima cerchiamo corrispondenze dirette di città o regioni
  let bestMatch: { location: string, score: number } | null = null;
  let highestScore = 0;
  
  // Cerca corrispondenze per ogni località nel database
  Object.keys(locationDatabase).forEach(location => {
    // Calcola un punteggio basato su quante volte appare o quante parole chiave associate sono presenti
    let score = 0;
    
    // Controlla per menzioni dirette della località
    const regex = new RegExp(location, 'gi');
    const matches = allTexts.match(regex);
    if (matches) {
      score += matches.length * 10; // Più punti per corrispondenze dirette
    }
    
    // Controlla per parole chiave associate
    if (keywordAssociations[location]) {
      keywordAssociations[location].forEach(keyword => {
        const keywordRegex = new RegExp(keyword, 'gi');
        const keywordMatches = allTexts.match(keywordRegex);
        if (keywordMatches) {
          score += keywordMatches.length * 5; // Punti per parole chiave
        }
      });
    }
    
    // Aggiorna il miglior match se questo ha un punteggio più alto
    if (score > highestScore) {
      highestScore = score;
      bestMatch = { location, score };
    }
  });
  
  // Alcune logiche speciali per indizi particolari
  if (allTexts.includes("confine") && allTexts.includes("c")) {
    return {
      lat: locationDatabase.confinesvizzero.lat,
      lng: locationDatabase.confinesvizzero.lng,
      confidence: "alta",
      description: "Zona di confine vicino Como"
    };
  }
  
  if (allTexts.includes("cannoli") && allTexts.includes("ricotta")) {
    return {
      lat: locationDatabase.sicilia.lat,
      lng: locationDatabase.sicilia.lng,
      confidence: "alta",
      description: "Sicilia, terra dei cannoli"
    };
  }
  
  if ((allTexts.includes("pulcinella") || allTexts.includes("mare")) && allTexts.includes("n")) {
    return {
      lat: locationDatabase.napoli.lat,
      lng: locationDatabase.napoli.lng,
      confidence: "alta",
      description: "Napoli, la città di Pulcinella"
    };
  }
  
  // Se abbiamo un match con punteggio abbastanza alto
  if (bestMatch && highestScore > 10) {
    const location = locationDatabase[bestMatch.location];
    
    // Determina il livello di confidenza
    let confidence: "alta" | "media" | "bassa";
    if (highestScore > 30) confidence = "alta";
    else if (highestScore > 15) confidence = "media";
    else confidence = "bassa";
    
    return {
      lat: location.lat,
      lng: location.lng,
      confidence,
      description: `Area identificata in base agli indizi: ${bestMatch.location}`
    };
  }
  
  // Fallback: restituisci null se non ci sono abbastanza indizi
  return {
    lat: null,
    lng: null,
    confidence: null,
    description: null
  };
}
