// by Joseph Mulé – M1SSION™ – Abuse Protection Hook
import { supabase } from '@/integrations/supabase/client';

export interface AbuseProtectionResult {
  isBlocked: boolean;
  message?: string;
}

export function useAbuseProtection() {
  const checkAbuseAndLog = async (userId: string): Promise<AbuseProtectionResult> => {
    try {
      // Check for abuse logs
      const { data: abuseData } = await supabase
        .from('abuse_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', 'buzz_press')
        .gte('timestamp', new Date(Date.now() - 30000).toISOString());
      
      if (abuseData && abuseData.length >= 5) {
        return {
          isBlocked: true,
          message: 'Troppi tentativi. Riprova tra qualche secondo.'
        };
      }
      
      // Log abuse attempt
      await supabase.from('abuse_logs').insert({
        user_id: userId,
        event_type: 'buzz_press'
      });

      return { isBlocked: false };
    } catch (error) {
      console.error('Error in abuse protection:', error);
      return { isBlocked: false };
    }
  };

  return { checkAbuseAndLog };
}