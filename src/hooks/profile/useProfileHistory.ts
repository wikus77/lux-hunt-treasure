
import { useState } from "react";

export const useProfileHistory = () => {
  // Operational history
  const [history, setHistory] = useState([
    { type: "access", date: "2025-05-03T14:30:00", details: "Login da dispositivo principale" },
    { type: "mission", date: "2025-05-02T10:15:00", details: "Completata Missione: Enigma della Strada" },
    { type: "clue", date: "2025-05-01T16:20:00", details: "Acquistato indizio CL-445: 'Tracce digitali'" },
    { type: "communication", date: "2025-04-30T08:45:00", details: "Nuova comunicazione da HQ: Aggiornamento missione" }
  ]);

  return {
    history,
    setHistory
  };
};
