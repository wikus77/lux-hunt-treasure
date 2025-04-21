
import { Button } from "@/components/ui/button";
import { GlobeIcon } from "lucide-react";

interface GooglePayBoxProps {
  onGooglePay: () => void;
}

const GooglePayBox = ({ onGooglePay }: GooglePayBoxProps) => (
  <div className="text-center p-4">
    <div className="border border-projectx-deep-blue rounded-md p-6 mb-4">
      <GlobeIcon className="h-12 w-12 mx-auto mb-4" />
      <p className="mb-6">Paga in modo rapido e sicuro con Google Pay</p>
      <Button
        onClick={onGooglePay}
        className="w-full bg-white text-black"
      >
        Paga con Google Pay
      </Button>
    </div>
  </div>
);

export default GooglePayBox;
