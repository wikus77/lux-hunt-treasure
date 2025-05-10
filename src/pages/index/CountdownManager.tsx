
import { useState, useEffect } from "react";
import { getMissionDeadline } from "@/utils/countdownDate";

interface CountdownManagerProps {
  onCountdownComplete: (isCompleted: boolean) => void;
}

/**
 * Manages the countdown state
 */
const CountdownManager = ({ onCountdownComplete }: CountdownManagerProps) => {
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  
  // Get target date from utility function
  const nextEventDate = getMissionDeadline();
  
  // Check if countdown has already passed
  useEffect(() => {
    const now = new Date();
    if (now > nextEventDate) {
      setCountdownCompleted(true);
      onCountdownComplete(true);
    } else {
      onCountdownComplete(false);
    }
  }, [nextEventDate, onCountdownComplete]);

  return null; // This is a logic-only component, no rendering
};

export default CountdownManager;
