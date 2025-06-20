import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session, AuthError } from '@supabase/supabase-js';

interface Profile {
  id: string;
  is_admin: boolean;
  full_name?: string;
  theme_preference?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: object) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  profile: Profile | null;
  updateTheme: (theme: string) => Promise<void>;
  setIsAdmin: (isAdmin: boolean) => void;
  userSystem: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // indica que está processando inicial ou signIn/signOut
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userSystem, setUserSystem] = useState<string | null>(null);
  const sessionTimer = useRef<NodeJS.Timeout | null>(null);

  const clearSessionTimer = useCallback(() => {
    if (sessionTimer.current) {
      clearTimeout(sessionTimer.current);
      sessionTimer.current = null;
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    clearSessionTimer();
    try {
      await supabase.auth.signOut();
      // Limpar estado local
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      setUserSystem(null);
    } catch (err) {
      console.error('Erro no signOut:', err);
    } finally {
      setLoading(false);
      // NÃO FORÇAR REDIRECIONAMENTO GLOBAL - permite múltiplas abas
      // window.location.href = '/auth';
    }
  }, [clearSessionTimer]);

  const fetchUserSystem = useCallback(async (userEmail: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('cadastro_empresa')
        .select('sistema')
        .eq('email', userEmail)
        .single();

      if (error) {
        // Se não encontrar na tabela cadastro_empresa, pode ser admin ou usuário sem sistema
        console.log('Usuário não encontrado na tabela cadastro_empresa (pode ser admin):', error.message);
        return null;
      }

      console.log('Sistema encontrado para o usuário:', data?.sistema);
      return data?.sistema || null;
    } catch (err) {
      console.error('Erro ao buscar sistema do usuário:', err);
      return null;
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Se for "not found", crie um perfil padrão
        if (error.code === 'PGRST116' || /not found/i.test(error.message || '')) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ id: userId, is_admin: false }])
            .select()
            .single();
          if (createError) {
            console.error('Erro criando perfil padrão:', createError);
            // Ainda assim, retorne fallback
            return { id: userId, is_admin: false };
          }
          return newProfile as Profile;
        }
        console.error('Erro inesperado ao buscar perfil:', error);
        // fallback
        return { id: userId, is_admin: false };
      }
      return data as Profile;
    } catch (err) {
      console.error('Erro catch ao buscar perfil:', err);
      // fallback
      return { id: userId, is_admin: false };
    }
  }, []);

  const startSessionTimer = useCallback(() => {
    clearSessionTimer();
    sessionTimer.current = setTimeout(async () => {
      console.log('Sessão expirou, fazendo logout automático');
      await signOut();
      alert('Sua sessão expirou. Você será redirecionado para login.');
    }, SESSION_TIMEOUT);
  }, [SESSION_TIMEOUT, clearSessionTimer, signOut]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Erro no signIn:', error);
        setLoading(false); // Explicitly set loading false on signIn error
        return { error };
      }
      // Se não houve erro, o listener onAuthStateChange será chamado.
      return { error: null };
    } catch (err) {
      console.error('Erro catch signIn:', err);
      setLoading(false); // Explicitly set loading false on signIn catch error
      return { error: { message: 'Erro desconhecido' } as AuthError };
    }
  }, []);

  const updateTheme = useCallback(async (theme: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ theme_preference: theme })
        .eq('id', user.id);
      if (!error && profile) {
        setProfile({ ...profile, theme_preference: theme });
      }
    } catch (err) {
      console.error('Erro updateTheme:', err);
    }
  }, [user, profile]);

  useEffect(() => {
    let mounted = true;

    const handleAuthEvent = async (session: Session | null) => {
      if (!mounted) return;
      setSession(session);

      const currentUser = session?.user;
      // Log the actual user object received from Supabase
      console.log('AuthContext: Raw currentUser from session:', currentUser);

      // Check if currentUser is a non-empty object with an ID
      if (currentUser && typeof currentUser === 'object' && Object.keys(currentUser).length > 0 && currentUser.id) {
        setUser(currentUser);
        try {
          const prof = await fetchProfile(currentUser.id);
          if (!mounted) return; // Component unmounted during async operation
          setProfile(prof);
          setIsAdmin(!!prof.is_admin);
          
          // Buscar sistema do usuário se não for admin
          if (!prof.is_admin && currentUser.email) {
            const sistema = await fetchUserSystem(currentUser.email);
            setUserSystem(sistema);
            console.log('Sistema do usuário:', sistema);
          } else {
            setUserSystem(null); // Admins não têm sistema específico
          }
          
          if (prof.is_admin) {
            startSessionTimer();
          } else {
            clearSessionTimer(); // Clear timer if user is not admin
          }
        } catch (err) {
          console.error('AuthContext: Error fetching profile for existing user:', err);
          setUser(null); // Explicitly clear user if profile fetch fails
          setProfile(null);
          setIsAdmin(false);
          setUserSystem(null);
          clearSessionTimer();
        }
      } else {
        // No session, user logged out, or invalid/empty user object
        console.log('AuthContext: Invalid or no user in session, setting user to null.');
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setUserSystem(null);
        clearSessionTimer();
      }
      setLoading(false); // Crucial: ensure loading is false after processing auth state
    };

    // 1) Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        console.log('⚡ onAuthStateChange event:', _event, newSession);
        handleAuthEvent(newSession);
      }
    );

    // 2) Recuperar sessão inicial
    (async () => {
      console.log('🔍 Verificando sessão inicial em AuthProvider...');
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('AuthContext: Erro getSession inicial:', error);
          // If there's an error getting initial session, treat as no session
          handleAuthEvent(null);
        } else {
          handleAuthEvent(initialSession); // Process initial session or null
        }
      } catch (err) {
        console.error('AuthContext: Erro catch ao verificar sessão inicial:', err);
        handleAuthEvent(null); // Handle unexpected errors by treating as no session
      }
    })();

    return () => {
      mounted = false;
      clearSessionTimer();
      subscription.unsubscribe();
    };
  }, [fetchProfile, fetchUserSystem, startSessionTimer, clearSessionTimer, signOut]);

  // 3) Opcional: renova timer em atividade do usuário
  useEffect(() => {
    const events = ['mousedown','mousemove','keypress','scroll','touchstart','click'];
    const renew = () => {
      if (user && isAdmin) startSessionTimer();
    };
    events.forEach(e => document.addEventListener(e, renew, true));
    return () => {
      events.forEach(e => document.removeEventListener(e, renew, true));
    };
  }, [user, isAdmin, startSessionTimer]); // eslint-disable-line react-hooks/exhaustive-deps

  const signUp = useCallback(async (email: string, password: string, userData?: object) => {
    setLoading(true); // Set loading true on action start
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: userData, emailRedirectTo: `${window.location.origin}/` }
      });
      return { error };
    } catch (err) {
      console.error('Erro signUp:', err);
      return { error: { message: 'Erro desconhecido' } as AuthError };
    } finally {
      // Let onAuthStateChange listener handle setLoading(false)
    }
  }, []);

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
    setIsAdmin,
    userSystem,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};
