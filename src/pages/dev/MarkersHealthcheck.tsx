// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Database, Play, RefreshCw } from 'lucide-react';

interface MarkerDistribution {
  BUZZ_FREE: number;
  MESSAGE: number;
  XP_POINTS: number;
  EVENT_TICKET: number;
  BADGE: number;
}

interface CreateMarkersResponse {
  drop_id: string;
  created: number;
  error?: string;
  details?: string;
  errors?: Array<{
    code: string;
    message: string;
    hint?: string;
    payload_hash?: string;
  }>;
  partial_failures?: number;
}

interface RecentMarker {
  id: string;
  title: string;
  reward_type: string;
  created_at: string;
  lat: number;
  lng: number;
}

interface DbStats {
  total_markers: number;
  last_insert_time: string | null;
  recent_markers: RecentMarker[];
}

export default function MarkersHealthcheck() {
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [count, setCount] = useState(50);
  const [distribution, setDistribution] = useState<MarkerDistribution>({
    BUZZ_FREE: 30,
    MESSAGE: 10,
    XP_POINTS: 8,
    EVENT_TICKET: 2,
    BADGE: 0
  });
  const [visibilityHours, setVisibilityHours] = useState(168); // 7 giorni
  const [lastResult, setLastResult] = useState<CreateMarkersResponse | null>(null);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const { toast } = useToast();

  const loadDbStats = async () => {
    setIsRefreshingStats(true);
    try {
      // Get total count
      const { count: totalCount } = await supabase
        .from('markers')
        .select('*', { count: 'exact', head: true });

      // Get recent markers
      const { data: recentMarkers } = await supabase
        .from('markers')
        .select('id, title, reward_type, created_at, lat, lng')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get last insert time
      const { data: lastInsert } = await supabase
        .from('markers')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setDbStats({
        total_markers: totalCount || 0,
        last_insert_time: lastInsert?.created_at || null,
        recent_markers: recentMarkers || []
      });
    } catch (error) {
      console.error('Error loading DB stats:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le statistiche del database",
        variant: "destructive",
      });
    } finally {
      setIsRefreshingStats(false);
    }
  };

  useEffect(() => {
    loadDbStats();
  }, []);

  const handleRunTest = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Nessuna sessione di autenticazione');
      }

      // Prepare distributions array
      const distributions = Object.entries(distribution)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => ({
          type: type as keyof MarkerDistribution,
          count
        }));

      const payload = {
        distributions,
        bbox: {
          minLat: 45.0,
          minLng: 9.0,
          maxLat: 45.5,
          maxLng: 9.5
        },
        visibilityPreset: 'custom',
        seed: `TEST-${Date.now()}`
      };

      console.log('🚀 Calling create-random-markers with payload:', payload);

      const url = debugMode 
        ? `https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/create-random-markers?debug=1`
        : `https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/create-random-markers`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json() as CreateMarkersResponse;
      setLastResult(result);

      if (response.ok) {
        if (result.created > 0) {
          toast({
            title: "Successo",
            description: `${result.created} marker creati con successo`,
          });
        } else {
          toast({
            title: "Attenzione",
            description: "Nessun marker creato",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Errore",
          description: result.error || 'Errore sconosciuto',
          variant: "destructive",
        });
      }

      // Refresh stats after test
      setTimeout(loadDbStats, 1000);

    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : 'Errore di rete',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalDistribution = Object.values(distribution).reduce((sum, val) => sum + val, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Database className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Markers System Healthcheck</h1>
        <Badge variant="outline">DEV MODE</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Test Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="flex items-center space-x-2">
              <Switch
                id="debug-mode"
                checked={debugMode}
                onCheckedChange={setDebugMode}
              />
              <Label htmlFor="debug-mode">Debug Mode (dettagli errori)</Label>
            </div>

            <div>
              <Label htmlFor="count">Numero totale marker</Label>
              <Input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                min="1"
                max="1000"
              />
            </div>

            <div>
              <Label>Distribuzione ricompense (totale: {totalDistribution})</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {Object.entries(distribution).map(([type, value]) => (
                  <div key={type}>
                    <Label htmlFor={type} className="text-xs">{type}</Label>
                    <Input
                      id={type}
                      type="number"
                      value={value}
                      onChange={(e) => setDistribution(prev => ({
                        ...prev,
                        [type]: parseInt(e.target.value) || 0
                      }))}
                      min="0"
                      max="1000"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="visibility">Visibilità (ore)</Label>
              <Input
                id="visibility"
                type="number"
                value={visibilityHours}
                onChange={(e) => setVisibilityHours(parseInt(e.target.value) || 24)}
                min="1"
                max="8760"
              />
            </div>

            <Button 
              onClick={handleRunTest} 
              disabled={isLoading || totalDistribution === 0}
              className="w-full"
            >
              {isLoading ? 'Esecuzione...' : 'Esegui Test'}
            </Button>

          </CardContent>
        </Card>

        {/* Database Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <span className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Statistics
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={loadDbStats}
                disabled={isRefreshingStats}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshingStats ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dbStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Marker totali</Label>
                    <p className="text-2xl font-bold">{dbStats.total_markers}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Ultimo inserimento</Label>
                    <p className="text-sm">
                      {dbStats.last_insert_time 
                        ? new Date(dbStats.last_insert_time).toLocaleString()
                        : 'Mai'
                      }
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Ultimi 10 marker</Label>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {dbStats.recent_markers.length > 0 ? (
                      dbStats.recent_markers.map((marker) => (
                        <div key={marker.id} className="text-xs p-2 bg-muted rounded">
                          <div className="flex justify-between items-start">
                            <span className="font-mono">{marker.id.slice(0, 8)}...</span>
                            <Badge variant="secondary" className="text-xs">
                              {marker.reward_type}
                            </Badge>
                          </div>
                          <div className="mt-1">
                            <div className="font-medium">{marker.title}</div>
                            <div className="text-muted-foreground">
                              {new Date(marker.created_at).toLocaleString()}
                            </div>
                            <div className="text-muted-foreground">
                              {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Nessun marker trovato</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p>Caricamento statistiche...</p>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Last Result */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Ultimo Risultato Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Marker creati</Label>
                  <p className="text-xl font-bold">{lastResult.created}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Drop ID</Label>
                  <p className="text-sm font-mono">{lastResult.drop_id}</p>
                </div>
              </div>

              {lastResult.error && (
                <div>
                  <Label className="text-sm font-medium text-destructive">Errore</Label>
                  <p className="text-sm">{lastResult.error}</p>
                  {lastResult.details && (
                    <p className="text-xs text-muted-foreground mt-1">{lastResult.details}</p>
                  )}
                </div>
              )}

              {lastResult.partial_failures && (
                <div>
                  <Label className="text-sm font-medium text-amber-600">Fallimenti parziali</Label>
                  <p className="text-sm">{lastResult.partial_failures} inserimenti falliti</p>
                </div>
              )}

              {debugMode && lastResult.errors && lastResult.errors.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Dettagli errori (DEBUG)</Label>
                  <Textarea
                    value={JSON.stringify(lastResult.errors, null, 2)}
                    readOnly
                    className="mt-1 text-xs font-mono"
                    rows={6}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}