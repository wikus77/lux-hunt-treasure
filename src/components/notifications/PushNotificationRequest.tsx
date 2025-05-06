
import React from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, BellOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog';

interface PushNotificationRequestProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PushNotificationRequest: React.FC<PushNotificationRequestProps> = ({
  open,
  onOpenChange
}) => {
  const { isSupported, permission, loading, requestPermission } = usePushNotifications();

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result.success) {
      onOpenChange(false);
    }
  };

  if (isSupported === false) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-black border border-projectx-blue">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-projectx-pink" />
              Notifiche non supportate
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-gray-300">
            Il tuo browser o dispositivo non supporta le notifiche push.
            Prova ad utilizzare un browser più recente o un dispositivo diverso.
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>
              Ho capito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black border border-projectx-blue">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-projectx-blue" />
            Attiva le notifiche push
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-300 mb-4">
            Ricevi notifiche in tempo reale sui nuovi indizi, aggiornamenti e eventi speciali, anche quando non stai utilizzando l'app.
          </p>
          
          {permission === 'denied' ? (
            <div className="p-3 rounded-md bg-projectx-deep-blue/50 border border-projectx-pink/30 flex items-center gap-2">
              <BellOff className="w-5 h-5 text-projectx-pink flex-shrink-0" />
              <p className="text-sm text-gray-300">
                Le notifiche sono state bloccate. Vai nelle impostazioni del browser per abilitarle.
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="relative">
                <Bell className="w-20 h-20 text-projectx-blue animate-pulse" />
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-projectx-pink rounded-full flex items-center justify-center text-xs text-white">
                  1
                </span>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-white text-white hover:bg-white/10"
          >
            Più tardi
          </Button>
          
          {permission !== 'denied' && (
            <Button
              onClick={handleRequestPermission}
              disabled={loading || permission === 'granted'}
              className="bg-gradient-to-r from-projectx-blue to-projectx-pink hover:from-projectx-blue/90 hover:to-projectx-pink/90"
            >
              {loading ? (
                <>Attivazione in corso...</>
              ) : permission === 'granted' ? (
                <>Notifiche attivate</>
              ) : (
                <>Attiva notifiche</>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PushNotificationRequest;
