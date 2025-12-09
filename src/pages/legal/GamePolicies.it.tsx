// © 2025 Joseph MULÉ – M1SSION™ – All Rights Reserved
/**
 * M1SSION™ GAME POLICIES PAGE - ITALIAN VERSION
 * Policy di Gioco Complete & Disclaimer
 * NIYVORA KFT™ – Budapest, Hungary
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  ArrowLeft, 
  Shield, 
  Ban, 
  Coins, 
  Gamepad2, 
  AlertTriangle, 
  Bot, 
  Scale, 
  RefreshCw,
  Globe,
  Lock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

const GamePoliciesIt: React.FC = () => {
  const [, setLocation] = useLocation();

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
              onClick={() => window.history.back()}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-orbitron font-bold text-white">Policy & Disclaimer</h1>
              <p className="text-white/70">Informazioni Legali M1SSION™</p>
            </div>
          </div>

          {/* SECTION 1: Anti-Gambling Disclaimer */}
          <Card className="bg-black/40 border-red-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Ban className="w-5 h-5 mr-2 text-red-400" />
                Anti-Gambling Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                <p className="text-red-300 font-semibold mb-2">⚠️ AVVISO IMPORTANTE</p>
                <p className="text-white/80">
                  M1SSION™ <strong>NON</strong> è un'applicazione di gioco d'azzardo. Questa piattaforma 
                  non offre, facilita o promuove alcuna forma di gioco d'azzardo, scommesse, puntate 
                  o giochi basati sulla fortuna che coinvolgono denaro reale.
                </p>
              </div>
              
              <div className="space-y-2">
                <p><strong>Questa applicazione NON:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                  <li>Accetta scommesse o puntate in denaro reale</li>
                  <li>Offre premi in denaro o ricompense monetarie basate sulla fortuna</li>
                  <li>Fornisce servizi di casinò, scommesse sportive o lotterie</li>
                  <li>Permette la conversione di valute virtuali in denaro reale</li>
                  <li>Consente prelievi o incassi di alcun tipo</li>
                  <li>Simula o incoraggia comportamenti di gioco d'azzardo</li>
                </ul>
              </div>
              
              <p className="text-white/70 text-sm italic">
                Tutti i mini-giochi all'interno di M1SSION™ (incluso "Pulse Breaker") sono esclusivamente 
                a scopo di intrattenimento e utilizzano solo valute virtuali non riscattabili, senza 
                alcun valore nel mondo reale.
              </p>
            </CardContent>
          </Card>

          {/* SECTION 2: Nature of the Game */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Gamepad2 className="w-5 h-5 mr-2 text-[#00D1FF]" />
                Nature of M1SSION™
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                M1SSION™ è un'<strong>applicazione di intrattenimento interattivo</strong> progettata come 
                un'esperienza immersiva di simulazione investigativa e caccia al tesoro.
              </p>
              
              <div className="space-y-2">
                <p><strong>Classificazione del Gioco:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                  <li><strong>Gioco di Simulazione:</strong> Interpretazione del ruolo di agente di intelligence</li>
                  <li><strong>Gioco di Puzzle/Mistero:</strong> Risoluzione di indizi e investigazione di luoghi</li>
                  <li><strong>Gioco Basato sulla Posizione:</strong> Utilizzo della geolocalizzazione per gameplay interattivo</li>
                  <li><strong>Esperienza di Intrattenimento:</strong> Puramente per divertimento e coinvolgimento</li>
                </ul>
              </div>
              
              <div className="bg-[#00D1FF]/10 p-3 rounded-lg border border-[#00D1FF]/20">
                <p className="text-[#00D1FF] text-sm">
                  M1SSION™ è progettato per fornire un'esperienza narrativa coinvolgente. 
                  Tutte le meccaniche di gioco, i risultati e le ricompense fanno parte della simulazione 
                  di intrattenimento e non hanno implicazioni economiche nel mondo reale.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3: Virtual Currencies */}
          <Card className="bg-black/40 border-yellow-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Coins className="w-5 h-5 mr-2 text-yellow-400" />
                Virtual Currencies (M1U & PE)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                M1SSION™ utilizza due tipi di <strong>valute virtuali in-app</strong>:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/20">
                  <h4 className="text-yellow-400 font-semibold mb-2">M1U (M1 Units)</h4>
                  <p className="text-white/70 text-sm">
                    Token virtuali utilizzati all'interno dell'ecosistema M1SSION™ per attività in-app, 
                    ricompense e funzionalità di coinvolgimento.
                  </p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                  <h4 className="text-purple-400 font-semibold mb-2">PE (Pulse Energy)</h4>
                  <p className="text-white/70 text-sm">
                    Punti energia virtuali utilizzati per meccaniche di gioco specifiche e 
                    funzionalità di partecipazione alla community.
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30">
                <p className="text-yellow-300 font-semibold mb-2">⚠️ DISCLAIMER CRITICO</p>
                <ul className="list-disc list-inside space-y-1 text-white/80 text-sm">
                  <li>M1U e PE <strong>NON hanno valore monetario</strong></li>
                  <li><strong>NON possono essere acquistati</strong> con denaro reale</li>
                  <li><strong>NON possono essere venduti, scambiati o convertiti</strong> in valuta reale</li>
                  <li><strong>NON possono essere prelevati</strong> o trasferiti fuori dall'app</li>
                  <li>Sono <strong>NON RIMBORSABILI</strong> e <strong>NON RISCATTABILI</strong></li>
                  <li>Esistono <strong>SOLO</strong> all'interno dell'applicazione M1SSION™</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* NEW SECTION: Indizi e Abbonamenti */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-[#00D1FF]" />
                Indizi e Abbonamenti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                M1SSION™ offre diversi livelli di abbonamento che determinano l'accesso agli indizi 
                e alle funzionalità di gioco.
              </p>
              
              <div className="space-y-4">
                <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                  <h4 className="text-white font-semibold mb-2">FREE (Gratuito)</h4>
                  <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                    <li>Accesso base al gioco</li>
                    <li>Numero limitato di indizi giornalieri</li>
                    <li>1 BUZZ al giorno</li>
                    <li>Funzionalità base</li>
                  </ul>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg border border-[#00D1FF]/20">
                  <h4 className="text-[#00D1FF] font-semibold mb-2">PREMIUM (Silver, Gold, Black, Titanium)</h4>
                  <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                    <li>Maggior numero di indizi giornalieri e settimanali</li>
                    <li>BUZZ multipli (in base al piano)</li>
                    <li>Accesso a indizi esclusivi</li>
                    <li>Funzionalità avanzate e priorità</li>
                    <li>Contenuti narrativi premium</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-[#00D1FF]/10 p-3 rounded-lg border border-[#00D1FF]/20">
                <p className="text-[#00D1FF] text-sm">
                  <strong>Nota:</strong> Gli abbonamenti premium forniscono accesso a funzionalità 
                  aggiuntive e sono completamente separati dal sistema di premi del gioco. 
                  L'abbonamento NON garantisce la vittoria — il successo dipende esclusivamente 
                  dalle abilità del giocatore.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4: No Real Transactions */}
          <Card className="bg-black/40 border-green-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-400" />
                Nessuna Transazione in Denaro Reale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                M1SSION™ <strong>NON</strong> elabora, gestisce o facilita alcuna transazione in denaro 
                reale relativa a risultati di gioco, vincite in valuta virtuale o esiti di partite.
              </p>
              
              <div className="space-y-2">
                <p><strong>Cosa Significa:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                  <li>Nessun deposito o pagamento in denaro reale per il gameplay</li>
                  <li>Nessun prelievo o pagamento di alcun tipo</li>
                  <li>Nessun equivalente in contanti o riscatto di carte regalo</li>
                  <li>Nessuno scambio o trasferimento di criptovalute</li>
                  <li>Nessuna elaborazione di pagamenti di terze parti per ricompense di gioco</li>
                </ul>
              </div>
              
              <p className="text-white/70 text-sm">
                Gli abbonamenti premium o gli acquisti in-app sono esclusivamente per funzionalità 
                avanzate e sono completamente separati dai sistemi di valuta virtuale o dai 
                risultati di gioco.
              </p>
            </CardContent>
          </Card>

          {/* SECTION 5: Limitation of Liability */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Scale className="w-5 h-5 mr-2 text-[#00D1FF]" />
                Limitazione di Responsabilità
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                Utilizzando M1SSION™, l'utente riconosce e accetta che:
              </p>
              
              <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                <li>
                  NIYVORA KFT™ e M1SSION™ <strong>non sono responsabili</strong> per alcun danno diretto, 
                  indiretto, incidentale o consequenziale derivante dall'utilizzo dell'applicazione.
                </li>
                <li>
                  L'applicazione è fornita <strong>"così com'è"</strong> senza garanzie di alcun tipo, 
                  espresse o implicite.
                </li>
                <li>
                  Gli utenti sono gli unici responsabili della propria sicurezza e delle proprie azioni 
                  durante l'utilizzo delle funzionalità basate sulla posizione.
                </li>
                <li>
                  Non garantiamo l'accesso ininterrotto, l'accuratezza dei contenuti o la conservazione 
                  dei dati degli utenti oltre i nostri ragionevoli sforzi.
                </li>
                <li>
                  Qualsiasi servizio di terze parti integrato nell'app è soggetto ai propri 
                  termini e condizioni.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* SECTION 6: Digital Risks */}
          <Card className="bg-black/40 border-orange-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
                Rischi Digitali & Sicurezza
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                Gli utenti riconoscono i seguenti rischi digitali:
              </p>
              
              <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                <li>Problemi di connettività Internet possono influire sull'esperienza di gioco</li>
                <li>La precisione del GPS può variare in base al dispositivo e alla posizione</li>
                <li>Il consumo della batteria può essere maggiore quando si utilizzano i servizi di localizzazione</li>
                <li>Il consumo di dati può verificarsi durante l'utilizzo dell'applicazione</li>
                <li>Il tempo di utilizzo dello schermo dovrebbe essere monitorato, specialmente per gli utenti più giovani</li>
              </ul>
              
              <div className="bg-orange-900/20 p-3 rounded-lg border border-orange-500/20">
                <p className="text-orange-300 text-sm">
                  <strong>Sicurezza Fisica:</strong> Quando si utilizzano funzionalità basate sulla posizione, 
                  prestare sempre attenzione all'ambiente circostante. Non entrare in proprietà private. 
                  Non utilizzare l'app mentre si guida o in condizioni non sicure.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 7: AI Content (AION) */}
          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Bot className="w-5 h-5 mr-2 text-purple-400" />
                AI-Generated Content (AION)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                M1SSION™ incorpora funzionalità basate sull'intelligenza artificiale, incluso 
                l'assistente <strong>AION</strong> e vari sistemi di generazione di contenuti.
              </p>
              
              <div className="space-y-2">
                <p><strong>Informativa sull'IA:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                  <li>Alcuni contenuti, indizi e narrazioni possono essere generati o migliorati dall'IA</li>
                  <li>Le risposte dell'IA sono per intrattenimento e non devono essere considerate consigli fattuali</li>
                  <li>I contenuti generati dall'IA possono occasionalmente contenere imprecisioni o incoerenze</li>
                  <li>Miglioriamo continuamente i sistemi di IA ma non possiamo garantire la perfezione</li>
                </ul>
              </div>
              
              <p className="text-white/70 text-sm italic">
                AION e le altre funzionalità IA sono progettate per migliorare l'esperienza di gioco 
                e devono essere intese come parte della simulazione di intrattenimento.
              </p>
            </CardContent>
          </Card>

          {/* SECTION 8: Policy Modifications */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <RefreshCw className="w-5 h-5 mr-2 text-[#00D1FF]" />
                Modifiche alle Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                NIYVORA KFT™ si riserva il diritto di modificare, aggiornare o cambiare queste policy 
                in qualsiasi momento senza preavviso.
              </p>
              
              <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                <li>Le modifiche saranno effettive immediatamente dopo la pubblicazione nell'applicazione</li>
                <li>L'uso continuato dell'app costituisce accettazione delle policy aggiornate</li>
                <li>Le modifiche importanti possono essere comunicate tramite notifiche in-app</li>
                <li>Gli utenti sono incoraggiati a rivedere periodicamente le policy</li>
              </ul>
            </CardContent>
          </Card>

          {/* SECTION 9: Cookies & Security */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Lock className="w-5 h-5 mr-2 text-[#00D1FF]" />
                Cookie & Sicurezza dei Dati
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                M1SSION™ utilizza cookie e tecnologie simili per migliorare l'esperienza utente. 
                Per informazioni dettagliate, consultare la nostra{' '}
                <a href="/cookie-policy" className="text-[#00D1FF] hover:underline">Cookie Policy</a>.
              </p>
              
              <div className="space-y-2">
                <p><strong>Misure di Sicurezza:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                  <li>Crittografia end-to-end per i dati sensibili</li>
                  <li>Protocolli di autenticazione sicuri</li>
                  <li>Audit di sicurezza e aggiornamenti regolari</li>
                  <li>Conformità GDPR e CCPA</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 10: Regulatory Compliance */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Globe className="w-5 h-5 mr-2 text-[#00D1FF]" />
                Conformità Normativa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                M1SSION™ è progettato per conformarsi alle normative applicabili nelle giurisdizioni 
                in cui opera:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-[#00D1FF] font-semibold">Unione Europea</h4>
                  <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                    <li>GDPR (Protezione dei Dati)</li>
                    <li>Digital Services Act (DSA)</li>
                    <li>Direttive sulla Protezione dei Consumatori</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[#00D1FF] font-semibold">Stati Uniti</h4>
                  <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                    <li>CCPA (Privacy California)</li>
                    <li>COPPA (Privacy dei Minori)</li>
                    <li>Linee Guida FTC</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <h4 className="text-[#00D1FF] font-semibold">Conformità App Store</h4>
                <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                  <li>Linee Guida Apple App Store (Categoria Gioco d'Azzardo Simulato)</li>
                  <li>Policy Google Play Store</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="pt-6 border-t border-white/10 text-center text-white/60">
            <p>© 2025 M1SSION™ – Tutti i Diritti Riservati</p>
            <p className="text-sm mt-1">NIYVORA KFT™ – Budapest, Ungheria</p>
            <p className="text-xs mt-2 text-white/40">
              Ultimo Aggiornamento: {new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GamePoliciesIt;

