// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// ManualCluesEditor - Inserimento manuale indizi per Week 1-4

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Target, Plus, Trash2, CheckCircle, AlertTriangle, 
  FileText, Save, Loader2, RefreshCw, Pencil, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// ============================================
// TYPES
// ============================================

interface Clue {
  id: string;
  prize_id: string;
  week: number;
  type: 'LOCATION' | 'PRIZE';
  clue_category: string;
  clue_type: string;
  title_it: string;
  description_it: string;
  difficulty: string;
  is_decoy: boolean;
  is_fake: boolean;
  created_at?: string;
}

interface ManualCluesEditorProps {
  missionId: string | null;
  onCluesCountChange: (count: number, weekCounts: Record<number, number>) => void;
}

// ============================================
// CONSTANTS
// ============================================

const WEEKS = [1, 2, 3, 4];
const TARGET_PER_WEEK = 150; // Visual target (not a limit)
const MIN_PER_WEEK = 50; // Minimum required for launch

const CLUE_TYPES = [
  { value: 'LOCATION', label: '📍 LOCATION (dove si trova)' },
  { value: 'PRIZE', label: '🎁 PRIZE (cosa si vince)' },
];

const DIFFICULTY_BY_WEEK: Record<number, string> = {
  1: 'LOW',
  2: 'MEDIUM',
  3: 'HIGH',
  4: 'INTELLIGENCE',
};

// ============================================
// COMPONENT
// ============================================

