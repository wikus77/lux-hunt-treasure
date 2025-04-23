
import React from "react";
import { Circle, Marker, InfoWindow } from "@react-google-maps/api";
import SearchAreaInfoWindow from "./SearchAreaInfoWindow";

type SearchArea = {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  label: string;
  editing?: boolean;
};

type Props = {
  searchAreas: SearchArea[];
  activeSearchArea: string | null;
  setActiveSearchArea: (id: string | null) => void;
  saveSearchArea: (id: string, label: string, radius: number) => void;
  editSearchArea: (id: string) => void;
  deleteSearchArea: (id: string) => void;
};

const MapSearchAreas: React.FC<Props> = ({
  searchAreas,
  activeSearchArea,
  setActiveSearchArea,
  saveSearchArea,
  editSearchArea,
  deleteSearchArea
}) => (
  <>
    {searchAreas.map(area => (
      <React.Fragment key={`area-${area.id}`}>
        <Circle 
          center={{ lat: area.lat, lng: area.lng }}
          radius={area.radius}
          options={{
            fillColor: "rgba(67, 97, 238, 0.24)", // [#4361ee] translucido - blu/violet
            fillOpacity: 0.8,
            strokeColor: "rgba(114, 9, 183, 0.9)", // [#7209b7] - violetto
            strokeOpacity: 1,
            strokeWeight: 3,
          }}
          onClick={() => setActiveSearchArea(area.id)}
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
  </>
);

export default MapSearchAreas;
