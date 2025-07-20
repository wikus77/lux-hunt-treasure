// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT

import React, { useState, useEffect, useRef } from 'react';
import { Target, AlertTriangle, MapPin, Crosshair } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface FinalShotResult {
  success: boolean;
  is_winner: boolean;
  distance_meters: number;
  direction: string;
  attempt_number: number;
  max_attempts: number;
  target_coordinates?: { lat: number; lng: number };
  error?: string;
}

interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const FinalShotPage: React.FC = () => {
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [cooldownEnd, setCooldownEnd] = useState<Date | null>(null);
  const { toast } = useToast();
  const mapRef = useRef<any>(null);

  // Mock mission ID - in real app would come from context
  const currentMissionId = 'mock-mission-id';

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from('final_shots')
        .select('*')
        .eq('mission_id', currentMissionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAttempts(data || []);
      
      // Set cooldown if last attempt was recent
      if (data && data.length > 0) {
        const lastAttempt = new Date(data[0].created_at);
        const cooldown = new Date(lastAttempt.getTime() + 12 * 60 * 60 * 1000); // 12 hours
        if (cooldown > new Date()) {
          setCooldownEnd(cooldown);
        }
      }
    } catch (error) {
      console.error('Error loading attempts:', error);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
    setShowConfirmation(true);
  };

  const submitFinalShot = async () => {
    if (!selectedPosition) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('submit_final_shot', {
        p_mission_id: currentMissionId,
        p_latitude: selectedPosition.lat,
        p_longitude: selectedPosition.lng
      });

      if (error) throw error;

      const result = data as unknown as FinalShotResult;

      if (result.error) {
        toast({
          title: "Errore",
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      if (result.is_winner) {
        toast({
          title: "🎯 VINCITORE!",
          description: "Complimenti! Hai trovato il premio!",
          variant: "default"
        });
      } else {
        toast({
          title: "Final Shot Registrato",
          description: `Distanza: ${(result.distance_meters / 1000).toFixed(2)} km | Direzione: ${result.direction}`,
          variant: "default"
        });
      }

      // Set cooldown
      setCooldownEnd(new Date(Date.now() + 12 * 60 * 60 * 1000));
      
      // Reload attempts
      await loadAttempts();
      
      // Clear selection and hide confirmation
      setSelectedPosition(null);
      setShowConfirmation(false);

    } catch (error) {
      console.error('Error submitting final shot:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'invio del Final Shot",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRemainingAttempts = () => {
    const maxAttempts = 5;
    return Math.max(0, maxAttempts - attempts.length);
  };

  const getCooldownTime = () => {
    if (!cooldownEnd) return null;
    const now = new Date();
    const diff = cooldownEnd.getTime() - now.getTime();
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const isDisabled = getRemainingAttempts() === 0 || !!getCooldownTime();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-primary flex items-center justify-center shadow-xl shadow-cyan-500/20">
            <Target className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-cyan-400 glow-text">FINAL</span>
            <span className="text-white"> SHOT</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Clicca sulla mappa per dichiarare la posizione finale del premio
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{getRemainingAttempts()}</div>
            <div className="text-sm text-muted-foreground">Tentativi Rimasti</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {getCooldownTime() || "Pronto"}
            </div>
            <div className="text-sm text-muted-foreground">Cooldown</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{attempts.length}</div>
            <div className="text-sm text-muted-foreground">Shot Effettuati</div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map */}
      <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md shadow-2xl shadow-cyan-500/10">
        <CardHeader>
          <CardTitle className="text-xl text-center bg-gradient-to-r from-cyan-400 to-primary bg-clip-text text-transparent flex items-center justify-center gap-2">
            <MapPin className="w-6 h-6 text-cyan-400" />
            Mappa Final Shot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-xl overflow-hidden border-2 border-cyan-500/20">
            <MapContainer
              center={[45.4642, 9.1900]} // Milan coordinates as default
              zoom={18}
              minZoom={18}
              maxZoom={20}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              
              {!isDisabled && (
                <MapClickHandler onMapClick={handleMapClick} />
              )}
              
              {selectedPosition && (
                <Marker position={[selectedPosition.lat, selectedPosition.lng]}>
                  <Popup>
                    <div className="text-center">
                      <div className="font-bold text-cyan-600">Posizione Selezionata</div>
                      <div className="text-sm">
                        {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          {isDisabled && (
            <div className="mt-4 text-center text-sm text-muted-foreground p-3 bg-muted/40 rounded-xl">
              {getRemainingAttempts() === 0 && "Hai esaurito tutti i tentativi disponibili"}
              {getCooldownTime() && `Prossimo tentativo disponibile tra: ${getCooldownTime()}`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmation && selectedPosition && (
        <Card className="border-2 border-red-500/50 rounded-2xl bg-red-500/10 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-xl font-bold text-white">Conferma Final Shot</h3>
              </div>
              
              <p className="text-gray-300">
                Stai dichiarando che il premio si trova in questo punto.
              </p>
              
              <div className="text-sm text-gray-400 font-mono bg-black/20 p-3 rounded-lg">
                📍 {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
              </div>
              
              <p className="text-yellow-400 font-medium">
                Hai solo {getRemainingAttempts()} tentativi totali per questa missione. Confermi?
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmation(false);
                    setSelectedPosition(null);
                  }}
                  className="px-6"
                >
                  Annulla
                </Button>
                
                <Button
                  onClick={submitFinalShot}
                  disabled={isSubmitting}
                  className="px-8 bg-gradient-to-r from-cyan-500 to-primary hover:from-cyan-600 hover:to-primary/90 text-white shadow-lg hover:shadow-2xl hover:shadow-cyan-500/30"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Invio...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      🎯 LANCIA IL TUO FINAL SHOT
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinalShotPage;