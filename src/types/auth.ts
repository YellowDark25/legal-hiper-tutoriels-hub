import type { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  bio?: string;
}

export interface UserData {
  full_name: string;
  username: string;
}

export interface ErrorResponse {
  error: {
    message: string;
    details?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: UserData) => Promise<ErrorResponse>;
  signIn: (email: string, password: string) => Promise<ErrorResponse>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  refreshSession: () => Promise<void>;
}
