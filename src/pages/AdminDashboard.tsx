
import { useEffect } from "react";
import { useAuthContext } from "@/contexts/auth";
import { useNavigate, Outlet } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { AdminMissions } from "@/components/admin/AdminMissions";
import { AdminPushNotifications } from "@/components/admin/AdminPushNotifications";
import { AdminEmailSender } from "@/components/admin/AdminEmailSender";
import { AdminAppMessages } from "@/components/admin/AdminAppMessages";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const AdminDashboard = () => {
  const { hasRole, userRole, isAuthenticated, isRoleLoading } = useAuthContext();
  const navigate = useNavigate();
  const [preRegistrations, setPreRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect non-admin users away from this page
    if (!isRoleLoading && isAuthenticated && !hasRole("admin")) {
      console.log("Non-admin user attempting to access admin page, redirecting to access-denied");
      navigate("/access-denied");
    }
  }, [hasRole, isRoleLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (hasRole("admin")) {
      fetchPreRegistrations();
    }
  }, [hasRole]);

  const fetchPreRegistrations = async () => {
    setLoading(true);
    try {
      // Utilizziamo la view che è stata spostata nello schema private
      const { data, error } = await supabase
        .from('private.pre_registrations_with_index')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Error fetching pre-registrations:", error);
      } else {
        setPreRegistrations(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking permissions
  if (isRoleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
        <div className="ml-2 text-white font-medium">Verificando permessi...</div>
      </div>
    );
  }

  // Allow rendering only for admin users
  if (!hasRole("admin")) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="missions" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="missions">Missioni</TabsTrigger>
          <TabsTrigger value="push">Notifiche Push</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="messages">Messaggi In-App</TabsTrigger>
          <TabsTrigger value="registrations">Pre-Registrazioni</TabsTrigger>
        </TabsList>
        
        <TabsContent value="missions">
          <AdminMissions />
        </TabsContent>
        
        <TabsContent value="push">
          <AdminPushNotifications />
        </TabsContent>
        
        <TabsContent value="email">
          <AdminEmailSender />
        </TabsContent>
        
        <TabsContent value="messages">
          <AdminAppMessages />
        </TabsContent>

        <TabsContent value="registrations">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Pre-Registrazioni</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner className="h-8 w-8" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">N°</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Codice Referral</TableHead>
                      <TableHead>Data Creazione</TableHead>
                      <TableHead>Confermato</TableHead>
                      <TableHead>Crediti</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">{registration.numero_progressivo}</TableCell>
                        <TableCell>{registration.name}</TableCell>
                        <TableCell>{registration.email}</TableCell>
                        <TableCell>{registration.referrer || '-'}</TableCell>
                        <TableCell>{registration.referral_code || '-'}</TableCell>
                        <TableCell>
                          {new Date(registration.created_at).toLocaleString('it-IT')}
                        </TableCell>
                        <TableCell>{registration.confirmed ? '✅' : '❌'}</TableCell>
                        <TableCell>{registration.credits}</TableCell>
                      </TableRow>
                    ))}
                    {preRegistrations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          Nessuna pre-registrazione trovata
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Allow for nested routes if needed */}
      <Outlet />
    </div>
  );
};

export default AdminDashboard;
