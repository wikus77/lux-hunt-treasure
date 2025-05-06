
import { Button } from "@/components/ui/button";
import { CreditCardIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface GooglePayBoxProps {
  onGooglePay: () => void;
}

const GooglePayBox = ({ onGooglePay }: GooglePayBoxProps) => {
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);

  useEffect(() => {
    // Check if Google Pay is available
    const checkGooglePayAvailability = () => {
      if (typeof window.google !== 'undefined' && typeof window.google.payments !== 'undefined') {
        setIsGooglePayAvailable(true);
      } else {
        // If the Google Pay API is not available yet, we can attempt to load it
        const script = document.createElement('script');
        script.src = 'https://pay.google.com/gp/p/js/pay.js';
        script.onload = () => {
          if (typeof window.google !== 'undefined' && typeof window.google.payments !== 'undefined') {
            setIsGooglePayAvailable(true);
          }
        };
        document.head.appendChild(script);
      }
    };

    checkGooglePayAvailability();
  }, []);

  const handleClick = () => {
    console.log("Google Pay button clicked");
    onGooglePay();
  };

  if (!isGooglePayAvailable) {
    return (
      <div className="text-center p-4">
        <div className="border border-projectx-deep-blue rounded-md p-6 mb-4 bg-gray-900">
          <CreditCardIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="mb-6 text-gray-400">Google Pay non è disponibile su questo dispositivo</p>
          <Button
            disabled={true}
            className="w-full bg-gray-700 cursor-not-allowed"
          >
            Google Pay non disponibile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center p-4">
      <div className="border border-projectx-deep-blue rounded-md p-6 mb-4">
        <div className="flex items-center justify-center mb-4">
          {/* Google Pay logo container */}
          <div className="h-12 w-40 bg-white rounded-md flex items-center justify-center">
            <div className="google-pay-logo flex items-center justify-center">
              <svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.6,9.8L3.6,14.4L8.4,14.4C8.1,16.1 6.5,17.4 3.7,17.4C1,17.4 -1,15.4 -1,12.8C-1,10.2 1,8.2 3.7,8.2C5.1,8.2 6.2,8.6 7,9.4L10.4,6C8.6,4.3 6.5,3.3 3.7,3.3C-1.6,3.3 -6,7.4 -6,12.7C-6,18 -1.6,22.1 3.7,22.1C9.7,22.1 13.6,18.2 13.6,12.9C13.6,12.2 13.6,11.4 13.5,10.8L3.6,10.8L3.6,9.8Z" transform="translate(7 5)" fill="#4285F4"/>
                <path d="M-6,4.9L-2.9,7.1C-1.9,5.6 -0.3,4.8 1.5,4.8C3.3,4.8 4.8,5.8 5.1,7.4L8.7,4.8C7.5,2.4 4.6,0.600006 1.5,0.600006C-2,0.600006 -4.9,2.5 -6,4.9Z" transform="translate(25 16.4)" fill="#EA4335"/>
                <path d="M1.2,8.9C-1,8.9 -2.8,7.1 -2.8,4.8C-2.8,2.5 -1,0.700001 1.2,0.700001C2.9,0.700001 4.1,1.5 4.9,2.7L8.1,0.5C6.5,-1.7 4,-3 1.2,-3C-3.9,-3 -8,-0.1 -8,4.8C-8,9.7 -3.9,12.6 1.2,12.6C4,-12.4 6.5,-11.1 8.2,-8.8L5.1,-6.7C4.1,-8.3 2.9,-8.9 1.2,-8.9Z" transform="translate(39 12.2)" fill="#FBBC05"/>
                <path d="M-6,5.1C-6,9.8 -2.2,12.9 1.8,12.9C4.2,12.9 6,12 7.2,10.8L7.2,12.5L11.5,12.5L11.5,-12L7.2,-12L7.2,-7.1C6.1,-8.4 4.3,-9.1 1.8,-9.1C-2.2,-9.1 -6,-6 -6,-1.3L-6,5.1ZM1.8,-4.8C4.3,-4.8 6.3,-2.9 6.3,0.100001C6.3,3.1 4.3,5 1.8,5C-0.9,5 -1.7,2.9 -1.7,0.0999986C-1.6,-2.9 -0.9,-4.8 1.8,-4.8Z" transform="translate(57.5 14.5)" fill="#4285F4"/>
                <path d="M11.2,0.300003C11.2,-4.3 7.6,-8 2.7,-8C-2.3,-8 -6,-4.2 -6,0.400002C-6,5 -2.2,8.8 2.7,8.8C6.2,8.8 9,6.5 10,3.6L6,1.8C5.5,3.2 4.2,4 2.7,4C0.777778,4 -0.722222,2.9 -1.1,1.3L10.8,-2.4L11.2,0.300003ZM-1.1,-1.4C-1.6,-3 0.0999991,-4.1 2.7,-4.1C3.9,-4.1 5,-3.5 5.3,-2.5L-1.1,-1.4Z" transform="translate(75 14)" fill="#EA4335"/>
              </svg>
            </div>
          </div>
        </div>
        <p className="mb-6">Paga in modo veloce e sicuro con Google Pay</p>
        <Button
          onClick={handleClick}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium"
        >
          Paga con Google Pay
        </Button>
      </div>
    </div>
  );
};

export default GooglePayBox;

