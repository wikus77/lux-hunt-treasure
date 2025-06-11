
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Eye, Trash2, MapPin, Trophy, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useProfileImage } from '@/hooks/useProfileImage';

interface AdminPrize {
  id: string;
  city: string;
  address: string;
  description: string;
  week: number;
  type: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

interface FormData {
  city: string;
  address: string;
  description: string;
  week: string;
  type: string;
  generateClues: boolean;
}

const AdminPrizesManager = () => {
  const navigate = useNavigate();
  const { profileImage } = useProfileImage();
  const [prizes, setPrizes] = useState<AdminPrize[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<AdminPrize | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    city: '',
    address: '',
    description: '',
    week: '',
    type: '',
    generateClues: true
  });

  const prizeTypes = [
    { value: 'auto', label: 'Auto' },
    { value: 'orologio', label: 'Orologio' },
    { value: 'borsa', label: 'Borsa' },
    { value: 'altro', label: 'Altro' }
  ];

  // Generate week options (1-52)
  const weekOptions = Array.from({ length: 52 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Settimana ${i + 1}`
  }));

  const handleEmailClick = () => {
    navigate('/notifications');
  };

  const fetchPrizes = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_prizes')
        .select('*')
        .order('week', { ascending: false });

      if (error) throw error;
      setPrizes(data || []);
    } catch (error) {
      console.error('Error fetching prizes:', error);
      toast.error('Errore nel caricamento dei premi');
    } finally {
      setLoading(false);
    }
  };

  const generateCluesForPrize = async (prizeId: string, city: string, address: string) => {
    try {
      // Generate some basic clues based on the prize data
      const clues = [
        {
          title_it: `Indizio geografico per ${city}`,
          description_it: `Cerca nella zona centrale di ${city}, non lontano dai principali monumenti.`,
          clue_type: 'geographic'
        },
        {
          title_it: `Indizio stradale`,
          description_it: `L'indirizzo che cerchi contiene il numero presente in ${address}.`,
          clue_type: 'address'
        },
        {
          title_it: `Indizio finale`,
          description_it: `Il premio ti aspetta in un luogo frequentato, ma non troppo ovvio.`,
          clue_type: 'final'
        }
      ];

      // Insert clues into user_clues table
      for (const clue of clues) {
        await supabase.from('user_clues').insert({
          ...clue,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          buzz_cost: 1.99
        });
      }

      toast.success('Indizi generati automaticamente');
    } catch (error) {
      console.error('Error generating clues:', error);
      toast.error('Errore nella generazione degli indizi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.city || !formData.address || !formData.description || !formData.week || !formData.type) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    setSubmitting(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) {
        toast.error('Utente non autenticato');
        return;
      }

      const { data, error } = await supabase
        .from('admin_prizes')
        .insert({
          city: formData.city,
          address: formData.address,
          description: formData.description,
          week: parseInt(formData.week),
          type: formData.type,
          created_by: user.user.id
        })
        .select()
        .single();

      if (error) throw error;

      if (formData.generateClues && data) {
        await generateCluesForPrize(data.id, formData.city, formData.address);
      }

      toast.success('Premio creato con successo');
      
      // Reset form
      setFormData({
        city: '',
        address: '',
        description: '',
        week: '',
        type: '',
        generateClues: true
      });

      // Refresh prizes list
      fetchPrizes();

    } catch (error) {
      console.error('Error creating prize:', error);
      toast.error('Errore nella creazione del premio');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePrize = async (prizeId: string) => {
    try {
      const { error } = await supabase
        .from('admin_prizes')
        .delete()
        .eq('id', prizeId);

      if (error) throw error;

      toast.success('Premio eliminato');
      fetchPrizes();
    } catch (error) {
      console.error('Error deleting prize:', error);
      toast.error('Errore nell\'eliminazione del premio');
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        🟢 Attivo
      </Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        🔴 Inattivo
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'auto': return '🚗';
      case 'orologio': return '⌚';
      case 'borsa': return '👜';
      default: return '🎁';
    }
  };

  useEffect(() => {
    fetchPrizes();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <UnifiedHeader 
        profileImage={profileImage} 
        onClickMail={handleEmailClick}
      />
      
      <div className="h-[72px] w-full" />
      
      <div className="pb-24 px-4 pt-2 max-w-screen-xl mx-auto">
        <div className="px-4 pt-[calc(env(safe-area-inset-top)+64px)]">
          <button
            onClick={() => navigate('/admin')}
            className="w-6 h-6 text-white relative z-50 mb-6"
            aria-label="Torna al pannello admin"
          >
            <ArrowLeft />
          </button>

          <h1 className="text-xl font-semibold text-white mb-6">🎁 Gestione Premi e Indizi</h1>
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column - Form */}
            <Card className="bg-white/5 border-white/10" id="admin-prizes-form">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Inserimento Nuovo Premio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Città *
                    </label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="es. Milano"
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Indirizzo *
                    </label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="es. Via Montenapoleone 10"
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descrizione Premio * (max 120 caratteri)
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="es. Lamborghini Huracán EVO"
                      maxLength={120}
                      className="bg-white/10 border-white/20 text-white resize-none"
                      rows={2}
                      required
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {formData.description.length}/120 caratteri
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Settimana di validità *
                    </label>
                    <Select value={formData.week} onValueChange={(value) => setFormData({...formData, week: value})}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Seleziona settimana" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/20">
                        {weekOptions.map((week) => (
                          <SelectItem key={week.value} value={week.value} className="text-white">
                            {week.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo Premio *
                    </label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Seleziona tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/20">
                        {prizeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-white">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="generateClues"
                      checked={formData.generateClues}
                      onCheckedChange={(checked) => setFormData({...formData, generateClues: !!checked})}
                      className="border-white/20"
                    />
                    <label htmlFor="generateClues" className="text-sm text-gray-300">
                      Genera indizi automaticamente
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:opacity-90"
                  >
                    {submitting ? 'Creazione in corso...' : 'Crea Premio'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Right Column - Prizes List */}
            <Card className="bg-white/5 border-white/10" id="prize-table">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Premi Inseriti
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center text-gray-400 py-8">
                    Caricamento...
                  </div>
                ) : prizes.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    Nessun premio inserito
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prizes.map((prize) => (
                      <div key={prize.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getTypeIcon(prize.type)}</span>
                            <div>
                              <div className="text-white font-medium">
                                Settimana {prize.week} - {prize.city}
                              </div>
                              <div className="text-gray-400 text-sm">
                                {prize.description}
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(prize.is_active)}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                                onClick={() => setSelectedPrize(prize)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Vedi
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900 border-white/20 text-white">
                              <DialogHeader>
                                <DialogTitle>Dettagli Premio</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm text-gray-400">Città</label>
                                    <div className="text-white">{selectedPrize?.city}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-400">Settimana</label>
                                    <div className="text-white">{selectedPrize?.week}</div>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm text-gray-400">Indirizzo</label>
                                  <div className="text-white">{selectedPrize?.address}</div>
                                </div>
                                <div>
                                  <label className="text-sm text-gray-400">Descrizione</label>
                                  <div className="text-white">{selectedPrize?.description}</div>
                                </div>
                                <div>
                                  <label className="text-sm text-gray-400">Tipo</label>
                                  <div className="text-white capitalize">{selectedPrize?.type}</div>
                                </div>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                  Forza rigenerazione indizi
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Elimina
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-900 border-white/20">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Sei sicuro?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  Questa azione eliminerà permanentemente il premio "{prize.description}" dalla settimana {prize.week}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                                  Annulla
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeletePrize(prize.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Elimina
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default AdminPrizesManager;
