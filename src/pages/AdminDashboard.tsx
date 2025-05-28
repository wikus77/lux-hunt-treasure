
import React, { useState, Suspense } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { PreRegistrationsTable } from '@/components/admin/PreRegistrationsTable';
import { ConfirmationDialog } from '@/components/admin/dialogs/ConfirmationDialog';
import { AddCreditsDialog } from '@/components/admin/dialogs/AddCreditsDialog';
import { usePreRegistrations } from '@/hooks/admin/usePreRegistrations';
import { 
  useConfirmEmailMutation,
  useAddCreditsMutation,
  useCreateUserMutation
} from '@/hooks/admin/useAdminMutations';

const AdminLoadingSkeleton = () => (
  <div className="container mx-auto py-10 space-y-6">
    <Skeleton className="h-8 w-64" />
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 w-16" />
        </div>
      ))}
    </div>
  </div>
);

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

  if (isLoading) {
    return <AdminLoadingSkeleton />;
  }

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
        onSubmit={({ email, credits }) => {
          if (email && credits !== undefined) {
            addCreditsMutation.mutate({ email, credits });
            setIsAddingCredits(false);
          }
        }}
        isPending={addCreditsMutation.isPending}
      />
      
      <Suspense fallback={
        <div className="flex justify-center p-8">
          <Spinner size="lg" className="text-blue-500" />
        </div>
      }>
        <PreRegistrationsTable
          preRegistrations={preRegistrations}
          isLoading={isLoading}
          error={error as Error | null}
          onConfirmEmail={handleOpenConfirmationDialog}
          onAddCredits={handleOpenAddCreditsForm}
          onCreateUser={handleCreateUser}
        />
      </Suspense>
    </div>
  );
};

export default AdminDashboard;
