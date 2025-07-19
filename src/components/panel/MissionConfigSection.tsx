// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Save, MapPin } from "lucide-react";
import { toast } from "sonner";

interface MissionData {
  city: string;
  country: string;
  street: string;
  street_number: string;
  prize_type: string;
  prize_color: string;
  prize_material: string;
  prize_category: string;
}

export const MissionConfigSection: React.FC = () => {
  const [missionData, setMissionData] = useState<MissionData>({
    city: '',
    country: '',
    street: '',
    street_number: '',
    prize_type: '',
    prize_color: '',
    prize_material: '',
    prize_category: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCurrentMission();
  }, []);

  const loadCurrentMission = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('current_mission_data')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading mission:', error);
        return;
      }

      if (data) {
        setMissionData({
          city: data.city || '',
          country: data.country || '',
          street: data.street || '',
          street_number: data.street_number || '',
          prize_type: data.prize_type || '',
          prize_color: data.prize_color || '',
          prize_material: data.prize_material || '',
          prize_category: data.prize_category || ''
        });
      }
    } catch (error) {
      console.error('Error loading mission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sessione non trovata');
      }

      const response = await supabase.functions.invoke('update-mission', {
        body: { missionData },
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Errore durante il salvataggio');
      }

      const result = response.data;
      
      if (result.success) {
        toast.success('✅ MISSIONE AGGIORNATA', {
          description: `Configurazione salvata: ${missionData.city}, ${missionData.country}`
        });
      } else {
        throw new Error(result.error || 'Salvataggio fallito');
      }

    } catch (error) {
      console.error('❌ Save mission error:', error);
      toast.error('❌ ERRORE SALVATAGGIO', {
        description: error.message || 'Errore sconosciuto durante il salvataggio'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof MissionData, value: string) => {
    setMissionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const prizeTypes = [
    'Rolex', 'Borsa Hermès', 'Auto Ferrari', 'Auto Lamborghini', 'Auto Porsche', 
    'Gioiello Cartier', 'Anello Tiffany', 'Orologio Patek Philippe', 'Borsa Chanel',
    'Auto BMW', 'Auto Mercedes', 'Smartphone iPhone', 'Laptop MacBook', 'Tablet iPad'
  ];

  const prizeColors = [
    'Oro', 'Argento', 'Rosso', 'Nero', 'Blu Navy', 'Bianco', 'Verde', 'Marrone',
    'Rosa Gold', 'Platino', 'Bronze', 'Blu Elettrico', 'Grigio', 'Bordeaux'
  ];

  const prizeMaterials = [
    'Oro 18K', 'Oro 24K', 'Argento 925', 'Platino', 'Acciaio Inossidabile',
    'Pelle di Coccodrillo', 'Pelle di Pitone', 'Pelle Italiana', 'Seta',
    'Carbonio', 'Titanio', 'Ceramica', 'Cristallo Zaffiro', 'Diamanti'
  ];

  const prizeCategories = [
    'Orologio', 'Borsa', 'Gioiello', 'Veicolo', 'Tech', 'Accessorio',
    'Arte', 'Elettronica', 'Lusso', 'Moda', 'Sport', 'Casa'
  ];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle className="text-primary">IMPOSTA MISSIONE™</CardTitle>
        </div>
        <CardDescription>
          Configura manualmente tutti i parametri della missione corrente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Ubicazione</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Città</Label>
              <Input
                id="city"
                value={missionData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="es. Milano"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Paese</Label>
              <Input
                id="country"
                value={missionData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="es. Italia"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Via</Label>
              <Input
                id="street"
                value={missionData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="es. Via Montenapoleone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street_number">Numero Civico</Label>
              <Input
                id="street_number"
                value={missionData.street_number}
                onChange={(e) => handleInputChange('street_number', e.target.value)}
                placeholder="es. 12A"
              />
            </div>
          </div>
        </div>

        {/* Prize Section */}
        <div className="space-y-4">
          <h3 className="font-semibold">Premio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prize_type">Tipo Premio</Label>
              <Select value={missionData.prize_type} onValueChange={(value) => handleInputChange('prize_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo premio" />
                </SelectTrigger>
                <SelectContent>
                  {prizeTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prize_color">Colore Premio</Label>
              <Select value={missionData.prize_color} onValueChange={(value) => handleInputChange('prize_color', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona colore" />
                </SelectTrigger>
                <SelectContent>
                  {prizeColors.map(color => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prize_material">Materiale Premio</Label>
              <Select value={missionData.prize_material} onValueChange={(value) => handleInputChange('prize_material', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona materiale" />
                </SelectTrigger>
                <SelectContent>
                  {prizeMaterials.map(material => (
                    <SelectItem key={material} value={material}>{material}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prize_category">Categoria Premio</Label>
              <Select value={missionData.prize_category} onValueChange={(value) => handleInputChange('prize_category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
                  {prizeCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'SALVANDO...' : 'SALVA CONFIGURAZIONE MISSIONE'}
        </Button>
      </CardContent>
    </Card>
  );
};