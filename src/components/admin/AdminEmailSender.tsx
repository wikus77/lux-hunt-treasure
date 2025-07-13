
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail } from "lucide-react";

type UserGroup = 'all' | 'active' | 'inactive' | 'premium';

export const AdminEmailSender = () => {
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [userGroup, setUserGroup] = useState<UserGroup>("all");
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async (test: boolean = false) => {
    if (!subject || !htmlContent) {
      toast.error("Oggetto e contenuto email sono richiesti");
      return;
    }
    
    if (test && !testEmail) {
      toast.error("Email di test richiesta");
      return;
    }
    
    setIsSending(true);
    
    try {
      // Call the Edge Function to send email
      const { data, error } = await supabase.functions.invoke('send-mailjet-email', {
        body: { 
          type: 'marketing',
          subject,
          htmlContent,
          userGroup: test ? undefined : userGroup,
          to: test ? [{ email: testEmail }] : undefined,
          trackOpens: true,
          trackClicks: true
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success(test ? "Email di test inviata con successo" : "Email inviate con successo");
      
      if (test) {
        // Only reset test email if it's a test
        setTestEmail("");
      } else {
        // Reset form for bulk emails
        setSubject("");
        setHtmlContent("");
      }
    } catch (error: any) {
      toast.error("Errore nell'invio dell'email", {
        description: error.message
      });
      console.error("Error sending email:", error);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Invio Email agli Utenti</h2>
      
      <Tabs defaultValue="bulk">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="bulk">Email di massa</TabsTrigger>
          <TabsTrigger value="test">Email di test</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Invia email a gruppi di utenti</CardTitle>
              <CardDescription>
                Seleziona un gruppo di utenti e invia un'email personalizzata.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="userGroup">Gruppo di utenti</Label>
                  <Select
                    value={userGroup}
                    onValueChange={(value) => setUserGroup(value as UserGroup)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona gruppo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti gli utenti</SelectItem>
                      <SelectItem value="active">Utenti attivi</SelectItem>
                      <SelectItem value="inactive">Utenti inattivi</SelectItem>
                      <SelectItem value="premium">Utenti premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="subject">Oggetto</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Oggetto dell'email"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="content">Contenuto HTML</Label>
                  <Textarea
                    id="content"
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="<h1>Titolo</h1><p>Contenuto dell'email...</p>"
                    required
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={() => handleSendEmail(false)} 
                disabled={isSending || !subject || !htmlContent}
                className="w-full"
              >
                {isSending ? (
                  <>Invio in corso...</>
                ) : (
                  <>
                    <Mail size={16} className="mr-2" />
                    Invia a {userGroup === 'all' ? 'tutti gli utenti' : `utenti ${userGroup}`}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Invia email di test</CardTitle>
              <CardDescription>
                Testa la tua email inviandola a un indirizzo specifico.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="testEmail">Email di test</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="esempio@email.com"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="testSubject">Oggetto</Label>
                  <Input
                    id="testSubject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Oggetto dell'email"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="testContent">Contenuto HTML</Label>
                  <Textarea
                    id="testContent"
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="<h1>Titolo</h1><p>Contenuto dell'email...</p>"
                    required
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={() => handleSendEmail(true)} 
                disabled={isSending || !testEmail || !subject || !htmlContent}
                className="w-full"
              >
                {isSending ? (
                  <>Invio in corso...</>
                ) : (
                  <>
                    <Mail size={16} className="mr-2" />
                    Invia email di test
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
