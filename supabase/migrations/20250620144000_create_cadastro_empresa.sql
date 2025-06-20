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

-- Criar índice único para CNPJ
CREATE UNIQUE INDEX IF NOT EXISTS cadastro_empresa_cnpj_unique 
ON public.cadastro_empresa(cnpj);

-- Trigger para atualizar updated_at na tabela cadastro_empresa
CREATE TRIGGER update_cadastro_empresa_updated_at 
    BEFORE UPDATE ON public.cadastro_empresa 
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column(); 