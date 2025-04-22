
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import L from "leaflet";

// Fix leaflet icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Componente controllo zoom per spostamento e ricerca città
interface ZoomToCityProps {
  city: { lat: number; lng: number } | null;
}

const ZoomToCity: React.FC<ZoomToCityProps> = ({ city }) => {
  const map = useMap();
  useEffect(() => {
    if (city && city.lat && city.lng) {
      map.setView([city.lat, city.lng], 15); // Zoom molto vicino: livello 15
    }
  }, [city, map]);
  return null;
};

interface City {
  name: string;
  lat: number;
  lng: number;
}

const italianCities: City[] = [
  { name: "Roma", lat: 41.9028, lng: 12.4964 },
  { name: "Milano", lat: 45.4642, lng: 9.1900 },
  { name: "Napoli", lat: 40.8518, lng: 14.2681 },
  { name: "Torino", lat: 45.0703, lng: 7.6869 },
  { name: "Palermo", lat: 38.1157, lng: 13.3615 },
  { name: "Genova", lat: 44.4056, lng: 8.9463 },
  { name: "Bari", lat: 41.1171, lng: 16.8719 },
  { name: "Firenze", lat: 43.7696, lng: 11.2558 },
  { name: "Catania", lat: 37.5079, lng: 15.0830 },
  { name: "Venezia", lat: 45.4408, lng: 12.3155 },
  { name: "Verona", lat: 45.4384, lng: 10.9916 },
  { name: "Messina", lat: 38.1938, lng: 15.5540 },
  { name: "Padova", lat: 45.4064, lng: 11.8768 },
  { name: "Trieste", lat: 45.6495, lng: 13.7768 },
  { name: "Taranto", lat: 40.4644, lng: 17.2470 },
  { name: "Brescia", lat: 45.5416, lng: 10.2118 },
  { name: "Parma", lat: 44.8015, lng: 10.3279 },
  { name: "Prato", lat: 43.8777, lng: 11.1022 },
  { name: "Reggio di Calabria", lat: 38.1144, lng: 15.6500 },
];

const SearchableGlobe: React.FC = () => {
  const [search, setSearch] = useState("");
  const [foundCity, setFoundCity] = useState<City | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = search.trim().toLowerCase();
    const city =
      italianCities.find((c) => c.name.toLowerCase() === query) ||
      italianCities.find((c) => c.name.toLowerCase().includes(query));
    if (city) {
      setFoundCity(city);
    } else {
      alert(`Nessuna città trovata per: ${search}`);
      setFoundCity(null);
    }
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        defaultCenter={[41.9028, 12.4964]}
        defaultZoom={6}
        style={{ width: "100%", height: "40vh", borderRadius: "1rem" }}
        scrollWheelZoom={true}
        className="mb-4"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {(foundCity ? [foundCity] : italianCities).map((city, idx) => (
          <Marker
            key={city.name + idx}
            position={[city.lat, city.lng]}
          >
            <Popup>
              <span className="font-bold">{city.name}</span>
            </Popup>
          </Marker>
        ))}
        {foundCity && <ZoomToCity city={foundCity} />}
      </MapContainer>
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
