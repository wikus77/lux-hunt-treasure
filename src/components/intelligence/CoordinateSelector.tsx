// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import React, { useState } from 'react';
import { Target, MapPin, Save, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Coordinate {
  id: string;
  lat: number;
  lng: number;
  label: string;
  notes?: string;
  createdAt: Date;
}

const CoordinateSelector: React.FC = () => {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [newCoord, setNewCoord] = useState({
    lat: '',
    lng: '',
    label: '',
    notes: ''
  });

  const handleSaveCoordinate = () => {
    if (!newCoord.lat || !newCoord.lng || !newCoord.label) {
      toast.error('Lat, Lng e Label sono obbligatori');
      return;
    }

    const coordinate: Coordinate = {
      id: crypto.randomUUID(),
      lat: parseFloat(newCoord.lat),
      lng: parseFloat(newCoord.lng),
      label: newCoord.label,
      notes: newCoord.notes,
      createdAt: new Date()
    };

    setCoordinates([...coordinates, coordinate]);
    setNewCoord({ lat: '', lng: '', label: '', notes: '' });
    toast.success('Coordinata salvata');
  };

  const handleCopyCoordinate = (coord: Coordinate) => {
    const text = `${coord.lat}, ${coord.lng}`;
    navigator.clipboard.writeText(text);
    toast.success('Coordinate copiate negli appunti');
  };

  return (
    <div className="h-full overflow-y-auto pb-20 space-y-8" style={{
      height: 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 80px)',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)'
    }}>
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-primary flex items-center justify-center shadow-xl shadow-cyan-500/20">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Coordinate Selector</h3>
        </div>
      </div>

      {/* Add New Coordinate */}
      <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md shadow-2xl shadow-cyan-500/10">
        <CardHeader className="border-b-0">
          <CardTitle className="text-xl text-center bg-gradient-to-r from-cyan-400 to-primary bg-clip-text text-transparent">
            Aggiungi Nuova Coordinata
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lat">Latitudine</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  placeholder="46.0 [COORD-LAT]"
                  value={newCoord.lat}
                  onChange={(e) => setNewCoord({...newCoord, lat: e.target.value})}
                  className="bg-muted/60 border-2 border-border/50 rounded-xl px-4 py-4 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all duration-300 text-lg"
                />
            </div>
            <div>
              <Label htmlFor="lng">Longitudine</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  placeholder="8.0 [COORD-LNG]"
                  value={newCoord.lng}
                  onChange={(e) => setNewCoord({...newCoord, lng: e.target.value})}
                  className="bg-muted/60 border-2 border-border/50 rounded-xl px-4 py-4 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all duration-300 text-lg"
                />
            </div>
          </div>
          
          <div>
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              placeholder="TARGET-ID [Punto di interesse]"
              value={newCoord.label}
              onChange={(e) => setNewCoord({...newCoord, label: e.target.value})}
              className="bg-muted/60 border-2 border-border/50 rounded-xl px-4 py-4 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all duration-300 text-lg"
            />
          </div>

          <div>
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Textarea
              id="notes"
              placeholder="NOTES [Descrizione dettagliata...]"
              value={newCoord.notes}
              onChange={(e) => setNewCoord({...newCoord, notes: e.target.value})}
              className="bg-muted/60 border-2 border-border/50 rounded-xl px-4 py-4 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all duration-300"
              rows={3}
            />
          </div>

          <Button onClick={handleSaveCoordinate} className="w-full bg-gradient-to-r from-cyan-500 via-primary to-primary/80 hover:from-cyan-400 hover:to-primary/90 rounded-xl py-4 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 text-lg">
            <Save className="w-4 h-4 mr-2" />
            Salva Coordinata
          </Button>
        </CardContent>
      </Card>

      {/* Saved Coordinates */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground">Coordinate Salvate</h4>
        
        {coordinates.length === 0 ? (
          <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/40 backdrop-blur-md">
            <CardContent className="py-12 text-center text-muted-foreground">
              <MapPin className="w-16 h-16 mx-auto mb-6 opacity-50" />
              <p className="text-lg">Nessuna coordinata salvata</p>
            </CardContent>
          </Card>
        ) : (
          coordinates.map((coord) => (
            <Card key={coord.id} className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-semibold text-foreground">{coord.label}</h5>
                    <p className="text-sm text-muted-foreground font-mono">
                      {coord.lat}, {coord.lng}
                    </p>
                    {coord.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{coord.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {coord.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCoordinate(coord)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CoordinateSelector;