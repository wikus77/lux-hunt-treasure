// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Subscription Verification Component - Race Condition Fix

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const SubscriptionVerify: React.FC = () => {
  const [, setLocation] = useLocation();
  const [verificationState, setVerificationState] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [attemptCount, setAttemptCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const verifySubscription = async () => {
    try {
      console.log('🔍 M1SSION™ VERIFY: Starting subscription verification attempt', attemptCount + 1);
      
      // Get current authenticated user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error('Utente non autenticato');
      }

      console.log('✅ M1SSION™ VERIFY: User authenticated', userData.user.id);

      // Fetch user profile with subscription plan
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_tier, tier')
        .eq('id', userData.user.id)
        .single();

      if (profileError) {
        console.error('❌ M1SSION™ VERIFY: Profile fetch error', profileError);
        throw new Error('Errore nel caricamento del profilo');
      }

      console.log('📋 M1SSION™ VERIFY: Profile data received', profileData);

      // Check if subscription plan is valid
      const validPlans = ['SILVER', 'GOLD', 'BLACK', 'TITANIUM'];
      const userPlan = profileData.subscription_plan || profileData.subscription_tier || profileData.tier;

      if (validPlans.includes(userPlan)) {
        console.log('🎉 M1SSION™ VERIFY: Valid subscription plan found', userPlan);
        setVerificationState('success');
        
        // Redirect to panel after brief success display
        setTimeout(() => {
          setLocation('/panel-access');
        }, 1500);
        return;
      }

      // Plan not found, check if we should retry
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      if (newAttemptCount >= 5) {
        console.warn('⚠️ M1SSION™ VERIFY: Max attempts reached, showing error');
        setVerificationState('error');
        setErrorMessage('Errore di sincronizzazione. Il tuo abbonamento potrebbe richiedere alcuni minuti per essere attivato.');
      } else {
        console.log(`🔄 M1SSION™ VERIFY: Plan not found, retrying in 2 seconds (attempt ${newAttemptCount}/5)`);
        // Retry after 2 seconds
        setTimeout(() => {
          verifySubscription();
        }, 2000);
      }

    } catch (error) {
      console.error('❌ M1SSION™ VERIFY: Verification failed', error);
      setVerificationState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Errore di connessione');
    }
  };

  const handleRetry = () => {
    setVerificationState('verifying');
    setAttemptCount(0);
    setErrorMessage('');
    verifySubscription();
  };

  // Start verification on component mount
  useEffect(() => {
    // Initial delay to allow database update to complete
    const timer = setTimeout(() => {
      verifySubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-md mx-auto"
      >
        {/* M1SSION Logo */}
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          M1SSION™
        </motion.h1>

        {verificationState === 'verifying' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Loading animation */}
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                <motion.div 
                  className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                ></motion.div>
              </div>
            </div>

            <motion.h2 
              className="text-2xl font-bold text-white mb-4"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Verifica in corso...
            </motion.h2>

            <p className="text-gray-300 text-lg">
              Sincronizzazione abbonamento con sistema M1SSION™
            </p>

            <div className="text-sm text-gray-400">
              Tentativo {attemptCount + 1} di 5
            </div>
          </motion.div>
        )}

        {verificationState === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <motion.div 
              className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <h2 className="text-2xl font-bold text-green-400 mb-4">
              🎉 Abbonamento Verificato!
            </h2>

            <p className="text-gray-300">
              Accesso premium attivato. Reindirizzamento in corso...
            </p>
          </motion.div>
        )}

        {verificationState === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-red-400 mb-4">
              ⚠️ Errore di Sincronizzazione
            </h2>

            <p className="text-gray-300 mb-6">
              {errorMessage || 'Errore nella verifica dell\'abbonamento. Riprova tra qualche istante.'}
            </p>

            <div className="space-y-4">
              <Button
                onClick={handleRetry}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
              >
                🔄 Riprova Verifica
              </Button>

              <Button
                onClick={() => setLocation('/choose-plan')}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Torna alla Selezione Piano
              </Button>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div 
          className="mt-12 text-gray-500 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SubscriptionVerify;

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * M1SSION™ Subscription Verification - Race Condition Resolution
 */