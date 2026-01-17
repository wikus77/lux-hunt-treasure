/**
 * Risiko Domination - Country Overlay Layer for MapLibre
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Renderizza:
 * - Fill colorato per paesi conquistati (colore UNICO per ogni owner!)
 * - Fill ambra per paesi contested
 * - Label con nome owner
 */

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { useCountryDomination } from '../hooks/useCountryDomination';
import { COUNTRY_NAMES } from '@/lib/domination/continentMapping';

// Layer IDs
const SOURCE_ID = 'country-domination-source';
const LABEL_SOURCE_ID = 'domination-labels-source';
const CONTESTED_FILL_LAYER = 'country-domination-contested-fill';
const LABEL_LAYER = 'country-domination-label';

// 🎨 ID ADMIN (MCP) - Colore verde fisso
const ADMIN_OWNER_ID = '495246c1-9154-4f01-a428-7f37fe230180';

// Country centroids for labels - COMPLETE per tutti i paesi
const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  // MICROSTATI
  MC: [7.4, 43.7], VA: [12.5, 41.9], SM: [12.4, 43.9], LI: [9.5, 47.2], AD: [1.5, 42.5],
  MT: [14.4, 35.9], LU: [6.1, 49.8], SG: [103.8, 1.4], HK: [114.2, 22.3], MO: [113.5, 22.2],
  // EUROPA
  IT: [12.5, 42.5], FR: [2.2, 46.2], DE: [10.4, 51.2], ES: [-3.7, 40.4],
  PT: [-8.2, 39.4], GB: [-1.2, 52.4], NL: [5.3, 52.1], BE: [4.5, 50.5],
  AT: [14.6, 47.5], CH: [8.2, 46.8], PL: [19.1, 51.9], CZ: [15.5, 49.8],
  HU: [19.5, 47.2], RO: [25.0, 46.0], GR: [21.8, 39.1], SE: [18.6, 60.1],
  NO: [8.5, 60.5], DK: [9.5, 56.3], FI: [26.0, 64.0], IE: [-8.2, 53.4],
  SI: [14.8, 46.1], HR: [15.5, 45.2], BA: [17.8, 43.9], RS: [21.0, 44.0],
  ME: [19.3, 42.7], XK: [20.9, 42.6], AL: [20.0, 41.0], MK: [21.7, 41.5],
  EE: [25.0, 59.0], LV: [24.6, 57.0], LT: [24.0, 55.2], CY: [33.4, 35.1],
  SK: [19.5, 48.7], IS: [-19.0, 65.0], MD: [28.8, 47.0], BY: [27.9, 53.7],
  BG: [25.5, 42.7], UA: [31.2, 48.4], RU: [105.3, 61.5],
  // AMERICHE
  US: [-98.6, 39.8], CA: [-106.3, 56.1], MX: [-102.5, 23.6],
  BR: [-51.9, -14.2], AR: [-63.6, -38.4], CL: [-71.5, -35.7],
  CO: [-74.3, 4.6], VE: [-66.6, 6.4], PE: [-75.0, -9.2],
  EC: [-78.2, -1.8], BO: [-65.0, -17.0], PY: [-58.4, -23.4], UY: [-55.8, -32.5],
  CU: [-77.8, 21.5], DO: [-70.2, 18.7], HT: [-72.3, 19.0], JM: [-77.3, 18.1],
  PR: [-66.6, 18.2], GT: [-90.2, 15.8], BZ: [-88.5, 17.2], HN: [-86.2, 15.0],
  SV: [-88.9, 13.8], NI: [-85.2, 12.9], CR: [-84.0, 9.7], PA: [-80.8, 8.4],
  // ASIA
  CN: [104.2, 35.9], JP: [138.3, 36.2], KR: [128.0, 36.0], KP: [127.5, 40.3],
  TW: [121.0, 23.7], IN: [78.9, 20.6], PK: [69.3, 30.4], BD: [90.4, 23.7],
  NP: [84.1, 28.4], LK: [80.8, 7.9], MM: [96.0, 21.9], TH: [100.5, 15.9],
  VN: [108.3, 14.1], MY: [101.7, 4.2], ID: [113.9, -0.8], PH: [121.8, 12.9],
  MN: [103.8, 46.9], KZ: [66.9, 48.0],
  // MEDIO ORIENTE
  IL: [35.0, 31.5], LB: [35.8, 33.9], JO: [36.2, 31.2], QA: [51.2, 25.4],
  KW: [47.5, 29.3], AE: [53.8, 23.4], OM: [55.9, 21.5], SA: [45.1, 23.9],
  IR: [53.7, 32.4], IQ: [43.7, 33.2], SY: [38.9, 35.0], YE: [48.5, 15.6],
  AF: [67.7, 33.9], TR: [35.2, 38.9],
  // AFRICA
  MA: [-7.1, 31.8], DZ: [1.7, 28.0], TN: [9.5, 34.0], LY: [17.2, 26.3],
  EG: [30.8, 26.8], ZA: [22.9, -30.6], NG: [8.7, 9.1], KE: [38.0, -0.0],
  ET: [40.5, 9.1], TZ: [34.9, -6.4], GH: [-1.0, 7.9], SN: [-14.5, 14.5],
  CI: [-5.5, 7.5], CM: [12.4, 6.0],
  // OCEANIA
  AU: [133.8, -25.3], NZ: [174.9, -40.9]
};

