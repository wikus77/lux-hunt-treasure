// 🔐 BY JOSEPH MULE — Capacitor iOS Compatible
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copyright, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SafeCreative: React.FC = () => {
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
              <h1 className="text-2xl font-orbitron font-bold text-white">SafeCreative</h1>
              <p className="text-white/70">Certificazione Proprietà Intellettuale</p>
            </div>
          </div>

          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Copyright className="w-5 h-5 mr-2" />
                Protezione Copyright M1SSION™
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-white/90 leading-relaxed">
              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">Certificazione Ufficiale</h3>
                <div className="bg-black/20 p-4 rounded-lg border border-[#00D1FF]/20">
                  <p className="font-medium text-[#00D1FF] mb-2">
                    🔐 M1SSION™
                  </p>
                  <p><strong>Autore:</strong> Joseph Mulé</p>
                  <p><strong>Data di Creazione:</strong> 2025</p>
                  <p><strong>Tipologia:</strong> Applicazione Mobile iOS</p>
                  <p><strong>Stato:</strong> Registrata e Protetta</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">Elementi Protetti</h3>
                <div className="space-y-2">
                  <p>La presente certificazione copre i seguenti elementi originali:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Nome e Logo:</strong> M1SSION™ e tutti i marchi correlati</li>
                    <li><strong>Codice Sorgente:</strong> Architettura software e algoritmi</li>
                    <li><strong>Design Interface:</strong> UI/UX e elementi grafici</li>
                    <li><strong>Game Mechanics:</strong> Sistema di caccia al tesoro geolocalizzato</li>
                    <li><strong>Contenuti:</strong> Testi, indizi, narrazioni e storyline</li>
                    <li><strong>Documentazione:</strong> Manuali tecnici e guide utente</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">Tecnologie Proprietarie</h3>
                <div className="space-y-2">
                  <p>Sono protetti da copyright i seguenti sistemi sviluppati:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Sistema di generazione indizi basato su AI</li>
                    <li>Algoritmo di posizionamento geografico per treasure hunt</li>
                    <li>Framework di gamification multi-tier</li>
                    <li>Sistema di sicurezza e autenticazione avanzato</li>
                    <li>Interfaccia utente ottimizzata per Capacitor iOS</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">Dichiarazione di Originalità</h3>
                <div className="bg-gradient-to-r from-[#00D1FF]/10 to-transparent p-4 rounded-lg border-l-4 border-[#00D1FF]">
                  <p>
                    L'autore Joseph Mulé dichiara che M1SSION™ è un'opera completamente originale, 
                    concepita e sviluppata autonomamente. Tutti gli elementi costitutivi 
                    dell'applicazione sono frutto di creatività e competenze tecniche proprie, 
                    senza violazione di diritti di terzi.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">Licenza d'Uso</h3>
                <p>
                  M1SSION™ è distribuita sotto licenza proprietaria. L'utilizzo dell'applicazione 
                  è concesso agli utenti finali esclusivamente per uso personale e non commerciale, 
                  secondo i termini di servizio.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">Protezione Legale</h3>
                <div className="space-y-2">
                  <p>Ogni violazione dei diritti di proprietà intellettuale sarà perseguita:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Copia non autorizzata del codice sorgente</li>
                    <li>Utilizzo del marchio M1SSION™ senza permesso</li>
                    <li>Reverse engineering delle funzionalità proprietarie</li>
                    <li>Distribuzione di versioni modificate dell'app</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">Certificazione Tecnica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-white/70 text-sm">Hash SHA-256 del Progetto</p>
                    <p className="font-mono text-xs text-[#00D1FF] break-all">
                      a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/70 text-sm">Timestamp di Creazione</p>
                    <p className="font-mono text-xs text-[#00D1FF]">
                      2025-01-12 16:30:00 UTC
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">Verifica SafeCreative</h3>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
                  <div>
                    <p className="text-white font-medium">Consulta il Registro Ufficiale</p>
                    <p className="text-white/70 text-sm">Verifica la certificazione su SafeCreative.org</p>
                  </div>
                  <Button
                    onClick={() => window.open('https://safecreative.org', '_blank')}
                    variant="outline"
                    className="border-[#00D1FF]/50 text-[#00D1FF] hover:bg-[#00D1FF]/10"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Verifica
                  </Button>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">Contatti Legali</h3>
                <p>
                  Per questioni relative alla proprietà intellettuale: <br />
                  <span className="text-[#00D1FF]">legal@m1ssion.app</span> <br />
                  Joseph Mulé - Titolare dei Diritti
                </p>
              </section>

              <div className="pt-6 border-t border-white/10 text-center text-white/60">
                <p>© 2025 Joseph Mulé - M1SSION™</p>
                <p className="text-sm">Certificato e Protetto da SafeCreative</p>
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

export default SafeCreative;