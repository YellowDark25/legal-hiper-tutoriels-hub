// Tipos globais da aplicação

export interface Video {
  id: string;
  titulo: string;
  descricao: string;
  url: string;
  miniatura: string;
  thumbnail_path?: string; // Caminho da miniatura no Supabase Storage
  categoria: string | { id: string; nome: string; cor: string };
  duracao: string;
  sistema: 'pdvlegal' | 'hiper';
  status: 'ativo' | 'inativo' | 'rascunho';
  visualizacoes: number;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  nome: string;
  created_at: string;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  cor: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  is_admin: boolean;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  conteudo: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  empresa?: {
    nome_fantasia: string | null;
  };
  replies?: Comment[];
}

export interface Cliente {
  id: string;
  cnpj: string;
  nome_fantasia: string;
  sistema: string;
  email: string;
  cidade: string;
  estado: string;
  created_at: string;
}

export interface InviteToken {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  used: boolean;
  invited_by?: string;
  created_at: string;
}

// Tipos de resposta da API
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Tipos de props comuns
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps {
  loading?: boolean;
  error?: string | null;
}

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

// Tipos de formulários
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name?: string;
  username?: string;
}

export interface VideoFormData {
  titulo: string;
  descricao: string;
  url: string;
  miniatura: string;
  thumbnail_path?: string;
  categoria_id: string;
  duracao: string;
  sistema: 'pdvlegal' | 'hiper';
  status: 'ativo' | 'inativo' | 'rascunho';
  tags?: string[];
}

// Tipos de filtros
export interface VideoFilters {
  categoria?: string;
  sistema?: 'pdvlegal' | 'hiper';
  status?: 'ativo' | 'inativo' | 'rascunho';
  search?: string;
  tags?: string[];
}

// Tipos de contexto
export interface AuthContextType {
  user: any;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Tipos de eventos
export interface VideoClickEvent {
  video: Video;
  source: 'card' | 'list' | 'search';
}

export interface CommentEvent {
  action: 'create' | 'update' | 'delete';
  comment: Comment;
  video_id: string;
}

// Tipos utilitários
export type SystemType = 'pdvlegal' | 'hiper';
export type VideoStatus = 'ativo' | 'inativo' | 'rascunho';
export type UserRole = 'admin' | 'user';

// Tipos de configuração
export interface AppConfig {
  ITEMS_PER_PAGE: number;
  MAX_FILE_SIZE: number;
  SUPPORTED_VIDEO_FORMATS: string[];
  SUPPORTED_IMAGE_FORMATS: string[];
  API_ENDPOINTS: {
    VIDEOS: string;
    CATEGORIES: string;
    TAGS: string;
    COMMENTS: string;
  };
}

// Tipos de busca
export interface SearchResult {
  videos: Video[];
  categories: Categoria[];
  tags: Tag[];
  total: number;
}

export interface SearchFilters {
  query: string;
  type?: 'all' | 'videos' | 'categories' | 'tags';
  sistema?: SystemType;
  dateRange?: {
    start: string;
    end: string;
  };
} 