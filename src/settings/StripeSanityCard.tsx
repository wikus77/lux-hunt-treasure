/**
 * © 2025 Joseph MULÉ – M1SSION™ – STRIPE SANITY TEST CARD
 * Dev/Admin only - 100 M1U purchase sanity check
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CreditCard, CheckCircle } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth';

export const StripeSanityCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [lastTest, setLastTest] = useState<any>(null);
  const { user } = useAuthContext();

  const runSanityTest = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setLoading(true);
    try {
      // Create payment intent for 100 M1U (sanity test amount)
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: 100, // 1 EUR = 100 cents (minimal test)
          currency: 'eur',
          credits: 100,
          payment_type: 'sanity_test',
          metadata: {
            user_id: user.id,
            email: user.email,
            test_mode: 'sanity',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      toast.success('✅ Payment intent creato per test sanity');
      setLastTest({
        paymentIntentId: data.paymentIntent,
        amount: 100,
        m1u: 100,
        timestamp: new Date().toISOString()
      });

      // NOTE: In a real test, the user would complete payment via Stripe Elements
      // For now, just log the intent creation
      console.log('[StripeSanity] Payment intent created:', data);

    } catch (error: any) {
      console.error('[StripeSanity] Error:', error);
      toast.error('❌ Test fallito: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const checkSanityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .eq('event_type', 'stripe_sanity_ok')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data && data.length > 0) {
        toast.success(`✅ Trovati ${data.length} log sanity_ok recenti`);
        console.log('[StripeSanity] Recent logs:', data);
      } else {
        toast.info('ℹ️ Nessun log sanity_ok trovato');
      }
    } catch (error: any) {
      console.error('[StripeSanity] Failed to fetch logs:', error);
      toast.error('❌ Errore lettura log');
    }
  };

  return (
    <Card className="border-purple-500/20 bg-purple-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Stripe Sanity Test
        </CardTitle>
        <CardDescription>
          Test acquisto 100 M1U per verifica Stripe (dev/admin only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runSanityTest}
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creazione payment intent...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Crea Payment Intent (100 M1U)
            </>
          )}
        </Button>

        <Button
          onClick={checkSanityLogs}
          variant="ghost"
          className="w-full"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Verifica Log stripe_sanity_ok
        </Button>

        {lastTest && (
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm">
            <div className="font-medium">Ultimo test:</div>
            <div className="text-xs mt-1 space-y-1 opacity-80">
              <div>Payment Intent: {lastTest.paymentIntentId?.substring(0, 20)}...</div>
              <div>Amount: €{(lastTest.amount / 100).toFixed(2)}</div>
              <div>M1U: {lastTest.m1u}</div>
              <div>{new Date(lastTest.timestamp).toLocaleString('it-IT')}</div>
            </div>
          </div>
        )}

        <div className="text-xs opacity-60 p-2 bg-muted/30 rounded">
          ⚠️ Questo crea solo il payment intent. Per completare il test, usa Stripe Elements
          o Dashboard Stripe per confermare il pagamento.
        </div>
      </CardContent>
    </Card>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
