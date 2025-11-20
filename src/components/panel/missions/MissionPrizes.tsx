// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Plus, Trash2, Settings, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
}

interface Prize {
  id: string;
  mission_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  value_text: string | null;
  status: string;
  created_at: string;
  prize_categories?: {
    name: string;
  };
}

interface MissionPrizesProps {
  selectedMissionId: string | null;
}

export const MissionPrizes: React.FC<MissionPrizesProps> = ({ selectedMissionId }) => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    value_text: '',
    category_id: '',
    newCategoryName: '',
    status: 'available'
  });

  useEffect(() => {
    if (!selectedMissionId) return;

    fetchPrizes();
    fetchCategories();

    // Real-time subscription for prizes
    const prizesChannel = supabase
      .channel(`prizes-${selectedMissionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'mission_prizes',
        filter: `mission_id=eq.${selectedMissionId}`
      }, () => {
        fetchPrizes();
      })
      .subscribe();

    // Real-time subscription for categories
    const categoriesChannel = supabase
      .channel('prize-categories')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'prize_categories'
      }, () => {
        fetchCategories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(prizesChannel);
      supabase.removeChannel(categoriesChannel);
    };
  }, [selectedMissionId]);

  const fetchPrizes = async () => {
    if (!selectedMissionId) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('mission_prizes')
        .select(`
          *,
          prize_categories (
            name
          )
        `)
        .eq('mission_id', selectedMissionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrizes(data || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento premi", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('prize_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error loading categories:', error);
    }
  };

  const openCreateDialog = () => {
    setEditingPrize(null);
    setFormData({
      title: '',
      description: '',
      value_text: '',
      category_id: '',
      newCategoryName: '',
      status: 'available'
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (prize: Prize) => {
    setEditingPrize(prize);
    setFormData({
      title: prize.title,
      description: prize.description || '',
      value_text: prize.value_text || '',
      category_id: prize.category_id || '',
      newCategoryName: '',
      status: prize.status
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMissionId || !formData.title) {
      toast.error("Compila i campi obbligatori");
      return;
    }

    try {
      let categoryId = formData.category_id || null;

      // Create new category if needed using upsert function
      if (formData.newCategoryName.trim()) {
        const { data: categoryIdData, error: categoryError } = await supabase
          .rpc('upsert_prize_category', { cat_name: formData.newCategoryName.trim() });

        if (categoryError) throw categoryError;
        categoryId = categoryIdData;
      }

      const prizeData = {
        mission_id: selectedMissionId,
        title: formData.title,
        description: formData.description || null,
        value_text: formData.value_text || null,
        category_id: categoryId,
        status: formData.status
      };

      if (editingPrize) {
        // Update existing prize
        const { error } = await supabase
          .from('mission_prizes')
          .update(prizeData)
          .eq('id', editingPrize.id);

        if (error) throw error;
        toast.success("Premio aggiornato");
      } else {
        // Create new prize
        const { error } = await supabase
          .from('mission_prizes')
          .insert(prizeData);

        if (error) throw error;
        toast.success("Premio creato");
      }

      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error("Errore", {
        description: error.message
      });
    }
  };

  const handleDelete = async (prize: Prize) => {
    if (!confirm(`Vuoi eliminare il premio "${prize.title}"?`)) return;

    try {
      const { error } = await supabase
        .from('mission_prizes')
        .delete()
        .eq('id', prize.id);

      if (error) throw error;
      toast.success("Premio eliminato");
    } catch (error: any) {
      toast.error("Errore nell'eliminazione", {
        description: error.message
      });
    }
  };

  if (!selectedMissionId) {
    return (
      <div className="glass-card p-8 border border-white/20 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Seleziona una missione per gestire i premi</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" className="text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          Gestione Premi ({prizes.length})
        </h2>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuovo Premio
        </Button>
      </div>

      {prizes.length === 0 ? (
        <div className="glass-card p-8 border border-white/20 text-center">
          <p className="text-gray-400">Nessun premio configurato per questa missione</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {prizes.map((prize) => (
            <motion.div
              key={prize.id}
              whileHover={{ scale: 1.01 }}
              className="glass-card p-4 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{prize.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {prize.prize_categories && (
                        <span>Categoria: {prize.prize_categories.name}</span>
                      )}
                      {prize.value_text && (
                        <span>Valore: {prize.value_text}</span>
                      )}
                    </div>
                    {prize.description && (
                      <p className="text-sm text-gray-500 mt-1">{prize.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={prize.status === 'available' 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }>
                    {prize.status === 'available' ? 'Disponibile' : 'Non disponibile'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(prize)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(prize)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Prize Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-card border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingPrize ? 'Modifica Premio' : 'Nuovo Premio'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nome del premio"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category_id || undefined}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona categoria esistente" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!formData.category_id && (
               <div>
                <Label htmlFor="newCategory">O crea nuova categoria</Label>
                <Input
                  id="newCategory"
                  value={formData.newCategoryName}
                  onChange={(e) => setFormData({ ...formData, newCategoryName: e.target.value })}
                  placeholder="es. Elettronica, Viaggi, Esperienze..."
                />
                <p className="text-xs text-gray-500 mt-1">Se inserisci un nome qui, verrà creata una nuova categoria</p>
              </div>
            )}

            <div>
              <Label htmlFor="value_text">Valore (descrizione testuale)</Label>
              <Input
                id="value_text"
                value={formData.value_text}
                onChange={(e) => setFormData({ ...formData, value_text: e.target.value })}
                placeholder="es. Smartphone, Viaggio per 2, 1000 crediti..."
              />
            </div>

            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrizione dettagliata del premio..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="status">Stato</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponibile</SelectItem>
                  <SelectItem value="unavailable">Non disponibile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annulla
              </Button>
              <Button type="submit">
                {editingPrize ? 'Aggiorna' : 'Crea'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
