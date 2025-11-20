// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import React, { useState, useEffect } from 'react';
import { Radar, Search, MapPin, AlertTriangle, Save } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import 'leaflet/dist/leaflet.css';

// Fix per icone Leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RadarScan {
  id: string;
  centerLat: number;
  centerLng: number;
  radius: number;
  scanResults: ScanResult[];
  timestamp: Date;
}

interface ScanResult {
  lat: number;
  lng: number;
  signal: number;
  confidence: number;
  description: string;
}

const GeoRadarTool: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scans, setScans] = useState<RadarScan[]>([]);
  const [scanParams, setScanParams] = useState({
    centerLat: '',
    centerLng: '',
    radius: '1000',
    label: ''
  });
  const [savedCoordinates, setSavedCoordinates] = useState<any[]>([]);

  useEffect(() => {
    loadSavedCoordinates();
  }, []);

  const loadSavedCoordinates = async () => {
    try {
      const { data, error } = await supabase
        .from('geo_radar_coordinates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setSavedCoordinates(data);
    } catch (error) {
      console.error('Errore nel caricamento coordinate:', error);
    }
  };

  const handleSaveCoordinates = async () => {
    if (!scanParams.centerLat || !scanParams.centerLng || !scanParams.label) {
      toast.error('Compila tutti i campi richiesti');
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Devi essere autenticato per salvare');
        return;
      }

      const { error } = await supabase
        .from('geo_radar_coordinates')
        .insert({
          user_id: userData.user.id,
          lat: parseFloat(scanParams.centerLat),
          lng: parseFloat(scanParams.centerLng),
          label: scanParams.label,
          radius: parseFloat(scanParams.radius)
        });

      if (error) throw error;
      toast.success('Coordinate salvate con successo');
      loadSavedCoordinates();
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      toast.error('Errore nel salvataggio coordinate');
    }
  };

  const handleStartScan = async () => {
    if (!scanParams.centerLat || !scanParams.centerLng) {
      toast.error('Inserisci coordinate valide');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);

    // Simulazione scansione
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsScanning(false);
          generateScanResults();
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const checkTargetProximity = (lat: number, lng: number) => {
    // Simulated target coordinates - in real app would come from mission data
    const targetLat = 46.0; // Vista europea generica
    const targetLng = 8.0;
    
    // Calculate distance in meters
    const R = 6371000; // Earth radius in meters
    const dLat = (targetLat - lat) * Math.PI / 180;
    const dLng = (targetLng - lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance <= 3000; // 3km radius check
  };

  const generateScanResults = () => {
    const centerLat = parseFloat(scanParams.centerLat);
    const centerLng = parseFloat(scanParams.centerLng);
    const radius = parseInt(scanParams.radius);

    // Check if coordinates are within 3km of target
    const isNearTarget = checkTargetProximity(centerLat, centerLng);

    // Generate results based on proximity to target
    const results: ScanResult[] = [];
    const numResults = isNearTarget ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < numResults; i++) {
      const angle = (Math.random() * 360) * (Math.PI / 180);
      const distance = Math.random() * radius;
      
      const lat = centerLat + (distance / 111000) * Math.cos(angle);
      const lng = centerLng + (distance / (111000 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);

      // Higher signal strength if near target
      const baseSignal = isNearTarget ? 60 + Math.random() * 40 : Math.random() * 60;
      const baseConfidence = isNearTarget ? 70 + Math.random() * 30 : Math.random() * 70;

      results.push({
        lat,
        lng,
        signal: baseSignal,
        confidence: baseConfidence,
        description: isNearTarget 
          ? `⚠️ SIGNAL FORTE - Settore ${String.fromCharCode(65 + i)}` 
          : `Anomalia rilevata - Settore ${String.fromCharCode(65 + i)}`
      });
    }

    // Add proximity feedback
    if (isNearTarget) {
      toast.success('⚠️ RADAR: Segnali anomali rilevati! Possibile obiettivo nelle vicinanze!');
    } else {
      toast.success('✅ RADAR: Scansione completata - Area sicura');
    }

    const scan: RadarScan = {
      id: crypto.randomUUID(),
      centerLat,
      centerLng,
      radius,
      scanResults: results,
      timestamp: new Date()
    };

    setScans([scan, ...scans]);
    setScanProgress(0);
    toast.success(`Scansione completata - ${results.length} anomalie rilevate`);
  };

  const getSignalColor = (signal: number) => {
    if (signal > 70) return 'text-red-500';
    if (signal > 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-primary flex items-center justify-center shadow-xl shadow-cyan-500/20">
            <Radar className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Geo Radar Tool</h3>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="w-4 h-4" />
          <span>Disponibile dalla Settimana 3</span>
        </div>
      </div>

      {/* Scan Parameters */}
      <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md shadow-2xl shadow-cyan-500/10">
        <CardHeader className="border-b-0">
          <CardTitle className="text-xl text-center bg-gradient-to-r from-cyan-400 to-primary bg-clip-text text-transparent">
            Parametri Scansione
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="centerLat">Latitudine Centro</Label>
              <Input
                id="centerLat"
                type="number"
                step="any"
                placeholder="46.0 [COORD-LAT]"
                value={scanParams.centerLat}
                onChange={(e) => setScanParams({...scanParams, centerLat: e.target.value})}
                className="bg-muted/60 border-2 border-border/50 rounded-xl px-4 py-4 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all duration-300 text-lg"
                disabled={isScanning}
              />
            </div>
            <div>
              <Label htmlFor="centerLng">Longitudine Centro</Label>
              <Input
                id="centerLng"
                type="number"
                step="any"
                placeholder="8.0 [COORD-LNG]"
                value={scanParams.centerLng}
                onChange={(e) => setScanParams({...scanParams, centerLng: e.target.value})}
                className="bg-muted/60 border-2 border-border/50 rounded-xl px-4 py-4 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all duration-300 text-lg"
                disabled={isScanning}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="radius">Raggio (metri)</Label>
              <Input
                id="radius"
                type="number"
                min="100"
                max="5000"
                value={scanParams.radius}
                onChange={(e) => setScanParams({...scanParams, radius: e.target.value})}
                className="bg-muted/60 border-2 border-border/50 rounded-xl px-4 py-4 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all duration-300 text-lg"
                disabled={isScanning}
              />
            </div>
            <div>
              <Label htmlFor="label">Etichetta</Label>
              <Input
                id="label"
                placeholder="SCAN-ID [Nome scansione]"
                value={scanParams.label}
                onChange={(e) => setScanParams({...scanParams, label: e.target.value})}
                className="bg-muted/60 border-2 border-border/50 rounded-xl px-4 py-4 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all duration-300 text-lg"
                disabled={isScanning}
              />
            </div>
          </div>

          {isScanning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scansione in corso...</span>
                <span>{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={handleSaveCoordinates} 
              disabled={isScanning}
              variant="outline"
              className="rounded-xl border-2 border-cyan-400/30 hover:border-cyan-400 hover:bg-cyan-400/10 transition-all duration-300"
            >
              <Save className="w-4 h-4 mr-2" />
              Salva Coordinate
            </Button>
            <Button 
              onClick={handleStartScan} 
              disabled={isScanning}
              className="bg-gradient-to-r from-cyan-500 via-primary to-primary/80 hover:from-cyan-400 hover:to-primary/90 rounded-xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
            >
              <Search className="w-4 h-4 mr-2" />
              {isScanning ? 'Scansione...' : 'Avvia Scansione'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      {scanParams.centerLat && scanParams.centerLng && (
        <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md shadow-2xl shadow-cyan-500/10">
          <CardHeader className="border-b-0">
            <CardTitle className="text-xl text-center bg-gradient-to-r from-cyan-400 to-primary bg-clip-text text-transparent">
              🗺 Mappa Tattica Interattiva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 rounded-2xl overflow-hidden border-2 border-cyan-500/20 shadow-inner">
              <MapContainer
                center={[parseFloat(scanParams.centerLat), parseFloat(scanParams.centerLng)]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; M1SSION™ Tactical Map'
                />
                <Marker position={[parseFloat(scanParams.centerLat), parseFloat(scanParams.centerLng)]}>
                  <Popup>
                    <div className="text-center">
                      <strong>Centro Scansione M1SSION™</strong><br />
                      {scanParams.label || 'Punto di scansione'}<br />
                      <span className="text-xs font-mono">
                        {parseFloat(scanParams.centerLat).toFixed(6)}, {parseFloat(scanParams.centerLng).toFixed(6)}
                      </span>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={[parseFloat(scanParams.centerLat), parseFloat(scanParams.centerLng)]}
                  radius={parseFloat(scanParams.radius)}
                  pathOptions={{ 
                    color: '#00FFFF', 
                    fillColor: '#00FFFF', 
                    fillOpacity: 0.1,
                    weight: 3,
                    dashArray: '10, 5'
                  }}
                />
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan Results */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground">Risultati Scansioni</h4>
        
        {scans.length === 0 ? (
          <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/40 backdrop-blur-md">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Radar className="w-16 h-16 mx-auto mb-6 opacity-50" />
              <p className="text-lg">Nessuna scansione effettuata</p>
            </CardContent>
          </Card>
        ) : (
          scans.map((scan) => (
            <Card key={scan.id} className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Scansione {scan.timestamp.toLocaleTimeString()}</span>
                  <span className="text-sm text-muted-foreground">
                    {scan.scanResults.length} anomalie
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-sm text-muted-foreground">
                  Centro: {scan.centerLat.toFixed(6)}, {scan.centerLng.toFixed(6)} | 
                  Raggio: {scan.radius}m
                </div>
                
                <div className="space-y-3">
                  {scan.scanResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/60 rounded-2xl border-2 border-border/50 backdrop-blur-md hover:border-cyan-400/30 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-primary" />
                        <div>
                          <div className="font-medium">{result.description}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {result.lat.toFixed(6)}, {result.lng.toFixed(6)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getSignalColor(result.signal)}`}>
                          {result.signal.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Conf: {result.confidence.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default GeoRadarTool;