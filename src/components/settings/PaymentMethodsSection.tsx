
import { useState } from "react";
import { CreditCard, Plus, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import AddPaymentMethodDialog from "@/components/payments/AddPaymentMethodDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PaymentMethodsSection = () => {
  const { paymentMethods, loading, deletePaymentMethod, setDefaultPaymentMethod } = usePaymentMethods();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const getBrandIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower.includes('visa')) return '💳';
    if (brandLower.includes('mastercard')) return '💳';
    if (brandLower.includes('amex')) return '💳';
    return '💳';
  };

  const handleDelete = async (paymentMethodId: string) => {
    try {
      await deletePaymentMethod(paymentMethodId);
      toast.success('Metodo di pagamento rimosso');
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Errore nella rimozione del metodo di pagamento');
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      await setDefaultPaymentMethod(paymentMethodId);
    } catch (error) {
      console.error('Error setting default:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 text-white">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Caricamento metodi di pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-white">
      {paymentMethods.length === 0 ? (
        <div className="text-center py-8 border border-white/10 rounded-lg bg-black/20">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Nessun metodo di pagamento salvato</p>
          <Button 
            onClick={() => setShowAddDialog(true)}
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
                <span className="text-2xl mr-3">{getBrandIcon(method.brand)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium capitalize">
                      {method.brand} •••• {method.last4}
                    </p>
                    {method.is_default && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scade {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!method.is_default && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSetDefault(method.id)}
                    className="rounded-lg"
                  >
                    Predefinito
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Rimuovi metodo di pagamento</AlertDialogTitle>
                      <AlertDialogDescription>
                        Sei sicuro di voler rimuovere questa carta? Questa azione non può essere annullata.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(method.id)}>
                        Rimuovi
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full rounded-lg"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Nuovo Metodo
          </Button>
        </div>
      )}

      <AddPaymentMethodDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};

export default PaymentMethodsSection;
