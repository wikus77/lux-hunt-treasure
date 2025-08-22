// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Componente per Generazione e Test Token FCM

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getFCMToken, isFCMSupported } from '@/lib/firebase';
import { Zap, AlertTriangle, CheckCircle, Copy } from 'lucide-react';

export const FCMTokenGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const generateToken = async () => {
    setIsGenerating(true);
    
    try {
      // Check support
      if (!isFCMSupported()) {
        toast.error('❌ FCM non supportato in questo browser');
        return;
      }

      // Get user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        toast.error('❌ Utente non autenticato');
        return;
      }
      setUser(currentUser);

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('❌ Permessi notifiche negati');
        return;
      }

      // Generate token
      const fcmToken = await getFCMToken();
      if (!fcmToken) {
        toast.error('❌ Impossibile generare token FCM');
        return;
      }

      setToken(fcmToken);
      
      // Save to database with complete cleanup
      try {
        // First, deactivate all old tokens for this user
        await supabase
          .from('user_push_tokens')
          .update({ is_active: false })
          .eq('user_id', currentUser.id);

        // Insert new token
        const { error } = await supabase
          .from('user_push_tokens')
          .insert({
            user_id: currentUser.id,
            fcm_token: fcmToken,
            device_info: {
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              timestamp: new Date().toISOString(),
              generatedAt: new Date().toISOString(),
              tokenGenerator: true,
              browser: navigator.userAgent.includes('Safari') ? 'Safari' : 
                      navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'
            },
            is_active: true
          });

        if (error) {
          console.error('❌ Database error:', error);
          toast.error(`❌ Errore database: ${error.message}`);
        } else {
          toast.success('✅ Token FCM salvato nel database!');
        }
      } catch (dbError: any) {
        console.error('❌ Database exception:', dbError);
        toast.error(`❌ Errore salvataggio: ${dbError.message}`);
      }

    } catch (error: any) {
      console.error('❌ Token generation error:', error);
      toast.error(`❌ Errore generazione: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      toast.success('✅ Token copiato negli appunti');
    }
  };

  const testNotification = async () => {
    if (!token || !user) {
      toast.error('❌ Prima genera un token');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-firebase-push', {
        body: {
          user_id: user.id,
          title: '🎯 Test Token Generator',
          body: `Token test da FCM Generator - ${new Date().toLocaleTimeString()}`,
          data: {
            source: 'token_generator',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) {
        toast.error(`❌ Test fallito: ${error.message}`);
      } else {
        toast.success(`✅ Test inviato! Sent: ${data.sent_count || 0}`);
      }
    } catch (error: any) {
      toast.error(`❌ Errore test: ${error.message}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          🔥 FCM Token Generator & Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-800 dark:text-blue-200">
            Questo componente genera e salva un token FCM nel database per testare le notifiche
          </span>
        </div>

        <Button
          onClick={generateToken}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            '🔄 Generazione token...'
          ) : (
            '🚀 Genera Token FCM'
          )}
        </Button>

        {token && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Token generato con successo!</span>
            </div>
            
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Token FCM:</span>
                <Button
                  onClick={copyToken}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copia
                </Button>
              </div>
              <div className="text-xs font-mono break-all bg-white dark:bg-gray-900 p-2 rounded border">
                {token}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={testNotification}
                variant="outline"
                className="w-full"
              >
                🧪 Test Notifica Push
              </Button>
            </div>

            {user && (
              <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                <p><strong>👤 Utente:</strong> {user.email}</p>
                <p><strong>🆔 User ID:</strong> {user.id}</p>
                <p><strong>⏰ Generato:</strong> {new Date().toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};