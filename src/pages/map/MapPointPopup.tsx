
import React, { useState } from 'react';

interface MapPointPopupProps {
  point: {
    id: string;
    lat: number;
    lng: number;
    title: string;
    note: string;
  };
  isNew?: boolean;
  onSave: (title: string, note: string) => void;
  onCancel: () => void;
  onDelete?: () => Promise<boolean>;
}

const MapPointPopup: React.FC<MapPointPopupProps> = ({
  point,
  isNew = false,
  onSave,
  onCancel,
  onDelete
}) => {
  const [title, setTitle] = useState(point.title);
  const [note, setNote] = useState(point.note);

  return (
    <div className="p-2 point-popup">
      <h3 className="font-bold mb-2">{isNew ? "Nuovo Punto" : "Modifica Punto"}</h3>
      <div className="mb-2">
        <label className="block text-sm mb-1">Titolo</label>
        <input
          className="w-full p-1 border rounded text-white bg-black/50"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titolo"
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm mb-1">Nota</label>
        <textarea
          className="w-full p-1 border rounded text-white bg-black/50"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nota"
          rows={3}
        />
      </div>
      <div className="flex justify-between">
        <button 
          className="px-3 py-1 bg-red-500 text-white rounded"
          onClick={onDelete ? onDelete : onCancel}
        >
          {onDelete ? "Elimina" : "Annulla"}
        </button>
        <button 
          className="px-3 py-1 bg-green-500 text-white rounded"
          onClick={() => onSave(title, note)}
        >
          Salva
        </button>
      </div>
    </div>
  );
};

export default MapPointPopup;
