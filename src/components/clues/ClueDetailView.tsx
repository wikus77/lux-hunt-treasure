
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from "framer-motion";
import { Calendar, MapPin, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import L from 'leaflet';

// Fix for Leaflet marker icon issue in production builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface ClueLocation {
  lat: number;
  lng: number;
  label: string;
}

interface ClueDetailViewProps {
  title: string;
  description: string;
  regionHint?: string;
  cityHint?: string;
  location: ClueLocation;
  week: number;
  isFinalWeek?: boolean;
}

const ClueDetailView: React.FC<ClueDetailViewProps> = ({
  title,
  description,
  regionHint,
  cityHint,
  location,
  week,
  isFinalWeek = false
}) => {
  useEffect(() => {
    // This is needed to properly render the map when it's mounted
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }, []);

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {/* Clue Header with Week Information */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Badge variant={isFinalWeek ? "destructive" : "secondary"} className="text-sm">
            <Calendar className="w-3 h-3 mr-1" />
            Week {week}
            {isFinalWeek && " (Final)"}
          </Badge>
        </div>
        
        {/* Clue Description */}
        <Card>
          <CardContent className="p-4 text-md">
            <p>{description}</p>
          </CardContent>
        </Card>
        
        {/* Location Hints */}
        {(regionHint || cityHint) && (
          <Card className="bg-black/50">
            <CardHeader className="py-2 px-4">
              <CardTitle className="text-lg flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-amber-400" />
                Location Hints
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4 space-y-2">
              {regionHint && (
                <div>
                  <span className="font-medium text-amber-400">Region:</span> {regionHint}
                </div>
              )}
              {cityHint && (
                <div>
                  <span className="font-medium text-amber-400">City:</span> {cityHint}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Map Component */}
        <div className="h-[400px] w-full overflow-hidden rounded-lg border border-white/10">
          <MapContainer 
            center={[location.lat, location.lng]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Circle 
              center={[location.lat, location.lng]}
              pathOptions={{ 
                fillColor: '#3B82F6', 
                fillOpacity: 0.2, 
                color: '#3B82F6',
                weight: 1
              }}
              radius={500} 
            />
            <Marker position={[location.lat, location.lng]}>
              <Popup>
                <div className="font-medium">{location.label}</div>
                <div className="text-sm text-muted-foreground">Search area for clue</div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        
        {/* Location Label */}
        <div className="flex items-center text-md text-muted-foreground">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{location.label}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ClueDetailView;
