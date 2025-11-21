
import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import GradientBox from "@/components/ui/gradient-box";

interface Area {
  lat: number;
  lng: number;
  radius: number;
  label: string;
  confidence: string;
}

interface BuzzMapBannerProps {
  open: boolean;
  area: Area | null;
  onClose: () => void;
}

const BuzzMapBanner = ({ open, area, onClose }: BuzzMapBannerProps) => {
  if (!open || !area) return null;

  // Format coordinates to be more readable
  const formatCoord = (coord: number) => coord.toFixed(4);
  
  // Convert radius from meters to km for display
  const radiusInKm = (area.radius / 1000).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) onClose();
    }}>
      <DialogContent className="p-0 rounded-[24px] shadow-xl backdrop-blur-md border-none">
        <GradientBox className="p-4">
          <DialogTitle className="text-lg text-white mb-2 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#00D1FF]" />
            {area.label}
          </DialogTitle>
          <DialogDescription className="text-white/90">
            <div className="space-y-2 text-sm">
              <p>
                <span className="opacity-70">Coordinate:</span>{" "}
                <span className="font-mono">
                  {formatCoord(area.lat)}, {formatCoord(area.lng)}
                </span>
              </p>
              <p>
                <span className="opacity-70">Raggio di ricerca:</span>{" "}
                <span className="font-mono font-semibold">{radiusInKm} km</span>
              </p>
              <p>
                <span className="opacity-70">Confidenza:</span>{" "}
                <Badge 
                  className={
                    area.confidence === 'Alta' 
                      ? 'bg-green-500/80' 
                      : area.confidence === 'Media' 
                        ? 'bg-yellow-500/80' 
                        : 'bg-red-500/80'
                  }
                >
                  {area.confidence}
                </Badge>
              </p>
            </div>
          </DialogDescription>
          <div className="mt-4 flex justify-end">
            <button
              className="px-4 py-2 bg-white/20 hover:bg-white/30 transition-colors rounded text-sm text-white font-medium"
              onClick={onClose}
            >
              Chiudi
            </button>
          </div>
        </GradientBox>
      </DialogContent>
    </Dialog>
  );
};

export default BuzzMapBanner;
