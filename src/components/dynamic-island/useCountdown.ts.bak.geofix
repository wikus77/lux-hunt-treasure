
import { useState, useEffect } from "react";

export const useCountdown = () => {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const launchDate = new Date("2025-07-19T00:00:00Z").getTime();
    const updateCountdown = () => {
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.floor((launchDate - now) / 1000));
      setSecondsLeft(remaining);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return { secondsLeft };
};

export default useCountdown;
