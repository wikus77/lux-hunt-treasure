// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Send, TestTube, ArrowLeft, Users } from 'lucide-react';
import { useLocation } from 'wouter';
import type { PushSendRequest, PushTestRequest, PushResult } from '@/types/push';

export default function UserPushConsolePage() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [badge, setBadge] = useState('');
  const [testToken, setTestToken] = useState('');
  
  // Audience selection
  const [audience, setAudience] = useState<'all' | 'segment' | 'list'>('all');
  const [segment, setSegment] = useState<'winners' | 'active_24h' | 'ios' | 'android' | 'webpush'>('active_24h');
  const [usersList, setUsersList] = useState('');
  
  const [isSending, setIsSending] = useState(false);

  const handleSendTest = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Titolo e messaggio sono obbligatori');
      return;
    }

    if (!testToken.trim()) {
      toast.error('Token test è obbligatorio per il test');
      return;
    }

    setIsSending(true);
    try {
      const payload: PushTestRequest = {
        token: testToken.trim(),
        payload: {
          title: title.trim(),
          body: body.trim(),
          image: image.trim() || null,
          deepLink: deepLink.trim() || null,
          badge: badge.trim() || null,
        }
      };

      const { data, error } = await supabase.functions.invoke('push_test', {
        body: payload
      });

      if (error) throw error;

      const result = data as PushResult;
      if (result.ok) {
        toast.success('✅ Test inviato con successo!');
      } else {
        toast.error(`❌ Test fallito: ${result.error || 'Errore sconosciuto'}`);
      }
    } catch (error: any) {
      console.error('Test push error:', error);
      toast.error(`❌ Errore test: ${error.message || 'Errore di rete'}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendToSelection = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Titolo e messaggio sono obbligatori');
      return;
    }

    // Validate audience
    if (audience === 'list' && !usersList.trim()) {
      toast.error('Lista utenti richiesta per audience "list"');
      return;
    }

    const confirmed = window.confirm(
      `Sei sicuro di voler inviare la notifica al target selezionato (${audience})? Questa azione non può essere annullata.`
    );
    
    if (!confirmed) return;

    setIsSending(true);
    try {
      const payload: PushSendRequest = {
        audience,
        payload: {
          title: title.trim(),
          body: body.trim(),
          image: image.trim() || null,
          deepLink: deepLink.trim() || null,
          badge: badge.trim() || null,
        }
      };

      if (audience === 'segment') {
        payload.filters = { segment };
      } else if (audience === 'list') {
        const lines = usersList.trim().split('\n').map(line => line.trim()).filter(Boolean);
        
        // Determine if they are emails or IDs
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmails = lines.every(line => emailRegex.test(line));
        const isIds = lines.every(line => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(line));

        if (isEmails) {
          payload.filters = { emails: lines };
        } else if (isIds) {
          payload.filters = { ids: lines };
        } else {
          toast.error('Lista deve contenere solo email valide o UUID validi');
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke('push_send', {
        body: payload
      });

      if (error) throw error;

      const result = data as PushResult;
      if (result.ok) {
        toast.success(`✅ Notifica inviata! ${result.sent}/${result.sent! + result.failed!} device raggiunti`);
        // Reset form
        setTitle('');
        setBody('');
        setImage('');
        setDeepLink('');
        setBadge('');
        setTestToken('');
        setUsersList('');
      } else {
        toast.error(`❌ Invio fallito: ${result.error || 'Errore sconosciuto'}`);
      }
    } catch (error: any) {
      console.error('Push send error:', error);
      toast.error(`❌ Errore invio: ${error.message || 'Errore di rete'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/admin/mission-panel')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna al Panel
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink bg-clip-text text-transparent">
            Push Console
          </h1>
          <p className="text-muted-foreground">
            Invio notifiche push mirate - Segmenti e Liste
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Message Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Contenuto Notifica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titolo *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titolo della notifica"
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="badge">Badge</Label>
                <Input
                  id="badge"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Numero badge (opzionale)"
                  type="number"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="body">Messaggio *</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Contenuto della notifica"
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="image">URL Immagine</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </div>
              <div>
                <Label htmlFor="deepLink">Deep Link</Label>
                <Input
                  id="deepLink"
                  value={deepLink}
                  onChange={(e) => setDeepLink(e.target.value)}
                  placeholder="/buzz, /map, /profile..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="testToken">Token Test Device</Label>
              <Textarea
                id="testToken"
                value={testToken}
                onChange={(e) => setTestToken(e.target.value)}
                placeholder="Token FCM o WebPush endpoint per test (opzionale)"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Target Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Selezione Target
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Audience</Label>
              <RadioGroup value={audience} onValueChange={(value: any) => setAudience(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">Tutti gli utenti</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="segment" id="segment" />
                  <Label htmlFor="segment">Segmento specifico</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="list" id="list" />
                  <Label htmlFor="list">Lista specifica (IDs o email)</Label>
                </div>
              </RadioGroup>
            </div>

            {audience === 'segment' && (
              <div>
                <Label htmlFor="segmentSelect">Segmento</Label>
                <Select value={segment} onValueChange={(value: any) => setSegment(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="winners">Vincitori</SelectItem>
                    <SelectItem value="active_24h">Attivi ultime 24h</SelectItem>
                    <SelectItem value="ios">iOS devices</SelectItem>
                    <SelectItem value="android">Android devices</SelectItem>
                    <SelectItem value="webpush">WebPush subscribers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {audience === 'list' && (
              <div>
                <Label htmlFor="usersList">Lista Utenti</Label>
                <Textarea
                  id="usersList"
                  value={usersList}
                  onChange={(e) => setUsersList(e.target.value)}
                  placeholder="user@email.com&#10;altro@email.com&#10;&#10;oppure:&#10;&#10;12345678-1234-1234-1234-123456789abc&#10;87654321-4321-4321-4321-cba987654321"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Un email o UUID per riga. Tutti devono essere dello stesso tipo.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Button
                onClick={handleSendTest}
                disabled={isSending || !title.trim() || !body.trim() || !testToken.trim()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                {isSending ? 'Invio Test...' : 'Invia Test'}
              </Button>
              
              <Button
                onClick={handleSendToSelection}
                disabled={isSending || !title.trim() || !body.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700"
              >
                <Send className="h-4 w-4" />
                {isSending ? 'Invio in corso...' : 'Invia a Selezione'}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground mt-4 space-y-1">
              <p>• Il test invia solo al token specificato sopra</p>
              <p>• L'invio a selezione rispetta l'audience e i filtri scelti</p>
              <p>• I segmenti filtrano automaticamente i device appropriati</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}