
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Verificar se é admin
    const checkAdminStatus = () => {
      const adminStatus = localStorage.getItem('isAdmin');
      setIsAdmin(adminStatus === 'true');
    };

    checkAdminStatus();

    // Não inicializar autenticação do Supabase para não interferir com o sistema admin
    // O sistema agora funciona apenas com localStorage para admin
    setLoading(false);

    // Listener para mudanças no localStorage do admin
    const handleStorageChange = () => {
      checkAdminStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    // Desabilitado - apenas admin pode acessar o sistema
    return { error: { message: 'Registro não disponível. Sistema restrito à equipe administrativa.' } };
  };

  const signIn = async (email: string, password: string) => {
    // Desabilitado - apenas admin pode acessar o sistema
    return { error: { message: 'Login não disponível. Sistema restrito à equipe administrativa.' } };
  };

  const signOut = async () => {
    // Limpar dados admin se existirem
    localStorage.removeItem('isAdmin');
    setIsAdmin(false);
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
