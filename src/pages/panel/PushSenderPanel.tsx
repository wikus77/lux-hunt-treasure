// © 2025 Joseph MULÉ – M1SSION™ – Push Sender Panel (reuses existing push logic)

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { sendPushNotification, getSuggestion } from '@/components/push-center/utils/api';
import { useLocation } from 'wouter';

export default function PushSenderPanel() {
  const [, setLocation] = useLocation();
  const [audience, setAudience] = useState<'targeted' | 'all' | 'self'>('targeted');
  const [userIds, setUserIds] = useState('');
  const [title, setTitle] = useState('');
  const [badge, setBadge] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  
  // Extras
  const [freeBuzz, setFreeBuzz] = useState(false);
  const [freeBuzzMap, setFreeBuzzMap] = useState(false);
  const [xpPoints, setXpPoints] = useState('');
  const [markerLat, setMarkerLat] = useState('');
  const [markerLng, setMarkerLng] = useState('');
  
  const [adminToken, setAdminToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const canSend = (title || message) && (audience !== 'targeted' || userIds.trim());

  const handleSend = async () => {
    if (!canSend) {
      toast.error('Compila title o message. Per targeted, inserisci User ID.');
      return;
    }

    setIsLoading(true);
    setLastResult(null);

    try {
      // Build payload (NON cambiare struttura esistente, solo aggiunte opzionali)
      const payload: any = {};
      if (title) payload.title = title;
      if (message) payload.body = message;
      if (badge !== '') payload.badge = Number(badge) || 0;
      if (imageUrl) payload.image = imageUrl;

      payload.data = {};
      if (linkUrl) payload.data.url = linkUrl;

      // Extras (opzionali, non invasivi)
      const extras: any = {};
      if (freeBuzz) extras.free_buzz = true;
      if (freeBuzzMap) extras.free_buzz_map = true;
      if (xpPoints) extras.xp_points = Number(xpPoints);
      if (markerLat && markerLng) extras.marker = { lat: markerLat, lng: markerLng };
      if (Object.keys(extras).length > 0) payload.data.extras = extras;

      let totalSent = 0;
      let totalFailed = 0;

      if (audience === 'all') {
        // Broadcast: richiede admin token
        if (!adminToken) {
          toast.error('Admin token richiesto per broadcast');
          setIsLoading(false);
          return;
        }

        const response = await sendPushNotification(
          { audience: 'all', payload },
          { adminToken }
        );

        setLastResult(response);
        
        if (response.status === 200 || response.data.success) {
          totalSent = response.data.sent || response.data.total || 0;
          totalFailed = response.data.failed || 0;
          toast.success(`✅ Broadcast inviato: ${totalSent} sent, ${totalFailed} failed`);
        } else {
          toast.error(getSuggestion(response.data.error, response.status));
        }

      } else if (audience === 'self') {
        // Self test: usa JWT corrente
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          toast.error('Non autenticato. Esegui login.');
          setIsLoading(false);
          return;
        }

        const response = await sendPushNotification(
          { audience: 'all', payload }, // self è gestito come all con JWT
          { userJWT: session.access_token }
        );

        setLastResult(response);

        if (response.status === 200 || response.data.success) {
          toast.success('✅ Push self inviata!');
        } else {
          toast.error(getSuggestion(response.data.error, response.status));
        }

      } else {
        // Targeted: invio a user_id (CSV)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          toast.error('Non autenticato. Esegui login.');
          setIsLoading(false);
          return;
        }

        const userIdList = userIds.split(',').map(s => s.trim()).filter(Boolean);
        if (userIdList.length === 0) {
          toast.error('Inserisci almeno un User ID');
          setIsLoading(false);
          return;
        }

        // Invio multiplo (uno per user_id) riusando API esistente
        const results = await Promise.allSettled(
          userIdList.map(uid => 
            sendPushNotification(
              { audience: { user_id: uid }, payload },
              { userJWT: session.access_token }
            )
          )
        );

        results.forEach((r, i) => {
          if (r.status === 'fulfilled') {
            if (r.value.status === 200 || r.value.data.success) {
              totalSent += r.value.data.sent || 1;
            } else {
              totalFailed++;
            }
          } else {
            totalFailed++;
          }
        });

        setLastResult({ status: 200, data: { sent: totalSent, failed: totalFailed } });
        toast.success(`✅ Targeted: ${totalSent} sent, ${totalFailed} failed`);
      }

    } catch (error: any) {
      toast.error(`Errore: ${error.message}`);
      setLastResult({ status: 0, data: { error: error.message } });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/panel-access')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              🚀 Push Sender
            </h1>
            <p className="text-gray-400 text-sm">Invio notifiche push (reuse existing logic)</p>
          </div>
        </div>

        <div className="glass-card p-6 space-y-6">
          {/* Audience */}
          <div className="space-y-2">
            <Label>Audience</Label>
            <Select value={audience} onValueChange={(v: any) => setAudience(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="targeted">Targeted (User IDs)</SelectItem>
                <SelectItem value="all">Broadcast (All)</SelectItem>
                <SelectItem value="self">Self Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User IDs (se targeted) */}
          {audience === 'targeted' && (
            <div className="space-y-2">
              <Label>User IDs (CSV)</Label>
              <Input
                placeholder="uuid1, uuid2, uuid3"
                value={userIds}
                onChange={(e) => setUserIds(e.target.value)}
              />
            </div>
          )}

          {/* Admin Token (se all) */}
          {audience === 'all' && (
            <div className="space-y-2">
              <Label>Admin Token</Label>
              <Input
                type="password"
                placeholder="PUSH_ADMIN_TOKEN"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
              />
            </div>
          )}

          {/* Payload Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="🔔 Titolo notifica"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Badge (numero)</Label>
              <Input
                type="number"
                placeholder="0"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              placeholder="Testo della notifica"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Link URL</Label>
            <Input
              placeholder="/notifications"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </div>

          {/* Extras (opzionali) */}
          <div className="border-t border-gray-700 pt-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-400">Extras (opzionali)</h3>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="freeBuzz"
                  checked={freeBuzz}
                  onCheckedChange={(c) => setFreeBuzz(!!c)}
                />
                <Label htmlFor="freeBuzz" className="cursor-pointer">Free Buzz</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="freeBuzzMap"
                  checked={freeBuzzMap}
                  onCheckedChange={(c) => setFreeBuzzMap(!!c)}
                />
                <Label htmlFor="freeBuzzMap" className="cursor-pointer">Free Buzz Map</Label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>XP Points</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={xpPoints}
                  onChange={(e) => setXpPoints(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Marker Lat</Label>
                <Input
                  placeholder="45.464"
                  value={markerLat}
                  onChange={(e) => setMarkerLat(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Marker Lng</Label>
                <Input
                  placeholder="9.190"
                  value={markerLng}
                  onChange={(e) => setMarkerLng(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Send Button */}
          <Button
            className="w-full"
            onClick={handleSend}
            disabled={!canSend || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Invio in corso...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Invia Push
              </>
            )}
          </Button>

          {/* Last Result */}
          {lastResult && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Ultimo Esito:</h4>
              <pre className="text-xs text-gray-300 overflow-auto">
                {JSON.stringify(lastResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
