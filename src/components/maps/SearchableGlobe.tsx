
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
  // Aggiungiamo più città italiane per migliorare la ricerca
  { name: "Bologna", lat: 44.4949, lng: 11.3426 },
  { name: "Cagliari", lat: 39.2238, lng: 9.1217 },
  { name: "Livorno", lat: 43.5485, lng: 10.3099 },
  { name: "Perugia", lat: 43.1107, lng: 12.3897 },
  { name: "Bolzano", lat: 46.4983, lng: 11.3548 },
  { name: "Ancona", lat: 43.6158, lng: 13.5189 },
  { name: "Bergamo", lat: 45.6983, lng: 9.6773 },
  { name: "Modena", lat: 44.6458, lng: 10.9256 },
  { name: "Salerno", lat: 40.6824, lng: 14.7680 },
  { name: "Siena", lat: 43.3186, lng: 11.3306 },
  { name: "Como", lat: 45.8080, lng: 9.0852 },
  { name: "Imperia", lat: 43.8890, lng: 8.0398 },
  { name: "Lecce", lat: 40.3515, lng: 18.1750 },
  { name: "Sassari", lat: 40.7259, lng: 8.5556 },
  { name: "Pescara", lat: 42.4618, lng: 14.2159 },
  { name: "Pisa", lat: 43.7228, lng: 10.4017 },
];

const containerStyle = {
  width: "100%",
  height: "40vh",
  borderRadius: "1rem",
};

const defaultCenter = { lat: 41.9028, lng: 12.4964 }; // Roma
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
  
  // Create markers for cities when map is loaded
  useEffect(() => {
    if (isLoaded && map) {
      try {
        // Clear any existing markers
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

  // Migliorata la funzione di ricerca per essere più flessibile
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
    
    // Cerchiamo corrispondenze esatte prima, poi corrispondenze parziali
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
