
import React, { useState } from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import SearchBar from "./SearchBar";
import MapMarkerManager from "./MapMarkerManager";
import { useToast } from "@/hooks/use-toast";
import { allOptions, italianCities } from "./useFilteredLocations";
import { City, useMapMarkers } from "./useMapMarkers";

const containerStyle = {
  width: "100%",
  height: "40vh",
  borderRadius: "1rem",
};

const defaultCenter = { lat: 48.8566, lng: 10.3522 };
const defaultZoom = 5;
const GOOGLE_MAPS_API_KEY = "AIzaSyDcPS0_nVl2-Waxcby_Vn3iu1ojh360oKQ";
const mapLibraries: ["places"] = ["places"];

const SearchableMapContainer: React.FC = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: mapLibraries,
  });

  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userMarkers, setUserMarkers] = useState<{ lat: number; lng: number; note: string; id: string }[]>([]);
  const [areas, setAreas] = useState<{ lat: number; lng: number; radius: number; label: string; id: string }[]>([]);
  const { toast } = useToast();

  // Marker logic for city database markers (not user-added ones)
  const markerApi = useMapMarkers({ map });

  const onLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  };

  const handleOptionSelect = (option: typeof allOptions[0]) => {
    let cityFound: City | null = null;

    if (option.type === "city" && option.lat && option.lng) {
      cityFound = {
        name: option.label,
        lat: option.lat,
        lng: option.lng,
      };
    } else if (option.type === "province") {
      const provinceName = option.label;
      const capital = italianCities.find(city => 
        city.name.toLowerCase() === provinceName.toLowerCase() ||
        (city.province && city.province.toLowerCase() === provinceName.toLowerCase())
      );
      if (capital) {
        cityFound = {
          name: capital.name,
          lat: capital.lat,
          lng: capital.lng,
        };
      }
    }

    if (cityFound && map) {
      map.panTo({ lat: cityFound.lat, lng: cityFound.lng });
      map.setZoom(12);
      toast({
        title: `${cityFound.name}`,
        description: `Centrata la mappa su ${cityFound.name}`
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
    setSearch(option.label);
    setSearching(false);
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
    // Find by label (case insensitive)
    const option = allOptions.find(opt => opt.label.toLowerCase() === search.trim().toLowerCase());
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

  // Functions to add user markers and areas
  const handleAddMarker = (marker: { lat: number; lng: number; note: string; id: string }) => {
    setUserMarkers((m) => [...m, marker]);
    toast({ title: "Punto aggiunto", description: "Hai aggiunto un punto sulla mappa!" });
  };
  const handleAddArea = (area: { lat: number; lng: number; radius: number; label: string; id: string }) => {
    setAreas((a) => [...a, area]);
    toast({ title: "Area aggiunta", description: "Hai cerchiato un'area di interesse." });
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
        center={defaultCenter}
        zoom={defaultZoom}
        onLoad={onLoad}
        options={{
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
        }}
      >
        {/* Map events for markers and areas */}
        <MapMarkerManager
          map={map}
          onAddMarker={handleAddMarker}
          onAddArea={handleAddArea}
        />
        {/* Render user markers */}
        {userMarkers.map(marker => (
          <div key={marker.id}>
            {/* In a real implementation, these would be Google Marker overlays */}
            {/* ... This is simplified. In production, use overlays. */}
          </div>
        ))}
        {/* Render circles for user areas */}
        {areas.map(area => (
          <div key={area.id}>
            {/* ... In production, these would use Google Maps API overlays */}
          </div>
        ))}
      </GoogleMap>
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

export default SearchableMapContainer;