export const ManualCluesEditor: React.FC<ManualCluesEditorProps> = ({ 
  missionId, 
  onCluesCountChange 
}) => {
  const [activeWeek, setActiveWeek] = useState(1);
  const [clues, setClues] = useState<Record<number, Clue[]>>({ 1: [], 2: [], 3: [], 4: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state for new clue
  const [newClueText, setNewClueText] = useState('');
  const [newClueType, setNewClueType] = useState<'LOCATION' | 'PRIZE'>('LOCATION');
  const [bulkText, setBulkText] = useState('');

  // 🆕 State for "Cancella tutto" modal
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // 🆕 State for "Modifica indizio" modal
  const [editingClue, setEditingClue] = useState<Clue | null>(null);
  const [editText, setEditText] = useState('');
  const [editType, setEditType] = useState<'LOCATION' | 'PRIZE'>('LOCATION');
  const [isUpdating, setIsUpdating] = useState(false);

  // ============================================
  // LOAD EXISTING CLUES
  // ============================================

  const loadClues = useCallback(async () => {
    if (!missionId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 🆕 Ordina per order_index ASC invece che created_at
      const { data, error } = await supabase
        .from('prize_clues')
        .select('*')
        .eq('prize_id', missionId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Group by week
      const grouped: Record<number, Clue[]> = { 1: [], 2: [], 3: [], 4: [] };
      (data || []).forEach((clue: any) => {
        const week = clue.week || 1;
        if (week >= 1 && week <= 4) {
          grouped[week].push(clue);
        }
      });

      setClues(grouped);
      
      // Notify parent of counts
      const totalCount = Object.values(grouped).flat().length;
      const weekCounts = {
        1: grouped[1].length,
        2: grouped[2].length,
        3: grouped[3].length,
        4: grouped[4].length,
      };
      onCluesCountChange(totalCount, weekCounts);

    } catch (err: any) {
      console.error('Error loading clues:', err);
      toast.error('Errore caricamento indizi');
    } finally {
      setIsLoading(false);
    }
  }, [missionId, onCluesCountChange]);

  useEffect(() => {
    loadClues();
  }, [loadClues]);

  // ============================================
  // ADD SINGLE CLUE
  // ============================================

  const handleAddClue = async () => {
    if (!missionId) {
      toast.error('Salva prima la missione');
      return;
    }

    if (!newClueText.trim()) {
      toast.error('Inserisci il testo dell\'indizio');
      return;
    }

    setIsSaving(true);
    try {
      // 🆕 Calcola il prossimo order_index per questa week e tipo
      const existingCluesOfType = clues[activeWeek]?.filter(c => c.type === newClueType) || [];
      const maxOrderIndex = existingCluesOfType.reduce((max, c) => {
        const idx = (c as any).order_index ?? 0;
        return idx > max ? idx : max;
      }, 0);
      const nextOrderIndex = maxOrderIndex + 1;

      const clueRecord = {
        prize_id: missionId,
        week: activeWeek,
        type: newClueType,
        clue_category: newClueType.toLowerCase(),
        clue_type: newClueType.toLowerCase(),
        title_it: `Indizio Week ${activeWeek}`,
        description_it: newClueText.trim(),
        difficulty: DIFFICULTY_BY_WEEK[activeWeek],
        is_decoy: false,
        is_fake: false,
        difficulty_level: activeWeek,
        tier: activeWeek,
        order_index: nextOrderIndex, // 🆕 Ordine deterministico
      };

      const { data, error } = await supabase
        .from('prize_clues')
        .insert(clueRecord)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setClues(prev => ({
        ...prev,
        [activeWeek]: [...prev[activeWeek], data],
      }));

      setNewClueText('');
      toast.success('Indizio aggiunto');

      // Notify parent
      const newTotal = Object.values(clues).flat().length + 1;
      const newWeekCounts = {
        1: clues[1].length + (activeWeek === 1 ? 1 : 0),
        2: clues[2].length + (activeWeek === 2 ? 1 : 0),
        3: clues[3].length + (activeWeek === 3 ? 1 : 0),
        4: clues[4].length + (activeWeek === 4 ? 1 : 0),
      };
      onCluesCountChange(newTotal, newWeekCounts);

    } catch (err: any) {
      console.error('Error adding clue:', err);
      toast.error('Errore aggiunta indizio');
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // BULK ADD (multiple lines)
  // ============================================

  const handleBulkAdd = async () => {
    if (!missionId) {
      toast.error('Salva prima la missione');
      return;
    }

    const lines = bulkText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      toast.error('Inserisci almeno un indizio (uno per riga)');
      return;
    }

    setIsSaving(true);
    try {
      // 🆕 Calcola order_index partendo dal max esistente per ogni tipo
      const locationClues = clues[activeWeek]?.filter(c => c.type === 'LOCATION') || [];
      const prizeClues = clues[activeWeek]?.filter(c => c.type === 'PRIZE') || [];
      let maxLocationIdx = locationClues.reduce((max, c) => Math.max(max, (c as any).order_index ?? 0), 0);
      let maxPrizeIdx = prizeClues.reduce((max, c) => Math.max(max, (c as any).order_index ?? 0), 0);

      const records = lines.map((line, index) => {
        // Alternate between LOCATION and PRIZE for variety
        const isLocation = index % 2 === 0;
        const type = isLocation ? 'LOCATION' : 'PRIZE';
        const orderIndex = isLocation ? ++maxLocationIdx : ++maxPrizeIdx;

        return {
          prize_id: missionId,
          week: activeWeek,
          type,
          clue_category: type.toLowerCase(),
          clue_type: type.toLowerCase(),
          title_it: `Indizio Week ${activeWeek}`,
          description_it: line.trim(),
          difficulty: DIFFICULTY_BY_WEEK[activeWeek],
          is_decoy: false,
          is_fake: false,
          difficulty_level: activeWeek,
          tier: activeWeek,
          order_index: orderIndex, // 🆕 Ordine deterministico
        };
      });

      const { data, error } = await supabase
        .from('prize_clues')
        .insert(records)
        .select();

      if (error) throw error;

      // Update local state
      setClues(prev => ({
        ...prev,
        [activeWeek]: [...prev[activeWeek], ...(data || [])],
      }));

      setBulkText('');
      toast.success(`${records.length} indizi aggiunti`);

      // Reload to ensure consistency
      await loadClues();

    } catch (err: any) {
      console.error('Error bulk adding clues:', err);
      toast.error('Errore aggiunta indizi');
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // DELETE CLUE
  // ============================================

  const handleDeleteClue = async (clueId: string, week: number) => {
    try {
      const { error } = await supabase
        .from('prize_clues')
        .delete()
        .eq('id', clueId);

      if (error) throw error;

      // Update local state
      setClues(prev => ({
        ...prev,
        [week]: prev[week].filter(c => c.id !== clueId),
      }));

      toast.success('Indizio eliminato');

      // Notify parent
      const newClues = {
        ...clues,
        [week]: clues[week].filter(c => c.id !== clueId),
      };
      const newTotal = Object.values(newClues).flat().length;
      const newWeekCounts = {
        1: newClues[1].length,
        2: newClues[2].length,
        3: newClues[3].length,
        4: newClues[4].length,
      };
      onCluesCountChange(newTotal, newWeekCounts);

    } catch (err: any) {
      console.error('Error deleting clue:', err);
      toast.error('Errore eliminazione indizio');
    }
  };

  // ============================================
  // 🆕 DELETE ALL CLUES FOR WEEK
  // ============================================

  const handleDeleteAllForWeek = async () => {
    if (!missionId) {
      toast.error('Mission ID mancante');
      return;
    }

    setIsDeletingAll(true);
    try {
      // Bulk delete all clues for this week
      const { error } = await supabase
        .from('prize_clues')
        .delete()
        .eq('prize_id', missionId)
        .eq('week', activeWeek);

      if (error) throw error;

      // Update local state
      setClues(prev => ({
        ...prev,
        [activeWeek]: [],
      }));

      toast.success(`Tutti gli indizi di Week ${activeWeek} eliminati`);
      setShowDeleteAllModal(false);

      // Notify parent
      const newClues = {
        ...clues,
        [activeWeek]: [],
      };
      const newTotal = Object.values(newClues).flat().length;
      const newWeekCounts = {
        1: newClues[1].length,
        2: newClues[2].length,
        3: newClues[3].length,
        4: newClues[4].length,
      };
      onCluesCountChange(newTotal, newWeekCounts);

    } catch (err: any) {
      console.error('Error deleting all clues:', err);
      toast.error('Errore eliminazione indizi');
    } finally {
      setIsDeletingAll(false);
    }
  };

  // ============================================
  // 🆕 EDIT SINGLE CLUE
  // ============================================

  const openEditModal = (clue: Clue) => {
    setEditingClue(clue);
    setEditText(clue.description_it);
    setEditType(clue.type || 'LOCATION');
  };

  const closeEditModal = () => {
    setEditingClue(null);
    setEditText('');
    setEditType('LOCATION');
  };

  const handleUpdateClue = async () => {
    if (!editingClue) return;
    
    const trimmedText = editText.trim();
    if (!trimmedText) {
      toast.error('Il testo non può essere vuoto');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('prize_clues')
        .update({
          description_it: trimmedText,
          type: editType,
          clue_category: editType.toLowerCase(),
          clue_type: editType.toLowerCase(),
        })
        .eq('id', editingClue.id);

      if (error) throw error;

      // Update local state
      setClues(prev => ({
        ...prev,
        [editingClue.week]: prev[editingClue.week].map(c => 
          c.id === editingClue.id 
            ? { ...c, description_it: trimmedText, type: editType, clue_category: editType.toLowerCase(), clue_type: editType.toLowerCase() }
            : c
        ),
      }));

      toast.success('Indizio aggiornato');
      closeEditModal();

    } catch (err: any) {
      console.error('Error updating clue:', err);
      toast.error('Errore aggiornamento indizio');
    } finally {
      setIsUpdating(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  const getWeekStatus = (week: number) => {
    const count = clues[week]?.length || 0;
    if (count >= MIN_PER_WEEK) return 'ok';
    return 'warning';
  };

  const totalClues = Object.values(clues).flat().length;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            📝 Inserimento Indizi Manuale
          </CardTitle>
          <CardDescription>
            Inserisci gli indizi per ogni settimana. Minimo 50 per week per lanciare.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Week Tabs */}
          <div className="flex gap-2 mb-6">
            {WEEKS.map(week => {
              const count = clues[week]?.length || 0;
              const status = getWeekStatus(week);
              return (
                <Button
                  key={week}
                  variant={activeWeek === week ? 'default' : 'outline'}
                  onClick={() => setActiveWeek(week)}
                  className={`flex-1 ${
                    activeWeek === week 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'border-purple-500/30 hover:bg-purple-500/10'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-bold">Week {week}</span>
                    <span className={`text-xs ${
                      status === 'ok' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {count} / {TARGET_PER_WEEK}
                      {count < MIN_PER_WEEK && ' ⚠️'}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-4 gap-2 mb-6 p-3 rounded-lg bg-black/30">
            {WEEKS.map(week => {
              const count = clues[week]?.length || 0;
              const isOk = count >= MIN_PER_WEEK;
              return (
                <div key={week} className={`text-center p-2 rounded ${
                  isOk ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'
                }`}>
                  <div className="text-xs text-gray-400">Week {week}</div>
                  <div className={`font-bold ${isOk ? 'text-green-400' : 'text-yellow-400'}`}>
                    {count} / {TARGET_PER_WEEK}
                  </div>
                  <div className="text-xs">
                    {isOk ? (
                      <span className="text-green-400">✅ OK</span>
                    ) : (
                      <span className="text-yellow-400">min {MIN_PER_WEEK}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Counter */}
          <div className="flex justify-between items-center mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <span className="text-purple-300">Totale Indizi:</span>
            <Badge variant="outline" className="text-lg px-4 py-1 border-purple-500/50">
              {totalClues}
            </Badge>
          </div>

          {/* Add Single Clue */}
          <div className="space-y-3 mb-6">
            <div className="flex gap-2">
              <Select value={newClueType} onValueChange={(v: 'LOCATION' | 'PRIZE') => setNewClueType(v)}>
                <SelectTrigger className="w-48 bg-black/30 border-purple-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLUE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Inserisci il testo dell'indizio..."
                  value={newClueText}
                  onChange={(e) => setNewClueText(e.target.value)}
                  className="bg-black/30 border-purple-500/30 min-h-[60px]"
                />
              </div>
              <Button
                onClick={handleAddClue}
                disabled={isSaving || !newClueText.trim() || !missionId}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Bulk Add */}
          <div className="space-y-3 p-4 rounded-lg bg-black/20 border border-purple-500/20">
            <h4 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Inserimento Multiplo (1 indizio per riga)
            </h4>
            <Textarea
              placeholder={`Incolla qui gli indizi, uno per riga...\n\nEsempio:\nLa chiave è dove il sole tramonta alle 19:47\nIl numero segreto è nascosto nel codice postale\nCerca dove l'acqua incontra la pietra`}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="bg-black/30 border-purple-500/30 min-h-[120px]"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {bulkText.split('\n').filter(l => l.trim()).length} indizi pronti
              </span>
              <Button
                onClick={handleBulkAdd}
                disabled={isSaving || !bulkText.trim() || !missionId}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Tutti ({bulkText.split('\n').filter(l => l.trim()).length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clues List for Active Week */}
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Indizi Week {activeWeek}
              <Badge variant="outline" className="ml-2">
                {clues[activeWeek]?.length || 0}
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadClues}
                className="border-purple-500/30"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Ricarica
              </Button>
              {/* 🆕 Cancella tutto */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteAllModal(true)}
                disabled={(clues[activeWeek]?.length || 0) === 0 || isDeletingAll}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cancella tutto
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : clues[activeWeek]?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nessun indizio per Week {activeWeek}</p>
              <p className="text-sm">Usa il form sopra per aggiungerne</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {/* 🆕 Ordina per order_index ASC */}
              {[...clues[activeWeek]]
                .sort((a, b) => ((a as any).order_index ?? 0) - ((b as any).order_index ?? 0))
                .map((clue) => (
                <div
                  key={clue.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-black/30 border border-purple-500/20 group hover:border-purple-500/40 transition-colors"
                >
                  {/* 🆕 Mostra order_index invece dell'indice dell'array */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">
                    {(clue as any).order_index ?? '—'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-xs ${
                        clue.type === 'LOCATION' ? 'border-blue-500/50 text-blue-400' : 'border-yellow-500/50 text-yellow-400'
                      }`}>
                        {clue.type === 'LOCATION' ? '📍 LOCATION' : '🎁 PRIZE'}
                      </Badge>
                      {clue.is_decoy && (
                        <Badge variant="outline" className="text-xs border-red-500/50 text-red-400">
                          FAKE
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 break-words">
                      {clue.description_it}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* 🆕 Modifica */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(clue)}
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {/* Elimina */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClue(clue.id, activeWeek)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Launch Validation Warning */}
      {WEEKS.some(week => (clues[week]?.length || 0) < MIN_PER_WEEK) && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="font-semibold text-yellow-400">⚠️ Lancio Bloccato</p>
                <p className="text-sm text-gray-400">
                  Indizi incompleti: {WEEKS.filter(w => (clues[w]?.length || 0) < MIN_PER_WEEK).map(w => 
                    `Week ${w} (${clues[w]?.length || 0}/${TARGET_PER_WEEK} — min ${MIN_PER_WEEK})`
                  ).join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🆕 Modal: Conferma Cancella Tutto */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="max-w-md w-full glass-card border-red-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                Cancellare tutti gli indizi?
              </CardTitle>
              <CardDescription>
                Stai per eliminare <strong className="text-red-400">{clues[activeWeek]?.length || 0}</strong> indizi dalla <strong>Week {activeWeek}</strong>.
                <br />Questa azione non può essere annullata.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteAllModal(false)}
                  disabled={isDeletingAll}
                  className="border-gray-500/30"
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleDeleteAllForWeek}
                  disabled={isDeletingAll}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeletingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Eliminazione...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Conferma Eliminazione
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 🆕 Modal: Modifica Indizio */}
      {editingClue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="max-w-lg w-full glass-card border-purple-500/30">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-purple-400" />
                    Modifica Indizio
                  </CardTitle>
                  <CardDescription>
                    Week {editingClue.week} — Indizio #{clues[editingClue.week]?.findIndex(c => c.id === editingClue.id) + 1}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo indizio */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Tipo</label>
                <Select value={editType} onValueChange={(v: 'LOCATION' | 'PRIZE') => setEditType(v)}>
                  <SelectTrigger className="bg-black/30 border-purple-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLUE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Testo indizio */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Testo indizio</label>
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Inserisci il testo dell'indizio..."
                  className="bg-black/30 border-purple-500/30 min-h-[120px]"
                />
                <div className="text-xs text-gray-500 text-right">
                  {editText.trim().length} caratteri
                </div>
              </div>

              {/* Azioni */}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={closeEditModal}
                  disabled={isUpdating}
                  className="border-gray-500/30"
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleUpdateClue}
                  disabled={isUpdating || !editText.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salva Modifiche
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManualCluesEditor;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

