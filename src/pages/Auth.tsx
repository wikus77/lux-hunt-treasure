
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import ProfileQuiz from "@/components/profile/ProfileQuiz";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsLoggedIn(true);
        setUserId(session.user.id);
        
        // Controlla nel database se l'utente ha già uno stile investigativo
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('investigative_style')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error("Errore nel recuperare il profilo:", error);
          }
          
          // Se l'utente ha già uno stile investigativo nel database, consideriamo il quiz come completato
          if (data?.investigative_style) {
            setHasCompletedQuiz(true);
            localStorage.setItem("userProfileType", data.investigative_style);
            navigate("/home");
          } else {
            // Verifichiamo anche in localStorage come fallback
            const storedProfile = localStorage.getItem("userProfileType");
            if (storedProfile) {
              setHasCompletedQuiz(true);
              navigate("/home");
            }
          }
        } catch (error) {
          console.error("Errore nel controllo del profilo:", error);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
          
          // Controlliamo se ha già completato il quiz solo quando si fa login
          // ma non facciamo il redirect qui, lasciamo che il checkAuth se ne occupi
        } else if (event === "SIGNED_OUT") {
          setIsLoggedIn(false);
          setUserId(null);
          setHasCompletedQuiz(false);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLoginComplete = () => {
    setIsLoggedIn(true);
  };

  const handleQuizComplete = async (profileType: string) => {
    // Mark quiz as completed
    setHasCompletedQuiz(true);
    
    // Update profile in local storage and session
    localStorage.setItem("investigativeStyle", profileType === "comandante" ? 
      "Ragionatore Strategico" : profileType === "assaltatore" ? 
      "Forza d'Impatto" : "Tessitore di Reti");
      
    localStorage.setItem("investigativeStyleColor", profileType === "comandante" ? 
      "bg-cyan-500" : profileType === "assaltatore" ? 
      "bg-red-500" : "bg-purple-500");
    
    // Salviamo anche il tipo di profilo grezzo per riferimenti futuri
    localStorage.setItem("userProfileType", profileType);
    
    // Navigate to home page
    navigate("/home");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {!isLoggedIn ? (
        <Login />
      ) : !hasCompletedQuiz ? (
        <ProfileQuiz onComplete={handleQuizComplete} />
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p>Reindirizzamento in corso...</p>
        </div>
      )}
    </div>
  );
};

export default Auth;
