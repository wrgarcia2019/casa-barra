import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AuthContextType = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Inicializa estado com sessão atual
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      const logged = !!session;
      setIsAuthenticated(logged);
      setIsAdmin(session?.user?.user_metadata?.role === "admin");
    });

    // Ouve mudanças na sessão
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const logged = !!session;
      setIsAuthenticated(logged);
      setIsAdmin(session?.user?.user_metadata?.role === "admin");
    });

    return () => {
      sub.subscription?.unsubscribe?.();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Login failed:", error.message);
      return { success: false, error: error.message };
    }
    const session = data.session;
    setIsAuthenticated(!!session);
    setIsAdmin(session?.user?.user_metadata?.role === "admin");
    return { success: !!session };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const value = useMemo(() => ({ isAuthenticated, isAdmin, login, logout }), [isAuthenticated, isAdmin]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};