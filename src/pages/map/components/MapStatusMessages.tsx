
import React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle, LocateFixed } from 'lucide-react';

interface MapStatusMessagesProps {
  isLoading: boolean;
  locationReceived: boolean;
  permissionDenied: boolean;
  retryGetLocation: () => void;
}

const MapStatusMessages: React.FC<MapStatusMessagesProps> = ({ 
  isLoading, 
  locationReceived, 
  permissionDenied, 
  retryGetLocation 
}) => {
  return (
    <>
      {permissionDenied && (
        <div 
          className="absolute bottom-4 left-0 right-0 mx-auto w-max px-6 py-3 bg-black/80 
                    text-white rounded-full text-sm flex items-center gap-2 cursor-pointer 
                    hover:bg-black/90 transition-colors shadow-lg"
          onClick={retryGetLocation}
        >
          <AlertCircle className="h-4 w-4 text-[#00D1FF]" />
          <span>Per vedere la tua posizione, attiva la localizzazione. Tocca per riattivare.</span>
        </div>
      )}
      
      {isLoading && !locationReceived && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-black/80 text-white p-6 rounded-[24px] flex flex-col items-center
                      shadow-lg border border-[#00D1FF]/20">
          <Spinner size="md" className="border-[#00D1FF] mx-auto mb-3" />
          <p className="text-center">Rilevamento posizione in corso...</p>
          <p className="text-xs text-[#00D1FF]/80 mt-1 text-center">Attendi mentre accediamo alla tua posizione</p>
          
          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="border-[#00D1FF]/50 text-[#00D1FF] hover:bg-[#00D1FF]/10"
              onClick={retryGetLocation}
            >
              <LocateFixed className="h-4 w-4 mr-1" />
              Riprova
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default MapStatusMessages;
