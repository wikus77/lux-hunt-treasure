
import { Button } from "@/components/ui/button";
import { AppleIcon } from "lucide-react";

interface ApplePayBoxProps {
  onApplePay?: () => void;
  onSuccess?: () => void;
}

const ApplePayBox = ({ onApplePay, onSuccess }: ApplePayBoxProps) => {
  const handleClick = () => {
    if (onApplePay) onApplePay();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="text-center p-4">
      <div className="border border-projectx-deep-blue rounded-md p-6 mb-4">
        <AppleIcon className="h-12 w-12 mx-auto mb-4" />
        <p className="mb-6">Paga in modo rapido e sicuro con Apple Pay</p>
        <Button
          onClick={handleClick}
          className="w-full bg-black text-white border border-white"
        >
          Paga con Apple Pay
        </Button>
      </div>
    </div>
  );
};

export default ApplePayBox;
