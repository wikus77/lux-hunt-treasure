// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// DevNotesPanel.tsx - Revolut-style fullscreen modal for user notes
// Jan 2026 update: Now uses MapPillFlipOverlay

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Map as MLMap } from 'maplibre-gl';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { MapPillFlipOverlay } from '@/components/map/MapPillFlipOverlay';
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
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
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
      toast.error(t('mapPills.notes.toastLoadError'));
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
        toast.success(t('mapPills.notes.toastAddSuccess'));
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

  const handlePillClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOriginRect(rect);
    setOpen(true);
  };

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
          onClick={handlePillClick}
          title="Note"
          style={{ transform: 'scale(0.75)' }}
        >
          <div className="m1x-pill__icon">
            <FileText className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="m1x-pill__label">
            {t('mapPills.notes.pillLabel', { count })}
          </div>
        </div>
      </div>

      {/* Revolut-style Fullscreen Modal */}
      <MapPillFlipOverlay
        open={open}
        originRect={originRect}
        onClose={() => setOpen(false)}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
          {/* HEADER */}
          <div style={{
            flexShrink: 0,
            background: 'linear-gradient(180deg, rgba(0, 209, 255, 0.8) 0%, rgba(0, 100, 150, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
            paddingBottom: '20px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <button onClick={() => setOpen(false)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
              </button>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>{t('mapPills.notes.title')}</h1>
              </div>
              <div style={{ width: '40px' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>{t('mapPills.notes.subtitle')}</p>
          </div>

          {/* CONTENT */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)', WebkitOverflowScrolling: 'touch' }}>
            {/* Add new note */}
            <GlassCard style={{ marginBottom: '16px' }}>
              <textarea
                style={{ width: '100%', height: '80px', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px', resize: 'none', outline: 'none' }}
                placeholder={t('mapPills.notes.placeholder')}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                disabled={!isAuthenticated}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNoteText.trim() || saving || !isAuthenticated}
                style={{ width: '100%', marginTop: '12px', padding: '14px', borderRadius: '12px', background: '#00D1FF', border: 'none', color: '#000000', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: (!newNoteText.trim() || saving || !isAuthenticated) ? 0.5 : 1 }}
              >
                <Plus style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                {saving ? t('mapPills.notes.saving') : t('mapPills.notes.addNote')}
              </button>
            </GlassCard>

            {/* Notes list */}
            {!isAuthenticated ? (
              <GlassCard><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>{t('mapPills.notes.loginRequired')}</p></GlassCard>
            ) : loading ? (
              <GlassCard style={{ textAlign: 'center', padding: '30px 0' }}>
                <div style={{ width: '24px', height: '24px', border: '2px solid rgba(0, 209, 255, 0.3)', borderTopColor: '#00D1FF', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{t('mapPills.notes.loading')}</p>
              </GlassCard>
            ) : notes.length === 0 ? (
              <GlassCard><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>{t('mapPills.notes.empty')}</p></GlassCard>
            ) : (
              notes.map(note => (
                <GlassCard key={note.id} style={{ marginBottom: '12px' }}>
                  {editingId === note.id ? (
                    <div>
                      <textarea
                        style={{ width: '100%', height: '80px', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0, 209, 255, 0.3)', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px', resize: 'none', outline: 'none' }}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button onClick={() => handleUpdateNote(note.id)} disabled={saving || !editText.trim()} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#00D1FF', border: 'none', color: '#000', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                          <Save style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />Salva
                        </button>
                        <button onClick={() => { setEditingId(null); setEditText(''); }} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}>
                          <X style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', flex: 1, lineHeight: '1.5' }}>{note.text}</p>
                        <button onClick={() => handleToggleImportance(note.id)} style={{ width: '14px', height: '14px', borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0, marginTop: '4px' }} className={getImportanceColor(note.importance)} title={`Priorità: ${note.importance}`} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <button onClick={() => { setEditingId(note.id); setEditText(note.text); }} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(0, 209, 255, 0.1)', border: 'none', color: '#00D1FF', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                          <Edit2 style={{ width: '12px', height: '12px', display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />Modifica
                        </button>
                        <button onClick={() => handleDeleteNote(note.id)} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                          <Trash2 style={{ width: '12px', height: '12px', display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />Elimina
                        </button>
                      </div>
                    </>
                  )}
                </GlassCard>
              ))
            )}
          </div>
        </div>
      </MapPillFlipOverlay>
    </>
  );
};

// Glass Card component
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: 'rgba(25, 25, 35, 0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)', ...style }}>{children}</div>
);

export default DevNotesPanel;
