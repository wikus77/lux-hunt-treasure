/**
 * Risiko Domination - Country Overlay Layer for MapLibre
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Renderizza:
 * - Fill verde neon per paesi conquistati
 * - Fill ambra per paesi contested
 * - Label con nome owner
 * 
 * NOTA: Visibile solo da zoom ≥ 4
 */

import React, { useEffect, useRef, useMemo } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { useCountryDomination, CountryDominationState } from '../hooks/useCountryDomination';
import { COUNTRY_NAMES } from '@/lib/domination/continentMapping';

// Layer IDs
const SOURCE_ID = 'country-domination-source';
const CONQUERED_FILL_LAYER = 'country-domination-conquered-fill';
const CONTESTED_FILL_LAYER = 'country-domination-contested-fill';
const CONQUERED_LINE_LAYER = 'country-domination-conquered-line';
const LABEL_LAYER = 'country-domination-label';

// Country centroids for labels (approximate)
const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  IT: [12.5, 42.5], FR: [2.2, 46.2], DE: [10.4, 51.2], ES: [-3.7, 40.4],
  PT: [-8.2, 39.4], GB: [-1.2, 52.4], NL: [5.3, 52.1], BE: [4.5, 50.5],
  AT: [14.6, 47.5], CH: [8.2, 46.8], PL: [19.1, 51.9], CZ: [15.5, 49.8],
  HU: [19.5, 47.2], RO: [25.0, 46.0], GR: [21.8, 39.1], SE: [18.6, 60.1],
  NO: [8.5, 60.5], DK: [9.5, 56.3], FI: [26.0, 64.0], IE: [-8.2, 53.4],
  US: [-98.6, 39.8], CA: [-106.3, 56.1], MX: [-102.5, 23.6],
  BR: [-51.9, -14.2], AR: [-63.6, -38.4], CL: [-71.5, -35.7],
  CN: [104.2, 35.9], JP: [138.3, 36.2], KR: [128.0, 36.0], IN: [78.9, 20.6],
  AU: [133.8, -25.3], NZ: [174.9, -40.9],
  ZA: [22.9, -30.6], EG: [30.8, 26.8], NG: [8.7, 9.1],
  TR: [35.2, 38.9], AE: [53.8, 23.4], SA: [45.1, 23.9]
};

interface CountryDominationLayer3DProps {
  map: MLMap | null;
  enabled?: boolean;
  minZoom?: number; // Default 4 - visibile solo da questo zoom in poi
}

