
import { useEffect } from "react";
import { useAuthContext } from "@/contexts/auth";
import { useNavigate, Outlet } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { AdminMissions } from "@/components/admin/AdminMissions";
import { AdminPushNotifications } from "@/components/admin/AdminPushNotifications";
import { AdminEmailSender } from "@/components/admin/AdminEmailSender";
import { AdminAppMessages } from "@/components/admin/AdminAppMessages";

const AdminDashboard = () => {
  const { hasRole, userRole, isAuthenticated, isRoleLoading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect non-admin users away from this page
    if (!isRoleLoading && isAuthenticated && !hasRole("admin")) {
      console.log("Non-admin user attempting to access admin page, redirecting to access-denied");
      navigate("/access-denied");
    }
  }, [hasRole, isRoleLoading, isAuthenticated, navigate]);

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
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="missions">Missioni</TabsTrigger>
          <TabsTrigger value="push">Notifiche Push</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="messages">Messaggi In-App</TabsTrigger>
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
      </Tabs>
      
      {/* Allow for nested routes if needed */}
      <Outlet />
    </div>
  );
};

export default AdminDashboard;
