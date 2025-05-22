
import React from "react";
import { Marker, InfoWindow } from "@react-google-maps/api";
import MapMarkerInfoWindow from "./MapMarkerInfoWindow";
import { MapMarker } from "./types";

type Props = {
  markers: MapMarker[];
  activeMarker: string | null;
  setActiveMarker: (id: string | null) => void;
  saveMarkerNote: (id: string, note: string) => void;
  editMarker: (id: string) => void;
  deleteMarker: (id: string) => void;
};

const MapUserMarkers: React.FC<Props> = ({
  markers,
  activeMarker,
  setActiveMarker,
  saveMarkerNote,
  editMarker,
  deleteMarker
}) => (
  <>
    {markers.map(marker => (
      <React.Fragment key={`marker-${marker.id}`}>
        <Marker 
          position={{ lat: marker.lat, lng: marker.lng }}
          icon={{
            path: "M16 21v-2a4 4 0 0 0-4-4h-0a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM18 18a6 6 0 1 0-12 0c0 3.5 4 6 6 6s6-2.5 6-6Z",
            fillColor: marker.note ? "#39FF14" : "#fff",
            fillOpacity: marker.note ? 0.7 : 0.3,
            strokeColor: marker.note ? "#39FF14" : "#222",
            strokeWeight: 2,
            scale: 0.9,
          }}
          onClick={() => setActiveMarker(marker.id)}
        />
        {activeMarker === marker.id && (
          <InfoWindow
            key={`info-${marker.id}`}
            position={{ lat: marker.lat, lng: marker.lng }}
            onCloseClick={() => setActiveMarker(null)}
          >
            <MapMarkerInfoWindow
              marker={marker}
              setActiveMarker={setActiveMarker}
              saveMarkerNote={saveMarkerNote}
              editMarker={editMarker}
              deleteMarker={deleteMarker}
            />
          </InfoWindow>
        )}
      </React.Fragment>
    ))}
  </>
);

export default MapUserMarkers;
