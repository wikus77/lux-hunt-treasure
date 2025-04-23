
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

type SearchArea = {
  id: string;
  label: string;
  radius: number;
  isAI?: boolean;
};

type SearchAreaInfoWindowProps = {
  area: SearchArea;
  setActiveSearchArea: (id: string | null) => void;
  saveSearchArea: (id: string, label: string, radius: number) => void;
  editSearchArea: (id: string) => void;
  deleteSearchArea: (id: string) => void;
};

const SearchAreaInfoWindow: React.FC<SearchAreaInfoWindowProps> = ({
  area,
  setActiveSearchArea,
  saveSearchArea,
  editSearchArea,
  deleteSearchArea,
}) => {
  const [label, setLabel] = useState(area.label);
  const [radius, setRadius] = useState(area.radius);
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    saveSearchArea(area.id, label, radius);
    setEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Sicuro di voler eliminare quest'area di ricerca?")) {
      deleteSearchArea(area.id);
    }
  };

  return (
    <div className="p-2 w-[240px]">
      <div className="text-center mb-2">
        {editing ? (
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mb-2"
          />
        ) : (
          <h3 className="font-medium">{area.label}</h3>
        )}
      </div>

      {editing ? (
        <div className="mb-3">
          <p className="text-xs mb-1">Raggio: {(radius / 1000).toFixed(1)} km</p>
          <Slider
            value={[radius]}
            min={100}
            max={area.isAI ? 250000 : 10000}
            step={100}
            onValueChange={(v) => setRadius(v[0])}
          />
        </div>
      ) : (
        <p className="text-sm mb-2">
          Raggio: {(area.radius / 1000).toFixed(1)} km
          {area.isAI && (
            <span className="ml-1 text-xs text-projectx-blue">
              (Buzz)
            </span>
          )}
        </p>
      )}

      <div className="flex justify-between gap-2">
        {editing ? (
          <>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setEditing(false)}
            >
              Annulla
            </Button>
            <Button 
              size="sm" 
              className="flex-1" 
              onClick={handleSave}
            >
              Salva
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setEditing(true)}
            >
              Modifica
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={area.isAI && !editing} // Disable initial delete for AI areas
            >
              Elimina
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchAreaInfoWindow;
