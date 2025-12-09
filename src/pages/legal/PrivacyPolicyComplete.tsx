/**
 * M1SSION™ PRIVACY POLICY - COMPLETE GDPR COMPLIANT
 * Italian + English Version with Language Switcher
 * © 2025 NIYVORA KFT™ – Joseph MULÉ – All Rights Reserved
 * 
 * NOTA LEGALE: Documento conforme al GDPR (Regolamento UE 2016/679).
 * Bozza tecnica soggetta a revisione legale formale.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  ArrowLeft, 
  Globe,
  Database,
  MapPin,
  Lock,
  Eye,
  FileText,
  Bot,
  Gamepad2,
  Coins,
  Server,
  Cookie,
  UserCheck,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

type Language = 'it' | 'en';

const PrivacyPolicyComplete: React.FC = () => {
  const [, setLocation] = useLocation();
  const [lang, setLang] = useState<Language>('it');

  const content = lang === 'it' ? PRIVACY_IT : PRIVACY_EN;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#131524] via-[#0F1419] to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
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
                <h1 className="text-2xl font-orbitron font-bold text-white">Privacy Policy</h1>
                <p className="text-white/70">M1SSION™ – GDPR Compliant</p>
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="flex items-center gap-2 bg-black/30 rounded-full p-1 border border-white/10">
              <button
                onClick={() => setLang('it')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  lang === 'it' 
                    ? 'bg-[#00D1FF] text-black' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                🇮🇹 IT
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  lang === 'en' 
                    ? 'bg-[#00D1FF] text-black' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>

          {/* Main Content */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <Shield className="w-5 h-5 mr-2 text-[#00D1FF]" />
                {content.title}
              </CardTitle>
              <p className="text-white/60 text-sm mt-2">{content.lastUpdate}</p>
            </CardHeader>
            <CardContent className="space-y-8 text-white/90 leading-relaxed">
              
              {/* Intro */}
              <div className="bg-[#00D1FF]/10 p-4 rounded-lg border border-[#00D1FF]/20">
                <p>{content.intro}</p>
              </div>

              {/* Section 1: Titolare del Trattamento */}
              <Section icon={<FileText className="w-5 h-5" />} title={content.s1.title}>
                <p>{content.s1.intro}</p>
                <div className="bg-black/30 p-4 rounded-lg border border-[#00D1FF]/20 mt-4">
                  <p><strong>{content.s1.company}</strong></p>
                  <p className="text-white/70">NIYVORA KFT™</p>
                  <p className="text-white/70">Budapest, Hungary</p>
                  <p className="text-white/70 mt-2">{content.s1.dpo}: Joseph Mulé</p>
                  <p className="text-[#00D1FF]">contact@m1ssion.com</p>
                </div>
              </Section>

              {/* Section 2: Dati Raccolti */}
              <Section icon={<Database className="w-5 h-5" />} title={content.s2.title}>
                <p>{content.s2.intro}</p>
                
                <h4 className="font-semibold text-[#00D1FF] mt-4">{content.s2.account.title}</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {content.s2.account.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
                
                <h4 className="font-semibold text-[#00D1FF] mt-4">{content.s2.geo.title}</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {content.s2.geo.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
                
                <h4 className="font-semibold text-[#00D1FF] mt-4">{content.s2.usage.title}</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {content.s2.usage.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
                
                <h4 className="font-semibold text-[#00D1FF] mt-4">{content.s2.tech.title}</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {content.s2.tech.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </Section>

              {/* Section 3: Geolocalizzazione */}
              <Section icon={<MapPin className="w-5 h-5 text-green-400" />} title={content.s3.title}>
                <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30 mb-4">
                  <p className="text-green-300">{content.s3.warning}</p>
                </div>
                <p>{content.s3.intro}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
                  {content.s3.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
                <p className="mt-4 text-white/70 text-sm italic">{content.s3.note}</p>
              </Section>

              {/* Section 4: Basi Legali */}
              <Section icon={<UserCheck className="w-5 h-5" />} title={content.s4.title}>
                <p>{content.s4.intro}</p>
                <div className="grid gap-3 mt-4">
                  {content.s4.bases.map((base, i) => (
                    <div key={i} className="bg-black/20 p-3 rounded-lg">
                      <span className="text-[#00D1FF] font-semibold">{base.type}:</span>
                      <span className="text-white/80 ml-2">{base.desc}</span>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Section 5: AI AION */}
              <Section icon={<Bot className="w-5 h-5 text-purple-400" />} title={content.s5.title}>
                <p>{content.s5.intro}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
                  {content.s5.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
                <p className="mt-4 text-white/70 text-sm italic">{content.s5.note}</p>
              </Section>

              {/* Section 6: M1U e Pulse Breaker */}
              <Section icon={<Gamepad2 className="w-5 h-5 text-yellow-400" />} title={content.s6.title}>
                <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30 mb-4">
                  <p className="text-red-300 font-semibold">🚫 {content.s6.antiGambling}</p>
                </div>
                <p>{content.s6.intro}</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/20">
                    <Coins className="w-5 h-5 text-yellow-400 mb-2" />
                    <h4 className="text-yellow-400 font-semibold">M1U / PE</h4>
                    <p className="text-white/70 text-sm">{content.s6.m1u}</p>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                    <Gamepad2 className="w-5 h-5 text-purple-400 mb-2" />
                    <h4 className="text-purple-400 font-semibold">Pulse Breaker</h4>
                    <p className="text-white/70 text-sm">{content.s6.pulse}</p>
                  </div>
                </div>
              </Section>

              {/* Section 7: Condivisione Dati */}
              <Section icon={<Globe className="w-5 h-5" />} title={content.s7.title}>
                <p>{content.s7.intro}</p>
                <h4 className="font-semibold text-[#00D1FF] mt-4">{content.s7.subTitle}</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  {content.s7.processors.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
                <p className="mt-4">{content.s7.noSale}</p>
              </Section>

              {/* Section 8: Trasferimenti Extra-UE */}
              <Section icon={<Server className="w-5 h-5" />} title={content.s8.title}>
                <p>{content.s8.intro}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
                  {content.s8.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </Section>

              {/* Section 9: Sicurezza */}
              <Section icon={<Lock className="w-5 h-5 text-green-400" />} title={content.s9.title}>
                <p>{content.s9.intro}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
                  {content.s9.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </Section>

              {/* Section 10: Cookie */}
              <Section icon={<Cookie className="w-5 h-5" />} title={content.s10.title}>
                <p>{content.s10.intro}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
                  {content.s10.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
                <p className="mt-4 text-[#00D1FF]">
                  <a href="/cookie-policy" className="hover:underline">{content.s10.link}</a>
                </p>
              </Section>

              {/* Section 11: Conservazione */}
              <Section icon={<Database className="w-5 h-5" />} title={content.s11.title}>
                <p>{content.s11.intro}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
                  {content.s11.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </Section>

              {/* Section 12: Diritti Utente */}
              <Section icon={<Eye className="w-5 h-5 text-[#00D1FF]" />} title={content.s12.title}>
                <p>{content.s12.intro}</p>
                <div className="grid gap-3 mt-4">
                  {content.s12.rights.map((right, i) => (
                    <div key={i} className="bg-black/20 p-3 rounded-lg flex items-start gap-3">
                      <span className="text-[#00D1FF] font-semibold whitespace-nowrap">{right.name}:</span>
                      <span className="text-white/80">{right.desc}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4">{content.s12.exercise}</p>
              </Section>

              {/* Section 13: Minori */}
              <Section icon={<AlertTriangle className="w-5 h-5 text-orange-400" />} title={content.s13.title}>
                <p>{content.s13.intro}</p>
              </Section>

              {/* Section 14: Modifiche */}
              <Section icon={<FileText className="w-5 h-5" />} title={content.s14.title}>
                <p>{content.s14.intro}</p>
              </Section>

              {/* Section 15: Contatti */}
              <Section icon={<Mail className="w-5 h-5" />} title={content.s15.title}>
                <p>{content.s15.intro}</p>
                <div className="bg-black/30 p-4 rounded-lg border border-[#00D1FF]/20 mt-4">
                  <p><strong>NIYVORA KFT™</strong></p>
                  <p className="text-white/70">Data Protection Officer: Joseph Mulé</p>
                  <p className="text-[#00D1FF] text-lg mt-2">contact@m1ssion.com</p>
                </div>
                <p className="mt-4 text-white/70 text-sm">{content.s15.authority}</p>
              </Section>

              {/* Footer */}
              <div className="pt-6 border-t border-white/10 text-center text-white/60">
                <p>© 2025 M1SSION™ – GDPR Compliant</p>
                <p className="text-sm mt-1">NIYVORA KFT™ – Budapest, Hungary</p>
                <p className="text-xs mt-3 text-white/40">{content.draftNote}</p>
                <p className="text-xs mt-1 text-white/30">{content.lastUpdate}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

// Helper Component
const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <section>
    <h3 className="text-lg font-semibold text-[#00D1FF] mb-3 flex items-center gap-2">
      {icon}
      {title}
    </h3>
    <div className="space-y-2 text-white/90">
      {children}
    </div>
  </section>
);

// ==================== ITALIAN VERSION ====================
const PRIVACY_IT = {
  title: "Informativa sulla Privacy",
  lastUpdate: "Ultimo aggiornamento: 5 Dicembre 2025",
  draftNote: "Documento conforme al Regolamento UE 2016/679 (GDPR). Bozza soggetta a revisione legale.",
  intro: "La presente Informativa sulla Privacy descrive come NIYVORA KFT™ (\"Titolare\") raccoglie, utilizza, conserva e protegge i dati personali degli utenti dell'applicazione M1SSION™, in conformità al Regolamento Generale sulla Protezione dei Dati (GDPR - Regolamento UE 2016/679).",
  
  s1: {
    title: "1. Titolare del Trattamento",
    intro: "Il Titolare del trattamento dei dati personali è:",
    company: "Titolare:",
    dpo: "Data Protection Officer (DPO)"
  },
  
  s2: {
    title: "2. Dati Personali Raccolti",
    intro: "M1SSION™ raccoglie le seguenti categorie di dati personali:",
    account: {
      title: "Dati di Account",
      items: [
        "Nome utente e codice agente",
        "Indirizzo email",
        "Password (crittografata con hash sicuro)",
        "Immagine del profilo (opzionale)",
        "Preferenze di lingua e notifiche"
      ]
    },
    geo: {
      title: "Dati di Geolocalizzazione",
      items: [
        "Coordinate GPS in tempo reale (latitudine, longitudine)",
        "Precisione della posizione",
        "Timestamp delle rilevazioni",
        "Storico posizioni per missioni completate"
      ]
    },
    usage: {
      title: "Dati di Utilizzo e Performance",
      items: [
        "Progressi di gioco, missioni completate, indizi sbloccati",
        "Statistiche di sessione (durata, frequenza)",
        "Punteggi, classifiche, achievement",
        "Saldo M1U (M1 Units) e PE (Pulse Energy)",
        "Storico partite Pulse Breaker (solo dati interni di gioco)"
      ]
    },
    tech: {
      title: "Dati Tecnici",
      items: [
        "Indirizzo IP",
        "Tipo di dispositivo, sistema operativo, versione app",
        "Identificatori univoci del dispositivo",
        "Log di errori e crash report",
        "Token per notifiche push"
      ]
    }
  },
  
  s3: {
    title: "3. Geolocalizzazione",
    warning: "⚠️ La geolocalizzazione è ESSENZIALE per il funzionamento di M1SSION™",
    intro: "L'applicazione richiede l'accesso alla posizione per:",
    items: [
      "Visualizzare la Buzz Map 3D con indizi geolocalizzati",
      "Verificare il completamento delle missioni fisiche",
      "Generare indizi contestuali basati sulla posizione",
      "Abilitare funzionalità di realtà aumentata",
      "Calcolare distanze e prossimità ai punti di interesse"
    ],
    note: "I dati di posizione in tempo reale NON vengono memorizzati permanentemente. Lo storico delle missioni completate viene conservato per la cronologia di gioco."
  },
  
  s4: {
    title: "4. Basi Giuridiche del Trattamento (Art. 6 GDPR)",
    intro: "Il trattamento dei dati personali si basa sulle seguenti basi giuridiche:",
    bases: [
      { type: "Contratto (Art. 6.1.b)", desc: "Necessario per l'esecuzione del servizio M1SSION™" },
      { type: "Consenso (Art. 6.1.a)", desc: "Per notifiche push, marketing, geolocalizzazione opzionale" },
      { type: "Legittimo Interesse (Art. 6.1.f)", desc: "Sicurezza, prevenzione frodi, miglioramento servizio" },
      { type: "Obbligo Legale (Art. 6.1.c)", desc: "Adempimenti fiscali, richieste autorità competenti" }
    ]
  },
  
  s5: {
    title: "5. Intelligenza Artificiale AION",
    intro: "M1SSION™ integra AION, un'intelligenza artificiale che assiste gli utenti durante il gioco. AION elabora:",
    items: [
      "Messaggi e query dell'utente (per fornire risposte contestuali)",
      "Dati di gioco (per personalizzare suggerimenti)",
      "Preferenze impostate dall'utente (per adattare il comportamento)",
      "Nessun dato viene utilizzato per addestrare modelli esterni"
    ],
    note: "Le risposte di AION sono generate algoritmicamente per intrattenimento e non costituiscono consulenze professionali. I dati elaborati da AION sono soggetti alle stesse protezioni di tutti gli altri dati personali."
  },
  
  s6: {
    title: "6. Valute Virtuali e Pulse Breaker",
    antiGambling: "DICHIARAZIONE ANTI-GAMBLING",
    intro: "M1SSION™ utilizza valute virtuali interne (M1U e PE) e include il mini-gioco Pulse Breaker. È fondamentale chiarire che:",
    m1u: "M1U e PE sono valute virtuali senza valore monetario reale. Non sono convertibili, scambiabili o rimborsabili in denaro. I dati relativi ai saldi sono conservati esclusivamente per il funzionamento del gioco.",
    pulse: "Pulse Breaker è un mini-gioco di INTRATTENIMENTO. NON è un servizio di gioco con finalità economica. Non costituisce gioco d'azzardo. Nessun dato viene condiviso con piattaforme di betting o gambling."
  },
  
  s7: {
    title: "7. Condivisione e Destinatari dei Dati",
    intro: "I dati personali possono essere condivisi con:",
    subTitle: "Sub-responsabili del Trattamento:",
    processors: [
      "Supabase Inc. (database, autenticazione) – USA, clausole contrattuali standard",
      "Cloudflare Inc. (CDN, sicurezza) – USA, certificazione Privacy Shield",
      "Apple Inc. / Google LLC (notifiche push, pagamenti in-app)",
      "OpenAI (elaborazione AI per AION) – con misure di anonimizzazione",
      "Stripe Inc. (pagamenti, se applicabile) – certificazione PCI-DSS"
    ],
    noSale: "⚠️ NON vendiamo, affittiamo o cediamo MAI i dati personali a terze parti per scopi commerciali o pubblicitari."
  },
  
  s8: {
    title: "8. Trasferimenti di Dati Extra-UE",
    intro: "Alcuni nostri fornitori di servizi sono situati al di fuori dell'Unione Europea. I trasferimenti avvengono nel rispetto del GDPR attraverso:",
    items: [
      "Clausole Contrattuali Standard (SCC) approvate dalla Commissione Europea",
      "Decisioni di adeguatezza della Commissione Europea",
      "Misure tecniche supplementari (crittografia, pseudonimizzazione)",
      "Verifica periodica delle garanzie dei fornitori"
    ]
  },
  
  s9: {
    title: "9. Sicurezza dei Dati",
    intro: "Implementiamo misure di sicurezza tecniche e organizzative adeguate:",
    items: [
      "Crittografia SSL/TLS per tutte le comunicazioni",
      "Crittografia dei dati a riposo (AES-256)",
      "Hashing sicuro delle password (bcrypt)",
      "Autenticazione a due fattori disponibile",
      "Accesso limitato ai dati su base \"need-to-know\"",
      "Monitoraggio continuo e rilevamento intrusioni",
      "Backup automatici con crittografia",
      "Audit di sicurezza periodici"
    ]
  },
  
  s10: {
    title: "10. Cookie e Tecnologie di Tracciamento",
    intro: "M1SSION™ utilizza le seguenti tecnologie:",
    items: [
      "Cookie tecnici essenziali (autenticazione, sessione)",
      "LocalStorage per preferenze utente",
      "Token per notifiche push",
      "Analytics anonimizzati per miglioramento servizio"
    ],
    link: "📄 Consulta la Cookie Policy completa →"
  },
  
  s11: {
    title: "11. Conservazione dei Dati",
    intro: "I dati personali sono conservati per il tempo strettamente necessario:",
    items: [
      "Dati di account: per tutta la durata dell'account attivo",
      "Dati di gioco: per tutta la durata dell'account + 30 giorni dopo cancellazione",
      "Log tecnici: massimo 90 giorni",
      "Dati di fatturazione: 10 anni (obblighi fiscali)",
      "Dopo la cancellazione dell'account: eliminazione entro 30 giorni (salvo obblighi legali)"
    ]
  },
  
  s12: {
    title: "12. Diritti dell'Interessato (GDPR)",
    intro: "In conformità al GDPR, hai i seguenti diritti:",
    rights: [
      { name: "Accesso (Art. 15)", desc: "Ottenere conferma e copia dei tuoi dati personali" },
      { name: "Rettifica (Art. 16)", desc: "Correggere dati inesatti o incompleti" },
      { name: "Cancellazione (Art. 17)", desc: "Richiedere l'eliminazione dei dati (\"diritto all'oblio\")" },
      { name: "Limitazione (Art. 18)", desc: "Limitare il trattamento in determinate circostanze" },
      { name: "Portabilità (Art. 20)", desc: "Ricevere i dati in formato strutturato e trasferirli" },
      { name: "Opposizione (Art. 21)", desc: "Opporti al trattamento per legittimo interesse" },
      { name: "Revoca Consenso", desc: "Revocare il consenso in qualsiasi momento" }
    ],
    exercise: "Per esercitare i tuoi diritti, contatta: contact@m1ssion.com. Risponderemo entro 30 giorni."
  },
  
  s13: {
    title: "13. Minori",
    intro: "M1SSION™ è destinato a utenti di almeno 13 anni. Non raccogliamo consapevolmente dati di minori al di sotto di tale età. Se un genitore o tutore scopre che un minore ha fornito dati senza consenso, ci contatti immediatamente per la rimozione."
  },
  
  s14: {
    title: "14. Modifiche alla Privacy Policy",
    intro: "Ci riserviamo il diritto di modificare questa Privacy Policy. Le modifiche significative saranno comunicate tramite notifica in-app e/o email almeno 30 giorni prima dell'entrata in vigore. L'uso continuato dell'app dopo le modifiche costituisce accettazione."
  },
  
  s15: {
    title: "15. Contatti e Reclami",
    intro: "Per qualsiasi domanda, richiesta o reclamo relativo alla privacy:",
    authority: "Hai inoltre il diritto di proporre reclamo all'Autorità Garante per la Protezione dei Dati Personali (www.garanteprivacy.it) o all'autorità di controllo del tuo paese di residenza."
  }
};

// ==================== ENGLISH VERSION ====================
const PRIVACY_EN = {
  title: "Privacy Policy",
  lastUpdate: "Last updated: December 5, 2025",
  draftNote: "Document compliant with EU Regulation 2016/679 (GDPR). Draft subject to legal review.",
  intro: "This Privacy Policy describes how NIYVORA KFT™ (\"Controller\") collects, uses, stores, and protects the personal data of M1SSION™ application users, in compliance with the General Data Protection Regulation (GDPR - EU Regulation 2016/679).",
  
  s1: {
    title: "1. Data Controller",
    intro: "The Data Controller for personal data processing is:",
    company: "Controller:",
    dpo: "Data Protection Officer (DPO)"
  },
  
  s2: {
    title: "2. Personal Data Collected",
    intro: "M1SSION™ collects the following categories of personal data:",
    account: {
      title: "Account Data",
      items: [
        "Username and agent code",
        "Email address",
        "Password (encrypted with secure hash)",
        "Profile picture (optional)",
        "Language and notification preferences"
      ]
    },
    geo: {
      title: "Geolocation Data",
      items: [
        "Real-time GPS coordinates (latitude, longitude)",
        "Location accuracy",
        "Detection timestamps",
        "Location history for completed missions"
      ]
    },
    usage: {
      title: "Usage and Performance Data",
      items: [
        "Game progress, completed missions, unlocked clues",
        "Session statistics (duration, frequency)",
        "Scores, leaderboards, achievements",
        "M1U (M1 Units) and PE (Pulse Energy) balance",
        "Pulse Breaker game history (internal game data only)"
      ]
    },
    tech: {
      title: "Technical Data",
      items: [
        "IP address",
        "Device type, operating system, app version",
        "Unique device identifiers",
        "Error logs and crash reports",
        "Push notification tokens"
      ]
    }
  },
  
  s3: {
    title: "3. Geolocation",
    warning: "⚠️ Geolocation is ESSENTIAL for M1SSION™ to function",
    intro: "The application requires location access to:",
    items: [
      "Display the 3D Buzz Map with geolocated clues",
      "Verify completion of physical missions",
      "Generate contextual clues based on location",
      "Enable augmented reality features",
      "Calculate distances and proximity to points of interest"
    ],
    note: "Real-time location data is NOT permanently stored. History of completed missions is retained for game chronicle purposes."
  },
  
  s4: {
    title: "4. Legal Bases for Processing (Art. 6 GDPR)",
    intro: "Personal data processing is based on the following legal grounds:",
    bases: [
      { type: "Contract (Art. 6.1.b)", desc: "Necessary for M1SSION™ service execution" },
      { type: "Consent (Art. 6.1.a)", desc: "For push notifications, marketing, optional geolocation" },
      { type: "Legitimate Interest (Art. 6.1.f)", desc: "Security, fraud prevention, service improvement" },
      { type: "Legal Obligation (Art. 6.1.c)", desc: "Tax compliance, competent authority requests" }
    ]
  },
  
  s5: {
    title: "5. AION Artificial Intelligence",
    intro: "M1SSION™ integrates AION, an artificial intelligence that assists users during gameplay. AION processes:",
    items: [
      "User messages and queries (to provide contextual responses)",
      "Game data (to personalize suggestions)",
      "User-set preferences (to adapt behavior)",
      "No data is used to train external models"
    ],
    note: "AION responses are algorithmically generated for entertainment and do not constitute professional advice. Data processed by AION is subject to the same protections as all other personal data."
  },
  
  s6: {
    title: "6. Virtual Currencies and Pulse Breaker",
    antiGambling: "ANTI-GAMBLING STATEMENT",
    intro: "M1SSION™ uses internal virtual currencies (M1U and PE) and includes the Pulse Breaker mini-game. It is essential to clarify that:",
    m1u: "M1U and PE are virtual currencies with no real monetary value. They are not convertible, exchangeable, or refundable for money. Balance data is stored exclusively for game operation.",
    pulse: "Pulse Breaker is an ENTERTAINMENT mini-game. It is NOT a gaming service with economic purposes. It does not constitute gambling. No data is shared with betting or gambling platforms."
  },
  
  s7: {
    title: "7. Data Sharing and Recipients",
    intro: "Personal data may be shared with:",
    subTitle: "Data Sub-processors:",
    processors: [
      "Supabase Inc. (database, authentication) – USA, standard contractual clauses",
      "Cloudflare Inc. (CDN, security) – USA, Privacy Shield certification",
      "Apple Inc. / Google LLC (push notifications, in-app payments)",
      "OpenAI (AI processing for AION) – with anonymization measures",
      "Stripe Inc. (payments, if applicable) – PCI-DSS certification"
    ],
    noSale: "⚠️ We NEVER sell, rent, or transfer personal data to third parties for commercial or advertising purposes."
  },
  
  s8: {
    title: "8. Extra-EU Data Transfers",
    intro: "Some of our service providers are located outside the European Union. Transfers occur in compliance with GDPR through:",
    items: [
      "Standard Contractual Clauses (SCCs) approved by the European Commission",
      "European Commission adequacy decisions",
      "Supplementary technical measures (encryption, pseudonymization)",
      "Periodic verification of provider guarantees"
    ]
  },
  
  s9: {
    title: "9. Data Security",
    intro: "We implement appropriate technical and organizational security measures:",
    items: [
      "SSL/TLS encryption for all communications",
      "Data encryption at rest (AES-256)",
      "Secure password hashing (bcrypt)",
      "Two-factor authentication available",
      "Data access limited on \"need-to-know\" basis",
      "Continuous monitoring and intrusion detection",
      "Automatic encrypted backups",
      "Periodic security audits"
    ]
  },
  
  s10: {
    title: "10. Cookies and Tracking Technologies",
    intro: "M1SSION™ uses the following technologies:",
    items: [
      "Essential technical cookies (authentication, session)",
      "LocalStorage for user preferences",
      "Push notification tokens",
      "Anonymized analytics for service improvement"
    ],
    link: "📄 View complete Cookie Policy →"
  },
  
  s11: {
    title: "11. Data Retention",
    intro: "Personal data is retained for the strictly necessary period:",
    items: [
      "Account data: for the duration of active account",
      "Game data: for account duration + 30 days after deletion",
      "Technical logs: maximum 90 days",
      "Billing data: 10 years (tax obligations)",
      "After account deletion: removal within 30 days (except legal obligations)"
    ]
  },
  
  s12: {
    title: "12. Data Subject Rights (GDPR)",
    intro: "In accordance with GDPR, you have the following rights:",
    rights: [
      { name: "Access (Art. 15)", desc: "Obtain confirmation and copy of your personal data" },
      { name: "Rectification (Art. 16)", desc: "Correct inaccurate or incomplete data" },
      { name: "Erasure (Art. 17)", desc: "Request data deletion (\"right to be forgotten\")" },
      { name: "Restriction (Art. 18)", desc: "Restrict processing in certain circumstances" },
      { name: "Portability (Art. 20)", desc: "Receive data in structured format and transfer it" },
      { name: "Object (Art. 21)", desc: "Object to processing based on legitimate interest" },
      { name: "Withdraw Consent", desc: "Withdraw consent at any time" }
    ],
    exercise: "To exercise your rights, contact: contact@m1ssion.com. We will respond within 30 days."
  },
  
  s13: {
    title: "13. Minors",
    intro: "M1SSION™ is intended for users at least 13 years of age. We do not knowingly collect data from minors below this age. If a parent or guardian discovers that a minor has provided data without consent, please contact us immediately for removal."
  },
  
  s14: {
    title: "14. Privacy Policy Changes",
    intro: "We reserve the right to modify this Privacy Policy. Significant changes will be communicated via in-app notification and/or email at least 30 days before taking effect. Continued use of the app after changes constitutes acceptance."
  },
  
  s15: {
    title: "15. Contacts and Complaints",
    intro: "For any questions, requests, or complaints regarding privacy:",
    authority: "You also have the right to lodge a complaint with the Data Protection Authority (www.garanteprivacy.it) or the supervisory authority in your country of residence."
  }
};

export default PrivacyPolicyComplete;


