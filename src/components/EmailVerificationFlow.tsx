// M1SSION™ - Email Verification Flow for iOS Capacitor
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight,
  Clock,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { preserveFunctionName } from '@/utils/iosCapacitorFunctions';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';
import { toast } from 'sonner';

interface EmailVerificationFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified?: () => void;
}

export const EmailVerificationFlow: React.FC<EmailVerificationFlowProps> = ({
  open,
  onOpenChange,
  onVerified
}) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [lastSentTime, setLastSentTime] = useState<Date | null>(null);
  const { user } = useAuth();
  const { vibrate } = useCapacitorHardware();

  // Check verification status
  const checkVerificationStatus = preserveFunctionName(async () => {
    if (!user) return;

    try {
      const { data: { user: refreshedUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error checking verification:', error);
        return;
      }

      if (refreshedUser?.email_confirmed_at) {
        setIsVerified(true);
        await vibrate(50);
        toast.success('Email verificata con successo!');
        
        if (onVerified) {
          onVerified();
        }
        
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Error in checkVerificationStatus:', err);
    }
  }, 'checkVerificationStatus');

  // Resend verification email
  const resendVerificationEmail = preserveFunctionName(async () => {
    if (!user?.email || countdown > 0) return;

    try {
      setIsResending(true);
      await vibrate(30);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Error resending verification:', error);
        toast.error('Errore nell\'invio dell\'email');
        return;
      }

      setLastSentTime(new Date());
      setCountdown(60); // 60 seconds cooldown
      toast.success('Email di verifica inviata!');

    } catch (err) {
      console.error('Error in resendVerificationEmail:', err);
      toast.error('Errore nell\'operazione');
    } finally {
      setIsResending(false);
    }
  }, 'resendVerificationEmail');

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check status periodically
  useEffect(() => {
    if (!open || isVerified) return;

    const interval = setInterval(checkVerificationStatus, 3000);
    return () => clearInterval(interval);
  }, [open, isVerified, user]);

  // Initial check when user changes
  useEffect(() => {
    if (user?.email_confirmed_at) {
      setIsVerified(true);
    }
  }, [user]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-[#00D1FF]" />
            Verifica Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isVerified ? (
            /* Verified State */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Email Verificata!
                </h3>
                <p className="text-gray-400">
                  Il tuo account è ora completamente attivo
                </p>
              </div>

              <Badge className="bg-green-500 text-white">
                <Shield className="w-4 h-4 mr-1" />
                Account Sicuro
              </Badge>
            </motion.div>
          ) : (
            /* Verification Pending State */
            <div className="space-y-6">
              {/* Status */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-[#00D1FF]/20 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-[#00D1FF]" />
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Verifica la tua Email
                  </h3>
                  <p className="text-gray-400">
                    Abbiamo inviato un link di verifica a:
                  </p>
                  <p className="text-[#00D1FF] font-semibold mt-1">
                    {user?.email}
                  </p>
                </div>

                <Badge variant="outline" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Verifica Richiesta
                </Badge>
              </div>

              {/* Instructions */}
              <Card className="bg-gray-800/30 border-gray-600/30">
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-semibold text-white mb-3">
                    Come completare la verifica:
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-[#00D1FF] rounded-full flex items-center justify-center text-xs font-bold text-black mt-0.5">
                        1
                      </div>
                      <span className="text-gray-300">
                        Controlla la tua casella email
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-[#00D1FF] rounded-full flex items-center justify-center text-xs font-bold text-black mt-0.5">
                        2
                      </div>
                      <span className="text-gray-300">
                        Clicca sul link di verifica
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-[#00D1FF] rounded-full flex items-center justify-center text-xs font-bold text-black mt-0.5">
                        3
                      </div>
                      <span className="text-gray-300">
                        Torna all'app per continuare
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={checkVerificationStatus}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Controlla Stato
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resendVerificationEmail}
                  disabled={isResending || countdown > 0}
                >
                  {isResending ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-[#00D1FF] border-t-transparent rounded-full mr-2"
                      />
                      Inviando...
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Reinvia tra {formatCountdown(countdown)}
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Reinvia Email
                    </>
                  )}
                </Button>
              </div>

              {/* Last Sent Info */}
              {lastSentTime && (
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Ultima email inviata: {lastSentTime.toLocaleTimeString('it-IT')}
                  </p>
                </div>
              )}

              {/* Help */}
              <Card className="bg-yellow-500/10 border-yellow-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-1">
                        Non ricevi l'email?
                      </h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Controlla la cartella spam/junk</li>
                        <li>• Verifica che l'indirizzo sia corretto</li>
                        <li>• Attendi qualche minuto</li>
                        <li>• Usa il pulsante "Reinvia Email"</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-700/50">
            <p className="text-xs text-gray-500">
              La verifica email è richiesta per la sicurezza del tuo account
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationFlow;