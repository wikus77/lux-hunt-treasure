
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  // Mock completo e compatibile per sviluppatore
  const mockUser = {
    id: "dev-user-id",
    email: "wikus77@hotmail.it",
    role: "developer",
    aud: "authenticated",
    app_metadata: { provider: "email" },
    user_metadata: { name: "Wikus Developer" },
    created_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
  } as User;

  const mockSession = {
    access_token: "dev-token",
    refresh_token: "dev-refresh-token",
    expires_in: 3600,
    token_type: "bearer",
    user: mockUser,
  } as Session;

  const [authState] = useState<AuthState>({
    user: mockUser,
    session: mockSession,
    loading: false,
    error: null,
  });

  const login = async (email: string, password: string) => {
    toast.success("Login effettuato con successo");
    return { data: { user: mockUser, session: mockSession }, error: null };
  };

  const logout = async () => {
    toast.success("Logout effettuato con successo");
  };

  return {
    ...authState,
    login,
    logout,
  };
}
