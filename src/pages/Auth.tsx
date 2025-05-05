
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import ProfileQuiz from "@/components/profile/ProfileQuiz";
import { Spinner } from "@/components/ui/spinner";
import VerificationPendingView from "@/components/auth/VerificationPendingView";
import { useEmailVerificationHandler } from "@/components/auth/EmailVerificationHandler";
import { AuthenticationManager } from "@/components/auth/AuthenticationManager";
import { ProfileCheckManager } from "@/components/auth/ProfileCheckManager";

const Auth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const navigate = useNavigate();
  
  // Handle email verification from URL params
  const wasEmailVerification = useEmailVerificationHandler();
  
  useEffect(() => {
    if (wasEmailVerification) {
      setIsLoading(false);
    }
  }, [wasEmailVerification]);

  const handleAuthenticationComplete = (userId: string) => {
    setIsLoggedIn(true);
    setEmailVerified(true);
    setUserId(userId);
    setIsLoading(false);
  };

  const handleNotAuthenticated = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setHasCompletedQuiz(false);
    setEmailVerified(false);
    setIsLoading(false);
  };

  const handleEmailNotVerified = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setEmailVerified(false);
    setIsLoading(false);
  };

  const handleProfileComplete = () => {
    setHasCompletedQuiz(true);
  };

  const handleProfileIncomplete = () => {
    setHasCompletedQuiz(false);
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

  // Authentication manager component
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
