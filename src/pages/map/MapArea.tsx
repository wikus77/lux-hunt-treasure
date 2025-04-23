
import React, { useEffect } from "react";
import { LoadScript } from "@react-google-maps/api";
import { MapMarkers, type MapMarker, type SearchArea } from "@/components/maps/MapMarkers";

const GOOGLE_MAPS_API_KEY = "AIzaSyDcPS0_nVl2-Waxcby_Vn3iu1ojh360oKQ";
const DEFAULT_CENTER = { lat: 45.4642, lng: 9.19 };
const mapLibraries: ["places"] = ["places"];

type MapAreaProps = {
  markers: MapMarker[];
  searchAreas: SearchArea[];
  isAddingMarker: boolean;
  isAddingSearchArea: boolean;
  activeMarker: string | null;
  activeSearchArea: string | null;
  onMapClick: (e: google.maps.MapMouseEvent) => void;
  onMapDoubleClick: (e: google.maps.MapMouseEvent) => void;
  setActiveMarker: (id: string | null) => void;
  setActiveSearchArea: (id: string | null) => void;
  saveMarkerNote: (id: string, note: string) => void;
  saveSearchArea: (id: string, label: string, radius: number) => void;
  editMarker: (id: string) => void;
  editSearchArea: (id: string) => void;
  deleteMarker: (id: string) => void;
  deleteSearchArea: (id: string) => void;
  currentLocation: [number, number] | null;
  onMapReady?: () => void;
};

const MapArea: React.FC<MapAreaProps> = (props) => {
  // Chiamiamo onMapReady quando il componente è montato
  useEffect(() => {
    if (props.onMapReady) {
      props.onMapReady();
    }
  }, [props.onMapReady]);

  return (
    <div className="bg-black/50 border border-projectx-deep-blue/40 rounded-xl overflow-hidden shadow-xl p-4">
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} loadingElement={<div>Caricamento mappa...</div>}>
        <MapMarkers
          isLoaded={true}
          markers={props.markers}
          searchAreas={props.searchAreas}
          isAddingMarker={props.isAddingMarker}
          isAddingSearchArea={props.isAddingSearchArea}
          activeMarker={props.activeMarker}
          activeSearchArea={props.activeSearchArea}
          onMapClick={props.onMapClick}
          onMapDoubleClick={props.onMapDoubleClick}
          setActiveMarker={props.setActiveMarker}
          setActiveSearchArea={props.setActiveSearchArea}
          saveMarkerNote={props.saveMarkerNote}
          saveSearchArea={props.saveSearchArea}
          editMarker={props.editMarker}
          editSearchArea={props.editSearchArea}
          deleteMarker={props.deleteMarker}
          deleteSearchArea={props.deleteSearchArea}
          center={
            props.currentLocation
              ? { lat: props.currentLocation[0], lng: props.currentLocation[1] }
              : DEFAULT_CENTER
          }
        />
      </LoadScript>
    </div>
  );
};

export default MapArea;
