
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useProfilePersonalInfo = () => {
  // Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: ""
  });

  // Load personal information
  useEffect(() => {
    const loadPersonalInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, phone, address, city, postal_code, country')
            .eq('id', session.user.id)
            .single();
            
          if (data && !error) {
            // Set personal information from database
            setPersonalInfo({
              firstName: data.first_name || "",
              lastName: data.last_name || "",
              email: data.email || "",
              phone: data.phone || "",
              address: data.address || "",
              city: data.city || "",
              postalCode: data.postal_code || "",
              country: data.country || ""
            });
          }
        }
      } catch (error) {
        console.error("Error loading personal info from Supabase:", error);
      }
    };
    
    loadPersonalInfo();
  }, []);

  return {
    personalInfo,
    setPersonalInfo
  };
};
