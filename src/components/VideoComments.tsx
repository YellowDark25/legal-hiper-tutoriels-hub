import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircleIcon, Users, Filter, SortDesc } from 'lucide-react';
import { useVideoComments } from '@/hooks/useVideoComments';
import CommentForm from './comments/CommentForm';
import CommentItem from './comments/CommentItem';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface VideoCommentsProps {
  videoId: string;
}

const VideoComments: React.FC<VideoCommentsProps> = ({ videoId }) => {
  const { user, isAdmin } = useAuth();
  const { comments, loading, addComment, deleteComment } = useVideoComments(videoId);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showForm, setShowForm] = useState(false);

  const handleAddComment = async (content: string) => {
    if (!user) return false;
    const success = await addComment(content, user.id);
    if (success) {
      setShowForm(false);
    }
    return success;
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!user) return false;
    return await addComment(content, user.id, parentId);
  };

  const handleDelete = (commentId: string) => {
    if (!user) return;
    deleteComment(commentId, user.id, isAdmin);
  };

  // Ordenar comentários
  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Contar comentários únicos (sem replies)
  const topLevelComments = comments.filter(c => !c.parent_id);
  const totalReplies = comments.filter(c => c.parent_id);

  return (
    <div className="space-y-6">
      {/* Header dos Comentários */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MessageCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Comentários
              </h3>
            </div>
            <Badge variant="secondary" className="text-xs">
              {comments.length}
            </Badge>
          </div>
          
          {/* Controles de Ordenação */}
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest') => setSortBy(value)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="oldest">Mais antigos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estatísticas */}
        {comments.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{topLevelComments.length} comentário{topLevelComments.length !== 1 ? 's' : ''}</span>
            </div>
            {totalReplies.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircleIcon className="w-4 h-4" />
                <span>{totalReplies.length} resposta{totalReplies.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formulário de Comentário */}
      {user ? (
        <div className="space-y-3">
          {!showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <MessageCircleIcon className="w-4 h-4 mr-2" />
              Adicionar um comentário...
            </Button>
          ) : (
            <div className="space-y-3">
              <CommentForm
                onSubmit={handleAddComment}
                loading={loading}
                placeholder="Compartilhe sua experiência, dúvida ou sugestão sobre este tutorial..."
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
          <MessageCircleIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Faça login para participar da discussão
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Compartilhe suas dúvidas e experiências com outros usuários
          </p>
        </div>
      )}

      {/* Lista de Comentários */}
      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={user?.id}
            onReply={handleReply}
            onDelete={handleDelete}
            loading={loading}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {/* Estado Vazio */}
      {comments.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 max-w-sm mx-auto">
            <MessageCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum comentário ainda
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Seja o primeiro a compartilhar sua experiência com este tutorial!
            </p>
            {user && (
              <Button
                onClick={() => setShowForm(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Escrever comentário
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoComments;
