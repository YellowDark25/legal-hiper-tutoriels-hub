import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircleIcon } from 'lucide-react';
import { useVideoComments } from '@/hooks/useVideoComments';
import CommentForm from './comments/CommentForm';
import CommentItem from './comments/CommentItem';

interface VideoCommentsProps {
  videoId: string;
}

const VideoComments: React.FC<VideoCommentsProps> = ({ videoId }) => {
  const { user, isAdmin } = useAuth();
  const { comments, loading, addComment, deleteComment } = useVideoComments(videoId);

  const handleAddComment = async (content: string) => {
    if (!user) return false;
    return await addComment(content, user.id);
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!user) return false;
    return await addComment(content, user.id, parentId);
  };

  const handleDelete = (commentId: string) => {
    if (!user) return;
    deleteComment(commentId, user.id, isAdmin);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircleIcon className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Comentários ({comments.length})</h3>
      </div>

      {user && (
        <CommentForm
          onSubmit={handleAddComment}
          loading={loading}
        />
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
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

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum comentário ainda. Seja o primeiro a comentar!
        </div>
      )}
    </div>
  );
};

export default VideoComments;
