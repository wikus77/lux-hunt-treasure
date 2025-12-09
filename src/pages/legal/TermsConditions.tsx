/**
 * M1SSION™ TERMS & CONDITIONS
 * Complete Legal Terms - Italian + English
 * © 2025 NIYVORA KFT™ – Joseph MULÉ – All Rights Reserved
 * 
 * NOTA LEGALE: Questo documento è una bozza tecnica e dovrà essere
 * sottoposto a revisione legale formale prima della pubblicazione definitiva.
 * 
 * STRUTTURA:
 * 1. Oggetto del Servizio e Definizioni
 * 2. Requisiti di Accesso e Registrazione
 * 3. Servizi di Gioco M1SSION™ (Buzz Map, missioni, indizi, classifiche)
 * 4. Valute Virtuali (M1U e Pulse Energy)
 * 5. Mini-gioco "Pulse Breaker" - Disclaimer Anti-Gambling
 * 6. Comportamento dell'Utente e Divieti
 * 7. Proprietà Intellettuale e Copyright
 * 8. Limitazione di Responsabilità e Sicurezza Missioni Fisiche
 * 9. Privacy e AI AION
 * 10. Modifiche ai Servizi e ai Termini
 * 11. Giurisdizione, Legge Applicabile e Risoluzione Controversie
 * 12. Contatti Legali
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  ArrowLeft, 
  Globe,
  Shield,
  Coins,
  Gamepad2,
  AlertTriangle,
  Scale,
  Lock,
  Bot,
  MapPin,
  Users,
  Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

type Language = 'it' | 'en';

const TermsConditions: React.FC = () => {
  const [, setLocation] = useLocation();
  const [lang, setLang] = useState<Language>('it');

  const content = lang === 'it' ? TERMS_IT : TERMS_EN;

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
                <h1 className="text-2xl font-orbitron font-bold text-white">
                  {lang === 'it' ? 'Termini e Condizioni' : 'Terms & Conditions'}
                </h1>
                <p className="text-white/70">M1SSION™</p>
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
                <FileText className="w-5 h-5 mr-2 text-[#00D1FF]" />
                {content.title}
              </CardTitle>
              <p className="text-white/60 text-sm mt-2">
                {content.lastUpdate}
              </p>
            </CardHeader>
            <CardContent className="space-y-8 text-white/90 leading-relaxed">
              
              {/* Section 1: Oggetto e Definizioni */}
              <Section icon={<Globe className="w-5 h-5" />} title={content.sections.s1.title}>
                <p>{content.sections.s1.intro}</p>
                <DefinitionList items={content.sections.s1.definitions} />
                <p className="text-white/70 text-sm italic mt-4">{content.sections.s1.disclaimer}</p>
              </Section>

              {/* Section 2: Requisiti di Accesso */}
              <Section icon={<Users className="w-5 h-5" />} title={content.sections.s2.title}>
                <p>{content.sections.s2.intro}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
                  {content.sections.s2.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </Section>

              {/* Section 3: Servizi di Gioco */}
              <Section icon={<MapPin className="w-5 h-5" />} title={content.sections.s3.title}>
                <p>{content.sections.s3.intro}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
                  {content.sections.s3.services.map((svc, i) => (
                    <li key={i}>{svc}</li>
                  ))}
                </ul>
                <p className="mt-4">{content.sections.s3.note}</p>
              </Section>

              {/* Section 4: Valute Virtuali M1U e PE */}
              <Section icon={<Coins className="w-5 h-5 text-yellow-400" />} title={content.sections.s4.title}>
                <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30 mb-4">
                  <p className="text-yellow-300 font-semibold mb-2">⚠️ {content.sections.s4.warning}</p>
                </div>
                <p>{content.sections.s4.intro}</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/20">
                    <h4 className="text-yellow-400 font-semibold mb-2">M1U (M1 Units)</h4>
                    <p className="text-white/70 text-sm">{content.sections.s4.m1u}</p>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                    <h4 className="text-purple-400 font-semibold mb-2">PE (Pulse Energy)</h4>
                    <p className="text-white/70 text-sm">{content.sections.s4.pe}</p>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-4">
                  {content.sections.s4.rules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </Section>

              {/* Section 5: Pulse Breaker - Anti-Gambling */}
              <Section icon={<Gamepad2 className="w-5 h-5 text-red-400" />} title={content.sections.s5.title}>
                <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30 mb-4">
                  <p className="text-red-300 font-semibold mb-2">🚫 {content.sections.s5.antiGambling}</p>
                </div>
                <p>{content.sections.s5.intro}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
                  {content.sections.s5.rules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
                <p className="mt-4 text-white/70 text-sm italic">{content.sections.s5.disclaimer}</p>
                <p className="mt-2 text-red-400 text-sm">{content.sections.s5.suspension}</p>
              </Section>

              {/* Section 6: Comportamento e Divieti */}
              <Section icon={<Ban className="w-5 h-5 text-red-400" />} title={content.sections.s6.title}>
                <p>{content.sections.s6.intro}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
                  {content.sections.s6.prohibitions.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <p className="mt-4 text-red-400">{content.sections.s6.consequences}</p>
              </Section>

              {/* Section 7: Proprietà Intellettuale */}
              <Section icon={<Shield className="w-5 h-5 text-[#00D1FF]" />} title={content.sections.s7.title}>
                <p>{content.sections.s7.intro}</p>
                <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30 mt-4">
                  <p className="text-red-300 font-semibold mb-2">{content.sections.s7.warningTitle}</p>
                  <ul className="list-disc list-inside space-y-1 text-white/80 text-sm">
                    {content.sections.s7.prohibitions.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <p className="mt-4 text-white/70 text-sm">{content.sections.s7.legal}</p>
              </Section>

              {/* Section 8: Limitazione Responsabilità e Sicurezza Missioni */}
              <Section icon={<AlertTriangle className="w-5 h-5 text-orange-400" />} title={content.sections.s8.title}>
                <p>{content.sections.s8.intro}</p>
                <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-500/30 mt-4">
                  <p className="text-orange-300 font-semibold mb-2">⚠️ {content.sections.s8.safetyTitle}</p>
                  <ul className="list-disc list-inside space-y-1 text-white/80 text-sm">
                    {content.sections.s8.safetyRules.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <p className="mt-4">{content.sections.s8.limitation}</p>
              </Section>

              {/* Section 9: Privacy e AION */}
              <Section icon={<Bot className="w-5 h-5 text-purple-400" />} title={content.sections.s9.title}>
                <p>{content.sections.s9.intro}</p>
                <p className="mt-3">{content.sections.s9.aion}</p>
                <p className="mt-3 text-[#00D1FF]">
                  <a href="/privacy-policy" className="hover:underline">{content.sections.s9.link}</a>
                </p>
              </Section>

              {/* Section 10: Modifiche */}
              <Section icon={<FileText className="w-5 h-5" />} title={content.sections.s10.title}>
                <p>{content.sections.s10.intro}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
                  {content.sections.s10.rules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </Section>

              {/* Section 11: Giurisdizione */}
              <Section icon={<Scale className="w-5 h-5" />} title={content.sections.s11.title}>
                <p>{content.sections.s11.intro}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
                  {content.sections.s11.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </Section>

              {/* Section 12: Contatti */}
              <Section icon={<Lock className="w-5 h-5" />} title={content.sections.s12.title}>
                <p>{content.sections.s12.intro}</p>
                <div className="bg-black/30 p-4 rounded-lg border border-[#00D1FF]/20 mt-4">
                  <p><strong>{content.sections.s12.company}</strong></p>
                  <p className="text-white/70">NIYVORA KFT™</p>
                  <p className="text-white/70">Budapest, Hungary</p>
                  <p className="text-[#00D1FF] mt-2">legal@m1ssion.app</p>
                </div>
              </Section>

              {/* Footer */}
              <div className="pt-6 border-t border-white/10 text-center text-white/60">
                <p>© 2025 M1SSION™ – {lang === 'it' ? 'Tutti i diritti riservati' : 'All Rights Reserved'}</p>
                <p className="text-sm mt-1">NIYVORA KFT™ – Budapest, Hungary</p>
                <p className="text-xs mt-3 text-white/40">
                  {content.draftNote}
                </p>
                <p className="text-xs mt-1 text-white/30">
                  {content.lastUpdate}
                </p>
              </div>
            </CardContent>
          </Card>
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

const DefinitionList: React.FC<{ items: { term: string; def: string }[] }> = ({ items }) => (
  <dl className="mt-4 space-y-3">
    {items.map((item, i) => (
      <div key={i} className="bg-black/20 p-3 rounded-lg">
        <dt className="font-semibold text-[#00D1FF]">{item.term}</dt>
        <dd className="text-white/70 text-sm mt-1">{item.def}</dd>
      </div>
    ))}
  </dl>
);

// ==================== ITALIAN VERSION ====================
const TERMS_IT = {
  title: "Termini e Condizioni d'Uso",
  lastUpdate: "Ultimo aggiornamento: 5 Dicembre 2025",
  draftNote: "Questo documento è una bozza informativa e potrà essere aggiornata in seguito a revisione legale formale.",
  sections: {
    s1: {
      title: "1. Oggetto del Servizio e Definizioni",
      intro: "I presenti Termini e Condizioni (\"Termini\") regolano l'accesso e l'utilizzo dell'applicazione M1SSION™, di proprietà di NIYVORA KFT™. Utilizzando l'applicazione, l'Utente accetta integralmente questi Termini.",
      definitions: [
        { term: "M1SSION™", def: "Applicazione mobile di gioco investigativo con elementi di geolocalizzazione, missioni fisiche e digitali, premi reali, classifiche e intelligenza artificiale." },
        { term: "Utente", def: "Qualsiasi persona fisica che accede e utilizza l'applicazione M1SSION™." },
        { term: "M1U (M1 Units)", def: "Valuta virtuale interna all'ecosistema M1SSION™, priva di valore monetario reale." },
        { term: "PE (Pulse Energy)", def: "Risorsa virtuale utilizzata per specifiche meccaniche di gioco, priva di valore monetario reale." },
        { term: "Buzz Map", def: "Mappa 3D geolocalizzata che mostra indizi, missioni e premi nell'ambiente circostante." },
        { term: "AION", def: "Intelligenza artificiale integrata che assiste l'Utente durante l'esperienza di gioco." },
        { term: "Pulse Breaker", def: "Mini-gioco di intrattenimento che utilizza M1U o PE con meccanica di moltiplicatore." }
      ],
      disclaimer: "I contenuti di M1SSION™ sono di puro intrattenimento e non costituiscono consulenze professionali, finanziarie o di altro tipo."
    },
    s2: {
      title: "2. Requisiti di Accesso e Registrazione",
      intro: "Per utilizzare M1SSION™, l'Utente deve soddisfare i seguenti requisiti:",
      requirements: [
        "Avere almeno 13 anni di età (o l'età minima richiesta dalla giurisdizione locale)",
        "Fornire informazioni accurate e veritiere durante la registrazione",
        "Mantenere la riservatezza delle credenziali di accesso",
        "Utilizzare un solo account personale",
        "Rispettare le leggi locali durante l'utilizzo dell'applicazione"
      ]
    },
    s3: {
      title: "3. Servizi di Gioco M1SSION™",
      intro: "M1SSION™ offre un'esperienza di gioco investigativo che include:",
      services: [
        "Buzz Map: mappa 3D interattiva con indizi geolocalizzati",
        "Missioni: sfide fisiche e digitali da completare nel mondo reale",
        "Indizi: elementi narrativi da scoprire e decifrare",
        "Classifiche: globali, nazionali e regionali",
        "Premi: ricompense fisiche e digitali per i giocatori",
        "Community: interazioni tra giocatori, messaggi e notifiche",
        "AION: assistente AI per supporto durante il gioco"
      ],
      note: "I servizi possono essere modificati, sospesi o interrotti in qualsiasi momento a discrezione di NIYVORA KFT™."
    },
    s4: {
      title: "4. Valute Virtuali (M1U e Pulse Energy)",
      warning: "AVVISO IMPORTANTE",
      intro: "M1SSION™ utilizza due tipologie di valute virtuali interne:",
      m1u: "Token virtuali utilizzati per sbloccare contenuti, partecipare a missioni e mini-giochi all'interno dell'ecosistema M1SSION™.",
      pe: "Energia virtuale utilizzata per specifiche meccaniche di gioco e partecipazione comunitaria.",
      rules: [
        "M1U e PE NON rappresentano denaro reale, strumenti finanziari, crediti o token blockchain",
        "M1U e PE NON sono scambiabili, vendibili o convertibili in valuta legale",
        "M1U e PE NON sono rimborsabili in alcuna forma",
        "M1U e PE possono essere guadagnati o persi SOLO all'interno dell'ecosistema M1SSION™",
        "M1U e PE non hanno alcun valore al di fuori dell'applicazione",
        "NIYVORA KFT™ si riserva il diritto di modificare i saldi, le meccaniche o il valore di M1U e PE"
      ]
    },
    s5: {
      title: "5. Mini-gioco \"Pulse Breaker\"",
      antiGambling: "DICHIARAZIONE ANTI-GAMBLING",
      intro: "Pulse Breaker è un mini-gioco di PURO INTRATTENIMENTO che utilizza esclusivamente M1U o PE. Il mini-gioco presenta una meccanica con moltiplicatore crescente e punto di \"crash\".",
      rules: [
        "Pulse Breaker NON è un gioco d'azzardo ai sensi delle normative applicabili",
        "NON è possibile scommettere o vincere denaro reale",
        "Le puntate avvengono SOLO con M1U o PE (valute virtuali)",
        "Le vincite sono esclusivamente in M1U o PE, senza alcun valore monetario",
        "I moltiplicatori e l'house edge sono parte della logica di gioco interna",
        "NON esiste alcuna possibilità di prelievo, conversione o riscatto in denaro",
        "Il gioco è progettato per intrattenimento, non per simulare comportamenti di gambling"
      ],
      disclaimer: "L'Utente è il solo responsabile del proprio comportamento e deve utilizzare Pulse Breaker in modo responsabile e consapevole.",
      suspension: "NIYVORA KFT™ si riserva il diritto di sospendere, limitare o revocare l'accesso a Pulse Breaker in caso di abuso, uso fraudolento o comportamento contrario ai presenti Termini."
    },
    s6: {
      title: "6. Comportamento dell'Utente e Divieti",
      intro: "L'Utente si impegna a utilizzare M1SSION™ in modo lecito e responsabile. È espressamente vietato:",
      prohibitions: [
        "Utilizzare l'applicazione per attività illegali o fraudolente",
        "Violare la proprietà privata durante le missioni",
        "Condividere, vendere o trasferire l'accesso al proprio account",
        "Creare account multipli per ottenere vantaggi non autorizzati",
        "Tentare di hackerare, decompilare o manomettere l'applicazione",
        "Utilizzare bot, script o software di automazione",
        "Manipolare classifiche, punteggi o meccaniche di gioco",
        "Diffamare, molestare o danneggiare altri Utenti",
        "Violare i diritti di proprietà intellettuale di NIYVORA KFT™"
      ],
      consequences: "La violazione di questi divieti comporterà la sospensione immediata o la cancellazione definitiva dell'account, senza preavviso e senza diritto a rimborso."
    },
    s7: {
      title: "7. Proprietà Intellettuale e Copyright",
      intro: "Tutti i contenuti di M1SSION™, inclusi ma non limitati a: testi, grafica, loghi, icone, immagini, audio, video, software, codice sorgente, interfacce, storyline, meccaniche di gioco, premi e design, sono di esclusiva proprietà di Joseph Mulé e NIYVORA KFT™, protetti dalle leggi sul copyright e sulla proprietà intellettuale.",
      warningTitle: "⛔ È ASSOLUTAMENTE VIETATO:",
      prohibitions: [
        "Copiare, riprodurre o distribuire qualsiasi contenuto dell'applicazione",
        "Effettuare reverse engineering, decompilazione o disassemblaggio del software",
        "Creare opere derivate basate su M1SSION™",
        "Utilizzare il marchio M1SSION™ senza autorizzazione scritta",
        "Estrarre dati, contenuti o informazioni dall'applicazione",
        "Utilizzare screenshot, video o registrazioni per scopi commerciali"
      ],
      legal: "Qualsiasi violazione sarà perseguita nelle sedi legali competenti e potrà comportare richieste di risarcimento danni."
    },
    s8: {
      title: "8. Limitazione di Responsabilità e Sicurezza nelle Missioni",
      intro: "M1SSION™ è fornito \"così com'è\" (as is) senza garanzie di alcun tipo. NIYVORA KFT™ non è responsabile per danni diretti, indiretti, incidentali o consequenziali derivanti dall'utilizzo dell'applicazione.",
      safetyTitle: "SICUREZZA NELLE MISSIONI FISICHE",
      safetyRules: [
        "L'Utente è responsabile della propria sicurezza durante le attività di gioco nel mondo reale",
        "È vietato entrare in proprietà private senza autorizzazione",
        "È vietato violare leggi locali, regolamenti o ordinanze",
        "È vietato mettersi in situazioni pericolose per completare missioni",
        "L'Utente deve sempre rispettare il codice della strada e le norme di sicurezza",
        "NIYVORA KFT™ declina ogni responsabilità per incidenti, infortuni o danni derivanti da comportamenti imprudenti o illegali"
      ],
      limitation: "In nessun caso NIYVORA KFT™ sarà responsabile per importi superiori a quanto eventualmente pagato dall'Utente per i servizi negli ultimi 12 mesi."
    },
    s9: {
      title: "9. Privacy e Intelligenza Artificiale AION",
      intro: "La raccolta e il trattamento dei dati personali dell'Utente sono regolati dalla nostra Privacy Policy, che costituisce parte integrante dei presenti Termini.",
      aion: "AION, l'intelligenza artificiale integrata in M1SSION™, elabora dati in base alle impostazioni privacy dell'Utente. AION fornisce assistenza, suggerimenti e contenuti generati algoritmicamente. Le risposte di AION sono di intrattenimento e non costituiscono consulenze professionali.",
      link: "📄 Consulta la Privacy Policy completa →"
    },
    s10: {
      title: "10. Modifiche ai Servizi e ai Termini",
      intro: "NIYVORA KFT™ si riserva il diritto di modificare in qualsiasi momento:",
      rules: [
        "I presenti Termini e Condizioni",
        "Le funzionalità e i servizi dell'applicazione",
        "Le meccaniche di gioco, premi e classifiche",
        "I valori e le regole relative a M1U e PE",
        "Le modifiche saranno comunicate tramite l'applicazione o via email",
        "L'uso continuato dell'applicazione dopo le modifiche costituisce accettazione delle stesse"
      ]
    },
    s11: {
      title: "11. Giurisdizione e Legge Applicabile",
      intro: "I presenti Termini sono regolati dalla legge italiana e dalle normative dell'Unione Europea applicabili.",
      points: [
        "Foro competente esclusivo: Tribunale di Milano, Italia",
        "Per controversie di consumo si applicano le normative UE sulla risoluzione alternativa delle controversie (ADR/ODR)",
        "L'Utente rinuncia a qualsiasi obiezione sulla competenza territoriale",
        "Le clausole dei presenti Termini sono da considerarsi separabili"
      ]
    },
    s12: {
      title: "12. Contatti Legali",
      intro: "Per domande, reclami o comunicazioni legali relative ai presenti Termini:"
    }
  }
};

// ==================== ENGLISH VERSION ====================
const TERMS_EN = {
  title: "Terms and Conditions of Use",
  lastUpdate: "Last updated: December 5, 2025",
  draftNote: "This document is an informational draft and may be updated following formal legal review.",
  sections: {
    s1: {
      title: "1. Subject Matter and Definitions",
      intro: "These Terms and Conditions (\"Terms\") govern access to and use of the M1SSION™ application, owned by NIYVORA KFT™. By using the application, the User fully accepts these Terms.",
      definitions: [
        { term: "M1SSION™", def: "Mobile investigative gaming application featuring geolocation elements, physical and digital missions, real prizes, leaderboards, and artificial intelligence." },
        { term: "User", def: "Any natural person who accesses and uses the M1SSION™ application." },
        { term: "M1U (M1 Units)", def: "Virtual currency internal to the M1SSION™ ecosystem, with no real monetary value." },
        { term: "PE (Pulse Energy)", def: "Virtual resource used for specific game mechanics, with no real monetary value." },
        { term: "Buzz Map", def: "3D geolocated map displaying clues, missions, and rewards in the surrounding environment." },
        { term: "AION", def: "Integrated artificial intelligence that assists the User during the gaming experience." },
        { term: "Pulse Breaker", def: "Entertainment mini-game using M1U or PE with multiplier mechanics." }
      ],
      disclaimer: "M1SSION™ content is purely for entertainment and does not constitute professional, financial, or any other type of advice."
    },
    s2: {
      title: "2. Access Requirements and Registration",
      intro: "To use M1SSION™, the User must meet the following requirements:",
      requirements: [
        "Be at least 13 years of age (or the minimum age required by local jurisdiction)",
        "Provide accurate and truthful information during registration",
        "Maintain confidentiality of login credentials",
        "Use only one personal account",
        "Comply with local laws when using the application"
      ]
    },
    s3: {
      title: "3. M1SSION™ Gaming Services",
      intro: "M1SSION™ offers an investigative gaming experience that includes:",
      services: [
        "Buzz Map: interactive 3D map with geolocated clues",
        "Missions: physical and digital challenges to complete in the real world",
        "Clues: narrative elements to discover and decipher",
        "Leaderboards: global, national, and regional rankings",
        "Prizes: physical and digital rewards for players",
        "Community: player interactions, messages, and notifications",
        "AION: AI assistant for in-game support"
      ],
      note: "Services may be modified, suspended, or discontinued at any time at the discretion of NIYVORA KFT™."
    },
    s4: {
      title: "4. Virtual Currencies (M1U and Pulse Energy)",
      warning: "IMPORTANT NOTICE",
      intro: "M1SSION™ uses two types of internal virtual currencies:",
      m1u: "Virtual tokens used to unlock content, participate in missions and mini-games within the M1SSION™ ecosystem.",
      pe: "Virtual energy used for specific game mechanics and community participation.",
      rules: [
        "M1U and PE do NOT represent real money, financial instruments, credits, or blockchain tokens",
        "M1U and PE are NOT exchangeable, sellable, or convertible to legal currency",
        "M1U and PE are NOT refundable in any form",
        "M1U and PE can only be earned or lost within the M1SSION™ ecosystem",
        "M1U and PE have no value outside the application",
        "NIYVORA KFT™ reserves the right to modify balances, mechanics, or value of M1U and PE"
      ]
    },
    s5: {
      title: "5. \"Pulse Breaker\" Mini-Game",
      antiGambling: "ANTI-GAMBLING STATEMENT",
      intro: "Pulse Breaker is a PURELY ENTERTAINMENT mini-game that exclusively uses M1U or PE. The mini-game features a mechanic with increasing multipliers and a \"crash\" point.",
      rules: [
        "Pulse Breaker is NOT gambling under applicable regulations",
        "It is NOT possible to bet or win real money",
        "Bets are made ONLY with M1U or PE (virtual currencies)",
        "Winnings are exclusively in M1U or PE, with no monetary value",
        "Multipliers and house edge are part of the internal game logic",
        "There is NO possibility of withdrawal, conversion, or redemption for money",
        "The game is designed for entertainment, not to simulate gambling behavior"
      ],
      disclaimer: "The User is solely responsible for their behavior and must use Pulse Breaker responsibly and consciously.",
      suspension: "NIYVORA KFT™ reserves the right to suspend, limit, or revoke access to Pulse Breaker in case of abuse, fraudulent use, or behavior contrary to these Terms."
    },
    s6: {
      title: "6. User Conduct and Prohibitions",
      intro: "The User agrees to use M1SSION™ lawfully and responsibly. The following is expressly prohibited:",
      prohibitions: [
        "Using the application for illegal or fraudulent activities",
        "Trespassing on private property during missions",
        "Sharing, selling, or transferring access to your account",
        "Creating multiple accounts to gain unauthorized advantages",
        "Attempting to hack, decompile, or tamper with the application",
        "Using bots, scripts, or automation software",
        "Manipulating leaderboards, scores, or game mechanics",
        "Defaming, harassing, or harming other Users",
        "Violating NIYVORA KFT™'s intellectual property rights"
      ],
      consequences: "Violation of these prohibitions will result in immediate suspension or permanent deletion of the account, without notice and without right to refund."
    },
    s7: {
      title: "7. Intellectual Property and Copyright",
      intro: "All M1SSION™ content, including but not limited to: texts, graphics, logos, icons, images, audio, video, software, source code, interfaces, storylines, game mechanics, prizes, and design, are the exclusive property of Joseph Mulé and NIYVORA KFT™, protected by copyright and intellectual property laws.",
      warningTitle: "⛔ ABSOLUTELY PROHIBITED:",
      prohibitions: [
        "Copying, reproducing, or distributing any application content",
        "Reverse engineering, decompiling, or disassembling the software",
        "Creating derivative works based on M1SSION™",
        "Using the M1SSION™ trademark without written authorization",
        "Extracting data, content, or information from the application",
        "Using screenshots, videos, or recordings for commercial purposes"
      ],
      legal: "Any violation will be prosecuted in competent legal venues and may result in claims for damages."
    },
    s8: {
      title: "8. Limitation of Liability and Mission Safety",
      intro: "M1SSION™ is provided \"as is\" without warranties of any kind. NIYVORA KFT™ is not responsible for direct, indirect, incidental, or consequential damages arising from use of the application.",
      safetyTitle: "PHYSICAL MISSION SAFETY",
      safetyRules: [
        "The User is responsible for their own safety during real-world gaming activities",
        "Entering private property without authorization is prohibited",
        "Violating local laws, regulations, or ordinances is prohibited",
        "Putting oneself in dangerous situations to complete missions is prohibited",
        "The User must always respect traffic laws and safety regulations",
        "NIYVORA KFT™ disclaims all responsibility for accidents, injuries, or damages resulting from reckless or illegal behavior"
      ],
      limitation: "In no event shall NIYVORA KFT™ be liable for amounts exceeding what the User may have paid for services in the last 12 months."
    },
    s9: {
      title: "9. Privacy and AION Artificial Intelligence",
      intro: "Collection and processing of User personal data is governed by our Privacy Policy, which forms an integral part of these Terms.",
      aion: "AION, the artificial intelligence integrated into M1SSION™, processes data according to User privacy settings. AION provides assistance, suggestions, and algorithmically generated content. AION responses are for entertainment and do not constitute professional advice.",
      link: "📄 View complete Privacy Policy →"
    },
    s10: {
      title: "10. Changes to Services and Terms",
      intro: "NIYVORA KFT™ reserves the right to modify at any time:",
      rules: [
        "These Terms and Conditions",
        "Application features and services",
        "Game mechanics, prizes, and leaderboards",
        "Values and rules relating to M1U and PE",
        "Changes will be communicated through the application or via email",
        "Continued use of the application after changes constitutes acceptance thereof"
      ]
    },
    s11: {
      title: "11. Jurisdiction and Applicable Law",
      intro: "These Terms are governed by Italian law and applicable European Union regulations.",
      points: [
        "Exclusive jurisdiction: Court of Milan, Italy",
        "For consumer disputes, EU regulations on alternative dispute resolution (ADR/ODR) apply",
        "The User waives any objection to territorial jurisdiction",
        "The clauses of these Terms are to be considered severable"
      ]
    },
    s12: {
      title: "12. Legal Contacts",
      intro: "For questions, complaints, or legal communications regarding these Terms:"
    }
  }
};

export default TermsConditions;



