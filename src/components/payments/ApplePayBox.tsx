
import { Button } from "@/components/ui/button";

// Apple Pay official SVG logo (Apple guidelines).
const ApplePayLogo = () => (
  <svg width="72" height="32" viewBox="0 0 72 32" fill="none" className="mx-auto mb-4" aria-label="Apple Pay logo">
    <rect width="72" height="32" rx="8" fill="black"/>
    <g>
      <path fill="#fff" d="M18.61 16.14c-.01-1.36 1.14-2.01 1.19-2.03-.65-.95-1.65-1.08-2-1.09-.86-.09-1.68.5-2.12.5-.44 0-1.12-.48-1.84-.47-1.01.02-1.94.59-2.46 1.5-1.05 1.82-.27 4.52.75 6 0 0 .67 1.01 1.74.99.7-.02 1.31-.5 1.82-.5.5 0 1.06.49 1.8.48.84-.01 1.33-.48 1.81-.97.58-.7.82-1.38.83-1.41-.02-.01-1.57-.6-1.59-2.35zm-1.98-3.7c.34-.4.57-.96.5-1.53-.48.02-1.06.32-1.4.73-.31.37-.59.94-.48 1.48.52.04 1.05-.26 1.38-.68zm6.08 1.48h-1.49v5.64h1.49V13.92zm2.78 4.21c0-.66.07-1.31.25-1.91.38-1.21 1.41-2.06 2.88-2.06 1.75 0 2.66 1.24 2.66 2.9v2.95h-1.48v-2.79c0-.85-.22-1.5-1.05-1.5-.59 0-1.1.46-1.26 1.02-.08.28-.13.61-.13.96v2.31h-1.47V15.39zm9.12-.29c-.01-.71-.59-1.17-1.5-1.17-.72 0-1.18.34-1.18.84 0 .41.32.75 1.02.87l.62.11c1.46.24 2.12.6 2.12 1.71 0 1.09-.87 1.74-2.21 1.74-1.44 0-2.33-.64-2.38-1.81h1.44c.05.45.43.81 1.02.81.53 0 .93-.21.93-.72 0-.41-.33-.59-1.08-.73l-.57-.09c-1.38-.23-1.94-.7-1.94-1.66 0-.97.83-1.62 2.08-1.62 1.23 0 2.04.61 2.08 1.65h-1.39zm7.63 2.55V13.92h-1.46v.85h-.03c-.24-.41-.97-.97-2.08-.97-1.33 0-2.22.79-2.22 2.1v2.86h1.46v-2.59c0-.7.29-1.15 1.09-1.15.63 0 1.11.42 1.11 1.11v2.63h1.47zm1.2-4.38h1.3l.91 2.59h.02l.89-2.59h1.29l-1.87 4.98h-1.37zm7.33.38v4.6h-1.46v-4.6h1.46zm2.51 0v4.6h-1.47v-4.6h1.47zm.77 1.46h1.07c.22 0 .52.02.69.35.21.41 0 .97 0 .97H44.6l-.07-.16c-.04-.07-.09-.2-.09-.38 0-.38.27-.74.73-.78.13 0 .23-.01.37-.01zm-1.07-1.46c-.95 0-1.36.67-1.36 1.25v2.87c0 .58.41 1.24 1.36 1.24h2.45c.95 0 1.37-.66 1.37-1.25v-2.85c0-.59-.42-1.26-1.37-1.26h-2.45zm6.75 1.46h.98v3.14h-1.46v-2.25c.01-.63.3-1.11.48-1.17zm4.41 3.13l-.56-1.2h-2.33l-.56 1.2h-1.58l2.23-4.98h1.18l2.17 4.98h-1.55zm-1.72-2.85l-.82 1.71h1.65z"/>
    </g>
  </svg>
);

interface ApplePayBoxProps {
  onApplePay?: () => void;
}

const ApplePayBox = ({ onApplePay }: ApplePayBoxProps) => {
  const handleApplePayClick = () => {
    if (onApplePay) {
      onApplePay();
    } else {
      // Comportamento predefinito se non viene fornita una callback
      window.open("https://support.apple.com/it-it/HT201469", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="text-center p-4">
      <div className="border border-projectx-deep-blue rounded-md p-6 mb-4 bg-black">
        <ApplePayLogo />
        <p className="mb-6 text-white">Paga in modo rapido e sicuro con <b>Apple Pay</b></p>
        <Button
          onClick={handleApplePayClick}
          className="w-full bg-black text-white border border-white flex items-center justify-center gap-2"
          aria-label="Procedi con Apple Pay"
        >
          <ApplePayLogo />
        </Button>
        <span className="block text-xs mt-2 text-muted-foreground">Pagamento gestito tramite Apple Pay</span>
      </div>
    </div>
  );
};

export default ApplePayBox;
