
import { useNavigateCompat } from "@/hooks/useNavigateCompat";

export function useBuzzNavigation() {
  const navigate = useNavigateCompat();
  // const location = useLocation(); // Disabilitato per Zustand

  const navigateToPaymentMethods = (vagueClueTxt: string, isRegularBuzz: boolean = true) => {
    navigate("/payment-methods");
  };

  const navigateToNotifications = () => {
    navigate("/notifications", { replace: true });
  };

  return {
    navigate,
    // location, // Disabilitato per Zustand
    navigateToPaymentMethods,
    navigateToNotifications
  };
}
