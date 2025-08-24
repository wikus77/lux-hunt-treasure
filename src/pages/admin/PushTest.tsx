// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Admin Push Notification Test Page

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Zap, Users } from 'lucide-react';

const PushTest: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userToken, setUserToken] = useState<string>('');
  const [formData, setFormData] = useState({
    title: 'M1SSION™ Test',
    body: 'Test push notification from admin panel',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png'
  });

  // Load user's latest token on mount
  useEffect(() => {
    loadUserToken();
  }, [user]);

  const loadUserToken = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('push_tokens')
        .select('token')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setUserToken(data[0].token);
        console.log('✅ Loaded user token:', data[0].token.substring(0, 20) + '...');
      } else {
        console.log('❌ No FCM token found for user');
      }
    } catch (error) {
      console.error('❌ Error loading user token:', error);
    }
  };

  const sendTestPush = async () => {
    if (!userToken) {
      toast({
        title: "❌ Nessun Token",
        description: "Non è stato trovato un token FCM per questo utente.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Sending test push notification...');
      
      const { data, error } = await supabase.functions.invoke('send-firebase-push', {
        body: {
          token: userToken,
          title: formData.title,
          body: formData.body,
          icon: formData.icon,
          badge: formData.badge,
          data: {
            source: 'admin_test',
            timestamp: Date.now()
          }
        }
      });

      if (error) {
        throw error;
      }

      console.log('✅ Push sent successfully:', data);
      
      toast({
        title: "✅ Push Inviato!",
        description: `Notifica inviata al token: ${userToken.substring(0, 20)}...`
      });

    } catch (error: any) {
      console.error('❌ Error sending push:', error);
      
      toast({
        title: "❌ Errore Invio",
        description: error?.message || "Impossibile inviare la notifica push.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Push Notification Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Token FCM Utente</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={userToken ? `${userToken.substring(0, 40)}...` : 'Nessun token trovato'}
                readOnly
                className="bg-black/20 border-white/20 text-white text-sm font-mono"
              />
              <Button
                onClick={loadUserToken}
                variant="outline"
                size="sm"
                className="border-[#00D1FF]/30 text-[#00D1FF] hover:bg-[#00D1FF]/10"
              >
                Ricarica
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Titolo</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-black/20 border-white/20 text-white"
              placeholder="Titolo della notifica"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Messaggio</Label>
            <Textarea
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
              className="bg-black/20 border-white/20 text-white resize-none"
              placeholder="Contenuto della notifica"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Icona URL</Label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="bg-black/20 border-white/20 text-white text-sm"
                placeholder="/icon-192x192.png"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Badge URL</Label>
              <Input
                value={formData.badge}
                onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                className="bg-black/20 border-white/20 text-white text-sm"
                placeholder="/icon-192x192.png"
              />
            </div>
          </div>

          <Button
            onClick={sendTestPush}
            disabled={loading || !userToken}
            className="w-full bg-[#00D1FF] hover:bg-[#00B8E6] text-black font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Invio in corso...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Invia Test Push
              </>
            )}
          </Button>

          {!userToken && (
            <div className="text-center text-yellow-400 text-sm">
              ⚠️ Attiva le notifiche push in Impostazioni → Notifiche per ottenere un token
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PushTest;