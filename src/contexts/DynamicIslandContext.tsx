
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DynamicIslandState {
  isActive: boolean;
  status: string;
  mission?: string;
  progress?: number;
  route?: string;
}

interface DynamicIslandContextType {
  state: DynamicIslandState;
  updateActivity: (activity: Partial<DynamicIslandState>) => void;
  endActivity: () => void;
}

const DynamicIslandContext = createContext<DynamicIslandContextType | undefined>(undefined);

export const DynamicIslandProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DynamicIslandState>({
    isActive: false,
    status: '',
  });

  const updateActivity = (activity: Partial<DynamicIslandState>) => {
    setState(prev => ({
      ...prev,
      ...activity,
      isActive: true
    }));
  };

  const endActivity = () => {
    setState({
      isActive: false,
      status: '',
    });
  };

  return (
    <DynamicIslandContext.Provider value={{ state, updateActivity, endActivity }}>
      {children}
    </DynamicIslandContext.Provider>
  );
};

export const useDynamicIsland = () => {
  const context = useContext(DynamicIslandContext);
  if (context === undefined) {
    throw new Error('useDynamicIsland must be used within a DynamicIslandProvider');
  }
  return context;
};
