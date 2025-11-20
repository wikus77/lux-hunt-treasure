// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';

export interface AgentDNA {
  user_id: string;
  intuito: number;
  audacia: number;
  etica: number;
  rischio: number;
  vibrazione: number;
  archetype?: string;
  mutated_at?: string;
  updated_at: string;
}

export type DNAPartial = Partial<Omit<AgentDNA, 'user_id' | 'updated_at'>>;

class DNAClient {
  async ensureDna(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('ensure_agent_dna', {
        p_user: userId,
      });

      if (error) throw error;
      console.log('✅ DNA ensured for user:', userId);
    } catch (error) {
      console.error('❌ Failed to ensure DNA:', error);
      throw error;
    }
  }

  async getDna(userId: string): Promise<AgentDNA | null> {
    try {
      const { data, error } = await supabase
        .from('agent_dna')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No DNA yet, create it
          await this.ensureDna(userId);
          return this.getDna(userId);
        }
        throw error;
      }

      return data as AgentDNA;
    } catch (error) {
      console.error('❌ Failed to get DNA:', error);
      return null;
    }
  }

  async updateDna(userId: string, partial: DNAPartial): Promise<AgentDNA | null> {
    try {
      // Ensure DNA exists first
      await this.ensureDna(userId);

      const { data, error } = await supabase
        .from('agent_dna')
        .update(partial)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ DNA updated:', data);
      return data as AgentDNA;
    } catch (error) {
      console.error('❌ Failed to update DNA:', error);
      return null;
    }
  }

  // Helper: calculate DNA boost from activity (non-invasive)
  calculateActivityBoost(loginCount: number): DNAPartial {
    const baseBoost = Math.min(5, Math.floor(loginCount / 10));
    
    return {
      intuito: 50 + baseBoost,
      audacia: 50 + Math.floor(baseBoost * 0.8),
      etica: 50 + Math.floor(baseBoost * 1.2),
      rischio: 50 + Math.floor(baseBoost * 0.6),
      vibrazione: 50 + baseBoost,
    };
  }
}

export const dnaClient = new DNAClient();

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
