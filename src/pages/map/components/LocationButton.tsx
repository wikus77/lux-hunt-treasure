
import React from 'react';
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface LocationButtonProps {
  requestLocationPermission: () => void;
}

const LocationButton: React.FC<LocationButtonProps> = ({ requestLocationPermission }) => {
  return (
    <div className="absolute top-4 right-4 z-20">
      <Button
        onClick={requestLocationPermission}
        className="bg-black/50 hover:bg-black/70 text-white border border-white/20"
        size="sm"
      >
        <MapPin className="mr-1 h-4 w-4" />
        Posizione
      </Button>
    </div>
  );
};

export default LocationButton;
