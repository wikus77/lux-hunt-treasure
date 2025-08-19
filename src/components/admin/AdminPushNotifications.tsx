
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

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
      // Call the Edge Function to send push notification
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: { title, message }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success("Notifica inviata con successo");
      // Reset form
      setTitle("");
      setMessage("");
    } catch (error: any) {
      toast.error("Errore nell'invio della notifica", {
        description: error.message
      });
      console.error("Error sending push notification:", error);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Invio Notifiche Push</h2>
      
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
