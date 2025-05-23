
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapMarker } from '@/components/maps/types';

interface MapPointPopupProps {
  point: MapMarker;
  isNew?: boolean;
  onSave: (title: string, note: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const MapPointPopup: React.FC<MapPointPopupProps> = ({
  point,
  isNew = false,
  onSave,
  onCancel,
  onDelete
}) => {
  const [title, setTitle] = useState(point.title || '');
  const [note, setNote] = useState(point.note || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave(title, note);
  };
  
  return (
    <div className="p-2 min-w-[280px]">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Titolo
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titolo del punto"
            required
            className="w-full"
            autoFocus={isNew}
          />
        </div>
        
        <div>
          <label htmlFor="note" className="block text-sm font-medium mb-1">
            Nota
          </label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Aggiungi una nota (opzionale)"
            className="w-full min-h-[80px]"
          />
        </div>
        
        <div className="flex justify-between gap-2 pt-2">
          {!isNew && onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
            >
              Elimina
            </Button>
          )}
          
          <div className={`flex gap-2 ${!isNew && onDelete ? 'ml-auto' : 'w-full justify-end'}`}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCancel();
              }}
            >
              Annulla
            </Button>
            
            <Button
              type="submit"
              variant="default"
              size="sm"
            >
              Salva
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MapPointPopup;
