
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface CampaignSenderState {
  campaignName: string;
  testMode: boolean;
}

const CampaignSender = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CampaignSenderState>({
    campaignName: "benvenuti amici",
    testMode: true
  });

  const handleChange = (field: keyof CampaignSenderState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    setError(null);
    
    try {
      console.log("Sending campaign request with data:", formData);
      
      // Call the edge function with JWT authentication
      const { data, error: funcError } = await supabase.functions.invoke('send-mailjet-campaign', {
        body: formData
      });
      
      if (funcError) {
        console.error("Edge function error:", funcError);
        setError(funcError.message || "Failed to send campaign");
        toast.error("Errore nell'invio della campagna", {
          description: funcError.message || "Si è verificato un errore durante l'invio"
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Campaign sending response:", data);
      setResponse(data);
      
      if (data?.success) {
        toast.success(formData.testMode 
          ? "Campagna trovata correttamente" 
          : "Campagna inviata con successo", {
          description: formData.testMode 
            ? `La campagna "${formData.campaignName}" è pronta per l'invio` 
            : `La campagna "${formData.campaignName}" è stata inviata correttamente`
        });
      } else {
        setError(data?.error || "Errore sconosciuto nell'invio della campagna");
        toast.error("Errore nell'invio della campagna", {
          description: data?.error || "Si è verificato un errore durante l'invio della campagna"
        });
      }
    } catch (err: any) {
      console.error("Exception when sending campaign:", err);
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
      <h2 className="text-xl font-bold mb-4 text-white">Invio Campagna Mailjet</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="campaignName" className="text-white">Nome Campagna</Label>
          <Input
            id="campaignName"
            placeholder="Nome della campagna"
            value={formData.campaignName}
            onChange={(e) => handleChange('campaignName', e.target.value)}
            required
            className="mt-1"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            id="testMode"
            checked={formData.testMode}
            onCheckedChange={(checked) => handleChange('testMode', checked)}
          />
          <Label htmlFor="testMode" className="text-white">
            Modalità Test (non invia realmente la campagna)
          </Label>
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading} 
          variant={formData.testMode ? "outline" : "destructive"}
          className="w-full"
        >
          {isLoading ? (
            <><Spinner className="mr-2 h-4 w-4" /> Elaborazione...</>
          ) : formData.testMode ? (
            "Verifica Campagna (Test)"
          ) : (
            "INVIA CAMPAGNA A TUTTI I CONTATTI"
          )}
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
          <AlertTitle>{response.success ? "Operazione Completata" : "Stato Operazione"}</AlertTitle>
          <AlertDescription className="mt-2">
            <p>{response.message || (response.success ? "Operazione completata con successo!" : "Stato operazione non chiaro")}</p>
            {response.campaign && (
              <div className="mt-2">
                <p><strong>ID Campagna:</strong> {response.campaign.id}</p>
                <p><strong>Titolo:</strong> {response.campaign.title}</p>
                <p><strong>Stato:</strong> {response.campaign.status}</p>
              </div>
            )}
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

export default CampaignSender;
