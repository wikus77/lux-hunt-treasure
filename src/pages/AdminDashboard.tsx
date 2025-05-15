
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { PreRegistrationsTable } from '@/components/admin/PreRegistrationsTable';
import { ConfirmationDialog } from '@/components/admin/dialogs/ConfirmationDialog';
import { AddCreditsDialog } from '@/components/admin/dialogs/AddCreditsDialog';
import { usePreRegistrations } from '@/hooks/admin/usePreRegistrations';
import { 
  useConfirmEmailMutation,
  useAddCreditsMutation,
  useCreateUserMutation
} from '@/hooks/admin/useAdminMutations';

const AdminDashboard: React.FC = () => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const { toast } = useToast();

  // Queries
  const { data: preRegistrations, isLoading, error } = usePreRegistrations();
  
  // Mutations
  const confirmEmailMutation = useConfirmEmailMutation();
  const addCreditsMutation = useAddCreditsMutation();
  const createUserMutation = useCreateUserMutation();

  // Handler per aprire il dialog di conferma
  const handleOpenConfirmationDialog = (email: string) => {
    setSelectedEmail(email);
    setIsConfirmationDialogOpen(true);
  };

  // Handler per confermare l'email
  const handleConfirmEmail = () => {
    if (selectedEmail) {
      confirmEmailMutation.mutate(selectedEmail);
      setIsConfirmationDialogOpen(false);
      setSelectedEmail(null);
    }
  };

  // Handler per aprire il form di aggiunta crediti
  const handleOpenAddCreditsForm = (email: string) => {
    setSelectedEmail(email);
    setIsAddingCredits(true);
  };

  // Handler per creare un nuovo utente
  const handleCreateUser = (email: string) => {
    createUserMutation.mutate(email);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Dashboard Amministrativa</h1>
      
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onOpenChange={setIsConfirmationDialogOpen}
        email={selectedEmail}
        onConfirm={handleConfirmEmail}
        isPending={confirmEmailMutation.isPending}
      />
      
      <AddCreditsDialog
        isOpen={isAddingCredits}
        onOpenChange={setIsAddingCredits}
        email={selectedEmail}
        onSubmit={(values) => {
          addCreditsMutation.mutate(values);
          setIsAddingCredits(false);
        }}
        isPending={addCreditsMutation.isPending}
      />
      
      <PreRegistrationsTable
        preRegistrations={preRegistrations}
        isLoading={isLoading}
        error={error as Error | null}
        onConfirmEmail={handleOpenConfirmationDialog}
        onAddCredits={handleOpenAddCreditsForm}
        onCreateUser={handleCreateUser}
      />
    </div>
  );
};

export default AdminDashboard;
