// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EmailVerificationDialogProps {
  isOpen: boolean;
  email: string;
  onResendEmail: () => void;
  isResending: boolean;
}

export const EmailVerificationDialog: React.FC<EmailVerificationDialogProps> = ({
  isOpen,
  email,
  onResendEmail,
  isResending
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-black/90 border border-cyan-500/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-xl font-bold">
            📧 Verifica la tua email
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 mb-4"
          >
            <Mail className="w-8 h-8 text-cyan-400" />
          </motion.div>
          
          <h3 className="text-lg font-bold text-white mb-2">
            Controlla la tua email
          </h3>
          
          <p className="text-white/70 mb-4">
            Abbiamo inviato un link di verifica a:
          </p>
          
          <p className="text-cyan-400 font-mono text-sm mb-6 bg-black/30 p-2 rounded">
            {email}
          </p>
          
          <p className="text-white/60 text-sm mb-6">
            Clicca sul link nell'email per completare la verifica dell'identità e attivare il tuo Codice Agente personale.
          </p>
          
          <Button
            onClick={onResendEmail}
            disabled={isResending}
            variant="outline"
            className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Invio in corso...
              </>
            ) : (
              'Reinvia email di verifica'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationDialog;