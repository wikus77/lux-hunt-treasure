
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDljMCA1LjI1IDcgMTMgNyAxM3M3LTcuNzUgNy0xM2MwLTMuODctMy4xMy03LTctN3ptMCA5LjVjLTEuMzggMC0yLjUtMS4xMi0yLjUtMi41czEuMTItMi41IDIuNS0yLjUgMi41IDEuMTIgMi41IDIuNS0xLjEyIDIuNS0yLjUgMi41eiIgZmlsbD0iIzAwRDFGRiIvPgo8L3N2Zz4K',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

interface MapMarkersProps {
  mapPoints: any[];
  activeMapPoint: string | null;
  setActiveMapPoint: React.Dispatch<React.SetStateAction<string | null>>;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: any | null;
  handleSaveNewPoint: (title: string, note: string) => void;
  handleCancelNewPoint: () => void;
}

const MapMarkers: React.FC<MapMarkersProps> = ({
  mapPoints,
  activeMapPoint,
  setActiveMapPoint,
  handleUpdatePoint,
  deleteMapPoint,
  newPoint,
  handleSaveNewPoint,
  handleCancelNewPoint
}) => {
  console.log('📍 Rendering map markers:', mapPoints.length);

  return (
    <>
      {/* Existing map points */}
      {mapPoints.map((point) => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          icon={customIcon}
          eventHandlers={{
            click: () => {
              console.log('📍 Marker clicked:', point.id);
              setActiveMapPoint(point.id);
            }
          }}
        >
          <Popup>
            <div className="p-2 bg-black/90 text-white rounded max-w-xs">
              <h3 className="font-bold text-cyan-400 mb-2">{point.title}</h3>
              {point.note && (
                <p className="text-sm text-gray-300 mb-2">{point.note}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => deleteMapPoint(point.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                >
                  Elimina
                </button>
                <button
                  onClick={() => setActiveMapPoint(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* New point being added */}
      {newPoint && (
        <Marker
          position={[newPoint.lat, newPoint.lng]}
          icon={customIcon}
        >
          <Popup autoPan={true}>
            <div className="p-2 bg-black/90 text-white rounded">
              <h3 className="font-bold text-cyan-400 mb-2">Nuovo Punto</h3>
              <input
                type="text"
                placeholder="Titolo punto..."
                className="w-full bg-gray-800 text-white px-2 py-1 rounded mb-2 text-sm"
                defaultValue={newPoint.title || ''}
                onChange={(e) => newPoint.title = e.target.value}
              />
              <textarea
                placeholder="Note..."
                className="w-full bg-gray-800 text-white px-2 py-1 rounded mb-2 text-sm resize-none"
                rows={2}
                defaultValue={newPoint.note || ''}
                onChange={(e) => newPoint.note = e.target.value}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveNewPoint(newPoint.title || '', newPoint.note || '')}
                  className="bg-cyan-500 hover:bg-cyan-600 text-black px-2 py-1 rounded text-xs"
                >
                  Salva
                </button>
                <button
                  onClick={handleCancelNewPoint}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                >
                  Annulla
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
};

export default MapMarkers;
