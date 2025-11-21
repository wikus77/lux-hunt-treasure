// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Componente generatore indizi M1SSION™

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, Zap, MapPin, Trophy } from 'lucide-react';
import { useMissionClues, ClueDistribution } from '@/hooks/useMissionClues';
import { toast } from 'sonner';

interface ClueGeneratorProps {
  missionId: string;
  onCluesGenerated?: () => void;
}

const ClueGenerator: React.FC<ClueGeneratorProps> = ({ 
  missionId, 
  onCluesGenerated 
}) => {
  const { 
    distribution, 
    isGenerating, 
    generateClues, 
    deleteAllClues,
    getCluePreviewByTier 
  } = useMissionClues();

  const [formData, setFormData] = useState({
    city: '',
    country: '',
    lat: '',
    lng: '',
    prizeDescription: '',
    areaRadiusKm: 1500
  });

  const handleGenerate = async () => {
    if (!formData.city || !formData.country || !formData.prizeDescription) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    try {
      await generateClues({
        missionId,
        targetLocation: {
          city: formData.city,
          country: formData.country,
          coordinates: {
            lat: parseFloat(formData.lat) || 0,
            lng: parseFloat(formData.lng) || 0
          }
        },
        prizeDescription: formData.prizeDescription,
        areaRadiusKm: formData.areaRadiusKm
      });

      onCluesGenerated?.();
    } catch (error) {
      console.error('Errore generazione:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Eliminare tutti gli indizi? Questa azione è irreversibile.')) {
      await deleteAllClues(missionId);
      onCluesGenerated?.();
    }
  };

  const TierBadge = ({ tier, count }: { tier: string; count: number }) => {
    const colors = {
      base: 'bg-gray-500',
      silver: 'bg-gray-400',
      gold: 'bg-yellow-500',
      black: 'bg-black',
      titanium: 'bg-gradient-to-r from-purple-500 to-blue-500'
    };

    return (
      <Badge className={`${colors[tier as keyof typeof colors]} text-white`}>
        {tier.toUpperCase()}: {count}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            M1SSION™ Clue Generator
            <Badge variant="outline" className="ml-auto">AI Powered</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Form di generazione */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Configurazione Missione
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Città Target *</label>
              <Input
                placeholder="es. Roma"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Paese *</label>
              <Input
                placeholder="es. Italia"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Latitudine</label>
              <Input
                type="number"
                step="0.000001"
                placeholder="41.9028"
                value={formData.lat}
                onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Longitudine</label>
              <Input
                type="number"
                step="0.000001"
                placeholder="12.4964"
                value={formData.lng}
                onChange={(e) => setFormData(prev => ({ ...prev, lng: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrizione Premio *</label>
            <Textarea
              placeholder="Descrivi il premio nascosto (es. Orologio Rolex Submariner del 1953...)"
              value={formData.prizeDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, prizeDescription: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Area Radius (km)</label>
            <Input
              type="number"
              value={formData.areaRadiusKm}
              onChange={(e) => setFormData(prev => ({ ...prev, areaRadiusKm: parseInt(e.target.value) || 1500 }))}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  Generazione AI in corso...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Genera 200 Indizi AI
                </>
              )}
            </Button>
            
            {distribution && distribution.total > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isGenerating}
              >
                Elimina Tutti
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiche distribuzione */}
      {distribution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Distribuzione Indizi Generati
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-500">{distribution.week_1}</div>
                <div className="text-sm text-muted-foreground">Settimana 1</div>
                <div className="text-xs">Simbolico</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-500">{distribution.week_2}</div>
                <div className="text-sm text-muted-foreground">Settimana 2</div>
                <div className="text-xs">Geografia</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-yellow-500">{distribution.week_3}</div>
                <div className="text-sm text-muted-foreground">Settimana 3</div>
                <div className="text-xs">Microzona</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-red-500">{distribution.week_4}</div>
                <div className="text-sm text-muted-foreground">Settimana 4</div>
                <div className="text-xs">Coordinate</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Totale Indizi Generati</span>
                <span className="font-bold">{distribution.total} / 200</span>
              </div>
              <Progress value={(distribution.total / 200) * 100} className="h-2" />
            </div>

            <div className="flex flex-wrap gap-2">
              <TierBadge tier="base" count={distribution.by_tier.base} />
              <TierBadge tier="silver" count={distribution.by_tier.silver} />
              <TierBadge tier="gold" count={distribution.by_tier.gold} />
              <TierBadge tier="black" count={distribution.by_tier.black} />
              <TierBadge tier="titanium" count={distribution.by_tier.titanium} />
            </div>

            {distribution.decoy_count > 0 && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span className="text-sm">
                  <span className="font-semibold">{distribution.decoy_count}</span> indizi decoy (falsi)
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress durante generazione */}
      {isGenerating && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-sm font-medium">
                  M1SSION™ AI sta generando indizi creativi...
                </span>
              </div>
              <Progress value={undefined} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Processo di generazione: Analisi semantica → Creatività AI → Validazione tier
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClueGenerator;