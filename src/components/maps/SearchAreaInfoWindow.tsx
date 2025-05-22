
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { SearchArea } from "./types";

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
  const [label, setLabel] = useState(area.label);
  const [radius, setRadius] = useState(area.radius);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    saveSearchArea(area.id, label, radius);
    setIsEditing(false);
  };

  const handleDelete = () => {
    try {
      deleteSearchArea(area.id);
      setActiveSearchArea(null);
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      alert("Si è verificato un errore durante l'eliminazione dell'area.");
    }
  };

  return (
    <div className="infowindow-content">
      {isEditing ? (
        <div>
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Label:
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Radius:
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
          <div className="flex justify-between">
            <button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-bold">{area.label}</h2>
          <p>Radius: {area.radius} meters</p>
           {area.confidence && (
            <p>
              Confidence:
              <Badge
                className={
                  area.confidence === "Alta"
                    ? "bg-green-500/80"
                    : area.confidence === "Media"
                      ? "bg-yellow-500/80"
                      : "bg-red-500/80"
                }
              >
                {area.confidence}
              </Badge>
            </p>
          )}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => editSearchArea(area.id)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAreaInfoWindow;
