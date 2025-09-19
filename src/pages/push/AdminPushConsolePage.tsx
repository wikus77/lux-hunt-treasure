// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Send, TestTube, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import type { AdminBroadcastRequest, PushResult } from '@/types/push';

export default function AdminPushConsolePage() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [badge, setBadge] = useState('');
  const [testToken, setTestToken] = useState('');
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
      const { data, error } = await supabase.functions.invoke('push_test', {
        body: {
          token: testToken.trim(),
          payload: {
            title: title.trim(),
            body: body.trim(),
            image: image.trim() || null,
            deepLink: deepLink.trim() || null,
            badge: badge.trim() || null,
          }
        }
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

  const handleSendBroadcast = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Titolo e messaggio sono obbligatori');
      return;
    }

    const confirmed = window.confirm(
      'Sei sicuro di voler inviare una notifica broadcast a tutti gli utenti? Questa azione non può essere annullata.'
    );
    
    if (!confirmed) return;

    setIsSending(true);
    try {
      const payload: AdminBroadcastRequest = {
        title: title.trim(),
        body: body.trim(),
        image: image.trim() || null,
        deepLink: deepLink.trim() || null,
        badge: badge.trim() || null,
        testToken: testToken.trim() || null,
      };

      const { data, error } = await supabase.functions.invoke('push_admin_broadcast', {
        body: payload
      });

      if (error) throw error;

      const result = data as PushResult;
      if (result.ok) {
        toast.success(`✅ Broadcast inviato! ${result.sent}/${result.sent! + result.failed!} device raggiunti`);
        // Reset form
        setTitle('');
        setBody('');
        setImage('');
        setDeepLink('');
        setBadge('');
        setTestToken('');
      } else {
        toast.error(`❌ Broadcast fallito: ${result.error || 'Errore sconosciuto'}`);
      }
    } catch (error: any) {
      console.error('Admin broadcast error:', error);
      toast.error(`❌ Errore broadcast: ${error.message || 'Errore di rete'}`);
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
            Admin Push Console
          </h1>
          <p className="text-muted-foreground">
            Invio notifiche push broadcast - Solo Amministratori
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Notifica Push Broadcast
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
            <p className="text-xs text-muted-foreground mt-1">
              Se fornito, verrà utilizzato anche per il test prima del broadcast
            </p>
          </div>

          <div className="flex gap-4 pt-4 border-t">
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
              onClick={handleSendBroadcast}
              disabled={isSending || !title.trim() || !body.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700"
            >
              <Send className="h-4 w-4" />
              {isSending ? 'Invio Broadcast...' : 'Invia Broadcast Admin'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Il broadcast raggiungerà tutti i device registrati con notifiche attive</p>
            <p>• Il test invia solo al token specificato sopra</p>
            <p>• I deep link permettono di aprire sezioni specifiche dell'app</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}