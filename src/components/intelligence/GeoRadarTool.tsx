// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import React, { useState } from 'react';
import { Radar, Search, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

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
    radius: '1000'
  });

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
      <Card className="border-border">
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
                className="bg-muted border-border"
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
                className="bg-muted border-border"
                disabled={isScanning}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="radius">Raggio Scansione (metri)</Label>
            <Input
              id="radius"
              type="number"
              min="100"
              max="5000"
              value={scanParams.radius}
              onChange={(e) => setScanParams({...scanParams, radius: e.target.value})}
              className="bg-muted border-border"
              disabled={isScanning}
            />
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

          <Button 
            onClick={handleStartScan} 
            disabled={isScanning}
            className="w-full"
          >
            <Search className="w-4 h-4 mr-2" />
            {isScanning ? 'Scansione in corso...' : 'Avvia Scansione'}
          </Button>
        </CardContent>
      </Card>

      {/* Scan Results */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground">Risultati Scansioni</h4>
        
        {scans.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Radar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              Nessuna scansione effettuata
            </CardContent>
          </Card>
        ) : (
          scans.map((scan) => (
            <Card key={scan.id} className="border-border">
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
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
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