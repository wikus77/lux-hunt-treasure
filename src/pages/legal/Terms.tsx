// 🔐 BY JOSEPH MULE — Capacitor iOS Compatible
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Terms: React.FC = () => {
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
                <h1 className="text-2xl font-orbitron font-bold text-white">Termini di Servizio</h1>
                <p className="text-white/70">M1SSION™</p>
            </div>
          </div>

          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Condizioni d'Uso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-white/90 leading-relaxed">
              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">1. Accettazione dei Termini</h3>
                <p>
                  Utilizzando l'applicazione M1SSION™, accetti integralmente questi termini di servizio. 
                  Se non accetti questi termini, non utilizzare l'applicazione.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">2. Descrizione del Servizio</h3>
                <p>
                  M1SSION™ è un'applicazione mobile di caccia al tesoro che utilizza la geolocalizzazione 
                  per fornire indizi e sfide agli utenti. L'app è progettata per dispositivi iOS e richiede 
                  accesso alla posizione per funzionare correttamente.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">3. Requisiti dell'Utente</h3>
                <div className="space-y-2">
                  <p>Per utilizzare M1SSION™ devi:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Avere almeno 13 anni di età</li>
                    <li>Fornire informazioni accurate durante la registrazione</li>
                    <li>Mantenere la sicurezza del tuo account</li>
                    <li>Rispettare le leggi locali durante l'utilizzo dell'app</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">4. Utilizzo dell'Applicazione</h3>
                <div className="space-y-2">
                  <p>È vietato:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Utilizzare l'app per attività illegali</li>
                    <li>Violare la proprietà privata durante le missioni</li>
                    <li>Condividere o vendere l'accesso al tuo account</li>
                    <li>Tentare di hackerare o manomettere l'applicazione</li>
                    <li>Creare account multipli per ottenere vantaggi non autorizzati</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">5. Abbonamenti e Pagamenti</h3>
                <p>
                  Gli abbonamenti premium sono gestiti tramite l'App Store di Apple. I pagamenti vengono 
                  addebitati automaticamente fino alla cancellazione. I rimborsi sono soggetti alle 
                  politiche di Apple.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">6. Proprietà Intellettuale</h3>
                <p>
                  Tutti i contenuti dell'app, inclusi testi, grafica, loghi e software, sono di proprietà 
                  di Joseph Mulé e protetti da copyright. L'utilizzo non autorizzato è vietato.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">7. Limitazione di Responsabilità</h3>
                <p>
                  M1SSION™ non è responsabile per danni diretti o indiretti derivanti dall'utilizzo dell'app. 
                  Gli utenti sono responsabili della propria sicurezza durante le attività di gioco.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">8. Modifiche ai Termini</h3>
                <p>
                  Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. 
                  Le modifiche saranno notificate attraverso l'applicazione.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">9. Contatti</h3>
                <p>
                  Per domande sui termini di servizio, contatta: <br />
                  <span className="text-[#00D1FF]">support@m1ssion.app</span>
                </p>
              </section>

              <div className="pt-6 border-t border-white/10 text-center text-white/60">
                <p>© 2025 M1SSION™ - Tutti i diritti riservati</p>
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

export default Terms;