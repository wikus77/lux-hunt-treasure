// FILE CREATO — BY JOSEPH MULE
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Key, Lock, AlertTriangle, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';

export const SecurityPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Compila tutti i campi richiesti');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Le password non coincidono');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La password deve essere di almeno 6 caratteri');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate password change (implement with Supabase auth)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Password aggiornata con successo');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error('Errore nell\'aggiornamento della password');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSetup = () => {
    toast.info('Funzionalità in arrivo');
  };

  return (
    <motion.div 
      className="bg-gradient-to-b from-[#131524]/70 to-black w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ 
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Fixed Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          background: 'rgba(19, 21, 33, 0.55)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <UnifiedHeader />
      </header>
      
      {/* Main scrollable content */}
      <main
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px) + 40px)',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
      >
        <div className="container mx-auto max-w-2xl p-4 space-y-6">
          <motion.h1
            className="text-3xl font-orbitron font-bold text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="text-white">PASSWORD E SICUREZZA</span>
          </motion.h1>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <Key className="w-6 h-6 mr-2 text-[#00D1FF]" />
                  Cambia Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="current_password" className="text-white">Password Attuale</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="new_password" className="text-white">Nuova Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm_password" className="text-white">Conferma Nuova Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="w-full bg-[#00D1FF] hover:bg-[#00B8E6] text-black"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Aggiornamento...' : 'Aggiorna Password'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Two-Factor Authentication */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-[#00D1FF]" />
                  Autenticazione a Due Fattori
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">2FA Non Attivata</h3>
                    <p className="text-gray-400 text-sm">Aggiungi un livello extra di sicurezza al tuo account</p>
                  </div>
                  <Button onClick={handleTwoFactorSetup} variant="outline">
                    Attiva 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2 text-yellow-400" />
                  Suggerimenti per la Sicurezza
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Lock className="w-4 h-4 mt-0.5 mr-3 text-[#00D1FF]" />
                    <div>
                      <p className="text-white text-sm font-medium">Usa una password forte</p>
                      <p className="text-gray-400 text-xs">Combina lettere maiuscole, minuscole, numeri e simboli</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Shield className="w-4 h-4 mt-0.5 mr-3 text-[#00D1FF]" />
                    <div>
                      <p className="text-white text-sm font-medium">Attiva l'autenticazione a due fattori</p>
                      <p className="text-gray-400 text-xs">Proteggi il tuo account con un secondo livello di sicurezza</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Eye className="w-4 h-4 mt-0.5 mr-3 text-[#00D1FF]" />
                    <div>
                      <p className="text-white text-sm font-medium">Non condividere le tue credenziali</p>
                      <p className="text-gray-400 text-xs">Il team M1SSION non ti chiederà mai la password</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      <BottomNavigation />
    </motion.div>
  );
};

export default SecurityPage;