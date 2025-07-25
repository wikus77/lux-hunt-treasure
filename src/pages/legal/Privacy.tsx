// 🔐 BY JOSEPH MULE — Capacitor iOS Compatible
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Privacy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#131524] via-[#0F1419] to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/settings')}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-orbitron font-bold text-white">Privacy Policy</h1>
              <p className="text-white/70">M1SSION™ - Protezione dei Dati Personali</p>
            </div>
          </div>

          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Informativa sulla Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-white/90 leading-relaxed">
              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">1. Raccolta dei Dati</h3>
                <div className="space-y-2">
                  <p>M1SSION™ raccoglie i seguenti tipi di dati:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Dati di Account:</strong> Nome utente, email, password criptata</li>
                    <li><strong>Dati di Geolocalizzazione:</strong> Posizione GPS per funzionalità di gioco</li>
                    <li><strong>Dati di Utilizzo:</strong> Progressi di gioco, statistiche, preferenze</li>
                    <li><strong>Dati di Pagamento:</strong> Informazioni di fatturazione per abbonamenti premium</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">2. Utilizzo dei Dati</h3>
                <div className="space-y-2">
                  <p>I tuoi dati vengono utilizzati esclusivamente per:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Fornire le funzionalità di caccia al tesoro</li>
                    <li>Personalizzare l'esperienza di gioco</li>
                    <li>Gestire abbonamenti e pagamenti</li>
                    <li>Inviare notifiche relative al gioco (se autorizzate)</li>
                    <li>Migliorare l'applicazione attraverso analisi anonime</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">3. Condivisione dei Dati</h3>
                <p>
                  <strong>Non vendiamo, affittiamo o condividiamo i tuoi dati personali con terze parti</strong> 
                  per scopi commerciali. I dati possono essere condivisi solo nei seguenti casi:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Con il tuo consenso esplicito</li>
                  <li>Per adempiere a obblighi legali</li>
                  <li>Con fornitori di servizi fidati (es. Supabase per database)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">4. Geolocalizzazione</h3>
                <p>
                  L'accesso alla posizione è <strong>essenziale</strong> per il funzionamento dell'app. 
                  I dati di localizzazione vengono utilizzati in tempo reale per generare indizi e 
                  non vengono memorizzati permanentemente sui nostri server.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">5. Sicurezza dei Dati</h3>
                <div className="space-y-2">
                  <p>Implementiamo misure di sicurezza avanzate:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Crittografia SSL/TLS per tutte le comunicazioni</li>
                    <li>Autenticazione multi-fattore disponibile</li>
                    <li>Database sicuri con backup automatici</li>
                    <li>Accesso limitato ai dati solo per personale autorizzato</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">6. I Tuoi Diritti (GDPR)</h3>
                <div className="space-y-2">
                  <p>In conformità al GDPR, hai diritto a:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Accesso:</strong> Ottenere una copia dei tuoi dati</li>
                    <li><strong>Rettifica:</strong> Correggere dati inesatti</li>
                    <li><strong>Cancellazione:</strong> Richiedere l'eliminazione dei dati</li>
                    <li><strong>Portabilità:</strong> Trasferire i dati ad altro servizio</li>
                    <li><strong>Opposizione:</strong> Opporti al trattamento per scopi specifici</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">7. Conservazione dei Dati</h3>
                <p>
                  I dati vengono conservati finché mantieni un account attivo. Dopo l'eliminazione 
                  dell'account, i dati vengono cancellati entro 30 giorni, eccetto dove richiesto 
                  da obblighi legali.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">8. Cookie e Tecnologie Simili</h3>
                <p>
                  L'app utilizza tecnologie di memorizzazione locale solo per il funzionamento 
                  essenziale (login, preferenze). Non utilizziamo cookie di tracciamento per 
                  pubblicità di terze parti.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">9. Modifiche alla Privacy Policy</h3>
                <p>
                  Eventuali modifiche a questa informativa verranno comunicate tramite 
                  notifica in-app e email. La versione aggiornata sarà sempre disponibile 
                  nell'applicazione.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">10. Contatti per la Privacy</h3>
                <p>
                  Per questioni relative alla privacy o per esercitare i tuoi diritti: <br />
                  <span className="text-[#00D1FF]">privacy@m1ssion.app</span> <br />
                  Data Protection Officer: Joseph Mulé
                </p>
              </section>

              <div className="pt-6 border-t border-white/10 text-center text-white/60">
                <p>© 2025 M1SSION™ - Conforme GDPR</p>
                <p className="text-sm">Ultima revisione: 12 Gennaio 2025</p>
                <p className="text-xs mt-2 text-white/40">
                  Documento legale pubblicato da NIYVORA KFT, proprietaria dell'applicazione M1SSION™.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;