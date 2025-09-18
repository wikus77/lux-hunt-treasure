// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Map, AlertTriangle } from 'lucide-react';

interface Distribution {
  type: string;
  count: number;
  payload?: Record<string, any>;
}

const BulkMarkerDropComponent = () => {
  const [showBulkDrop, setShowBulkDrop] = useState(false);
  const [distributions, setDistributions] = useState<Distribution[]>([
    { type: 'BUZZ_FREE', count: 0 }
  ]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [seed, setSeed] = useState('');
  const [bbox, setBbox] = useState({
    minLat: '',
    minLng: '',
    maxLat: '',
    maxLng: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  // HTTP diagnostics
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [rawBody, setRawBody] = useState<string>('');
  const [parsedResponse, setParsedResponse] = useState<any>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const REWARD_TYPES = [
    { value: 'BUZZ_FREE', label: 'Buzz Gratuiti', description: 'Buzz che non costano nulla' },
    { value: 'MESSAGE', label: 'Messaggio', description: 'Messaggio testuale personalizzato' },
    { value: 'XP_POINTS', label: 'Punti XP', description: 'Punti esperienza per il giocatore' },
    { value: 'EVENT_TICKET', label: 'Ticket Evento', description: 'Biglietto per evento speciale' },
    { value: 'BADGE', label: 'Badge', description: 'Badge da assegnare al giocatore' },
  ];

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) { setIsAdmin(false); return; }
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        const role = profile?.role?.toLowerCase?.() || '';
        setIsAdmin(role === 'admin' || role === 'owner');
      } catch {
        setIsAdmin(false);
      }
    })();
  }, []);


  const addDistribution = () => {
    setDistributions([...distributions, { type: 'BUZZ_FREE', count: 0 }]);
  };

  const removeDistribution = (index: number) => {
    setDistributions(distributions.filter((_, i) => i !== index));
  };

  const updateDistribution = (index: number, field: string, value: any) => {
    const updated = [...distributions];
    if (field === 'payload') {
      updated[index] = { ...updated[index], payload: value };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setDistributions(updated);
  };

  const updatePayloadField = (index: number, key: string, value: any) => {
    const updated = [...distributions];
    updated[index] = {
      ...updated[index],
      payload: { ...updated[index].payload, [key]: value }
    };
    setDistributions(updated);
  };

  const getTotalCount = () => distributions.reduce((sum, d) => sum + d.count, 0);

  const validateDistributions = () => {
    const errors: string[] = [];
    
    const totalCount = getTotalCount();
    if (totalCount <= 0) {
      errors.push('La somma totale dei marker deve essere maggiore di 0');
    }

    distributions.forEach((dist, index) => {
      if (dist.count < 0) {
        errors.push(`Count alla riga ${index + 1} deve essere maggiore o uguale a 0`);
      }
      
      if (dist.type === 'MESSAGE' && (!dist.payload?.text || dist.payload.text.trim() === '')) {
        errors.push(`Messaggio richiesto alla riga ${index + 1}`);
      }
      
      if (dist.type === 'XP_POINTS' && (!dist.payload?.points || dist.payload.points <= 0)) {
        errors.push(`Punti XP richiesti (maggiore di 0) alla riga ${index + 1}`);
      }
      
      if (dist.type === 'BADGE' && (!dist.payload?.badge_id || dist.payload.badge_id.trim() === '')) {
        errors.push(`Badge ID richiesto alla riga ${index + 1}`);
      }
      
      if (dist.type === 'EVENT_TICKET' && dist.count > 1) {
        errors.push(`Warning: Event ticket count maggiore di 1 alla riga ${index + 1} (tipico = 1)`);
      }
    });

    return { valid: errors.length === 0, errors };
  };

  const createBulkMarkers = async () => {
    const validation = validateDistributions();
    if (!validation.valid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setIsProcessing(true);
    
    try {
      const request: any = {
        distributions,
        seed: seed.trim() || undefined,
      };

      // Session & gate
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Nessuna sessione di autenticazione');
        return;
      }
      if (!isAdmin) {
        toast.error('Accesso riservato ad admin/owner');
        return;
      }

      const url = `https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/create-random-markers?debug=1`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk'
        },
        body: JSON.stringify(request)
      });

      const rawText = await response.text();
      setHttpStatus(response.status);
      setRawBody(rawText);
      const hdrs: Record<string, string> = {};
      ;['content-type','date','x-edge-functions-region','cf-ray','server','content-length'].forEach(k => {
        const v = response.headers.get(k);
        if (v) hdrs[k] = v;
      });
      setResponseHeaders(hdrs);

      let data: any = null;
      try { data = JSON.parse(rawText); } catch {}
      setParsedResponse(data);
      if (data?.request_id) setRequestId(data.request_id);

      if (!response.ok) {
        const msg = data?.error || `HTTP ${response.status}`;
        toast.error(`Errore Edge Function: ${msg}${data?.request_id ? ` (${data.request_id})` : ''}`);
        return;
      }

      toast.success(`✅ ${data.created} marker creati con successo!`, {
        description: `Drop ID: ${data.drop_id}`,
        action: {
          label: 'Vedi su Buzz Map',
          onClick: () => window.open('/map', '_blank')
        }
      });

      setDistributions([{ type: 'BUZZ_FREE', count: 0 }]);
      setSeed('');
      setBbox({ minLat: '', minLng: '', maxLat: '', maxLng: '' });
      setShowBulkDrop(false);

    } catch (error) {
      console.error('Request error:', error);
      toast.error('Errore di rete durante la creazione');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5 text-cyan-400" />
          Bulk Marker Drop
        </CardTitle>
        <CardDescription>
          Genera e distribuisce marker casuali sulla Buzz Map con reward personalizzati
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => setShowBulkDrop(!showBulkDrop)}
          variant="outline"
          className="w-full"
        >
          {showBulkDrop ? 'Chiudi' : 'Configura Distribuzione'}
        </Button>

        {showBulkDrop && (
          <div className="mt-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">Distribuzione Reward</Label>
                <Button onClick={addDistribution} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi
                </Button>
              </div>

              <div className="space-y-4">
                {distributions.map((dist, index) => (
                  <Card key={index} className="border-gray-700">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <div>
                          <Label>Reward Type</Label>
                          <Select
                            value={dist.type}
                            onValueChange={(value) => updateDistribution(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {REWARD_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Count</Label>
                          <Input
                            type="number"
                            min="0"
                            value={dist.count}
                            onChange={(e) => updateDistribution(index, 'count', parseInt(e.target.value) || 0)}
                          />
                        </div>

                        <div>
                          <Label>Payload</Label>
                          {dist.type === 'MESSAGE' && (
                            <Input
                              placeholder="Testo messaggio"
                              value={dist.payload?.text || ''}
                              onChange={(e) => updatePayloadField(index, 'text', e.target.value)}
                            />
                          )}
                          {dist.type === 'XP_POINTS' && (
                            <Input
                              type="number"
                              placeholder="Punti XP"
                              min="1"
                              value={dist.payload?.points || ''}
                              onChange={(e) => updatePayloadField(index, 'points', parseInt(e.target.value) || 0)}
                            />
                          )}
                          {dist.type === 'EVENT_TICKET' && (
                            <Input
                              placeholder="Event ID"
                              value={dist.payload?.event_id || ''}
                              onChange={(e) => updatePayloadField(index, 'event_id', e.target.value)}
                            />
                          )}
                          {dist.type === 'BADGE' && (
                            <Input
                              placeholder="Badge ID"
                              value={dist.payload?.badge_id || ''}
                              onChange={(e) => updatePayloadField(index, 'badge_id', e.target.value)}
                            />
                          )}
                          {dist.type === 'BUZZ_FREE' && (
                            <Input
                              type="number"
                              placeholder="Quantità (default: 1)"
                              min="1"
                              value={dist.payload?.amount || 1}
                              onChange={(e) => updatePayloadField(index, 'amount', parseInt(e.target.value) || 1)}
                            />
                          )}
                        </div>

                        <div className="flex items-end">
                          <Button
                            onClick={() => removeDistribution(index)}
                            variant="destructive"
                            size="sm"
                            disabled={distributions.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Badge variant="secondary">
                  Totale: {getTotalCount()} marker
                </Badge>
                {distributions.some(d => d.type === 'EVENT_TICKET' && d.count > 1) && (
                  <div className="flex items-center gap-2 text-amber-500">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Event ticket con count maggiore di 1 rilevato</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="advanced"
                  checked={showAdvanced}
                  onCheckedChange={setShowAdvanced}
                />
                <Label htmlFor="advanced">Opzioni Avanzate</Label>
              </div>

              {showAdvanced && (
                <div className="mt-4 space-y-4 p-4 border border-gray-700 rounded-lg">
                  <div>
                    <Label htmlFor="seed">Seed (Generazione Deterministica)</Label>
                    <Input
                      id="seed"
                      placeholder="es. M1SSION-2025-01"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Bounding Box (opzionale - default: mondo intero)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      <Input
                        placeholder="Min Lat"
                        type="number"
                        step="0.000001"
                        value={bbox.minLat}
                        onChange={(e) => setBbox({ ...bbox, minLat: e.target.value })}
                      />
                      <Input
                        placeholder="Min Lng"
                        type="number"
                        step="0.000001"
                        value={bbox.minLng}
                        onChange={(e) => setBbox({ ...bbox, minLng: e.target.value })}
                      />
                      <Input
                        placeholder="Max Lat"
                        type="number"
                        step="0.000001"
                        value={bbox.maxLat}
                        onChange={(e) => setBbox({ ...bbox, maxLat: e.target.value })}
                      />
                      <Input
                        placeholder="Max Lng"
                        type="number"
                        step="0.000001"
                        value={bbox.maxLng}
                        onChange={(e) => setBbox({ ...bbox, maxLng: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button 
                onClick={createBulkMarkers}
                disabled={isProcessing || getTotalCount() <= 0}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 hover:opacity-90"
              >
                {isProcessing ? 'Creazione in corso...' : 'Lancia Marker'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkMarkerDropComponent;