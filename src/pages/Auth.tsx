
import React, { useState, useEffect } from "react";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import { useQueryParams } from "@/hooks/useQueryParams";
import Login from "./Login";
import EnhancedPersonalityQuiz from "@/components/profile/EnhancedPersonalityQuiz";
import { Spinner } from "@/components/ui/spinner";
import VerificationPendingView from "@/components/auth/VerificationPendingView";
import AccessBlockedView from "@/components/auth/AccessBlockedView";
import { useEmailVerificationHandler } from "@/components/auth/EmailVerificationHandler";
import { AuthenticationManager } from "@/components/auth/AuthenticationManager";
import { ProfileCheckManager } from "@/components/auth/ProfileCheckManager";
import { useAccessControl } from "@/hooks/useAccessControl";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { recordQuizSkip } from "@/utils/quizDailyGuard";

const Auth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const searchParams = useQueryParams<{ redirect?: string; verification?: string }>();
  const { navigate, currentPath } = useWouterNavigation();
  
  // Nuovo controllo di accesso M1SSION
  const accessControl = useAccessControl();
  
  console.log("Auth page loaded - current path:", currentPath);
  
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
    const redirect = searchParams.redirect;
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

  const handleQuizComplete = async (playerType: any) => {
    console.log("Enhanced quiz completed with player type:", playerType);
    
    // Handle skip case (playerType is null when user clicks "Salta Quiz")
    if (!playerType) {
      console.log("User skipped quiz - recording skip date");
      recordQuizSkip(userId!);
      setHasCompletedQuiz(true);
      toast.info("Quiz saltato. Riapparirà domani all'apertura dell'app.", {
        description: "Potrai completarlo anche dalla tua area profilo."
      });
      setTimeout(() => {
        navigate("/home");
      }, 1000);
      return;
    }
    
    // Quiz completed successfully
    setHasCompletedQuiz(true);
    
    // Update profile in local storage and session
    localStorage.setItem("investigativeStyle", playerType.name);
    localStorage.setItem("investigativeStyleColor", playerType.color);
    localStorage.setItem("userProfileType", playerType.id);
    
    // Navigate to home page
    toast.success("Profilo completato!", {
      description: `Benvenuto, ${playerType.name}!`
    });
    
    // Navigate to home page after a short delay
    setTimeout(() => {
      navigate("/home");
    }, 1000);
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
        <Spinner className="text-m1ssion-blue" size="lg" />
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
          <EnhancedPersonalityQuiz onComplete={handleQuizComplete} userId={userId!} />
        </div>
      ) : !accessControl.canAccess ? (
        // Nuovo: Controllo di accesso M1SSION
        <AccessBlockedView
          subscriptionPlan={accessControl.subscriptionPlan}
          accessStartDate={accessControl.accessStartDate}
          timeUntilAccess={accessControl.timeUntilAccess}
        />
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
