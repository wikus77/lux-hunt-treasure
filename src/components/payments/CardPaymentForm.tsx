
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

interface CardPaymentFormProps {
  onSuccess?: () => void;
  onSubmit?: () => void;
}

const CardPaymentForm = ({ onSuccess, onSubmit }: CardPaymentFormProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSubmit) onSubmit();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="p-4 border border-projectx-deep-blue rounded-md">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-5 w-5 text-projectx-blue" />
        <span className="font-medium">Carta di credito o debito</span>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm mb-1">
                Numero carta
              </label>
              <input
                type="text"
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                className="w-full p-2 rounded-md bg-transparent border border-gray-700 focus:border-projectx-blue focus:outline-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expDate" className="block text-sm mb-1">
                  Data scadenza
                </label>
                <input
                  type="text"
                  id="expDate"
                  placeholder="MM/YY"
                  className="w-full p-2 rounded-md bg-transparent border border-gray-700 focus:border-projectx-blue focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="cvv" className="block text-sm mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  placeholder="123"
                  className="w-full p-2 rounded-md bg-transparent border border-gray-700 focus:border-projectx-blue focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label htmlFor="cardName" className="block text-sm mb-1">
                Nome sulla carta
              </label>
              <input
                type="text"
                id="cardName"
                placeholder="Nome Cognome"
                className="w-full p-2 rounded-md bg-transparent border border-gray-700 focus:border-projectx-blue focus:outline-none transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
          >
            Paga ora
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CardPaymentForm;
