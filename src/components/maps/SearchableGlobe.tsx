import React, { useState, useCallback } from "react";
import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = search.trim().toLowerCase();
    const city =
      italianCities.find((c) => c.name.toLowerCase() === query) ||
      italianCities.find((c) => c.name.toLowerCase().includes(query));
    if (city) {
      setSelectedCity(city);
      if (map) {
        map.panTo({ lat: city.lat, lng: city.lng });
        map.setZoom(15);
      }
    } else {
      alert(`Nessuna città trovata per: ${search}`);
      setSelectedCity(null);
    }
  };

  if (!isLoaded) {
    return <div className="text-center py-8">Caricamento mappa...</div>;
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selectedCity ? { lat: selectedCity.lat, lng: selectedCity.lng } : defaultCenter}
        zoom={selectedCity ? 15 : defaultZoom}
        onLoad={onLoad}
        options={{
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
        }}
      >
        {(selectedCity ? [selectedCity] : italianCities).map((city, idx) => (
          <MarkerF
            key={city.name + idx}
            position={{ lat: city.lat, lng: city.lng }}
            title={city.name}
          />
        ))}
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
