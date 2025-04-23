
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Save, X, Circle } from "lucide-react";

type Props = {
  area: {
    id: string;
    lat: number;
    lng: number;
    radius: number;
    label: string;
    editing?: boolean;
    isAI?: boolean;
    confidence?: "alta" | "media" | "bassa";
  };
  setActiveSearchArea: (id: string | null) => void;
  saveSearchArea: (id: string, label: string, radius: number) => void;
  editSearchArea: (id: string) => void;
  deleteSearchArea: (id: string) => void;
};

const SearchAreaInfoWindow: React.FC<Props> = ({
  area,
  setActiveSearchArea,
  saveSearchArea,
  editSearchArea,
  deleteSearchArea
}) => {
  const [label, setLabel] = useState(area.label);
  const [radius, setRadius] = useState(area.radius);
  const labelRef = useRef<HTMLInputElement>(null);
  const radiusRef = useRef<HTMLInputElement>(null);
  
  const handleSave = () => {
    const newLabel = labelRef.current?.value || area.label;
    const newRadius = radiusRef.current?.value ? 
      parseInt(radiusRef.current.value, 10) : area.radius;
    
    saveSearchArea(area.id, newLabel, newRadius);
  };
  
  const getConfidenceColor = () => {
    if (!area.confidence) return "text-gray-300";
    
    switch(area.confidence) {
      case "alta": return "text-green-400";
      case "media": return "text-yellow-400";
      case "bassa": return "text-red-400";
      default: return "text-gray-300";
    }
  };
  
  return (
    <div className="bg-black/90 text-white p-3 rounded-md min-w-[260px]">
      {area.editing ? (
        <>
          <div className="mb-3">
            <label className="block text-xs mb-1">Nome area</label>
            <Input
              ref={labelRef}
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs mb-1">Raggio (metri)</label>
            <Input
              ref={radiusRef}
              type="number"
              min={1000}
              max={1000000}
              step={1000}
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value, 10))}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div className="flex justify-between">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setActiveSearchArea(null)}
              className="text-gray-300"
            >
              <X size={16} className="mr-1" /> Annulla
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
              className="bg-projectx-blue hover:bg-projectx-blue/80"
            >
              <Save size={16} className="mr-1" /> Salva
            </Button>
          </div>
        </>
      ) : (
        <>
          <h3 className="font-bold mb-1 flex items-center gap-2">
            <Circle className="h-4 w-4 text-projectx-blue" />
            {area.label}
          </h3>
          
          <div className="text-xs text-gray-300 mb-3">
            <div>Coordinate: {area.lat.toFixed(4)}, {area.lng.toFixed(4)}</div>
            <div>Raggio: {(area.radius / 1000).toFixed(1)} km</div>
            
            {area.isAI && area.confidence && (
              <div className="mt-1">
                Confidenza: <span className={getConfidenceColor()}>
                  {area.confidence.charAt(0).toUpperCase() + area.confidence.slice(1)}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => editSearchArea(area.id)}
              className="text-xs"
            >
              <Pencil size={14} className="mr-1" /> Modifica
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteSearchArea(area.id)}
              className="text-xs"
            >
              <Trash2 size={14} className="mr-1" /> Elimina
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchAreaInfoWindow;
