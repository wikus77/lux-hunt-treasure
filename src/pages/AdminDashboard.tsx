import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Plus, Check, Copy, UserPlus, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useToast } from "@/components/ui/use-toast"

// Definisci lo schema di validazione per il form
const formSchema = z.object({
  email: z.string().email({ message: "Inserisci un'email valida." }),
  credits: z.number().min(0, { message: "I crediti devono essere almeno 0." }),
});

// Interfaccia per i dati delle preregistrazioni
interface PreRegistration {
  id: string;
  name: string;
  email: string;
  created_at: string;
  referrer: string | null;
  referral_code: string;
  credits: number;
  confirmed: boolean;
  user_id: string | null;
  profiles?: { agent_code: string | null } | null;
  numero_progressivo?: number;
  agent_code?: string | null;
}

// Questa funzione risolve il problema del refetch alla vista modificata
const fetchPreRegistrations = async () => {
  const { data, error } = await supabase
    .from('pre_registrations')
    .select(`
      id, 
      name, 
      email, 
      created_at, 
      referrer, 
      referral_code, 
      credits, 
      confirmed, 
      user_id,
      user_id
    `)
    .order('created_at', { ascending: true });
  
  if (error) {
    throw error;
  }
  
  // Fetch agent codes separately for each user that has a user_id
  const preRegistrationsWithAgentCodes = await Promise.all(
    data.map(async (item, index) => {
      let agentCode = null;
      
      // Only query profiles for items with user_id
      if (item.user_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('agent_code')
          .eq('id', item.user_id)
          .maybeSingle();
          
        if (!profileError && profileData) {
          agentCode = profileData.agent_code;
        }
      }
      
      return {
        ...item,
        numero_progressivo: index + 1,
        agent_code: agentCode
      };
    })
  );
  
  return preRegistrationsWithAgentCodes;
};

const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [emailToConfirm, setEmailToConfirm] = useState<string | null>(null);
  const [creditsToAddEmail, setCreditsToAddEmail] = useState<string | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState<number | null>(null);
  const { toast } = useToast()

  // Mutation per aggiornare lo stato di conferma
  const confirmEmailMutation = useMutation(
    async (email: string) => {
      const { data, error } = await supabase
        .from('pre_registrations')
        .update({ confirmed: true })
        .eq('email', email);

      if (error) {
        throw error;
      }

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pre_registrations');
        toast({
          title: "Successo",
          description: "Email confermata con successo.",
        })
      },
      onError: (error: any) => {
        handleError(error);
      },
      onSettled: () => {
        setIsConfirmationDialogOpen(false);
        setEmailToConfirm(null);
      },
    }
  );

  // Mutation per aggiungere crediti
  const addCreditsMutation = useMutation(
    async ({ email, credits }: { email: string; credits: number }) => {
      const { data, error } = await supabase
        .from('pre_registrations')
        .update({ credits: credits })
        .eq('email', email);

      if (error) {
        throw error;
      }

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pre_registrations');
        toast({
          title: "Successo",
          description: "Crediti aggiunti con successo.",
        })
      },
      onError: (error: any) => {
        handleError(error);
      },
      onSettled: () => {
        setIsAddingCredits(false);
        setCreditsToAddEmail(null);
        setCreditsToAdd(null);
      },
    }
  );

  // Mutation per creare un nuovo utente
  const createUserMutation = useMutation(
    async (email: string) => {
      const { data, error } = await supabase.functions.invoke('create-user-from-preregistration', {
        body: { email: email }
      });

      if (error) {
        throw error;
      }

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pre_registrations');
        toast({
          title: "Successo",
          description: "Utente creato con successo.",
        })
      },
      onError: (error: any) => {
        handleError(error);
      },
    }
  );

  // Nella sezione di query:
  const { data: preRegistrations, isLoading, error, refetch } = useQuery({
    queryKey: ['pre_registrations'],
    queryFn: fetchPreRegistrations
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      credits: 0,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    addCreditsMutation.mutate({ email: values.email, credits: values.credits });
  }

  // Handler per aprire il dialog di conferma
  const handleOpenConfirmationDialog = (email: string) => {
    setEmailToConfirm(email);
    setIsConfirmationDialogOpen(true);
  };

  // Handler per confermare l'email
  const handleConfirmEmail = () => {
    if (emailToConfirm) {
      confirmEmailMutation.mutate(emailToConfirm);
    }
  };

  // Handler per aprire il form di aggiunta crediti
  const handleOpenAddCreditsForm = (email: string) => {
    setSelectedEmail(email);
    form.setValue("email", email);
    setIsAddingCredits(true);
  };

  // Handler per creare un nuovo utente
  const handleCreateUser = (email: string) => {
    createUserMutation.mutate(email);
  };

  // Per gestire gli errori in modo corretto:
  const handleError = (error: Error) => {
    toast({
      title: "Errore",
      description: error.message,
      variant: "destructive"
    });
  };

  // Utilizza handleError dove necessario invece di toast.error

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Dashboard Amministrativa</h1>

      {/* Dialog di conferma */}
      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Conferma Email</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler confermare questa email?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input type="email" id="email" value={emailToConfirm || ""} className="col-span-3" disabled />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={() => setIsConfirmationDialogOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" onClick={handleConfirmEmail} disabled={confirmEmailMutation.isLoading}>
              {confirmEmailMutation.isLoading ? "Confermando..." : "Conferma"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Form per aggiungere crediti */}
      <Dialog open={isAddingCredits} onOpenChange={setIsAddingCredits}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Aggiungi Crediti</DialogTitle>
            <DialogDescription>
              Aggiungi crediti all'utente.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crediti</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(value);
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="secondary" onClick={() => setIsAddingCredits(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={addCreditsMutation.isLoading}>
                  {addCreditsMutation.isLoading ? "Aggiungendo..." : "Aggiungi"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <p>Caricamento...</p>
      ) : error ? (
        <p>Errore: {(error as Error).message}</p>
      ) : (
        <Table>
          <TableCaption>Elenco delle pre-registrazioni.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">#</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Data di Registrazione</TableHead>
              <TableHead>Referrer</TableHead>
              <TableHead>Codice di Riferimento</TableHead>
              <TableHead>Crediti</TableHead>
              <TableHead>Agent Code</TableHead>
              <TableHead>Confermato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preRegistrations?.map((preReg) => (
              <TableRow key={preReg.id}>
                <TableCell className="font-medium">{preReg.numero_progressivo}</TableCell>
                <TableCell>{preReg.name}</TableCell>
                <TableCell>{preReg.email}</TableCell>
                <TableCell>{format(new Date(preReg.created_at), "dd MMMM yyyy, HH:mm", { locale: it })}</TableCell>
                <TableCell>{preReg.referrer}</TableCell>
                <TableCell>
                  {preReg.referral_code}
                </TableCell>
                <TableCell>{preReg.credits}</TableCell>
                <TableCell>{preReg.agent_code}</TableCell>
                <TableCell>
                  {preReg.confirmed ? (
                    <Badge variant="outline">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Si
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="mr-2 h-4 w-4" />
                      No
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {!preReg.confirmed && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenConfirmationDialog(preReg.email)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenAddCreditsForm(preReg.email)}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    {!preReg.user_id && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleCreateUser(preReg.email)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Crea Utente
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminDashboard;
