import { Database } from '@/integrations/supabase/types';

declare module '@/integrations/supabase/types' {
  export interface Database {
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
            email: string;
            role?: 'user' | 'admin';
            created_at?: string;
            updated_at?: string;
            used_at?: string | null;
            token: string;
            created_by: string;
          };
          Update: {
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
  }
}
