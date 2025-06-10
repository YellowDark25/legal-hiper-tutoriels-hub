-- Adiciona coluna para rastrear convites
create table public.invites (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  used_at timestamp with time zone,
  token text not null unique
);

-- Habilita RLS para a tabela de convites
alter table public.invites enable row level security;

-- Políticas de segurança para convites
create policy "Administradores podem gerenciar convites"
  on public.invites
  for all
  using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- Função para verificar se um convite é válido
create or replace function public.is_valid_invite(invite_token text)
returns boolean as $$
begin
  return exists (
    select 1 from public.invites 
    where token = invite_token 
    and used_at is null
    and created_at > (now() - interval '7 days')
  );
end;
$$ language plpgsql security definer;

-- Função para usar um convite
create or replace function public.use_invite(invite_token text, user_email text)
returns void as $$
begin
  update public.invites
  set used_at = now()
  where token = invite_token
  and email = user_email
  and used_at is null;
end;
$$ language plpgsql security definer;

-- Atualiza a função de novo usuário para verificar convites
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  -- Verifica se há um convite válido para este email
  if exists (select 1 from public.invites where email = new.email and used_at is null) then
    -- Usa o convite
    perform public.use_invite((select token from public.invites where email = new.email limit 1), new.email);
    
    -- Cria o perfil com a role do convite
    insert into public.profiles (id, full_name, username, role)
    values (
      new.id, 
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'username',
      (select role from public.invites where email = new.email and used_at is not null order by used_at desc limit 1)
    );
  else
    -- Se não houver convite, cria como usuário normal
    insert into public.profiles (id, full_name, username, role)
    values (
      new.id, 
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'username',
      'user'
    );
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Cria o usuário mestre se não existir
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000000',
  'nexsyn@unidadelrv.com',
  crypt('Nexsyn@2025', gen_salt('bf')),
  now(),
  now(),
  now()
)
on conflict (email) do nothing;

-- Garante que o usuário mestre seja admin
insert into public.profiles (id, full_name, username, role)
values (
  '00000000-0000-0000-0000-000000000000',
  'Administrador Mestre',
  'admin_master',
  'admin'
)
on conflict (id) do update set role = 'admin';

-- Cria uma função para convidar novos usuários
create or replace function public.invite_user(email text, user_role text default 'user')
returns text as $$
declare
  invite_token text;
begin
  -- Verifica se o usuário atual é admin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Apenas administradores podem convidar usuários';
  end if;
  
  -- Gera um token único
  invite_token := encode(gen_random_bytes(32), 'hex');
  
  -- Insere o convite
  insert into public.invites (email, role, created_by, token)
  values (email, user_role, auth.uid(), invite_token);
  
  -- Retorna a URL de convite
  return 'http://localhost:5173/signup?invite=' || invite_token;
end;
$$ language plpgsql security definer;
