
import { useState } from "react";

export const useProfileNotifications = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  return {
    showNotifications,
    setShowNotifications
  };
};
