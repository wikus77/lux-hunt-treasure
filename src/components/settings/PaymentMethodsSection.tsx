
import { useState } from "react";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentMethodsSection = () => {
  const [paymentMethods] = useState([
    {
      id: 1,
      type: "card",
      last4: "4242",
      brand: "Visa",
      expiryMonth: 12,
      expiryYear: 2025
    }
  ]);

  return (
    <div className="space-y-4 text-white">
      {paymentMethods.length === 0 ? (
        <div className="text-center py-8 border border-white/10 rounded-lg bg-black/20">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Nessun metodo di pagamento salvato</p>
          <Button 
            className="bg-gradient-to-r from-projectx-blue to-projectx-pink rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Carta
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-black/20">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-3 text-projectx-neon-blue" />
                <div>
                  <p className="font-medium">{method.brand} •••• {method.last4}</p>
                  <p className="text-sm text-muted-foreground">
                    Scade {method.expiryMonth}/{method.expiryYear}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Nuovo Metodo
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsSection;
