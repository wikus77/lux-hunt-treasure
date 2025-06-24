
import { useState, useEffect } from "react";

interface Mission {
  id: string;
  name: string;
  status: "active" | "completed" | "pending";
  progress: number;
  timeLeft: string;
  foundClues: number;
  totalClues: number;
}

export function useMissionManager() {
  const [currentMission, setCurrentMission] = useState<Mission>({
    id: "M001",
    name: "Caccia al Tesoro Urbano",
    status: "active",
    progress: 62,
    timeLeft: "48:00:00",
    foundClues: 3,
    totalClues: 12
  });

  const updateMissionProgress = (newProgress: number) => {
    setCurrentMission(prev => ({
      ...prev,
      progress: newProgress,
      foundClues: Math.floor((newProgress / 100) * prev.totalClues)
    }));
  };

  return { 
    currentMission, 
    setCurrentMission,
    updateMissionProgress
  };
}
