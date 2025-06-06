
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<boolean>;
  placeholder?: string;
  submitLabel?: string;
  loading?: boolean;
  onCancel?: () => void;
  showCancel?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  placeholder = "Adicione seu comentário...",
  submitLabel = "Comentar",
  loading = false,
  onCancel,
  showCancel = false
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    const success = await onSubmit(content);
    if (success) {
      setContent('');
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Textarea
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={showCancel ? 2 : 3}
          className="mb-3"
        />
        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !content.trim()}
            size={showCancel ? "sm" : "default"}
          >
            {loading ? 'Enviando...' : submitLabel}
          </Button>
          {showCancel && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentForm;
