-- Cria a tabela de perfis
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  username text unique,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Habilita RLS (Row Level Security)
alter table public.profiles enable row level security;

-- Cria políticas de segurança para perfis
create policy "Perfis públicos podem ser visualizados por qualquer pessoa"
  on public.profiles for select
  using (true);

create policy "Usuários podem gerenciar seu próprio perfil"
  on public.profiles
  for all
  using (auth.uid() = id);

-- Cria uma função para lidar com novos usuários
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    -- Define como admin se o email terminar com @seu-dominio.com
    case when new.email like '%@seu-dominio.com' then 'admin' else 'user' end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Cria o trigger para a função de novo usuário
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Cria uma view para usuários admin
create or replace view public.admins as
  select * from public.profiles where role = 'admin';
