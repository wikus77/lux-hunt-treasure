// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useReferralCode = () => {
  const [referralCode, setReferralCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReferralCode = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching referral code:', error);
          return;
        }

        if (data?.referral_code) {
          setReferralCode(data.referral_code);
        }
      } catch (error) {
        console.error('Error in fetchReferralCode:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralCode();
  }, []);

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast({
        title: "Codice copiato!",
        description: `Il tuo codice referral ${referralCode} è stato copiato negli appunti.`,
      });
    }
  };

  return {
    referralCode,
    loading,
    copyReferralCode
  };
};