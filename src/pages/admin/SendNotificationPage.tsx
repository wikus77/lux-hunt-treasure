// @ts-nocheck
// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Send, Bell } from 'lucide-react';
import { sendAdminBroadcast } from '@/lib/sendAdminBroadcast';

const SendNotificationPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast({
        title: "⚠️ Campi obbligatori",
        description: "Inserisci titolo e messaggio.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      // Log admin notification send
      await supabase
        .from('admin_logs')
        .insert({
          event_type: 'webpush_admin_broadcast',
          note: `Admin Page Send - Title: ${title}, Body: ${body}`,
          context: 'admin_page_notification'
        });

      // Use new webpush-admin-broadcast function
      const data = await sendAdminBroadcast({
        title: title.trim(),
        body: body.trim(),
        url: '/notifications',
        target: { all: true }
      });

      toast({
        title: "✅ Push notifica inviata",
        description: `Inviata a ${data?.success || 0}/${data?.total || 0} dispositivi`,
      });
      
      // Reset form
      setTitle('');
      setBody('');

    } catch (error: any) {
      console.error('Error sending push notification:', error);
      
      if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        toast({
          title: "❌ Accesso negato",
          description: "Solo gli admin possono inviare notifiche.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "❌ Errore invio",
          description: error.message || "Impossibile inviare la notifica.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pt-20">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-black/80 border-[#00D1FF]/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-orbitron text-white flex items-center gap-3">
              <Bell className="w-6 h-6 text-[#00D1FF]" />
              🔥 Firebase Push Notifications - M1SSION™
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Titolo notifica Firebase
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Inserisci il titolo Firebase..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  maxLength={50}
                />
                <p className="text-white/50 text-xs mt-1">
                  {title.length}/50 caratteri
                </p>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Messaggio
                </label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Inserisci il messaggio della notifica Firebase..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 min-h-[120px]"
                  maxLength={200}
                />
                <p className="text-white/50 text-xs mt-1">
                  {body.length}/200 caratteri
                </p>
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <h3 className="text-orange-400 font-medium mb-2">🔥 Anteprima notifica Firebase:</h3>
              <div className="bg-black/50 rounded-lg p-3 border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-sm flex-shrink-0 flex items-center justify-center">
                    <span className="text-black text-xs font-bold">🔥</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm">
                      {title || 'Titolo notifica Firebase'}
                    </h4>
                    <p className="text-white/70 text-sm">
                      {body || 'Messaggio della notifica Firebase'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSendNotification}
              disabled={isSending || !title.trim() || !body.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  🔥 Invio Firebase in corso...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  🔥 Invia notifica Firebase a tutti
                </>
              )}
            </Button>

            <p className="text-white/50 text-xs text-center">
              🔥 La notifica verrà inviata tramite Firebase Cloud Messaging a tutti i dispositivi con token FCM attivi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SendNotificationPage;