
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface TestEmailState {
  email: string;
  name: string;
  formType: "registrazione" | "agente" | "newsletter" | "contatto" | "preregistrazione";
}

const MailjetTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TestEmailState>({
    email: "",
    name: "Test User",
    formType: "newsletter"
  });

  const handleChange = (field: keyof TestEmailState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    setError(null);
    
    try {
      console.log("Sending test email with data:", formData);
      
      // Call the edge function with JWT authentication
      const { data, error: funcError } = await supabase.functions.invoke('send-registration-email', {
        body: formData
      });
      
      if (funcError) {
        console.error("Edge function error:", funcError);
        setError(funcError.message || "Failed to send email");
        toast.error("Errore nell'invio dell'email", {
          description: funcError.message || "Si è verificato un errore durante l'invio dell'email"
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Email sending response:", data);
      setResponse(data);
      
      if (data?.success) {
        toast.success("Email inviata con successo", {
          description: `L'email è stata inviata a ${formData.email}`
        });
      } else {
        setError(data?.error || "Errore sconosciuto nell'invio dell'email");
        toast.error("Errore nell'invio dell'email", {
          description: data?.error || "Si è verificato un errore durante l'invio dell'email"
        });
      }
    } catch (err: any) {
      console.error("Exception when sending test email:", err);
      setError(err.message || "An unexpected error occurred");
      toast.error("Errore imprevisto", {
        description: err.message || "Si è verificato un errore imprevisto"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Mailjet Email Test</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-white">Email Destinatario</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="name" className="text-white">Nome</Label>
          <Input
            id="name"
            placeholder="Nome Utente"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="formType" className="text-white">Tipo Email</Label>
          <Select 
            value={formData.formType} 
            onValueChange={(value) => handleChange('formType', value as any)}>
            <SelectTrigger className="mt-1" id="formType">
              <SelectValue placeholder="Seleziona tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="registrazione">Registrazione</SelectItem>
              <SelectItem value="newsletter">Newsletter</SelectItem>
              <SelectItem value="agente">Agente</SelectItem>
              <SelectItem value="contatto">Contatto</SelectItem>
              <SelectItem value="preregistrazione">Pre-registrazione</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <><Spinner className="mr-2 h-4 w-4" /> Invio in corso...</> : "Invia Email di Test"}
        </Button>
      </form>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errore</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {response && (
        <Alert className={`mt-4 ${response.success ? "bg-green-700" : "bg-amber-700"} text-white`}>
          {response.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{response.success ? "Email Inviata" : "Stato Invio"}</AlertTitle>
          <AlertDescription className="mt-2">
            <p>{response.success ? "L'email è stata inviata con successo!" : response.message || "Stato invio non chiaro"}</p>
            <details className="mt-2">
              <summary className="cursor-pointer">Dettagli risposta</summary>
              <pre className="text-xs mt-2 bg-black bg-opacity-20 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(response, null, 2)}
              </pre>
            </details>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MailjetTester;
