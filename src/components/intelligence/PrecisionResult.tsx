// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import React, { useState } from 'react';
import { Crosshair, MapPin, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface PrecisionAnalysis {
  id: string;
  targetLat: number;
  targetLng: number;
  finalShotLat: number;
  finalShotLng: number;
  distance: number;
  accuracy: number;
  suggestions: string[];
  timestamp: Date;
}

const PrecisionResult: React.FC = () => {
  const [analyses, setAnalyses] = useState<PrecisionAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [finalShotCoords, setFinalShotCoords] = useState({
    lat: '',
    lng: ''
  });

  const handleAnalyzePrecision = async () => {
    if (!finalShotCoords.lat || !finalShotCoords.lng) {
      toast.error('Inserisci le coordinate del Final Shot');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulazione analisi di precisione
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsAnalyzing(false);
          generatePrecisionAnalysis();
          return 100;
        }
        return prev + 20;
      });
    }, 500);
  };

  const generatePrecisionAnalysis = () => {
    const finalShotLat = parseFloat(finalShotCoords.lat);
    const finalShotLng = parseFloat(finalShotCoords.lng);
    
    // Simula coordinate target reali (normalmente dal database)
    const targetLat = finalShotLat + (Math.random() - 0.5) * 0.01;
    const targetLng = finalShotLng + (Math.random() - 0.5) * 0.01;
    
    // Calcola distanza in metri
    const R = 6371e3; // raggio terrestre in metri
    const φ1 = finalShotLat * Math.PI/180;
    const φ2 = targetLat * Math.PI/180;
    const Δφ = (targetLat-finalShotLat) * Math.PI/180;
    const Δλ = (targetLng-finalShotLng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    const accuracy = Math.max(0, 100 - (distance / 10)); // 100% se distanza < 10m

    const suggestions = generateSuggestions(distance, accuracy);

    const analysis: PrecisionAnalysis = {
      id: crypto.randomUUID(),
      targetLat,
      targetLng,
      finalShotLat,
      finalShotLng,
      distance,
      accuracy,
      suggestions,
      timestamp: new Date()
    };

    setAnalyses([analysis, ...analyses]);
    setFinalShotCoords({ lat: '', lng: '' });
    setAnalysisProgress(0);
    
    if (distance < 50) {
      toast.success(`Eccellente! Distanza: ${distance.toFixed(1)}m`);
    } else {
      toast.info(`Analisi completata. Distanza: ${distance.toFixed(1)}m`);
    }
  };

  const generateSuggestions = (distance: number, accuracy: number): string[] => {
    const suggestions = [];

    if (distance > 100) {
      suggestions.push("Considera di utilizzare più indizi geografici per migliorare la precisione");
      suggestions.push("Analizza meglio i pattern nei riferimenti storici degli indizi");
    }

    if (distance > 50) {
      suggestions.push("Verifica l'interpretazione degli indizi numerici e simbolici");
      suggestions.push("Usa il Geo Radar Tool per scansioni più precise dell'area");
    }

    if (accuracy < 30) {
      suggestions.push("Rianalizza gli indizi delle settimane precedenti per dettagli mancati");
      suggestions.push("Confronta i tuoi appunti nel Clue Journal con coordinate note");
    }

    if (suggestions.length === 0) {
      suggestions.push("Ottima precisione! Continua con questa metodologia");
      suggestions.push("La tua strategia di analisi degli indizi è molto efficace");
    }

    return suggestions;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy > 80) return 'text-green-500';
    if (accuracy > 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy > 90) return { label: 'ECCELLENTE', variant: 'default' as const };
    if (accuracy > 70) return { label: 'BUONO', variant: 'secondary' as const };
    if (accuracy > 50) return { label: 'DISCRETO', variant: 'outline' as const };
    return { label: 'DA MIGLIORARE', variant: 'destructive' as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Crosshair className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Precision Result</h3>
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          <span>Disponibile dopo Final Shot fallito</span>
        </div>
      </div>

      {/* Input Final Shot Coordinates */}
      <Card className="border-border rounded-xl bg-card/50 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Analisi di Precisione</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="finalShotLat">Latitudine Final Shot</Label>
                <Input
                  id="finalShotLat"
                  type="number"
                  step="any"
                  placeholder="45.4642"
                  value={finalShotCoords.lat}
                  onChange={(e) => setFinalShotCoords({...finalShotCoords, lat: e.target.value})}
                  className="bg-muted/50 border-border rounded-lg px-4 py-3 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  disabled={isAnalyzing}
                />
            </div>
            <div>
              <Label htmlFor="finalShotLng">Longitudine Final Shot</Label>
              <Input
                id="finalShotLng"
                type="number"
                step="any"
                placeholder="9.1900"
                value={finalShotCoords.lng}
                onChange={(e) => setFinalShotCoords({...finalShotCoords, lng: e.target.value})}
                className="bg-muted/50 border-border rounded-lg px-4 py-3 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                disabled={isAnalyzing}
              />
            </div>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analisi in corso...</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}

          <Button 
            onClick={handleAnalyzePrecision} 
            disabled={isAnalyzing}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-lg py-3 shadow-md hover:shadow-lg transition-all"
          >
            <Target className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Analizzando...' : 'Analizza Precisione'}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground">Risultati Analisi</h4>
        
        {analyses.length === 0 ? (
          <Card className="border-border rounded-xl bg-card/30 backdrop-blur-sm">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Crosshair className="w-12 h-12 mx-auto mb-4 opacity-50" />
              Nessuna analisi di precisione effettuata
            </CardContent>
          </Card>
        ) : (
          analyses.map((analysis) => {
            const accuracyBadge = getAccuracyBadge(analysis.accuracy);
            
            return (
              <Card key={analysis.id} className="border-border rounded-xl bg-card/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Analisi {analysis.timestamp.toLocaleString()}</span>
                    <Badge variant={accuracyBadge.variant}>
                      {accuracyBadge.label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Distance and Accuracy */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/40 rounded-xl border border-border backdrop-blur-sm">
                      <div className="text-2xl font-bold text-foreground">
                        {analysis.distance.toFixed(1)}m
                      </div>
                      <div className="text-sm text-muted-foreground">Distanza</div>
                    </div>
                    <div className="text-center p-4 bg-muted/40 rounded-xl border border-border backdrop-blur-sm">
                      <div className={`text-2xl font-bold ${getAccuracyColor(analysis.accuracy)}`}>
                        {analysis.accuracy.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Precisione</div>
                    </div>
                  </div>

                  {/* Coordinates Comparison */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border backdrop-blur-sm">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <div>
                        <div className="font-medium">Final Shot</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {analysis.finalShotLat.toFixed(6)}, {analysis.finalShotLng.toFixed(6)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border backdrop-blur-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <div className="font-medium">Target Reale</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {analysis.targetLat.toFixed(6)}, {analysis.targetLng.toFixed(6)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h5 className="font-medium mb-2">Suggerimenti per Migliorare</h5>
                    <div className="space-y-2">
                      {analysis.suggestions.map((suggestion, index) => (
                        <div key={index} className="text-sm text-muted-foreground p-3 bg-muted/40 rounded-xl border border-border backdrop-blur-sm border-l-4 border-l-primary">
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PrecisionResult;