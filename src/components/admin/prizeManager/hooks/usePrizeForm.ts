
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { geocodeAddress, createPrize, generatePrizeClues, insertPrizeClues, logAuthDebugInfo } from "../services/prizeService";
import { supabase } from "@/integrations/supabase/client";

export interface PrizeFormValues {
  city: string;
  address: string;
  area_radius_m: number;
  start_date: string;
  end_date: string;
  // Manual coordinates for fallback
  manual_lat?: string;
  manual_lng?: string;
  use_manual_coordinates?: boolean;
}

export const usePrizeForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [showManualCoordinates, setShowManualCoordinates] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [geocodeResponse, setGeocodeResponse] = useState<any | null>(null);
  const [authDebugInfo, setAuthDebugInfo] = useState<any | null>(null);
  
  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        const authenticated = !!data?.user?.id;
        setIsAuthenticated(authenticated);
        setUserId(data?.user?.id || null);
        
        // Check admin status
        if (authenticated && data?.user?.id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
          
          setIsAdmin(profileData?.role === 'admin' || data.user.email === 'wikus77@hotmail.it');
        }
        
        // Update debug info
        const debugInfo = await logAuthDebugInfo();
        setAuthDebugInfo(debugInfo);
        
        console.log("🔐 Authentication check:", authenticated ? "Authenticated" : "Not authenticated");
        console.log("🔑 User ID:", data?.user?.id || "None");
        console.log("👑 Admin status:", isAdmin ? "Admin" : "Not admin");
      } catch (err) {
        console.error("Auth check error:", err);
      }
    };
    
    checkAuth();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const authenticated = !!session?.user?.id;
      setIsAuthenticated(authenticated);
      setUserId(session?.user?.id || null);
      
      // Check admin status on auth change
      if (authenticated && session?.user) {
        setIsAdmin(session.user.email === 'wikus77@hotmail.it');
        
        // Check profile role
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profileData }) => {
            if (profileData?.role === 'admin') {
              setIsAdmin(true);
            }
          });
      } else {
        setIsAdmin(false);
      }
      
      console.log("🔄 Auth state changed:", event);
      console.log("🔑 User ID now:", session?.user?.id || "None");
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const form = useForm<PrizeFormValues>({
    defaultValues: {
      city: "",
      address: "",
      area_radius_m: 500,
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      manual_lat: "",
      manual_lng: "",
      use_manual_coordinates: false
    }
  });

  const handleRetry = async () => {
    setIsRetrying(true);
    const values = form.getValues();
    
    // Wait 2 seconds before retrying to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onSubmit(values).finally(() => {
      setIsRetrying(false);
    });
  };
  
  const toggleManualCoordinates = () => {
    setShowManualCoordinates(prev => !prev);
    form.setValue("use_manual_coordinates", !showManualCoordinates);
  };

  const onSubmit = async (values: PrizeFormValues) => {
    // Check if user is authenticated and admin before proceeding
    if (!isAuthenticated) {
      toast.error("Utente non autenticato", { 
        description: "Devi effettuare il login prima di poter inserire premi." 
      });
      return;
    }
    
    // Special logging for authorization debugging
    const authInfo = await logAuthDebugInfo();
    setAuthDebugInfo(authInfo);
    
    if (!isAdmin && !authInfo.isAdmin) {
      toast.error("Accesso non autorizzato", { 
        description: "Solo gli amministratori possono inserire premi." 
      });
      console.error("User is not admin:", authInfo);
      return;
    }
    
    try {
      setIsLoading(true);
      setGeocodeError(null);
      setGeocodeResponse(null);
      console.log("Submitting form with values:", values);
      console.log("Auth status:", { isAuthenticated, isAdmin, userId });
      
      let lat: number;
      let lon: number;
      
      // Check if using manual coordinates
      if (values.use_manual_coordinates && values.manual_lat && values.manual_lng) {
        lat = parseFloat(values.manual_lat);
        lon = parseFloat(values.manual_lng);
        
        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
          throw new Error("Coordinate inserite non valide. Latitude: -90 to 90, Longitude: -180 to 180.");
        }
        
        console.log("Using manual coordinates:", { lat, lon });
        
        // Show confirmation toast
        toast.info("Utilizzo coordinate manuali", {
          description: `Lat: ${lat}, Lon: ${lon}`
        });
      } else {
        // 1. Geocode the address to get coordinates
        toast.info("Geolocalizzazione indirizzo...");
        const geocodeData = await geocodeAddress(values.city, values.address);
        console.log("Geocode response:", geocodeData);
        setGeocodeResponse(geocodeData);
        
        if (geocodeData.error || !geocodeData.lat || !geocodeData.lon) {
          // Set error state for UI
          setGeocodeError(geocodeData.error || "Impossibile ottenere le coordinate geografiche");
          
          // Show specific error message based on error type
          if (geocodeData.errorType === 'rate_limit') {
            toast.error("Rate limit superato", { 
              description: "Troppe richieste a Nominatim. Riprova tra qualche istante o inserisci coordinate manualmente." 
            });
          } else if (geocodeData.errorType === 'not_found') {
            toast.error("Indirizzo non trovato", { 
              description: "Prova a inserire un indirizzo più specifico o le coordinate manualmente." 
            });
          } else if (geocodeData.errorType === 'format_error') {
            toast.error("Formato indirizzo non valido", { 
              description: "Verifica il formato dell'indirizzo (es. 'Via Monte Napoleone 10')" 
            });
          } else {
            toast.error("Errore di geocoding", { 
              description: geocodeData.error || "Errore imprevisto durante la geolocalizzazione." 
            });
          }
          
          // Enable manual coordinate input automatically
          setShowManualCoordinates(true);
          form.setValue("use_manual_coordinates", true);
          
          throw new Error(geocodeData.error || "Impossibile ottenere le coordinate geografiche");
        }
        
        lat = parseFloat(geocodeData.lat);
        lon = parseFloat(geocodeData.lon);
        
        // Show success toast with found location
        if (geocodeData.display_name) {
          toast.success("Indirizzo localizzato", {
            description: geocodeData.display_name
          });
        }
      }
      
      // 2. Insert prize into the database
      toast.info("Salvataggio premio...");
      const { data: prizeData, error: prizeError } = await createPrize(
        values, 
        lat,
        lon
      );
      
      console.log("Prize insert response:", { data: prizeData, error: prizeError });
      
      if (prizeError) {
        throw new Error(prizeError?.message || "Errore durante il salvataggio del premio");
      }

      if (!prizeData || prizeData.length === 0) {
        throw new Error("Nessun dato ritornato dopo l'inserimento del premio");
      }

      const prizeId = prizeData[0].id;
      console.log("Created prize with ID:", prizeId);
      
      // 3. Generate clues
      toast.info("Generazione indizi...");
      const clueData = await generatePrizeClues({
        prizeId,
        city: values.city,
        address: values.address,
        lat: lat,
        lng: lon
      });
      
      console.log("Generated clues:", clueData);
      
      if (clueData.error || !clueData.clues) {
        throw new Error(clueData.error || "Impossibile generare gli indizi");
      }
      
      // 4. Insert clues into the database
      toast.info("Salvataggio indizi...");
      const insertResult = await insertPrizeClues(clueData.clues, prizeId);
      
      console.log("Clues insertion result:", insertResult);
      
      if (insertResult.error) {
        throw new Error(insertResult.error || "Errore durante il salvataggio degli indizi");
      }
      
      // Success!
      toast.success("Premio e indizi creati con successo!", {
        description: `Salvato premio in ${values.city} con ${clueData.clues.length} indizi.`
      });
      
      // Reset form after success
      setGeocodeError(null);
      setShowManualCoordinates(false);
      form.reset();
      
    } catch (error) {
      console.error("Error creating prize:", error);
      toast.error("Errore", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    onSubmit,
    geocodeError,
    geocodeResponse,
    showManualCoordinates,
    toggleManualCoordinates,
    handleRetry,
    isRetrying,
    isAuthenticated,
    isAdmin,
    authDebugInfo
  };
};
