// ✅ Update By JOSEPH MULE – 12/07/2025 – Header fix
import React, { useState } from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import M1ssionText from '@/components/logo/M1ssionText';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Lock, Shield, Smartphone, Eye, EyeOff, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [show2FA, setShow2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Errore",
        description: "Le password non corrispondono.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Errore", 
        description: "La password deve essere di almeno 8 caratteri.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Password aggiornata",
        description: "La tua password è stata modificata con successo.",
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la password. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggle2FA = async () => {
    setIsLoading(true);
    try {
      // Implementazione 2FA tramite Supabase
      toast({
        title: show2FA ? "2FA disattivata" : "2FA attivata",
        description: show2FA 
          ? "L'autenticazione a due fattori è stata disattivata." 
          : "L'autenticazione a due fattori è stata attivata.",
      });
      setShow2FA(!show2FA);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile modificare le impostazioni 2FA.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Mock data per log accessi - BY JOSEPH MULE
  const loginHistory = [
    { date: '12/07/2025 14:30', device: 'iPhone 15 Pro', ip: '192.168.1.1', location: 'Milano, IT' },
    { date: '11/07/2025 09:15', device: 'MacBook Pro', ip: '192.168.1.2', location: 'Milano, IT' },
    { date: '10/07/2025 16:45', device: 'iPad Air', ip: '10.0.0.1', location: 'Roma, IT' },
    { date: '09/07/2025 11:20', device: 'iPhone 15 Pro', ip: '192.168.1.1', location: 'Milano, IT' },
    { date: '08/07/2025 13:10', device: 'Chrome Browser', ip: '203.0.113.1', location: 'Napoli, IT' }
  ];

  return (
    <div 
      className="bg-gradient-to-b from-[#131524]/70 to-black w-full"
      style={{ 
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <header 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          background: "rgba(19, 21, 33, 0.55)",
          backdropFilter: "blur(12px)"
        }}
      >
        <UnifiedHeader leftComponent={<M1ssionText />} />
      </header>
      
      <motion.main 
        className="text-white"
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-card mx-2 sm:mx-4 mt-2 sm:mt-4 mb-20">
          <div className="p-3 sm:p-6">
            {/* Header with back button */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="p-2 hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Password e Sicurezza</h1>
            </div>
            
            <div className="space-y-6">
              {/* Password Change Section */}
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Lock className="h-5 w-5" />
                    Cambio Password
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Aggiorna la tua password per mantenere il tuo account sicuro
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Password Attuale</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                        className="bg-white/5 border-white/20 text-white pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nuova Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                        className="bg-white/5 border-white/20 text-white pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Conferma Nuova Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                        className="bg-white/5 border-white/20 text-white pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePasswordChange}
                    disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? 'Aggiornamento...' : 'Aggiorna Password'}
                  </Button>
                </CardContent>
              </Card>

              {/* 2FA Section */}
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Shield className="h-5 w-5" />
                    Autenticazione a Due Fattori (2FA)
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Aggiungi un ulteriore livello di sicurezza al tuo account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-white/60" />
                      <div>
                        <p className="font-medium text-white">2FA via Email</p>
                        <p className="text-sm text-white/60">Ricevi codici OTP via email</p>
                      </div>
                    </div>
                    <Switch 
                      checked={show2FA}
                      onCheckedChange={toggle2FA}
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Login History */}
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <History className="h-5 w-5" />
                    Cronologia Accessi
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Ultimi 5 accessi al tuo account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loginHistory.map((login, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{login.device}</p>
                          <p className="text-sm text-white/60">{login.location} • {login.ip}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white">{login.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default SecurityPage;