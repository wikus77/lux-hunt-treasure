import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import RoleSwitcher from "@/components/auth/RoleSwitcher";

const Settings = () => {
  const { user, isAuthenticated } = useUnifiedAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>
          Per visualizzare le impostazioni, devi essere{" "}
          <Link to="/login" className="text-blue-500">
            effettuare il login
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Impostazioni</h1>

        <Card className="glass-card mb-6">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Informazioni Utente</h2>
            <p>
              <strong>ID Utente:</strong> {user?.id}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Gestione Account</h2>
            <Button variant="destructive">Elimina Account</Button>
          </CardContent>
        </Card>

        <RoleSwitcher />
      </div>
    </div>
  );
};

export default Settings;
