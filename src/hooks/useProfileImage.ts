
import { useState, useEffect } from "react";

export const useProfileImage = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  useEffect(() => {
    const savedImage = localStorage.getItem('profileImage');
    setProfileImage(savedImage);
    
    // Setup listener for changes to profileImage in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profileImage') {
        setProfileImage(e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  return { profileImage };
};
