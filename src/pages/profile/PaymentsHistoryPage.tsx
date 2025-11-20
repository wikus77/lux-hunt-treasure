// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Download, CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method_brand?: string;
  last4?: string;
  description?: string;
  created_at: string;
  stripe_payment_intent_id?: string;
}

const PaymentsHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([]);

  console.log('💳 PaymentsHistoryPage: Component rendered - loading payment history');

  useEffect(() => {
    if (user) {
      console.log('💳 PaymentsHistoryPage: User authenticated, loading payment history');
      loadPaymentHistory();
    }
  }, [user]);

  const loadPaymentHistory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('🧾 Loading payment history for user:', user.id);
      
      const { data: transactions, error } = await supabase
        .from('user_payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error loading payment history:', error);
        toast({
          title: "❌ Errore caricamento",
          description: "Impossibile caricare la cronologia pagamenti.",
          variant: "destructive"
        });
        setPaymentTransactions([]);
      } else {
        console.log('✅ Payment history loaded:', transactions?.length || 0, 'transactions');
        setPaymentTransactions(transactions || []);
      }
    } catch (error) {
      console.error('❌ Error in loadPaymentHistory:', error);
      setPaymentTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Convert from cents
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
      case 'canceled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
      case 'paid':
        return <Badge className="bg-green-600 text-white">Completato</Badge>;
      case 'failed':
      case 'canceled':
        return <Badge className="bg-red-600 text-white">Fallito</Badge>;
      case 'pending':
      case 'processing':
        return <Badge className="bg-yellow-600 text-white">In Elaborazione</Badge>;
      default:
        return <Badge className="bg-gray-600 text-white">Sconosciuto</Badge>;
    }
  };

  const downloadInvoice = (transactionId: string) => {
    toast({
      title: "📥 Download fattura",
      description: `Avviato download della fattura per la transazione ${transactionId.substring(0, 8)}...`,
    });
    
    // In a real implementation, this would call a Supabase function to generate/download the invoice
    console.log('🧾 Download invoice for transaction:', transactionId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-b from-[#131524]/70 to-black text-white"
    >
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings/payments')}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-orbitron font-bold text-white">
              Cronologia Pagamenti
            </h1>
            <p className="text-white/60 text-sm">
              Visualizza tutti i tuoi pagamenti e transazioni M1SSION™
            </p>
          </div>
        </div>

        {/* Payment History */}
        <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white font-orbitron">
              <Calendar className="h-5 w-5" />
              Transazioni Recenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-[#00D1FF] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-white/60">Caricamento cronologia...</p>
              </div>
            ) : paymentTransactions.length > 0 ? (
              <div className="space-y-4">
                {paymentTransactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10 hover:border-[#00D1FF]/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(transaction.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium text-white">
                            {transaction.description || `Pagamento M1SSION™`}
                          </p>
                          {getStatusBadge(transaction.status)}
                        </div>
                        <p className="text-sm text-white/60">
                          {formatDate(transaction.created_at)}
                          {transaction.payment_method_brand && transaction.last4 && (
                            <span className="ml-2">
                              • {transaction.payment_method_brand} ••••{transaction.last4}
                            </span>
                          )}
                        </p>
                        {transaction.stripe_payment_intent_id && (
                          <p className="text-xs text-white/40 mt-1">
                            ID: {transaction.stripe_payment_intent_id}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-white">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadInvoice(transaction.id)}
                        className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Nessun Pagamento Registrato</h3>
                <p className="text-white/60 mb-6 max-w-md mx-auto">
                  Le tue transazioni M1SSION™ appariranno qui dopo il primo pagamento o acquisto.
                </p>
                <Button
                  onClick={() => navigate('/subscriptions')}
                  className="bg-[#00D1FF] hover:bg-[#00B8E6] text-black font-semibold"
                >
                  Esplora i Piani M1SSION™
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Info */}
        {paymentTransactions.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Mostrando {paymentTransactions.length} transazioni recenti
            </p>
            <p className="text-white/30 text-xs mt-2">
              Per assistenza su pagamenti, contatta il supporto M1SSION™
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PaymentsHistoryPage;