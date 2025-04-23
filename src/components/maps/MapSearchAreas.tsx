
import React, { useRef, useState } from "react";
import { Circle, Marker, InfoWindow } from "@react-google-maps/api";
import SearchAreaInfoWindow from "./SearchAreaInfoWindow";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

type SearchArea = {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  label: string;
  editing?: boolean;
  isAI?: boolean; // <--- nuova proprietà
};

type Props = {
  searchAreas: SearchArea[];
  activeSearchArea: string | null;
  setActiveSearchArea: (id: string | null) => void;
  saveSearchArea: (id: string, label: string, radius: number) => void;
  editSearchArea: (id: string) => void;
  deleteSearchArea: (id: string) => void;
};

const LONG_PRESS_MS = 700;

const MapSearchAreas: React.FC<Props> = ({
  searchAreas,
  activeSearchArea,
  setActiveSearchArea,
  saveSearchArea,
  editSearchArea,
  deleteSearchArea
}) => {
  const [longPressArea, setLongPressArea] = useState<SearchArea | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Gestisci la pressione prolungata SOLO per le aree AI
  const handleAreaMouseDown = (area: SearchArea) => {
    if (!area.isAI) return;
    timerRef.current = setTimeout(() => {
      setLongPressArea(area);
    }, LONG_PRESS_MS);
  };
  const handleAreaMouseUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleAreaTouchStart = (area: SearchArea) => {
    if (!area.isAI) return;
    timerRef.current = setTimeout(() => {
      setLongPressArea(area);
    }, LONG_PRESS_MS);
  };
  const handleAreaTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleAIEdit = () => {
    if (longPressArea) {
      editSearchArea(longPressArea.id);
      setActiveSearchArea(longPressArea.id);
      setLongPressArea(null);
    }
  };

  const handleAIDelete = () => {
    if (longPressArea) {
      deleteSearchArea(longPressArea.id); // ora consentito: il pulsante gestisce l'eccezione
      setLongPressArea(null);
    }
  };

  return (
    <>
      {searchAreas.map(area => (
        <React.Fragment key={`area-${area.id}`}>
          <Circle
            center={{ lat: area.lat, lng: area.lng }}
            radius={area.radius}
            options={{
              fillColor: area.isAI
                ? "rgba(67,97,238,0.43)" // [#4361ee] più visibile/translucido per aree AI
                : "rgba(67, 97, 238, 0.24)",
              fillOpacity: area.isAI ? 0.75 : 0.8,
              strokeColor: area.isAI
                ? "rgba(0,163,255,0.85)" // [#00a3ff] esterna luminosa per aree AI
                : "rgba(114, 9, 183, 0.9)",
              strokeOpacity: area.isAI ? 1 : 1,
              strokeWeight: area.isAI ? 4 : 3,
            }}
            onClick={() => setActiveSearchArea(area.id)}
            onMouseDown={area.isAI ? () => handleAreaMouseDown(area) : undefined}
            onMouseUp={area.isAI ? handleAreaMouseUp : undefined}
            onTouchStart={area.isAI ? () => handleAreaTouchStart(area) : undefined}
            onTouchEnd={area.isAI ? handleAreaTouchEnd : undefined}
          />
          <Marker
            position={{ lat: area.lat, lng: area.lng }}
            icon={{
              path: "M10 10 L10 10 Z",
              scale: 0,
            }}
            label={{
              text: area.label,
              color: "#FFFFFF",
              fontWeight: "bold",
              className: "map-label"
            }}
            onClick={() => setActiveSearchArea(area.id)}
          />
          {activeSearchArea === area.id && (
            <InfoWindow
              key={`area-info-${area.id}`}
              position={{ lat: area.lat, lng: area.lng }}
              onCloseClick={() => setActiveSearchArea(null)}
            >
              <SearchAreaInfoWindow
                area={area}
                setActiveSearchArea={setActiveSearchArea}
                saveSearchArea={saveSearchArea}
                editSearchArea={editSearchArea}
                deleteSearchArea={deleteSearchArea}
              />
            </InfoWindow>
          )}
        </React.Fragment>
      ))}

      {/* Banner di azione su pressione prolungata per le aree AI */}
      <AlertDialog open={Boolean(longPressArea)} onOpenChange={open => !open && setLongPressArea(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {/* icona informativa too: */}
              Modifica o elimina area Buzz
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi modificare o eliminare questa area di ricerca Buzz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLongPressArea(null)}>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleAIEdit}>Modifica</AlertDialogAction>
            <AlertDialogAction onClick={handleAIDelete} className="bg-red-500 text-white hover:bg-red-700">
              Elimina area
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MapSearchAreas;
