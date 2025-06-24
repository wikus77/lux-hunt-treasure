
import { useState, useEffect } from "react";

export function useProfileImage() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading a profile image
    const defaultImage = "https://via.placeholder.com/40x40/1C1C1F/00D1FF?text=M1";
    setProfileImage(defaultImage);
  }, []);

  return { profileImage, setProfileImage };
}
