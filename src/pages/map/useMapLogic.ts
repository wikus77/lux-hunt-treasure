
// Add a new map point
const addMapPoint = async (point: { lat: number; lng: number; title: string; note: string }) => {
  try {
    // Get the current user first
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    if (!userId) {
      toast.error('Utente non autenticato');
      return null;
    }
    
    const { data, error } = await supabase
      .from('map_points')
      .insert({
        latitude: point.lat,
        longitude: point.lng,
        title: point.title,
        note: point.note,
        user_id: userId
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error adding map point:', error);
      toast.error('Errore nel salvare il punto di interesse');
      return null;
    }
    
    const newPoint: MapMarker = {
      id: data.id,
      lat: data.latitude,
      lng: data.longitude,
      note: data.note || '',
      title: data.title,
      position: { lat: data.latitude, lng: data.longitude },
      createdAt: new Date(data.created_at)
    };
    
    setMapPoints(prev => [...prev, newPoint]);
    toast.success('Punto di interesse salvato');
    return newPoint.id;
  } catch (error) {
    console.error('Error in addMapPoint:', error);
    toast.error('Errore nel salvare il punto di interesse');
    return null;
  }
};
