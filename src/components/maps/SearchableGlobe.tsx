import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface City {
  name: string;
  lat: number;
  lng: number;
}

const italianCities: City[] = [
  { name: "Roma", lat: 41.9028, lng: 12.4964 },
  { name: "Milano", lat: 45.4642, lng: 9.19 },
  { name: "Napoli", lat: 40.8518, lng: 14.2681 },
  { name: "Torino", lat: 45.0703, lng: 7.6869 },
  { name: "Palermo", lat: 38.1157, lng: 13.3615 },
  { name: "Genova", lat: 44.4056, lng: 8.9463 },
  { name: "Bari", lat: 41.1171, lng: 16.8719 },
  { name: "Firenze", lat: 43.7696, lng: 11.2558 },
  { name: "Catania", lat: 37.5079, lng: 15.083 },
  { name: "Venezia", lat: 45.4408, lng: 12.3155 },
  { name: "Verona", lat: 45.4384, lng: 10.9916 },
  { name: "Messina", lat: 38.1938, lng: 15.554 },
  { name: "Padova", lat: 45.4064, lng: 11.8768 },
  { name: "Trieste", lat: 45.6495, lng: 13.7768 },
  { name: "Taranto", lat: 40.4644, lng: 17.247 },
  { name: "Brescia", lat: 45.5416, lng: 10.2118 },
  { name: "Parma", lat: 44.8015, lng: 10.3279 },
  { name: "Prato", lat: 43.8777, lng: 11.1022 },
  { name: "Reggio di Calabria", lat: 38.1144, lng: 15.65 },
  { name: "Agrigento", lat: 37.3111, lng: 13.5767 },
  { name: "Alessandria", lat: 44.9125, lng: 8.6167 },
  { name: "Ancona", lat: 43.6158, lng: 13.5189 },
  { name: "Aosta", lat: 45.737, lng: 7.3201 },
  { name: "Arezzo", lat: 43.4631, lng: 11.8793 },
  { name: "Ascoli Piceno", lat: 42.8537, lng: 13.5741 },
  { name: "Asti", lat: 44.9002, lng: 8.2041 },
  { name: "Avellino", lat: 40.914, lng: 14.7973 },
  { name: "Barletta-Andria-Trani", lat: 41.2422, lng: 16.2819 },
  { name: "Belluno", lat: 46.1408, lng: 12.2156 },
  { name: "Benevento", lat: 41.1307, lng: 14.7828 },
  { name: "Bergamo", lat: 45.6983, lng: 9.6773 },
  { name: "Biella", lat: 45.5638, lng: 8.0586 },
  { name: "Bologna", lat: 44.4949, lng: 11.3426 },
  { name: "Bolzano", lat: 46.4983, lng: 11.3548 },
  { name: "Brescia", lat: 45.5416, lng: 10.2118 },
  { name: "Brindisi", lat: 40.6362, lng: 17.9478 },
  { name: "Cagliari", lat: 39.2238, lng: 9.1217 },
  { name: "Caltanissetta", lat: 37.4902, lng: 14.0624 },
  { name: "Campobasso", lat: 41.5595, lng: 14.6671 },
  { name: "Caserta", lat: 41.073, lng: 14.331 },
  { name: "Catanzaro", lat: 38.9093, lng: 16.5873 },
  { name: "Chieti", lat: 42.3512, lng: 14.1675 },
  { name: "Como", lat: 45.808, lng: 9.0852 },
  { name: "Cosenza", lat: 39.2983, lng: 16.2537 },
  { name: "Cremona", lat: 45.1366, lng: 10.0267 },
  { name: "Crotone", lat: 39.0804, lng: 17.1266 },
  { name: "Cuneo", lat: 44.3883, lng: 7.5528 },
  { name: "Enna", lat: 37.5647, lng: 14.2743 },
  { name: "Fermo", lat: 43.1617, lng: 13.7202 },
  { name: "Ferrara", lat: 44.8359, lng: 11.6199 },
  { name: "Foggia", lat: 41.4622, lng: 15.5446 },
  { name: "Forlì-Cesena", lat: 44.2227, lng: 12.0407 },
  { name: "Frosinone", lat: 41.6412, lng: 13.3511 },
  { name: "Gorizia", lat: 45.9366, lng: 13.6206 },
  { name: "Grosseto", lat: 42.7634, lng: 11.1125 },
  { name: "Imperia", lat: 43.889, lng: 8.0398 },
  { name: "Isernia", lat: 41.5911, lng: 14.2291 },
  { name: "L'Aquila", lat: 42.3506, lng: 13.3995 },
  { name: "La Spezia", lat: 44.1076, lng: 9.813 },
  { name: "Latina", lat: 41.4661, lng: 12.9043 },
  { name: "Lecce", lat: 40.3515, lng: 18.175 },
  { name: "Lecco", lat: 45.8586, lng: 9.3977 },
  { name: "Livorno", lat: 43.5485, lng: 10.3099 },
  { name: "Lodi", lat: 45.309, lng: 9.5007 },
  { name: "Lucca", lat: 43.8424, lng: 10.5027 },
  { name: "Macerata", lat: 43.3002, lng: 13.4534 },
  { name: "Mantova", lat: 45.1564, lng: 10.7914 },
  { name: "Massa-Carrara", lat: 44.0341, lng: 10.1391 },
  { name: "Matera", lat: 40.6685, lng: 16.6016 },
  { name: "Medio Campidano", lat: 39.539, lng: 8.7027 },
  { name: "Modena", lat: 44.6458, lng: 10.9256 },
  { name: "Monza e Brianza", lat: 45.5845, lng: 9.2744 },
  { name: "Novara", lat: 45.4456, lng: 8.6222 },
  { name: "Nuoro", lat: 40.3211, lng: 9.3251 },
  { name: "Oristano", lat: 39.9031, lng: 8.5914 },
  { name: "Padova", lat: 45.4064, lng: 11.8768 },
  { name: "Palermo", lat: 38.1157, lng: 13.3615 },
  { name: "Parma", lat: 44.8015, lng: 10.3279 },
  { name: "Pavia", lat: 45.1847, lng: 9.1582 },
  { name: "Perugia", lat: 43.1107, lng: 12.3897 },
  { name: "Pesaro e Urbino", lat: 43.9091, lng: 12.9124 },
  { name: "Pescara", lat: 42.4618, lng: 14.2159 },
  { name: "Piacenza", lat: 45.0522, lng: 9.6934 },
  { name: "Pisa", lat: 43.7228, lng: 10.4017 },
  { name: "Pistoia", lat: 43.9308, lng: 10.9257 },
  { name: "Pordenone", lat: 45.9566, lng: 12.6605 },
  { name: "Potenza", lat: 40.6394, lng: 15.8079 },
  { name: "Ragusa", lat: 36.9256, lng: 14.7233 },
  { name: "Ravenna", lat: 44.4184, lng: 12.2035 },
  { name: "Reggio Calabria", lat: 38.1144, lng: 15.65 },
  { name: "Reggio Emilia", lat: 44.698, lng: 10.6301 },
  { name: "Rieti", lat: 42.4048, lng: 12.8574 },
  { name: "Rimini", lat: 44.0584, lng: 12.5658 },
  { name: "Roma", lat: 41.9028, lng: 12.4964 },
  { name: "Rovigo", lat: 45.0706, lng: 11.7896 },
  { name: "Salerno", lat: 40.6824, lng: 14.768 },
  { name: "Sassari", lat: 40.7259, lng: 8.5556 },
  { name: "Savona", lat: 44.3091, lng: 8.4772 },
  { name: "Siena", lat: 43.3186, lng: 11.3306 },
  { name: "Siracusa", lat: 37.0755, lng: 15.2866 },
  { name: "Sondrio", lat: 46.1699, lng: 9.8724 },
  { name: "Taranto", lat: 40.4644, lng: 17.247 },
  { name: "Teramo", lat: 42.6612, lng: 13.699 },
  { name: "Terni", lat: 42.5636, lng: 12.6427 },
  { name: "Torino", lat: 45.0703, lng: 7.6869 },
  { name: "Trapani", lat: 38.0185, lng: 12.513 },
  { name: "Trento", lat: 46.0664, lng: 11.1176 },
  { name: "Treviso", lat: 45.6668, lng: 12.2431 },
  { name: "Trieste", lat: 45.6495, lng: 13.7768 },
  { name: "Udine", lat: 46.0637, lng: 13.2366 },
  { name: "Varese", lat: 45.8206, lng: 8.8252 },
  { name: "Venezia", lat: 45.4408, lng: 12.3155 },
  { name: "Verbano-Cusio-Ossola", lat: 45.9237, lng: 8.5466 },
  { name: "Vercelli", lat: 45.3223, lng: 8.4198 },
  { name: "Verona", lat: 45.4384, lng: 10.9916 },
  { name: "Vibo Valentia", lat: 38.6762, lng: 16.0977 },
  { name: "Vicenza", lat: 45.5455, lng: 11.5358 },
  { name: "Viterbo", lat: 42.4207, lng: 12.1077 }
];

