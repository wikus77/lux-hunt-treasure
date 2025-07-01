
import React from 'react';
import { Circle, Popup } from 'react-leaflet';
import L from 'leaflet';

interface MapSearchAreasProps {
  searchAreas: any[];
  setActiveSearchArea: React.Dispatch<React.SetStateAction<string | null>>;
  deleteSearchArea: (id: string) => Promise<boolean>;
  setPendingRadius: (value: number) => void;
}

const MapSearchAreas: React.FC<MapSearchAreasProps> = ({
  searchAreas,
  setActiveSearchArea,
  deleteSearchArea,
  setPendingRadius
}) => {
  console.log('🔍 Rendering search areas:', searchAreas.length);

  return (
    <>
      {searchAreas.map((area) => (
        <Circle
          key={area.id}
          center={[area.lat, area.lng]}
          radius={area.radius}
          pathOptions={{
            fillColor: area.color || '#00D1FF',
            fillOpacity: 0.3,
            color: area.color || '#00D1FF',
            weight: 2,
            opacity: 0.8
          }}
          eventHandlers={{
            click: () => {
              console.log('🔍 Search area clicked:', area.id);
              setActiveSearchArea(area.id);
            }
          }}
        >
          <Popup>
            <div className="p-2 bg-black/90 text-white rounded">
              <h3 className="font-bold text-cyan-400">{area.label}</h3>
              <p className="text-sm">Raggio: {(area.radius / 1000).toFixed(1)}km</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => deleteSearchArea(area.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                >
                  Elimina
                </button>
                <button
                  onClick={() => {
                    setPendingRadius(area.radius / 1000);
                    setActiveSearchArea(null);
                  }}
                  className="bg-cyan-500 hover:bg-cyan-600 text-black px-2 py-1 rounded text-xs"
                >
                  Modifica
                </button>
              </div>
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  );
};

export default MapSearchAreas;
