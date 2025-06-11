
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Login from "./Login";
import ProfileQuiz from "@/components/profile/ProfileQuiz";
import { Spinner } from "@/components/ui/spinner";
import VerificationPendingView from "@/components/auth/VerificationPendingView";
import { useEmailVerificationHandler } from "@/components/auth/EmailVerificationHandler";
import { AuthenticationManager } from "@/components/auth/AuthenticationManager";
import { ProfileCheckManager } from "@/components/auth/ProfileCheckManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log("Auth page loaded - current path:", location.pathname);
  
  // Handle email verification from URL params
  const wasEmailVerification = useEmailVerificationHandler();
  
  useEffect(() => {
    console.log("Auth page mounted, wasEmailVerification:", wasEmailVerification);
    
    if (wasEmailVerification) {
      setIsLoading(false);
      // Wait a moment before redirecting to allow the user to see the success message
      setTimeout(() => {
        navigate('/login?verification=success');
      }, 2000);
    }
    
    // Check URL for redirects
    const redirect = searchParams.get('redirect');
    if (redirect) {
      console.log("Found redirect parameter:", redirect);
    }
  }, [wasEmailVerification, navigate, searchParams]);

  const handleAuthenticationComplete = (userId: string) => {
    console.log("Authentication complete for user:", userId);
    setIsLoggedIn(true);
    setEmailVerified(true);
    setUserId(userId);
    setIsLoading(false);
  };

  const handleNotAuthenticated = () => {
    console.log("User is not authenticated");
    setIsLoggedIn(false);
    setUserId(null);
    setHasCompletedQuiz(false);
    setEmailVerified(false);
    setIsLoading(false);
  };

  const handleEmailNotVerified = () => {
    console.log("User's email is not verified");
    setIsLoggedIn(false);
    setUserId(null);
    setEmailVerified(false);
    setIsLoading(false);
  };

  const handleProfileComplete = () => {
    console.log("User has completed profile setup");
    setHasCompletedQuiz(true);
  };

  const handleProfileIncomplete = () => {
    console.log("User has not completed profile setup");
    setHasCompletedQuiz(false);
  };

  const handleQuizComplete = async (profileType: string) => {
    console.log("Quiz completed with profile type:", profileType);
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
        console.log("Saving profile data to database for user:", userId);
        
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
        } else {
          console.log("Profile data saved successfully");
          // Navigate to home page
          toast.success("Profilo completato!", {
            description: "Benvenuto nell'applicazione!"
          });
          
          // Navigate to home page after a short delay
          setTimeout(() => {
            navigate("/home");
          }, 1000);
        }
      } catch (error) {
        console.error("Error saving profile data:", error);
      }
    } else {
      console.error("No userId available, cannot save profile data");
      // Navigate anyway to prevent user being stuck
      navigate("/home");
    }
  };

  // Add more debug information to help diagnose rendering issues
  useEffect(() => {
    console.log("Current Auth state:", {
      isLoading,
      isLoggedIn,
      emailVerified,
      hasCompletedQuiz,
      userId
    });
  }, [isLoading, isLoggedIn, emailVerified, hasCompletedQuiz, userId]);

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
      <AuthenticationManager 
        onAuthenticated={handleAuthenticationComplete}
        onNotAuthenticated={handleNotAuthenticated}
        onEmailNotVerified={handleEmailNotVerified}
      />
      
      {userId && (
        <ProfileCheckManager
          userId={userId}
          onProfileComplete={handleProfileComplete}
          onProfileIncomplete={handleProfileIncomplete}
        />
      )}
      
      {!isLoggedIn ? (
        <Login />
      ) : !emailVerified ? (
        <VerificationPendingView />
      ) : !hasCompletedQuiz ? (
        <div className="min-h-screen bg-black">
          <h2 className="text-2xl font-bold text-white text-center pt-8 mb-4">
            Completa il tuo profilo
          </h2>
          <ProfileQuiz onComplete={handleQuizComplete} userId={userId} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Reindirizzamento in corso...</div>
          <Spinner className="ml-2 text-white" />
        </div>
      )}
    </div>
  );
};

export default Auth;