const CountryDominationLayer3D: React.FC<CountryDominationLayer3DProps> = ({
  map,
  enabled = true,
  minZoom = 4
}) => {
  const { dominationStates, conqueredCountries, contestedCountries, loading } = useCountryDomination();
  const layersAddedRef = useRef(false);
  const geoJsonLoadedRef = useRef(false);

  // Generate GeoJSON features for labels
  const labelFeatures = useMemo(() => {
    return dominationStates
      .filter(state => state.status === 'conquered' && state.owner_name)
      .map(state => {
        const centroid = COUNTRY_CENTROIDS[state.country_code];
        if (!centroid) return null;
        
        return {
          type: 'Feature' as const,
          properties: {
            country_code: state.country_code,
            country_name: COUNTRY_NAMES[state.country_code] || state.country_code,
            owner_name: state.owner_name,
            owner_agent_code: state.owner_agent_code
          },
          geometry: {
            type: 'Point' as const,
            coordinates: centroid
          }
        };
      })
      .filter(Boolean);
  }, [dominationStates]);

  // Load country boundaries GeoJSON
  useEffect(() => {
    if (!map || !enabled || geoJsonLoadedRef.current) return;

    const loadGeoJson = async () => {
      try {
        // Check if Natural Earth source already exists in map style
        if (map.getSource('countries')) {
          console.log('[Domination] Using existing countries source');
          geoJsonLoadedRef.current = true;
          return;
        }

        // Load Natural Earth 110m countries (simplified)
        // Using a CDN hosted version for simplicity
        const response = await fetch(
          'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson'
        );
        
        if (!response.ok) {
          throw new Error('Failed to load countries GeoJSON');
        }

        const countriesGeoJson = await response.json();
        console.log('[Domination] Loaded countries GeoJSON:', countriesGeoJson.features?.length, 'countries');

        // Add source if map is still valid
        if (map && !map.getSource(SOURCE_ID)) {
          map.addSource(SOURCE_ID, {
            type: 'geojson',
            data: countriesGeoJson
          });
          geoJsonLoadedRef.current = true;
        }
      } catch (err) {
        console.error('[Domination] GeoJSON load error:', err);
      }
    };

    if (map.isStyleLoaded()) {
      loadGeoJson();
    } else {
      map.once('styledata', loadGeoJson);
    }
  }, [map, enabled]);

  // Add/update layers
  useEffect(() => {
    if (!map || !enabled || !geoJsonLoadedRef.current) return;

    const setupLayers = () => {
      const source = map.getSource(SOURCE_ID);
      if (!source) return;

      // Conquered fill layer (neon green)
      if (!map.getLayer(CONQUERED_FILL_LAYER)) {
        map.addLayer({
          id: CONQUERED_FILL_LAYER,
          type: 'fill',
          source: SOURCE_ID,
          minzoom: minZoom,
          paint: {
            'fill-color': '#00FF00', // Neon green
            'fill-opacity': [
              'case',
              ['in', ['get', 'ISO_A2'], ['literal', conqueredCountries]],
              0.25,
              0
            ]
          },
          filter: ['in', ['get', 'ISO_A2'], ['literal', conqueredCountries.length > 0 ? conqueredCountries : ['']]]
        });
        console.log('[Domination] Added conquered fill layer');
      }

      // Contested fill layer (amber)
      if (!map.getLayer(CONTESTED_FILL_LAYER)) {
        map.addLayer({
          id: CONTESTED_FILL_LAYER,
          type: 'fill',
          source: SOURCE_ID,
          minzoom: minZoom,
          paint: {
            'fill-color': '#FFA500', // Amber
            'fill-opacity': 0.18
          },
          filter: ['in', ['get', 'ISO_A2'], ['literal', contestedCountries.length > 0 ? contestedCountries : ['']]]
        });
        console.log('[Domination] Added contested fill layer');
      }

      // Conquered outline layer
      if (!map.getLayer(CONQUERED_LINE_LAYER)) {
        map.addLayer({
          id: CONQUERED_LINE_LAYER,
          type: 'line',
          source: SOURCE_ID,
          minzoom: minZoom,
          paint: {
            'line-color': '#00FF00',
            'line-width': 2,
            'line-opacity': 0.8
          },
          filter: ['in', ['get', 'ISO_A2'], ['literal', conqueredCountries.length > 0 ? conqueredCountries : ['']]]
        });
        console.log('[Domination] Added conquered line layer');
      }

      layersAddedRef.current = true;
    };

    if (map.isStyleLoaded()) {
      setupLayers();
    } else {
      map.once('styledata', setupLayers);
    }

    return () => {
      // Cleanup on unmount (optional - layers will persist)
    };
  }, [map, enabled, geoJsonLoadedRef.current, minZoom]);

  // Update filters when domination states change
  useEffect(() => {
    if (!map || !layersAddedRef.current) return;

    try {
      // Update conquered filter
      if (map.getLayer(CONQUERED_FILL_LAYER)) {
        const conqueredFilter = conqueredCountries.length > 0 
          ? ['in', ['get', 'ISO_A2'], ['literal', conqueredCountries]]
          : ['==', ['get', 'ISO_A2'], ''];
        
        map.setFilter(CONQUERED_FILL_LAYER, conqueredFilter);
        map.setFilter(CONQUERED_LINE_LAYER, conqueredFilter);
      }

      // Update contested filter
      if (map.getLayer(CONTESTED_FILL_LAYER)) {
        const contestedFilter = contestedCountries.length > 0
          ? ['in', ['get', 'ISO_A2'], ['literal', contestedCountries]]
          : ['==', ['get', 'ISO_A2'], ''];
        
        map.setFilter(CONTESTED_FILL_LAYER, contestedFilter);
      }

      console.log('[Domination] Updated filters:', {
        conquered: conqueredCountries.length,
        contested: contestedCountries.length
      });
    } catch (err) {
      console.error('[Domination] Filter update error:', err);
    }
  }, [map, conqueredCountries, contestedCountries]);

  // Add label source and layer
  useEffect(() => {
    if (!map || !enabled || labelFeatures.length === 0) return;

    const labelSourceId = 'domination-labels-source';

    const setupLabels = () => {
      // Add/update label source
      const labelGeoJson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: labelFeatures as any[]
      };

      if (map.getSource(labelSourceId)) {
        (map.getSource(labelSourceId) as any).setData(labelGeoJson);
      } else {
        map.addSource(labelSourceId, {
          type: 'geojson',
          data: labelGeoJson
        });
      }

      // Add label layer
      if (!map.getLayer(LABEL_LAYER)) {
        map.addLayer({
          id: LABEL_LAYER,
          type: 'symbol',
          source: labelSourceId,
          minzoom: minZoom,
          layout: {
            'text-field': ['concat', '👑 ', ['get', 'owner_name']],
            'text-size': 12,
            'text-anchor': 'center',
            'text-allow-overlap': true
          },
          paint: {
            'text-color': '#00FF00',
            'text-halo-color': '#000000',
            'text-halo-width': 2
          }
        });
        console.log('[Domination] Added label layer');
      }
    };

    if (map.isStyleLoaded()) {
      setupLabels();
    } else {
      map.once('styledata', setupLabels);
    }
  }, [map, enabled, labelFeatures, minZoom]);

  // Component doesn't render visible DOM
  return null;
};

export default CountryDominationLayer3D;

