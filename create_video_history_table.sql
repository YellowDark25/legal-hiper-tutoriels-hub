-- Script para criar tabela video_history no Supabase Dashboard
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar tabela video_history para armazenar progresso dos vídeos
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

-- 2. Habilitar RLS na tabela video_history
ALTER TABLE public.video_history ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS
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

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_video_history_user_id ON public.video_history(user_id);
CREATE INDEX IF NOT EXISTS idx_video_history_video_id ON public.video_history(video_id);
CREATE INDEX IF NOT EXISTS idx_video_history_completed ON public.video_history(completed);
CREATE INDEX IF NOT EXISTS idx_video_history_watched_at ON public.video_history(watched_at);

-- 5. Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_video_history_updated_at 
    BEFORE UPDATE ON public.video_history 
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- 6. Função helper para marcar vídeo como assistido
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

-- Mensagem de confirmação
SELECT 'Tabela video_history criada com sucesso!' as status; 