const containerStyle = {
  width: "100%",
  height: "40vh",
  borderRadius: "1rem",
};

const defaultCenter = { lat: 41.9028, lng: 12.4964 };
const defaultZoom = 6;

const GOOGLE_MAPS_API_KEY = "AIzaSyDcPS0_nVl2-Waxcby_Vn3iu1ojh360oKQ";

const SearchableGlobe: React.FC = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });
  
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const { toast } = useToast();

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    console.log("Map loaded successfully");
  }, []);
  
  useEffect(() => {
    if (isLoaded && map) {
      try {
        markers.forEach(marker => marker.map = null);
        setMarkers([]);
        
        const newMarkers = italianCities.map(city => {
          const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: { lat: city.lat, lng: city.lng },
            title: city.name,
          });
          
          marker.addListener("click", () => {
            setSelectedCity(city);
            map.panTo({ lat: city.lat, lng: city.lng });
            map.setZoom(12);
          });
          
          return marker;
        });
        
        setMarkers(newMarkers);
      } catch (error) {
        console.error("Error creating markers:", error);
      }
    }
  }, [isLoaded, map]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!search.trim()) {
      toast({
        title: "Campo vuoto",
        description: "Inserisci il nome di una città italiana",
        variant: "destructive",
      });
      return;
    }

    const searchNormalized = search.trim().toLowerCase();
    
    const exactMatch = italianCities.find(
      city => city.name.toLowerCase() === searchNormalized
    );
    
    const partialMatch = !exactMatch && italianCities.find(
      city => city.name.toLowerCase().includes(searchNormalized)
    );
    
    const cityFound = exactMatch || partialMatch;
    
    if (cityFound) {
      setSelectedCity(cityFound);
      if (map) {
        map.panTo({ lat: cityFound.lat, lng: cityFound.lng });
        map.setZoom(12);
        
        toast({
          title: "Città trovata",
          description: `Centrata la mappa su ${cityFound.name}`,
        });
      }
    } else {
      toast({
        title: "Città non trovata",
        description: `Nessuna città trovata per: ${search}`,
        variant: "destructive",
      });
      setSelectedCity(null);
    }
  };

  if (loadError) {
    return (
      <div className="text-center py-8 bg-red-500/10 rounded-lg border border-red-500/30 p-4">
        <p className="text-red-500">Errore nel caricamento della mappa: {loadError.message}</p>
        <p className="text-sm mt-2">Verifica che l'API Google Maps sia attivata nella console Google Cloud.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="text-center py-8">Caricamento mappa...</div>;
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selectedCity ? { lat: selectedCity.lat, lng: selectedCity.lng } : defaultCenter}
        zoom={selectedCity ? 12 : defaultZoom}
        onLoad={onLoad}
        options={{
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
        }}
      >
        {/* I marker sono gestiti tramite l'useEffect */}
      </GoogleMap>
      <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca una città italiana..."
          className="bg-black/70 border-projectx-deep-blue"
        />
        <Button 
          type="submit"
          variant="outline"
          className="bg-projectx-deep-blue hover:bg-projectx-blue"
        >
          Cerca
        </Button>
      </form>
    </div>
  );
};

export default SearchableGlobe;
