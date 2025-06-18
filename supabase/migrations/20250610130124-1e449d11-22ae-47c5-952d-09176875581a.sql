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
