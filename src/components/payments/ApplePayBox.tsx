// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// 🏪 STORE COMPLIANCE: This component is for WEB/PWA ONLY
// iOS native MUST use Apple IAP (StoreKit), not Stripe Apple Pay

import { Button } from "@/components/ui/button";
import { CreditCardIcon, AppleIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { isCapacitorIOS, isCapacitorNative } from "@/utils/capacitor";
import { isWalletPaymentAllowed } from "@/lib/stripe/guard";

interface ApplePayBoxProps {
  onApplePay: () => void;
}

const ApplePayBox = ({ onApplePay }: ApplePayBoxProps) => {
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);

  useEffect(() => {
    // 🛡️ STORE COMPLIANCE: Block on iOS native - must use IAP
    if (isCapacitorIOS() && isCapacitorNative()) {
      console.log('[ApplePayBox] ❌ Blocked on iOS native - use Apple IAP');
      setIsApplePayAvailable(false);
      return;
    }
    
    // Block if wallet payments not allowed on platform
    if (!isWalletPaymentAllowed()) {
      console.log('[ApplePayBox] ❌ Wallet payments blocked on this platform');
      setIsApplePayAvailable(false);
      return;
    }

    // Check if Apple Pay is available (web/PWA only)
    const checkApplePayAvailability = () => {
      if (typeof window.ApplePaySession !== 'undefined' && window.ApplePaySession?.canMakePayments()) {
        setIsApplePayAvailable(true);
      } else {
        setIsApplePayAvailable(false);
      }
    };

    checkApplePayAvailability();
  }, []);

  const handleClick = () => {
    console.log("Apple Pay button clicked");
    onApplePay();
  };

  if (!isApplePayAvailable) {
    return (
      <div className="text-center p-4">
        <div className="border border-gray-700 rounded-md p-6 mb-4 bg-gray-900">
          <CreditCardIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="mb-6 text-gray-400">Apple Pay non è disponibile su questo dispositivo</p>
          <Button
            disabled={true}
            className="w-full bg-gray-700 cursor-not-allowed"
          >
            Apple Pay non disponibile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center p-4">
      <div className="border border-gray-700 rounded-md p-6 mb-4">
        <div className="flex items-center justify-center mb-4">
          <AppleIcon className="h-12 w-12" />
        </div>
        <p className="mb-6">Paga in modo veloce e sicuro con Apple Pay</p>
        <Button
          onClick={handleClick}
          className="w-full bg-black hover:bg-gray-900 text-white font-medium"
        >
          Paga con Apple Pay
        </Button>
      </div>
    </div>
  );
};

export default ApplePayBox;

