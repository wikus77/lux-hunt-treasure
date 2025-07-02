
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Mission {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  foundClues: number;
  totalClues: number;
  progress: number;
}

interface MissionContextType {
  currentMission: Mission | null;
  missions: Mission[];
  updateMissionProgress: (cluesFound: number) => void;
  completeMission: (missionId: string) => void;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentMission, setCurrentMission] = useState<Mission | null>({
    id: '1',
    title: 'M1SSION Roma',
    description: 'Trova tutti gli indizi a Roma',
    status: 'active',
    foundClues: 0,
    totalClues: 10,
    progress: 0
  });

  const [missions] = useState<Mission[]>([]);

  const updateMissionProgress = (cluesFound: number) => {
    if (currentMission) {
      setCurrentMission(prev => prev ? {
        ...prev,
        foundClues: cluesFound,
        progress: Math.round((cluesFound / prev.totalClues) * 100)
      } : null);
    }
  };

  const completeMission = (missionId: string) => {
    if (currentMission?.id === missionId) {
      setCurrentMission(prev => prev ? {
        ...prev,
        status: 'completed',
        progress: 100
      } : null);
    }
  };

  return (
    <MissionContext.Provider value={{ 
      currentMission, 
      missions, 
      updateMissionProgress, 
      completeMission 
    }}>
      {children}
    </MissionContext.Provider>
  );
};

export const useMissionManager = () => {
  const context = useContext(MissionContext);
  if (context === undefined) {
    throw new Error('useMissionManager must be used within a MissionProvider');
  }
  return context;
};
