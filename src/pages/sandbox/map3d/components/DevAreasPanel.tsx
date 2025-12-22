// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// DevAreasPanel.tsx - Modal popup with Tabs for Punti/Aree
// Uses official GlassModal pattern for M1SSION™ consistent UX
// BUG FIX: Radius picker is now INLINE (no modal), points render on map

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import maplibregl from 'maplibre-gl';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2, Plus, Target, Crosshair, Edit2, Save, X, ChevronLeft } from 'lucide-react';
import { GlassModal } from '@/components/ui/GlassModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { toast } from 'sonner';

interface DevAreasPanelProps {
  map: MLMap | null;
  searchAreas: { id: string; lat: number; lng: number; radius: number; label?: string }[];
  onDelete: (id: string) => Promise<boolean> | void;
  onFocus: (id: string | null) => void;
  onAddArea: (radius?: number) => void;
  onCreateAreaDirect?: (radius: number, lat: number, lng: number) => void;
}

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  note: string;
  created_at?: string;
}

const DevAreasPanel: React.FC<DevAreasPanelProps> = ({ 
  map, 
  searchAreas, 
  onDelete, 
  onFocus, 
  onAddArea,
  onCreateAreaDirect
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('aree');
  
  // INLINE radius picker state (no modal)
  const [showRadiusPickerInline, setShowRadiusPickerInline] = useState<boolean>(false);
  const [selectedRadius, setSelectedRadius] = useState<number>(500);
  const [radiusMode, setRadiusMode] = useState<'radius' | 'diameter'>('radius');
  const [isWaitingForMapClick, setIsWaitingForMapClick] = useState<boolean>(false);
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [customRadiusValue, setCustomRadiusValue] = useState<string>('');
  
  // Map Points state
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [loadingPoints, setLoadingPoints] = useState<boolean>(false);
  const [isAddingPoint, setIsAddingPoint] = useState<boolean>(false);
  const [editingPointId, setEditingPointId] = useState<string | null>(null);
  const [editPointTitle, setEditPointTitle] = useState<string>('');
  const [editPointNote, setEditPointNote] = useState<string>('');
  
  // MapLibre markers ref for cleanup
  const markersRef = useRef<maplibregl.Marker[]>([]);
  // Search area circle overlays ref
  const areaOverlaysRef = useRef<HTMLDivElement[]>([]);
  
  const { user, isAuthenticated } = useUnifiedAuth();

  const radiusOptions = [
    { value: 250, label: '250m' },
    { value: 500, label: '500m' },
    { value: 1000, label: '1km' },
    { value: 2000, label: '2km' },
    { value: 5000, label: '5km' }
  ];

  // Load map points from Supabase
  const loadMapPoints = useCallback(async () => {
    if (!user?.id) return;
    
    setLoadingPoints(true);
    try {
      const { data, error } = await supabase
        .from('map_points')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMapPoints((data || []).map(point => ({
        id: point.id,
        lat: point.latitude,
        lng: point.longitude,
        title: point.title || '',
        note: point.note || '',
        created_at: point.created_at
      })));
    } catch (error) {
      console.error('[DevAreasPanel] Error loading map points:', error);
      toast.error('Errore nel caricare i punti');
    } finally {
      setLoadingPoints(false);
    }
  }, [user?.id]);

  // Load points when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      loadMapPoints();
    }
  }, [user?.id, loadMapPoints]);

  // Load points when modal opens on Punti tab
  useEffect(() => {
    if (open && activeTab === 'punti' && user?.id) {
      loadMapPoints();
    }
  }, [open, activeTab, user?.id, loadMapPoints]);

  // 🔥 BUG FIX 2: Render points on map using MapLibre markers
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each point
    mapPoints.forEach(point => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'm1-point-marker';
      el.innerHTML = `
        <div style="
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #00D1FF 0%, #7B2EFF 100%);
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 209, 255, 0.5), 0 0 16px rgba(123, 46, 255, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;

      // Create popup
      const popup = new maplibregl.Popup({ 
        offset: 25,
        closeButton: true,
        className: 'm1-point-popup'
      }).setHTML(`
        <div style="padding: 8px; max-width: 200px;">
          <div style="font-weight: 600; color: #00D1FF; margin-bottom: 4px;">
            ${point.title || 'Punto senza titolo'}
          </div>
          ${point.note ? `<div style="font-size: 12px; color: #888;">${point.note}</div>` : ''}
        </div>
      `);

      // Create marker
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([point.lng, point.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });

    console.log('[DevAreasPanel] Rendered', mapPoints.length, 'point markers on map');

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [map, mapPoints]);

  // 🔥 BUG FIX: Render search areas as DOM Circle overlays (guaranteed visible)
  useEffect(() => {
    if (!map) return;

    // Remove existing area overlays
    areaOverlaysRef.current.forEach(el => el.remove());
    areaOverlaysRef.current = [];

    // Function to update overlay positions
    const updateOverlayPositions = () => {
      searchAreas.forEach((area, index) => {
        const el = areaOverlaysRef.current[index];
        if (!el) return;

        const center = map.project([area.lng, area.lat]);
        
        // Calculate pixel radius based on zoom
        const radiusKm = area.radius / 1000;
        const latRad = area.lat * Math.PI / 180;
        const metersPerPixel = 156543.03392 * Math.cos(latRad) / Math.pow(2, map.getZoom());
        const pixelRadius = (radiusKm * 1000) / metersPerPixel;

        el.style.left = `${center.x - pixelRadius}px`;
        el.style.top = `${center.y - pixelRadius}px`;
        el.style.width = `${pixelRadius * 2}px`;
        el.style.height = `${pixelRadius * 2}px`;
      });
    };

    // Create circle overlay for each search area
    searchAreas.forEach((area, index) => {
      const el = document.createElement('div');
      el.className = 'm1-search-area-circle';
      el.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(123, 46, 255, 0.15);
        border: 3px solid #7B2EFF;
        box-shadow: 0 0 20px rgba(123, 46, 255, 0.4), inset 0 0 30px rgba(123, 46, 255, 0.1);
        pointer-events: none;
        transition: transform 0.1s ease-out;
        z-index: 1;
      `;
      
      // Get the map canvas container
      const mapContainer = map.getCanvasContainer();
      mapContainer.appendChild(el);
      areaOverlaysRef.current.push(el);
    });

    // Initial position update
    updateOverlayPositions();

    // Update positions on map move/zoom
    map.on('move', updateOverlayPositions);
    map.on('zoom', updateOverlayPositions);
    map.on('pitch', updateOverlayPositions);
    map.on('rotate', updateOverlayPositions);

    console.log('[DevAreasPanel] Rendered', searchAreas.length, 'search area circles on map');

    return () => {
      map.off('move', updateOverlayPositions);
      map.off('zoom', updateOverlayPositions);
      map.off('pitch', updateOverlayPositions);
      map.off('rotate', updateOverlayPositions);
      areaOverlaysRef.current.forEach(el => el.remove());
      areaOverlaysRef.current = [];
    };
  }, [map, searchAreas]);

  // Listen for map click when adding point
  useEffect(() => {
    if (!map || !isAddingPoint) return;

    const handleMapClick = async (e: any) => {
      if (!isAddingPoint || !user?.id) return;

      const { lng, lat } = e.lngLat;
      
      try {
        const { data, error } = await supabase
          .from('map_points')
          .insert({
            user_id: user.id,
            latitude: lat,
            longitude: lng,
            title: 'Nuovo punto',
            note: ''
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const newPoint = {
            id: data.id,
            lat: data.latitude,
            lng: data.longitude,
            title: data.title || '',
            note: data.note || '',
            created_at: data.created_at
          };
          
          setMapPoints(prev => [newPoint, ...prev]);
          
          // Open modal and start editing the new point
          setOpen(true);
          setActiveTab('punti');
          setEditingPointId(data.id);
          setEditPointTitle(data.title || 'Nuovo punto');
          setEditPointNote('');
          
          toast.success('Punto aggiunto! Modifica titolo e nota.');
        }
      } catch (error) {
        console.error('[DevAreasPanel] Error adding point:', error);
        toast.error('Errore nell\'aggiungere il punto');
      }
      
      setIsAddingPoint(false);
    };

    map.on('click', handleMapClick);
    
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, isAddingPoint, user?.id]);

  // Listen for map click when placing area center
  useEffect(() => {
    if (!map || !isWaitingForMapClick) return;

    const handleMapClick = (e: any) => {
      if (!isWaitingForMapClick) return;
      
      // 🔥 FIX: Use custom value directly if in custom mode, otherwise use selectedRadius
      let radiusValue = selectedRadius;
      if (showCustomInput && customRadiusValue) {
        const customVal = parseInt(customRadiusValue, 10);
        if (!isNaN(customVal) && customVal >= 50) {
          radiusValue = customVal;
        }
      }
      
      // Apply diameter conversion if needed
      const finalRadius = radiusMode === 'diameter' ? Math.round(radiusValue / 2) : radiusValue;
      const { lng, lat } = e.lngLat;
      
      console.log('🎯 Creating area with radius:', finalRadius, 'm (', finalRadius/1000, 'km)');
      
      // 🔥 FIX: Use direct creation if available (prevents double area bug)
      if (onCreateAreaDirect) {
        onCreateAreaDirect(finalRadius, lat, lng);
      } else {
        // Fallback to old behavior
        onAddArea(finalRadius);
      }
      
      setIsWaitingForMapClick(false);
      setShowCustomInput(false);
      setCustomRadiusValue('');
      toast.success(`Area creata! Raggio: ${(finalRadius/1000).toFixed(1)} km`);
    };

    map.on('click', handleMapClick);
    
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, isWaitingForMapClick, selectedRadius, radiusMode, onAddArea, onCreateAreaDirect, showCustomInput, customRadiusValue]);

  // Start adding point mode
  const handleStartAddPoint = () => {
    setIsAddingPoint(true);
    setOpen(false); // Close modal to show map
    toast.info('Clicca sulla mappa per aggiungere un punto', { duration: 5000 });
  };

  // Update point
  const handleUpdatePoint = async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('map_points')
        .update({ 
          title: editPointTitle.trim() || 'Punto senza titolo',
          note: editPointNote.trim()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setMapPoints(prev => prev.map(point => 
        point.id === id 
          ? { ...point, title: editPointTitle.trim() || 'Punto senza titolo', note: editPointNote.trim() } 
          : point
      ));
      setEditingPointId(null);
      setEditPointTitle('');
      setEditPointNote('');
      toast.success('Punto aggiornato');
    } catch (error) {
      console.error('[DevAreasPanel] Error updating point:', error);
      toast.error('Errore nell\'aggiornare il punto');
    }
  };

  // Delete point
  const handleDeletePoint = async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('map_points')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setMapPoints(prev => prev.filter(point => point.id !== id));
      toast.success('Punto eliminato');
    } catch (error) {
      console.error('[DevAreasPanel] Error deleting point:', error);
      toast.error('Errore nell\'eliminare il punto');
    }
  };

  // Focus on point in map
  const flyToPoint = (point: MapPoint) => {
    if (!map) return;
    map.flyTo({ center: [point.lng, point.lat], zoom: Math.max(map.getZoom(), 16), duration: 800 });
  };

  // Area functions - INLINE (no modal)
  const handleAddAreaClick = () => {
    setSelectedRadius(500);
    setRadiusMode('radius');
    setShowRadiusPickerInline(true);
  };

  const handleConfirmRadiusInline = () => {
    setShowRadiusPickerInline(false);
    setIsWaitingForMapClick(true);
    setOpen(false); // Close modal to allow map interaction
    toast.info('Tocca sulla mappa per posizionare il centro dell\'area', { duration: 5000 });
  };

  const handleCancelRadiusPicker = () => {
    setShowRadiusPickerInline(false);
  };

  const flyToArea = (a: { lat: number; lng: number }) => {
    if (!map) return;
    map.flyTo({ center: [a.lng, a.lat], zoom: Math.max(map.getZoom(), 15), duration: 800 });
  };

  const totalCount = (searchAreas?.length || 0) + mapPoints.length;

  return (
    <>
      {/* Pill Button - Fixed position */}
      <div
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 34px) + 80px)',
          right: 12,
          zIndex: 1002,
          pointerEvents: 'auto',
        }}
      >
        <div
          className="m1x-pill m1x-pill--areas"
          onClick={() => setOpen(true)}
          title="Punti/Aree"
          style={{ transform: 'scale(0.75)' }}
        >
          <div className="m1x-pill__icon">
            <MapPin className="h-5 w-5 text-purple-400" />
          </div>
          <div className="m1x-pill__label">
            Punti/Aree ({totalCount})
          </div>
        </div>
      </div>

      {/* GlassModal - Official M1SSION Pattern */}
      <GlassModal
        isOpen={open}
        onClose={() => { setOpen(false); setShowRadiusPickerInline(false); }}
        title="PUNTI E AREE"
        subtitle="Gestisci i tuoi punti di interesse"
        accentColor="#7B2EFF"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#0a0a0a] border border-white/10 rounded-xl p-1 mb-4">
            <TabsTrigger 
              value="aree" 
              className="rounded-lg data-[state=active]:bg-[#7B2EFF] data-[state=active]:text-white text-white/60 font-medium transition-all"
            >
              <Target className="h-4 w-4 mr-2" />
              Aree ({searchAreas?.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="punti"
              className="rounded-lg data-[state=active]:bg-[#00D1FF] data-[state=active]:text-black text-white/60 font-medium transition-all"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Punti ({mapPoints.length})
            </TabsTrigger>
          </TabsList>

          {/* AREE Tab */}
          <TabsContent value="aree" className="mt-0 space-y-4">
            {/* INLINE Radius Picker (BUG FIX 1: No more modal!) */}
            {showRadiusPickerInline ? (
              <div className="space-y-4 p-4 bg-[#0a0a0a] border border-white/10 rounded-xl">
                {/* Back button + Title */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancelRadiusPicker}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 text-white" />
                  </button>
                  <span className="text-white font-medium">Seleziona dimensione area</span>
                </div>
                
                {/* Radius/Diameter Toggle */}
                <div className="flex justify-center">
                  <div className="bg-black/50 border border-white/10 rounded-xl p-1 flex gap-1">
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        radiusMode === 'radius' 
                          ? 'bg-[#7B2EFF] text-white' 
                          : 'text-white/50 hover:text-white'
                      }`}
                      onClick={() => setRadiusMode('radius')}
                    >
                      Raggio
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        radiusMode === 'diameter' 
                          ? 'bg-[#7B2EFF] text-white' 
                          : 'text-white/50 hover:text-white'
                      }`}
                      onClick={() => setRadiusMode('diameter')}
                    >
                      Diametro
                    </button>
                  </div>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {radiusOptions.map(option => {
                    const displayValue = radiusMode === 'diameter' ? option.value * 2 : option.value;
                    const displayLabel = displayValue >= 1000 
                      ? `${(displayValue / 1000).toFixed(displayValue % 1000 === 0 ? 0 : 1)}km` 
                      : `${displayValue}m`;
                    
                    return (
                      <button
                        key={option.value}
                        className={`p-3 rounded-xl text-center transition-all font-medium text-sm ${
                          selectedRadius === option.value && !showCustomInput
                            ? 'bg-[#7B2EFF] text-white shadow-lg shadow-[#7B2EFF]/30'
                            : 'bg-black/30 border border-white/10 text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                        onClick={() => {
                          setSelectedRadius(option.value);
                          setShowCustomInput(false);
                          setCustomRadiusValue('');
                        }}
                      >
                        {displayLabel}
                      </button>
                    );
                  })}
                  
                  {/* Custom Input Button */}
                  <button
                    className={`p-3 rounded-xl text-center transition-all font-medium text-sm ${
                      showCustomInput
                        ? 'bg-[#7B2EFF] text-white shadow-lg shadow-[#7B2EFF]/30'
                        : 'bg-black/30 border border-white/10 text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                    onClick={() => setShowCustomInput(true)}
                  >
                    ✏️ Custom
                  </button>
                </div>

                {/* Custom Radius/Diameter Input */}
                {showCustomInput && (
                  <div className="mt-3 p-3 bg-black/40 border border-[#7B2EFF]/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="50"
                        step="100"
                        className="flex-1 p-3 bg-black/50 border border-[#7B2EFF]/40 rounded-xl text-white text-sm font-medium text-center focus:outline-none focus:border-[#7B2EFF] transition-colors"
                        placeholder={radiusMode === 'diameter' ? 'Diametro in metri' : 'Raggio in metri'}
                        value={customRadiusValue}
                        onChange={(e) => {
                          setCustomRadiusValue(e.target.value);
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 50) {
                            // Update selectedRadius for preview (no max limit)
                            setSelectedRadius(radiusMode === 'diameter' ? Math.round(val / 2) : val);
                          }
                        }}
                        autoFocus
                      />
                      <span className="text-white/50 text-sm font-medium min-w-[20px]">m</span>
                    </div>
                    <div className="text-xs text-white/40 mt-2 text-center">
                      Min: 50m • Es: 5000m = 5km, 50000m = 50km
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleCancelRadiusPicker}
                    className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-xl h-10"
                  >
                    Annulla
                  </Button>
                  <Button
                    onClick={handleConfirmRadiusInline}
                    className="flex-1 bg-[#7B2EFF] hover:bg-[#7B2EFF]/80 text-white font-semibold rounded-xl h-10"
                  >
                    Conferma
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleAddAreaClick}
                  className="w-full bg-[#7B2EFF] hover:bg-[#7B2EFF]/80 text-white font-semibold rounded-xl h-11"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuova area di ricerca
                </Button>

                <div className="space-y-3">
                  {(!searchAreas || searchAreas.length === 0) ? (
                    <div className="text-center text-white/50 py-6 text-sm">
                      Nessuna area. Clicca "Nuova" e poi tocca sulla mappa.
                    </div>
                  ) : (
                    searchAreas.map(area => (
                      <div 
                        key={area.id} 
                        className="p-3 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white text-sm">
                              {area.label || 'Area di ricerca'}
                            </div>
                            <div className="text-xs text-white/50 mt-0.5">
                              Raggio: {(area.radius / 1000).toFixed(1)} km
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { onFocus(area.id); flyToArea(area); }}
                              className="h-8 px-3 text-[#7B2EFF] hover:text-[#7B2EFF] hover:bg-[#7B2EFF]/10 rounded-lg text-xs font-medium"
                            >
                              <Crosshair className="h-3 w-3 mr-1" />
                              Focus
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDelete(area.id)}
                              className="h-8 px-3 text-red-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-medium"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* PUNTI Tab */}
          <TabsContent value="punti" className="mt-0 space-y-4">
            <Button
              onClick={handleStartAddPoint}
              disabled={!isAuthenticated}
              className="w-full bg-[#00D1FF] hover:bg-[#00D1FF]/80 text-black font-semibold rounded-xl h-11"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi punto sulla mappa
            </Button>

            <div className="space-y-3">
              {!isAuthenticated ? (
                <div className="text-center text-white/50 py-6 text-sm">
                  Accedi per salvare i tuoi punti.
                </div>
              ) : loadingPoints ? (
                <div className="text-center text-white/50 py-6 text-sm">
                  <div className="inline-block w-5 h-5 border-2 border-[#00D1FF] border-t-transparent rounded-full animate-spin mb-2" />
                  <div>Caricamento...</div>
                </div>
              ) : mapPoints.length === 0 ? (
                <div className="text-center text-white/50 py-6 text-sm">
                  Nessun punto salvato. Clicca "Aggiungi" e poi tocca sulla mappa.
                </div>
              ) : (
                mapPoints.map(point => (
                  <div 
                    key={point.id} 
                    className="p-3 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                  >
                    {editingPointId === point.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          className="w-full p-3 bg-black/50 border border-[#00D1FF]/30 rounded-xl text-white text-sm focus:outline-none focus:border-[#00D1FF]/60 transition-colors"
                          placeholder="Titolo del punto"
                          value={editPointTitle}
                          onChange={(e) => setEditPointTitle(e.target.value)}
                          autoFocus
                        />
                        <textarea
                          className="w-full h-20 p-3 bg-black/50 border border-[#00D1FF]/30 rounded-xl text-white text-sm resize-none focus:outline-none focus:border-[#00D1FF]/60 transition-colors"
                          placeholder="Note sul punto..."
                          value={editPointNote}
                          onChange={(e) => setEditPointNote(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdatePoint(point.id)}
                            className="flex-1 bg-[#00D1FF] hover:bg-[#00D1FF]/80 text-black font-semibold rounded-lg h-9"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Salva
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setEditingPointId(null); setEditPointTitle(''); setEditPointNote(''); }}
                            className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-lg h-9"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Annulla
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="font-medium text-white text-sm">
                              {point.title || 'Punto senza titolo'}
                            </div>
                            {point.note && (
                              <div className="text-xs text-white/50 mt-1 line-clamp-2">
                                {point.note}
                              </div>
                            )}
                            <div className="text-xs text-white/30 mt-1 font-mono">
                              {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => flyToPoint(point)}
                            className="h-8 px-3 text-[#00D1FF] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10 rounded-lg text-xs font-medium"
                          >
                            <Crosshair className="h-3 w-3 mr-1" />
                            Focus
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { 
                              setEditingPointId(point.id); 
                              setEditPointTitle(point.title); 
                              setEditPointNote(point.note || ''); 
                            }}
                            className="h-8 px-3 text-[#00D1FF] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10 rounded-lg text-xs font-medium"
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Modifica
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeletePoint(point.id)}
                            className="h-8 px-3 text-red-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-medium"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </GlassModal>

      {/* Adding Point Mode Indicator */}
      {isAddingPoint && (
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1003,
            pointerEvents: 'none',
          }}
        >
          <div 
            style={{
              background: 'linear-gradient(180deg, rgba(28, 32, 52, 0.95) 0%, rgba(20, 24, 44, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 209, 255, 0.3)',
              borderRadius: '16px',
              padding: '12px 24px',
              boxShadow: '0 8px 32px rgba(0, 209, 255, 0.2)',
            }}
            className="text-[#00D1FF] text-sm font-medium animate-pulse"
          >
            Tocca sulla mappa per piazzare il punto
          </div>
        </div>
      )}

      {/* Adding Area Mode Indicator */}
      {isWaitingForMapClick && (
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1003,
            pointerEvents: 'none',
          }}
        >
          <div 
            style={{
              background: 'linear-gradient(180deg, rgba(28, 32, 52, 0.95) 0%, rgba(20, 24, 44, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(123, 46, 255, 0.3)',
              borderRadius: '16px',
              padding: '12px 24px',
              boxShadow: '0 8px 32px rgba(123, 46, 255, 0.2)',
            }}
            className="text-[#7B2EFF] text-sm font-medium animate-pulse"
          >
            Tocca sulla mappa per posizionare l'area
          </div>
        </div>
      )}
    </>
  );
};

export default DevAreasPanel;
