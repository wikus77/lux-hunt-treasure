
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Login from "./Login";
import ProfileQuiz from "@/components/profile/ProfileQuiz";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/ui/spinner";

const Auth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Handle email verification redirect
    const handleEmailVerification = async () => {
      // Check if the URL contains a verification token from email
      const access_token = searchParams.get('access_token');
      const refresh_token = searchParams.get('refresh_token');
      const type = searchParams.get('type');

      if (access_token && refresh_token && type === 'email_confirmation') {
        try {
          await supabase.auth.setSession({
            access_token,
            refresh_token
          });
          
          // Redirect to login with success message
          navigate('/login?verification=success');
          return true;
        } catch (error) {
          console.error("Error handling email verification:", error);
        }
      }
      return false;
    };

    // Check if user is logged in
    const checkAuth = async () => {
      setIsLoading(true);
      
      // First handle any email verification redirects
      const wasEmailVerification = await handleEmailVerification();
      if (wasEmailVerification) {
        setIsLoading(false);
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if the email is verified
        if (!session.user.email_confirmed_at) {
          // Email not verified, logout and redirect to login page with verification pending status
          await supabase.auth.signOut();
          navigate('/login?verification=pending');
          setIsLoading(false);
          return;
        }
        
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
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
          
          // Check if email is verified
          if (!session.user.email_confirmed_at) {
            await supabase.auth.signOut();
            navigate('/login?verification=pending');
            setIsLoggedIn(false);
            setUserId(null);
            return;
          }
          
          // Controlliamo se ha già completato il quiz solo quando si fa login
          // ma non facciamo il redirect qui, lasciamo che il checkAuth se ne occupi
          checkAuth();
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
  }, [navigate, searchParams]);

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
    
    // Save investigative style to database
    if (userId) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ investigative_style: profileType })
          .eq('id', userId);
        
        if (error) {
          console.error("Error updating profile:", error);
        }
      } catch (error) {
        console.error("Error saving profile data:", error);
      }
    }
    
    // Navigate to home page
    navigate("/home");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Spinner className="text-projectx-blue" size="lg" />
        <div className="text-white text-xl mt-4">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {!isLoggedIn ? (
        <Login />
      ) : !hasCompletedQuiz ? (
        <ProfileQuiz onComplete={handleQuizComplete} userId={userId} />
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p>Reindirizzamento in corso...</p>
        </div>
      )}
    </div>
  );
};

export default Auth;
