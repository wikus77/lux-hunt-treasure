
import { useAdminCheck } from '@/hooks/admin/useAdminCheck';
import AdminPrizeManager from '@/components/admin/prizeManager/AdminPrizeManager';
import { Spinner } from '@/components/ui/spinner';

export default function AdminPrizeManagerPage() {
  const { isAdmin, isRoleLoading } = useAdminCheck();
  
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
  
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-white">Gestione Premi</h1>
      <AdminPrizeManager />
    </div>
  );
}
