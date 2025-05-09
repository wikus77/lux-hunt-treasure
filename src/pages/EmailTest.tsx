
import React from 'react';
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useAuthContext } from '@/contexts/auth';
import EmailSender from '@/components/email/EmailSender';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const EmailTest: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="glass-card p-6 backdrop-blur-md border border-projectx-blue/10 rounded-xl mb-8">
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-projectx-blue to-projectx-pink bg-clip-text text-transparent">
            Sistema di Email Transazionali
          </h1>
          <p className="text-white/70 mb-4">
            Questa pagina ti permette di testare l'invio di email transazionali usando Resend.
          </p>

          {isAuthenticated ? (
            <Tabs defaultValue="sender">
              <TabsList className="mb-4">
                <TabsTrigger value="sender">Invia Email</TabsTrigger>
                <TabsTrigger value="info">Informazioni</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sender">
                <EmailSender />
              </TabsContent>
              
              <TabsContent value="info">
                <div className="space-y-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-2">Tipi di Email Supportati</h3>
                    <ul className="list-disc pl-6 text-white/80 space-y-2">
                      <li><strong>Benvenuto</strong> - Inviata quando un nuovo utente si registra</li>
                      <li><strong>Verifica Email</strong> - Per verificare l'indirizzo email dell'utente</li>
                      <li><strong>Reset Password</strong> - Per il recupero della password</li>
                      <li><strong>Notifica</strong> - Per inviare aggiornamenti e comunicazioni generali</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-2">Usi Comuni</h3>
                    <ul className="list-disc pl-6 text-white/80 space-y-2">
                      <li>Conferme di registrazione</li>
                      <li>Notifiche di attività dell'account</li>
                      <li>Aggiornamenti sulle missioni</li>
                      <li>Comunicazioni di marketing (con consenso)</li>
                      <li>Email transazionali automatiche</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-2">Implementazione Tecnica</h3>
                    <p className="text-white/80">
                      Il sistema utilizza Resend come provider per l'invio delle email, con un'integrazione 
                      tramite Supabase Edge Functions. Tutte le email sono inviate in modo sicuro dal backend,
                      senza esporre chiavi API nel frontend.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <h2 className="text-xl font-bold text-white mb-4">Accesso richiesto</h2>
              <p className="text-white/70 mb-6">
                Per utilizzare la funzionalità di invio email, è necessario effettuare l'accesso.
              </p>
              <Button onClick={() => navigate('/login')}>
                Accedi
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTest;
