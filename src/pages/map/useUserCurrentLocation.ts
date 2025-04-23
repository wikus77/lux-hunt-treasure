
import { useEffect, useState } from "react";

export function useUserCurrentLocation() {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      position => setCurrentLocation([position.coords.latitude, position.coords.longitude]),
      _ => {} // Silent fail (same as before)
    );
  }, []);

  return currentLocation;
}
