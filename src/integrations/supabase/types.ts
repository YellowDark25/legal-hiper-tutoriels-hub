export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categorias: {
        Row: {
          cor: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      cadastro_empresa: {
        Row: {
          id: string
          cnpj: string
          nome_fantasia: string
          sistema: string
          cidade: string | null
          estado: string | null
          email: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          cnpj: string
          nome_fantasia: string
          sistema: string
          cidade?: string | null
          estado?: string | null
          email: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          cnpj?: string
          nome_fantasia?: string
          sistema?: string
          cidade?: string | null
          estado?: string | null
          email?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      comentarios: {
        Row: {
          conteudo: string
          created_at: string | null
          id: string
          parent_id: string | null
          updated_at: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comentarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_comentarios_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_pagar: {
        Row: {
          cliente: string | null
          codigoLancamento: number | null
          created_at: string
          dataVencimento: string | null
          id: number
          numeroParcela: number | null
          valor: string | null
        }
        Insert: {
          cliente?: string | null
          codigoLancamento?: number | null
          created_at?: string
          dataVencimento?: string | null
          id?: number
          numeroParcela?: number | null
          valor?: string | null
        }
        Update: {
          cliente?: string | null
          codigoLancamento?: number | null
          created_at?: string
          dataVencimento?: string | null
          id?: number
          numeroParcela?: number | null
          valor?: string | null
        }
        Relationships: []
      }
      contatos: {
        Row: {
          data_envio: string | null
          email: string
          empresa: string | null
          id: string
          mensagem: string | null
          nome: string
          telefone: string
        }
        Insert: {
          data_envio?: string | null
          email: string
          empresa?: string | null
          id?: string
          mensagem?: string | null
          nome: string
          telefone: string
        }
        Update: {
          data_envio?: string | null
          email?: string
          empresa?: string | null
          id?: string
          mensagem?: string | null
          nome?: string
          telefone?: string
        }
        Relationships: []
      }
      dados_clientes: {
        Row: {
          cliente_mostrando_interesse: boolean | null
          closer_conduziu_bem: boolean | null
          created_at: string
          data_reuniao: string | null
          empresa: string | null
          estrategias_sugeridas: string | null
          id: number
          nivel_cliente: string | null
          nome_cliente: string | null
          pontos_melhoria: string | null
          resumo: string | null
          valores: string | null
        }
        Insert: {
          cliente_mostrando_interesse?: boolean | null
          closer_conduziu_bem?: boolean | null
          created_at?: string
          data_reuniao?: string | null
          empresa?: string | null
          estrategias_sugeridas?: string | null
          id?: number
          nivel_cliente?: string | null
          nome_cliente?: string | null
          pontos_melhoria?: string | null
          resumo?: string | null
          valores?: string | null
        }
        Update: {
          cliente_mostrando_interesse?: boolean | null
          closer_conduziu_bem?: boolean | null
          created_at?: string
          data_reuniao?: string | null
          empresa?: string | null
          estrategias_sugeridas?: string | null
          id?: number
          nivel_cliente?: string | null
          nome_cliente?: string | null
          pontos_melhoria?: string | null
          resumo?: string | null
          valores?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      Empresas: {
        Row: {
          abertura: string | null
          cidade: string | null
          CNPJ: string | null
          created_at: string
          estado: string | null
          horario_reuniao: string | null
          id: number
          nome_fantansia: string | null
          situacao: string | null
          telefone: string | null
        }
        Insert: {
          abertura?: string | null
          cidade?: string | null
          CNPJ?: string | null
          created_at?: string
          estado?: string | null
          horario_reuniao?: string | null
          id?: number
          nome_fantansia?: string | null
          situacao?: string | null
          telefone?: string | null
        }
        Update: {
          abertura?: string | null
          cidade?: string | null
          CNPJ?: string | null
          created_at?: string
          estado?: string | null
          horario_reuniao?: string | null
          id?: number
          nome_fantansia?: string | null
          situacao?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      invite_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          token: string
          used: boolean
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          token: string
          used?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          token?: string
          used?: boolean
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          created_at: string | null
          id: string
          lida: boolean | null
          mensagem: string
          tipo: string
          titulo: string
          user_id: string
          video_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          tipo: string
          titulo: string
          user_id: string
          video_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          tipo?: string
          titulo?: string
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_videos: {
        Row: {
          added_at: string | null
          id: string
          playlist_id: string
          video_id: string
          video_miniatura: string | null
          video_titulo: string
          video_url: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          playlist_id: string
          video_id: string
          video_miniatura?: string | null
          video_titulo: string
          video_url: string
        }
        Update: {
          added_at?: string | null
          id?: string
          playlist_id?: string
          video_id?: string
          video_miniatura?: string | null
          video_titulo?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_videos_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          is_public: boolean | null
          nome: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          is_public?: boolean | null
          nome: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          is_public?: boolean | null
          nome?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      posts_blog: {
        Row: {
          categoria: string
          conteudo: string
          created_at: string | null
          data_publicacao: string
          id: string
          imagem_destaque: string
          resumo: string
          slug: string
          status: string
          titulo: string
        }
        Insert: {
          categoria: string
          conteudo: string
          created_at?: string | null
          data_publicacao?: string
          id?: string
          imagem_destaque: string
          resumo: string
          slug: string
          status?: string
          titulo: string
        }
        Update: {
          categoria?: string
          conteudo?: string
          created_at?: string | null
          data_publicacao?: string
          id?: string
          imagem_destaque?: string
          resumo?: string
          slug?: string
          status?: string
          titulo?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          theme_preference: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          theme_preference?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          theme_preference?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      qualificacao_leads: {
        Row: {
          agente: string | null
          cnpj: string
          data_qualificacao: string | null
          data_reuniao: string | null
          historico_conversa: string | null
          id: number
          nome_cliente: string | null
          resposta_dor: string | null
          resposta_satisfacao: string | null
          resposta_sistema: string | null
          telefone: string | null
          timeoff: string | null
        }
        Insert: {
          agente?: string | null
          cnpj: string
          data_qualificacao?: string | null
          data_reuniao?: string | null
          historico_conversa?: string | null
          id?: number
          nome_cliente?: string | null
          resposta_dor?: string | null
          resposta_satisfacao?: string | null
          resposta_sistema?: string | null
          telefone?: string | null
          timeoff?: string | null
        }
        Update: {
          agente?: string | null
          cnpj?: string
          data_qualificacao?: string | null
          data_reuniao?: string | null
          historico_conversa?: string | null
          id?: number
          nome_cliente?: string | null
          resposta_dor?: string | null
          resposta_satisfacao?: string | null
          resposta_sistema?: string | null
          telefone?: string | null
          timeoff?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      Users: {
        Row: {
          agente: string | null
          created_at: string
          id: number
          nome: string | null
          telefone: string | null
          timeoff: string | null
        }
        Insert: {
          agente?: string | null
          created_at?: string
          id?: number
          nome?: string | null
          telefone?: string | null
          timeoff?: string | null
        }
        Update: {
          agente?: string | null
          created_at?: string
          id?: number
          nome?: string | null
          telefone?: string | null
          timeoff?: string | null
        }
        Relationships: []
      }
      video_history: {
        Row: {
          completed: boolean | null
          id: string
          user_id: string
          video_categoria: string | null
          video_id: string
          video_titulo: string
          watch_duration: number | null
          watched_at: string | null
        }
        Insert: {
          completed?: boolean | null
          id?: string
          user_id: string
          video_categoria?: string | null
          video_id: string
          video_titulo: string
          watch_duration?: number | null
          watched_at?: string | null
        }
        Update: {
          completed?: boolean | null
          id?: string
          user_id?: string
          video_categoria?: string | null
          video_id?: string
          video_titulo?: string
          watch_duration?: number | null
          watched_at?: string | null
        }
        Relationships: []
      }
      video_tags: {
        Row: {
          id: string
          tag_id: string | null
          video_id: string | null
        }
        Insert: {
          id?: string
          tag_id?: string | null
          video_id?: string | null
        }
        Update: {
          id?: string
          tag_id?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_tags_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          categoria_id: string | null
          created_at: string
          created_by: string | null
          descricao: string | null
          duracao: string | null
          id: string
          miniatura: string | null
          sistema: string
          status: string
          thumbnail_path: string | null
          titulo: string
          updated_at: string
          url: string
          video_path: string | null
          visualizacoes: number | null
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          duracao?: string | null
          id?: string
          miniatura?: string | null
          sistema: string
          status?: string
          thumbnail_path?: string | null
          titulo: string
          updated_at?: string
          url: string
          video_path?: string | null
          visualizacoes?: number | null
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          duracao?: string | null
          id?: string
          miniatura?: string | null
          sistema?: string
          status?: string
          thumbnail_path?: string | null
          titulo?: string
          updated_at?: string
          url?: string
          video_path?: string | null
          visualizacoes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
