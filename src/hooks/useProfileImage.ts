
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const useProfileImage = () => {
  const [profileImage, setProfileImage] = useLocalStorage<string | null>('profileImage', null);
  
  return { 
    profileImage,
    setProfileImage
  };
};
