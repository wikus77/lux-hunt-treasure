
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useProfileImage } from '@/hooks/useProfileImage';

const HelpFaq = () => {
  const { profileImage } = useProfileImage();
  const navigate = useNavigate();

  const handleEmailClick = () => {
    // Navigate to notifications or handle email click
  };

  return (
    <div className="min-h-screen bg-black">
      <UnifiedHeader 
        profileImage={profileImage} 
        onClickMail={handleEmailClick}
      />
      
      <div className="h-[72px] w-full" />
      
      <div className="pb-24 px-4 pt-2 max-w-screen-xl mx-auto">
        <div className="px-4 pt-[calc(env(safe-area-inset-top)+64px)]">
          <h1 className="text-xl font-semibold text-white mb-4">Aiuto & FAQ</h1>
          
          <button
            onClick={() => navigate(-1)}
            className="w-6 h-6 text-white relative z-50 mb-6"
            aria-label="Torna alla pagina precedente"
          >
            <ArrowLeft />
          </button>
        </div>

        <div className="glass-card p-6">
          <p className="text-white/80 mb-6">
            Benvenuto nella sezione di supporto ufficiale di <strong>M1SSION™</strong>. Qui trovi risposte rapide alle domande più frequenti, guide essenziali e contatti utili per ricevere assistenza immediata. Se non trovi quello che cerchi, puoi sempre <a href="#segnala" className="text-projectx-neon-blue underline font-semibold">segnalare un problema</a>.
          </p>

          {/* FAQ Accordion */}
          <div className="mb-10">
            <Accordion type="single" collapsible className="space-y-4">
              
              {/* Sezione 1 */}
              <AccordionItem value="item-1" className="border border-white/10 rounded-lg">
                <AccordionTrigger className="px-4 py-2 text-white font-semibold bg-white/5 hover:bg-white/10 transition-colors rounded-t-lg">
                  📌 DOMANDE GENERALI
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2 space-y-2 text-white/70 bg-black/20">
                  <p><strong className="text-white">Cos'è M1SSION™?</strong><br/>M1SSION è un'esperienza interattiva a premi basata su missioni, indizi e sfide urbane. I giocatori competono per vincere premi reali completando missioni distribuite nel tempo e nello spazio.</p>
                  <p><strong className="text-white">Chi può partecipare?</strong><br/>Chiunque abbia almeno 18 anni, uno smartphone e voglia mettersi in gioco. Alcune missioni potrebbero essere disponibili solo in specifiche città.</p>
                  <p><strong className="text-white">Come mi registro?</strong><br/>Puoi registrarti direttamente tramite l'app o il sito ufficiale. La registrazione è gratuita. È possibile anche accedere con email e password oppure tramite Magic Link.</p>
                  <p><strong className="text-white">È gratuita?</strong><br/>Sì, l'accesso base è gratuito. Esistono piani opzionali (Silver, Gold, Black) per ottenere più indizi settimanali e vantaggi esclusivi.</p>
                </AccordionContent>
              </AccordionItem>

              {/* Sezione 2 */}
              <AccordionItem value="item-2" className="border border-white/10 rounded-lg">
                <AccordionTrigger className="px-4 py-2 text-white font-semibold bg-white/5 hover:bg-white/10 transition-colors rounded-t-lg">
                  🎮 GIOCO E MISSIONI
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2 space-y-2 text-white/70 bg-black/20">
                  <p><strong className="text-white">Cosa sono le missioni?</strong><br/>Le missioni sono sfide geolocalizzate, enigmi o prove logiche da completare entro un certo tempo. Alcune richiedono spostamenti reali, altre sono digitali.</p>
                  <p><strong className="text-white">Come funzionano gli indizi?</strong><br/>Gli indizi vengono distribuiti secondo il piano attivo (gratuito o abbonamento). È possibile usare il tasto BUZZ per ottenere indizi extra, pagando un costo dinamico.</p>
                  <p><strong className="text-white">Cosa vinco?</strong><br/>I premi vanno da prodotti tech a viaggi, fino a supercar. Ogni stagione di M1SSION ha una classifica, e i migliori agenti ricevono i premi finali.</p>
                  <p><strong className="text-white">Cos'è il BUZZ MAPPA?</strong><br/>È una funzione che genera una zona geolocalizzata in cui cercare il tesoro. La sua area si riduce progressivamente con ogni BUZZ, ma ha un costo variabile.</p>
                </AccordionContent>
              </AccordionItem>

              {/* Sezione 3 */}
              <AccordionItem value="item-3" className="border border-white/10 rounded-lg">
                <AccordionTrigger className="px-4 py-2 text-white font-semibold bg-white/5 hover:bg-white/10 transition-colors rounded-t-lg">
                  🧾 ACCOUNT E PAGAMENTI
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2 space-y-2 text-white/70 bg-black/20">
                  <p><strong className="text-white">Come cambio email o password?</strong><br/>Vai nella sezione Impostazioni {'>'} Dati personali. Puoi modificare i dati inseriti in qualsiasi momento.</p>
                  <p><strong className="text-white">Come funziona l'abbonamento?</strong><br/>Puoi scegliere tra vari piani (mensili o annuali). I pagamenti sono gestiti in modo sicuro tramite Stripe.</p>
                  <p><strong className="text-white">Posso disattivare l'abbonamento?</strong><br/>Sì. Puoi disdire in qualsiasi momento dalla sezione "Abbonamento". Il piano resta attivo fino alla fine del periodo pagato.</p>
                </AccordionContent>
              </AccordionItem>

              {/* Sezione 4 */}
              <AccordionItem value="item-4" className="border border-white/10 rounded-lg">
                <AccordionTrigger className="px-4 py-2 text-white font-semibold bg-white/5 hover:bg-white/10 transition-colors rounded-t-lg">
                  🛠️ SUPPORTO TECNICO
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2 space-y-2 text-white/70 bg-black/20">
                  <p><strong className="text-white">Non riesco ad accedere all'app. Che faccio?</strong><br/>Controlla di avere l'ultima versione disponibile. Se il problema persiste, contatta il supporto tecnico via email o chat.</p>
                  <p><strong className="text-white">Ho riscontrato un bug. Come segnalarlo?</strong><br/>Nella sezione <a href="#segnala" className="text-projectx-neon-blue underline">Segnala un problema</a> puoi inviare una descrizione dettagliata.</p>
                  <p><strong className="text-white">La mappa non si carica o è errata. Cosa posso fare?</strong><br/>Assicurati che i permessi di geolocalizzazione siano attivi e stai usando una connessione stabile. Se il problema continua, scrivici.</p>
                </AccordionContent>
              </AccordionItem>

              {/* Sezione 5 */}
              <AccordionItem value="item-5" className="border border-white/10 rounded-lg">
                <AccordionTrigger className="px-4 py-2 text-white font-semibold bg-white/5 hover:bg-white/10 transition-colors rounded-t-lg">
                  📮 CONTATTI
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2 space-y-2 text-white/70 bg-black/20">
                  <p>📧 <strong className="text-white">Email assistenza:</strong> support@m1ssion.com</p>
                  <p>💬 <strong className="text-white">Chat dal vivo:</strong> attiva nell'app dalle 9:00 alle 18:00</p>
                  <p>📄 <strong className="text-white">Modulo di contatto:</strong> [Vai al form online]</p>
                  <p>📢 <strong className="text-white">Segnalazioni abusi o truffe:</strong> [Accedi alla sezione dedicata]</p>
                </AccordionContent>
              </AccordionItem>

              {/* Sezione 6 */}
              <AccordionItem value="item-6" className="border border-white/10 rounded-lg">
                <AccordionTrigger className="px-4 py-2 text-white font-semibold bg-white/5 hover:bg-white/10 transition-colors rounded-t-lg">
                  🔐 SICUREZZA E PRIVACY
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2 space-y-2 text-white/70 bg-black/20">
                  <p><strong className="text-white">Come vengono trattati i miei dati?</strong><br/>Tutti i dati sono trattati nel rispetto del GDPR. Puoi leggere l'informativa completa nella sezione Privacy Policy.</p>
                  <p><strong className="text-white">M1SSION è sicura?</strong><br/>Assolutamente. I dati sono protetti, le transazioni criptate e ogni utente viene verificato per garantire un ambiente di gioco affidabile.</p>
                </AccordionContent>
              </AccordionItem>

              {/* Sezione 7 */}
              <AccordionItem value="item-7" className="border border-white/10 rounded-lg">
                <AccordionTrigger className="px-4 py-2 text-white font-semibold bg-white/5 hover:bg-white/10 transition-colors rounded-t-lg">
                  ✅ ULTIMI CONSIGLI
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2 space-y-2 text-white/70 bg-black/20">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Consulta il nostro regolamento ufficiale per conoscere le regole del gioco.</li>
                    <li>Segui il nostro canale Instagram per aggiornamenti in tempo reale.</li>
                    <li>Partecipa attivamente: più giochi, più possibilità hai di vincere.</li>
                  </ul>
                  <p className="text-xs mt-2 text-white/50">📌 Pagina aggiornata al: 10 giugno 2025<br/>📍 Versione: v1.0 – In aggiornamento continuo</p>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>

          {/* Inizio form "Segnala un problema" */}
          <div id="segnala" className="mt-10 bg-white/5 p-6 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-white">📮 Segnala un problema</h2>
            <form method="POST" action="mailto:support@m1ssion.com" encType="text/plain" className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1">Nome</label>
                <input 
                  type="text" 
                  id="name" 
                  name="Nome" 
                  required 
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-projectx-neon-blue/50" 
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="Email" 
                  required 
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-projectx-neon-blue/50" 
                />
              </div>
              <div>
                <label htmlFor="issue" className="block text-sm font-medium text-white/80 mb-1">Descrizione del problema</label>
                <textarea 
                  id="issue" 
                  name="Problema" 
                  required 
                  rows={4} 
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-projectx-neon-blue/50 resize-none"
                ></textarea>
              </div>
              <div>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-projectx-blue to-projectx-pink text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Invia
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default HelpFaq;
