import { useState, useEffect } from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

// Fix for default marker icon in Leaflet with React
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
  
  // propagate profile image for header
  const [profileImage, setProfileImage] = useState<string | null>(null);
  useEffect(() => {
    setProfileImage(localStorage.getItem('profileImage'));
  }, []);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
          setLoading(false);
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("Impossibile ottenere la tua posizione. Verifica di aver concesso i permessi di geolocalizzazione.");
          setLoading(false);
          // Default to Milan if location access is denied
          setCurrentLocation([45.4642, 9.1900]);
        }
      );
    } else {
      setError("Il tuo browser non supporta la geolocalizzazione.");
      setLoading(false);
      // Default to Milan
      setCurrentLocation([45.4642, 9.1900]);
    }

    // Load previously found clues from localStorage
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
    // Mark clue as found
    setClueLocations((prevLocations) =>
      prevLocations.map((loc) =>
        loc.name === clueName ? { ...loc, found: true } : loc
      )
    );

    // Save to localStorage
    const foundClues = JSON.parse(localStorage.getItem("foundClues") || "[]");
    if (!foundClues.includes(clueName)) {
      foundClues.push(clueName);
      localStorage.setItem("foundClues", JSON.stringify(foundClues));

      // Add notification
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

      // Show toast
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
        <div className="h-[calc(100vh-72px)] w-full">
          {currentLocation && (
            <MapContainer
              center={currentLocation}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* User's current location */}
              <Marker position={currentLocation}>
                <Popup>Tu sei qui</Popup>
              </Marker>
              
              {/* Clue locations */}
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
