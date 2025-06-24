
import React from 'react';
import { Button } from "@/components/ui/button";
import { Locate } from "lucide-react";

interface LocationButtonProps {
  requestLocationPermission?: () => void;
}

const LocationButton: React.FC<LocationButtonProps> = ({ requestLocationPermission }) => {
  const handleClick = () => {
    if (requestLocationPermission) {
      requestLocationPermission();
    }
  };

  return (
    <div className="absolute top-6 right-6 z-20">
      <Button
        onClick={handleClick}
        variant="outline"
        size="icon"
        className="bg-black/50 border border-cyan-500/30 rounded-full h-10 w-10 hover:bg-black/70 hover:border-cyan-500/60"
      >
        <Locate className="h-5 w-5 text-cyan-400" />
      </Button>
    </div>
  );
};

export default LocationButton;
