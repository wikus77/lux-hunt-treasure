
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useMapPointsOperations = (userId?: string) => {
  // Save the point to Supabase
  const savePoint = useCallback(async (newPoint: any, title: string, note: string) => {
    if (!newPoint || !userId) return;
    
    try {
      const { data, error } = await supabase
        .from('map_points')
        .insert([{
          user_id: userId,
          latitude: newPoint.lat,
          longitude: newPoint.lng,
          title,
          note
        }])
        .select();

      if (error) {
        console.error("Error saving map point:", error);
        toast.error("Errore nel salvare il punto");
        return null;
      }

      console.log("📍 Saved new point:", data);
      toast.success("Punto salvato con successo");
      
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      console.error("Exception saving map point:", err);
      toast.error("Errore nel salvare il punto");
      return null;
    }
  }, [userId]);

  // Update an existing point
  const updateMapPoint = useCallback(async (id: string, title: string, note: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const { error } = await supabase
        .from('map_points')
        .update({
          title,
          note
        })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error("Error updating map point:", error);
        toast.error("Errore nell'aggiornare il punto");
        return false;
      }

      toast.success("Punto aggiornato con successo");
      return true;
    } catch (err) {
      console.error("Exception updating map point:", err);
      toast.error("Errore nell'aggiornare il punto");
      return false;
    }
  }, [userId]);

  // Delete a map point
  const deleteMapPoint = useCallback(async (id: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const { error } = await supabase
        .from('map_points')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error("Error deleting map point:", error);
        toast.error("Errore nell'eliminare il punto");
        return false;
      }

      toast.success("Punto eliminato con successo");
      return true;
    } catch (err) {
      console.error("Exception deleting map point:", err);
      toast.error("Errore nell'eliminare il punto");
      return false;
    }
  }, [userId]);

  return {
    savePoint,
    updateMapPoint,
    deleteMapPoint
  };
};
