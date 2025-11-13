// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1U Helper Functions

import { toast } from 'sonner';

/**
 * Mostra toast per saldo M1U insufficiente e suggerisce di acquistare pacchetti
 */
export const showInsufficientM1UToast = (required: number, current: number) => {
  toast.error(
    `Saldo M1U insufficiente`,
    {
      description: `Ti servono ${required} M1U, ma hai solo ${current} M1U. Acquista un pacchetto M1U per continuare.`,
      duration: 5000,
      action: {
        label: 'Acquista M1U',
        onClick: () => {
          // Trigger M1U shop modal opening
          window.dispatchEvent(new CustomEvent('open-m1u-shop'));
        }
      }
    }
  );
};

/**
 * Mostra toast generico di errore M1U
 */
export const showM1UErrorToast = (message: string) => {
  toast.error('Errore M1U', {
    description: message,
    duration: 4000
  });
};

/**
 * Mostra toast di successo addebito M1U
 */
export const showM1UDebitSuccessToast = (spent: number, newBalance: number) => {
  toast.success(
    `${spent} M1U spesi`,
    {
      description: `Nuovo saldo: ${newBalance} M1U`,
      duration: 3000
    }
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
