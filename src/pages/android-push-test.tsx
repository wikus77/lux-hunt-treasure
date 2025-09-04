// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Android Push Notifications Test Page

import React from 'react';
import { AndroidPushSetup } from '@/components/android/AndroidPushSetup';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Smartphone, Send, Bell } from 'lucide-react';

export default function AndroidPushTest() {
  const sendTestNotification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Devi essere autenticato per testare le notifiche');
        return;
      }

      // Call edge function to send test push
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: user.id,
          title: '🚀 Test M1SSION Android',
          body: 'Notifica push di test per Android funzionante!'
        }
      });

      if (error) {
        console.error('Error sending test notification:', error);
        toast.error('Errore invio notifica test');
      } else {
        toast.success('📱 Notifica test inviata!');
      }
    } catch (error) {
      console.error('Error in sendTestNotification:', error);
      toast.error('Errore durante l\'invio della notifica');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto pt-safe-top">
        <div className="text-center mb-8">
          <Smartphone className="w-16 h-16 text-m1ssion-blue mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">🔔 Push Android Test</h1>
          <p className="text-gray-300">
            Testa le notifiche push native per Android
          </p>
        </div>

        {/* Android Push Setup Component */}
        <AndroidPushSetup className="mb-6" />

        {/* Test Controls */}
        <div className="space-y-4">
          <Button
            onClick={sendTestNotification}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Invia Notifica Test
          </Button>

          <div className="glass-card p-4">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Come testare:
            </h3>
            <ol className="text-sm text-gray-300 space-y-1">
              <li>1. Attiva le notifiche con il pulsante sopra</li>
              <li>2. Invia una notifica test</li>
              <li>3. Metti l'app in background</li>
              <li>4. Dovresti ricevere la notifica</li>
            </ol>
          </div>

          <div className="glass-card p-4">
            <h3 className="font-bold mb-2 text-m1ssion-blue">📱 Requisiti Android:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• App installata come APK</li>
              <li>• Connessione internet attiva</li>
              <li>• Permessi notifiche abilitati</li>
              <li>• Google Play Services attivi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}