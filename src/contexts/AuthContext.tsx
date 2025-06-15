
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
  profile: any;
  updateTheme: (theme: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tempo de expiração da sessão em milissegundos (30 minutos)
const SESSION_TIMEOUT = 30 * 60 * 1000;

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
  const [profile, setProfile] = useState<any>(null);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Buscando perfil para usuário:', userId);
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }
      
      console.log('Perfil encontrado:', profileData);
      return profileData;
    } catch (error) {
      console.error('Erro inesperado ao buscar perfil:', error);
      return null;
    }
  };

  const startSessionTimer = () => {
    // Limpar timer existente se houver
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }

    // Criar novo timer
    const timer = setTimeout(async () => {
      console.log('Sessão expirada. Fazendo logout automático...');
      await signOut();
      
      // Mostrar mensagem para o usuário
      if (window.location.pathname !== '/admin-login') {
        alert('Sua sessão expirou. Você será redirecionado para a página de login.');
        window.location.href = '/admin-login';
      }
    }, SESSION_TIMEOUT);

    setSessionTimer(timer);
    console.log(`Timer de sessão iniciado. Expira em ${SESSION_TIMEOUT / 1000 / 60} minutos.`);
  };

  const clearSessionTimer = () => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      setSessionTimer(null);
      console.log('Timer de sessão limpo.');
    }
  };

  useEffect(() => {
    let mounted = true;

    // Função para processar mudanças de autenticação
    const handleAuthChange = async (event: string, session: Session | null) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        
        if (mounted) {
          setProfile(profileData);
          setIsAdmin(profileData?.is_admin || false);
          
          // Iniciar timer de sessão apenas se for admin
          if (profileData?.is_admin) {
            console.log('Usuário é admin, iniciando timer de sessão');
            startSessionTimer();
          }
          
          setLoading(false);
        }
      } else {
        if (mounted) {
          setProfile(null);
          setIsAdmin(false);
          clearSessionTimer();
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Check for existing session
    const getInitialSession = async () => {
      try {
        console.log('Verificando sessão existente...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao buscar sessão:', error);
          if (mounted) setLoading(false);
          return;
        }

        console.log('Sessão inicial:', session?.user?.email || 'nenhuma');

        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          
          if (mounted) {
            setProfile(profileData);
            setIsAdmin(profileData?.is_admin || false);
            
            // Iniciar timer de sessão apenas se for admin
            if (profileData?.is_admin) {
              console.log('Usuário é admin, iniciando timer de sessão');
              startSessionTimer();
            }
          }
        }
      } catch (error) {
        console.error('Erro inesperado ao verificar sessão:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      clearSessionTimer();
      subscription.unsubscribe();
    };
  }, []);

  // Renovar timer em atividades do usuário
  useEffect(() => {
    const renewTimer = () => {
      if (user && isAdmin) {
        startSessionTimer();
      }
    };

    // Eventos que renovam o timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, renewTimer, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, renewTimer, true);
      });
    };
  }, [user, isAdmin]);

  const signUp = async (email: string, password: string, userData?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Iniciando login para:', email);
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Erro no signIn:', error);
      setLoading(false);
    }
    
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    clearSessionTimer();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setLoading(false);
  };

  const updateTheme = async (theme: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ theme_preference: theme })
      .eq('id', user.id);
    
    if (!error && profile) {
      setProfile({ ...profile, theme_preference: theme });
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
    profile,
    updateTheme,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
