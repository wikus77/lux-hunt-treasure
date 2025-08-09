// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { QrCode, MapPin, Target, Plus } from 'lucide-react';
import { redPulseIcon } from './redPulseIcon';

interface QRLocation {
  id: string;
  reward_type: string;
  message: string;
  lat: number;
  lon: number;
  location_name: string;
  max_distance_meters: number;
  attivo: boolean;
  scansioni: number;
}

interface QRMapIntegrationProps {
  isAdminMode?: boolean;
}

export const QRMapIntegration: React.FC<QRMapIntegrationProps> = ({ isAdminMode = false }) => {
  const [qrLocations, setQrLocations] = useState<QRLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQRForm, setNewQRForm] = useState({
    locationName: '',
    rewardType: 'buzz_gratis' as string,
    message: '',
    maxDistance: 100
  });

  useEffect(() => {
    loadQRLocations();
  }, []);

  const loadQRLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_rewards')
        .select('*')
        .eq('attivo', true);

      if (error) throw error;
      setQrLocations(data || []);
    } catch (error) {
      console.error('Error loading QR locations:', error);
      toast.error('Errore nel caricamento delle posizioni QR');
    } finally {
      setIsLoading(false);
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (isAdminMode) {
          setSelectedPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
          setShowAddForm(true);
        }
      },
    });
    return null;
  };

  const createQRAtPosition = async () => {
    if (!selectedPosition || !newQRForm.locationName.trim()) {
      toast.error('Inserisci nome posizione');
      return;
    }

    try {
      // Generate unique code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_qr_code');

      if (codeError) throw codeError;

      const { data: { user } } = await supabase.auth.getUser();
      const creatorId = user?.id || 'system';

      // Insert QR reward
      const { error: insertError } = await supabase
        .from('qr_rewards')
        .insert({
          id: codeData,
          reward_type: newQRForm.rewardType,
          message: newQRForm.message || 'Reward M1SSION™ dalla mappa!',
          lat: selectedPosition.lat,
          lon: selectedPosition.lng,
          location_name: newQRForm.locationName,
          max_distance_meters: newQRForm.maxDistance,
          attivo: true,
          scansioni: 0,
          creato_da: creatorId
        });

      if (insertError) throw insertError;

      toast.success(`QR Code ${codeData} creato in ${newQRForm.locationName}!`);
      
      // Reset form
      setNewQRForm({
        locationName: '',
        rewardType: 'buzz_gratis',
        message: '',
        maxDistance: 100
      });
      setSelectedPosition(null);
      setShowAddForm(false);
      
      // Reload locations
      loadQRLocations();

    } catch (error) {
      console.error('Error creating QR:', error);
      toast.error('Errore nella creazione del QR code');
    }
  };

  const handleQRClick = (qr: QRLocation) => {
    const currentDomain = window.location.origin;
    const qrUrl = `${currentDomain}/qr/validate?token=${qr.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `QR M1SSION™ - ${qr.location_name}`,
        text: `Scansiona questo QR per il tuo reward M1SSION™!`,
        url: qrUrl
      });
    } else {
      navigator.clipboard.writeText(qrUrl);
      toast.success('Link QR copiato negli appunti!');
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'buzz_gratis': return '⚡';
      case 'indizio_segreto': return '🔍';
      case 'enigma_misterioso': return '🧩';
      case 'sorpresa_speciale': return '🌀';
      default: return '📱';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <QrCode className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">QR Map Integration</h3>
        </div>
        {isAdminMode && (
          <div className="text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 inline mr-1" />
            Clicca sulla mappa per aggiungere QR
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-[400px] rounded-lg overflow-hidden border">
        <MapContainer
          center={[41.9028, 12.4964]} // Rome center
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapClickHandler />

          {/* Existing QR locations */}
          {qrLocations.map((qr) => (
            <Marker
              key={qr.id}
              position={[qr.lat, qr.lon]}
              icon={redPulseIcon}
              eventHandlers={{
                click: () => handleQRClick(qr)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getRewardIcon(qr.reward_type)}</span>
                    <strong className="text-sm">{qr.location_name}</strong>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {qr.message}
                  </p>
                  <div className="flex justify-between text-xs">
                    <span>Scansioni: {qr.scansioni}</span>
                    <span>{qr.max_distance_meters}m</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-2" 
                    onClick={() => handleQRClick(qr)}
                  >
                    <QrCode className="w-3 h-3 mr-1" />
                    Condividi QR
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* New position marker */}
          {selectedPosition && (
            <Marker
              position={[selectedPosition.lat, selectedPosition.lng]}
              icon={redPulseIcon}
            >
              <Popup>
                <div className="p-2">
                  <strong>Nuova posizione QR</strong>
                  <p className="text-xs text-muted-foreground">
                    {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-sm">QR Attivi</span>
            </div>
            <p className="text-lg font-bold">{qrLocations.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Scansioni</span>
            </div>
            <p className="text-lg font-bold">
              {qrLocations.reduce((sum, qr) => sum + qr.scansioni, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-500" />
              <span className="text-sm">Aree Coperte</span>
            </div>
            <p className="text-lg font-bold">
              {new Set(qrLocations.map(qr => qr.location_name)).size}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add QR Form */}
      {showAddForm && selectedPosition && isAdminMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Aggiungi QR alla Mappa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome Posizione</Label>
                <Input
                  value={newQRForm.locationName}
                  onChange={(e) => setNewQRForm(prev => ({ 
                    ...prev, 
                    locationName: e.target.value 
                  }))}
                  placeholder="es. Fontana di Trevi"
                />
              </div>
              
              <div>
                <Label>Tipo Reward</Label>
                <Select
                  value={newQRForm.rewardType}
                  onValueChange={(value) => setNewQRForm(prev => ({ 
                    ...prev, 
                    rewardType: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buzz_gratis">⚡ Buzz Gratuito</SelectItem>
                    <SelectItem value="indizio_segreto">🔍 Indizio Segreto</SelectItem>
                    <SelectItem value="enigma_misterioso">🧩 Enigma Misterioso</SelectItem>
                    <SelectItem value="sorpresa_speciale">🌀 Sorpresa Speciale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Messaggio Reward</Label>
              <Input
                value={newQRForm.message}
                onChange={(e) => setNewQRForm(prev => ({ 
                  ...prev, 
                  message: e.target.value 
                }))}
                placeholder="Messaggio per il reward"
              />
            </div>

            <div>
              <Label>Distanza Massima (metri)</Label>
              <Input
                type="number"
                value={newQRForm.maxDistance}
                onChange={(e) => setNewQRForm(prev => ({ 
                  ...prev, 
                  maxDistance: parseInt(e.target.value) || 100
                }))}
                min="10"
                max="1000"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={createQRAtPosition} className="flex-1">
                <QrCode className="w-4 h-4 mr-2" />
                Crea QR
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedPosition(null);
                }}
              >
                Annulla
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 inline mr-1" />
              Posizione: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
