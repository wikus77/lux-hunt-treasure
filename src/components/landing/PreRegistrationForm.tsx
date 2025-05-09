
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Bell, Send, Loader2, UserPlus, Copy, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface PreRegistrationFormProps {
  className?: string;
}

interface PreRegistrationData {
  name: string;
  email: string;
  referrer?: string;
}

const PreRegistrationForm = ({ className }: PreRegistrationFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userReferralCode, setUserReferralCode] = useState("");
  const [showInviteOptions, setShowInviteOptions] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);

  // Generate a unique referral code for the user after successful registration
  useEffect(() => {
    if (isSubmitted && !userReferralCode) {
      // Generate a unique code based on name and random characters
      const generateCode = () => {
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${name.substring(0, 3).toUpperCase()}${randomStr}`;
      };
      
      setUserReferralCode(generateCode());
    }
  }, [isSubmitted, name, userReferralCode]);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim()) {
      toast.error("Inserisci il tuo nome");
      return;
    }
    
    if (!email.trim() || !validateEmail(email)) {
      toast.error("Inserisci un indirizzo email valido");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Registration data to send to backend
      const registrationData: PreRegistrationData = {
        name: name.trim(),
        email: email.trim()
      };
      
      // Check if this email is already registered
      const { data: existingUser, error: checkError } = await supabase
        .from('pre_registrations')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle();
      
      if (existingUser) {
        toast.info("Sei già pre-registrato!", {
          description: "Questa email è già stata utilizzata per la pre-registrazione."
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create pre-registration record without referral code initially
      const { data: registration, error: registrationError } = await supabase
        .from('pre_registrations')
        .insert([{
          name: registrationData.name,
          email: registrationData.email,
          referrer: null,
          referral_code: userReferralCode || null,
          credits: 100, // Initial credits for first 100 registrations
        }])
        .select();
      
      if (registrationError) {
        throw registrationError;
      }
      
      // If registration successful
      setIsSubmitted(true);
      toast.success("Benvenuto Agente!", {
        description: "La tua pre-iscrizione è stata convalidata. Sei tra i primi 100 a ricevere 100 crediti. Preparati, ora sei in M1SSION!"
      });
      
      // Clear form
      setName("");
      setEmail("");
      setInviteCode("");
      
      // Send confirmation email via edge function
      try {
        await supabase.functions.invoke('send-mailjet-email', {
          body: {
            type: 'pre_registration',
            name: registrationData.name,
            email: registrationData.email,
            referral_code: userReferralCode,
            subject: "Pre-registrazione a M1SSION confermata",
            to: [
              {
                email: registrationData.email,
                name: registrationData.name
              }
            ]
          }
        });
      } catch (emailError) {
        console.error("Errore nell'invio dell'email di conferma:", emailError);
        // Don't stop the process if email fails, the registration is still valid
      }
      
    } catch (error) {
      console.error("Errore nella pre-registrazione:", error);
      toast.error("Missione sospesa.", {
        description: "Qualcosa non è andato come previsto. Verifica i tuoi dati e riprova a registrarti. Entra in M1SSION!"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInviteCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast.error("Inserisci un codice invito valido");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Validate the invite code
      const { data: referrerData } = await supabase
        .from('pre_registrations')
        .select('id, email')
        .eq('referral_code', inviteCode.trim())
        .maybeSingle();
        
      if (!referrerData) {
        toast.error("Codice invito non valido", {
          description: "Il codice inserito non corrisponde a nessun utente."
        });
        setIsSubmitting(false);
        return;
      }
      
      // Update user's record with the referrer
      const { error: updateError } = await supabase
        .from('pre_registrations')
        .update({ referrer: referrerData.email })
        .eq('email', email);
      
      if (updateError) {
        throw updateError;
      }
      
      // If there was a referrer, update their credits
      const { error: referrerUpdateError } = await supabase.rpc('add_referral_credits', {
        referrer_email: referrerData.email,
        credits_to_add: 50
      });
      
      if (referrerUpdateError) {
        console.error("Errore nell'aggiornamento dei crediti del referrer:", referrerUpdateError);
        // Continue despite error
      }
      
      toast.success("Codice invito applicato con successo!", {
        description: "Hai assegnato 50 crediti bonus al tuo amico!"
      });
      
      // Hide the referral input after successful submission
      setShowReferralInput(false);
      
    } catch (error) {
      console.error("Errore nell'applicazione del codice invito:", error);
      toast.error("Errore nell'applicazione del codice", {
        description: "Si è verificato un problema. Riprova più tardi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const copyReferralCode = () => {
    if (userReferralCode) {
      navigator.clipboard.writeText(userReferralCode);
      toast.success("Codice copiato negli appunti!", {
        description: "Condividilo con i tuoi amici per guadagnare crediti."
      });
    }
  };
  
  const handleInviteFriend = () => {
    setShowInviteOptions(true);
  };
  
  const handleShowReferralInput = () => {
    setShowReferralInput(true);
  };
  
  const shareViaEmail = () => {
    const subject = "Unisciti a me su M1SSION!";
    const body = `Ciao,\n\nHo pensato che M1SSION potrebbe interessarti! È una nuova esperienza di gioco dove puoi vincere premi reali risolvendo missioni.\n\nUsa il mio codice invito per ricevere crediti bonus: ${userReferralCode}\n\nRegistrati qui: ${window.location.origin}\n\nA presto!`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-blue-900/20 to-black">
      <motion.div 
        className={`max-w-4xl mx-auto glass-card p-8 sm:p-10 relative overflow-hidden ${className || ""}`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00E5FF] via-[#FF00FF] to-[#FFC107]"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00E5FF]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#FF00FF]/10 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Icon and text */}
          <div className="md:w-1/2">
            <div className="mb-6 bg-white/5 w-16 h-16 rounded-full flex items-center justify-center">
              <UserPlus className="text-[#00E5FF] h-8 w-8" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
              Diventa un <span className="text-[#00E5FF]">agente</span> di <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION</span>
            </h2>
            
            <p className="text-white/70 mb-4">
              I primi 100 iscritti riceveranno <span className="text-yellow-300">100 crediti</span> da utilizzare per 
              le missioni al lancio di M1SSION.
            </p>
            
            <p className="text-white/70 mb-6">
              <span className="font-semibold text-cyan-400">Bonus extra:</span> Invita 3 amici attraverso il tasto "Invita un amico" 
              e guadagna <span className="text-yellow-300">50 crediti</span> per ogni amico che si pre-iscriverà con il tuo codice.
            </p>
            
            <ul className="text-white/70 space-y-2 mb-6">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mr-2"></div>
                <span>Ricevi aggiornamenti esclusivi prima del lancio</span>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mr-2"></div>
                <span>Accedi a contenuti e indizi in anteprima</span>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mr-2"></div>
                <span>Sblocca vantaggi esclusivi per iniziare la sfida</span>
              </li>
            </ul>
          </div>
          
          {/* Form */}
          <div className="md:w-1/2 w-full">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1">Nome</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#00E5FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50"
                    placeholder="Il tuo nome"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#00E5FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50"
                    placeholder="La tua email"
                    disabled={isSubmitting}
                  />
                </div>
                
                <button
                  type="submit"
                  className={`w-full p-3 rounded-full flex items-center justify-center ${
                    isSubmitting 
                      ? 'bg-gray-700 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#0066FF] to-[#FF00FF] text-white hover:shadow-[0_0_15px_rgba(0,102,255,0.5)]'
                  } font-medium transition-all duration-300`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Pre-registrazione in corso...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Unisciti a M1SSION
                    </>
                  )}
                </button>
                
                <p className="text-xs text-white/40 text-center">
                  Iscrivendoti accetti la nostra <Link to="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>. 
                  Puoi annullare l'iscrizione in qualsiasi momento.
                </p>
              </form>
            ) : (
              <motion.div 
                className="bg-white/5 border border-[#00E5FF]/30 p-6 rounded-lg text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 mx-auto bg-[#00E5FF]/10 rounded-full flex items-center justify-center mb-4">
                  <Send className="text-[#00E5FF] h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Pre-registrazione completata!</h3>
                <p className="text-white/70 mb-6">
                  Hai ricevuto <span className="text-yellow-300">100 crediti</span> da utilizzare per le missioni al lancio.
                  Invita i tuoi amici per guadagnare crediti extra!
                </p>
                
                <div className="bg-black/30 p-4 rounded-lg mb-6">
                  <p className="text-white/70 text-sm">Il tuo codice di invito:</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-xl font-mono text-yellow-300">{userReferralCode}</span>
                    <button 
                      onClick={copyReferralCode} 
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      title="Copia codice"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                
                {!showInviteOptions ? (
                  <div className="flex flex-col space-y-3">
                    <Button 
                      onClick={handleInviteFriend} 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium px-4 py-2 rounded-full flex items-center gap-2 mx-auto"
                    >
                      <UserPlus size={18} />
                      Invita un amico
                    </Button>
                    
                    <Button
                      onClick={handleShowReferralInput}
                      variant="outline"
                      className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                    >
                      Hai un codice invito?
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-white text-sm mb-2">Condividi il tuo codice:</h4>
                    <Button 
                      onClick={shareViaEmail} 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium px-4 py-2 rounded-full flex items-center gap-2 w-full"
                    >
                      <Mail size={18} />
                      Invita via Email
                    </Button>
                    
                    <Button
                      onClick={() => setShowInviteOptions(false)}
                      variant="outline"
                      className="w-full border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                    >
                      Torna indietro
                    </Button>
                  </div>
                )}
                
                {/* Referral code input - shown only after clicking "Hai un codice invito?" */}
                {showReferralInput && (
                  <motion.form 
                    onSubmit={handleInviteCodeSubmit}
                    className="mt-6 space-y-4 border-t border-white/10 pt-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4 className="text-white text-sm mb-2">Inserisci il codice invito:</h4>
                    <div>
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#00E5FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50"
                        placeholder="Codice invito"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-[#0066FF] to-[#00E5FF] text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Applica codice"
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                        onClick={() => setShowReferralInput(false)}
                      >
                        Annulla
                      </Button>
                    </div>
                  </motion.form>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default PreRegistrationForm;