// 🎨 Genera colore unico dall'owner_id usando HSL
function generateOwnerColor(ownerId: string | null): string {
  // Admin (MCP) = sempre VERDE
  if (!ownerId || ownerId === ADMIN_OWNER_ID) {
    return '#00FF00';
  }
  
  // Genera hue dall'hash dell'UUID
  let hash = 0;
  for (let i = 0; i < ownerId.length; i++) {
    hash = ((hash << 5) - hash) + ownerId.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Hue: 0-360, evita il verde (100-140) che è riservato all'admin
  let hue = Math.abs(hash) % 320; // 320 valori possibili
  if (hue >= 100) hue += 40; // Salta il range verde
  
  // Saturation 100%, Lightness 50% per colori vivaci
  return `hsl(${hue}, 100%, 50%)`;
}

interface CountryDominationLayer3DProps {
  map: MLMap | null;
  enabled?: boolean;
  minZoom?: number;
}

const CountryDominationLayer3D: React.FC<CountryDominationLayer3DProps> = ({
  map,
  enabled = true,
  minZoom = 4
}) => {
  const { dominationStates, contestedCountries } = useCountryDomination();
  const geoJsonCacheRef = useRef<any>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const addedLayersRef = useRef<Set<string>>(new Set());

  // 🎨 Raggruppa paesi conquistati per owner
  const conqueredByOwner = useMemo(() => {
    const grouped: Record<string, { countries: string[], color: string }> = {};
    
    dominationStates
      .filter(s => s.status === 'conquered')
      .forEach(s => {
        const ownerId = s.owner_id || 'unknown';
        if (!grouped[ownerId]) {
          grouped[ownerId] = {
            countries: [],
            color: generateOwnerColor(s.owner_id)
          };
        }
        grouped[ownerId].countries.push(s.country_code);
      });
    
    return grouped;
  }, [dominationStates]);

  // Create filter for country matching - COMPLETE mappature
  const createCountryFilter = useCallback((countryCodes: string[]): any => {
    if (countryCodes.length === 0) {
      return ['==', ['get', 'ISO_A2'], '__NONE__'];
    }
    
    // Mappatura ISO -> nomi GeoJSON (inglese + varianti)
    const countryNames: Record<string, string[]> = {
      // MICROSTATI
      'MC': ['Monaco'], 'VA': ['Vatican', 'Holy See'], 'SM': ['San Marino'],
      'LI': ['Liechtenstein'], 'AD': ['Andorra'], 'MT': ['Malta'],
      'LU': ['Luxembourg'], 'SG': ['Singapore'], 'HK': ['Hong Kong'],
      // EUROPA
      'IT': ['Italy'], 'FR': ['France'], 'DE': ['Germany'],
      'ES': ['Spain'], 'PT': ['Portugal'], 'GB': ['United Kingdom'],
      'NL': ['Netherlands'], 'BE': ['Belgium'], 'AT': ['Austria'],
      'CH': ['Switzerland'], 'PL': ['Poland'], 'CZ': ['Czech Republic', 'Czechia'],
      'HU': ['Hungary'], 'RO': ['Romania'], 'GR': ['Greece'],
      'SE': ['Sweden'], 'NO': ['Norway'], 'DK': ['Denmark'],
      'FI': ['Finland'], 'IE': ['Ireland'], 'SI': ['Slovenia'],
      'HR': ['Croatia'], 'BA': ['Bosnia and Herzegovina', 'Bosnia'],
      'RS': ['Serbia'], 'ME': ['Montenegro'], 'XK': ['Kosovo'],
      'AL': ['Albania'], 'MK': ['North Macedonia', 'Macedonia'],
      'EE': ['Estonia'], 'LV': ['Latvia'], 'LT': ['Lithuania'],
      'CY': ['Cyprus'], 'SK': ['Slovakia'], 'IS': ['Iceland'],
      'MD': ['Moldova'], 'BY': ['Belarus'], 'BG': ['Bulgaria'],
      'UA': ['Ukraine'], 'RU': ['Russia', 'Russian Federation'],
      // AMERICHE
      'US': ['United States of America', 'United States'],
      'CA': ['Canada'], 'MX': ['Mexico'], 'BR': ['Brazil'],
      'AR': ['Argentina'], 'CL': ['Chile'], 'CO': ['Colombia'],
      'VE': ['Venezuela'], 'PE': ['Peru'], 'EC': ['Ecuador'],
      'BO': ['Bolivia'], 'PY': ['Paraguay'], 'UY': ['Uruguay'],
      'CU': ['Cuba'], 'DO': ['Dominican Republic'], 'HT': ['Haiti'],
      'JM': ['Jamaica'], 'PR': ['Puerto Rico'], 'GT': ['Guatemala'],
      'BZ': ['Belize'], 'HN': ['Honduras'], 'SV': ['El Salvador'],
      'NI': ['Nicaragua'], 'CR': ['Costa Rica'], 'PA': ['Panama'],
      // ASIA
      'CN': ['China'], 'JP': ['Japan'], 'KR': ['South Korea', 'Korea, Republic of'],
      'KP': ['North Korea', 'Korea, Dem. Rep.'], 'TW': ['Taiwan'],
      'IN': ['India'], 'PK': ['Pakistan'], 'BD': ['Bangladesh'],
      'NP': ['Nepal'], 'LK': ['Sri Lanka'], 'MM': ['Myanmar', 'Burma'],
      'TH': ['Thailand'], 'VN': ['Vietnam', 'Viet Nam'], 'MY': ['Malaysia'],
      'ID': ['Indonesia'], 'PH': ['Philippines'], 'MN': ['Mongolia'],
      'KZ': ['Kazakhstan'],
      // MEDIO ORIENTE
      'IL': ['Israel'], 'LB': ['Lebanon'], 'JO': ['Jordan'],
      'QA': ['Qatar'], 'KW': ['Kuwait'], 'AE': ['United Arab Emirates'],
      'OM': ['Oman'], 'SA': ['Saudi Arabia'], 'IR': ['Iran'],
      'IQ': ['Iraq'], 'SY': ['Syria', 'Syrian Arab Republic'],
      'YE': ['Yemen'], 'AF': ['Afghanistan'], 'TR': ['Turkey'],
      // AFRICA
      'MA': ['Morocco'], 'DZ': ['Algeria'], 'TN': ['Tunisia'],
      'LY': ['Libya'], 'EG': ['Egypt'], 'ZA': ['South Africa'],
      'NG': ['Nigeria'], 'KE': ['Kenya'], 'ET': ['Ethiopia'],
      'TZ': ['Tanzania', 'United Republic of Tanzania'],
      'GH': ['Ghana'], 'SN': ['Senegal'], 'CI': ["Côte d'Ivoire", 'Ivory Coast'],
      'CM': ['Cameroon'],
      // OCEANIA
      'AU': ['Australia'], 'NZ': ['New Zealand']
    };
    
    const filters: any[] = [
      ['in', ['get', 'ISO_A2'], ['literal', countryCodes]],
      ['in', ['get', 'ISO_A2_EH'], ['literal', countryCodes]],
      ['in', ['get', 'iso_a2'], ['literal', countryCodes]],
      ['in', ['get', 'ISO'], ['literal', countryCodes]],
    ];
    
    countryCodes.forEach(code => {
      const names = countryNames[code] || [];
      names.forEach(name => {
        filters.push(['==', ['get', 'ADMIN'], name]);
        filters.push(['==', ['get', 'name'], name]);
        filters.push(['==', ['get', 'NAME'], name]);
      });
    });
    
    return ['any', ...filters] as any;
  }, []);

  // Clean up old owner layers
  const cleanupOwnerLayers = useCallback((mapInstance: MLMap) => {
    addedLayersRef.current.forEach(layerId => {
      try {
        if (mapInstance.getLayer(layerId)) {
          mapInstance.removeLayer(layerId);
        }
      } catch (e) {
        // Ignore
      }
    });
    addedLayersRef.current.clear();
  }, []);

  // Add all domination layers
  const addDominationLayers = useCallback(async (mapInstance: MLMap) => {
    try {
      // 1. Get or fetch GeoJSON
      let geoJson = geoJsonCacheRef.current;
      if (!geoJson) {
        const response = await fetch(
          'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson'
        );
        if (!response.ok) throw new Error('Failed to fetch GeoJSON');
        geoJson = await response.json();
        geoJsonCacheRef.current = geoJson;
      }

      // 2. Check if style is loaded
      if (!mapInstance.isStyleLoaded()) {
        return false;
      }

      // 3. Add source if missing
      if (!mapInstance.getSource(SOURCE_ID)) {
        mapInstance.addSource(SOURCE_ID, {
          type: 'geojson',
          data: geoJson
        });
      }

      // 4. Clean up old owner layers before adding new ones
      cleanupOwnerLayers(mapInstance);

      // 5. 🎨 Add SEPARATE layer for EACH owner with UNIQUE color!
      Object.entries(conqueredByOwner).forEach(([ownerId, data]) => {
        const fillLayerId = `country-domination-fill-${ownerId.slice(0, 8)}`;
        const lineLayerId = `country-domination-line-${ownerId.slice(0, 8)}`;
        
        // Fill layer
        if (!mapInstance.getLayer(fillLayerId)) {
          mapInstance.addLayer({
            id: fillLayerId,
            type: 'fill',
            source: SOURCE_ID,
            minzoom: minZoom,
            paint: {
              'fill-color': data.color,
              'fill-opacity': 0.15
            },
            filter: createCountryFilter(data.countries)
          } as any);
          addedLayersRef.current.add(fillLayerId);
        }

        // Line layer (border)
        if (!mapInstance.getLayer(lineLayerId)) {
          mapInstance.addLayer({
            id: lineLayerId,
            type: 'line',
            source: SOURCE_ID,
            minzoom: minZoom,
            paint: {
              'line-color': data.color,
              'line-width': 3,
              'line-opacity': 0.8
            },
            filter: createCountryFilter(data.countries)
          } as any);
          addedLayersRef.current.add(lineLayerId);
        }
      });

      // 6. Contested layer (always amber)
      if (!mapInstance.getLayer(CONTESTED_FILL_LAYER) && contestedCountries.length > 0) {
        mapInstance.addLayer({
          id: CONTESTED_FILL_LAYER,
          type: 'fill',
          source: SOURCE_ID,
          minzoom: minZoom,
          paint: {
            'fill-color': '#FFAA00',
            'fill-opacity': 0.25
          },
          filter: createCountryFilter(contestedCountries)
        } as any);
      }

      // 7. Add labels with owner color
      const labelFeatures = dominationStates
        .filter(s => s.status === 'conquered' && s.owner_name && COUNTRY_CENTROIDS[s.country_code])
        .map(s => ({
          type: 'Feature' as const,
          properties: { 
            owner_name: s.owner_name,
            color: generateOwnerColor(s.owner_id)
          },
          geometry: { type: 'Point' as const, coordinates: COUNTRY_CENTROIDS[s.country_code] }
        }));

      if (labelFeatures.length > 0) {
        if (mapInstance.getSource(LABEL_SOURCE_ID)) {
          (mapInstance.getSource(LABEL_SOURCE_ID) as any).setData({ 
            type: 'FeatureCollection', 
            features: labelFeatures 
          });
        } else {
          mapInstance.addSource(LABEL_SOURCE_ID, {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: labelFeatures }
          });
        }

        if (!mapInstance.getLayer(LABEL_LAYER)) {
          mapInstance.addLayer({
            id: LABEL_LAYER,
            type: 'symbol',
            source: LABEL_SOURCE_ID,
            minzoom: minZoom,
            layout: {
              'text-field': ['concat', '👑 ', ['get', 'owner_name']],
              'text-size': 12,
              'text-anchor': 'center',
              'text-allow-overlap': true
            },
            paint: {
              'text-color': ['get', 'color'],
              'text-halo-color': '#000000',
              'text-halo-width': 2
            }
          });
        }
      }

      return true;
    } catch (err) {
      // Silent fail - layers will be retried on next interval
      return false;
    }
  }, [minZoom, conqueredByOwner, contestedCountries, dominationStates, createCountryFilter, cleanupOwnerLayers]);

  // Main effect: continuously check and add layers if missing
  useEffect(() => {
    if (!map || !enabled) return;

    // Function to check and add layers
    const checkAndAddLayers = () => {
      if (!map || !map.isStyleLoaded()) return;
      
      // Check if source is missing (means style changed)
      const sourceExists = map.getSource(SOURCE_ID);
      
      if (!sourceExists) {
        addDominationLayers(map);
      }
    };

    // Initial setup
    if (map.isStyleLoaded()) {
      addDominationLayers(map);
    } else {
      map.once('load', () => addDominationLayers(map));
    }

    // Periodic check every 500ms to detect style changes
    checkIntervalRef.current = setInterval(checkAndAddLayers, 500);

    // Also listen for style.load event
    const handleStyleLoad = () => {
      setTimeout(() => addDominationLayers(map), 200);
    };
    map.on('style.load', handleStyleLoad);

    // Also listen for idle event after style change
    const handleIdle = () => {
      checkAndAddLayers();
    };
    map.on('idle', handleIdle);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      map.off('style.load', handleStyleLoad);
      map.off('idle', handleIdle);
    };
  }, [map, enabled, addDominationLayers]);

  // Update layers when domination data changes
  useEffect(() => {
    if (!map || !enabled || !map.isStyleLoaded()) return;
    
    // Re-add all layers with new data
    addDominationLayers(map);
  }, [map, enabled, conqueredByOwner, addDominationLayers]);

  return null;
};

export default CountryDominationLayer3D;
