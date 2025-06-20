/**
 * Camada de serviços para interações com Supabase
 * Centraliza todas as operações de banco de dados
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  Video, 
  Categoria, 
  Tag, 
  Comment, 
  Profile, 
  Cliente, 
  InviteToken,
  VideoFormData,
  VideoFilters,
  ApiError 
} from '@/types/global';
import { MESSAGES } from '@/lib/constants';

// Utilitário para tratamento de erros
const handleError = (error: any): ApiError => {
  console.error('Supabase Error:', error);
  
  if (error.code === 'PGRST116') {
    return { message: MESSAGES.ERROR_NOT_FOUND, code: error.code };
  }
  
  if (error.code === '42501') {
    return { message: MESSAGES.ERROR_UNAUTHORIZED, code: error.code };
  }
  
  return { 
    message: error.message || MESSAGES.ERROR_GENERIC, 
    code: error.code,
    details: error 
  };
};

// ==================== SERVIÇOS DE VÍDEO ====================

export const videoService = {
  /**
   * Busca todos os vídeos com filtros opcionais
   */
  async getVideos(filters?: VideoFilters): Promise<Video[]> {
    let query = supabase
      .from('videos')
      .select(`
        *,
        categorias:categoria_id(id, nome, cor),
        video_tags(tags(id, nome))
      `)
      .eq('status', 'ativo');

    if (filters?.sistema) {
      query = query.eq('sistema', filters.sistema);
    }

    if (filters?.categoria && filters.categoria !== 'all') {
      query = query.eq('categoria_id', filters.categoria);
    }

    if (filters?.search) {
      query = query.ilike('titulo', `%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw handleError(error);
    return data || [];
  },

  /**
   * Busca um vídeo por ID
   */
  async getVideoById(id: string): Promise<Video | null> {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        categorias:categoria_id(id, nome, cor),
        video_tags(tags(id, nome))
      `)
      .eq('id', id)
      .single();

    if (error) throw handleError(error);
    return data;
  },

  /**
   * Cria um novo vídeo
   */
  async createVideo(videoData: VideoFormData): Promise<Video> {
    const { data, error } = await supabase
      .from('videos')
      .insert({
        ...videoData,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw handleError(error);
    return data;
  },

  /**
   * Atualiza um vídeo
   */
  async updateVideo(id: string, updates: Partial<VideoFormData>): Promise<Video> {
    const { data, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw handleError(error);
    return data;
  },

  /**
   * Exclui um vídeo
   */
  async deleteVideo(id: string): Promise<void> {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) throw handleError(error);
  },

  /**
   * Incrementa visualizações de um vídeo
   */
  async incrementViews(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_video_views', { video_id: id });
    if (error) throw handleError(error);
  },

  /**
   * Busca vídeos por sistema (pdvlegal ou hiper)
   */
  async getVideosBySystem(sistema: string): Promise<Video[]> {
    try {
      // Primeiro, buscar os vídeos com categoria
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select(`
          *,
          categorias:categoria_id(id, nome, cor)
        `)
        .eq('sistema', sistema)
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      if (videosError) throw handleError(videosError);

      if (!videosData || videosData.length === 0) {
        return [];
      }

      // Buscar tags para cada vídeo e processar miniatura
      const videosWithTags = await Promise.all(
        videosData.map(async (video) => {
          const { data: tagsData, error: tagsError } = await supabase
            .from('video_tags')
            .select(`
              tags(id, nome)
            `)
            .eq('video_id', video.id);

          if (tagsError) {
            console.warn('Erro ao buscar tags para vídeo:', video.id, tagsError);
          }

          const tags = tagsData?.map(vt => vt.tags).filter(Boolean) || [];

          // Gerar URL da miniatura se existe thumbnail_path
          let miniaturaUrl = video.miniatura;
          if (video.thumbnail_path && !miniaturaUrl) {
            const { data: storageData } = supabase.storage
              .from('thumbnails')
              .getPublicUrl(video.thumbnail_path);
            miniaturaUrl = storageData?.publicUrl;
          }

          return {
            ...video,
            categoria: video.categorias || 'Sem categoria',
            tags,
            miniatura: miniaturaUrl
          };
        })
      );

      return videosWithTags;

    } catch (error) {
      console.error('Erro em getVideosBySystem:', error);
      throw handleError(error);
    }
  },
};

// ==================== SERVIÇOS DE CATEGORIA ====================

export const categoriaService = {
  /**
   * Busca todas as categorias
   */
  async getCategorias(): Promise<Categoria[]> {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nome');

    if (error) throw handleError(error);
    return data || [];
  },

  /**
   * Cria uma nova categoria
   */
  async createCategoria(categoria: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>): Promise<Categoria> {
    const { data, error } = await supabase
      .from('categorias')
      .insert(categoria)
      .select()
      .single();

    if (error) throw handleError(error);
    return data;
  },

  /**
   * Atualiza uma categoria
   */
  async updateCategoria(id: string, updates: Partial<Categoria>): Promise<Categoria> {
    const { data, error } = await supabase
      .from('categorias')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw handleError(error);
    return data;
  },

  /**
   * Exclui uma categoria
   */
  async deleteCategoria(id: string): Promise<void> {
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);

    if (error) throw handleError(error);
  },

  /**
   * Busca todas as categorias (alias para getCategorias)
   */
  async getAllCategorias(): Promise<Categoria[]> {
    return this.getCategorias();
  },
};

// ==================== SERVIÇOS DE TAG ====================

export const tagService = {
  /**
   * Busca todas as tags
   */
  async getTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('nome');

    if (error) throw handleError(error);
    return data || [];
  },

  /**
   * Cria uma nova tag
   */
  async createTag(tag: Omit<Tag, 'id' | 'created_at'>): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .insert(tag)
      .select()
      .single();

    if (error) throw handleError(error);
    return data;
  },

  /**
   * Exclui uma tag
   */
  async deleteTag(id: string): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) throw handleError(error);
  },

  /**
   * Busca todas as tags (alias para getTags)
   */
  async getAllTags(): Promise<Tag[]> {
    return this.getTags();
  },
};

