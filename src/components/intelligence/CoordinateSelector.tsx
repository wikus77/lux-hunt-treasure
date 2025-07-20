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
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Coordinate Selector</h3>
      </div>

      {/* Add New Coordinate */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Aggiungi Nuova Coordinata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lat">Latitudine</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                placeholder="45.4642"
                value={newCoord.lat}
                onChange={(e) => setNewCoord({...newCoord, lat: e.target.value})}
                className="bg-muted border-border"
              />
            </div>
            <div>
              <Label htmlFor="lng">Longitudine</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                placeholder="9.1900"
                value={newCoord.lng}
                onChange={(e) => setNewCoord({...newCoord, lng: e.target.value})}
                className="bg-muted border-border"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              placeholder="Punto di interesse"
              value={newCoord.label}
              onChange={(e) => setNewCoord({...newCoord, label: e.target.value})}
              className="bg-muted border-border"
            />
          </div>

          <div>
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Textarea
              id="notes"
              placeholder="Descrizione dettagliata..."
              value={newCoord.notes}
              onChange={(e) => setNewCoord({...newCoord, notes: e.target.value})}
              className="bg-muted border-border"
              rows={3}
            />
          </div>

          <Button onClick={handleSaveCoordinate} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Salva Coordinata
          </Button>
        </CardContent>
      </Card>

      {/* Saved Coordinates */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground">Coordinate Salvate</h4>
        
        {coordinates.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-8 text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              Nessuna coordinata salvata
            </CardContent>
          </Card>
        ) : (
          coordinates.map((coord) => (
            <Card key={coord.id} className="border-border">
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