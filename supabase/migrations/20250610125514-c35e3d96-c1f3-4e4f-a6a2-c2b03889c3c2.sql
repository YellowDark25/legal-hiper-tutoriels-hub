
-- Criar tabela para tokens de convite
CREATE TABLE public.invite_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar colunas para preferências de tema na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Criar política RLS para invite_tokens (apenas admins podem ver/gerenciar)
ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invite tokens" 
  ON public.invite_tokens 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Atualizar políticas da tabela profiles para permitir atualizações de tema
CREATE POLICY "Users can update their own theme preference" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- Inserir o usuário mestre como admin (será criado quando fizer primeiro login)
-- Função para criar usuário admin automaticamente
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se o email for do usuário mestre, marcar como admin
  IF NEW.email = 'nexsyn@unidadelrv.com' THEN
    INSERT INTO public.profiles (id, full_name, is_admin)
    VALUES (NEW.id, 'Usuário Mestre', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  ELSE
    -- Para outros usuários, criar perfil normal
    INSERT INTO public.profiles (id, full_name, is_admin)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', false)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_admin_user();
