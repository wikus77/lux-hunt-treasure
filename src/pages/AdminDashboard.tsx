import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface PreRegistration {
  id: string;
  name: string;
  email: string;
  created_at: string;
  referrer: string | null;
  referral_code: string | null;
  credits: number | null;
  confirmed: boolean | null;
  user_id: string | null;
  numero_progressivo?: number;
}

const AdminDashboard: React.FC = () => {
  const [preregistrations, setPreregistrations] = useState<PreRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [newCredits, setNewCredits] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isBulkConfirmationDialogOpen, setIsBulkConfirmationDialogOpen] = useState(false);
  const [bulkConfirmationType, setBulkConfirmationType] = useState<'all' | 'filtered'>('all');
  const [filterConfirmed, setFilterConfirmed] = useState<boolean | null>(null);
  const [filterReferrer, setFilterReferrer] = useState<string>('');
  const [filterEmail, setFilterEmail] = useState<string>('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast()

  useEffect(() => {
    fetchPreregistrations();
  }, [filterConfirmed, filterReferrer, filterEmail]);

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedIds(new Set(selectAll ? [] : preregistrations.map(p => p.id)));
  };

  const toggleSelect = (id: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
    setSelectAll(newSelectedIds.size === preregistrations.length);
  };

  const fetchPreregistrations = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Modifica per utilizzare la view spostata in private schema
      const { data, error } = await supabase
        .from("pre_registrations")  // Usiamo direttamente la tabella invece della view
        .select(`
          id, 
          name, 
          email, 
          created_at, 
          referrer, 
          referral_code, 
          credits, 
          confirmed, 
          user_id
        `)
        .or(filterEmail ? `email.il.${filterEmail}` : '')
        .eq(filterConfirmed !== null ? 'confirmed' : 'void', filterConfirmed !== null ? filterConfirmed : 'void')
        .or(filterReferrer ? `referrer.il.${filterReferrer}` : '')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching pre-registrations:", error);
        toast.error("Errore nel caricamento delle pre-registrazioni");
      } else if (data) {
        // Creiamo un numero progressivo manualmente
        const dataWithIndices = data.map((item, index) => ({
          ...item,
          numero_progressivo: data.length - index // Per avere ordine decrescente
        }));
        setPreregistrations(dataWithIndices);
      }
    } catch (e) {
      console.error("Unexpected error:", e);
      toast.error("Errore inaspettato");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenConfirmationDialog = (email: string, userId: string | null) => {
    setSelectedEmail(email);
    setSelectedUserId(userId);
    setIsConfirmationDialogOpen(true);
  };

  const handleCloseConfirmationDialog = () => {
    setIsConfirmationDialogOpen(false);
    setSelectedEmail(null);
    setSelectedUserId(null);
  };

  const handleConfirmEmail = async () => {
    if (!selectedEmail) return;

    try {
      const updates: { confirmed: boolean; user_id?: string } = {
        confirmed: true,
      };

      // Se l'utente ha già un user_id, non sovrascriverlo
      if (!selectedUserId) {
        updates.user_id = 'GENERATED_UUID'; // Placeholder, verrà sovrascritto dalla funzione Edge
      }

      const { data, error } = await supabase
        .from('pre_registrations')
        .update(updates)
        .eq('email', selectedEmail)
        .select('*')
        .single();

      if (error) {
        console.error("Error confirming email:", error);
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Si è verificato un errore durante la conferma dell'email."
        })
      } else {
        console.log("Email confirmed successfully:", data);
        toast({
          title: "Successo",
          description: "Email confermata con successo!",
        })
        fetchPreregistrations(); // Refetch data
      }
    } catch (e) {
      console.error("Unexpected error:", e);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Si è verificato un errore inaspettato."
      })
    } finally {
      handleCloseConfirmationDialog();
    }
  };

  const handleOpenBulkConfirmationDialog = (type: 'all' | 'filtered') => {
    setBulkConfirmationType(type);
    setIsBulkConfirmationDialogOpen(true);
  };

  const handleCloseBulkConfirmationDialog = () => {
    setIsBulkConfirmationDialogOpen(false);
  };

  const handleBulkConfirmEmails = async () => {
    try {
      let query = supabase.from('pre_registrations').update({ confirmed: true });

      if (bulkConfirmationType === 'filtered') {
        // Applica gli stessi filtri usati nella fetch delle preregistrazioni
        query = query.or(filterEmail ? `email.il.${filterEmail}` : '')
          .eq(filterConfirmed !== null ? 'confirmed' : 'void', filterConfirmed !== null ? filterConfirmed : 'void')
          .or(filterReferrer ? `referrer.il.${filterReferrer}` : '');
      }

      const { error } = await query.eq('confirmed', false); // Solo non confermate

      if (error) {
        console.error("Error confirming emails:", error);
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Si è verificato un errore durante la conferma delle email."
        })
      } else {
        toast({
          title: "Successo",
          description: "Email confermate in blocco con successo!",
        })
        fetchPreregistrations(); // Refetch data
      }
    } catch (e) {
      console.error("Unexpected error:", e);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Si è verificato un errore inaspettato."
      })
    } finally {
      handleCloseBulkConfirmationDialog();
    }
  };

  const handleAddCredits = async (email: string) => {
    if (!newCredits || newCredits <= 0) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Inserisci un numero valido di crediti."
      })
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pre_registrations')
        .update({ credits: newCredits })
        .eq('email', email)
        .select('*')
        .single();

      if (error) {
        console.error("Error adding credits:", error);
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Si è verificato un errore durante l'aggiunta dei crediti."
        })
      } else {
        console.log("Credits added successfully:", data);
        toast({
          title: "Successo",
          description: "Crediti aggiunti con successo!",
        })
        fetchPreregistrations(); // Refetch data
      }
    } catch (e) {
      console.error("Unexpected error:", e);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Si è verificato un errore inaspettato."
      })
    } finally {
      setNewCredits(null); // Reset input
    }
  };

  const handleCopyReferralCode = (code: string | null) => {
    if (code) {
      navigator.clipboard.writeText(code)
        .then(() => {
          toast({
            title: "Copiato!",
            description: "Codice referral copiato negli appunti.",
          })
        })
        .catch(err => {
          console.error("Errore nella copia:", err);
          toast({
            variant: "destructive",
            title: "Errore",
            description: "Impossibile copiare il codice referral."
          })
        });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Dashboard Admin</h1>

      <div className="mb-5 flex gap-4 items-center">
        <Input
          type="email"
          placeholder="Filtra per email..."
          value={filterEmail}
          onChange={(e) => setFilterEmail(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Filtra per referrer..."
          value={filterReferrer}
          onChange={(e) => setFilterReferrer(e.target.value)}
        />
        <Select onValueChange={(value) => setFilterConfirmed(value === 'true' ? true : value === 'false' ? false : null)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtra per conferma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Confermati</SelectItem>
            <SelectItem value="false">Non confermati</SelectItem>
            <SelectItem value="">Tutti</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => fetchPreregistrations()} disabled={isLoading}>
          Applica Filtri
        </Button>
        <Button variant="destructive" onClick={() => {
          setFilterConfirmed(null);
          setFilterReferrer('');
          setFilterEmail('');
        }}>
          Reset Filtri
        </Button>
      </div>

      <div className="mb-5">
        <Button onClick={() => handleOpenBulkConfirmationDialog('all')}>
          Conferma TUTTE le Email Non Confermate
        </Button>
        <Button className="ml-2" onClick={() => handleOpenBulkConfirmationDialog('filtered')}>
          Conferma Email Non Confermate (Filtrate)
        </Button>
      </div>

      <Table>
        <TableCaption>Lista delle pre-registrazioni al sito.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectAll}
                onCheckedChange={() => toggleSelectAll()}
                aria-label="Seleziona tutti"
              />
            </TableHead>
            <TableHead className="w-[80px]">#</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Data Iscrizione</TableHead>
            <TableHead>Referrer</TableHead>
            <TableHead>Codice Referral</TableHead>
            <TableHead>Crediti</TableHead>
            <TableHead>Confermato</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {preregistrations.map((preReg) => (
            <TableRow key={preReg.id}>
              <TableCell className="font-medium">
                <Checkbox
                  checked={selectedIds.has(preReg.id)}
                  onCheckedChange={() => toggleSelect(preReg.id)}
                  aria-label={`Seleziona ${preReg.email}`}
                />
              </TableCell>
              <TableCell className="font-medium">{preReg.numero_progressivo}</TableCell>
              <TableCell className="font-medium">{preReg.name}</TableCell>
              <TableCell>{preReg.email}</TableCell>
              <TableCell>{format(new Date(preReg.created_at), "dd MMMM yyyy, HH:mm", { locale: it })}</TableCell>
              <TableCell>{preReg.referrer || "Nessuno"}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {preReg.referral_code || "Nessuno"}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyReferralCode(preReg.referral_code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                {preReg.credits !== null ? preReg.credits : "Nessuno"}
              </TableCell>
              <TableCell>
                {preReg.confirmed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </TableCell>
              <TableCell>{preReg.user_id || "Nessuno"}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenConfirmationDialog(preReg.email, preReg.user_id)}
                  disabled={preReg.confirmed}
                >
                  Conferma Email
                </Button>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Aggiungi Crediti
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Aggiungi crediti a {preReg.name}</DialogTitle>
                    <DialogDescription>
                      Inserisci il numero di crediti da aggiungere all'account di questo
                      utente.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="credits" className="text-right">
                        Crediti
                      </Label>
                      <Input
                        type="number"
                        id="credits"
                        placeholder="Crediti"
                        className="col-span-3"
                        onChange={(e) =>
                          setNewCredits(parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={() => handleAddCredits(preReg.email)}>
                    Aggiungi Crediti
                  </Button>
                </DialogContent>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationDialogOpen} onOpenChange={handleCloseConfirmationDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Conferma Email</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler confermare l'email {selectedEmail}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={handleCloseConfirmationDialog}>
              Annulla
            </Button>
            <Button onClick={handleConfirmEmail}>Conferma</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Confirmation Dialog */}
      <Dialog open={isBulkConfirmationDialogOpen} onOpenChange={handleCloseBulkConfirmationDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Conferma Email in Blocco</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler confermare tutte le email non confermate?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={handleCloseBulkConfirmationDialog}>
              Annulla
            </Button>
            <Button onClick={handleBulkConfirmEmails}>Conferma</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
