import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ReplyIcon, TrashIcon } from 'lucide-react';
import CommentForm from './CommentForm';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

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

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply: (parentId: string, content: string) => Promise<boolean>;
  onDelete: (commentId: string) => void;
  loading?: boolean;
  showReplyButton?: boolean;
  isAdmin?: boolean;
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

// Função para obter o nome de exibição do usuário
const getDisplayName = (comment: Comment) => {
  // Prioridade: nome_fantasia da empresa > full_name > username > fallback
  if (comment.empresa?.nome_fantasia) {
    return comment.empresa.nome_fantasia;
  }
  
  if (comment.profiles?.full_name) {
    return comment.profiles.full_name;
  }
  
  if (comment.profiles?.username) {
    return comment.profiles.username;
  }
  
  return `usuário-${comment.user_id.slice(-8)}`;
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onReply,
  onDelete,
  loading = false,
  showReplyButton = true,
  isAdmin = false
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleReply = async (content: string) => {
    const success = await onReply(comment.id, content);
    if (success) {
      setIsReplying(false);
    }
    return success;
  };

  const handleDelete = () => {
    onDelete(comment.id);
    setOpenDialog(false);
  };

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {getDisplayName(comment)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{formatDate(comment.created_at)}</p>
          </div>
          {isAdmin && (
            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir comentário</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este comentário? Esta ação não poderá ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} autoFocus>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{comment.conteudo}</p>
        
        {showReplyButton && currentUserId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsReplying(!isReplying)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ReplyIcon className="w-4 h-4 mr-2" />
            Responder
          </Button>
        )}

        {isReplying && (
          <div className="mt-4 pl-4 border-l-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-3">
            <CommentForm
              onSubmit={handleReply}
              placeholder="Escreva sua resposta..."
              submitLabel="Responder"
              loading={loading}
              onCancel={() => setIsReplying(false)}
              showCancel={true}
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 pl-4 border-l-2 border-blue-200 dark:border-blue-800 space-y-3">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {getDisplayName(reply)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{formatDate(reply.created_at)}</p>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(reply.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{reply.conteudo}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentItem;
