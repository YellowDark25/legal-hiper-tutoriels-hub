import { Database as GeneratedDatabase } from '@/integrations/supabase/types';

// Definindo os tipos para a tabela de convites
export type Invite = {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  used_at: string | null;
  token: string;
  created_by: string;
};

// Estendendo os tipos gerados automaticamente
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace SupabaseJs {
    interface Database extends GeneratedDatabase {
      public: {
        Tables: {
          invites: {
            Row: Invite;
            Insert: Omit<Invite, 'id' | 'created_at' | 'updated_at'>;
            Update: Partial<Omit<Invite, 'id' | 'created_at' | 'updated_at' | 'token' | 'created_by'>>;
          };
        } & GeneratedDatabase['public']['Tables'];
        Functions: {
          invite_user: {
            Args: {
              email: string;
              user_role: 'user' | 'admin';
            };
            Returns: string;
          };
        } & GeneratedDatabase['public']['Functions'];
      } & GeneratedDatabase['public'];
    }
  }
}

// Exportando os tipos estendidos
export type Database = SupabaseJs.Database;
