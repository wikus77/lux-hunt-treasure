
import { useEffect } from 'react';
import { useDynamicIsland } from './useDynamicIsland';
import { useAuth } from './useAuth';

export const useDynamicIslandSafety = () => {
  const { forceEndActivity } = useDynamicIsland();
  const { user } = useAuth();

  // Chiusura di sicurezza al logout o disconnessione
  useEffect(() => {
    if (!user) {
      console.log('🔒 User logged out or session expired - forcing Live Activity closure');
      forceEndActivity();
    }
  }, [user, forceEndActivity]);

  // Chiusura di sicurezza prima dell'unmount della pagina
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🔄 Page unloading - attempting to close Live Activity');
      forceEndActivity();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [forceEndActivity]);

  return { forceEndActivity };
};
