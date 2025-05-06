import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Gift, Trophy, Mail, Share2, CheckCircle, Smartphone, MessageSquare } from 'lucide-react';
import CountdownTimer from '@/components/ui/countdown-timer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { saveSubscriber } from '@/services/newsletterService';
import { getMissionDeadline, formatDisplayDate } from '@/utils/countdownDate';

// Schema di validazione per il form della newsletter
const formSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri" }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido" })
});

type FormData = z.infer<typeof formSchema>;

const Landing = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  // Data di lancio del gioco dalla utility function
  const launchDate = getMissionDeadline();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Invia i dati al database tramite il servizio newsletter
      const result = await saveSubscriber({
        name: data.name,
        email: data.email
      });
      
      if (result.success) {
        toast.success("Iscrizione completata!", {
          description: `Grazie ${data.name}! Ti terremo aggiornato sul lancio di M1SSION.`
        });
        reset();
      } else {
        toast.error("Si è verificato un errore", {
          description: result.error || "Non è stato possibile completare l'iscrizione. Riprova più tardi."
        });
      }
    } catch (error: any) {
      console.error('Newsletter signup error:', error);
      toast.error("Si è verificato un errore", {
        description: "Non è stato possibile completare l'iscrizione. Riprova più tardi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = (method: 'text' | 'whatsapp' | 'email') => {
    const shareMessage = "Unisciti a M1SSION, un'incredibile avventura investigativa dove ogni indizio conta! Scopri di più su: m1ssion.com";
    const url = window.location.href;
    
    switch (method) {
      case 'text':
        if (navigator.share) {
          navigator.share({
            title: 'M1SSION - Un\'avventura investigativa',
            text: shareMessage,
            url: url
          }).catch(err => console.error('Error sharing:', err));
        } else {
          // Fallback per dispositivi che non supportano l'API Web Share
          toast.info("Condividi questo link:", { description: url });
        }
        break;
      
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage + ' ' + url)}`, '_blank');
        break;
      
      case 'email':
        window.open(`mailto:?subject=Unisciti a M1SSION&body=${encodeURIComponent(shareMessage + '\n\n' + url)}`, '_blank');
        break;
    }
    
    setShareDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header */}
      <header className="relative w-full glass-backdrop py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-orbitron text-cyan-400 mr-2">M1SSION</h1>
            <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded">BETA</span>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => navigate('/login')}
              variant="outline" 
              className="hidden sm:flex"
            >
              Accedi
            </Button>
            <Button 
              onClick={() => document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })}
              className="neon-button-cyan"
            >
              Iscriviti ora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black z-10"></div>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20 z-0" 
               style={{background: 'radial-gradient(circle at 25% 25%, rgba(0,209,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(123,46,255,0.2) 0%, transparent 50%)'}}>
          </div>
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-orbitron mb-6 gradient-text-multi">
              Un'avventura investigativa dove ogni indizio conta
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Unisciti a M1SSION e risolvi enigmi in tempo reale per vincere premi esclusivi. Metti alla prova le tue abilità deduttive e competi con altri investigatori.
            </p>

            <div className="mb-10">
              <p className="text-yellow-400 text-lg mb-3 font-orbitron">IL GIOCO INIZIA TRA</p>
              <div className="bg-black/50 p-6 rounded-lg backdrop-blur-sm border border-cyan-400/30">
                <CountdownTimer 
                  targetDate={launchDate}
                  className="scale-130" 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Button
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                variant="outline"
                size="lg"
                className="border-cyan-400/50 hover:bg-cyan-400/20"
              >
                Scopri di più
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              
              <Button
                onClick={() => document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })}
                size="lg"
                className="neon-button-magenta"
              >
                Iscriviti ora
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-orbitron mb-12 text-center gradient-text-cyan">
            Cos'è M1SSION?
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="glass-card hover-lift">
              <h3 className="text-xl font-orbitron mb-4 text-cyan-400">Il Gioco</h3>
              <p className="text-gray-300 mb-4">
                M1SSION è un'avventura investigativa innovativa che combina elementi di caccia al tesoro, enigmi e indagini in tempo reale. Ogni partecipante diventa un investigatore impegnato a risolvere un complesso caso.
              </p>
              <p className="text-gray-300">
                Segui indizi, analizza prove, esplora luoghi sulla mappa e collabora con altri investigatori per risolvere il mistero prima che scada il tempo.
              </p>
            </div>
            
            <div className="glass-card hover-lift">
              <h3 className="text-xl font-orbitron mb-4 text-cyan-400">Come Funziona</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                  <span>Registrati e crea il tuo profilo investigatore</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                  <span>Ricevi indizi a intervalli regolari attraverso l'app</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                  <span>Esplora la mappa e scopri luoghi di interesse</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                  <span>Collabora con altri giocatori o competi da solo</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                  <span>Risolvi il caso prima degli altri per vincere premi esclusivi</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section className="py-16 px-4 relative">
        <div className="absolute inset-0 opacity-20" 
             style={{background: 'linear-gradient(135deg, rgba(106,0,255,0.1) 0%, rgba(0,209,255,0.1) 100%)'}}>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-orbitron mb-4 gradient-text-cyan">
              Premi in Palio
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Risolvi il caso e vinci premi esclusivi. Da buoni regalo a esperienze uniche, M1SSION premia i migliori investigatori.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Prize Item 1 */}
            <div className="glass-card hover-lift relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-bl from-yellow-500 to-amber-600 text-black font-bold py-1 px-4 text-sm">
                1° PREMIO
              </div>
              <div className="flex flex-col items-center p-6">
                <Trophy className="h-12 w-12 text-yellow-400 mb-4 trophy-shine" />
                <h3 className="text-xl font-orbitron mb-3 text-center">Esperienza di Guida Sportiva</h3>
                <p className="text-gray-300 text-center">
                  Un'intera giornata alla guida di una supercar su circuito professionale
                </p>
              </div>
            </div>
            
            {/* Prize Item 2 */}
            <div className="glass-card hover-lift">
              <div className="flex flex-col items-center p-6">
                <Gift className="h-12 w-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-orbitron mb-3 text-center">Buoni Acquisto</h3>
                <p className="text-gray-300 text-center">
                  Buoni regalo fino a 500€ per acquisti su piattaforme selezionate
                </p>
              </div>
            </div>
            
            {/* Prize Item 3 */}
            <div className="glass-card hover-lift">
              <div className="flex flex-col items-center p-6">
                <Mail className="h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-orbitron mb-3 text-center">Abbonamenti Premium</h3>
                <p className="text-gray-300 text-center">
                  Accesso gratuito per un anno al piano Premium di M1SSION
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-16 px-4 relative">
        <div className="container mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-orbitron mb-12 text-center gradient-text-cyan">
            Piani di Abbonamento
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="glass-card hover-lift border border-gray-600">
              <div className="p-6">
                <h3 className="text-xl font-orbitron mb-2">Base</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">Gratuito</span>
                </div>
                <ul className="space-y-3 text-gray-300 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                    <span>Accesso alle missioni base</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                    <span>Indizi standard</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                    <span>Partecipazione alla classifica</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Inizia Gratis
                </Button>
              </div>
            </div>
            
            {/* Silver Plan */}
            <div className="glass-card hover-lift border border-cyan-400/50 transform scale-105 relative">
              <div className="absolute -top-3 inset-x-0 flex justify-center">
                <div className="bg-cyan-400 text-black py-1 px-4 text-xs font-bold rounded-full">
                  PIÙ POPOLARE
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-orbitron mb-2 text-cyan-400">Silver</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">€9.99</span>
                  <span className="text-gray-400">/mese</span>
                </div>
                <ul className="space-y-3 text-gray-300 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                    <span>Tutte le funzionalità gratuite</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                    <span>Indizi esclusivi</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                    <span>Accesso anticipato alle missioni</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                    <span>Strumenti di indagine avanzati</span>
                  </li>
                </ul>
                <Button className="w-full neon-button-cyan">
                  Abbonati Ora
                </Button>
              </div>
            </div>
            
            {/* Gold Plan */}
            <div className="glass-card hover-lift border border-yellow-500/50">
              <div className="p-6">
                <h3 className="text-xl font-orbitron mb-2 text-yellow-400">Gold</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">€19.99</span>
                  <span className="text-gray-400">/mese</span>
                </div>
                <ul className="space-y-3 text-gray-300 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                    <span>Tutte le funzionalità Silver</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                    <span>Indizi esclusivi Gold</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                    <span>Tutoraggio personalizzato</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                    <span>Premi esclusivi riservati</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                    <span>Supporto prioritario 24/7</span>
                  </li>
                </ul>
                <Button className="w-full neon-button-yellow">
                  Abbonati Ora
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="newsletter" className="py-16 px-4 relative">
        <div className="absolute inset-0 opacity-30" 
             style={{background: 'radial-gradient(circle at 50% 50%, rgba(123,46,255,0.4) 0%, transparent 70%)'}}>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-2xl mx-auto glass-card border border-purple-400/30">
            <div className="p-8">
              <h2 className="text-3xl font-orbitron mb-2 text-center gradient-text-multi">
                Non perdere il lancio
              </h2>
              <p className="text-gray-300 mb-6 text-center">
                Iscriviti per ricevere aggiornamenti esclusivi e preparati per l'inizio dell'avventura.
              </p>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Il tuo nome"
                    className={`bg-black/50 border-white/20 ${errors.name ? 'border-red-500' : ''}`}
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <Input
                    type="email"
                    placeholder="La tua email"
                    className={`bg-black/50 border-white/20 ${errors.email ? 'border-red-500' : ''}`}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full neon-button-magenta" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-pulse">Iscrizione in corso...</span>
                    </>
                  ) : (
                    'Iscrivimi alla newsletter'
                  )}
                </Button>
                
                <p className="text-xs text-gray-400 text-center">
                  Iscrivendoti accetti la nostra <a href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</a>. 
                  Riceverai email informative prima del lancio e potrai cancellarti in qualsiasi momento.
                </p>
              </form>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <h3 className="text-xl font-orbitron mb-4 gradient-text-cyan">Condividi con gli amici</h3>
            <div className="relative">
              <Button
                onClick={() => setShareDialogOpen(!shareDialogOpen)}
                variant="outline"
                className="neon-border"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Invita un amico
              </Button>
              
              {shareDialogOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-20 mt-2 left-1/2 transform -translate-x-1/2 w-64 bg-black border border-white/20 rounded-lg shadow-xl p-4"
                >
                  <p className="text-sm text-gray-300 mb-3 text-center">Condividi M1SSION via:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      onClick={() => handleShare('text')} 
                      variant="outline" 
                      size="sm" 
                      className="flex flex-col items-center h-auto py-3"
                    >
                      <Smartphone className="h-5 w-5 mb-1" />
                      <span className="text-xs">SMS</span>
                    </Button>
                    
                    <Button 
                      onClick={() => handleShare('whatsapp')} 
                      variant="outline" 
                      size="sm" 
                      className="flex flex-col items-center h-auto py-3"
                    >
                      <MessageSquare className="h-5 w-5 mb-1" />
                      <span className="text-xs">WhatsApp</span>
                    </Button>
                    
                    <Button 
                      onClick={() => handleShare('email')} 
                      variant="outline" 
                      size="sm" 
                      className="flex flex-col items-center h-auto py-3"
                    >
                      <Mail className="h-5 w-5 mb-1" />
                      <span className="text-xs">Email</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-orbitron mb-12 text-center gradient-text-cyan">
            Domande Frequenti
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "Quando inizia il gioco?",
                answer: "M1SSION inizierà ufficialmente alla data indicata nel countdown. Iscriviti alla newsletter per essere avvisato quando mancano 15 giorni, 7 giorni, 3 giorni e 24 ore al lancio."
              },
              {
                question: "Come funziona il sistema di indizi?",
                answer: "Gli indizi vengono rilasciati a intervalli regolari direttamente nell'app. Alcuni sono disponibili per tutti, mentre altri sono esclusivi per gli abbonati Premium. Ogni indizio ti avvicina alla soluzione del caso."
              },
              {
                question: "Posso giocare da qualsiasi dispositivo?",
                answer: "Sì, M1SSION è compatibile con dispositivi iOS e Android, oltre che con la versione web accessibile da qualsiasi browser moderno."
              },
              {
                question: "Come funzionano i premi?",
                answer: "I premi vengono assegnati ai giocatori che risolvono con successo i casi. Maggiore è la difficoltà del caso, più prestigioso sarà il premio. I premi includono buoni regalo, abbonamenti gratuiti e esperienze esclusive."
              },
              {
                question: "Posso collaborare con altri giocatori?",
                answer: "Sì, M1SSION permette di formare squadre investigative per risolvere casi insieme. Tuttavia, i premi principali potrebbero essere riservati agli investigatori individuali."
              }
            ].map((faq, index) => (
              <div key={index} className="glass-card hover:bg-white/5">
                <div className="p-6">
                  <h3 className="text-xl font-orbitron mb-3 text-cyan-400">{faq.question}</h3>
                  <p className="text-gray-300">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-orbitron text-cyan-400">M1SSION</h2>
              <p className="text-gray-400">Un'avventura investigativa unica</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Termini di Servizio
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Contattaci
              </Button>
            </div>
          </div>
          
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} M1SSION. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
