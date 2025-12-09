/**
 * M1SSION™ COOKIE POLICY - COMPLETE GDPR/ePrivacy COMPLIANT
 * Italian + English Version with Language Switcher
 * © 2025 NIYVORA KFT™ – Joseph MULÉ – All Rights Reserved
 * 
 * Conforme a: GDPR, ePrivacy, Direttiva 2002/58/CE, Linee guida Garante italiano
 * Versione: 1.1
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Cookie, 
  ArrowLeft, 
  Shield,
  Settings,
  BarChart3,
  Megaphone,
  Lock,
  Server,
  Globe,
  Mail,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

type Language = 'it' | 'en';

const CookiePolicyComplete: React.FC = () => {
  const [, setLocation] = useLocation();
  const [lang, setLang] = useState<Language>('it');

  const content = lang === 'it' ? COOKIE_IT : COOKIE_EN;
  const today = new Date().toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

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
                <h1 className="text-2xl font-orbitron font-bold text-white">Cookie Policy</h1>
                <p className="text-white/70">M1SSION™ – GDPR & ePrivacy</p>
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
                <Cookie className="w-5 h-5 mr-2 text-[#00D1FF]" />
                {content.title}
              </CardTitle>
              <p className="text-white/60 text-sm mt-2">
                {content.version} | {content.lastUpdate}: {today}
              </p>
            </CardHeader>
            <CardContent className="space-y-8 text-white/90 leading-relaxed">
              
              {/* Intro */}
              <div className="bg-[#00D1FF]/10 p-4 rounded-lg border border-[#00D1FF]/20">
                <p>{content.intro}</p>
              </div>

              {/* Section 1: Cosa sono i Cookie */}
              <Section icon={<Info className="w-5 h-5" />} title={content.s1.title}>
                <p>{content.s1.intro}</p>
                <p className="mt-3">{content.s1.types}</p>
              </Section>

              {/* Section 2: Titolare */}
              <Section icon={<Shield className="w-5 h-5" />} title={content.s2.title}>
                <div className="bg-black/30 p-4 rounded-lg border border-[#00D1FF]/20">
                  <p><strong>NIYVORA KFT™</strong></p>
                  <p className="text-white/70">Budapest, Hungary</p>
                  <p className="text-white/70 mt-2">{content.s2.dpo}: Joseph Mulé</p>
                  <p className="text-[#00D1FF]">contact@m1ssion.com</p>
                </div>
              </Section>

              {/* Section 3: Cookie Tecnici Essenziali */}
              <Section icon={<Lock className="w-5 h-5 text-green-400" />} title={content.s3.title}>
                <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30 mb-4">
                  <p className="text-green-300 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    {content.s3.required}
                  </p>
                </div>
                <p>{content.s3.intro}</p>
                <CookieTable cookies={content.s3.cookies} />
              </Section>

              {/* Section 4: Cookie Funzionali */}
              <Section icon={<Settings className="w-5 h-5 text-blue-400" />} title={content.s4.title}>
                <p>{content.s4.intro}</p>
                <CookieTable cookies={content.s4.cookies} />
              </Section>

              {/* Section 5: Cookie Analitici */}
              <Section icon={<BarChart3 className="w-5 h-5 text-purple-400" />} title={content.s5.title}>
                <p>{content.s5.intro}</p>
                <CookieTable cookies={content.s5.cookies} />
                <p className="mt-4 text-white/70 text-sm italic">{content.s5.note}</p>
              </Section>

              {/* Section 6: Cookie Marketing */}
              <Section icon={<Megaphone className="w-5 h-5 text-orange-400" />} title={content.s6.title}>
                <p>{content.s6.intro}</p>
                <CookieTable cookies={content.s6.cookies} />
              </Section>

              {/* Section 7: Cookie di Terze Parti */}
              <Section icon={<Globe className="w-5 h-5" />} title={content.s7.title}>
                <p>{content.s7.intro}</p>
                <div className="grid gap-3 mt-4">
                  {content.s7.thirdParties.map((tp, i) => (
                    <div key={i} className="bg-black/20 p-4 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-[#00D1FF]">{tp.name}</span>
                        <span className="text-xs text-white/50">{tp.type}</span>
                      </div>
                      <p className="text-white/70 text-sm">{tp.purpose}</p>
                      <a 
                        href={tp.policy} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#00D1FF] text-xs hover:underline mt-2 inline-block"
                      >
                        {content.s7.policyLink} →
                      </a>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Section 8: LocalStorage e SessionStorage */}
              <Section icon={<Server className="w-5 h-5" />} title={content.s8.title}>
                <p>{content.s8.intro}</p>
                <CookieTable cookies={content.s8.storage} />
              </Section>

              {/* Section 9: M1U, PE, Pulse Breaker */}
              <Section icon={<AlertTriangle className="w-5 h-5 text-yellow-400" />} title={content.s9.title}>
                <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30 mb-4">
                  <p className="text-red-300 font-semibold">🚫 {content.s9.antiGambling}</p>
                </div>
                <p>{content.s9.intro}</p>
              </Section>

              {/* Section 10: Gestione Preferenze */}
              <Section icon={<Settings className="w-5 h-5" />} title={content.s10.title}>
                <p>{content.s10.intro}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
                  {content.s10.methods.map((method, i) => <li key={i}>{method}</li>)}
                </ul>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button 
                    className="bg-gradient-to-r from-[#00D1FF] to-[#7B2BF9] hover:opacity-90"
                    onClick={() => setLocation('/settings')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {content.s10.settingsBtn}
                  </Button>
                </div>
              </Section>

              {/* Section 11: Diritti Utente */}
              <Section icon={<Shield className="w-5 h-5 text-[#00D1FF]" />} title={content.s11.title}>
                <p>{content.s11.intro}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
                  {content.s11.rights.map((right, i) => <li key={i}>{right}</li>)}
                </ul>
              </Section>

              {/* Section 12: Modifiche */}
              <Section icon={<Info className="w-5 h-5" />} title={content.s12.title}>
                <p>{content.s12.intro}</p>
              </Section>

              {/* Section 13: Contatti */}
              <Section icon={<Mail className="w-5 h-5" />} title={content.s13.title}>
                <p>{content.s13.intro}</p>
                <div className="bg-black/30 p-4 rounded-lg border border-[#00D1FF]/20 mt-4">
                  <p><strong>NIYVORA KFT™</strong></p>
                  <p className="text-[#00D1FF] text-lg mt-2">contact@m1ssion.com</p>
                </div>
              </Section>

              {/* Footer */}
              <div className="pt-6 border-t border-white/10 text-center text-white/60">
                <p>© 2025 M1SSION™ – GDPR & ePrivacy Compliant</p>
                <p className="text-sm mt-1">NIYVORA KFT™ – Budapest, Hungary</p>
                <p className="text-xs mt-3 text-white/40">{content.version} | {content.lastUpdate}: {today}</p>
                <p className="text-xs mt-1 text-white/30">{content.draftNote}</p>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => setLocation('/privacy-policy')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Privacy Policy
            </Button>
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => setLocation('/terms')}
            >
              <Info className="w-4 h-4 mr-2" />
              {lang === 'it' ? 'Termini di Servizio' : 'Terms of Service'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Helper Components
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

interface CookieInfo {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
}

const CookieTable: React.FC<{ cookies: CookieInfo[] }> = ({ cookies }) => (
  <div className="overflow-x-auto mt-4">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-white/10">
          <th className="text-left py-2 px-3 text-[#00D1FF]">Cookie/Key</th>
          <th className="text-left py-2 px-3 text-[#00D1FF]">Provider</th>
          <th className="text-left py-2 px-3 text-[#00D1FF]">Finalità</th>
          <th className="text-left py-2 px-3 text-[#00D1FF]">Durata</th>
        </tr>
      </thead>
      <tbody>
        {cookies.map((cookie, i) => (
          <tr key={i} className="border-b border-white/5">
            <td className="py-2 px-3 font-mono text-xs text-purple-300">{cookie.name}</td>
            <td className="py-2 px-3 text-white/70">{cookie.provider}</td>
            <td className="py-2 px-3 text-white/70">{cookie.purpose}</td>
            <td className="py-2 px-3 text-white/50">{cookie.duration}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ==================== ITALIAN VERSION ====================
const COOKIE_IT = {
  title: "Cookie Policy",
  version: "Versione 1.1",
  lastUpdate: "Ultimo aggiornamento",
  draftNote: "Conforme a GDPR (Reg. UE 2016/679), ePrivacy e Direttiva 2002/58/CE",
  intro: "La presente Cookie Policy descrive le tipologie di cookie e tecnologie analoghe utilizzate dall'applicazione M1SSION™ di proprietà di NIYVORA KFT™. Questo documento è parte integrante della Privacy Policy.",
  
  s1: {
    title: "1. Cosa sono i Cookie",
    intro: "I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo (computer, smartphone, tablet) quando visiti un sito web o utilizzi un'applicazione. Servono a memorizzare informazioni sulla tua visita, come le preferenze di lingua, le impostazioni e altri dati utili per migliorare l'esperienza utente.",
    types: "Oltre ai cookie, M1SSION™ utilizza anche localStorage e sessionStorage, tecnologie simili che memorizzano dati nel browser ma con caratteristiche diverse: localStorage persiste anche dopo la chiusura del browser, mentre sessionStorage viene cancellato alla chiusura della sessione."
  },
  
  s2: {
    title: "2. Titolare del Trattamento",
    dpo: "Data Protection Officer"
  },
  
  s3: {
    title: "3. Cookie Tecnici Essenziali",
    required: "Questi cookie sono NECESSARI e non possono essere disabilitati",
    intro: "I cookie tecnici sono indispensabili per il corretto funzionamento dell'applicazione. Senza di essi, M1SSION™ non potrebbe fornire i suoi servizi base.",
    cookies: [
      { name: "sb-*-auth-token", provider: "Supabase", purpose: "Autenticazione utente", duration: "Sessione/7gg" },
      { name: "sb-*-auth-token-code-verifier", provider: "Supabase", purpose: "Verifica sicurezza PKCE", duration: "Sessione" },
      { name: "__cf_bm", provider: "Cloudflare", purpose: "Protezione bot/DDoS", duration: "30 min" },
      { name: "cf_clearance", provider: "Cloudflare", purpose: "Bypass captcha", duration: "1 anno" },
      { name: "__stripe_mid", provider: "Stripe", purpose: "Prevenzione frodi pagamenti", duration: "1 anno" },
      { name: "__stripe_sid", provider: "Stripe", purpose: "ID sessione pagamento", duration: "Sessione" }
    ]
  },
  
  s4: {
    title: "4. Cookie Funzionali / Preferenze",
    intro: "Questi cookie memorizzano le tue preferenze per personalizzare l'esperienza nell'app.",
    cookies: [
      { name: "m1:language", provider: "M1SSION™", purpose: "Lingua preferita", duration: "1 anno" },
      { name: "m1:theme", provider: "M1SSION™", purpose: "Tema (dark/light)", duration: "1 anno" },
      { name: "m1:onboarding_complete", provider: "M1SSION™", purpose: "Tutorial completato", duration: "Permanente" },
      { name: "m1:sound_enabled", provider: "M1SSION™", purpose: "Preferenza audio", duration: "Permanente" }
    ]
  },
  
  s5: {
    title: "5. Cookie Analitici",
    intro: "Questi cookie ci aiutano a capire come utilizzi l'app per migliorare l'esperienza. Richiedono il tuo consenso.",
    cookies: [
      { name: "_ga", provider: "Google Analytics", purpose: "Identificativo utente anonimo", duration: "2 anni" },
      { name: "_ga_*", provider: "Google Analytics", purpose: "Stato sessione", duration: "2 anni" },
      { name: "_gid", provider: "Google Analytics", purpose: "Distinzione utenti", duration: "24 ore" },
      { name: "_gat", provider: "Google Analytics", purpose: "Rate limiting richieste", duration: "1 minuto" }
    ],
    note: "Google Analytics è configurato con IP anonimizzato (anonymize_ip: true) e senza personalizzazione annunci."
  },
  
  s6: {
    title: "6. Cookie di Marketing e Profilazione",
    intro: "Attualmente M1SSION™ NON utilizza cookie di marketing o profilazione di terze parti. Se in futuro verranno introdotti, questa policy sarà aggiornata e ti verrà richiesto un consenso esplicito.",
    cookies: [
      { name: "(nessuno)", provider: "-", purpose: "Non utilizzati", duration: "-" }
    ]
  },
  
  s7: {
    title: "7. Servizi di Terze Parti",
    intro: "M1SSION™ si avvale dei seguenti servizi esterni che potrebbero impostare propri cookie:",
    thirdParties: [
      { 
        name: "Supabase", 
        type: "Database & Auth", 
        purpose: "Autenticazione, database real-time, storage file",
        policy: "https://supabase.com/privacy"
      },
      { 
        name: "Cloudflare", 
        type: "CDN & Security", 
        purpose: "Distribuzione contenuti, protezione DDoS, ottimizzazione performance",
        policy: "https://www.cloudflare.com/privacypolicy/"
      },
      { 
        name: "Stripe", 
        type: "Pagamenti", 
        purpose: "Elaborazione pagamenti, gestione abbonamenti, prevenzione frodi",
        policy: "https://stripe.com/privacy"
      },
      { 
        name: "Google Analytics 4", 
        type: "Analytics", 
        purpose: "Analisi utilizzo app (con consenso), statistiche aggregate anonimizzate",
        policy: "https://policies.google.com/privacy"
      },
      { 
        name: "Cookie-Script", 
        type: "Consent Management", 
        purpose: "Gestione banner cookie e preferenze consenso GDPR",
        policy: "https://cookie-script.com/privacy-policy"
      }
    ],
    policyLink: "Privacy Policy"
  },
  
  s8: {
    title: "8. LocalStorage e SessionStorage",
    intro: "Oltre ai cookie, M1SSION™ utilizza le seguenti chiavi di storage nel browser:",
    storage: [
      { name: "m1:cookie_consent:v1", provider: "M1SSION™", purpose: "Stato consenso cookie", duration: "180 giorni" },
      { name: "m1:push_token", provider: "M1SSION™", purpose: "Token notifiche push", duration: "Permanente" },
      { name: "m1:last_sync", provider: "M1SSION™", purpose: "Timestamp ultima sincronizzazione", duration: "Permanente" },
      { name: "m1:buzz_cache", provider: "M1SSION™", purpose: "Cache indizi Buzz Map", duration: "Sessione" },
      { name: "m1:geo_permission", provider: "M1SSION™", purpose: "Stato permesso geolocalizzazione", duration: "Permanente" }
    ]
  },
  
  s9: {
    title: "9. M1U, Pulse Energy e Pulse Breaker",
    antiGambling: "DICHIARAZIONE ANTI-GAMBLING",
    intro: "I dati relativi a M1U (M1 Units), Pulse Energy (PE) e al mini-gioco Pulse Breaker sono memorizzati ESCLUSIVAMENTE nel database Supabase lato server, NON in cookie locali. Questi dati sono utilizzati unicamente per il funzionamento del gioco e non hanno alcun valore monetario reale. Pulse Breaker NON è un gioco d'azzardo: non è possibile vincere, convertire o prelevare denaro reale."
  },
  
  s10: {
    title: "10. Gestione delle Preferenze Cookie",
    intro: "Puoi gestire le tue preferenze sui cookie in diversi modi:",
    methods: [
      "Banner cookie: appare al primo accesso e permette di accettare, rifiutare o personalizzare",
      "Impostazioni app: sezione Privacy nelle Impostazioni di M1SSION™",
      "Impostazioni browser: puoi bloccare o cancellare i cookie dal tuo browser",
      "Revoca consenso: puoi revocare il consenso in qualsiasi momento dalle impostazioni"
    ],
    settingsBtn: "Vai alle Impostazioni"
  },
  
  s11: {
    title: "11. I Tuoi Diritti",
    intro: "In conformità al GDPR, hai il diritto di:",
    rights: [
      "Revocare il consenso ai cookie non essenziali in qualsiasi momento",
      "Richiedere informazioni sui dati raccolti tramite cookie",
      "Richiedere la cancellazione dei cookie (dove tecnicamente possibile)",
      "Presentare reclamo al Garante Privacy (www.garanteprivacy.it)"
    ]
  },
  
  s12: {
    title: "12. Modifiche alla Cookie Policy",
    intro: "Ci riserviamo il diritto di aggiornare questa Cookie Policy. Le modifiche significative saranno comunicate tramite banner in-app. La data dell'ultimo aggiornamento è indicata in cima a questo documento."
  },
  
  s13: {
    title: "13. Contatti",
    intro: "Per qualsiasi domanda sulla Cookie Policy o per esercitare i tuoi diritti:"
  }
};

// ==================== ENGLISH VERSION ====================
const COOKIE_EN = {
  title: "Cookie Policy",
  version: "Version 1.1",
  lastUpdate: "Last updated",
  draftNote: "Compliant with GDPR (EU Reg. 2016/679), ePrivacy and Directive 2002/58/EC",
  intro: "This Cookie Policy describes the types of cookies and similar technologies used by the M1SSION™ application owned by NIYVORA KFT™. This document is an integral part of the Privacy Policy.",
  
  s1: {
    title: "1. What are Cookies",
    intro: "Cookies are small text files stored on your device (computer, smartphone, tablet) when you visit a website or use an application. They store information about your visit, such as language preferences, settings, and other data useful for improving user experience.",
    types: "In addition to cookies, M1SSION™ also uses localStorage and sessionStorage, similar technologies that store data in the browser but with different characteristics: localStorage persists even after closing the browser, while sessionStorage is deleted when the session ends."
  },
  
  s2: {
    title: "2. Data Controller",
    dpo: "Data Protection Officer"
  },
  
  s3: {
    title: "3. Essential Technical Cookies",
    required: "These cookies are NECESSARY and cannot be disabled",
    intro: "Technical cookies are essential for the proper functioning of the application. Without them, M1SSION™ could not provide its basic services.",
    cookies: [
      { name: "sb-*-auth-token", provider: "Supabase", purpose: "User authentication", duration: "Session/7d" },
      { name: "sb-*-auth-token-code-verifier", provider: "Supabase", purpose: "PKCE security verification", duration: "Session" },
      { name: "__cf_bm", provider: "Cloudflare", purpose: "Bot/DDoS protection", duration: "30 min" },
      { name: "cf_clearance", provider: "Cloudflare", purpose: "Captcha bypass", duration: "1 year" },
      { name: "__stripe_mid", provider: "Stripe", purpose: "Payment fraud prevention", duration: "1 year" },
      { name: "__stripe_sid", provider: "Stripe", purpose: "Payment session ID", duration: "Session" }
    ]
  },
  
  s4: {
    title: "4. Functional / Preference Cookies",
    intro: "These cookies store your preferences to personalize your experience in the app.",
    cookies: [
      { name: "m1:language", provider: "M1SSION™", purpose: "Preferred language", duration: "1 year" },
      { name: "m1:theme", provider: "M1SSION™", purpose: "Theme (dark/light)", duration: "1 year" },
      { name: "m1:onboarding_complete", provider: "M1SSION™", purpose: "Tutorial completed", duration: "Permanent" },
      { name: "m1:sound_enabled", provider: "M1SSION™", purpose: "Audio preference", duration: "Permanent" }
    ]
  },
  
  s5: {
    title: "5. Analytics Cookies",
    intro: "These cookies help us understand how you use the app to improve the experience. They require your consent.",
    cookies: [
      { name: "_ga", provider: "Google Analytics", purpose: "Anonymous user identifier", duration: "2 years" },
      { name: "_ga_*", provider: "Google Analytics", purpose: "Session state", duration: "2 years" },
      { name: "_gid", provider: "Google Analytics", purpose: "User distinction", duration: "24 hours" },
      { name: "_gat", provider: "Google Analytics", purpose: "Request rate limiting", duration: "1 minute" }
    ],
    note: "Google Analytics is configured with anonymized IP (anonymize_ip: true) and without ad personalization."
  },
  
  s6: {
    title: "6. Marketing and Profiling Cookies",
    intro: "Currently M1SSION™ does NOT use third-party marketing or profiling cookies. If introduced in the future, this policy will be updated and explicit consent will be requested.",
    cookies: [
      { name: "(none)", provider: "-", purpose: "Not used", duration: "-" }
    ]
  },
  
  s7: {
    title: "7. Third-Party Services",
    intro: "M1SSION™ uses the following external services that may set their own cookies:",
    thirdParties: [
      { 
        name: "Supabase", 
        type: "Database & Auth", 
        purpose: "Authentication, real-time database, file storage",
        policy: "https://supabase.com/privacy"
      },
      { 
        name: "Cloudflare", 
        type: "CDN & Security", 
        purpose: "Content distribution, DDoS protection, performance optimization",
        policy: "https://www.cloudflare.com/privacypolicy/"
      },
      { 
        name: "Stripe", 
        type: "Payments", 
        purpose: "Payment processing, subscription management, fraud prevention",
        policy: "https://stripe.com/privacy"
      },
      { 
        name: "Google Analytics 4", 
        type: "Analytics", 
        purpose: "App usage analysis (with consent), anonymized aggregate statistics",
        policy: "https://policies.google.com/privacy"
      },
      { 
        name: "Cookie-Script", 
        type: "Consent Management", 
        purpose: "Cookie banner management and GDPR consent preferences",
        policy: "https://cookie-script.com/privacy-policy"
      }
    ],
    policyLink: "Privacy Policy"
  },
  
  s8: {
    title: "8. LocalStorage and SessionStorage",
    intro: "In addition to cookies, M1SSION™ uses the following storage keys in the browser:",
    storage: [
      { name: "m1:cookie_consent:v1", provider: "M1SSION™", purpose: "Cookie consent status", duration: "180 days" },
      { name: "m1:push_token", provider: "M1SSION™", purpose: "Push notification token", duration: "Permanent" },
      { name: "m1:last_sync", provider: "M1SSION™", purpose: "Last sync timestamp", duration: "Permanent" },
      { name: "m1:buzz_cache", provider: "M1SSION™", purpose: "Buzz Map clue cache", duration: "Session" },
      { name: "m1:geo_permission", provider: "M1SSION™", purpose: "Geolocation permission status", duration: "Permanent" }
    ]
  },
  
  s9: {
    title: "9. M1U, Pulse Energy and Pulse Breaker",
    antiGambling: "ANTI-GAMBLING STATEMENT",
    intro: "Data related to M1U (M1 Units), Pulse Energy (PE) and the Pulse Breaker mini-game is stored EXCLUSIVELY in the Supabase server-side database, NOT in local cookies. This data is used solely for game operation and has no real monetary value. Pulse Breaker is NOT gambling: it is not possible to win, convert, or withdraw real money."
  },
  
  s10: {
    title: "10. Managing Cookie Preferences",
    intro: "You can manage your cookie preferences in several ways:",
    methods: [
      "Cookie banner: appears on first access and allows you to accept, reject, or customize",
      "App settings: Privacy section in M1SSION™ Settings",
      "Browser settings: you can block or delete cookies from your browser",
      "Consent withdrawal: you can withdraw consent at any time from settings"
    ],
    settingsBtn: "Go to Settings"
  },
  
  s11: {
    title: "11. Your Rights",
    intro: "In accordance with GDPR, you have the right to:",
    rights: [
      "Withdraw consent for non-essential cookies at any time",
      "Request information about data collected via cookies",
      "Request deletion of cookies (where technically possible)",
      "File a complaint with the Data Protection Authority"
    ]
  },
  
  s12: {
    title: "12. Changes to Cookie Policy",
    intro: "We reserve the right to update this Cookie Policy. Significant changes will be communicated via in-app banner. The date of the last update is indicated at the top of this document."
  },
  
  s13: {
    title: "13. Contacts",
    intro: "For any questions about the Cookie Policy or to exercise your rights:"
  }
};

export default CookiePolicyComplete;


