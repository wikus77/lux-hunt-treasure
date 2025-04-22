
import { useState, useEffect } from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const Map = () => {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        }
      );
    } else {
      setError("Il tuo browser non supporta la geolocalizzazione.");
      setLoading(false);
    }
  }, []);

  // Funzione per generare l'URL di Apple Maps (visualizzabile sia su Mac che iOS, e “degenera” su web se non c’è supporto)
  const getAppleMapsUrl = (lat: number, lon: number) =>
    `https://maps.apple.com/?ll=${lat},${lon}&z=15`;

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
        <div className="w-full h-[calc(100vh-72px)] flex flex-col">
          {currentLocation ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <iframe
                title="Apple Map"
                src={getAppleMapsUrl(currentLocation[0], currentLocation[1])}
                allowFullScreen
                className="w-full max-w-2xl h-[60vh] shadow-xl rounded-md border border-projectx-neon-blue"
                style={{ background: "#000", minHeight: 350 }}
              ></iframe>
              <a
                href={getAppleMapsUrl(currentLocation[0], currentLocation[1])}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 px-5 py-2 rounded bg-projectx-neon-blue text-white font-bold hover:bg-blue-700 transition"
              >
                Apri in Apple Maps
              </a>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white">
              <p>La posizione non è disponibile.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Map;

