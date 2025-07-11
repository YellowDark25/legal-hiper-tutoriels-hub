-- Primeiro, vamos verificar se o usuário mestre já existe e corrigir a configuração
-- Atualizar a função para garantir que o usuário mestre seja sempre marcado como admin
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
    ON CONFLICT (id) DO UPDATE SET 
      is_admin = true,
      full_name = 'Usuário Mestre';
  ELSE
    -- Para outros usuários, criar perfil normal
    INSERT INTO public.profiles (id, full_name, is_admin)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'), false)
    ON CONFLICT (id) DO UPDATE SET 
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', profiles.full_name);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Garantir que se o usuário mestre já existe, ele seja marcado como admin
UPDATE public.profiles 
SET is_admin = true, full_name = 'Usuário Mestre'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'nexsyn@unidadelrv.com'
);

-- Se não existir perfil para o usuário mestre, criar um
INSERT INTO public.profiles (id, full_name, is_admin)
SELECT id, 'Usuário Mestre', true
FROM auth.users 
WHERE email = 'nexsyn@unidadelrv.com'
AND id NOT IN (SELECT id FROM public.profiles);

-- Adicionar FK de comentarios.user_id para profiles.id
ALTER TABLE public.comentarios
ADD CONSTRAINT comentarios_user_id_profiles_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- Criar tabela cadastro_empresa para armazenar dados dos clientes
CREATE TABLE IF NOT EXISTS public.cadastro_empresa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cnpj TEXT NOT NULL UNIQUE,
  nome_fantasia TEXT NOT NULL,
  sistema TEXT NOT NULL CHECK (sistema IN ('pdvlegal', 'hiper')),
  cidade TEXT,
  estado TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela cadastro_empresa
ALTER TABLE public.cadastro_empresa ENABLE ROW LEVEL SECURITY;

-- Política para permitir que admins vejam todos os registros
CREATE POLICY "Admins can view all empresa registrations" 
  ON public.cadastro_empresa 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Política para permitir que usuários vejam apenas seus próprios registros
CREATE POLICY "Users can view their own empresa registration" 
  ON public.cadastro_empresa 
  FOR SELECT 
  USING (email = auth.jwt() ->> 'email');

-- Política para permitir inserções (cadastro)
CREATE POLICY "Anyone can insert empresa registration" 
  ON public.cadastro_empresa 
  FOR INSERT 
  WITH CHECK (true);

-- Política para permitir que admins atualizem registros
CREATE POLICY "Admins can update empresa registrations" 
  ON public.cadastro_empresa 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Política para permitir que admins excluam registros
CREATE POLICY "Admins can delete empresa registrations" 
  ON public.cadastro_empresa 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela cadastro_empresa
CREATE TRIGGER update_cadastro_empresa_updated_at 
    BEFORE UPDATE ON public.cadastro_empresa 
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
