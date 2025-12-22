// © 2025 Joseph MULÉ – M1SSION™ – All Rights Reserved
/**
 * M1SSION™ POLICIES PAGE - IT/EN BILINGUAL
 * Policy di Gioco Complete & Disclaimer
 * NIYVORA KFT™ – Budapest, Hungary
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
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

type Language = 'it' | 'en';

const Policies: React.FC = () => {
  const [language, setLanguage] = useState<Language>('it');

  const content = {
    it: {
      header: {
        title: "Policy & Disclaimer",
        subtitle: "Informazioni Legali M1SSION™"
      },
      antiGambling: {
        warning: "AVVISO IMPORTANTE",
        text: "M1SSION™ NON è un'applicazione di gioco d'azzardo. Questa piattaforma non offre, facilita o promuove alcuna forma di gioco d'azzardo, scommesse, puntate o giochi basati sulla fortuna che coinvolgono denaro reale.",
        listTitle: "Questa applicazione NON:",
        list: [
          "Accetta scommesse o puntate in denaro reale",
          "Offre premi in denaro o ricompense monetarie basate sulla fortuna",
          "Fornisce servizi di casinò, scommesse sportive o lotterie",
          "Permette la conversione di valute virtuali in denaro reale",
          "Consente prelievi o incassi di alcun tipo",
          "Simula o incoraggia comportamenti di gioco d'azzardo"
        ],
        note: "Tutti i mini-giochi all'interno di M1SSION™ (incluso \"Pulse Breaker\") sono esclusivamente a scopo di intrattenimento e utilizzano solo valute virtuali non riscattabili, senza alcun valore nel mondo reale."
      },
      nature: {
        intro: "M1SSION™ è un'applicazione di intrattenimento interattivo progettata come un'esperienza immersiva di simulazione investigativa e caccia al tesoro.",
        classTitle: "Classificazione del Gioco:",
        classList: [
          { title: "Gioco di Simulazione:", desc: "Interpretazione del ruolo di agente di intelligence" },
          { title: "Gioco di Puzzle/Mistero:", desc: "Risoluzione di indizi e investigazione di luoghi" },
          { title: "Gioco Basato sulla Posizione:", desc: "Utilizzo della geolocalizzazione per gameplay interattivo" },
          { title: "Esperienza di Intrattenimento:", desc: "Puramente per divertimento e coinvolgimento" }
        ],
        note: "M1SSION™ è progettato per fornire un'esperienza narrativa coinvolgente. Tutte le meccaniche di gioco, i risultati e le ricompense fanno parte della simulazione di intrattenimento e non hanno implicazioni economiche nel mondo reale."
      },
      currencies: {
        intro: "M1SSION™ utilizza due tipi di valute virtuali in-app:",
        m1u: "Token virtuali utilizzati all'interno dell'ecosistema M1SSION™ per attività in-app, ricompense e funzionalità di coinvolgimento.",
        pe: "Punti energia virtuali utilizzati per meccaniche di gioco specifiche e funzionalità di partecipazione alla community.",
        warning: "DISCLAIMER CRITICO",
        warningList: [
          "M1U e PE NON hanno valore monetario nel mondo reale.",
          "Gli M1U possono essere acquistati con denaro reale tramite acquisti in-app, ma rimangono puramente virtuali e non possono essere riscattati per denaro o equivalenti in contanti.",
          "I PE (Pulse Energy) si guadagnano attraverso il gameplay e la partecipazione alla community e non possono essere acquistati direttamente con denaro reale.",
          "Né gli M1U né i PE possono essere venduti, scambiati o convertiti in valuta reale o equivalenti in contanti.",
          "Non possono essere prelevati o trasferiti fuori dall'app.",
          "Tutti gli acquisti di M1U e gli abbonamenti sono non rimborsabili, salvo dove la legge a tutela dei consumatori lo richieda.",
          "Queste valute virtuali esistono solo all'interno dell'applicazione M1SSION™."
        ]
      },
      subscriptions: {
        title: "Indizi e Abbonamenti",
        intro: "M1SSION™ offre diversi livelli di abbonamento che determinano l'accesso agli indizi e alle funzionalità di gioco.",
        free: {
          title: "FREE (Gratuito)",
          list: ["Accesso base al gioco", "Numero limitato di indizi giornalieri", "1 BUZZ al giorno", "Funzionalità base"]
        },
        premium: {
          title: "PREMIUM (Silver, Gold, Black, Titanium)",
          list: ["Maggior numero di indizi giornalieri e settimanali", "BUZZ multipli (in base al piano)", "Accesso a indizi esclusivi", "Funzionalità avanzate e priorità", "Contenuti narrativi premium"]
        },
        note: "Nota: Gli abbonamenti premium forniscono accesso a funzionalità aggiuntive e sono completamente separati dal sistema di premi del gioco. L'abbonamento NON garantisce la vittoria — il successo dipende esclusivamente dalle abilità del giocatore."
      },
      noTransactions: {
        title: "Nessuna Transazione in Denaro Reale per Gioco d'Azzardo",
        intro: "M1SSION™ NON elabora, gestisce o facilita alcuna transazione in denaro reale relativa a risultati di gioco, gioco d'azzardo, scommesse o incasso di vincite. I pagamenti in denaro reale sono utilizzati esclusivamente per abbonamenti opzionali e acquisti in-app (come pacchetti M1U e accesso a funzionalità premium). Questi pagamenti sono strettamente per l'accesso a contenuti e servizi e sono completamente separati dall'assegnazione dei premi o dai risultati di gioco.",
        listTitle: "Cosa Significa:",
        list: [
          "Nessun deposito o pagamento in denaro reale per scommesse, puntate o giochi d'azzardo.",
          "Nessun prelievo, incasso o pagamento di vincite monetarie.",
          "Nessun riscatto di valute virtuali per denaro, carte regalo, criptovalute o altri equivalenti monetari.",
          "Nessuna elaborazione di pagamenti di terze parti per servizi di gioco d'azzardo o scommesse.",
          "Tutti gli acquisti sono definitivi e non rimborsabili, salvo dove la legge a tutela dei consumatori lo richieda."
        ],
        note: "Gli abbonamenti premium e gli acquisti in-app di M1U sono per l'accesso a funzionalità e contenuti, completamente separati dal sistema di premi del gioco."
      },
      liability: {
        title: "Limitazione di Responsabilità",
        intro: "Utilizzando M1SSION™, l'utente riconosce e accetta che:",
        list: [
          "NIYVORA KFT™ e M1SSION™ non sono responsabili per alcun danno diretto, indiretto, incidentale o consequenziale derivante dall'utilizzo dell'applicazione.",
          "L'applicazione è fornita \"così com'è\" senza garanzie di alcun tipo, espresse o implicite.",
          "Gli utenti sono gli unici responsabili della propria sicurezza e delle proprie azioni durante l'utilizzo delle funzionalità basate sulla posizione.",
          "Non garantiamo l'accesso ininterrotto, l'accuratezza dei contenuti o la conservazione dei dati degli utenti oltre i nostri ragionevoli sforzi.",
          "Qualsiasi servizio di terze parti integrato nell'app è soggetto ai propri termini e condizioni."
        ]
      },
      risks: {
        title: "Rischi Digitali & Sicurezza",
        intro: "Gli utenti riconoscono i seguenti rischi digitali:",
        list: [
          "Problemi di connettività Internet possono influire sull'esperienza di gioco",
          "La precisione del GPS può variare in base al dispositivo e alla posizione",
          "Il consumo della batteria può essere maggiore quando si utilizzano i servizi di localizzazione",
          "Il consumo di dati può verificarsi durante l'utilizzo dell'applicazione",
          "Il tempo di utilizzo dello schermo dovrebbe essere monitorato, specialmente per gli utenti più giovani"
        ],
        safety: "Sicurezza Fisica: Quando si utilizzano funzionalità basate sulla posizione, prestare sempre attenzione all'ambiente circostante. Non entrare in proprietà private. Non utilizzare l'app mentre si guida o in condizioni non sicure."
      },
      ai: {
        intro: "M1SSION™ incorpora funzionalità basate sull'intelligenza artificiale, incluso l'assistente AION e vari sistemi di generazione di contenuti.",
        listTitle: "Informativa sull'IA:",
        list: [
          "Alcuni contenuti, indizi e narrazioni possono essere generati o migliorati dall'IA",
          "Le risposte dell'IA sono per intrattenimento e non devono essere considerate consigli fattuali",
          "I contenuti generati dall'IA possono occasionalmente contenere imprecisioni o incoerenze",
          "Miglioriamo continuamente i sistemi di IA ma non possiamo garantire la perfezione"
        ],
        note: "AION e le altre funzionalità IA sono progettate per migliorare l'esperienza di gioco e devono essere intese come parte della simulazione di intrattenimento."
      },
      modifications: {
        title: "Modifiche alle Policy",
        intro: "NIYVORA KFT™ si riserva il diritto di modificare, aggiornare o cambiare queste policy in qualsiasi momento senza preavviso.",
        list: [
          "Le modifiche saranno effettive immediatamente dopo la pubblicazione nell'applicazione",
          "L'uso continuato dell'app costituisce accettazione delle policy aggiornate",
          "Le modifiche importanti possono essere comunicate tramite notifiche in-app",
          "Gli utenti sono incoraggiati a rivedere periodicamente le policy"
        ]
      },
      cookies: {
        title: "Cookie & Sicurezza dei Dati",
        intro: "M1SSION™ utilizza cookie e tecnologie simili per migliorare l'esperienza utente. Per informazioni dettagliate, consultare la nostra",
        linkText: "Cookie Policy",
        listTitle: "Misure di Sicurezza:",
        list: [
          "Crittografia end-to-end per i dati sensibili",
          "Protocolli di autenticazione sicuri",
          "Audit di sicurezza e aggiornamenti regolari",
          "Conformità GDPR e CCPA"
        ]
      },
      compliance: {
        title: "Conformità Normativa",
        intro: "M1SSION™ è progettato per conformarsi alle normative applicabili nelle giurisdizioni in cui opera:",
        eu: { title: "Unione Europea", list: ["GDPR (Protezione dei Dati)", "Digital Services Act (DSA)", "Direttive sulla Protezione dei Consumatori"] },
        us: { title: "Stati Uniti", list: ["CCPA (Privacy California)", "COPPA (Privacy dei Minori)", "Linee Guida FTC"] },
        appStore: { title: "Conformità App Store", list: ["Linee Guida Apple App Store (Categoria Gioco d'Azzardo Simulato)", "Policy Google Play Store"] }
      },
      footer: {
        copyright: "© 2025 M1SSION™ – Tutti i Diritti Riservati",
        company: "NIYVORA KFT™ – Budapest, Ungheria",
        lastUpdate: "Ultimo Aggiornamento"
      }
    },
    en: {
      header: {
        title: "Policy & Disclaimer",
        subtitle: "M1SSION™ Legal Information"
      },
      antiGambling: {
        warning: "IMPORTANT NOTICE",
        text: "M1SSION™ is NOT a gambling application. This platform does not offer, facilitate, or promote any form of gambling, betting, wagering, or games of chance involving real money.",
        listTitle: "This application does NOT:",
        list: [
          "Accept real money bets or wagers",
          "Offer cash prizes or monetary rewards based on chance",
          "Provide any form of casino, sports betting, or lottery services",
          "Allow conversion of virtual currencies to real money",
          "Enable withdrawals or cash-outs of any kind",
          "Simulate or encourage gambling behavior"
        ],
        note: "Any mini-games within M1SSION™ (including \"Pulse Breaker\") are purely for entertainment purposes and use only virtual, non-redeemable currencies with no real-world value."
      },
      nature: {
        intro: "M1SSION™ is an interactive entertainment application designed as an immersive investigative simulation and treasure hunt experience.",
        classTitle: "Game Classification:",
        classList: [
          { title: "Simulation Game:", desc: "Role-playing as an intelligence agent" },
          { title: "Puzzle/Mystery Game:", desc: "Solving clues and investigating locations" },
          { title: "Location-Based Game:", desc: "Using geolocation for interactive gameplay" },
          { title: "Entertainment Experience:", desc: "Purely for fun and engagement" }
        ],
        note: "M1SSION™ is designed to provide an engaging narrative experience. All game mechanics, outcomes, and rewards are part of the entertainment simulation and have no real-world economic implications."
      },
      currencies: {
        intro: "M1SSION™ uses two types of virtual, in-app currencies:",
        m1u: "Virtual tokens used within the M1SSION™ ecosystem for in-app activities, rewards, and engagement features.",
        pe: "Virtual energy points used for specific game mechanics and community participation features.",
        warning: "CRITICAL DISCLAIMER",
        warningList: [
          "M1U and PE have NO real-world monetary value.",
          "M1U may be purchased with real money through in-app purchases, but they remain purely virtual and cannot be redeemed for cash or cash equivalents.",
          "PE (Pulse Energy) is earned through gameplay and community engagement and cannot be purchased directly with real money.",
          "Neither M1U nor PE can be sold, exchanged, or converted to real currency or any cash equivalent.",
          "They cannot be withdrawn or transferred outside the app.",
          "All purchases of M1U and any subscriptions are non-refundable except where mandatory consumer law requires otherwise.",
          "These virtual currencies exist only within the M1SSION™ application."
        ]
      },
      subscriptions: {
        title: "Clues and Subscriptions",
        intro: "M1SSION™ offers different subscription levels that determine access to clues and game features.",
        free: {
          title: "FREE",
          list: ["Basic game access", "Limited daily clues", "1 BUZZ per day", "Basic features"]
        },
        premium: {
          title: "PREMIUM (Silver, Gold, Black, Titanium)",
          list: ["More daily and weekly clues", "Multiple BUZZes (depending on plan)", "Access to exclusive clues", "Advanced features and priority", "Premium narrative content"]
        },
        note: "Note: Premium subscriptions provide access to additional features and are completely separate from the game's prize system. A subscription does NOT guarantee victory — success depends exclusively on the player's skills."
      },
      noTransactions: {
        title: "No Real-Money Transactions for Gambling",
        intro: "M1SSION™ does NOT process, handle, or facilitate any real-money transactions related to in-game outcomes, gambling, betting, or cash-out of winnings. Real-money payments are used only for optional subscriptions and in-app purchases (such as M1U packs and access to premium features). These payments are strictly for access to content and services and are entirely separate from prize assignment or game results.",
        listTitle: "What This Means:",
        list: [
          "No deposits or real-money payments for betting, wagering, or games of chance.",
          "No withdrawals, cash-outs, or payment of monetary winnings.",
          "No redemption of virtual currencies for cash, gift cards, cryptocurrency, or other real-world monetary equivalents.",
          "No third-party payment processing for gambling or betting services.",
          "All purchases are final and non-refundable, except where applicable consumer protection laws require otherwise."
        ],
        note: "Premium subscriptions and M1U in-app purchases are for access to features and content, completely separate from the game's prize system."
      },
      liability: {
        title: "Limitation of Liability",
        intro: "By using M1SSION™, you acknowledge and agree that:",
        list: [
          "NIYVORA KFT™ and M1SSION™ are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the application.",
          "The application is provided \"as is\" without warranties of any kind, either express or implied.",
          "Users are solely responsible for their own safety and actions while using location-based features.",
          "We do not guarantee uninterrupted access, accuracy of content, or preservation of user data beyond our reasonable efforts.",
          "Any third-party services integrated within the app are subject to their own terms and conditions."
        ]
      },
      risks: {
        title: "Digital Risks & Safety",
        intro: "Users acknowledge the following digital risks:",
        list: [
          "Internet connectivity issues may affect gameplay experience",
          "GPS accuracy may vary based on device and location",
          "Battery consumption may be higher when using location services",
          "Data usage may occur when using the application",
          "Screen time should be monitored, especially for younger users"
        ],
        safety: "Physical Safety: When using location-based features, always be aware of your surroundings. Do not trespass on private property. Do not use the app while driving or in unsafe conditions."
      },
      ai: {
        intro: "M1SSION™ incorporates AI-powered features, including the AION assistant and various content generation systems.",
        listTitle: "AI Disclosure:",
        list: [
          "Some content, clues, and narratives may be generated or enhanced by AI",
          "AI responses are for entertainment and should not be considered factual advice",
          "AI-generated content may occasionally contain inaccuracies or inconsistencies",
          "We continuously improve AI systems but cannot guarantee perfection"
        ],
        note: "AION and other AI features are designed to enhance the gaming experience and should be understood as part of the entertainment simulation."
      },
      modifications: {
        title: "Policy Modifications",
        intro: "NIYVORA KFT™ reserves the right to modify, update, or change these policies at any time without prior notice.",
        list: [
          "Changes will be effective immediately upon posting in the application",
          "Continued use of the app constitutes acceptance of updated policies",
          "Major changes may be communicated via in-app notifications",
          "Users are encouraged to review policies periodically"
        ]
      },
      cookies: {
        title: "Cookies & Data Security",
        intro: "M1SSION™ uses cookies and similar technologies to enhance user experience. For detailed information, please refer to our",
        linkText: "Cookie Policy",
        listTitle: "Security Measures:",
        list: [
          "End-to-end encryption for sensitive data",
          "Secure authentication protocols",
          "Regular security audits and updates",
          "GDPR and CCPA compliance"
        ]
      },
      compliance: {
        title: "Regulatory Compliance",
        intro: "M1SSION™ is designed to comply with applicable regulations in the jurisdictions where it operates:",
        eu: { title: "European Union", list: ["GDPR (Data Protection)", "Digital Services Act (DSA)", "Consumer Protection Directives"] },
        us: { title: "United States", list: ["CCPA (California Privacy)", "COPPA (Children's Privacy)", "FTC Guidelines"] },
        appStore: { title: "App Store Compliance", list: ["Apple App Store Guidelines (Simulated Gambling Category)", "Google Play Store Policies"] }
      },
      footer: {
        copyright: "© 2025 M1SSION™ – All Rights Reserved",
        company: "NIYVORA KFT™ – Budapest, Hungary",
        lastUpdate: "Last Updated"
      }
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#131524] via-[#0F1419] to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header with Language Toggle */}
          <div className="flex items-center justify-between flex-wrap gap-4">
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
                <h1 className="text-2xl font-orbitron font-bold text-white">{t.header.title}</h1>
                <p className="text-white/70">{t.header.subtitle}</p>
              </div>
            </div>
            
            {/* Language Toggle */}
            <div className="flex items-center space-x-2 bg-black/30 rounded-full p-1">
              <Button
                onClick={() => setLanguage('it')}
                variant={language === 'it' ? 'default' : 'ghost'}
                size="sm"
                className={`rounded-full ${language === 'it' ? 'bg-[#00D1FF] text-black' : 'text-white/70 hover:text-white'}`}
              >
                🇮🇹 IT
              </Button>
              <Button
                onClick={() => setLanguage('en')}
                variant={language === 'en' ? 'default' : 'ghost'}
                size="sm"
                className={`rounded-full ${language === 'en' ? 'bg-[#00D1FF] text-black' : 'text-white/70 hover:text-white'}`}
              >
                🇬🇧 EN
              </Button>
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
                <p className="text-red-300 font-semibold mb-2">⚠️ {t.antiGambling.warning}</p>
                <p className="text-white/80">{t.antiGambling.text}</p>
              </div>
              
              <div className="space-y-2">
                <p><strong>{t.antiGambling.listTitle}</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                  {t.antiGambling.list.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              
              <p className="text-white/70 text-sm italic">{t.antiGambling.note}</p>
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
              <p><strong>{t.nature.intro}</strong></p>
              
              <div className="space-y-2">
                <p><strong>{t.nature.classTitle}</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                  {t.nature.classList.map((item, i) => (
                    <li key={i}><strong>{item.title}</strong> {item.desc}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-[#00D1FF]/10 p-3 rounded-lg border border-[#00D1FF]/20">
                <p className="text-[#00D1FF] text-sm">{t.nature.note}</p>
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
              <p><strong>{t.currencies.intro}</strong></p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/20">
                  <h4 className="text-yellow-400 font-semibold mb-2">M1U (M1 Units)</h4>
                  <p className="text-white/70 text-sm">{t.currencies.m1u}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                  <h4 className="text-purple-400 font-semibold mb-2">PE (Pulse Energy)</h4>
                  <p className="text-white/70 text-sm">{t.currencies.pe}</p>
                </div>
              </div>
              
              <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30">
                <p className="text-yellow-300 font-semibold mb-2">⚠️ {t.currencies.warning}</p>
                <ul className="list-disc list-inside space-y-1 text-white/80 text-sm">
                  {t.currencies.warningList.map((item, i) => <li key={i}><strong>{item}</strong></li>)}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4: Subscriptions (IT only section title) */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-[#00D1FF]" />
                {t.subscriptions.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>{t.subscriptions.intro}</p>
              
              <div className="space-y-4">
                <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                  <h4 className="text-white font-semibold mb-2">{t.subscriptions.free.title}</h4>
                  <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                    {t.subscriptions.free.list.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg border border-[#00D1FF]/20">
                  <h4 className="text-[#00D1FF] font-semibold mb-2">{t.subscriptions.premium.title}</h4>
                  <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                    {t.subscriptions.premium.list.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              </div>
              
              <div className="bg-[#00D1FF]/10 p-3 rounded-lg border border-[#00D1FF]/20">
                <p className="text-[#00D1FF] text-sm"><strong>{t.subscriptions.note}</strong></p>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 5: No Real Transactions */}
          <Card className="bg-black/40 border-green-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-400" />
                {t.noTransactions.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p><strong>{t.noTransactions.intro}</strong></p>
              
              <div className="space-y-2">
                <p><strong>{t.noTransactions.listTitle}</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                  {t.noTransactions.list.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              
              <p className="text-white/70 text-sm">{t.noTransactions.note}</p>
            </CardContent>
          </Card>

          {/* SECTION 6: Limitation of Liability */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Scale className="w-5 h-5 mr-2 text-[#00D1FF]" />
                {t.liability.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>{t.liability.intro}</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                {t.liability.list.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </CardContent>
          </Card>

          {/* SECTION 7: Digital Risks */}
          <Card className="bg-black/40 border-orange-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
                {t.risks.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>{t.risks.intro}</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                {t.risks.list.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              
              <div className="bg-orange-900/20 p-3 rounded-lg border border-orange-500/20">
                <p className="text-orange-300 text-sm"><strong>{t.risks.safety}</strong></p>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 8: AI Content (AION) */}
          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Bot className="w-5 h-5 mr-2 text-purple-400" />
                AI-Generated Content (AION)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>{t.ai.intro}</p>
              
              <div className="space-y-2">
                <p><strong>{t.ai.listTitle}</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                  {t.ai.list.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              
              <p className="text-white/70 text-sm italic">{t.ai.note}</p>
            </CardContent>
          </Card>

          {/* SECTION 9: Policy Modifications */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <RefreshCw className="w-5 h-5 mr-2 text-[#00D1FF]" />
                {t.modifications.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>{t.modifications.intro}</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                {t.modifications.list.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </CardContent>
          </Card>

          {/* SECTION 10: Cookies & Security */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Lock className="w-5 h-5 mr-2 text-[#00D1FF]" />
                {t.cookies.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>
                {t.cookies.intro}{' '}
                <a href="/cookie-policy" className="text-[#00D1FF] hover:underline">{t.cookies.linkText}</a>.
              </p>
              
              <div className="space-y-2">
                <p><strong>{t.cookies.listTitle}</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80">
                  {t.cookies.list.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 11: Regulatory Compliance */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Globe className="w-5 h-5 mr-2 text-[#00D1FF]" />
                {t.compliance.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90 leading-relaxed">
              <p>{t.compliance.intro}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-[#00D1FF] font-semibold">{t.compliance.eu.title}</h4>
                  <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                    {t.compliance.eu.list.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[#00D1FF] font-semibold">{t.compliance.us.title}</h4>
                  <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                    {t.compliance.us.list.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <h4 className="text-[#00D1FF] font-semibold">{t.compliance.appStore.title}</h4>
                <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                  {t.compliance.appStore.list.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Footer with IP */}
          <div className="pt-6 border-t border-white/10 text-center space-y-4">
            <p className="text-white/60">{t.footer.copyright}</p>
            <p className="text-sm text-white/50">{t.footer.company}</p>
            
            {/* IP Notice - Compact */}
            <div className="pt-4 border-t border-white/5 space-y-2">
              <p className="text-white/25 text-[9px] uppercase tracking-wider">Registrazioni & Certificazioni</p>
              <p className="text-white/30 text-[10px]">
                <span className="text-[#00D1FF]/50">M1SSION™</span> • SafeCreative: <a href="https://www.safecreative.org/certificate/2505261861325-2VXE4Q" target="_blank" rel="noopener noreferrer" className="text-[#00D1FF]/40 hover:text-[#00D1FF]/60">2505261861325</a> • <a href="https://www.safecreative.org/certificate/2512103987648-62HXMR" target="_blank" rel="noopener noreferrer" className="text-[#00D1FF]/40 hover:text-[#00D1FF]/60">2512103987648</a> • <a href="https://www.safecreative.org/certificate/2512103988744-9TFSDH" target="_blank" rel="noopener noreferrer" className="text-[#00D1FF]/40 hover:text-[#00D1FF]/60">2512103988744</a>
              </p>
              <p className="text-white/30 text-[10px]">
                EUIPO Trademark: M1SSION™ • Geo-Pulse Engine™ — Proprietary System
              </p>
              <p className="text-amber-400/30 text-[10px]">⚠️ Proprietà intellettuale protetta. Riproduzione non autorizzata vietata.</p>
            </div>
            
            <p className="text-xs text-white/40">
              {t.footer.lastUpdate}: {new Date().toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Policies;
