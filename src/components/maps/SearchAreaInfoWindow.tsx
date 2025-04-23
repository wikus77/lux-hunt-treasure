
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, X, Check } from "lucide-react";

type SearchArea = {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  label: string;
  editing?: boolean;
};

type Props = {
  area: SearchArea;
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
  const newLabelRef = useRef<HTMLInputElement>(null);
  const newRadiusRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-w-[200px]">
      {area.editing ? (
        <div className="flex flex-col gap-2">
          <div className="mb-2">
            <label className="text-xs text-gray-500">Nome area</label>
            <Input
              ref={newLabelRef}
              defaultValue={area.label}
              placeholder="Nome area di ricerca"
              className="text-sm"
            />
          </div>
          <div className="mb-2">
            <label className="text-xs text-gray-500">Raggio (metri)</label>
            <Input
              ref={newRadiusRef}
              type="number"
              defaultValue={area.radius}
              min={50}
              max={5000}
              className="text-sm"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                deleteSearchArea(area.id);
                setActiveSearchArea(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                const label = newLabelRef.current?.value || "Area di ricerca";
                const radius = Number(newRadiusRef.current?.value) || 500;
                saveSearchArea(area.id, label, radius);
              }}
            >
              <Check className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div>
            <h3 className="font-medium text-sm">{area.label}</h3>
            <p className="text-xs text-gray-500">Raggio: {area.radius}m</p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteSearchArea(area.id)}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => editSearchArea(area.id)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAreaInfoWindow;
