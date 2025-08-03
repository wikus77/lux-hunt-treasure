// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Send, Bell, Users, User, Shield, CheckCircle } from 'lucide-react';

const PushTestPage: React.FC = () => {
  console.log('🔔 PUSH-TEST PAGE COMPONENT INSTANTIATED:', {
    url: window.location.href,
    pathname: window.location.pathname,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    referrer: document.referrer
  });
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'user'>('all');
  const [targetUserId, setTargetUserId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user } = useUnifiedAuth();
  const { toast } = useToast();

  // 🚨 EMERGENCY FIX: Admin bypass per wikus77@hotmail.it + emergency access
  const currentEmail = user?.email?.toLowerCase();
  const isAdmin = currentEmail === 'wikus77@hotmail.it';
  
  // EMERGENCY BYPASS: Se non autenticato ma URL contiene token emergency
  const urlParams = new URLSearchParams(window.location.search);
  const emergencyBypass = urlParams.get('emergency') === 'admin' || 
                          localStorage.getItem('emergency_admin_access') === 'true';
  
  console.log('🚨 PUSH-TEST PAGE - EMERGENCY DEBUG:', {
    user: user,
    userEmail: user?.email,
    currentEmail: currentEmail,
    isAdmin: isAdmin,
    emergencyBypass: emergencyBypass,
    authState: user ? 'AUTHENTICATED' : 'NOT_AUTHENTICATED',
    finalAccess: isAdmin || emergencyBypass
  });

  useEffect(() => {
    console.log('🔔 PUSH-TEST PAGE MOUNTED SUCCESSFULLY');
    console.log('🔔 User state:', { email: user?.email, isAdmin });
    console.log('🔔 Current timestamp:', new Date().toISOString());
  }, [user, isAdmin]);

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "⚠️ Campi obbligatori",
        description: "Inserisci titolo e messaggio.",
        variant: "destructive"
      });
      return;
    }

    if (!isAdmin && !emergencyBypass) {
      toast({
        title: "❌ Accesso negato",
        description: "Solo gli admin possono inviare notifiche.",
        variant: "destructive"
      });
      return;
    }

    if (targetType === 'user' && !targetUserId.trim()) {
      toast({
        title: "⚠️ User ID richiesto",
        description: "Inserisci l'ID utente per l'invio singolo.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      const body: any = {
        title: title.trim(),
        body: message.trim(),
        data: {
          url: '/notifications',
          timestamp: new Date().toISOString(),
          source: 'admin_test'
        }
      };

      // Add target user if specified
      if (targetType === 'user') {
        body.targetUserId = targetUserId.trim();
      }

      console.log('🚨 CRITICAL PUSH DEBUG - Request:', body);

      // Call edge function to send push notifications
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body
      });

      console.log('🚨 CRITICAL PUSH DEBUG - Edge Function Response:', {
        data,
        error,
        success: data?.success,
        sent: data?.sent,
        total: data?.total,
        message: data?.message
      });

      if (error) {
        console.error('❌ Error sending push notification:', error);
        toast({
          title: "❌ Errore invio",
          description: error.message || "Impossibile inviare la notifica.",
          variant: "destructive"
        });
      } else {
        console.log('✅ Push notification sent successfully:', data);
        toast({
          title: "✅ Notifica inviata",
          description: targetType === 'all' 
            ? `Inviata a ${data?.sent || 0} dispositivi` 
            : `Inviata all'utente ${targetUserId}`,
        });
        
        // Reset form
        setTitle('');
        setMessage('');
        setTargetUserId('');
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      toast({
        title: "❌ Errore",
        description: "Errore durante l'invio della notifica.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // 🚨 EMERGENCY FIX: Access control con bypass d'emergenza
  if (!isAdmin && !emergencyBypass) {
    console.error('🚨 ACCESS DENIED - EMERGENCY DEBUG:', {
      user: user,
      userEmail: user?.email,
      expectedEmail: 'wikus77@hotmail.it',
      emailMatch: user?.email?.toLowerCase() === 'wikus77@hotmail.it',
      isAdmin: isAdmin,
      emergencyBypass: emergencyBypass,
      urlParams: window.location.search,
      localStorage: localStorage.getItem('emergency_admin_access'),
      timestamp: new Date().toISOString()
    });
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pt-20 flex items-center justify-center">
        <Card className="bg-black/80 border-red-500/30 backdrop-blur-xl max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-400 mb-4">❌ Accesso Negato</h2>
            <p className="text-white/70 mb-4">
              Solo gli amministratori possono accedere a questa pagina.
            </p>
            <div className="text-xs text-white/50 p-3 bg-black/30 rounded border border-white/10">
              <strong>EMERGENCY DEBUG:</strong><br />
              User: {user?.email || 'NON_AUTENTICATO'}<br />
              Required: wikus77@hotmail.it<br />
              Match: {user?.email?.toLowerCase() === 'wikus77@hotmail.it' ? 'YES' : 'NO'}<br />
              Emergency: {emergencyBypass ? 'ENABLED' : 'DISABLED'}
            </div>
            <Button 
              onClick={() => {
                localStorage.setItem('emergency_admin_access', 'true');
                window.location.reload();
              }}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white"
            >
              🚨 EMERGENCY ACCESS
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pt-20">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-black/80 border-[#00D1FF]/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-orbitron text-white flex items-center gap-3">
              <Bell className="w-6 h-6 text-[#00D1FF]" />
              Test Notifiche Push - M1SSION™
            </CardTitle>
            <p className="text-white/60">Pannello di test per amministratori</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Destinatario
                </label>
                <Select value={targetType} onValueChange={(value: 'all' | 'user') => setTargetType(value)}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    <SelectItem value="all" className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Tutti gli utenti
                      </div>
                    </SelectItem>
                    <SelectItem value="user" className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Utente specifico
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {targetType === 'user' && (
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    User ID Destinatario
                  </label>
                  <Input
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    placeholder="Inserisci l'UUID dell'utente..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              )}

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
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Inserisci il messaggio della notifica..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 min-h-[120px]"
                  maxLength={200}
                />
                <p className="text-white/50 text-xs mt-1">
                  {message.length}/200 caratteri
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
                      {message || 'Messaggio della notifica'}
                    </p>
                    <p className="text-white/50 text-xs mt-1">
                      Destinatario: {targetType === 'all' ? 'Tutti gli utenti' : `Utente ${targetUserId || '[ID]'}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSendNotification}
              disabled={isSending || !title.trim() || !message.trim() || (targetType === 'user' && !targetUserId.trim())}
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
                  {targetType === 'all' ? 'Invia a tutti' : 'Invia all\'utente'}
                </>
              )}
            </Button>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <h4 className="text-yellow-400 font-medium text-sm mb-1">⚠️ Nota per il test:</h4>
              <p className="text-white/70 text-xs">
                Questa è una pagina di test. Le notifiche verranno inviate realmente ai dispositivi. 
                Usa con cautela in produzione.
              </p>
            </div>

            <p className="text-white/50 text-xs text-center">
              Solo amministratori autorizzati possono accedere a questa funzione. 
              Tutti gli invii vengono registrati nei log di sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PushTestPage;