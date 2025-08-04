// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function DeviceTokenDebug() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('device_tokens')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching tokens:', error);
          toast.error('Errore nel recupero token');
        } else {
          setTokens(data || []);
        }
      }
    } catch (error) {
      console.error('Token fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerTestToken = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Utente non autenticato');
        return;
      }

      // Check if on iOS Capacitor
      const isCapacitor = (window as any).Capacitor?.isNativePlatform();
      const isIOS = (window as any).Capacitor?.getPlatform() === 'ios';
      
      if (isCapacitor && isIOS) {
        // Force iOS registration
        const { PushNotifications } = await import('@capacitor/push-notifications');
        await PushNotifications.register();
        toast.success('Registrazione iOS avviata');
      } else {
        // Register test token for current device
        const testToken = 'test_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const { error } = await supabase
          .from('device_tokens')
          .upsert({
            user_id: user.id,
            token: testToken,
            device_type: 'test',
            created_at: new Date().toISOString(),
            last_used: new Date().toISOString()
          }, {
            onConflict: 'user_id,device_type'
          });

        if (error) {
          console.error('Test token error:', error);
          toast.error('Errore nel salvataggio test token');
        } else {
          toast.success('Test token registrato');
          fetchTokens();
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Errore nella registrazione');
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  return (
    <div className="mt-8 p-4 bg-gray-800 rounded-lg">
      <h3 className="font-bold mb-4 text-[#00D1FF]">🔍 Device Tokens Debug</h3>
      
      <div className="space-y-3 mb-4">
        <button
          onClick={fetchTokens}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
        >
          {loading ? '⏳' : '🔄'} Aggiorna Token
        </button>
        
        <button
          onClick={registerTestToken}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          📱 Registra Test Token
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-300">
          <strong>Token registrati:</strong> {tokens.length}
        </p>
        
        {tokens.length === 0 ? (
          <div className="text-yellow-400 p-3 bg-yellow-900/30 rounded">
            ⚠️ Nessun token dispositivo registrato. Le notifiche push non funzioneranno.
          </div>
        ) : (
          <div className="space-y-2">
            {tokens.map((token, index) => (
              <div key={token.id} className="text-xs bg-gray-700 p-3 rounded">
                <div><strong>Type:</strong> <span className="text-[#00D1FF]">{token.device_type}</span></div>
                <div><strong>Token:</strong> {token.token.substring(0, 50)}...</div>
                <div><strong>Created:</strong> {new Date(token.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-400">
        <p>🍎 <strong>iOS:</strong> Aprire app su iPhone, accettare permessi notifiche</p>
        <p>🤖 <strong>Android:</strong> Aprire app su Android, accettare permessi notifiche</p>
        <p>🌐 <strong>Web:</strong> Accettare permessi notifiche dal browser</p>
      </div>
    </div>
  );
}