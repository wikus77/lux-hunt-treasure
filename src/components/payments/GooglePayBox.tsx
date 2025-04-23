
import { Button } from "@/components/ui/button";
import { CreditCardIcon } from "lucide-react";

interface GooglePayBoxProps {
  onGooglePay: () => void;
}

const GooglePayBox = ({ onGooglePay }: GooglePayBoxProps) => (
  <div className="text-center p-4">
    <div className="border border-projectx-deep-blue rounded-md p-6 mb-4">
      <CreditCardIcon className="h-12 w-12 mx-auto mb-4" />
      <p className="mb-6">Metodo di pagamento alternativo</p>
      <Button
        onClick={onGooglePay}
        className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
      >
        Procedi al pagamento
      </Button>
    </div>
  </div>
);

export default GooglePayBox;
