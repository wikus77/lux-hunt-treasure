
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import ProfileQuiz from "@/components/profile/ProfileQuiz";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsLoggedIn(true);
        setUserId(session.user.id);
        
        // Check if the user has already completed the quiz
        const storedProfile = localStorage.getItem("userProfileType");
        if (storedProfile) {
          setHasCompletedQuiz(true);
          navigate("/home");
        }
      }
    };
    
    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
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
    
    // Navigate to home page
    navigate("/home");
  };

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
