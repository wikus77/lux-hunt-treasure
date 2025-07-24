// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRoles: string[];
  isAuthenticated: boolean;
  setUserRoles: (roles: string[]) => void;
  rolesCount: number;
  isRoleLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    setSession(data.session);
    setUser(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setUserRoles([]);
    navigate("/");
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );
    return () => listener?.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        if ("caches" in window) {
          const cacheNames = await caches.keys();
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName);
          });
        }
      } catch (err) {
        console.error("Errore durante pulizia cache:", err);
      }
    };

    handleLogout();
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,

  useEffect(() => {
    clearCacheAndLogout();
  }, [session]);

    return (
      <AuthContext.Provider
        value={{
          session,
          user,
          userRoles,
          isAuthenticated,
          setUserRoles,
          rolesCount: userRoles.length,
          isRoleLoading,
          login,
          logout,
          resetPassword
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

export default AuthProvider;
              cacheNames.forEach((cacheName) => {
                caches.delete(cacheName);
              });
            })
            .catch((err) => {
              console.error("Errore durante pulizia cache:", err);
            });
          })
          .catch((err) => {
            console.error("Errore durante caches.keys():", err);
          });
        };

        handleLogout();
      }, [session]);

      return (
        <AuthContext.Provider
          value={{
            session,
            user,
            userRoles,
            isAuthenticated,
            setUserRoles,
            rolesCount: userRoles.length,
            isRoleLoading,
            login,
            logout,
            resetPassword
          }}
        >
          {children}
        </AuthContext.Provider>
      );
    }

export default AuthProvider;
      return {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        resetPassword,
      };
      return {
        user,
        userRoles,
      };
