
import { useState, useEffect } from "react";

interface City {
  name: string;
  lat: number;
  lng: number;
  region?: string;
  province?: string;
}

const italianCities: City[] = [
  // Capitals and major cities
  { name: "Roma", lat: 41.9028, lng: 12.4964, region: "Lazio" },
  { name: "Milano", lat: 45.4642, lng: 9.1900, region: "Lombardia" },
  { name: "Napoli", lat: 40.8518, lng: 14.2681, region: "Campania" },
  { name: "Torino", lat: 45.0703, lng: 7.6869, region: "Piemonte" },
  { name: "Palermo", lat: 38.1157, lng: 13.3615, region: "Sicilia" },
  { name: "Genova", lat: 44.4056, lng: 8.9463, region: "Liguria" },
  { name: "Bologna", lat: 44.4949, lng: 11.3426, region: "Emilia-Romagna" },
  { name: "Firenze", lat: 43.7696, lng: 11.2558, region: "Toscana" },
  { name: "Bari", lat: 41.1171, lng: 16.8719, region: "Puglia" },
  { name: "Catania", lat: 37.5079, lng: 15.0830, region: "Sicilia" },
  { name: "Venezia", lat: 45.4408, lng: 12.3155, region: "Veneto" },
  { name: "Verona", lat: 45.4384, lng: 10.9916, region: "Veneto" },
  { name: "Messina", lat: 38.1938, lng: 15.5540, region: "Sicilia" },
  { name: "Padova", lat: 45.4064, lng: 11.8768, region: "Veneto" },
  { name: "Trieste", lat: 45.6495, lng: 13.7768, region: "Friuli-Venezia Giulia" },
  { name: "Brescia", lat: 45.5416, lng: 10.2118, region: "Lombardia" },
  { name: "Prato", lat: 43.8777, lng: 11.1021, region: "Toscana" },
  { name: "Taranto", lat: 40.4738, lng: 17.2403, region: "Puglia" },
  { name: "Reggio Calabria", lat: 38.1089, lng: 15.6430, region: "Calabria" },
  { name: "Modena", lat: 44.6471, lng: 10.9252, region: "Emilia-Romagna" },
  { name: "Livorno", lat: 43.5485, lng: 10.3106, region: "Toscana" },
  { name: "Cagliari", lat: 39.2238, lng: 9.1217, region: "Sardegna" },
  { name: "Foggia", lat: 41.4622, lng: 15.5447, region: "Puglia" },
  { name: "Perugia", lat: 43.1107, lng: 12.3897, region: "Umbria" },
  { name: "Salerno", lat: 40.6824, lng: 14.7680, region: "Campania" },
  
  // Province capitals (that weren't already included)
  { name: "Agrigento", lat: 37.3094, lng: 13.5855, region: "Sicilia" },
  { name: "Alessandria", lat: 44.9127, lng: 8.6153, region: "Piemonte" },
  { name: "Ancona", lat: 43.6158, lng: 13.5189, region: "Marche" },
  { name: "Aosta", lat: 45.7371, lng: 7.3186, region: "Valle d'Aosta" },
  { name: "Arezzo", lat: 43.4628, lng: 11.8806, region: "Toscana" },
  { name: "Ascoli Piceno", lat: 42.8537, lng: 13.5747, region: "Marche" },
  { name: "Asti", lat: 44.9002, lng: 8.2064, region: "Piemonte" },
  { name: "Avellino", lat: 40.9146, lng: 14.7889, region: "Campania" },
  { name: "Barletta", lat: 41.3187, lng: 16.2692, region: "Puglia" },
  { name: "Belluno", lat: 46.1398, lng: 12.2166, region: "Veneto" },
  { name: "Benevento", lat: 41.1293, lng: 14.7825, region: "Campania" },
  { name: "Bergamo", lat: 45.6983, lng: 9.6772, region: "Lombardia" },
  { name: "Biella", lat: 45.5664, lng: 8.0530, region: "Piemonte" },
  { name: "Bolzano", lat: 46.4983, lng: 11.3548, region: "Trentino-Alto Adige" },
  { name: "Brindisi", lat: 40.6327, lng: 17.9418, region: "Puglia" },
  { name: "Caltanissetta", lat: 37.4913, lng: 14.0628, region: "Sicilia" },
  { name: "Campobasso", lat: 41.5603, lng: 14.6627, region: "Molise" },
  { name: "Caserta", lat: 41.0721, lng: 14.3243, region: "Campania" },
  { name: "Catanzaro", lat: 38.9098, lng: 16.5877, region: "Calabria" },
  { name: "Chieti", lat: 42.3512, lng: 14.1669, region: "Abruzzo" },
  { name: "Como", lat: 45.8080, lng: 9.0852, region: "Lombardia" },
  { name: "Cosenza", lat: 39.2920, lng: 16.2570, region: "Calabria" },
  { name: "Cremona", lat: 45.1335, lng: 10.0220, region: "Lombardia" },
  { name: "Crotone", lat: 39.0803, lng: 17.1271, region: "Calabria" },
  { name: "Cuneo", lat: 44.3844, lng: 7.5426, region: "Piemonte" },
  { name: "Enna", lat: 37.5675, lng: 14.2792, region: "Sicilia" },
  { name: "Fermo", lat: 43.1631, lng: 13.7161, region: "Marche" },
  { name: "Ferrara", lat: 44.8376, lng: 11.6197, region: "Emilia-Romagna" },
  { name: "Frosinone", lat: 41.6400, lng: 13.3424, region: "Lazio" },
  { name: "Gorizia", lat: 45.9413, lng: 13.6228, region: "Friuli-Venezia Giulia" },
  { name: "Grosseto", lat: 42.7631, lng: 11.1136, region: "Toscana" },
  { name: "Imperia", lat: 43.8874, lng: 8.0329, region: "Liguria" },
  { name: "Isernia", lat: 41.5979, lng: 14.2352, region: "Molise" },
  { name: "L'Aquila", lat: 42.3498, lng: 13.3995, region: "Abruzzo" },
  { name: "La Spezia", lat: 44.1025, lng: 9.8244, region: "Liguria" },
  { name: "Latina", lat: 41.4675, lng: 12.9030, region: "Lazio" },
  { name: "Lecce", lat: 40.3516, lng: 18.1750, region: "Puglia" },
  { name: "Lecco", lat: 45.8565, lng: 9.3976, region: "Lombardia" },
  { name: "Lodi", lat: 45.3101, lng: 9.5044, region: "Lombardia" },
  { name: "Lucca", lat: 43.8430, lng: 10.5027, region: "Toscana" },
  { name: "Macerata", lat: 43.2981, lng: 13.4535, region: "Marche" },
  { name: "Mantova", lat: 45.1564, lng: 10.7913, region: "Lombardia" },
  { name: "Massa", lat: 44.0354, lng: 10.1393, region: "Toscana" },
  { name: "Matera", lat: 40.6663, lng: 16.6065, region: "Basilicata" },
  { name: "Monza", lat: 45.5845, lng: 9.2744, region: "Lombardia" },
  { name: "Novara", lat: 45.4467, lng: 8.6210, region: "Piemonte" },
  { name: "Nuoro", lat: 40.3209, lng: 9.3289, region: "Sardegna" },
  { name: "Oristano", lat: 39.9063, lng: 8.5922, region: "Sardegna" },
  { name: "Parma", lat: 44.8015, lng: 10.3280, region: "Emilia-Romagna" },
  { name: "Pavia", lat: 45.1848, lng: 9.1562, region: "Lombardia" },
  { name: "Pesaro", lat: 43.9097, lng: 12.9134, region: "Marche" },
  { name: "Pescara", lat: 42.4617, lng: 14.2160, region: "Abruzzo" },
  { name: "Piacenza", lat: 45.0521, lng: 9.6934, region: "Emilia-Romagna" },
  { name: "Pisa", lat: 43.7228, lng: 10.4017, region: "Toscana" },
  { name: "Pistoia", lat: 43.9332, lng: 10.9123, region: "Toscana" },
  { name: "Pordenone", lat: 45.9641, lng: 12.6561, region: "Friuli-Venezia Giulia" },
  { name: "Potenza", lat: 40.6424, lng: 15.8056, region: "Basilicata" },
  { name: "Ragusa", lat: 36.9277, lng: 14.7230, region: "Sicilia" },
  { name: "Ravenna", lat: 44.4183, lng: 12.2035, region: "Emilia-Romagna" },
  { name: "Reggio Emilia", lat: 44.6979, lng: 10.6312, region: "Emilia-Romagna" },
  { name: "Rieti", lat: 42.4015, lng: 12.8632, region: "Lazio" },
  { name: "Rimini", lat: 44.0570, lng: 12.5660, region: "Emilia-Romagna" },
  { name: "Rovigo", lat: 45.0705, lng: 11.7905, region: "Veneto" },
  { name: "Sassari", lat: 40.7259, lng: 8.5553, region: "Sardegna" },
  { name: "Savona", lat: 44.3007, lng: 8.4763, region: "Liguria" },
  { name: "Siena", lat: 43.3186, lng: 11.3307, region: "Toscana" },
  { name: "Siracusa", lat: 37.0755, lng: 15.2866, region: "Sicilia" },
  { name: "Sondrio", lat: 46.1709, lng: 9.8753, region: "Lombardia" },
  { name: "Teramo", lat: 42.6575, lng: 13.7049, region: "Abruzzo" },
  { name: "Terni", lat: 42.5675, lng: 12.6494, region: "Umbria" },
  { name: "Trapani", lat: 38.0173, lng: 12.5145, region: "Sicilia" },
  { name: "Trento", lat: 46.0694, lng: 11.1217, region: "Trentino-Alto Adige" },
  { name: "Treviso", lat: 45.6667, lng: 12.2450, region: "Veneto" },
  { name: "Udine", lat: 46.0711, lng: 13.2346, region: "Friuli-Venezia Giulia" },
  { name: "Varese", lat: 45.8194, lng: 8.8260, region: "Lombardia" },
  { name: "Vercelli", lat: 45.3224, lng: 8.4179, region: "Piemonte" },
  { name: "Vibo Valentia", lat: 38.6735, lng: 16.1005, region: "Calabria" },
  { name: "Vicenza", lat: 45.5455, lng: 11.5354, region: "Veneto" },
  { name: "Viterbo", lat: 42.4207, lng: 12.1054, region: "Lazio" },
];

