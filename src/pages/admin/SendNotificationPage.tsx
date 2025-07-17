// © 2025 Joseph MULÉ – M1SSION™
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Send, Bell } from 'lucide-react';

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

    // Check if user is admin
    if (!user || user.email !== 'wikus77@hotmail.it') {
      toast({
        title: "❌ Accesso negato",
        description: "Solo gli admin possono inviare notifiche.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      // Call edge function to send push notifications
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: title.trim(),
          body: body.trim(),
          data: {
            url: '/notifications',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) {
        console.error('Error sending push notification:', error);
        toast({
          title: "❌ Errore invio",
          description: error.message || "Impossibile inviare la notifica.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ Notifica inviata",
          description: `Inviata a ${data?.sent || 0} dispositivi`,
        });
        
        // Reset form
        setTitle('');
        setBody('');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "❌ Errore",
        description: "Errore durante l'invio della notifica.",
        variant: "destructive"
      });
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
              Invio Notifiche Push - M1SSION™
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Titolo notifica
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Inserisci il titolo..."
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
                  placeholder="Inserisci il messaggio della notifica..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 min-h-[120px]"
                  maxLength={200}
                />
                <p className="text-white/50 text-xs mt-1">
                  {body.length}/200 caratteri
                </p>
              </div>
            </div>

            <div className="bg-[#00D1FF]/10 border border-[#00D1FF]/30 rounded-lg p-4">
              <h3 className="text-[#00D1FF] font-medium mb-2">Anteprima notifica:</h3>
              <div className="bg-black/50 rounded-lg p-3 border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#00D1FF] rounded-sm flex-shrink-0 flex items-center justify-center">
                    <span className="text-black text-xs font-bold">M1</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm">
                      {title || 'Titolo notifica'}
                    </h4>
                    <p className="text-white/70 text-sm">
                      {body || 'Messaggio della notifica'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSendNotification}
              disabled={isSending || !title.trim() || !body.trim()}
              className="w-full bg-gradient-to-r from-[#00D1FF] to-[#0099CC] hover:from-[#0099CC] hover:to-[#007799] text-black font-medium"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                  Invio in corso...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Invia notifica a tutti
                </>
              )}
            </Button>

            <p className="text-white/50 text-xs text-center">
              La notifica verrà inviata a tutti i dispositivi registrati che hanno attivato le notifiche push.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SendNotificationPage;