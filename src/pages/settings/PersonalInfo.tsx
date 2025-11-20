// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, MapPin, Calendar, Phone, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  bio: string;
}

const PersonalInfo: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
    bio: ''
  });

  useEffect(() => {
    loadPersonalInfo();
  }, [user]);

  const loadPersonalInfo = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, bio')
        .eq('id', user.id)
        .single();

      if (profile && !error) {
        setPersonalInfo(prev => ({
          ...prev,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          bio: profile.bio || ''
        }));
      }
    } catch (error) {
      console.error('Error loading personal info:', error);
    }
  };

  const handleInputChange = (key: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: personalInfo.firstName,
          last_name: personalInfo.lastName,
          bio: personalInfo.bio
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "✅ Informazioni aggiornate",
        description: "I tuoi dati personali sono stati salvati con successo."
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "❌ Errore salvataggio",
        description: error.message || "Impossibile salvare le informazioni. Riprova.",
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
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Informazioni Personali</h1>
        <p className="text-white/70">Gestisci i tuoi dati personali e le informazioni di contatto</p>
      </div>

      {/* Basic Information */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="w-5 h-5 mr-2" />
            Informazioni di Base
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Nome</Label>
              <Input
                value={personalInfo.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Inserisci il tuo nome"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Cognome</Label>
              <Input
                value={personalInfo.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Inserisci il tuo cognome"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Label>
            <Input
              value={personalInfo.email}
              readOnly
              className="bg-gray-800/50 border-gray-600 text-white/70 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Telefono
            </Label>
            <Input
              value={personalInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="+39 123 456 7890"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Data di Nascita
            </Label>
            <Input
              type="date"
              value={personalInfo.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Indirizzo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-white">Indirizzo</Label>
            <Input
              value={personalInfo.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="Via, numero civico"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Città</Label>
              <Input
                value={personalInfo.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Roma"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Paese</Label>
              <Select
                value={personalInfo.country}
                onValueChange={(value) => handleInputChange('country', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Seleziona paese" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="it" className="text-white">Italia</SelectItem>
                  <SelectItem value="us" className="text-white">Stati Uniti</SelectItem>
                  <SelectItem value="uk" className="text-white">Regno Unito</SelectItem>
                  <SelectItem value="de" className="text-white">Germania</SelectItem>
                  <SelectItem value="fr" className="text-white">Francia</SelectItem>
                  <SelectItem value="es" className="text-white">Spagna</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Biografia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-white">Racconta qualcosa di te</Label>
            <textarea
              value={personalInfo.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full min-h-[120px] bg-gray-800 border-gray-600 text-white rounded-md p-3 resize-none"
              placeholder="Scrivi una breve biografia..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700/50">
        <CardContent className="pt-6">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
          >
            {loading ? 'Salvataggio...' : 'Salva Informazioni'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PersonalInfo;