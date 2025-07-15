
import { useNavigateCompat } from "@/hooks/useNavigateCompat";

export function useBuzzNavigation() {
  const navigate = useNavigateCompat();
  // const location = useLocation(); // Disabilitato per Zustand

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
