// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// DevAreasPanel.tsx - Revolut-style fullscreen modal for Punti/Aree
// Jan 2026 update: Now uses MapPillFlipOverlay
// BUG FIX: Radius picker is now INLINE (no modal), points render on map

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import maplibregl from 'maplibre-gl';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2, Plus, Target, Crosshair, Edit2, Save, X, ChevronLeft } from 'lucide-react';
import { MapPillFlipOverlay } from '@/components/map/MapPillFlipOverlay';
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
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
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

  const handlePillClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOriginRect(rect);
    setOpen(true);
  };

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
          onClick={handlePillClick}
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

      {/* Revolut-style Fullscreen Modal */}
      <MapPillFlipOverlay
        open={open}
        originRect={originRect}
        onClose={() => { setOpen(false); setShowRadiusPickerInline(false); }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
          {/* HEADER */}
          <div style={{
            flexShrink: 0,
            background: 'linear-gradient(180deg, rgba(123, 46, 255, 0.8) 0%, rgba(80, 30, 180, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
            paddingBottom: '20px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <button onClick={() => { setOpen(false); setShowRadiusPickerInline(false); }} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
              </button>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>PUNTI E AREE</h1>
              </div>
              <div style={{ width: '40px' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>Gestisci i tuoi punti di interesse</p>
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', margin: '16px', gap: '8px' }}>
            <button onClick={() => setActiveTab('aree')} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: activeTab === 'aree' ? '#7B2EFF' : 'rgba(255,255,255,0.1)', border: 'none', color: activeTab === 'aree' ? '#FFFFFF' : 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Target style={{ width: '16px', height: '16px' }} /> Aree ({searchAreas?.length || 0})
            </button>
            <button onClick={() => setActiveTab('punti')} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: activeTab === 'punti' ? '#00D1FF' : 'rgba(255,255,255,0.1)', border: 'none', color: activeTab === 'punti' ? '#000000' : 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <MapPin style={{ width: '16px', height: '16px' }} /> Punti ({mapPoints.length})
            </button>
          </div>

          {/* CONTENT */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)', WebkitOverflowScrolling: 'touch' }}>

            {/* AREE Tab Content */}
            {activeTab === 'aree' && (
              <>
                {showRadiusPickerInline ? (
                  <GlassCard>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <button onClick={handleCancelRadiusPicker} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}>
                        <ChevronLeft style={{ width: '16px', height: '16px', color: '#FFFFFF' }} />
                      </button>
                      <span style={{ color: '#FFFFFF', fontWeight: 500 }}>Seleziona dimensione area</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '4px', display: 'flex', gap: '4px' }}>
                        <button onClick={() => setRadiusMode('radius')} style={{ padding: '10px 16px', borderRadius: '10px', background: radiusMode === 'radius' ? '#7B2EFF' : 'transparent', border: 'none', color: radiusMode === 'radius' ? '#FFF' : 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Raggio</button>
                        <button onClick={() => setRadiusMode('diameter')} style={{ padding: '10px 16px', borderRadius: '10px', background: radiusMode === 'diameter' ? '#7B2EFF' : 'transparent', border: 'none', color: radiusMode === 'diameter' ? '#FFF' : 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Diametro</button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                      {radiusOptions.map(option => {
                        const displayValue = radiusMode === 'diameter' ? option.value * 2 : option.value;
                        const displayLabel = displayValue >= 1000 ? `${(displayValue / 1000).toFixed(displayValue % 1000 === 0 ? 0 : 1)}km` : `${displayValue}m`;
                        const isSelected = selectedRadius === option.value && !showCustomInput;
                        return (
                          <button key={option.value} onClick={() => { setSelectedRadius(option.value); setShowCustomInput(false); setCustomRadiusValue(''); }} style={{ padding: '14px', borderRadius: '12px', background: isSelected ? '#7B2EFF' : 'rgba(0,0,0,0.3)', border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)', color: isSelected ? '#FFF' : 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', boxShadow: isSelected ? '0 0 20px rgba(123, 46, 255, 0.3)' : 'none' }}>
                            {displayLabel}
                          </button>
                        );
                      })}
                      <button onClick={() => setShowCustomInput(true)} style={{ padding: '14px', borderRadius: '12px', background: showCustomInput ? '#7B2EFF' : 'rgba(0,0,0,0.3)', border: showCustomInput ? 'none' : '1px solid rgba(255,255,255,0.1)', color: showCustomInput ? '#FFF' : 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>✏️ Custom</button>
                    </div>

                    {showCustomInput && (
                      <div style={{ padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(123,46,255,0.3)', borderRadius: '12px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input type="number" min="50" step="100" placeholder={radiusMode === 'diameter' ? 'Diametro in metri' : 'Raggio in metri'} value={customRadiusValue} onChange={(e) => { setCustomRadiusValue(e.target.value); const val = parseInt(e.target.value, 10); if (!isNaN(val) && val >= 50) { setSelectedRadius(radiusMode === 'diameter' ? Math.round(val / 2) : val); }}} autoFocus style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(123,46,255,0.4)', borderRadius: '10px', color: '#FFF', fontSize: '14px', textAlign: 'center', outline: 'none' }} />
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>m</span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '8px', textAlign: 'center' }}>Min: 50m • Es: 5000m = 5km</p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={handleCancelRadiusPicker} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', fontSize: '14px', cursor: 'pointer' }}>Annulla</button>
                      <button onClick={handleConfirmRadiusInline} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#7B2EFF', border: 'none', color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Conferma</button>
                    </div>
                  </GlassCard>
                ) : (
                  <>
                    <button onClick={handleAddAreaClick} style={{ width: '100%', padding: '14px', marginBottom: '16px', borderRadius: '12px', background: '#7B2EFF', border: 'none', color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Plus style={{ width: '16px', height: '16px' }} /> Nuova area di ricerca
                    </button>

                    {(!searchAreas || searchAreas.length === 0) ? (
                      <GlassCard><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Nessuna area. Clicca "Nuova" e poi tocca sulla mappa.</p></GlassCard>
                    ) : (
                      searchAreas.map(area => (
                        <GlassCard key={area.id} style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <p style={{ color: '#FFF', fontSize: '14px', fontWeight: 500 }}>{area.label || 'Area di ricerca'}</p>
                              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px' }}>Raggio: {(area.radius / 1000).toFixed(1)} km</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => { onFocus(area.id); flyToArea(area); }} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(123,46,255,0.1)', border: 'none', color: '#7B2EFF', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Crosshair style={{ width: '12px', height: '12px' }} /> Focus
                              </button>
                              <button onClick={() => onDelete(area.id)} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                                <Trash2 style={{ width: '12px', height: '12px' }} />
                              </button>
                            </div>
                          </div>
                        </GlassCard>
                      ))
                    )}
                  </>
                )}
              </>
            )}

            {/* PUNTI Tab Content */}
            {activeTab === 'punti' && (
              <>
                <button onClick={handleStartAddPoint} disabled={!isAuthenticated} style={{ width: '100%', padding: '14px', marginBottom: '16px', borderRadius: '12px', background: '#00D1FF', border: 'none', color: '#000', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: !isAuthenticated ? 0.5 : 1 }}>
                  <Plus style={{ width: '16px', height: '16px' }} /> Aggiungi punto sulla mappa
                </button>

                {!isAuthenticated ? (
                  <GlassCard><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Accedi per salvare i tuoi punti.</p></GlassCard>
                ) : loadingPoints ? (
                  <GlassCard style={{ textAlign: 'center', padding: '30px 0' }}>
                    <div style={{ width: '24px', height: '24px', border: '2px solid rgba(0,209,255,0.3)', borderTopColor: '#00D1FF', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Caricamento...</p>
                  </GlassCard>
                ) : mapPoints.length === 0 ? (
                  <GlassCard><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Nessun punto salvato. Clicca "Aggiungi" e poi tocca sulla mappa.</p></GlassCard>
                ) : (
                  mapPoints.map(point => (
                    <GlassCard key={point.id} style={{ marginBottom: '12px' }}>
                      {editingPointId === point.id ? (
                        <div>
                          <input type="text" placeholder="Titolo del punto" value={editPointTitle} onChange={(e) => setEditPointTitle(e.target.value)} autoFocus style={{ width: '100%', padding: '12px', marginBottom: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,209,255,0.3)', borderRadius: '10px', color: '#FFF', fontSize: '14px', outline: 'none' }} />
                          <textarea placeholder="Note sul punto..." value={editPointNote} onChange={(e) => setEditPointNote(e.target.value)} style={{ width: '100%', height: '80px', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,209,255,0.3)', borderRadius: '10px', color: '#FFF', fontSize: '14px', resize: 'none', outline: 'none' }} />
                          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button onClick={() => handleUpdatePoint(point.id)} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#00D1FF', border: 'none', color: '#000', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                              <Save style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />Salva
                            </button>
                            <button onClick={() => { setEditingPointId(null); setEditPointTitle(''); setEditPointNote(''); }} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', fontSize: '13px', cursor: 'pointer' }}>
                              <X style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />Annulla
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ color: '#FFF', fontSize: '14px', fontWeight: 500 }}>{point.title || 'Punto senza titolo'}</p>
                              {point.note && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{point.note}</p>}
                              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '4px', fontFamily: 'monospace' }}>{point.lat.toFixed(5)}, {point.lng.toFixed(5)}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <button onClick={() => flyToPoint(point)} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,209,255,0.1)', border: 'none', color: '#00D1FF', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                              <Crosshair style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />Focus
                            </button>
                            <button onClick={() => { setEditingPointId(point.id); setEditPointTitle(point.title); setEditPointNote(point.note || ''); }} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,209,255,0.1)', border: 'none', color: '#00D1FF', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                              <Edit2 style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />Modifica
                            </button>
                            <button onClick={() => handleDeletePoint(point.id)} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                              <Trash2 style={{ width: '12px', height: '12px' }} />
                            </button>
                          </div>
                        </>
                      )}
                    </GlassCard>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </MapPillFlipOverlay>

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

// Glass Card component
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: 'rgba(25, 25, 35, 0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)', ...style }}>{children}</div>
);

export default DevAreasPanel;
