// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QRInlineMap } from './QRInlineMap';
import { MapPin } from 'lucide-react';

interface AdminPanelMapViewProps {
  selectedLat?: number;
  selectedLng?: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export const AdminPanelMapView: React.FC<AdminPanelMapViewProps> = ({
  selectedLat,
  selectedLng,
  onLocationChange
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Mappa Amministrativa
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Clicca sulla mappa per selezionare una posizione per i QR marker
        </p>
      </CardHeader>
      <CardContent>
        <QRInlineMap
          lat={selectedLat}
          lng={selectedLng}
          onChange={onLocationChange}
        />
        {selectedLat && selectedLng && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Posizione selezionata:</p>
            <p className="text-xs text-muted-foreground">
              Lat: {selectedLat.toFixed(6)}, Lng: {selectedLng.toFixed(6)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};