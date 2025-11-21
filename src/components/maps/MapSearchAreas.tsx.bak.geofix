
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
import { SearchArea } from "./types";

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
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
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

  const handleAreaMouseOver = (areaId: string) => {
    setHoveredArea(areaId);
  };

  const handleAreaMouseOut = () => {
    setHoveredArea(null);
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
      deleteSearchArea(longPressArea.id);
      setLongPressArea(null);
    }
  };

  // Colore basato sul livello di confidenza
  const getConfidenceColor = (area: SearchArea) => {
    if (!area.isAI || !area.confidence) return area.color || "rgba(67, 97, 238, 0.24)";
    
    if (area.confidence === "Alta") return "rgba(74, 222, 128, 0.3)"; // Verde per alta confidenza
    if (area.confidence === "Media") return "rgba(250, 204, 21, 0.3)"; // Giallo per media confidenza
    return "rgba(248, 113, 113, 0.3)"; // Rosso per bassa confidenza
  };

  // Enhance visual feedback for hovered areas
  const getCircleOptions = (area: SearchArea) => {
    const isHovered = hoveredArea === area.id;
    const isActive = activeSearchArea === area.id;
    
    // Base options
    let options = {
      fillColor: area.isAI 
        ? "#9b87f5" // Viola neon per aree AI
        : getConfidenceColor(area),
      fillOpacity: area.isAI ? 0.5 : 0.4,
      strokeColor: area.isAI
        ? "#7e69ab" // Bordo viola più scuro per aree AI
        : area.confidence === "Alta" 
          ? "rgba(34, 197, 94, 0.9)" // Verde per alta confidenza
          : area.confidence === "Media" 
            ? "rgba(234, 179, 8, 0.9)" // Giallo per media confidenza
            : "rgba(239, 68, 68, 0.9)", // Rosso per bassa confidenza
      strokeOpacity: 1,
      strokeWeight: area.isAI ? 3 : 2,
      zIndex: area.isAI ? 10 : 5 // Diamo priorità alle aree AI
    };
    
    // Enhanced options for hover state
    if (isHovered || isActive) {
      return {
        ...options,
        fillOpacity: (area.isAI ? 0.6 : 0.5) + (isActive ? 0.1 : 0),
        strokeWeight: (area.isAI ? 3 : 2) + 1,
        strokeColor: area.isAI
          ? "#b9a6ff" // Bordo viola più brillante quando in hover
          : area.confidence === "Alta" 
            ? "rgba(74, 222, 128, 1)" // Verde più brillante in hover
            : area.confidence === "Media" 
              ? "rgba(250, 204, 21, 1)" // Giallo più brillante in hover
              : "rgba(248, 113, 113, 1)", // Rosso più brillante in hover
      };
    }
    
    return options;
  };

  return (
    <>
      {searchAreas.map(area => (
        <React.Fragment key={`area-${area.id}`}>
          <Circle
            center={{ lat: area.lat, lng: area.lng }}
            radius={area.radius}
            options={getCircleOptions(area)}
            onClick={() => setActiveSearchArea(area.id)}
            onMouseDown={area.isAI ? () => handleAreaMouseDown(area) : undefined}
            onMouseUp={area.isAI ? handleAreaMouseUp : undefined}
            onMouseOver={() => handleAreaMouseOver(area.id)}
            onMouseOut={handleAreaMouseOut}
          />
          {/* Per le aree AI, aggiungiamo un secondo cerchio leggermente più grande con puntini per simulare il bordo tratteggiato */}
          {area.isAI && (
            <Circle
              center={{ lat: area.lat, lng: area.lng }}
              radius={area.radius + 20} // Leggermente più grande del cerchio principale
              options={{
                strokeColor: hoveredArea === area.id ? "#d4c5ff" : "#9b87f5",
                strokeOpacity: hoveredArea === area.id ? 0.9 : 0.7,
                strokeWeight: 1,
                fillOpacity: 0,
                zIndex: 9 // Sotto il cerchio principale
              }}
            />
          )}
          <Marker
            position={{ lat: area.lat, lng: area.lng }}
            icon={{
              path: "M10 10 L10 10 Z",
              scale: 0,
            }}
            label={{
              text: `${area.label} (${(area.radius/1000).toFixed(0)}km)`,
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
              Modifica o elimina area Buzz
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi modificare o eliminare questa area di ricerca Buzz?
              {longPressArea?.confidence && (
                <div className="mt-2">
                  <span className="font-bold">Confidenza: </span>
                  <span className={
                    longPressArea.confidence === "Alta" ? "text-green-500" :
                    longPressArea.confidence === "Media" ? "text-yellow-500" : "text-red-500"
                  }>
                    {longPressArea.confidence}
                  </span>
                </div>
              )}
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
