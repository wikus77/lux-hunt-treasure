import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NotificationDebug = () => {
  const [deviceTokens, setDeviceTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { isSupported, permission, token, requestPermission } = usePushNotifications();

  // Load device tokens
  const loadDeviceTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('device_tokens')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading device tokens:', error);
        toast.error('Errore caricamento token');
      } else {
        setDeviceTokens(data || []);
        console.log('Device tokens loaded:', data);
      }
    } catch (error) {
      console.error('Exception loading device tokens:', error);
    }
  };

  useEffect(() => {
    loadDeviceTokens();
  }, []);

  const handleTestRegistration = async () => {
    setLoading(true);
    console.log('🔄 Testing FCM registration...');
    
    try {
      const result = await requestPermission();
      console.log('Registration result:', result);
      
      if (result.success) {
        toast.success('✅ Registrazione completata!');
        // Reload tokens to see the new one
        setTimeout(loadDeviceTokens, 1000);
      } else {
        toast.error(`❌ Registrazione fallita: ${result.reason}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('❌ Errore durante registrazione');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPush = async () => {
    try {
      console.log('🔄 Testing push notification...');
      
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: '🔔 PUSH Test M1SSION™',
          body: 'Questa è una notifica test ricevuta dal M1SSION Panel',
          target_user_id: user?.id || null
        }
      });
      
      if (error) {
        console.error('❌ Push test error:', error);
        toast.error(`❌ Errore push: ${error.message}`);
      } else {
        console.log('✅ Push test result:', data);
        
        // Show detailed results
        const deviceCount = data?.devices_found || 0;
        const sentCount = data?.notifications_sent || 0;
        
        if (deviceCount === 0) {
          toast.warning(`⚠️ Nessun dispositivo OneSignal registrato. Registra prima il dispositivo!`);
        } else if (sentCount > 0) {
          toast.success(`✅ Push inviato a ${sentCount}/${deviceCount} dispositivi!`);
        } else {
          toast.error(`❌ Push non inviato (${deviceCount} dispositivi trovati)`);
        }
      }
    } catch (error) {
      console.error('❌ Exception in push test:', error);
      toast.error('❌ Errore durante test push');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <Card className="bg-black/50 border-cyan-400/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">🔍 Debug Notifiche Push</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="text-sm text-gray-400">Supporto</div>
                <div className={`font-bold ${isSupported ? 'text-green-400' : 'text-red-400'}`}>
                  {isSupported === null ? 'Verifica...' : isSupported ? 'Sì' : 'No'}
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="text-sm text-gray-400">Permesso</div>
                <div className={`font-bold ${
                  permission === 'granted' ? 'text-green-400' : 
                  permission === 'denied' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {permission}
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="text-sm text-gray-400">Token presente</div>
                <div className={`font-bold ${token ? 'text-green-400' : 'text-red-400'}`}>
                  {token ? 'Sì' : 'No'}
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="text-sm text-gray-400">Tokens DB</div>
                <div className="font-bold text-cyan-400">{deviceTokens.length}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button 
                onClick={handleTestRegistration}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Registrando...' : '🔄 Test Registrazione'}
              </Button>
              
              <Button 
                onClick={handleTestPush}
                disabled={deviceTokens.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                📤 Test Push
              </Button>
              
              <Button 
                onClick={loadDeviceTokens}
                variant="outline"
                className="border-cyan-400 text-cyan-400"
              >
                🔄 Ricarica Token
              </Button>
            </div>

            {/* Current Token */}
            {token && (
              <div className="bg-gray-800/50 p-4 rounded">
                <div className="text-sm text-gray-400 mb-2">Token corrente:</div>
                <div className="text-xs font-mono text-green-400 break-all">
                  {token}
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Device Tokens */}
        <Card className="bg-black/50 border-cyan-400/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">📱 Token Dispositivi</CardTitle>
          </CardHeader>
          <CardContent>
            {deviceTokens.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Nessun token registrato
              </div>
            ) : (
              <div className="space-y-3">
                {deviceTokens.map((tokenData) => (
                  <div key={tokenData.id} className="bg-gray-800/50 p-3 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm">
                        <span className="text-cyan-400">{tokenData.device_type}</span>
                        <span className="text-gray-400 ml-2">
                          {new Date(tokenData.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-green-400">ID: {tokenData.id}</div>
                    </div>
                    <div className="text-xs font-mono text-gray-300 break-all">
                      {tokenData.token}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default NotificationDebug;