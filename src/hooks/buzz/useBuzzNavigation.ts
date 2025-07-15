
import { useLocation } from "wouter";
import { useWouterNavigation } from "../useWouterNavigation";

export function useBuzzNavigation() {
  const { navigate } = useWouterNavigation();
  const [location] = useLocation();

  const navigateToPaymentMethods = (vagueClueTxt: string, isRegularBuzz: boolean = true) => {
    // Use query parameters instead of state since Wouter doesn't support state
    const params = new URLSearchParams({
      fromBuzz: 'true',
      fromRegularBuzz: isRegularBuzz.toString(),
      clue: vagueClueTxt,
      generateMapArea: 'false'
    });
    navigate(`/payment-methods?${params.toString()}`);
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
