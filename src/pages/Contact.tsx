// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, MapPin, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Campi obbligatori",
        description: "Compila nome, email e messaggio per inviare la richiesta.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save to database
      const { error: dbError } = await supabase
        .from('contacts')
        .insert([formData]);

      if (dbError) {
        console.error('Database error:', dbError);
      }

      // Send email via edge function
      const { data, error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject || 'Contatto dal sito M1SSION',
          message: formData.message
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        throw emailError;
      }

      toast({
        title: "✅ Messaggio inviato",
        description: "Ti contatteremo al più presto. Grazie per averci scritto!"
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

    } catch (error) {
      console.error('Error sending contact form:', error);
      toast({
        title: "❌ Errore invio",
        description: "Impossibile inviare il messaggio. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 pt-20 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-orbitron font-bold mb-4">
            <span className="text-[#00E5FF]">Contatti</span>
            <span className="text-white"> M1SSION™</span>
          </h1>
          <p className="text-white/70 text-lg">
            Hai domande? Vuoi maggiori informazioni? Scrivici!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <Card 
            className="relative overflow-hidden rounded-[24px]"
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
            <CardHeader>
              <CardTitle className="text-2xl font-orbitron text-white flex items-center">
                <Mail className="w-6 h-6 mr-3 text-[#00D1FF]" />
                Informazioni di Contatto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <Mail className="w-5 h-5 text-[#00D1FF] mt-1" />
                <div>
                  <h3 className="text-white font-medium">Email</h3>
                  <p className="text-white/70">contact@m1ssion.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-[#00D1FF] mt-1" />
                <div>
                  <h3 className="text-white font-medium">Sede</h3>
                  <p className="text-white/70">NIYVORA KFT™</p>
                  <p className="text-white/70">Ungheria, EU</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h3 className="text-white font-medium mb-3">Team di Sviluppo</h3>
                <p className="text-white/70 text-sm">
                  M1SSION™ è sviluppato da <strong>NIYVORA KFT™</strong>. 
                  Il team è dedicato a creare esperienze di gioco innovative e coinvolgenti.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card 
            className="relative overflow-hidden rounded-[24px]"
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
            <CardHeader>
              <CardTitle className="text-2xl font-orbitron text-white flex items-center">
                <Send className="w-6 h-6 mr-3 text-[#00D1FF]" />
                Invia un Messaggio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Nome *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Il tuo nome"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tua@email.com"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-white">Telefono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+39 XXX XXX XXXX"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-white">Oggetto</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Oggetto del messaggio"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-white">Messaggio *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Scrivi qui il tuo messaggio..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 min-h-[120px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#00D1FF] to-[#0099CC] hover:from-[#0099CC] hover:to-[#007799] text-black font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Invia Messaggio
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <div className="bg-[#00D1FF]/10 border border-[#00D1FF]/30 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-[#00D1FF] font-medium mb-2">Nota Privacy</h3>
            <p className="text-white/70 text-sm">
              I tuoi dati verranno trattati secondo la nostra Privacy Policy e utilizzati 
              esclusivamente per rispondere alla tua richiesta. Non condividiamo mai 
              i dati degli utenti con terze parti.
            </p>
          </div>
        </div>

        {/* IP Footer - Compact Apple Style */}
        <div className="mt-12 pt-6 border-t border-white/10 text-center space-y-4">
          <p className="text-white/60 text-sm">© 2025 M1SSION™ — All rights reserved — NIYVORA KFT™</p>
          
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
        </div>
      </div>
    </div>
  );
};

export default Contact;