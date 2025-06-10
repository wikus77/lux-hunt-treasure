
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/auth";

interface ConsentTypes {
  marketing: boolean;
  analytics: boolean;
  profiling: boolean;
  communications: boolean;
}

// Add this interface to properly match the database table structure
interface UserConsent {
  user_id: string;
  marketing_consent: boolean;
  analytics_consent: boolean;
  profiling_consent: boolean;
  communications_consent: boolean;
  updated_at?: string;
}

export function useConsentManagement() {
  const { isAuthenticated, user } = useAuthContext();
  const [consents, setConsents] = useState<ConsentTypes>({
    marketing: false,
    analytics: false,
    profiling: false,
    communications: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user's consent preferences if authenticated
  useEffect(() => {
    const loadConsents = async () => {
      if (isAuthenticated && user?.id) {
        setIsLoading(true);
        try {
          // Check if user_consents table exists, if not use localStorage fallback
          const { data, error } = await supabase
            .from('user_consents')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error("Error loading consents:", error);
          }

          if (data) {
            const userConsent = data as UserConsent;
            setConsents({
              marketing: userConsent.marketing_consent || false,
              analytics: userConsent.analytics_consent || false,
              profiling: userConsent.profiling_consent || false,
              communications: userConsent.communications_consent || false
            });
          }
        } catch (err) {
          console.error("Failed to load consent data:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        // For anonymous users, try to get consents from localStorage
        try {
          const savedConsents = localStorage.getItem('user_consents');
          if (savedConsents) {
            setConsents(JSON.parse(savedConsents));
          }
        } catch (e) {
          console.error("Error loading consents from localStorage:", e);
        }
        setIsLoading(false);
      }
    };

    loadConsents();
  }, [isAuthenticated, user?.id]);

  // Update user's consent preferences
  const updateConsent = async (consentType: keyof ConsentTypes, value: boolean) => {
    setConsents(prev => ({
      ...prev,
      [consentType]: value
    }));

    // For authenticated users, try to save to database, fallback to localStorage
    if (isAuthenticated && user?.id) {
      try {
        const consentField = `${consentType}_consent`;
        
        // We need to build the update object dynamically
        const updateData: Record<string, any> = {
          user_id: user.id,
          updated_at: new Date().toISOString()
        };
        updateData[consentField] = value;
        
        // Try to save to database, but don't fail if table doesn't exist
        try {
          const { error } = await supabase
            .from('user_consents')
            .upsert(updateData, {
              onConflict: 'user_id'
            });

          if (error) {
            console.warn("Database consent save failed, using localStorage:", error);
            throw error;
          }
        } catch (dbError) {
          // Fallback to localStorage if database fails
          console.warn("Using localStorage fallback for consent management");
          localStorage.setItem('user_consents', JSON.stringify({
            ...consents,
            [consentType]: value
          }));
        }

      } catch (err) {
        console.error("Failed to save consent:", err);
        // Revert the state change on error
        setConsents(prev => ({
          ...prev,
          [consentType]: !value
        }));
        return false;
      }
    } else {
      // For anonymous users, save to localStorage
      try {
        const newConsents = { ...consents, [consentType]: value };
        localStorage.setItem('user_consents', JSON.stringify(newConsents));
      } catch (e) {
        console.error("Error saving consents to localStorage:", e);
      }
    }
    
    return true;
  };

  // Get all consents at once
  const getAllConsents = () => consents;
  
  // Check if a specific consent is given
  const hasConsent = (consentType: keyof ConsentTypes) => consents[consentType];

  return {
    consents,
    isLoading,
    updateConsent,
    getAllConsents,
    hasConsent
  };
}
