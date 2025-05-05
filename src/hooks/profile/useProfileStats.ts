import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/integrations/supabase/client";

export const useProfileStats = () => {
  // Stats data
  const [stats, setStats] = useState({
    missionsCompleted: 12,
    cluesFound: 47,
    totalPlayTime: "123h 45m",
    pointsEarned: 9850,
    prizeProgress: 68,
    bestResult: "Top 5% in Mission X"
  });

  // Style analysis from quiz
  const [investigativeStyle, setInvestigativeStyle] = useState({
    style: "Ragionatore Strategico", 
    color: "bg-cyan-500"
  });

  // Load saved stats and investigative style on component mount
  useEffect(() => {
    const loadStatsAndStyle = async () => {
      // Load investigative style from quiz results
      const styleName = localStorage.getItem('investigativeStyle');
      const styleColor = localStorage.getItem('investigativeStyleColor');
      
      if (styleName && styleColor) {
        setInvestigativeStyle({
          style: styleName,
          color: styleColor
        });
      } else {
        // If no stored quiz results, check what profile type they have
        const profileType = localStorage.getItem('userProfileType');
        
        if (profileType) {
          // Set investigative style based on profile type
          switch(profileType) {
            case 'comandante':
              setInvestigativeStyle({
                style: "Ragionatore Strategico",
                color: "bg-cyan-500"
              });
              break;
            case 'assaltatore':
              setInvestigativeStyle({
                style: "Forza d'Impatto",
                color: "bg-red-500"
              });
              break;
            case 'nexus':
              setInvestigativeStyle({
                style: "Tessitore di Reti",
                color: "bg-purple-500"
              });
              break;
            default:
              // Keep default
          }
        }
      }

      // Try to load stats from Supabase if authenticated
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('investigative_style')
            .eq('id', session.user.id)
            .single();
            
          if (data && !error) {
            // Update investigative style if available from database
            if (data.investigative_style) {
              const styleMap: Record<string, { style: string, color: string }> = {
                'comandante': { style: "Ragionatore Strategico", color: "bg-cyan-500" },
                'assaltatore': { style: "Forza d'Impatto", color: "bg-red-500" },
                'nexus': { style: "Tessitore di Reti", color: "bg-purple-500" }
              };
              
              setInvestigativeStyle(styleMap[data.investigative_style] || investigativeStyle);
            }
            
            // For now we keep the default stats since there's no stats column in the profiles table
            // In a real app, we might have a separate stats table or store them differently
          }
        }
      } catch (error) {
        console.error("Error loading stats data from Supabase:", error);
      }
    };
    
    loadStatsAndStyle();
  }, []);

  return {
    stats,
    investigativeStyle,
    setStats,
    setInvestigativeStyle
  };
};