// Province italiane (denominazione ufficiale) - Fixed to deduplicate and ensure unique values
const italianProvinces: string[] = [
  "Agrigento", "Alessandria", "Ancona", "Aosta", "Arezzo", "Ascoli Piceno", "Asti", "Avellino", "Bari",
  "Barletta-Andria-Trani", "Belluno", "Benevento", "Bergamo", "Biella", "Bologna", "Bolzano", "Brescia",
  "Brindisi", "Cagliari", "Caltanissetta", "Campobasso", "Caserta", "Catanzaro", "Chieti", "Como", "Cosenza",
  "Cremona", "Crotone", "Cuneo", "Enna", "Fermo", "Ferrara", "Firenze", "Foggia", "Forlì-Cesena", "Frosinone",
  "Genova", "Gorizia", "Grosseto", "Imperia", "Isernia", "L'Aquila", "La Spezia", "Latina", "Lecce", "Lecco",
  "Livorno", "Lodi", "Lucca", "Macerata", "Mantova", "Massa-Carrara", "Matera", "Messina",
  "Milano", "Modena", "Monza e Brianza", "Napoli", "Novara", "Nuoro", "Oristano",
  "Padova", "Palermo", "Parma", "Pavia", "Perugia", "Pesaro e Urbino", "Pescara", "Piacenza", "Pisa",
  "Pistoia", "Pordenone", "Potenza", "Prato", "Ragusa", "Ravenna", "Reggio Calabria", "Reggio Emilia",
  "Rieti", "Rimini", "Roma", "Rovigo", "Salerno", "Sassari", "Savona", "Siena",
  "Siracusa", "Sondrio", "Sud Sardegna", "Taranto", "Teramo", "Terni", "Torino", "Trapani", "Trento", "Treviso",
  "Trieste", "Udine", "Varese", "Venezia", "Verbano-Cusio-Ossola", "Vercelli", "Verona", "Vibo Valentia",
  "Vicenza", "Viterbo"
];

