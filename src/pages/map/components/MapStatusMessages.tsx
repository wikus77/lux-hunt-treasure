
import React from 'react';
import { Spinner } from '@/components/ui/spinner';

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
          className="absolute bottom-4 left-0 right-0 mx-auto w-max px-6 py-2 bg-black/70 text-white rounded-full text-sm cursor-pointer"
          onClick={retryGetLocation}
        >
          Posizione non disponibile. Tocca per attivare.
        </div>
      )}
      
      {isLoading && !locationReceived && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white p-4 rounded-md">
          <Spinner size="md" className="border-cyan-500 mx-auto mb-2" />
          Rilevamento posizione...
        </div>
      )}
    </>
  );
};

export default MapStatusMessages;
