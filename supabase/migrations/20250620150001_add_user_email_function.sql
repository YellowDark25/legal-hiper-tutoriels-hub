-- Função para buscar comentários com email do usuário
CREATE OR REPLACE FUNCTION get_comments_with_emails(video_id_param TEXT)
RETURNS TABLE (
    id UUID,
    conteudo TEXT,
    created_at TIMESTAMPTZ,
    user_id UUID,
    parent_id UUID,
    video_id TEXT,
    user_email TEXT,
    user_full_name TEXT,
    user_username TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        c.id,
        c.conteudo,
        c.created_at,
        c.user_id,
        c.parent_id,
        c.video_id,
        au.email as user_email,
        p.full_name as user_full_name,
        p.username as user_username
    FROM comentarios c
    LEFT JOIN auth.users au ON c.user_id = au.id
    LEFT JOIN profiles p ON c.user_id = p.id
    WHERE c.video_id = video_id_param
    ORDER BY c.created_at ASC;
$$;

-- Permitir que usuários autenticados executem esta função
GRANT EXECUTE ON FUNCTION get_comments_with_emails(TEXT) TO authenticated;

-- Nova função para buscar comentários com dados da empresa
CREATE OR REPLACE FUNCTION get_comments_with_empresa(video_id_param TEXT)
RETURNS TABLE (
    id UUID,
    conteudo TEXT,
    created_at TIMESTAMPTZ,
    user_id UUID,
    parent_id UUID,
    video_id TEXT,
    user_email TEXT,
    user_full_name TEXT,
    user_username TEXT,
    empresa_nome_fantasia TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        c.id,
        c.conteudo,
        c.created_at,
        c.user_id,
        c.parent_id,
        c.video_id,
        au.email as user_email,
        p.full_name as user_full_name,
        p.username as user_username,
        ce.nome_fantasia as empresa_nome_fantasia
    FROM comentarios c
    LEFT JOIN auth.users au ON c.user_id = au.id
    LEFT JOIN profiles p ON c.user_id = p.id
    LEFT JOIN cadastro_empresa ce ON ce.email = au.email
    WHERE c.video_id = video_id_param
    ORDER BY c.created_at ASC;
$$;

-- Permitir que usuários autenticados executem esta função
GRANT EXECUTE ON FUNCTION get_comments_with_empresa(TEXT) TO authenticated; 