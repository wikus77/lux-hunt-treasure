// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// @ts-nocheck

import { createContext, useContext, ReactNode } from 'react';

interface AgentContextType {
  userId: string | null;
  role: string;
  agentCode: string | null;
}

const AgentContext = createContext<AgentContextType>({
  userId: null,
  role: 'user',
  agentCode: null
});

export const useAgentContext = () => useContext(AgentContext);

export const AgentProvider = ({ children }: { children: ReactNode }) => (
  <AgentContext.Provider value={{ userId: null, role: 'user', agentCode: null }}>
    {children}
  </AgentContext.Provider>
);

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
