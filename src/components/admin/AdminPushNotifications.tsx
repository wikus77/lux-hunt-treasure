// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { M1ssionFirebasePushTestPanel } from "./M1ssionFirebasePushTestPanel";

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
      console.log('🔥 Sending Firebase push notification:', { title, message });
      
      // Log test in admin_logs
      await supabase
        .from('admin_logs')
        .insert({
          event_type: 'firebase_push_test',
          note: `Push Test Custom - Title: ${title}, Body: ${message}`,
          context: 'admin_panel_push_test'
        });
      
      // Call Firebase Edge Function
      const { data, error } = await supabase.functions.invoke('send-firebase-push', {
        body: { 
          title: title.trim(), 
          body: message.trim(),
          broadcast: true, // Broadcast to all users
          additionalData: {
            source: 'admin_panel',
            timestamp: new Date().toISOString()
          }
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔥 Firebase Edge function response:', { data, error });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.success) {
        toast.success(`🔥 Notifica Firebase inviata con successo!`, {
          description: `Inviata a ${data.sent_count || 0} dispositivi FCM`
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
      console.error("❌ Error sending Firebase push notification:", error);
      toast.error("Errore nell'invio della notifica Firebase", {
        description: error.message || "Errore sconosciuto"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">🔥 Firebase Push Notifications</h2>
      
      <M1ssionFirebasePushTestPanel />
      
      <Card>
        <CardHeader>
          <CardTitle>🔥 Invia notifica Firebase FCM a tutti gli utenti</CardTitle>
          <CardDescription>
            Le notifiche verranno inviate tramite Firebase Cloud Messaging agli utenti che hanno token FCM attivi.
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
                placeholder="Titolo della notifica Firebase"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="message">Messaggio</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Contenuto della notifica Firebase"
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
              <>🔥 Invio Firebase in corso...</>
            ) : (
              <>
                <Bell size={16} className="mr-2" />
                🔥 Invia notifica Firebase
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};