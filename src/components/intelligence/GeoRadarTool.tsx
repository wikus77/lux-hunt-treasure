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

  const generateScanResults = () => {
    const centerLat = parseFloat(scanParams.centerLat);
    const centerLng = parseFloat(scanParams.centerLng);
    const radius = parseInt(scanParams.radius);

    // Genera risultati simulati
    const results: ScanResult[] = [];
    const numResults = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < numResults; i++) {
      const angle = (Math.random() * 360) * (Math.PI / 180);
      const distance = Math.random() * radius;
      
      const lat = centerLat + (distance / 111000) * Math.cos(angle);
      const lng = centerLng + (distance / (111000 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);

      results.push({
        lat,
        lng,
        signal: Math.random() * 100,
        confidence: Math.random() * 100,
        description: `Anomalia rilevata - Settore ${String.fromCharCode(65 + i)}`
      });
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Radar className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Geo Radar Tool</h3>
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="w-4 h-4" />
          <span>Disponibile dalla Settimana 3</span>
        </div>
      </div>

      {/* Scan Parameters */}
      <Card className="border-border rounded-xl bg-card/50 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Parametri Scansione</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="centerLat">Latitudine Centro</Label>
              <Input
                id="centerLat"
                type="number"
                step="any"
                placeholder="45.4642"
                value={scanParams.centerLat}
                onChange={(e) => setScanParams({...scanParams, centerLat: e.target.value})}
                className="bg-muted/50 border-border rounded-lg px-4 py-3 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                disabled={isScanning}
              />
            </div>
            <div>
              <Label htmlFor="centerLng">Longitudine Centro</Label>
              <Input
                id="centerLng"
                type="number"
                step="any"
                placeholder="9.1900"
                value={scanParams.centerLng}
                onChange={(e) => setScanParams({...scanParams, centerLng: e.target.value})}
                className="bg-muted/50 border-border rounded-lg px-4 py-3 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                className="bg-muted/50 border-border rounded-lg px-4 py-3 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                disabled={isScanning}
              />
            </div>
            <div>
              <Label htmlFor="label">Etichetta</Label>
              <Input
                id="label"
                placeholder="Nome scansione"
                value={scanParams.label}
                onChange={(e) => setScanParams({...scanParams, label: e.target.value})}
                className="bg-muted/50 border-border rounded-lg px-4 py-3 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
              className="rounded-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              Salva Coordinate
            </Button>
            <Button 
              onClick={handleStartScan} 
              disabled={isScanning}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Search className="w-4 h-4 mr-2" />
              {isScanning ? 'Scansione...' : 'Avvia Scansione'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      {scanParams.centerLat && scanParams.centerLng && (
        <Card className="border-border rounded-xl bg-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Mappa Interattiva</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 rounded-lg overflow-hidden">
              <MapContainer
                center={[parseFloat(scanParams.centerLat), parseFloat(scanParams.centerLng)]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={[parseFloat(scanParams.centerLat), parseFloat(scanParams.centerLng)]}>
                  <Popup>
                    Centro Scansione<br />
                    {scanParams.label || 'Punto di scansione'}
                  </Popup>
                </Marker>
                <Circle
                  center={[parseFloat(scanParams.centerLat), parseFloat(scanParams.centerLng)]}
                  radius={parseFloat(scanParams.radius)}
                  pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
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
          <Card className="border-border rounded-xl bg-card/30 backdrop-blur-sm">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Radar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              Nessuna scansione effettuata
            </CardContent>
          </Card>
        ) : (
          scans.map((scan) => (
            <Card key={scan.id} className="border-border rounded-xl bg-card/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
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
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border backdrop-blur-sm">
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