// M1SSION™ - Network Status Hook for Capacitor iOS
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NetworkStatus {
  connected: boolean;
  connectionType: string;
  isCapacitor: boolean;
}

export const useNetworkStatus = () => {
  const { toast } = useToast();
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    connected: true,
    connectionType: 'unknown',
    isCapacitor: false
  });

  useEffect(() => {
    const checkNetworkStatus = async () => {
      const isCapacitor = typeof window !== 'undefined' && 
        (!!(window as any).Capacitor || window.location.protocol === 'capacitor:');
      
      if (!isCapacitor) {
        // Web environment - use navigator.onLine
        setNetworkStatus({
          connected: navigator.onLine,
          connectionType: 'web',
          isCapacitor: false
        });
        return;
      }

      try {
        const { Network } = (window as any).Capacitor;
        
        if (Network) {
          // Get initial status
          const status = await Network.getStatus();
          setNetworkStatus({
            connected: status.connected,
            connectionType: status.connectionType || 'unknown',
            isCapacitor: true
          });

          // Listen for network changes
          const networkListener = Network.addListener('networkStatusChange', (status: any) => {
            const newStatus = {
              connected: status.connected,
              connectionType: status.connectionType || 'unknown',
              isCapacitor: true
            };
            
            setNetworkStatus(newStatus);
            
            if (!status.connected) {
              toast({
                title: "Connessione persa",
                description: "Controlla la tua connessione internet",
                variant: "destructive"
              });
            } else {
              toast({
                title: "Connessione ripristinata",
                description: "Sei di nuovo online",
                variant: "default"
              });
            }
          });

          return () => {
            networkListener.remove();
          };
        }
      } catch (error) {
        console.error('❌ Network status initialization error:', error);
        setNetworkStatus(prev => ({ ...prev, isCapacitor: true }));
      }
    };

    checkNetworkStatus();
  }, [toast]);

  return networkStatus;
};