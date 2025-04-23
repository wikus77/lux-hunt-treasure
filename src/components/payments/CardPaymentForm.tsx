
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

interface CardPaymentFormProps {
  onSubmit: (card: { cardNumber: string; cardholderName: string; expiryDate: string; cvv: string }) => void;
}

const CardPaymentForm: React.FC<CardPaymentFormProps> = ({ onSubmit }) => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(cardDetails);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
            Numero della Carta
          </label>
          <Input
            id="cardNumber"
            name="cardNumber"
            value={cardDetails.cardNumber}
            onChange={handleInputChange}
            placeholder="1234 5678 9012 3456"
            required
          />
        </div>
        <div>
          <label htmlFor="cardholderName" className="block text-sm font-medium mb-1">
            Nome del Titolare
          </label>
          <Input
            id="cardholderName"
            name="cardholderName"
            value={cardDetails.cardholderName}
            onChange={handleInputChange}
            placeholder="Mario Rossi"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium mb-1">
              Data di Scadenza
            </label>
            <Input
              id="expiryDate"
              name="expiryDate"
              value={cardDetails.expiryDate}
              onChange={handleInputChange}
              placeholder="MM/AA"
              required
            />
          </div>
          <div>
            <label htmlFor="cvv" className="block text-sm font-medium mb-1">
              CVV
            </label>
            <Input
              id="cvv"
              name="cvv"
              value={cardDetails.cvv}
              onChange={handleInputChange}
              placeholder="123"
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
        >
          Salva Carta
        </Button>
      </div>
    </form>
  );
};

export default CardPaymentForm;
