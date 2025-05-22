
import React from 'react';
import { GeoJSON } from 'react-leaflet';
import { toast } from 'sonner';

// Define region colors with a neon aesthetic
const regionColors = {
  'Lombardia': '#00D1FF',
  'Piemonte': '#9b87f5',
  'Valle d\'Aosta': '#ff00ff',
  'Liguria': '#00ffcc',
  'Veneto': '#33C3F0',
  'Trentino-Alto Adige': '#ff66cc',
  'Friuli-Venezia Giulia': '#00D1FF',
  'Emilia-Romagna': '#9b87f5',
  'Toscana': '#00ffcc',
  'Umbria': '#ff00ff',
  'Marche': '#33C3F0',
  'Lazio': '#00D1FF',
  'Abruzzo': '#9b87f5',
  'Molise': '#ff66cc',
  'Campania': '#00ffcc',
  'Puglia': '#00D1FF',
  'Basilicata': '#ff00ff',
  'Calabria': '#33C3F0',
  'Sicilia': '#9b87f5',
  'Sardegna': '#00ffcc'
};

interface ItalyRegionsProps {
  geoJsonData: any;
}

const ItalyRegions: React.FC<ItalyRegionsProps> = ({ geoJsonData }) => {
  // Style function for GeoJSON features
  const regionStyle = (feature: any) => {
    const regionName = feature.properties.name;
    const color = regionColors[regionName] || '#00D1FF'; // Default to cyan if region not found
    
    return {
      fillColor: color,
      weight: 2,
      opacity: 0.8,
      color: color,
      dashArray: '',
      fillOpacity: 0.05
    };
  };

  // Interaction handlers
  const onEachFeature = (feature: any, layer: any) => {
    if (feature.properties && feature.properties.name) {
      // Add hover effect
      layer.on({
        mouseover: (e: any) => {
          const layer = e.target;
          layer.setStyle({
            weight: 3,
            opacity: 1,
            fillOpacity: 0.1
          });
          layer.bringToFront();
        },
        mouseout: (e: any) => {
          const layer = e.target;
          layer.setStyle({
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.05
          });
        },
        click: (e: any) => {
          const regionName = feature.properties.name;
          toast.info(`Regione: ${regionName}`);
        }
      });
    }
  };

  return (
    <GeoJSON
      data={geoJsonData}
      style={regionStyle}
      onEachFeature={onEachFeature}
    />
  );
};

export default ItalyRegions;
