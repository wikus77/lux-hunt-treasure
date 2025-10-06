// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { sendPushNotification } from '@/components/push-center/utils/api';
import { Loader2, Send } from 'lucide-react';

type AudienceType = 'single' | 'multi' | 'all';

const PushControlPanelPage = () => {
  const [audience, setAudience] = useState<AudienceType>('all');
  const [userIds, setUserIds] = useState('');
  const [title, setTitle] = useState('');
  const [badge, setBadge] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('/notifications');
  const [freeBuzz, setFreeBuzz] = useState(false);
  const [freeBuzzMap, setFreeBuzzMap] = useState(false);
  const [xpPoints, setXpPoints] = useState('');
  const [markerLat, setMarkerLat] = useState('');
  const [markerLng, setMarkerLng] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title && !message) {
      toast.error('Inserisci almeno title o message');
      return;
    }

    if (audience !== 'all' && !userIds.trim()) {
      toast.error('Inserisci User ID(s) per invio targeted');
      return;
    }

    setLoading(true);

    try {
      // Build payload compatible with existing system
      const payload: any = {
        title: title || undefined,
        body: message || undefined,
        url: linkUrl || '/notifications',
      };

      if (imageUrl) {
        payload.image = imageUrl;
      }

      if (badge) {
        payload.badge = Number(badge) || 0;
      }

      // Add extras only if needed (non-invasive)
      const extras: any = {};
      if (freeBuzz) extras.free_buzz = true;
      if (freeBuzzMap) extras.free_buzz_map = true;
      if (xpPoints) extras.xp_points = Number(xpPoints) || 0;
      if (markerLat && markerLng) {
        extras.marker = {
          lat: Number(markerLat) || 0,
          lng: Number(markerLng) || 0,
        };
      }

      if (Object.keys(extras).length > 0) {
        payload.data = { extras };
      }

      // Prepare request based on audience
      let requestPayload: any;
      
      if (audience === 'all') {
        requestPayload = {
          audience: 'all',
          payload,
        };
      } else {
        // Targeted mode
        const ids = userIds.split(',').map(id => id.trim()).filter(Boolean);
        
        if (ids.length === 0) {
          toast.error('User IDs non validi');
          setLoading(false);
          return;
        }

        requestPayload = {
          audience: 'list',
          filters: {
            ids: ids,
          },
          payload,
        };
      }

      // Call existing API (requires admin token server-side)
      const result = await sendPushNotification(requestPayload, {
        // The API will use session JWT, admin features require proper backend auth
      });

      if (result.status === 200 || result.status === 201) {
        const data = result.data;
        toast.success(`✅ Push inviata! Sent: ${data.sent || 0}, Failed: ${data.failed || 0}`);
        
        // Reset form
        setTitle('');
        setMessage('');
        setImageUrl('');
        setBadge('');
        setFreeBuzz(false);
        setFreeBuzzMap(false);
        setXpPoints('');
        setMarkerLat('');
        setMarkerLng('');
      } else {
        toast.error(`Errore: ${result.data.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Push send error:', error);
      toast.error(error.message || 'Errore invio push');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Push Control Panel
            </CardTitle>
            <CardDescription>
              Invia notifiche push a utenti specifici o broadcast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Audience Selector */}
              <div className="space-y-2">
                <Label>Destinatari</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant={audience === 'single' ? 'default' : 'outline'}
                    onClick={() => setAudience('single')}
                    className="flex-1"
                  >
                    Single User
                  </Button>
                  <Button
                    type="button"
                    variant={audience === 'multi' ? 'default' : 'outline'}
                    onClick={() => setAudience('multi')}
                    className="flex-1"
                  >
                    Multi User
                  </Button>
                  <Button
                    type="button"
                    variant={audience === 'all' ? 'default' : 'outline'}
                    onClick={() => setAudience('all')}
                    className="flex-1"
                  >
                    All Users
                  </Button>
                </div>
              </div>

              {/* User IDs (only for targeted) */}
              {audience !== 'all' && (
                <div className="space-y-2">
                  <Label htmlFor="userIds">User ID(s)</Label>
                  <Input
                    id="userIds"
                    placeholder="uuid1, uuid2, uuid3..."
                    value={userIds}
                    onChange={(e) => setUserIds(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separati da virgola
                  </p>
                </div>
              )}

              {/* Main Fields */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Titolo notifica"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge">Badge (numero)</Label>
                <Input
                  id="badge"
                  type="number"
                  placeholder="0"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Corpo del messaggio"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (opzionale)</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkUrl">Link URL</Label>
                <Input
                  id="linkUrl"
                  placeholder="/notifications"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>

              {/* Extras Section */}
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Extras (Opzionali)</CardTitle>
                  <CardDescription className="text-xs">
                    Campi addizionali non invasivi
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="freeBuzz" className="text-sm">Free Buzz</Label>
                    <Switch
                      id="freeBuzz"
                      checked={freeBuzz}
                      onCheckedChange={setFreeBuzz}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="freeBuzzMap" className="text-sm">Free Buzz Map</Label>
                    <Switch
                      id="freeBuzzMap"
                      checked={freeBuzzMap}
                      onCheckedChange={setFreeBuzzMap}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="xpPoints" className="text-sm">XP Points</Label>
                    <Input
                      id="xpPoints"
                      type="number"
                      placeholder="0"
                      value={xpPoints}
                      onChange={(e) => setXpPoints(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="markerLat" className="text-sm">Marker Lat</Label>
                      <Input
                        id="markerLat"
                        type="number"
                        step="any"
                        placeholder="45.123"
                        value={markerLat}
                        onChange={(e) => setMarkerLat(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="markerLng" className="text-sm">Marker Lng</Label>
                      <Input
                        id="markerLng"
                        type="number"
                        step="any"
                        placeholder="9.456"
                        value={markerLng}
                        onChange={(e) => setMarkerLng(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || (!title && !message)}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Invio...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Invia Push
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PushControlPanelPage;
