/**
 * AGENT CUSTOMIZATION HOOK
 * Handles saving/loading agent selection to localStorage + Supabase
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { getDefaultAgent, getAgentById } from './agentCatalog';

const STORAGE_KEY = 'agent_customization_v2';
const SAVE_DEBOUNCE_MS = 1500;

export interface AgentCustomizationState {
  selectedAgentId: string;
  ownedAgents: string[];
  skinToneId: string;
}

const DEFAULT_STATE: AgentCustomizationState = {
  selectedAgentId: getDefaultAgent().id,
  ownedAgents: [],
  skinToneId: 'skin_medium',
};

interface UseAgentCustomizationReturn {
  state: AgentCustomizationState;
  isLoading: boolean;
  isSaving: boolean;
  
  // Actions
  selectAgent: (agentId: string) => void;
  addOwnedAgent: (agentId: string) => void;
  setSkinTone: (skinToneId: string) => void;
  saveCustomization: () => Promise<void>;
  
  // Helpers
  isAgentOwned: (agentId: string) => boolean;
  getSelectedAgent: () => ReturnType<typeof getAgentById>;
}

export function useAgentCustomization(): UseAgentCustomizationReturn {
  const { user } = useAuth();
  const [state, setState] = useState<AgentCustomizationState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef(false);

  // Load customization
  const loadCustomization = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Load from localStorage for instant display
      const localData = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setState({
            ...DEFAULT_STATE,
            ...parsed,
          });
        } catch (e) {
          console.warn('[AgentCustomization] Invalid localStorage data');
        }
      }

      // 2. Try to load from Supabase
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('agent_customization')
          .eq('id', user.id)
          .maybeSingle();

        if (error && error.code !== '42703') {
          console.error('[AgentCustomization] Supabase load error:', error.message);
        } else if (profile?.agent_customization) {
          const dbData = profile.agent_customization as AgentCustomizationState;
          if (dbData) {
            setState({
              ...DEFAULT_STATE,
              ...dbData,
            });
            localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(dbData));
          }
        }
      } catch (dbError) {
        console.warn('[AgentCustomization] Database query failed:', dbError);
      }
    } catch (error) {
      console.error('[AgentCustomization] Load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCustomization();
  }, [loadCustomization]);

  // Save to localStorage
  const saveToStorage = useCallback((newState: AgentCustomizationState) => {
    if (!user?.id) return;
    localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(newState));
  }, [user?.id]);

  // Save to Supabase
  const saveToSupabase = useCallback(async (dataToSave: AgentCustomizationState) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          agent_customization: dataToSave,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error && error.code !== '42703') {
        console.error('[AgentCustomization] Supabase save error:', error.message);
      } else {
        console.log('[AgentCustomization] Saved to Supabase');
      }
    } catch (error) {
      console.error('[AgentCustomization] Save error:', error);
    }
  }, [user?.id]);

  // Debounced save
  const debouncedSave = useCallback((newState: AgentCustomizationState) => {
    pendingSaveRef.current = true;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (pendingSaveRef.current) {
        saveToSupabase(newState);
        pendingSaveRef.current = false;
      }
    }, SAVE_DEBOUNCE_MS);
  }, [saveToSupabase]);

  // Manual save
  const saveCustomization = useCallback(async () => {
    if (!user?.id) return;
    setIsSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      pendingSaveRef.current = false;
    }
    saveToStorage(state);
    await saveToSupabase(state);
    setIsSaving(false);
  }, [user?.id, state, saveToStorage, saveToSupabase]);

  // Actions
  const selectAgent = useCallback((agentId: string) => {
    setState(prev => {
      const updated = { ...prev, selectedAgentId: agentId };
      saveToStorage(updated);
      debouncedSave(updated);
      return updated;
    });
  }, [saveToStorage, debouncedSave]);

  const addOwnedAgent = useCallback((agentId: string) => {
    setState(prev => {
      if (prev.ownedAgents.includes(agentId)) return prev;
      const updated = { ...prev, ownedAgents: [...prev.ownedAgents, agentId] };
      saveToStorage(updated);
      debouncedSave(updated);
      return updated;
    });
  }, [saveToStorage, debouncedSave]);

  const setSkinTone = useCallback((skinToneId: string) => {
    setState(prev => {
      const updated = { ...prev, skinToneId };
      saveToStorage(updated);
      debouncedSave(updated);
      return updated;
    });
  }, [saveToStorage, debouncedSave]);

  // Helpers
  const isAgentOwned = useCallback((agentId: string): boolean => {
    const agent = getAgentById(agentId);
    if (!agent) return false;
    if (agent.priceM1U === 0) return true; // BASE agents are always owned
    return state.ownedAgents.includes(agentId);
  }, [state.ownedAgents]);

  const getSelectedAgent = useCallback(() => {
    return getAgentById(state.selectedAgentId) || getDefaultAgent();
  }, [state.selectedAgentId]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    isLoading,
    isSaving,
    selectAgent,
    addOwnedAgent,
    setSkinTone,
    saveCustomization,
    isAgentOwned,
    getSelectedAgent,
  };
}
