
import { Clue } from "@/data/cluesData";

// Interfaccia per la tipizzazione del risultato dell'analisi
interface LocationInfo {
  lat: number | null;
  lng: number | null;
  radius: number | null;
  confidence: "alta" | "media" | "bassa" | null;
  description: string | null;
}

// Database semplificato di località
const locationDatabase = {
  // Regioni italiane
  lombardia: { lat: 45.4773, lng: 9.1815, radius: 150000 },
  sicilia: { lat: 37.5873, lng: 14.1254, radius: 150000 },
  campania: { lat: 40.8518, lng: 14.2681, radius: 150000 },
  toscana: { lat: 43.7711, lng: 11.2486, radius: 150000 },
  
  // Città italiane principali
  milano: { lat: 45.4642, lng: 9.1900, radius: 50000 },
  roma: { lat: 41.9028, lng: 12.4964, radius: 50000 },
  napoli: { lat: 40.8518, lng: 14.2681, radius: 50000 },
  firenze: { lat: 43.7696, lng: 11.2558, radius: 50000 },
  torino: { lat: 45.0703, lng: 7.6869, radius: 50000 },
  palermo: { lat: 38.1157, lng: 13.3615, radius: 50000 },
  como: { lat: 45.8081, lng: 9.0852, radius: 25000 },
  catania: { lat: 37.5079, lng: 15.0830, radius: 30000 },
  
  // Punti di interesse specifici
  confinesvizzero: { lat: 45.8275, lng: 8.9727, radius: 70000 }, // Area di confine Italia-Svizzera
  nord: { lat: 46.0664, lng: 11.1242, radius: 200000 }, // Nord Italia generico
  sud: { lat: 40.0000, lng: 15.0000, radius: 200000 }, // Sud Italia generico
  est: { lat: 45.6495, lng: 13.7768, radius: 200000 }, // Est Italia (es. Trieste)
  ovest: { lat: 44.4056, lng: 8.9463, radius: 200000 } // Ovest Italia (es. Genova)
};

// Parole chiave e associazioni
const keywordAssociations: { [key: string]: string[] } = {
  sicilia: ["sicilia", "cannoli", "ricotta", "palermo", "catania", "isola", "etna", "trinacria"],
  napoli: ["napoli", "pulcinella", "pizza", "vesuvio", "campania", "golfo", "mare", "spaccanapoli", "stelle", "ruota"],
  como: ["como", "confine", "svizzera", "lago", "lombardia", "nord", "frontiera"],
  milano: ["milano", "madonnina", "duomo", "navigli", "lombardia", "moda", "design"],
  roma: ["roma", "colosseo", "vaticano", "tevere", "lazio", "capitale", "fori", "imperiali"],
  firenze: ["firenze", "toscana", "arno", "ponte vecchio", "duomo", "uffizi", "rinascimento"],
  nord: ["nord", "settentrionale", "alpi", "montagna", "freddo"],
  sud: ["sud", "meridionale", "mediterraneo", "caldo", "mare"]
};

// Trova corrispondenze tra indizi e iniziali di città
function matchInitialLetter(text: string, letter: string): string | null {
  const cities = [
    { name: "Como", letter: "C", location: "como" },
    { name: "Napoli", letter: "N", location: "napoli" },
    { name: "Milano", letter: "M", location: "milano" },
    { name: "Roma", letter: "R", location: "roma" },
    { name: "Palermo", letter: "P", location: "palermo" },
    { name: "Torino", letter: "T", location: "torino" },
    { name: "Firenze", letter: "F", location: "firenze" },
    { name: "Catania", letter: "C", location: "catania" },
  ];
  
  const matches = cities.filter(city => city.letter.toLowerCase() === letter.toLowerCase());
  
  // Se abbiamo una sola corrispondenza, facile
  if (matches.length === 1) return matches[0].location;
  
  // Se abbiamo più città con la stessa iniziale, controlliamo altre parole chiave
  if (matches.length > 1) {
    for (const match of matches) {
      const keywords = keywordAssociations[match.location];
      if (keywords) {
        for (const keyword of keywords) {
          if (text.toLowerCase().includes(keyword.toLowerCase())) {
            return match.location;
          }
        }
      }
    }
  }
  
  return null;
}

// Funzione per combinare indizi speciali
function combineSpecialClues(allTexts: string): LocationInfo | null {
  // Caso speciale: confine + città che inizia con C = Como
  if (
    (allTexts.includes("confine") || allTexts.includes("frontiera")) && 
    (allTexts.includes("inizia con c") || allTexts.includes("inizia per c"))
  ) {
    return {
      lat: locationDatabase.confinesvizzero.lat,
      lng: locationDatabase.confinesvizzero.lng,
      radius: 500000, // 500 km in metri
      confidence: "alta",
      description: "Zona di confine vicino Como"
    };
  }
  
  // Caso speciale: cannoli + ricotta = Sicilia
  if (allTexts.includes("cannoli") && allTexts.includes("ricotta")) {
    return {
      lat: locationDatabase.sicilia.lat,
      lng: locationDatabase.sicilia.lng,
      radius: 500000,
      confidence: "alta",
      description: "Sicilia, terra dei cannoli"
    };
  }
  
  // Caso speciale: pulcinella + mare + inizia con N = Napoli
  if ((allTexts.includes("pulcinella") || allTexts.includes("ruota")) && 
      allTexts.includes("mare") &&
      (allTexts.includes("inizia con n") || allTexts.includes("inizia per n"))
     ) {
    return {
      lat: locationDatabase.napoli.lat,
      lng: locationDatabase.napoli.lng,
      radius: 500000,
      confidence: "alta",
      description: "Napoli, la città di Pulcinella"
    };
  }
  
  // Cerca menzioni di città che iniziano con lettere specifiche
  const letterPatterns = [
    /inizia (?:con|per) ([a-z])/i,
    /lettera ([a-z])/i,
    /prima lettera ([a-z])/i
  ];
  
  for (const pattern of letterPatterns) {
    const match = allTexts.match(pattern);
    if (match && match[1]) {
      const letter = match[1];
      const cityLocation = matchInitialLetter(allTexts, letter);
      if (cityLocation && locationDatabase[cityLocation]) {
        const location = locationDatabase[cityLocation];
        return {
          lat: location.lat,
          lng: location.lng,
          radius: 500000,
          confidence: "alta",
          description: `Area basata sulla città che inizia con ${letter.toUpperCase()}`
        };
      }
    }
  }
  
  return null;
}

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
  
  // Prima controlliamo per combinazioni speciali di indizi
  const specialLocation = combineSpecialClues(allTexts);
  if (specialLocation) return specialLocation;
  
  // Cerca corrispondenze per ogni località nel database
  let bestMatch: { location: string, score: number } | null = null;
  let highestScore = 0;
  
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
      radius: 500000, // 500 km in metri
      confidence,
      description: `Area identificata in base agli indizi: ${bestMatch.location}`
    };
  }
  
  // Fallback: se non ci sono abbastanza indizi, restituiamo una località generica al centro dell'Italia
  return {
    lat: 42.5047,
    lng: 12.5679,
    radius: 500000, // 500 km come richiesto
    confidence: "bassa",
    description: "Posizione generica basata su informazioni limitate"
  };
}
