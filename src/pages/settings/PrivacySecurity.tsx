// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Eye, EyeOff, User, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

interface SecuritySettings {
  twoFactorAuth: boolean;
  biometricLogin: boolean;
  locationTracking: boolean;
  dataSharingConsent: boolean;
  marketingEmails: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PrivacySecurity: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    biometricLogin: false,
    locationTracking: false,
    dataSharingConsent: false,
    marketingEmails: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleToggle = (key: keyof SecuritySettings, value: boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordChange = (key: keyof SecuritySettings, value: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleChangePassword = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      toast({
        title: "❌ Errore",
        description: "Le password non corrispondono.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: securitySettings.newPassword
      });

      if (error) throw error;

      setSecuritySettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      toast({
        title: "✅ Password aggiornata",
        description: "La tua password è stata modificata con successo."
      });
    } catch (error: any) {
      toast({
        title: "❌ Errore",
        description: error.message || "Impossibile modificare la password.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy & Sicurezza</h1>
        <p className="text-white/70">Gestisci le tue impostazioni di sicurezza e privacy</p>
      </div>

      {/* Security Settings */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Impostazioni di Sicurezza
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white font-medium">Autenticazione a Due Fattori</Label>
              <p className="text-white/70 text-sm">
                Aggiungi un livello extra di sicurezza al tuo account
              </p>
            </div>
            <Switch
              checked={securitySettings.twoFactorAuth}
              onCheckedChange={(checked) => handleToggle('twoFactorAuth', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white font-medium">Login Biometrico</Label>
              <p className="text-white/70 text-sm">
                Usa impronte digitali o riconoscimento facciale
              </p>
            </div>
            <Switch
              checked={securitySettings.biometricLogin}
              onCheckedChange={(checked) => handleToggle('biometricLogin', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Modifica Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Password Attuale</Label>
            <div className="relative">
              <Input
                type={showPasswords.current ? "text" : "password"}
                value={securitySettings.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white pr-10"
                placeholder="Inserisci password attuale"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Nuova Password</Label>
            <div className="relative">
              <Input
                type={showPasswords.new ? "text" : "password"}
                value={securitySettings.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white pr-10"
                placeholder="Inserisci nuova password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Conferma Nuova Password</Label>
            <div className="relative">
              <Input
                type={showPasswords.confirm ? "text" : "password"}
                value={securitySettings.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white pr-10"
                placeholder="Conferma nuova password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={loading || !securitySettings.currentPassword || !securitySettings.newPassword || !securitySettings.confirmPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Aggiornamento...' : 'Cambia Password'}
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="w-5 h-5 mr-2" />
            Impostazioni Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white font-medium">Tracciamento Posizione</Label>
              <p className="text-white/70 text-sm">
                Permetti all'app di accedere alla tua posizione
              </p>
            </div>
            <Switch
              checked={securitySettings.locationTracking}
              onCheckedChange={(checked) => handleToggle('locationTracking', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white font-medium">Condivisione Dati</Label>
              <p className="text-white/70 text-sm">
                Consenti la condivisione di dati anonimi per migliorare il servizio
              </p>
            </div>
            <Switch
              checked={securitySettings.dataSharingConsent}
              onCheckedChange={(checked) => handleToggle('dataSharingConsent', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white font-medium">Email Marketing</Label>
              <p className="text-white/70 text-sm">
                Ricevi email promozionali e aggiornamenti
              </p>
            </div>
            <Switch
              checked={securitySettings.marketingEmails}
              onCheckedChange={(checked) => handleToggle('marketingEmails', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Note */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700/50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-white font-medium">Protezione Account</h3>
              <p className="text-white/70 text-sm">
                Il tuo account è protetto con crittografia end-to-end. 
                Mantieni sempre aggiornate le tue impostazioni di sicurezza per la massima protezione.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PrivacySecurity;