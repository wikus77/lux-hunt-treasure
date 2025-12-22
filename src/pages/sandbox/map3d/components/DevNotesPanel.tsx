// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// DevNotesPanel.tsx - Modal popup for user notes with Supabase persistence
// Uses official GlassModal pattern for M1SSION™ consistent UX

import React, { useState, useEffect, useCallback } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { GlassModal } from '@/components/ui/GlassModal';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { toast } from 'sonner';

interface DevNotesPanelProps {
  map: MLMap | null;
}

interface NoteItem {
  id: string;
  text: string;
  importance: 'high' | 'medium' | 'low';
  created_at?: string;
  updated_at?: string;
}

const DevNotesPanel: React.FC<DevNotesPanelProps> = ({ map }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const { user, isAuthenticated } = useUnifiedAuth();

  // Load notes from Supabase when modal opens
  const loadNotes = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('map_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotes((data || []).map(note => ({
        id: note.id,
        text: note.text,
        importance: note.importance as 'high' | 'medium' | 'low',
        created_at: note.created_at,
        updated_at: note.updated_at
      })));
    } catch (error) {
      console.error('[DevNotesPanel] Error loading notes:', error);
      toast.error('Errore nel caricare le note');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load notes when modal opens
  useEffect(() => {
    if (open && user?.id) {
      loadNotes();
    }
  }, [open, user?.id, loadNotes]);

  // Add new note
  const handleAddNote = async () => {
    if (!newNoteText.trim() || !user?.id) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('map_notes')
        .insert({
          user_id: user.id,
          text: newNoteText.trim(),
          importance: 'medium'
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setNotes(prev => [{
          id: data.id,
          text: data.text,
          importance: data.importance as 'high' | 'medium' | 'low',
          created_at: data.created_at,
          updated_at: data.updated_at
        }, ...prev]);
        setNewNoteText('');
        toast.success('Nota aggiunta');
      }
    } catch (error) {
      console.error('[DevNotesPanel] Error adding note:', error);
      toast.error('Errore nell\'aggiungere la nota');
    } finally {
      setSaving(false);
    }
  };

  // Update note
  const handleUpdateNote = async (id: string) => {
    if (!editText.trim() || !user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('map_notes')
        .update({ 
          text: editText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(prev => prev.map(note => 
        note.id === id ? { ...note, text: editText.trim() } : note
      ));
      setEditingId(null);
      setEditText('');
      toast.success('Nota aggiornata');
    } catch (error) {
      console.error('[DevNotesPanel] Error updating note:', error);
      toast.error('Errore nell\'aggiornare la nota');
    } finally {
      setSaving(false);
    }
  };

  // Delete note
  const handleDeleteNote = async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('map_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== id));
      toast.success('Nota eliminata');
    } catch (error) {
      console.error('[DevNotesPanel] Error deleting note:', error);
      toast.error('Errore nell\'eliminare la nota');
    }
  };

  // Cycle importance
  const handleToggleImportance = async (id: string) => {
    if (!user?.id) return;

    const note = notes.find(n => n.id === id);
    if (!note) return;

    const order: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    const currentIdx = order.indexOf(note.importance);
    const nextImportance = order[(currentIdx + 1) % order.length];

    try {
      const { error } = await supabase
        .from('map_notes')
        .update({ importance: nextImportance })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(prev => prev.map(n => 
        n.id === id ? { ...n, importance: nextImportance } : n
      ));
    } catch (error) {
      console.error('[DevNotesPanel] Error updating importance:', error);
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const count = notes.length;

  return (
    <>
      {/* Pill Button - Fixed position */}
      <div
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 34px) + 80px)',
          left: 12,
          zIndex: 1002,
          pointerEvents: 'auto',
        }}
      >
        <div
          className="m1x-pill m1x-pill--note"
          onClick={() => setOpen(true)}
          title="Note"
          style={{ transform: 'scale(0.75)' }}
        >
          <div className="m1x-pill__icon">
            <FileText className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="m1x-pill__label">
            Note ({count})
          </div>
        </div>
      </div>

      {/* GlassModal - Official M1SSION Pattern */}
      <GlassModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="NOTE"
        subtitle="Salva appunti sulla tua ricerca"
        accentColor="#00D1FF"
      >
        <div className="space-y-4">
          {/* Add new note */}
          <div className="space-y-3">
            <textarea
              className="w-full h-20 p-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm resize-none focus:outline-none focus:border-[#00D1FF]/50 placeholder:text-white/40 transition-colors"
              placeholder="Scrivi una nuova nota..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              disabled={!isAuthenticated}
            />
            <Button
              onClick={handleAddNote}
              disabled={!newNoteText.trim() || saving || !isAuthenticated}
              className="w-full bg-[#00D1FF] hover:bg-[#00D1FF]/80 text-black font-semibold rounded-xl h-11"
            >
              <Plus className="h-4 w-4 mr-2" />
              {saving ? 'Salvataggio...' : 'Aggiungi nota'}
            </Button>
          </div>

          {/* Notes list */}
          <div className="space-y-3">
            {!isAuthenticated ? (
              <div className="text-center text-white/50 py-6 text-sm">
                Accedi per salvare le tue note.
              </div>
            ) : loading ? (
              <div className="text-center text-white/50 py-6 text-sm">
                <div className="inline-block w-5 h-5 border-2 border-[#00D1FF] border-t-transparent rounded-full animate-spin mb-2" />
                <div>Caricamento...</div>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center text-white/50 py-6 text-sm">
                Nessuna nota. Aggiungi la tua prima nota sopra.
              </div>
            ) : (
              notes.map(note => (
                <div 
                  key={note.id} 
                  className="p-3 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                >
                  {editingId === note.id ? (
                    <div className="space-y-3">
                      <textarea
                        className="w-full h-20 p-3 bg-black/50 border border-[#00D1FF]/30 rounded-xl text-white text-sm resize-none focus:outline-none focus:border-[#00D1FF]/60"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateNote(note.id)}
                          disabled={saving || !editText.trim()}
                          className="flex-1 bg-[#00D1FF] hover:bg-[#00D1FF]/80 text-black font-semibold rounded-lg h-9"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Salva
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setEditingId(null); setEditText(''); }}
                          className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-lg h-9"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Annulla
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-white/90 flex-1 leading-relaxed">{note.text}</p>
                        <button
                          onClick={() => handleToggleImportance(note.id)}
                          className={`w-3 h-3 rounded-full ${getImportanceColor(note.importance)} flex-shrink-0 mt-1 cursor-pointer hover:ring-2 hover:ring-white/30 transition-all`}
                          title={`Priorità: ${note.importance}`}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setEditingId(note.id); setEditText(note.text); }}
                          className="h-8 px-3 text-[#00D1FF] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10 rounded-lg text-xs font-medium"
                        >
                          <Edit2 className="h-3 w-3 mr-1.5" />
                          Modifica
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteNote(note.id)}
                          className="h-8 px-3 text-red-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-medium"
                        >
                          <Trash2 className="h-3 w-3 mr-1.5" />
                          Elimina
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </GlassModal>
    </>
  );
};

export default DevNotesPanel;
