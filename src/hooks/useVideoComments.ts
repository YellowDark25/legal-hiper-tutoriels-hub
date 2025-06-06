
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
  replies?: Comment[];
}

export const useVideoComments = (videoId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comentarios')
        .select(`
          *,
          profiles!comentarios_user_id_fkey (
            full_name,
            username
          )
        `)
        .eq('video_id', videoId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organizar comentários hierarquicamente
      const topLevelComments = data?.filter(comment => !comment.parent_id) || [];
      const repliesMap = new Map();
      
      data?.filter(comment => comment.parent_id).forEach(reply => {
        if (!repliesMap.has(reply.parent_id)) {
          repliesMap.set(reply.parent_id, []);
        }
        repliesMap.get(reply.parent_id).push(reply);
      });

      const commentsWithReplies = topLevelComments.map(comment => ({
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

  const deleteComment = async (commentId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('comentarios')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

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
