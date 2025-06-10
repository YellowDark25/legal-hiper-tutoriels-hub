import { Database as GeneratedDatabase } from '@/integrations/supabase/types';

declare global {
  // Estendendo a interface Database do Supabase para incluir a tabela de convites
  export type Database = GeneratedDatabase & {
    public: {
      Tables: {
        invites: {
          Row: {
            id: string;
            email: string;
            role: 'user' | 'admin';
            created_at: string;
            updated_at: string;
            used_at: string | null;
            token: string;
            created_by: string;
          };
          Insert: {
            id?: string;
            email: string;
            role?: 'user' | 'admin';
            created_at?: string;
            updated_at?: string;
            used_at?: string | null;
            token: string;
            created_by: string;
          };
          Update: {
            id?: string;
            email?: string;
            role?: 'user' | 'admin';
            created_at?: string;
            updated_at?: string;
            used_at?: string | null;
            token?: string;
            created_by?: string;
          };
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
  };
}

export {};
