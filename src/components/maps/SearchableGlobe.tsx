
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import { useToast } from "@/hooks/use-toast";
import SearchBar from "./SearchBar";
import { allOptions, italianCities } from "./useFilteredLocations";

const containerStyle = {
  width: "100%",
  height: "40vh",
  borderRadius: "1rem",
};

const defaultCenter = { lat: 41.9028, lng: 12.4964 };
const defaultZoom = 6;

// Define libraries outside component to prevent unnecessary re-renders
const mapLibraries: ["places"] = ["places"];

const GOOGLE_MAPS_API_KEY = "AIzaSyDcPS0_nVl2-Waxcby_Vn3iu1ojh360oKQ";

const SearchableGlobe: React.FC = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: mapLibraries,
  });

  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<{
    name: string; lat: number; lng: number;
  } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const { toast } = useToast();
  const [searching, setSearching] = useState(false);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    console.log("Map loaded successfully");
  }, []);

  // Create markers when map is loaded
  useEffect(() => {
    if (!isLoaded || !map || !window.google?.maps?.marker?.AdvancedMarkerElement) {
      return;
    }

    try {
      // Clear existing markers
      markers.forEach(marker => {
        if (marker && marker.map) {
          marker.map = null;
        }
      });
      setMarkers([]);

      const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
      
      // Create markers for each city
      if (italianCities && italianCities.length > 0) {
        italianCities.forEach(city => {
          try {
            if (city && typeof city.lat === 'number' && typeof city.lng === 'number') {
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

              newMarkers.push(marker);
            }
          } catch (error) {
            console.error(`Error creating marker for city ${city?.name}:`, error);
          }
        });
      }

      setMarkers(newMarkers);
    } catch (error) {
      console.error("Error creating markers:", error);
    }
  }, [isLoaded, map]);

  const handleOptionSelect = (option: typeof allOptions[0]) => {
    if (!option) return;

    setSearch(option.label);
    setSearching(false);

    // Find city by direct match or province match
    let cityFound = null;

    if (option.type === "city" && option.lat && option.lng) {
      cityFound = {
        name: option.label,
        lat: option.lat,
        lng: option.lng
      };
    } else if (option.type === "province") {
      // Find capital city of province
      const provinceName = option.label;
      const capitalCity = italianCities.find(city => 
        city.name.toLowerCase() === provinceName.toLowerCase() ||
        (city.province && city.province.toLowerCase() === provinceName.toLowerCase())
      );
      
      if (capitalCity) {
        cityFound = {
          name: capitalCity.name,
          lat: capitalCity.lat,
          lng: capitalCity.lng
        };
      }
    }

    if (cityFound && map) {
      setSelectedCity(cityFound);
      map.panTo({ lat: cityFound.lat, lng: cityFound.lng });
      map.setZoom(12);
      toast({
        title: `${cityFound.name}`,
        description: `Centrata la mappa su ${cityFound.name}`,
      });
    } else if (option.type === "province" && map) {
      toast({
        title: "Provincia senza città capoluogo nei dati",
        description: `Non è presente una città principale per la provincia selezionata.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Errore",
        description: `Non è stato possibile centrare la mappa.`,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search || !search.trim()) {
      toast({
        title: "Campo vuoto",
        description: "Seleziona o scrivi il nome di una città o provincia",
        variant: "destructive",
      });
      return;
    }
    
    // Find option by label (case insensitive)
    const option = allOptions.find(
      opt => opt.label.toLowerCase() === search.trim().toLowerCase()
    );
    
    if (option) {
      handleOptionSelect(option);
    } else {
      toast({
        title: "Non trovato",
        description: `Nessuna città o provincia trovata per: ${search}`,
        variant: "destructive",
      });
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
      />
      <SearchBar
        search={search}
        setSearch={setSearch}
        searching={searching}
        setSearching={setSearching}
        onSelect={handleOptionSelect}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default SearchableGlobe;
