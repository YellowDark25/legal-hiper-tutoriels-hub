
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ReplyIcon, TrashIcon } from 'lucide-react';
import CommentForm from './CommentForm';

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

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply: (parentId: string, content: string) => Promise<boolean>;
  onDelete: (commentId: string) => void;
  loading?: boolean;
  showReplyButton?: boolean;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onReply,
  onDelete,
  loading = false,
  showReplyButton = true
}) => {
  const [isReplying, setIsReplying] = useState(false);

  const handleReply = async (content: string) => {
    const success = await onReply(comment.id, content);
    if (success) {
      setIsReplying(false);
    }
    return success;
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este comentário?')) {
      onDelete(comment.id);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-medium">
              {comment.profiles?.full_name || comment.profiles?.username || 'Usuário'}
            </p>
            <p className="text-sm text-gray-500">{formatDate(comment.created_at)}</p>
          </div>
          {currentUserId === comment.user_id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <p className="mb-3">{comment.conteudo}</p>
        
        {showReplyButton && currentUserId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsReplying(!isReplying)}
          >
            <ReplyIcon className="w-4 h-4 mr-1" />
            Responder
          </Button>
        )}

        {isReplying && (
          <div className="mt-3 pl-4 border-l-2 border-gray-200">
            <CommentForm
              onSubmit={handleReply}
              placeholder="Sua resposta..."
              submitLabel="Responder"
              loading={loading}
              onCancel={() => setIsReplying(false)}
              showCancel={true}
            />
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
                  {currentUserId === reply.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(reply.id)}
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
  );
};

export default CommentItem;
