
import { useAdminCheck } from '@/hooks/admin/useAdminCheck';
import AdminPrizeManager from '@/components/admin/prizeManager/AdminPrizeManager';
import { Spinner } from '@/components/ui/spinner';

export default function AdminPrizeClues() {
  const { isAdmin, isRoleLoading } = useAdminCheck(false); // Disable redirect on fail
  
  if (isRoleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
        <div className="ml-2 text-white font-medium">
          Verifica permessi...
        </div>
      </div>
    );
  }
  
  // Force rendering of the component even if not admin (for debugging)
  // TODO: Re-enable admin check after confirming visibility
  // if (!isAdmin) {
  //   return null;
  // }
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-white">Gestione Premi</h1>
      <AdminPrizeManager />
    </div>
  );
}
