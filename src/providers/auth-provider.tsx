import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import type { UserProfile, UserData, ErrorResponse } from '@/types/auth';
import AuthContext from '@/contexts/auth-context';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Função para buscar o perfil do usuário
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as UserProfile;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    }
  }, []);

  // Função para atualizar a sessão e os dados do usuário
  const updateSession = useCallback(async (session: Session | null): Promise<void> => {
    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      const userProfile = await fetchUserProfile(session.user.id);
      setProfile(userProfile);
      setIsAdmin(userProfile?.role === 'admin');
      
      // Atualiza o token JWT com os dados mais recentes do perfil
      if (userProfile) {
        await supabase.auth.updateUser({
          data: userProfile,
        });
      }
    } else {
      setProfile(null);
      setIsAdmin(false);
    }
    
    setLoading(false);
  }, [fetchUserProfile]);

  // Efeito para gerenciar mudanças na sessão de autenticação
  useEffect(() => {
    // Verifica a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateSession(session);
    });

    // Configura o listener de mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      await updateSession(session);
    });

    // Limpa o listener quando o componente é desmontado
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [updateSession]);

  const signUp = async (email: string, password: string, userData: UserData): Promise<ErrorResponse> => {
    try {
      if (!userData.full_name || !userData.username) {
        return { error: { message: 'Nome completo e nome de usuário são obrigatórios.' } };
      }

      // Verifica se o username já existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', userData.username)
        .single();

      if (existingUser) {
        return { error: { message: 'Nome de usuário já está em uso.' } };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            username: userData.username
          }
        }
      });

      if (error) {
        return { error: { message: error.message } };
      }

      // Se o registro for bem-sucedido, mas o email precisar ser verificado
      if (data.user && !data.session) {
        return { 
          error: { 
            message: 'Por favor, verifique seu email para confirmar o cadastro.',
            details: 'Um link de confirmação foi enviado para o seu email.'
          } 
        };
      }

      // Se o usuário for criado e a sessão for retornada (verificação de email desabilitada)
      if (data.user && data.session) {
        await updateSession(data.session);
      }

      return { error: null };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { 
        error: { 
          message: 'Erro ao criar conta.',
          details: error instanceof Error ? error.message : 'Tente novamente mais tarde.'
        } 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error: { message: 'Credenciais inválidas. Verifique seu email e senha.' } };
      }

      // Se o login for bem-sucedido
      if (data.user && data.session) {
        await updateSession(data.session);
      }

      return { error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        error: { 
          message: 'Erro ao fazer login.',
          details: error instanceof Error ? error.message : 'Tente novamente mais tarde.'
        } 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Limpa todos os estados
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      
      // Limpa o storage local se necessário
      localStorage.removeItem('isAdmin');
    } catch (error) {
      console.error('Erro ao sair:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Função para atualizar a sessão manualmente
  const refreshSession = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      await updateSession(session);
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
