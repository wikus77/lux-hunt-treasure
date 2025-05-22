
import React, { useRef, useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  note: string | null;
}

const M1SSIONMapSafeBasic = () => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [userPoints, setUserPoints] = useState<MapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pointMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  
  // Load user's points on component mount
  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const { data, error } = await supabase
          .from('map_points')
          .select('*');
          
        if (error) {
          console.error("Error fetching points:", error);
          return;
        }
        
        setUserPoints(data as MapPoint[]);
      } catch (err) {
        console.error("Exception fetching points:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserPoints();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;

    console.log("🔄 Initializing map...");
    
    const map = L.map(containerRef.current).setView([41.9028, 12.4964], 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Add toggle button for adding points
    const addPointButton = L.control({ position: 'topright' });
    addPointButton.onAdd = () => {
      const btn = L.DomUtil.create('button', 'add-point-button');
      btn.innerHTML = '📍 Add Point';
      btn.style.padding = '8px 12px';
      btn.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      btn.style.color = 'white';
      btn.style.border = '1px solid #00D1FF';
      btn.style.borderRadius = '4px';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '14px';
      btn.style.fontWeight = 'bold';
      
      L.DomEvent.on(btn, 'click', function() {
        setIsAddingPoint(prev => {
          const newState = !prev;
          if (newState) {
            map.getContainer().style.cursor = 'crosshair';
            toast("Click on the map to add a point of interest");
          } else {
            map.getContainer().style.cursor = 'grab';
          }
          return newState;
        });
      });
      
      return btn;
    };
    addPointButton.addTo(map);

    // Handle map clicks to add points when in adding mode
    map.on("click", async (e) => {
      if (!isAddingPoint) return;
      
      const { lat, lng } = e.latlng;
      
      try {
        // Create a temporary marker
        const marker = L.marker([lat, lng]).addTo(map);
        
        // Show form popup for the new point
        const popupContent = createPointPopup(null, lat, lng, marker);
        marker.bindPopup(popupContent).openPopup();
        
        console.log("✅ Point creation initiated at", lat.toFixed(5), lng.toFixed(5));
      } catch (err) {
        console.error("Error adding point:", err);
        toast.error("Failed to add point");
      }
    });

    return () => {
      console.log("🚫 Map cleanup");
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [isAddingPoint]);

  // Display existing user points whenever they change or map is ready
  useEffect(() => {
    if (!mapRef.current || isLoading) return;
    
    // Clear existing markers
    pointMarkersRef.current.forEach(marker => {
      marker.removeFrom(mapRef.current!);
    });
    pointMarkersRef.current.clear();
    
    // Add markers for all user points
    userPoints.forEach(point => {
      if (!mapRef.current) return;
      
      const marker = L.marker([point.latitude, point.longitude]).addTo(mapRef.current);
      pointMarkersRef.current.set(point.id, marker);
      
      const popupContent = createPointPopup(point, point.latitude, point.longitude, marker);
      marker.bindPopup(popupContent);
    });
    
    console.log(`📍 Displayed ${userPoints.length} user points`);
  }, [userPoints, isLoading]);

  // Function to create popup content for a point
  const createPointPopup = (point: MapPoint | null, lat: number, lng: number, marker: L.Marker) => {
    const container = document.createElement('div');
    container.className = 'point-popup';
    container.style.minWidth = '250px';
    
    // Title
    const titleLabel = document.createElement('div');
    titleLabel.textContent = 'Title:';
    titleLabel.style.fontWeight = 'bold';
    titleLabel.style.marginBottom = '4px';
    container.appendChild(titleLabel);
    
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = point?.title || '';
    titleInput.placeholder = 'Enter title';
    titleInput.style.width = '100%';
    titleInput.style.padding = '6px';
    titleInput.style.marginBottom = '10px';
    titleInput.style.borderRadius = '4px';
    titleInput.style.border = '1px solid #ccc';
    container.appendChild(titleInput);
    
    // Note
    const noteLabel = document.createElement('div');
    noteLabel.textContent = 'Description:';
    noteLabel.style.fontWeight = 'bold';
    noteLabel.style.marginBottom = '4px';
    container.appendChild(noteLabel);
    
    const noteInput = document.createElement('textarea');
    noteInput.value = point?.note || '';
    noteInput.placeholder = 'Enter description';
    noteInput.style.width = '100%';
    noteInput.style.padding = '6px';
    noteInput.style.minHeight = '80px';
    noteInput.style.marginBottom = '10px';
    noteInput.style.borderRadius = '4px';
    noteInput.style.border = '1px solid #ccc';
    noteInput.style.resize = 'vertical';
    container.appendChild(noteInput);
    
    // Button container
    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.justifyContent = 'space-between';
    btnContainer.style.marginTop = '10px';
    container.appendChild(btnContainer);
    
    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = point ? 'Update' : 'Save';
    saveBtn.style.backgroundColor = '#00D1FF';
    saveBtn.style.color = 'black';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '4px';
    saveBtn.style.padding = '6px 12px';
    saveBtn.style.cursor = 'pointer';
    saveBtn.style.fontWeight = 'bold';
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.backgroundColor = '#ff3333';
    deleteBtn.style.color = 'white';
    deleteBtn.style.border = 'none';
    deleteBtn.style.borderRadius = '4px';
    deleteBtn.style.padding = '6px 12px';
    deleteBtn.style.cursor = 'pointer';
    
    btnContainer.appendChild(saveBtn);
    btnContainer.appendChild(deleteBtn);
    
    // Save/Update point
    saveBtn.onclick = async () => {
      const title = titleInput.value.trim();
      const note = noteInput.value.trim();
      
      if (!title) {
        alert('Please enter a title');
        return;
      }
      
      try {
        if (point) {
          // Update existing point
          const { error } = await supabase
            .from('map_points')
            .update({
              title,
              note: note || null
            })
            .eq('id', point.id);
            
          if (error) throw error;
          
          setUserPoints(prev => 
            prev.map(p => p.id === point.id ? { ...p, title, note: note || null } : p)
          );
          
          toast.success('Point updated');
        } else {
          // Create new point
          const { data, error } = await supabase
            .from('map_points')
            .insert({
              latitude: lat,
              longitude: lng,
              title,
              note: note || null
            })
            .select();
            
          if (error) throw error;
          
          const newPoint = data[0] as MapPoint;
          setUserPoints(prev => [...prev, newPoint]);
          
          // Exit adding mode
          setIsAddingPoint(false);
          if (mapRef.current) {
            mapRef.current.getContainer().style.cursor = 'grab';
          }
          
          toast.success('Point added');
        }
        
        marker.closePopup();
      } catch (err) {
        console.error('Error saving point:', err);
        toast.error(point ? 'Failed to update point' : 'Failed to add point');
      }
    };
    
    // Delete point
    deleteBtn.onclick = async () => {
      if (confirm('Are you sure you want to delete this point?')) {
        try {
          if (point) {
            const { error } = await supabase
              .from('map_points')
              .delete()
              .eq('id', point.id);
              
            if (error) throw error;
            
            setUserPoints(prev => prev.filter(p => p.id !== point.id));
            
            marker.removeFrom(mapRef.current!);
            pointMarkersRef.current.delete(point.id);
            
            toast.success('Point deleted');
          } else {
            // Just remove the temporary marker for a new point
            marker.removeFrom(mapRef.current!);
          }
          
          marker.closePopup();
        } catch (err) {
          console.error('Error deleting point:', err);
          toast.error('Failed to delete point');
        }
      }
    };
    
    return container;
  };

  return <div ref={containerRef} style={{ height: "100vh", width: "100vw" }} />;
};

export default M1SSIONMapSafeBasic;
