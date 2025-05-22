
import React from "react";
import { GoogleMap } from "@react-google-maps/api";
import { useMapEffects } from "./useMapEffects";
import MapUserMarkers from "./MapUserMarkers";
import MapSearchAreas from "./MapSearchAreas";
import { mapContainerStyle, defaultCenter } from "./mapStyles";
import type { MapMarkersProps } from "./types";

export const MapMarkers: React.FC<MapMarkersProps> = ({
  isLoaded,
  markers,
  searchAreas,
  isAddingMarker,
  isAddingSearchArea,
  activeMarker,
  activeSearchArea,
  onMapClick,
  onMapDoubleClick,
  setActiveMarker,
  setActiveSearchArea,
  saveMarkerNote,
  saveSearchArea,
  editMarker,
  editSearchArea,
  deleteMarker,
  deleteSearchArea,
  center = defaultCenter,
  mapOptions = {}
}) => {
  const {
    handleZoomChanged,
    handleMapLoad,
    getMapOptions
  } = useMapEffects();

  // Set up map options with any passed options
  const finalMapOptions = getMapOptions(mapOptions);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={13}
      onClick={onMapClick}
      onDblClick={onMapDoubleClick}
      onZoomChanged={handleZoomChanged}
      onLoad={handleMapLoad}
      options={finalMapOptions}
    >
      <MapUserMarkers
        markers={markers}
        activeMarker={activeMarker}
        setActiveMarker={setActiveMarker}
        saveMarkerNote={saveMarkerNote}
        editMarker={editMarker}
        deleteMarker={deleteMarker}
      />

      <MapSearchAreas
        searchAreas={searchAreas}
        activeSearchArea={activeSearchArea}
        setActiveSearchArea={setActiveSearchArea}
        saveSearchArea={saveSearchArea}
        editSearchArea={editSearchArea}
        deleteSearchArea={deleteSearchArea}
      />
    </GoogleMap>
  ) : (
    <div>Loading...</div>
  );
};
