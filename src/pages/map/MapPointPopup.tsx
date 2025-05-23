
import React, { useState, useEffect } from 'react';
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
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  // Effect to focus on title input when popup opens
  useEffect(() => {
    if (inputRef.current) {
      // Ensure the popup is fully rendered and then focus
      console.log("Attempting to focus title field");
      // Use a more aggressive approach to ensure focus works
      const focusInterval = setInterval(() => {
        if (inputRef.current) {
          console.log("Auto-focusing title field");
          inputRef.current.focus();
          clearInterval(focusInterval);
        }
      }, 50);
      
      // Clear interval after 500ms to prevent infinite loop
      setTimeout(() => clearInterval(focusInterval), 500);
    }
    
    return () => {
      // Cleanup any event handlers if needed
    };
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Saving point with title:", title);
    onSave(title, note);
  };
  
  return (
    <div className="p-2 min-w-[280px]" onClick={(e) => e.stopPropagation()}>
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
            ref={inputRef}
            autoFocus={true}
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
            onClick={(e) => e.stopPropagation()}
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
