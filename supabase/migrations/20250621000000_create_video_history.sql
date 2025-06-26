-- Criar tabela video_history para armazenar progresso dos vídeos
CREATE TABLE IF NOT EXISTS public.video_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  video_titulo TEXT NOT NULL,
  video_categoria TEXT,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  watch_duration INTEGER, -- duração assistida em segundos
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraint para evitar duplicatas
  UNIQUE(user_id, video_id)
);

-- Habilitar RLS na tabela video_history
ALTER TABLE public.video_history ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seu próprio histórico
CREATE POLICY "Users can view their own video history" 
  ON public.video_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram seu próprio histórico
CREATE POLICY "Users can insert their own video history" 
  ON public.video_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seu próprio histórico
CREATE POLICY "Users can update their own video history" 
  ON public.video_history 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir que admins vejam todo o histórico
CREATE POLICY "Admins can view all video history" 
  ON public.video_history 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_video_history_user_id ON public.video_history(user_id);
CREATE INDEX IF NOT EXISTS idx_video_history_video_id ON public.video_history(video_id);
CREATE INDEX IF NOT EXISTS idx_video_history_completed ON public.video_history(completed);
CREATE INDEX IF NOT EXISTS idx_video_history_watched_at ON public.video_history(watched_at);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_video_history_updated_at 
    BEFORE UPDATE ON public.video_history 
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Função para marcar vídeo como assistido (helper)
CREATE OR REPLACE FUNCTION public.mark_video_watched(
  p_video_id TEXT,
  p_video_titulo TEXT DEFAULT 'Título não disponível',
  p_video_categoria TEXT DEFAULT NULL,
  p_watch_duration INTEGER DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.video_history (
    user_id,
    video_id,
    video_titulo,
    video_categoria,
    watch_duration,
    completed,
    watched_at
  )
  VALUES (
    auth.uid(),
    p_video_id,
    p_video_titulo,
    p_video_categoria,
    p_watch_duration,
    true,
    now()
  )
  ON CONFLICT (user_id, video_id) 
  DO UPDATE SET 
    completed = true,
    watched_at = now(),
    watch_duration = COALESCE(EXCLUDED.watch_duration, video_history.watch_duration),
    video_titulo = EXCLUDED.video_titulo,
    video_categoria = COALESCE(EXCLUDED.video_categoria, video_history.video_categoria),
    updated_at = now();
END;
$$;

-- Função para obter estatísticas de progresso do usuário
CREATE OR REPLACE FUNCTION public.get_user_progress_stats(p_sistema TEXT DEFAULT NULL)
RETURNS TABLE (
  total_videos BIGINT,
  videos_assistidos BIGINT,
  percentual_completo NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_videos AS (
    SELECT v.id
    FROM public.videos v
    WHERE v.status = 'ativo'
    AND (p_sistema IS NULL OR v.sistema = p_sistema)
  ),
  user_watched AS (
    SELECT vh.video_id
    FROM public.video_history vh
    WHERE vh.user_id = auth.uid()
    AND vh.completed = true
  )
  SELECT 
    (SELECT COUNT(*) FROM user_videos)::BIGINT as total_videos,
    (SELECT COUNT(*) FROM user_watched uw 
     JOIN user_videos uv ON uw.video_id = uv.id)::BIGINT as videos_assistidos,
    CASE 
      WHEN (SELECT COUNT(*) FROM user_videos) > 0 THEN
        ROUND(
          (SELECT COUNT(*) FROM user_watched uw 
           JOIN user_videos uv ON uw.video_id = uv.id)::NUMERIC * 100.0 / 
          (SELECT COUNT(*) FROM user_videos)::NUMERIC, 
          2
        )
      ELSE 0
    END as percentual_completo;
END;
$$; 