
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/auth";

interface ConsentTypes {
  marketing: boolean;
  analytics: boolean;
  profiling: boolean;
  communications: boolean;
}

export function useConsentManagement() {
  const { isAuthenticated, userId } = useAuthContext();
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
      if (isAuthenticated() && userId) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('user_consents')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error("Error loading consents:", error);
          }

          if (data) {
            setConsents({
              marketing: data.marketing_consent || false,
              analytics: data.analytics_consent || false,
              profiling: data.profiling_consent || false,
              communications: data.communications_consent || false
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
  }, [isAuthenticated, userId]);

  // Update user's consent preferences
  const updateConsent = async (consentType: keyof ConsentTypes, value: boolean) => {
    setConsents(prev => ({
      ...prev,
      [consentType]: value
    }));

    // For authenticated users, save to database
    if (isAuthenticated() && userId) {
      try {
        const consentField = `${consentType}_consent`;
        const { error } = await supabase
          .from('user_consents')
          .upsert({
            user_id: userId,
            [consentField]: value,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          console.error("Error updating consent:", error);
          throw error;
        }

        // Record consent history for compliance
        await supabase
          .from('consent_history')
          .insert({
            user_id: userId,
            consent_type: consentType,
            consent_given: value,
            ip_address: 'client_ip', // In a real app, you'd capture the client IP
            consent_timestamp: new Date().toISOString()
          });

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
        localStorage.setItem('user_consents', JSON.stringify(consents));
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
