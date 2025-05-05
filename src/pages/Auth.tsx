import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Login from "./Login";
import ProfileQuiz from "@/components/profile/ProfileQuiz";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // Added missing import

const Auth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
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
          
          // Email is now verified
          setEmailVerified(true);
          toast.success("Email verificata con successo", {
            description: "Ora puoi accedere alla M1SSION."
          });
          
          // Redirect to login to complete authentication flow
          navigate('/auth');
          return true;
        } catch (error) {
          console.error("Error handling email verification:", error);
          toast.error("Errore di verifica", {
            description: "Si è verificato un problema durante la verifica dell'email."
          });
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
        
        // Email is verified, mark user as logged in
        setIsLoggedIn(true);
        setEmailVerified(true);
        setUserId(session.user.id);
        
        // Check in database if the user has already an investigative style
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('investigative_style')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error("Errore nel recuperare il profilo:", error);
          }
          
          // If the user has an investigative style in the database, mark quiz as completed
          if (data?.investigative_style) {
            setHasCompletedQuiz(true);
            localStorage.setItem("userProfileType", data.investigative_style);
            navigate("/home");
          } else {
            // Check in localStorage as fallback
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
          
          setEmailVerified(true);
          // Check quiz completion
          checkAuth();
        } else if (event === "SIGNED_OUT") {
          setIsLoggedIn(false);
          setUserId(null);
          setHasCompletedQuiz(false);
          setEmailVerified(false);
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
    
    // Save raw profile type for future references
    localStorage.setItem("userProfileType", profileType);
    
    // Save investigative style to database
    if (userId) {
      try {
        // Update the profile with quiz results
        const { error } = await supabase
          .from('profiles')
          .update({ 
            investigative_style: profileType, 
            // Initialize points to 0
            credits: 0
          })
          .eq('id', userId);
        
        if (error) {
          console.error("Error updating profile:", error);
          toast.error("Errore", {
            description: "Impossibile salvare il tuo profilo. Riprova più tardi."
          });
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
      ) : !emailVerified ? (
        <div className="flex flex-col items-center justify-center h-screen p-4">
          <div className="bg-black/50 border border-amber-500/30 rounded-lg p-6 max-w-md mx-auto text-center">
            <h2 className="text-xl font-bold mb-4 text-white">Verifica la tua email</h2>
            <p className="mb-6 text-white/80">
              Per completare la registrazione, controlla la tua casella email e clicca sul link di verifica.
            </p>
            <Button
              onClick={() => navigate("/login")}
              variant="outline"
              className="border-amber-500 text-amber-500 hover:bg-amber-500/20"
            >
              Torna al login
            </Button>
          </div>
        </div>
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
