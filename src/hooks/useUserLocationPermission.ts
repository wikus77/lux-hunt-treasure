
import { useState, useEffect } from "react";

// Key su localStorage per il permesso concesso/diniego
const GEO_PERMISSION_KEY = "geo_permission_granted";

export type UseUserLocationPermissionResult = {
  permission: "granted" | "denied" | "prompt";
  userLocation: [number, number] | null;
  askPermission: () => void;
  loading: boolean;
  error: string | null;
};

export function useUserLocationPermission(): UseUserLocationPermissionResult {
  const [permission, setPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(GEO_PERMISSION_KEY);
    if (stored === "granted") {
      setPermission("granted");
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
        },
        (err) => {
          setError("Impossibile ottenere la tua posizione.");
          setPermission("denied");
          setLoading(false);
        }
      );
    } else if (stored === "denied") {
      setPermission("denied");
    } else {
      setPermission("prompt");
    }
  }, []);

  // Funzione per chiedere esplicitamente il permesso
  const askPermission = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPermission("granted");
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        localStorage.setItem(GEO_PERMISSION_KEY, "granted");
        setLoading(false);
      },
      (err) => {
        setError("Permesso negato per la posizione.");
        setPermission("denied");
        localStorage.setItem(GEO_PERMISSION_KEY, "denied");
        setLoading(false);
      }
    );
  };

  return { permission, userLocation, askPermission, loading, error };
}
