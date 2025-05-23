
import React, { useState, useEffect, useRef } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Effect to focus on title input when popup opens
  useEffect(() => {
    console.log("🔍 MapPointPopup mounted - attempting to focus input field");
    
    // Multiple focus attempts with increasing timeouts
    const attemptFocus = () => {
      console.log("🔎 Trying to focus input...");
      
      if (inputRef.current) {
        try {
          inputRef.current.focus();
          console.log("✅ Focus successful on title input");
          return true;
        } catch (err) {
          console.error("❌ Focus error:", err);
        }
      } else {
        console.log("❌ Input ref not available yet");
      }
      return false;
    };
    
    // Try immediately
    if (!attemptFocus()) {
      // Try after a short delay
      setTimeout(() => {
        if (!attemptFocus()) {
          // Try after a medium delay
          setTimeout(() => {
            if (!attemptFocus()) {
              // Try after a longer delay
              setTimeout(attemptFocus, 300);
            }
          }, 100);
        }
      }, 50);
    }
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("📝 Saving point with title:", title);
    onSave(title, note);
  };
  
  // Prevent clicks from propagating to map
  const handlePopupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      className="p-2 min-w-[280px]" 
      onClick={handlePopupClick}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
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
            // Ensure input is ready to receive focus
            onFocus={() => console.log("✅ Title input focused")}
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
