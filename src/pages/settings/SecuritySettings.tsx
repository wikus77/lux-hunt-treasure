// 🔐 BY JOSEPH MULE — Capacitor iOS Compatible
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Key, LogOut, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SecuritySettings: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);

  const generateRecoveryKey = () => {
    const key = Array.from({ length: 12 }, () => 
      Math.random().toString(36).substring(2, 6)
    ).join('-').toUpperCase();
    setRecoveryKey(key);
    
    // Save hashed version to Supabase
    saveRecoveryKey(key);
  };

  const saveRecoveryKey = async (key: string) => {
    if (!user) return;
    
    try {
      // Simple hash for demo - in production use proper crypto
      const hashedKey = btoa(key);
      
      await supabase.from('profiles').update({ 
        recovery_key: hashedKey 
      }).eq('id', user.id);

      toast({
        title: "✅ Codice di emergenza generato",
        description: "Salva questo codice in un luogo sicuro. Non potrà essere visualizzato nuovamente."
      });
    } catch (error) {
      console.error('Recovery key save error:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast({
        title: "❌ Campi obbligatori",
        description: "Compila tutti i campi per cambiare la password.",
        variant: "destructive"
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "❌ Password non corrispondenti",
        description: "La nuova password e la conferma devono essere identiche.",
        variant: "destructive"
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        title: "❌ Password troppo corta",
        description: "La password deve contenere almeno 6 caratteri.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      setPasswords({ current: '', new: '', confirm: '' });
      toast({
        title: "✅ Password aggiornata",
        description: "La tua password è stata modificata con successo."
      });
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: "❌ Errore cambio password",
        description: error.message || "Impossibile aggiornare la password. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutAllDevices = async () => {
    setLoading(true);
    try {
      // Sign out from all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;

      // Clear local storage
      localStorage.clear();
      
      toast({
        title: "✅ Disconnesso da tutti i dispositivi",
        description: "Tutte le sessioni sono state invalidate."
      });

      // Redirect to login
      window.location.href = '/login';
    } catch (error: any) {
      console.error('Sign out all devices error:', error);
      toast({
        title: "❌ Errore disconnessione",
        description: "Impossibile disconnettere tutti i dispositivi. Riprova.",
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
      className="space-y-6"
    >
      {/* Password Change */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Cambio Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-white">Password Attuale</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords ? "text" : "password"}
                value={passwords.current}
                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                className="bg-black/20 border-white/20 text-white pr-10"
                placeholder="Inserisci password attuale"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-white">Nuova Password</Label>
            <Input
              id="newPassword"
              type={showPasswords ? "text" : "password"}
              value={passwords.new}
              onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
              className="bg-black/20 border-white/20 text-white"
              placeholder="Inserisci nuova password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">Conferma Password</Label>
            <Input
              id="confirmPassword"
              type={showPasswords ? "text" : "password"}
              value={passwords.confirm}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
              className="bg-black/20 border-white/20 text-white"
              placeholder="Conferma nuova password"
            />
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={loading}
            className="w-full bg-[#00D1FF] hover:bg-[#00B8E6] text-black font-semibold"
          >
            {loading ? 'Aggiornamento...' : 'Cambia Password'}
          </Button>
        </CardContent>
      </Card>

      {/* Recovery Key */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Codice di Emergenza
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/70 text-sm">
            Genera un codice di emergenza per recuperare l'accesso al tuo account.
          </p>

          {recoveryKey && (
            <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm font-semibold mb-2">
                ⚠️ IMPORTANTE: Salva questo codice ora!
              </p>
              <code className="text-white font-mono bg-black/40 p-2 rounded block text-center">
                {recoveryKey}
              </code>
              <p className="text-red-300 text-xs mt-2">
                Questo codice non sarà più visibile dopo aver chiuso questa schermata.
              </p>
            </div>
          )}

          <Button
            onClick={generateRecoveryKey}
            variant="outline"
            className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
          >
            {recoveryKey ? 'Genera Nuovo Codice' : 'Genera Codice di Emergenza'}
          </Button>
        </CardContent>
      </Card>

      {/* Sign Out All Devices */}
      <Card className="bg-black/40 border-red-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron flex items-center">
            <LogOut className="w-5 h-5 mr-2" />
            Gestione Sessioni
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/70 text-sm">
            Disconnetti il tuo account da tutti i dispositivi e invalidare tutte le sessioni attive.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                Disconnetti da Tutti i Dispositivi
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-black/90 border-red-500/20">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Conferma Disconnessione</AlertDialogTitle>
                <AlertDialogDescription className="text-white/70">
                  Questa azione disconnetterà il tuo account da tutti i dispositivi. 
                  Dovrai effettuare nuovamente il login ovunque.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/10 text-white border-white/20">
                  Annulla
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSignOutAllDevices}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Conferma Disconnessione
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SecuritySettings;