// FILE CREATO — BY JOSEPH MULE
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';

interface PersonalInfo {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  birth_date?: string;
}

export const PersonalInfoPage: React.FC = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  // Load personal information
  useEffect(() => {
    const loadPersonalInfo = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading personal info:', error);
          toast.error('Errore nel caricamento delle informazioni');
          return;
        }

        setPersonalInfo(data);
      } catch (err) {
        console.error('Error:', err);
        toast.error('Errore di connessione');
      } finally {
        setLoading(false);
      }
    };

    loadPersonalInfo();
  }, [user]);

  // Save personal information
  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update(personalInfo)
        .eq('id', user.id);

      if (error) {
        console.error('Error saving personal info:', error);
        toast.error('Errore nel salvataggio');
        return;
      }

      toast.success('Informazioni aggiornate con successo');
      setEditing(false);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Errore di connessione');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#00D1FF] border-t-transparent rounded-full"
        />
      </div>
    );
  }

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
            <span className="text-white">INFORMAZIONI PERSONALI</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white flex items-center">
                    <User className="w-6 h-6 mr-2 text-[#00D1FF]" />
                    Dati Personali
                  </CardTitle>
                  <Button
                    variant={editing ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (editing) {
                        setEditing(false);
                      } else {
                        setEditing(true);
                      }
                    }}
                  >
                    {editing ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                    {editing ? 'Annulla' : 'Modifica'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name" className="text-white">Nome</Label>
                    <Input
                      id="first_name"
                      value={personalInfo.first_name || ''}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name" className="text-white">Cognome</Label>
                    <Input
                      id="last_name"
                      value={personalInfo.last_name || ''}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-white flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!editing}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Telefono
                  </Label>
                  <Input
                    id="phone"
                    value={personalInfo.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!editing}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="birth_date" className="text-white flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Data di Nascita
                  </Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={personalInfo.birth_date || ''}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    disabled={!editing}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-white flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Indirizzo
                  </Label>
                  <Input
                    id="address"
                    value={personalInfo.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!editing}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-white">Città</Label>
                    <Input
                      id="city"
                      value={personalInfo.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code" className="text-white">CAP</Label>
                    <Input
                      id="postal_code"
                      value={personalInfo.postal_code || ''}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country" className="text-white">Paese</Label>
                  <Input
                    id="country"
                    value={personalInfo.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    disabled={!editing}
                    className="mt-1"
                  />
                </div>

                {editing && (
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-[#00D1FF] hover:bg-[#00B8E6] text-black"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Salvando...' : 'Salva Modifiche'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      <BottomNavigation />
    </motion.div>
  );
};

export default PersonalInfoPage;