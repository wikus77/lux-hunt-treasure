
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Select,
  SelectContent,
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const RoleSwitcher = () => {
  const { userRole, getCurrentUser } = useAuthContext();
  const [selectedRole, setSelectedRole] = useState<string>(userRole || 'user');
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check if user is admin (only admins can use this component)
    const checkAdminRole = async () => {
      const user = getCurrentUser();
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error checking admin role:", error);
          return;
        }
        
        setIsAdmin(data?.role === 'admin');
      } catch (error) {
        console.error("Error checking admin role:", error);
      }
    };
    
    checkAdminRole();
  }, [getCurrentUser]);
  
  useEffect(() => {
    if (userRole) {
      setSelectedRole(userRole);
    }
  }, [userRole]);
  
  const handleRoleChange = async (newRole: string) => {
    setSelectedRole(newRole);
    
    const user = getCurrentUser();
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);
        
      if (error) {
        toast.error("Errore", {
          description: `Impossibile cambiare il ruolo: ${error.message}`
        });
      } else {
        localStorage.setItem('userRole', newRole);
        toast.success("Ruolo cambiato", {
          description: `Hai cambiato il tuo ruolo in: ${newRole}`
        });
        
        // Reload the page to apply the new role
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error changing role:", error);
      toast.error("Errore imprevisto durante il cambio di ruolo");
    }
  };
  
  // Only show this component to admins
  if (!isAdmin) return null;
  
  return (
    <div className="flex flex-col gap-2 p-3 glass-card my-4">
      <h3 className="text-white font-semibold">Cambio ruolo amministratore</h3>
      <div className="flex gap-2 items-center">
        <Select value={selectedRole} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleziona un ruolo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Utente</SelectItem>
            <SelectItem value="premium_user">Utente Premium</SelectItem>
            <SelectItem value="moderator">Moderatore</SelectItem>
            <SelectItem value="admin">Amministratore</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-400">(Solo per test)</span>
      </div>
    </div>
  );
};

export default RoleSwitcher;
