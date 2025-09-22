
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Edit2, Trash2 } from "lucide-react";
import MapNoteList from '@/components/maps/MapNoteList';

interface Note {
  id: string;
  note: string;
  importance: 'high' | 'medium' | 'low';
}

const NotesSection = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Toggle showing the note input
  const toggleNoteInput = () => {
    setShowNoteInput(!showNoteInput);
    setEditingNote(null);
    setNewNote('');
  };

  // Add a new note
  const addNote = () => {
    if (newNote.trim()) {
      if (editingNote) {
        // Update existing note
        setNotes(notes.map(note => 
          note.id === editingNote.id 
            ? { ...note, note: newNote.trim() } 
            : note
        ));
        setEditingNote(null);
      } else {
        // Add new note
        const newNoteItem = {
          id: Date.now().toString(),
          note: newNote.trim(),
          importance: 'medium' as 'high' | 'medium' | 'low'
        };
        setNotes([...notes, newNoteItem]);
      }
      setNewNote('');
      setShowNoteInput(false);
    }
  };

  // Cycle through importance levels
  const handleImportanceClick = (id: string) => {
    setNotes(notes.map(note => {
      if (note.id === id) {
        const importanceOrder: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
        const currentIndex = importanceOrder.indexOf(note.importance);
        const nextIndex = (currentIndex + 1) % importanceOrder.length;
        return { ...note, importance: importanceOrder[nextIndex] };
      }
      return note;
    }));
  };

  // Edit note
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNewNote(note.note);
    setShowNoteInput(true);
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
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
              >
                {editingNote ? 'Aggiorna' : 'Aggiungi'}
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
