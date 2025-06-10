// Tipos para a tabela de convites
export interface Invite {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  used_at: string | null;
  token: string;
  created_by: string;
}

// Interface para o banco de dados
export interface Database {
  public: {
    Tables: {
      invites: {
        Row: Invite;
        Insert: Omit<Invite, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Invite, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Functions: {
      invite_user: {
        Args: {
          email: string;
          user_role: 'user' | 'admin';
        };
        Returns: string;
      };
    };
  };
}

// Exportando tipos para uso em outros arquivos
export type { Database as DatabaseType };

// Adicionando tipos globais para o cliente Supabase
declare global {
  interface Window {
    supabase: import('@supabase/supabase-js').SupabaseClient<Database>;
  }
}