// Create options with unique keys and correct data
export const allOptions = [
  // Add provinces first
  ...italianProvinces.map((province, index) => ({
    label: province,
    value: province.toLowerCase().replace(/[^\w]/g, '-'), // Create URL-safe value for keys
    type: "province" as const,
    id: `prov-${index}` // Add unique id for React keys
  })),
  
  // Add cities second
  ...italianCities.map((city, index) => ({
    label: city.name,
    value: city.name.toLowerCase().replace(/[^\w]/g, '-'), // Create URL-safe value for keys
    type: "city" as const,
    lat: city.lat,
    lng: city.lng,
    id: `city-${index}` // Add unique id for React keys
  }))
];

export function useFilteredLocations(search: string) {
  const [filteredProvinces, setFilteredProvinces] = useState<typeof allOptions>([]);
  const [filteredCities, setFilteredCities] = useState<typeof allOptions>([]);

  useEffect(() => {
    // Always initialize to empty arrays
    if (!search || search.trim() === '') {
      setFilteredProvinces([]);
      setFilteredCities([]);
      return;
    }

    const searchLower = search.toLowerCase().trim();

    // Filter provinces
    const provinces = allOptions.filter(
      opt => opt.type === "province" && opt.label.toLowerCase().includes(searchLower)
    );
    
    // Filter cities
    const cities = allOptions.filter(
      opt => opt.type === "city" && opt.label.toLowerCase().includes(searchLower)
    );

    // Set the filtered results
    setFilteredProvinces(provinces || []);
    setFilteredCities(cities || []);
  }, [search]);

  return { 
    filteredProvinces: filteredProvinces || [], 
    filteredCities: filteredCities || [] 
  };
}

export { italianCities, italianProvinces };
