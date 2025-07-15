
import { useNavigate, useLocation } from "react-router-dom";

export function useBuzzNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToPaymentMethods = (vagueClueTxt: string, isRegularBuzz: boolean = true) => {
    navigate("/payment-methods", {
      state: {
        fromBuzz: true,
        fromRegularBuzz: isRegularBuzz,
        clue: { description: vagueClueTxt },
        generateMapArea: false
      }
    });
  };

  const navigateToNotifications = () => {
    navigate("/notifications", { replace: true });
  };

  return {
    navigate,
    location,
    navigateToPaymentMethods,
    navigateToNotifications
  };
}
