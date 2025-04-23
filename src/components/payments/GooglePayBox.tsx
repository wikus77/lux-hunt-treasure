
import { Button } from "@/components/ui/button";

// Google Pay official SVG logo (as per Google guidelines).
const GooglePayLogo = () => (
  <svg width="72" height="32" viewBox="0 0 72 32" fill="none" className="mx-auto mb-4" aria-label="Google Pay logo">
    <rect width="72" height="32" rx="8" fill="#fff"/>
    <g>
      <svg x="10" y="7" width="24" height="18" viewBox="0 0 46 18">
        <g>
          <path fill="#4285F4" d="M8.33 10.8a5.3 5.3 0 0 1-.07-1.04c0-.36.06-.71.07-1.04H4.22v2.08H6.6c-.07.4-.3 1.02-.86 1.44l.01.09 1.26.98.09.01c.82-.75 1.3-1.85 1.3-3.16"/>
          <path fill="#34A853" d="M4.22 14a5.32 5.32 0 0 0 3.74-1.36l-1.43-1.11c-.4.27-.92.42-1.46.42-1.12 0-2.06-.75-2.39-1.76l-.09.01-1.4 1.09v.08A5.79 5.79 0 0 0 4.22 14"/>
          <path fill="#FBBC05" d="M1.83 10.19A2.52 2.52 0 0 1 1.7 9.6c0-.2.04-.39.07-.59l-.01-.08-1.41-1.1-.05.08A5.228 5.228 0 0 0 0 10c0 .33.05.64.1.95l1.46-1.15c.13.43.44.8.83 1.04"/>
          <path fill="#EA4335" d="M4.22 7.67c.79 0 1.32.34 1.62.62l1.19-1.15C6.92 6.26 6.03 5.81 4.22 5.81a5.3 5.3 0 0 0-5 3.06l1.46 1.15C1.98 8.43 2.98 7.67 4.22 7.67"/>
        </g>
        <text x="9.5" y="10.5" fontSize="8" fill="#222" fontFamily="Arial,sans-serif" fontWeight="bold">Pay</text>
      </svg>
    </g>
  </svg>
);

interface GooglePayBoxProps {
  onGooglePay?: () => void;
}

const GooglePayBox = ({ onGooglePay }: GooglePayBoxProps) => {
  const handleGooglePayClick = () => {
    if (onGooglePay) {
      onGooglePay();
    } else {
      // Comportamento predefinito se non viene fornita una callback
      window.open("https://pay.google.com/about/", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="text-center p-4">
      <div className="border border-projectx-deep-blue rounded-md p-6 mb-4 bg-white">
        <GooglePayLogo />
        <p className="mb-6 text-black">Paga in modo rapido e sicuro con <b>Google Pay</b></p>
        <Button
          onClick={handleGooglePayClick}
          className="w-full bg-white text-black border border-gray-300 flex items-center justify-center gap-2"
          aria-label="Procedi con Google Pay"
        >
          <GooglePayLogo />
        </Button>
        <span className="block text-xs mt-2 text-muted-foreground">Pagamento gestito tramite Google Pay</span>
      </div>
    </div>
  );
};

export default GooglePayBox;
