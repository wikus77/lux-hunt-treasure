// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Edit2, Trash2 } from "lucide-react";
import MapNoteList from '@/components/maps/MapNoteList';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Note {
  id: string;
  note: string;
  importance: 'high' | 'medium' | 'low';
}

const NotesSection = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load notes from database
  useEffect(() => {
    if (!user?.id) return;
    loadNotes();
  }, [user?.id]);

  // Setup realtime subscription with full event handling
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('map_notes_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'map_notes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Only reload if not from current session (avoid duplicate optimistic updates)
          setTimeout(() => loadNotes(), 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'map_notes',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadNotes();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'map_notes',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const loadNotes = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('map_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedNotes = data.map(note => ({
        id: note.id,
        note: note.text,
        importance: note.importance as 'high' | 'medium' | 'low'
      }));

      setNotes(mappedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle showing the note input
  const toggleNoteInput = () => {
    setShowNoteInput(!showNoteInput);
    setEditingNote(null);
    setNewNote('');
  };

  // Add or update note
  const addNote = async () => {
    if (!newNote.trim() || !user?.id) return;

    setSaving(true);

    const tempId = `temp-${Date.now()}`;
    const newNoteData = {
      id: tempId,
      note: newNote.trim(),
      importance: 'medium' as const
    };

    try {
      if (editingNote) {
        // Optimistic update for edit
        setNotes(prev => prev.map(n => 
          n.id === editingNote.id 
            ? { ...n, note: newNote.trim() }
            : n
        ));

        const { error } = await supabase
          .from('map_notes')
          .update({ 
            text: newNote.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', editingNote.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Nota aggiornata');
      } else {
        // Optimistic update for new note
        setNotes(prev => [newNoteData, ...prev]);

        const { error } = await supabase
          .from('map_notes')
          .insert({
            user_id: user.id,
            text: newNote.trim(),
            importance: 'medium'
          });

        if (error) throw error;
        toast.success('Nota aggiunta');
      }

      setNewNote('');
      setShowNoteInput(false);
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Errore nel salvare la nota');
      
      // Rollback optimistic update
      if (editingNote) {
        loadNotes();
      } else {
        setNotes(prev => prev.filter(n => n.id !== tempId));
      }
    } finally {
      setSaving(false);
    }
  };

  // Cycle through importance levels
  const handleImportanceClick = async (id: string) => {
    if (!user?.id) return;

    try {
      const note = notes.find(n => n.id === id);
      if (!note) return;

      const importanceOrder: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
      const currentIndex = importanceOrder.indexOf(note.importance);
      const nextIndex = (currentIndex + 1) % importanceOrder.length;
      const newImportance = importanceOrder[nextIndex];

      const { error } = await supabase
        .from('map_notes')
        .update({ 
          importance: newImportance,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating importance:', error);
      toast.error('Errore nell\'aggiornare la priorità');
    }
  };

  // Edit note
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNewNote(note.note);
    setShowNoteInput(true);
  };

  // Delete note (optimistic with immediate UI update)
  const handleDeleteNote = async (id: string) => {
    if (!user?.id) return;

    // Store previous state for rollback
    const previousNotes = [...notes];
    
    // Optimistic removal - immediate UI update
    setNotes(prevNotes => prevNotes.filter(n => n.id !== id));

    try {
      const { error } = await supabase
        .from('map_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Nota eliminata');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Errore nell\'eliminare la nota');
      // Rollback to previous state
      setNotes(previousNotes);
    }
  };

  return (
    <Card gradient className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-cyan-400" />
          Le tue note
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showNoteInput ? (
          <div className="space-y-3">
            <textarea
              className="w-full h-24 p-3 bg-black/50 border border-cyan-500/30 rounded-[24px] text-white resize-none focus:outline-none focus:border-cyan-500/60"
              placeholder="Scrivi una nota..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleNoteInput}
                className="rounded-full"
              >
                Annulla
              </Button>
              <Button 
                variant="default"
                size="sm" 
                onClick={addNote}
                className="rounded-full"
                disabled={saving || !newNote.trim()}
              >
                {saving ? 'Salvataggio...' : (editingNote ? 'Aggiorna' : 'Aggiungi')}
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 rounded-full border border-cyan-500/30 hover:border-cyan-500/60"
            onClick={toggleNoteInput}
          >
            <PlusCircle className="h-5 w-5 text-cyan-400" />
            Aggiungi nota
          </Button>
        )}

        <MapNoteList 
          notes={notes}
          onImportanceClick={handleImportanceClick}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
        />
      </CardContent>
    </Card>
  );
};

export default NotesSection;
