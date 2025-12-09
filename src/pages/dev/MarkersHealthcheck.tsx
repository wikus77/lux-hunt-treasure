// @ts-nocheck
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
import { AlertCircle, Database, Play, RefreshCw, User, Clock } from 'lucide-react';
import { functionsBaseUrl } from '@/lib/supabase/functionsBase';


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
  created_at: string;
  lat: number;
  lng: number;
}

interface DbStats {
  total_markers: number;
  last_insert_time: string | null;
  recent_markers: RecentMarker[];
}

interface UserDiagnostics {
  role: string | null;
  email: string | null;
  jwt_exp: number | null;
  jwt_exp_warning: boolean;
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
  const [visibleFrom, setVisibleFrom] = useState<string>(new Date().toISOString().slice(0,16));
  const [visibleTo, setVisibleTo] = useState<string>(new Date(Date.now()+7*24*60*60*1000).toISOString().slice(0,16));
  const [lastResult, setLastResult] = useState<CreateMarkersResponse | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string,string>>({});
  const [rawResponse, setRawResponse] = useState<string>('');
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [userDiag, setUserDiag] = useState<UserDiagnostics | null>(null);
  const { toast } = useToast();

  const loadUserDiagnostics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUserDiag({ role: null, email: null, jwt_exp: null, jwt_exp_warning: false });
        return;
      }

      // Decode JWT to get exp
      let jwt_exp = null;
      let jwt_exp_warning = false;
      try {
        const payload = JSON.parse(atob(session.access_token.split('.')[1]));
        jwt_exp = payload.exp;
        const now = Date.now() / 1000;
        jwt_exp_warning = (jwt_exp - now) < 600; // Less than 10 minutes
      } catch (e) {
        console.warn('Failed to decode JWT:', e);
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      setUserDiag({
        role: profile?.role || null,
        email: session.user.email || null,
        jwt_exp,
        jwt_exp_warning
      });
    } catch (error) {
      console.error('Error loading user diagnostics:', error);
      setUserDiag({ role: null, email: null, jwt_exp: null, jwt_exp_warning: false });
    }
  };

  const loadDbStats = async () => {
    setIsRefreshingStats(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Errore",
          description: "Nessuna sessione di autenticazione",
          variant: "destructive",
        });
        return;
      }

      // Use same headers as Edge Function calls
      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      };

      // Get total count
      const { count: totalCount } = await supabase
        .from('markers')
        .select('*', { count: 'exact', head: true });

      // Get recent markers
      const { data: recentMarkers } = await supabase
        .from('markers')
        .select('id, title, created_at, lat, lng')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get last insert time
      const { data: lastInsert } = await supabase
        .from('markers')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

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
    loadUserDiagnostics();
    loadDbStats();
  }, []);

  const handleRunTest = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Nessuna sessione di autenticazione');
      }

      // Prepare distributions array coerente con count totale
      const distributions = Object.entries(distribution)
        .filter(([_, ctn]) => ctn > 0)
        .map(([type, ctn]) => ({
          type: type as keyof MarkerDistribution,
          count: ctn
        }));

      const payload: any = {
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

      if (visibleFrom) payload.visible_from = new Date(visibleFrom).toISOString();
      if (visibleTo) payload.visible_to = new Date(visibleTo).toISOString();

      console.log('🚀 Calling create-random-markers with payload:', payload);

      const url = debugMode 
        ? `${functionsBaseUrl}/create-random-markers?debug=1`
        : `${functionsBaseUrl}/create-random-markers`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify(payload)
      });

      const rawText = await response.text();
      setRawResponse(rawText);
      setResponseStatus(response.status);
      const headersObj: Record<string,string> = {};
      ['content-type','date','x-edge-functions-region','cf-ray','server','content-length'].forEach(k => {
        const v = response.headers.get(k);
        if (v) headersObj[k] = v;
      });
      setResponseHeaders(headersObj);

      let parsed: CreateMarkersResponse | null = null;
      try { parsed = JSON.parse(rawText); } catch {}
      setLastResult(parsed);

      // UI feedback by status
      if (response.status === 200) {
        toast({ title: 'Successo', description: `${parsed?.created ?? 0} marker creati` });
      } else if (response.status === 207) {
        toast({ title: 'Parziale', description: `${parsed?.created ?? 0} creati, ${parsed?.partial_failures ?? 0} falliti` });
      } else {
        toast({ title: 'Errore', description: parsed?.error || 'Chiamata fallita', variant: 'destructive' });
      }

      // Refresh stats after test
      setTimeout(loadDbStats, 1000);

    } catch (error) {
      console.error('Test error:', error);
      setResponseStatus(null);
      setResponseHeaders({});
      setRawResponse('');
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : 'Errore di rete',
        variant: 'destructive',
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
        <Badge variant="outline">DEV</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Diagnostics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userDiag ? (
              <>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm font-mono">{userDiag.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <Badge variant={['admin','owner'].includes(userDiag.role?.toLowerCase() || '') ? 'default' : 'secondary'}>
                    {userDiag.role || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    JWT Expiry
                    {userDiag.jwt_exp_warning && <Clock className="h-4 w-4 text-amber-500" />}
                  </Label>
                  {userDiag.jwt_exp ? (
                    <p className={`text-sm ${userDiag.jwt_exp_warning ? 'text-amber-500' : ''}`}>
                      {new Date(userDiag.jwt_exp * 1000).toLocaleString()}
                      {userDiag.jwt_exp_warning && ' (< 10min)'}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">N/A</p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Admin/Owner richiesto per Edge Function
                </div>
              </>
            ) : (
              <p>Caricamento diagnostica utente...</p>
            )}
          </CardContent>
        </Card>

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
              <Label htmlFor="count">Numero totale marker (informativo)</Label>
              <Input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                min="1"
                max="5000"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="visible_from">Visibile da</Label>
                <Input
                  id="visible_from"
                  type="datetime-local"
                  value={visibleFrom}
                  onChange={(e) => setVisibleFrom(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="visible_to">Visibile fino a</Label>
                <Input
                  id="visible_to"
                  type="datetime-local"
                  value={visibleTo}
                  onChange={(e) => setVisibleTo(e.target.value)}
                />
              </div>
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
                              MARKER
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

      {/* HTTP Response Diagnostics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Esito ultima chiamata Edge Function
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <Label className="text-sm">HTTP Status:</Label>
            <Badge variant={responseStatus === 200 ? 'default' : responseStatus === 207 ? 'secondary' : 'destructive'}>
              {responseStatus ?? '—'}
            </Badge>
          </div>
          {Object.keys(responseHeaders).length > 0 && (
            <div>
              <Label className="text-sm">Headers</Label>
              <Textarea
                value={JSON.stringify(responseHeaders, null, 2)}
                readOnly
                className="mt-1 text-xs font-mono"
                rows={5}
              />
            </div>
          )}
          {rawResponse && (
            <div>
              <Label className="text-sm">Body (raw)</Label>
              <Textarea
                value={rawResponse}
                readOnly
                className="mt-1 text-xs font-mono"
                rows={8}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Result (parsed) */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Ultimo Risultato Test (parsed)
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

              {typeof lastResult.partial_failures === 'number' && (
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