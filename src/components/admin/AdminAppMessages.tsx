
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { PlusCircle, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { MessageDialog } from "@/components/admin/dialogs/MessageDialog";
import { DeleteConfirmationDialog } from "@/components/admin/dialogs/DeleteConfirmationDialog";

interface AppMessage {
  id: string;
  title: string;
  content: string;
  message_type: string;
  target_users: string[];
  is_active: boolean;
  is_read: boolean;
  created_at: string | null;
  updated_at: string | null;
  expiry_date: string | null;
}

export const AdminAppMessages = () => {
  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<AppMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('app_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setMessages(data || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento dei messaggi", {
        description: error.message
      });
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMessage = async (messageData: Partial<AppMessage>) => {
    try {
      // Ensure required fields are present
      if (!messageData.title || !messageData.content) {
        toast.error("Titolo e contenuto sono obbligatori");
        return;
      }

      // Fix: Change from array to single object for insert
      const { data, error } = await supabase
        .from('app_messages')
        .insert({
          title: messageData.title,
          content: messageData.content,
          message_type: messageData.message_type || 'info',
          target_users: messageData.target_users || ['all'],
          is_active: messageData.is_active !== undefined ? messageData.is_active : true,
          expiry_date: messageData.expiry_date
        })
        .select();

      if (error) {
        throw error;
      }

      toast.success("Messaggio creato con successo");
      fetchMessages();
    } catch (error: any) {
      toast.error("Errore nella creazione del messaggio", {
        description: error.message
      });
      console.error("Error creating message:", error);
    }
  };

  const handleUpdateMessage = async (messageData: Partial<AppMessage>) => {
    if (!currentMessage) return;

    try {
      // Ensure required fields
      if (!messageData.title || !messageData.content) {
        toast.error("Titolo e contenuto sono obbligatori");
        return;
      }

      const { error } = await supabase
        .from('app_messages')
        .update({
          ...messageData,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentMessage.id);

      if (error) {
        throw error;
      }

      toast.success("Messaggio aggiornato con successo");
      fetchMessages();
    } catch (error: any) {
      toast.error("Errore nell'aggiornamento del messaggio", {
        description: error.message
      });
      console.error("Error updating message:", error);
    }
  };

  const handleDeleteMessage = async () => {
    if (!currentMessage) return;

    try {
      const { error } = await supabase
        .from('app_messages')
        .delete()
        .eq('id', currentMessage.id);

      if (error) {
        throw error;
      }

      toast.success("Messaggio eliminato con successo");
      fetchMessages();
    } catch (error: any) {
      toast.error("Errore nell'eliminazione del messaggio", {
        description: error.message
      });
      console.error("Error deleting message:", error);
    }
  };

  const toggleMessageStatus = async (message: AppMessage) => {
    try {
      const { error } = await supabase
        .from('app_messages')
        .update({
          is_active: !message.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', message.id);

      if (error) {
        throw error;
      }

      toast.success(`Messaggio ${message.is_active ? 'disattivato' : 'attivato'} con successo`);
      fetchMessages();
    } catch (error: any) {
      toast.error("Errore nell'aggiornamento dello stato del messaggio", {
        description: error.message
      });
      console.error("Error toggling message status:", error);
    }
  };

  const openEditDialog = (message: AppMessage) => {
    setCurrentMessage(message);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (message: AppMessage) => {
    setCurrentMessage(message);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Spinner /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gestione Messaggi In-App</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle size={16} className="mr-2" />
          Nuovo Messaggio
        </Button>
      </div>

      <Table>
        <TableCaption>Messaggi in-app per gli utenti</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Titolo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Destinatari</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Data Scadenza</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Nessun messaggio disponibile
              </TableCell>
            </TableRow>
          ) : (
            messages.map((message) => (
              <TableRow key={message.id}>
                <TableCell className="font-medium">{message.title}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    message.message_type === 'info' ? 'bg-blue-100 text-blue-800' :
                    message.message_type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    message.message_type === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {message.message_type}
                  </span>
                </TableCell>
                <TableCell>
                  {message.target_users.includes('all') 
                    ? 'Tutti gli utenti' 
                    : `${message.target_users.length} utenti selezionati`}
                </TableCell>
                <TableCell>
                  {message.is_active ? (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle size={16} className="mr-1" /> Attivo
                    </span>
                  ) : (
                    <span className="text-gray-600 flex items-center">
                      <XCircle size={16} className="mr-1" /> Inattivo
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {message.expiry_date 
                    ? new Date(message.expiry_date).toLocaleDateString('it-IT') 
                    : 'Nessuna scadenza'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant={message.is_active ? "outline" : "default"}
                      size="sm" 
                      onClick={() => toggleMessageStatus(message)}
                    >
                      {message.is_active ? "Disattiva" : "Attiva"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditDialog(message)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => openDeleteDialog(message)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Create Message Dialog */}
      <MessageDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateMessage}
        title="Crea Nuovo Messaggio"
        confirmButtonText="Crea"
      />

      {/* Edit Message Dialog */}
      <MessageDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateMessage}
        title="Modifica Messaggio"
        confirmButtonText="Salva Modifiche"
        message={currentMessage}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteMessage}
        title="Elimina Messaggio"
        description={`Sei sicuro di voler eliminare il messaggio "${currentMessage?.title}"? Questa azione è irreversibile.`}
      />
    </div>
  );
};