// ==================== SERVIÇOS DE COMENTÁRIO ====================

export const commentService = {
  /**
   * Busca comentários de um vídeo
   */
  async getComments(videoId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comentarios')
      .select(`
        *,
        profiles(id, full_name, username, avatar_url),
        replies:comentarios!parent_id(
          *,
          profiles(id, full_name, username, avatar_url)
        )
      `)
      .eq('video_id', videoId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) throw handleError(error);
    return data || [];
  },

  /**
   * Cria um novo comentário
   */
  async createComment(comment: {
    video_id: string;
    conteudo: string;
    parent_id?: string;
  }): Promise<Comment> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('comentarios')
      .insert({
        ...comment,
        user_id: user.data.user.id,
      })
      .select(`
        *,
        profiles(id, full_name, username, avatar_url)
      `)
      .single();

    if (error) throw handleError(error);
    return data;
  },

  /**
   * Exclui um comentário
   */
  async deleteComment(id: string): Promise<void> {
    const { error } = await supabase
      .from('comentarios')
      .delete()
      .eq('id', id);

    if (error) throw handleError(error);
  },
};

// ==================== SERVIÇOS DE PERFIL ====================

export const profileService = {
  /**
   * Busca perfil do usuário atual
   */
  async getCurrentProfile(): Promise<Profile | null> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.data.user.id)
      .single();

    if (error) throw handleError(error);
    return data;
  },

  /**
   * Atualiza perfil do usuário
   */
  async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.data.user.id)
      .select()
      .single();

    if (error) throw handleError(error);
    return data;
  },

  /**
   * Busca todos os perfis (apenas para admins)
   */
  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw handleError(error);
    return data || [];
  },
};

// ==================== SERVIÇOS DE CLIENTE ====================

export const clienteService = {
  /**
   * Busca todos os clientes cadastrados
   */
  async getClientes(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('cadastro_empresa')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw handleError(error);
    return data || [];
  },

  /**
   * Busca cliente por ID
   */
  async getClienteById(id: string): Promise<Cliente | null> {
    const { data, error } = await supabase
      .from('cadastro_empresa')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw handleError(error);
    return data;
  },
};

// ==================== SERVIÇOS DE CONVITE ====================

export const inviteService = {
  /**
   * Busca todos os convites
   */
  async getInvites(): Promise<InviteToken[]> {
    const { data, error } = await supabase
      .from('invite_tokens')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw handleError(error);
    return data || [];
  },

  /**
   * Cria um novo convite
   */
  async createInvite(email: string): Promise<InviteToken> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Usuário não autenticado');

    // Gerar token único
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

    const { data, error } = await supabase
      .from('invite_tokens')
      .insert({
        email,
        token,
        expires_at: expiresAt.toISOString(),
        invited_by: user.data.user.id,
      })
      .select()
      .single();

    if (error) throw handleError(error);
    return data;
  },

  /**
   * Valida um token de convite
   */
  async validateInvite(token: string): Promise<InviteToken | null> {
    const { data, error } = await supabase
      .from('invite_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) return null;
    return data;
  },

  /**
   * Marca convite como usado
   */
  async markInviteAsUsed(token: string): Promise<void> {
    const { error } = await supabase
      .from('invite_tokens')
      .update({ used: true })
      .eq('token', token);

    if (error) throw handleError(error);
  },
};

// ==================== SERVIÇOS DE AUTENTICAÇÃO ====================

export const authService = {
  /**
   * Login do usuário
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  },

  /**
   * Registro de novo usuário
   */
  async signUp(email: string, password: string, userData?: { full_name?: string; username?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    return { data, error };
  },

  /**
   * Logout do usuário
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Recuperação de senha
   */
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  /**
   * Atualização de senha
   */
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error };
  },
}; 