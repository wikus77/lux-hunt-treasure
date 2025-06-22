
import { useState, useEffect } from "react";

interface Mission {
  id: string;
  name: string;
  status: "active" | "completed" | "pending";
  progress: number;
  timeLeft: string;
}

export function useMissionManager() {
  const [currentMission, setCurrentMission] = useState<Mission>({
    id: "M001",
    name: "Caccia al Tesoro Urbano",
    status: "active",
    progress: 62,
    timeLeft: "48:00:00"
  });

  return { currentMission, setCurrentMission };
}
