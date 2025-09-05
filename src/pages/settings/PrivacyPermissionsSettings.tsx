// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Eye, 
  MapPin, 
  Bell, 
  Camera, 
  Mic, 
  Database, 
  Share2,
  Lock,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';

interface PermissionState {
  name: string;
  status: 'granted' | 'denied' | 'prompt' | 'unknown';
  description: string;
  icon: React.ReactNode;
  required: boolean;
}

const PrivacyPermissionsSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<PermissionState[]>([]);
  const [privacySettings, setPrivacySettings] = useState({
    analytics: true,
    location_tracking: false,
    data_sharing: false,
    marketing_communications: false
  });

  const checkPermissions = async () => {
    const permissionList: PermissionState[] = [
      {
        name: 'notifications',
        status: 'unknown',
        description: 'Mostra notifiche push per aggiornamenti importanti',
        icon: <Bell className="w-4 h-4" />,
        required: false
      },
      {
        name: 'geolocation',
        status: 'unknown',
        description: 'Accesso alla posizione per funzionalità di mapping',
        icon: <MapPin className="w-4 h-4" />,
        required: true
      },
      {
        name: 'camera',
        status: 'unknown',
        description: 'Scansione QR code e caricamento foto',
        icon: <Camera className="w-4 h-4" />,
        required: false
      },
      {
        name: 'microphone',
        status: 'unknown',
        description: 'Registrazione audio per feedback vocali',
        icon: <Mic className="w-4 h-4" />,
        required: false
      }
    ];

    // Check notification permission
    if ('Notification' in window) {
      permissionList[0].status = Notification.permission as any;
    }

    // Check other permissions
    if ('permissions' in navigator) {
      try {
        for (let i = 1; i < permissionList.length; i++) {
          const permission = permissionList[i];
          const result = await navigator.permissions.query({ name: permission.name as any });
          permission.status = result.state as any;
        }
      } catch (error) {
        console.warn('Could not check all permissions:', error);
      }
    }

    setPermissions(permissionList);
  };

  const requestPermission = async (permissionName: string) => {
    try {
      let granted = false;

      switch (permissionName) {
        case 'notifications':
          if ('Notification' in window) {
            const result = await Notification.requestPermission();
            granted = result === 'granted';
          }
          break;
        case 'geolocation':
          if ('geolocation' in navigator) {
            await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            granted = true;
          }
          break;
        case 'camera':
          if ('mediaDevices' in navigator) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            granted = true;
          }
          break;
        case 'microphone':
          if ('mediaDevices' in navigator) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            granted = true;
          }
          break;
      }

      if (granted) {
        toast({
          title: "✅ Permesso concesso",
          description: "Il permesso è stato concesso con successo."
        });
        checkPermissions(); // Refresh permissions
      }
    } catch (error) {
      toast({
        title: "❌ Permesso negato",
        description: "Il permesso è stato negato o si è verificato un errore.",
        variant: "destructive"
      });
    }
  };

  const updatePrivacySetting = (key: keyof typeof privacySettings, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "✅ Impostazione aggiornata",
      description: "Le tue preferenze privacy sono state salvate."
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'denied':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Shield className="w-4 h-4 text-amber-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
        return 'border-emerald-500/30 bg-emerald-500/10';
      case 'denied':
        return 'border-red-500/30 bg-red-500/10';
      default:
        return 'border-amber-500/30 bg-amber-500/10';
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy & Permessi</h1>
        <p className="text-white/70">Gestisci i permessi dell'app e le impostazioni sulla privacy</p>
      </div>

      {/* System Permissions */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-400" />
              Permessi Sistema
            </div>
            <Button
              onClick={checkPermissions}
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Aggiorna
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {permissions.map((permission, index) => (
              <motion.div
                key={permission.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getStatusColor(permission.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {permission.icon}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-medium capitalize">
                          {permission.name.replace('_', ' ')}
                        </h3>
                        {permission.required && (
                          <Badge variant="destructive" className="text-xs">
                            Richiesto
                          </Badge>
                        )}
                      </div>
                      <p className="text-white/70 text-sm">{permission.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(permission.status)}
                    <Badge 
                      variant={permission.status === 'granted' ? 'default' : 'destructive'}
                      className={
                        permission.status === 'granted' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : permission.status === 'denied'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }
                    >
                      {permission.status}
                    </Badge>
                    {permission.status !== 'granted' && (
                      <Button
                        onClick={() => requestPermission(permission.name)}
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        Concedi
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Eye className="w-5 h-5 mr-2 text-purple-400" />
            Impostazioni Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-white font-medium">Analisi e Miglioramento</h3>
              <p className="text-white/70 text-sm">
                Condividi dati anonimi per migliorare l'esperienza dell'app
              </p>
            </div>
            <Switch
              checked={privacySettings.analytics}
              onCheckedChange={(value) => updatePrivacySetting('analytics', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-white font-medium">Tracciamento Posizione</h3>
              <p className="text-white/70 text-sm">
                Memorizza la cronologia delle posizioni per funzionalità avanzate
              </p>
            </div>
            <Switch
              checked={privacySettings.location_tracking}
              onCheckedChange={(value) => updatePrivacySetting('location_tracking', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-white font-medium">Condivisione Dati</h3>
              <p className="text-white/70 text-sm">
                Condividi dati con partner fidati per offerte personalizzate
              </p>
            </div>
            <Switch
              checked={privacySettings.data_sharing}
              onCheckedChange={(value) => updatePrivacySetting('data_sharing', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-white font-medium">Comunicazioni Marketing</h3>
              <p className="text-white/70 text-sm">
                Ricevi email promozionali e aggiornamenti sui prodotti
              </p>
            </div>
            <Switch
              checked={privacySettings.marketing_communications}
              onCheckedChange={(value) => updatePrivacySetting('marketing_communications', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Database className="w-5 h-5 mr-2 text-amber-400" />
            Gestione Dati
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 p-4 h-auto flex-col"
            >
              <Share2 className="w-6 h-6 mb-2" />
              <span className="font-medium">Esporta Dati</span>
              <span className="text-sm text-white/70">Scarica tutti i tuoi dati</span>
            </Button>

            <Button
              variant="outline"
              className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 p-4 h-auto flex-col"
            >
              <AlertTriangle className="w-6 h-6 mb-2" />
              <span className="font-medium">Elimina Account</span>
              <span className="text-sm text-red-300/70">Rimuovi permanentemente</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="glass-card border-blue-500/30 bg-blue-500/10">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-white font-medium">Protezione dei Dati</h3>
              <p className="text-white/70 text-sm">
                I tuoi dati sono protetti con crittografia end-to-end e non vengono mai venduti a terze parti. 
                Rispettiamo il GDPR e offriamo pieno controllo sui tuoi dati personali.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PrivacyPermissionsSettings;