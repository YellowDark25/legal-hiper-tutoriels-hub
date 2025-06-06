
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MessageCircleIcon, ReplyIcon, TrashIcon } from 'lucide-react';

interface Comment {
  id: string;
  conteudo: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: {
    full_name: string | null;
    username: string | null;
  };
  replies?: Comment[];
}

interface VideoCommentsProps {
  videoId: string;
}

const VideoComments: React.FC<VideoCommentsProps> = ({ videoId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comentarios')
        .select(`
          *,
          profiles (
            full_name,
            username
          )
        `)
        .eq('video_id', videoId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organizar comentários hierarquicamente
      const topLevelComments = data.filter(comment => !comment.parent_id);
      const repliesMap = new Map();
      
      data.filter(comment => comment.parent_id).forEach(reply => {
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
    }
  };

  const submitComment = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para comentar",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('comentarios')
        .insert([{
          video_id: videoId,
          user_id: user.id,
          conteudo: newComment.trim()
        }]);

      if (error) throw error;

      setNewComment('');
      fetchComments();
      toast({
        title: "Sucesso",
        description: "Comentário adicionado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('comentarios')
        .insert([{
          video_id: videoId,
          user_id: user.id,
          conteudo: replyContent.trim(),
          parent_id: parentId
        }]);

      if (error) throw error;

      setReplyContent('');
      setReplyTo(null);
      fetchComments();
      toast({
        title: "Sucesso",
        description: "Resposta adicionada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao adicionar resposta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a resposta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return;

    try {
      const { error } = await supabase
        .from('comentarios')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      fetchComments();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircleIcon className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Comentários ({comments.length})</h3>
      </div>

      {user && (
        <Card>
          <CardContent className="p-4">
            <Textarea
              placeholder="Adicione seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="mb-3"
            />
            <Button onClick={submitComment} disabled={loading || !newComment.trim()}>
              {loading ? 'Enviando...' : 'Comentar'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">
                    {comment.profiles?.full_name || comment.profiles?.username || 'Usuário'}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(comment.created_at)}</p>
                </div>
                {user?.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteComment(comment.id)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <p className="mb-3">{comment.conteudo}</p>
              
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                >
                  <ReplyIcon className="w-4 h-4 mr-1" />
                  Responder
                </Button>
              )}

              {replyTo === comment.id && (
                <div className="mt-3 pl-4 border-l-2 border-gray-200">
                  <Textarea
                    placeholder="Sua resposta..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={2}
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => submitReply(comment.id)}
                      disabled={loading || !replyContent.trim()}
                    >
                      Responder
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyContent('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">
                            {reply.profiles?.full_name || reply.profiles?.username || 'Usuário'}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(reply.created_at)}</p>
                        </div>
                        {user?.id === reply.user_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteComment(reply.id)}
                          >
                            <TrashIcon className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm">{reply.conteudo}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum comentário ainda. Seja o primeiro a comentar!
        </div>
      )}
    </div>
  );
};

export default VideoComments;
