// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState } from 'react';
// SMOKE TEST PAGE - Can be removed at any time
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, TestTube } from 'lucide-react';

const BillingSmokeTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreatePaymentIntent = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/stripe-create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amountCents: 1000, // 10.00 EUR
          currency: 'eur'
        })
      });

      const data = await response.json();

      if (response.ok && data.clientSecret) {
        toast({
          title: "✅ Payment Intent Created",
          description: `Client Secret: ${data.clientSecret.substring(0, 20)}...`,
          duration: 5000,
        });
        console.log('Payment Intent Success:', data);
      } else {
        throw new Error(data.error || 'Failed to create Payment Intent');
      }
    } catch (error) {
      console.error('Payment Intent Error:', error);
      toast({
        title: "❌ Payment Intent Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <TestTube className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Stripe Smoke Test</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Intent Test
            </CardTitle>
            <CardDescription>
              Test Stripe live payment infrastructure without processing actual payments.
              This creates a Payment Intent for €10.00 to verify backend connectivity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p><strong>Test Amount:</strong> €10.00</p>
                <p><strong>Currency:</strong> EUR</p>
                <p><strong>Endpoint:</strong> stripe-create-payment-intent</p>
              </div>
              
              <Button 
                onClick={handleCreatePaymentIntent}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Creating Payment Intent...' : 'Create Payment Intent (€10)'}
              </Button>
              
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                <p><strong>Note:</strong> This is a smoke test page for development purposes. 
                It only creates Payment Intents without processing payments. 
                Check browser console for detailed responses.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingSmokeTest;