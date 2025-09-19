// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { toast } from "sonner";

interface PaymentError {
  message?: string;
  code?: string;
  type?: string;
  status?: number;
}

export class PaymentErrorHandler {
  private static logAnalyticsEvent(eventName: string, data: any) {
    if (import.meta.env.PROD) {
      // Analytics event for production
      (window as any).gtag?.('event', eventName, data);
    } else {
      console.log(`Analytics Event: ${eventName}`, data);
    }
  }

  static async handlePaymentError(error: any, context = 'payment') {
    let userMessage = 'Errore nella creazione del pagamento. Riprova tra poco.';
    let errorCode = 'unknown';

    // Detect network/CORS errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      userMessage = 'Errore di connessione. Controlla la tua connessione internet.';
      errorCode = 'network_error';
    } else if (error?.status === 0 || [502, 503, 504].includes(error?.status)) {
      userMessage = 'Servizio temporaneamente non disponibile. Riprova tra poco.';
      errorCode = 'service_unavailable';
    } else if (error?.message?.includes('CORS') || error?.code === 'CORS_ERROR') {
      userMessage = 'Errore di configurazione. Contatta il supporto.';
      errorCode = 'cors_error';
    } else if (error?.type === 'stripe_error') {
      userMessage = 'Errore del sistema di pagamento. Riprova o contatta il supporto.';
      errorCode = 'stripe_error';
    }

    // Show user-friendly toast
    toast.error(userMessage, {
      duration: 5000,
      position: 'top-center'
    });

    // Log analytics event
    this.logAnalyticsEvent('payment_error', {
      context,
      error_code: errorCode,
      error_message: error?.message || 'Unknown error',
      timestamp: Date.now()
    });

    return { handled: true, userMessage, errorCode };
  }

  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 1,
    baseDelay = 500
  ): Promise<T> {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error?.status === 400 || error?.status === 401 || error?.status === 403) {
          throw error;
        }
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry with jitter
        const delay = baseDelay + Math.random() * 300;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
}