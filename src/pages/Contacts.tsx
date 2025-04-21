
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MapPin, Phone, Instagram, Facebook, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const Contacts = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulazione invio form
    setTimeout(() => {
      toast({
        title: "Messaggio inviato",
        description: "Grazie per averci contattato. Ti risponderemo al più presto.",
      });
      setName("");
      setEmail("");
      setMessage("");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white p-4 pt-20">
      <div className="container mx-auto max-w-4xl mb-16">
        <div className="mb-8">
          <Link to="/">
            <Button variant="outline" className="mb-8">
              <ArrowLeft className="mr-2 w-4 h-4" /> Torna alla Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-6">Contattaci</h1>
          <p className="text-gray-400 mb-8">
            Hai domande o suggerimenti? Siamo qui per aiutarti. Contattaci in uno dei seguenti modi:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-semibold mb-6">Inviaci un messaggio</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Nome completo
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Il tuo nome"
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="La tua email"
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                  Messaggio
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Come possiamo aiutarti?"
                  className="w-full h-32"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
              >
                {isSubmitting ? "Invio in corso..." : "Invia messaggio"}
              </Button>
            </form>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-6">Informazioni di contatto</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-projectx-neon-blue mt-1" />
                <div>
                  <h3 className="font-medium">Indirizzo</h3>
                  <p className="text-gray-400">Via Roma 123, 00100 Roma, Italia</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-projectx-neon-blue mt-1" />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-gray-400">info@m1ssion.com</p>
                  <p className="text-gray-400">support@m1ssion.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-projectx-neon-blue mt-1" />
                <div>
                  <h3 className="font-medium">Telefono</h3>
                  <p className="text-gray-400">+39 06 1234567</p>
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="font-medium mb-3">Seguici sui social media</h3>
                <div className="flex space-x-4">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </a>
                </div>
              </div>
              
              <div className="pt-6">
                <h3 className="font-medium mb-3">Orari di disponibilità</h3>
                <p className="text-gray-400">Lunedì - Venerdì: 9:00 - 18:00</p>
                <p className="text-gray-400">Sabato: 10:00 - 14:00</p>
                <p className="text-gray-400">Domenica: Chiuso</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
