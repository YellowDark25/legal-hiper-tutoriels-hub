-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'new_video', 'comment_reply', 'new_comment' (para admin)
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comentarios(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- quem fez a ação
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias notificações
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Política para admins verem todas as notificações
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Política para inserir notificações (sistema pode inserir)
CREATE POLICY "Allow insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Política para atualizar notificações (usuários podem marcar como lida)
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Função para criar notificação quando um novo vídeo é criado
CREATE OR REPLACE FUNCTION notify_new_video()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar todos os usuários do sistema do vídeo
  INSERT INTO notifications (user_id, type, title, message, video_id)
  SELECT 
    p.id,
    'new_video',
    'Novo vídeo disponível!',
    'Um novo tutorial "' || NEW.titulo || '" foi adicionado ao sistema ' || 
    CASE 
      WHEN NEW.sistema = 'pdvlegal' THEN 'PDVLegal'
      WHEN NEW.sistema = 'hiper' THEN 'Hiper'
      ELSE NEW.sistema
    END,
    NEW.id
  FROM profiles p
  LEFT JOIN cadastro_empresa ce ON ce.email = (
    SELECT email FROM auth.users WHERE id = p.id
  )
  WHERE 
    -- Notificar usuários do mesmo sistema ou admins
    (ce.sistema = NEW.sistema OR p.is_admin = true)
    AND NEW.status = 'ativo'; -- Só notificar se o vídeo estiver ativo
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificar sobre novos vídeos
DROP TRIGGER IF EXISTS trigger_notify_new_video ON videos;
CREATE TRIGGER trigger_notify_new_video
  AFTER INSERT ON videos
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_video();

-- Função para criar notificação quando um comentário é feito
CREATE OR REPLACE FUNCTION notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  video_title TEXT;
  comment_author_name TEXT;
  parent_comment_user_id UUID;
BEGIN
  -- Buscar título do vídeo
  SELECT titulo INTO video_title FROM videos WHERE id = NEW.video_id;
  
  -- Buscar nome do autor do comentário
  SELECT COALESCE(full_name, username, 'Usuário') INTO comment_author_name 
  FROM profiles WHERE id = NEW.user_id;
  
  -- Se é uma resposta a um comentário
  IF NEW.parent_id IS NOT NULL THEN
    -- Buscar o autor do comentário pai
    SELECT user_id INTO parent_comment_user_id 
    FROM comentarios WHERE id = NEW.parent_id;
    
    -- Notificar o autor do comentário original (se não for ele mesmo)
    IF parent_comment_user_id != NEW.user_id THEN
      INSERT INTO notifications (user_id, type, title, message, video_id, comment_id, related_user_id)
      VALUES (
        parent_comment_user_id,
        'comment_reply',
        'Resposta ao seu comentário',
        comment_author_name || ' respondeu ao seu comentário no vídeo "' || video_title || '"',
        NEW.video_id,
        NEW.id,
        NEW.user_id
      );
    END IF;
  END IF;
  
  -- Notificar todos os admins sobre o novo comentário
  INSERT INTO notifications (user_id, type, title, message, video_id, comment_id, related_user_id)
  SELECT 
    p.id,
    'new_comment',
    'Novo comentário',
    comment_author_name || ' comentou no vídeo "' || video_title || '"',
    NEW.video_id,
    NEW.id,
    NEW.user_id
  FROM profiles p
  WHERE p.is_admin = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificar sobre novos comentários
DROP TRIGGER IF EXISTS trigger_notify_new_comment ON comentarios;
CREATE TRIGGER trigger_notify_new_comment
  AFTER INSERT ON comentarios
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_comment(); 