
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type ClueGenRequest = {
  prizeId: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
};

type ClueData = {
  week: number;
  title_it: string;
  title_en: string;
  title_fr: string;
  description_it: string;
  description_en: string;
  description_fr: string;
};

serve(async (req) => {
  // Enable CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });
  }
  
  try {
    const { prizeId, city, address, lat, lng } = await req.json() as ClueGenRequest;
    
    if (!prizeId || !city) {
      return new Response(
        JSON.stringify({ error: "Prize ID and city are required" }),
        { 
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        }
      );
    }

    // Generate clues for weeks 1-4
    const clues: ClueData[] = generateClues(city, address, lat, lng);
    
    return new Response(
      JSON.stringify({ clues }),
      { 
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        }
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": "*",
        }
      }
    );
  }
});

function generateClues(city: string, address: string, lat: number, lng: number): ClueData[] {
  // Split Italy into regions for week 3 hints
  const regions: Record<string, string[]> = {
    "Nord Italia": ["Milano", "Torino", "Genova", "Bologna", "Venezia", "Verona", "Trento", "Bolzano"],
    "Centro Italia": ["Roma", "Firenze", "Perugia", "Ancona", "Pescara"],
    "Sud Italia": ["Napoli", "Bari", "Potenza", "Catanzaro", "Reggio Calabria", "Palermo", "Cagliari"]
  };
  
  // Determine region based on city
  let cityRegion = "Italia";
  for (const [region, cities] of Object.entries(regions)) {
    if (cities.includes(city)) {
      cityRegion = region;
      break;
    }
  }
  
  return [
    {
      week: 1,
      title_it: "Primo indizio misterioso",
      title_en: "First mysterious clue",
      title_fr: "Premier indice mystérieux",
      description_it: `Un premio prestigioso ti aspetta da qualche parte in Italia. Tieniti pronto per l'avventura!`,
      description_en: `A prestigious prize awaits you somewhere in Italy. Get ready for the adventure!`,
      description_fr: `Un prix prestigieux vous attend quelque part en Italie. Préparez-vous pour l'aventure!`
    },
    {
      week: 2,
      title_it: "Secondo indizio",
      title_en: "Second clue",
      title_fr: "Deuxième indice",
      description_it: `Il premio si trova in una zona famosa per la sua bellezza e storia. Continua a seguire gli indizi nelle prossime settimane.`,
      description_en: `The prize is located in an area famous for its beauty and history. Keep following the clues in the coming weeks.`,
      description_fr: `Le prix se trouve dans une région connue pour sa beauté et son histoire. Continuez à suivre les indices dans les semaines à venir.`
    },
    {
      week: 3,
      title_it: `Terzo indizio: ${cityRegion}`,
      title_en: `Third clue: ${cityRegion}`,
      title_fr: `Troisième indice: ${cityRegion}`,
      description_it: `Il premio si trova nel ${cityRegion}, un'area che offre tesori nascosti e paesaggi mozzafiato.`,
      description_en: `The prize is located in ${cityRegion}, an area offering hidden treasures and breathtaking landscapes.`,
      description_fr: `Le prix est situé dans ${cityRegion}, une région qui offre des trésors cachés et des paysages à couper le souffle.`
    },
    {
      week: 4,
      title_it: `Indizio finale: ${city}`,
      title_en: `Final clue: ${city}`,
      title_fr: `Indice final: ${city}`,
      description_it: `Il premio si trova a ${city}! Esplora questa affascinante città per trovare il nostro tesoro nascosto.`,
      description_en: `The prize is in ${city}! Explore this fascinating city to find our hidden treasure.`,
      description_fr: `Le prix est à ${city}! Explorez cette ville fascinante pour trouver notre trésor caché.`
    }
  ];
}
