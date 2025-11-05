-- Habilite a extensão pgcrypto para usar gen_random_uuid()
create extension if not exists pgcrypto;

-- Tabela para registrar solicitações de estadia (sem reservar)
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  start_date date not null,
  end_date date not null,
  notes text
);

-- RLS: permitir INSERT anônimo (público) e negar leitura
alter table public.inquiries enable row level security;
drop policy if exists "anon can insert inquiries" on public.inquiries;
create policy "anon can insert inquiries"
  on public.inquiries for insert
  to public
  with check (true);

-- Opcional: permitir leitura apenas para role authenticated
drop policy if exists "authenticated can select inquiries" on public.inquiries;
create policy "authenticated can select inquiries"
  on public.inquiries for select
  to authenticated
  using (true);

-- Buckets de storage sugeridos:
-- hero (público) para imagem da capa
-- gallery (público) para imagens da galeria
-- Configure como públicos no Storage e use getPublicUrl para exibição

-- ===============================
-- Conteúdo do site: Hero e Galeria
-- ===============================

-- Tabela para configurações da capa (Hero)
create table if not exists public.hero_settings (
  id text primary key,
  title text,
  subtitle text,
  image_url text,
  updated_at timestamptz not null default now()
);

alter table public.hero_settings enable row level security;
drop policy if exists "public can select hero_settings" on public.hero_settings;
create policy "public can select hero_settings"
  on public.hero_settings for select
  to public
  using (true);

drop policy if exists "authenticated can upsert hero_settings" on public.hero_settings;
create policy "authenticated can upsert hero_settings"
  on public.hero_settings for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update hero_settings" on public.hero_settings;
create policy "authenticated can update hero_settings"
  on public.hero_settings for update
  to authenticated
  using (true)
  with check (true);

-- Tabela para itens da galeria
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  created_at timestamptz not null default now()
);

alter table public.gallery_items enable row level security;
drop policy if exists "public can select gallery_items" on public.gallery_items;
create policy "public can select gallery_items"
  on public.gallery_items for select
  to public
  using (true);

drop policy if exists "authenticated can insert gallery_items" on public.gallery_items;
create policy "authenticated can insert gallery_items"
  on public.gallery_items for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can delete gallery_items" on public.gallery_items;
create policy "authenticated can delete gallery_items"
  on public.gallery_items for delete
  to authenticated
  using (true);

-- Insere uma configuração inicial do Hero se não existir
insert into public.hero_settings (id, title, subtitle, image_url)
  values ('default', 'Seu Refúgio à Beira-Mar', 'Desperte com o som das ondas e relaxe em Itapoá', null)
  on conflict (id) do nothing;