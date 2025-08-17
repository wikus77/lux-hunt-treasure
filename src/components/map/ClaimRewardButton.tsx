import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

interface ClaimRewardButtonProps {
  markerId: string;
}

const ClaimRewardButton: React.FC<ClaimRewardButtonProps> = ({ markerId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleClaim = async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Devi essere autenticato per riscattare i premi');
        return;
      }

      const response = await supabase.functions.invoke('claim-marker-reward', {
        body: { markerId }
      });

      if (response.error) {
        console.error('Claim error:', response.error);
        toast.error('Errore durante il riscatto del premio');
        return;
      }

      const result = response.data;

      if (result?.ok === true) {
        toast.success('Premio riscattato con successo!');
        
        if (result.nextRoute) {
          setLocation(result.nextRoute);
        }
      } else if (result?.code === 'ALREADY_CLAIMED') {
        toast.info('Hai già riscattato questo premio');
      } else {
        toast.error(result?.message || 'Errore durante il riscatto');
      }
    } catch (error) {
      console.error('Claim request failed:', error);
      toast.error('Errore di rete durante il riscatto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleClaim}
      disabled={isLoading}
      data-testid="claim-reward-cta"
      className="w-full"
    >
      {isLoading ? 'Riscattando...' : 'Riscatta'}
    </Button>
  );
};

export default ClaimRewardButton;