import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  conteudo: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: {
    full_name: string | null;
    username: string | null;
  } | null;
  empresa: {
    nome_fantasia: string | null;
  } | null;
  replies?: Comment[];
}

export const useVideoComments = (videoId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      // Usar a nova função SQL que busca comentários com dados da empresa
      const { data, error } = await supabase.rpc('get_comments_with_empresa', {
        video_id_param: videoId
      });

      if (error) throw error;

      // Transformar os dados para o formato esperado
      const commentsData = data?.map((row: any) => ({
        id: row.id,
        conteudo: row.conteudo,
        created_at: row.created_at,
        user_id: row.user_id,
        parent_id: row.parent_id,
        video_id: row.video_id,
        profiles: {
          full_name: row.user_full_name,
          username: row.user_username
        },
        empresa: row.empresa_nome_fantasia ? {
          nome_fantasia: row.empresa_nome_fantasia
        } : null
      })) || [];

      // Organizar comentários hierarquicamente
      const topLevelComments = commentsData.filter((comment: any) => !comment.parent_id);
      const repliesMap = new Map();
      
      commentsData.filter((comment: any) => comment.parent_id).forEach((reply: any) => {
        if (!repliesMap.has(reply.parent_id)) {
          repliesMap.set(reply.parent_id, []);
        }
        repliesMap.get(reply.parent_id).push(reply);
      });

      const commentsWithReplies = topLevelComments.map((comment: any) => ({
        ...comment,
        replies: repliesMap.get(comment.id) || []
      }));

      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os comentários",
        variant: "destructive",
      });
    }
  };

  const addComment = async (content: string, userId: string, parentId?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('comentarios')
        .insert([{
          video_id: videoId,
          user_id: userId,
          conteudo: content.trim(),
          ...(parentId && { parent_id: parentId })
        }]);

      if (error) throw error;

      await fetchComments();
      toast({
        title: "Sucesso",
        description: parentId ? "Resposta adicionada com sucesso" : "Comentário adicionado com sucesso",
      });
      return true;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string, userId: string, isAdmin?: boolean) => {
    try {
      let query = supabase.from('comentarios').delete().eq('id', commentId);
      if (!isAdmin) {
        query = query.eq('user_id', userId);
      }
      const { error } = await query;

      if (error) throw error;

      await fetchComments();
      toast({
        title: "Sucesso",
        description: "Comentário excluído com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o comentário",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    refetch: fetchComments
  };
};
