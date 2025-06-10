
import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/auth";

interface ConsentTypes {
  marketing: boolean;
  analytics: boolean;
  profiling: boolean;
  communications: boolean;
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

  // Load user's consent preferences from localStorage
  useEffect(() => {
    const loadConsents = async () => {
      setIsLoading(true);
      try {
        // Get consents from localStorage
        const savedConsents = localStorage.getItem('user_consents');
        if (savedConsents) {
          const parsedConsents = JSON.parse(savedConsents);
          setConsents({
            marketing: parsedConsents.marketing || false,
            analytics: parsedConsents.analytics || false,
            profiling: parsedConsents.profiling || false,
            communications: parsedConsents.communications || false
          });
        }
      } catch (e) {
        console.error("Error loading consents from localStorage:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadConsents();
  }, [isAuthenticated, user?.id]);

  // Update user's consent preferences
  const updateConsent = async (consentType: keyof ConsentTypes, value: boolean) => {
    const newConsents = {
      ...consents,
      [consentType]: value
    };
    
    setConsents(newConsents);

    // Save to localStorage
    try {
      localStorage.setItem('user_consents', JSON.stringify(newConsents));
    } catch (e) {
      console.error("Error saving consents to localStorage:", e);
      // Revert the state change on error
      setConsents(prev => ({
        ...prev,
        [consentType]: !value
      }));
      return false;
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
