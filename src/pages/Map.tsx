
import { useState, useEffect } from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

// Fix per l'icona di default
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const Map = () => {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clueLocations, setClueLocations] = useState<Array<{ position: [number, number]; name: string; found: boolean }>>([
    { position: [45.4642, 9.1900], name: "Indizio #1: Duomo di Milano", found: false },
    { position: [45.4654, 9.1865], name: "Indizio #2: Galleria Vittorio Emanuele", found: false },
    { position: [45.4668, 9.1905], name: "Indizio #3: Teatro alla Scala", found: false },
  ]);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  useEffect(() => {
    setProfileImage(localStorage.getItem('profileImage'));
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
          setLoading(false);
        },
        (err) => {
          setError("Impossibile ottenere la tua posizione. Verifica di aver concesso i permessi di geolocalizzazione.");
          setLoading(false);
          setCurrentLocation([45.4642, 9.1900]);
        }
      );
    } else {
      setError("Il tuo browser non supporta la geolocalizzazione.");
      setLoading(false);
      setCurrentLocation([45.4642, 9.1900]);
    }

    const foundClues = JSON.parse(localStorage.getItem("foundClues") || "[]");
    if (foundClues.length > 0) {
      setClueLocations((prevLocations) =>
        prevLocations.map((loc) => ({
          ...loc,
          found: foundClues.includes(loc.name),
        }))
      );
    }
  }, []);

  const handleClueFound = (clueName: string) => {
    setClueLocations((prevLocations) =>
      prevLocations.map((loc) =>
        loc.name === clueName ? { ...loc, found: true } : loc
      )
    );
    const foundClues = JSON.parse(localStorage.getItem("foundClues") || "[]");
    if (!foundClues.includes(clueName)) {
      foundClues.push(clueName);
      localStorage.setItem("foundClues", JSON.stringify(foundClues));
      const notification = {
        id: Date.now().toString(),
        title: "Nuovo indizio trovato!",
        description: `Hai trovato ${clueName}`,
        date: new Date().toISOString(),
        read: false,
      };
      const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
      notifications.push(notification);
      localStorage.setItem("notifications", JSON.stringify(notifications));
      toast.success("Indizio trovato!", {
        description: `Hai trovato ${clueName}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-projectx-neon-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black w-full">
      <UnifiedHeader profileImage={profileImage} />
      <div className="h-[72px] w-full" />
      {error ? (
        <div className="p-4 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Riprova</Button>
        </div>
      ) : (
        // la mappa ora usa tutta l'area disponibile in modo responsivo
        <div className="w-full h-[calc(100vh-72px)] flex flex-col">
          {currentLocation && (
            <MapContainer
              className="flex-1 w-full h-full"
              zoom={15}
              center={currentLocation}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={currentLocation}>
                <Popup>Tu sei qui</Popup>
              </Marker>
              {clueLocations.map((clue, index) => (
                <Marker
                  key={index}
                  position={clue.position}
                  icon={new L.Icon({
                    iconUrl: clue.found
                      ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
                      : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
                    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold">{clue.name}</h3>
                      {clue.found ? (
                        <p className="text-green-500 text-sm">Indizio già trovato!</p>
                      ) : (
                        <Button
                          size="sm"
                          className="mt-2 bg-projectx-neon-blue"
                          onClick={() => handleClueFound(clue.name)}
                        >
                          Raccogli Indizio
                        </Button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default Map;
