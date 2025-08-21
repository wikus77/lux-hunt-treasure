
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { M1ssionPushTestPanel } from "./M1ssionPushTestPanel";

export const AdminPushNotifications = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !message) {
      toast.error("Titolo e messaggio sono richiesti");
      return;
    }
    
    setIsSending(true);
    
    try {
      console.log('🚀 Sending push notification:', { title, message });
      
      // Enhanced Edge Function call with proper headers
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: { 
          title: title.trim(), 
          body: message.trim(),
          user_id: 'broadcast', // Broadcast to all
          timestamp: new Date().toISOString()
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Edge function response:', { data, error });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.success) {
        toast.success(`Notifica inviata con successo a ${data.sent}/${data.total} dispositivi`, {
          description: `OneSignal ID: ${data.oneSignalId || 'N/A'}`
        });
      } else {
        toast.warning("Notifica elaborata ma con possibili problemi", {
          description: data?.message || "Controlla i log per dettagli"
        });
      }
      
      // Reset form
      setTitle("");
      setMessage("");
    } catch (error: any) {
      console.error("❌ Error sending push notification:", error);
      toast.error("Errore nell'invio della notifica", {
        description: error.message || "Errore sconosciuto"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Invio Notifiche Push</h2>
      
      <M1ssionPushTestPanel />
      
      <Card>
        <CardHeader>
          <CardTitle>Invia notifica push a tutti gli utenti</CardTitle>
          <CardDescription>
            Le notifiche verranno inviate agli utenti che hanno accettato di ricevere notifiche push.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titolo</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titolo della notifica"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="message">Messaggio</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Contenuto della notifica"
                required
                rows={4}
              />
            </div>
          </form>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={handleSubmit} 
            disabled={isSending || !title || !message}
            className="w-full"
          >
            {isSending ? (
              <>Invio in corso...</>
            ) : (
              <>
                <Bell size={16} className="mr-2" />
                Invia notifica
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
