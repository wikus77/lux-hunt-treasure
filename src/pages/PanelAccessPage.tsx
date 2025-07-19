// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Panel Access Page - Interfaccia segreta M1SSION PANEL™

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Brain, 
  Zap, 
  Calendar, 
  MapPin, 
  Target,
  Send,
  Monitor,
  Activity,
  Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMissionClues } from '@/hooks/useMissionClues';
import ClueGenerator from '@/components/mission/ClueGenerator';
import ClueViewer from '@/components/mission/ClueViewer';
import { toast } from 'sonner';

interface MissionStatus {
  id: string;
  title: string;
  status: string;
  scope: string;
  area_radius_km: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const PanelAccessPage: React.FC = () => {
  const [currentMission, setCurrentMission] = useState<MissionStatus | null>(null);
  const [panelInput, setPanelInput] = useState('');
  const [panelOutput, setPanelOutput] = useState('');
  const [isLoadingMission, setIsLoadingMission] = useState(true);
  const [isPanelProcessing, setIsPanelProcessing] = useState(false);
  
  const { distribution, loadCluesForMission } = useMissionClues();

  useEffect(() => {
    loadCurrentMission();
  }, []);

  const loadCurrentMission = async () => {
    setIsLoadingMission(true);
    try {
      const { data, error } = await supabase
        .from('monthly_missions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCurrentMission(data);
      
      if (data?.id) {
        await loadCluesForMission(data.id);
      }
      
    } catch (error) {
      console.error('❌ Errore caricamento missione:', error);
      toast.error('Errore nel caricamento della missione');
    } finally {
      setIsLoadingMission(false);
    }
  };

  const handlePanelCommand = async () => {
    if (!panelInput.trim()) return;
    
    setIsPanelProcessing(true);
    try {
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          message: `[M1SSION PANEL™] ${panelInput}`,
          context: 'mission_panel',
          mission_data: currentMission
        }
      });

      if (response.error) throw response.error;
      
      setPanelOutput(response.data.message || 'Comando eseguito');
      setPanelInput('');
      
    } catch (error) {
      console.error('❌ Errore comando panel:', error);
      setPanelOutput('❌ Errore comunicazione con M1SSION PANEL™');
    } finally {
      setIsPanelProcessing(false);
    }
  };

  const triggerPanelAction = async (action: string) => {
    try {
      await supabase.from('panel_logs').insert({
        event_type: 'manual_trigger',
        mission_id: currentMission?.id,
        details: {
          action: action,
          triggered_by: 'admin_panel',
          timestamp: new Date().toISOString()
        }
      });

      toast.success(`✅ Azione "${action}" triggerata`);
      
    } catch (error) {
      console.error('❌ Errore trigger action:', error);
      toast.error('Errore nell\'esecuzione dell\'azione');
    }
  };

  if (isLoadingMission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Monitor className="h-12 w-12 mx-auto text-primary mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Accesso M1SSION PANEL™</h3>
            <p className="text-muted-foreground">Caricamento interfaccia sicura...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header Sicurezza */}
      <Card className="border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <Shield className="h-6 w-6" />
            M1SSION PANEL™ - ACCESSO RISERVATO
            <Badge variant="destructive" className="ml-auto">
              CLASSIFIED
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Status Missione Corrente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status Missione Attiva
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentMission ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">CODENAME</label>
                <div className="text-lg font-bold text-primary">{currentMission.title}</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">SCOPE</label>
                <Badge variant="outline" className="text-sm">
                  {currentMission.scope?.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">AREA RADIUS</label>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="font-semibold">
                    {currentMission.area_radius_km || 'Non calcolato'} km
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">START DATE</label>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{currentMission.start_date ? new Date(currentMission.start_date).toLocaleDateString() : 'Non impostato'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">END DATE</label>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{currentMission.end_date ? new Date(currentMission.end_date).toLocaleDateString() : 'Non impostato'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">STATUS</label>
                <Badge className="bg-green-500 text-white">
                  {currentMission.status?.toUpperCase()}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessuna Missione Attiva</h3>
              <p className="text-muted-foreground">Crea una nuova missione per iniziare</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiche Indizi */}
      {distribution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Indizi Generati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{distribution.week_1}</div>
                <div className="text-sm text-muted-foreground">Week 1</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{distribution.week_2}</div>
                <div className="text-sm text-muted-foreground">Week 2</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{distribution.week_3}</div>
                <div className="text-sm text-muted-foreground">Week 3</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{distribution.week_4}</div>
                <div className="text-sm text-muted-foreground">Week 4</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Totale Indizi</span>
                <span className="font-bold">{distribution.total} / 200</span>
              </div>
              <Progress value={(distribution.total / 200) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Azioni Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Controlli Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              onClick={() => triggerPanelAction('release_week_3')}
              className="w-full"
            >
              Rilascia Week 3
            </Button>
            <Button 
              variant="outline" 
              onClick={() => triggerPanelAction('start_reveal')}
              className="w-full"
            >
              Avvia Reveal
            </Button>
            <Button 
              variant="outline" 
              onClick={() => triggerPanelAction('emergency_stop')}
              className="w-full"
            >
              Stop Emergenza
            </Button>
            <Button 
              variant="outline" 
              onClick={() => triggerPanelAction('force_sync')}
              className="w-full"
            >
              Force Sync
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat con Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Comunicazione Panel AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Comando per M1SSION PANEL™..."
              value={panelInput}
              onChange={(e) => setPanelInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePanelCommand()}
              className="flex-1"
            />
            <Button 
              onClick={handlePanelCommand}
              disabled={isPanelProcessing || !panelInput.trim()}
            >
              {isPanelProcessing ? (
                <Lock className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {panelOutput && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <label className="text-sm font-medium text-muted-foreground">PANEL OUTPUT:</label>
              <div className="mt-2 font-mono text-sm">{panelOutput}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generatore Indizi */}
      {currentMission && (
        <ClueGenerator 
          missionId={currentMission.id}
          onCluesGenerated={() => loadCluesForMission(currentMission.id)}
        />
      )}

      {/* Visualizzatore Indizi */}
      {currentMission && (
        <ClueViewer 
          missionId={currentMission.id}
          adminMode={true}
        />
      )}
    </div>
  );
};

export default PanelAccessPage;