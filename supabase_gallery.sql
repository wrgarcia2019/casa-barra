-- Extensão necessária para gerar UUIDs
create extension if not exists pgcrypto;

-- ===============================
-- Storage: Bucket público para a Galeria
-- ===============================
insert into storage.buckets (id, name, public)
  values ('gallery', 'gallery', true)
  on conflict (id) do nothing;

-- Políticas de RLS para objetos do Storage (bucket 'gallery')
begin;
  drop policy if exists "public read gallery" on storage.objects;
  create policy "public read gallery"
    on storage.objects for select
    to public
    using (bucket_id = 'gallery');

  drop policy if exists "authenticated insert gallery" on storage.objects;
  create policy "authenticated insert gallery"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'gallery');

  drop policy if exists "authenticated update gallery" on storage.objects;
  create policy "authenticated update gallery"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'gallery')
    with check (bucket_id = 'gallery');

  drop policy if exists "authenticated delete gallery" on storage.objects;
  create policy "authenticated delete gallery"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'gallery');
commit;

-- ===============================
-- Tabela: public.gallery_items
-- ===============================
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  created_at timestamptz not null default now(),
  created_by uuid
);

-- Habilitar RLS
alter table public.gallery_items enable row level security;

-- Leitura pública (site consome sem login)
drop policy if exists "public can select gallery_items" on public.gallery_items;
create policy "public can select gallery_items"
  on public.gallery_items for select
  to public
  using (true);

-- Escrita apenas autenticada (via Admin)
drop policy if exists "authenticated can insert gallery_items" on public.gallery_items;
create policy "authenticated can insert gallery_items"
  on public.gallery_items for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update gallery_items" on public.gallery_items;
create policy "authenticated can update gallery_items"
  on public.gallery_items for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete gallery_items" on public.gallery_items;
create policy "authenticated can delete gallery_items"
  on public.gallery_items for delete
  to authenticated
  using (true);

-- Índice útil para ordenação por data
create index if not exists gallery_items_created_at_idx
  on public.gallery_items (created_at);

-- Exemplo de inserção (teste rápido):
-- insert into public.gallery_items (title, description, image_url) values
-- ('Sala de Estar', 'Espaço amplo com tv de 55 polegadas', 'https://<seu-projeto>.supabase.co/storage/v1/object/public/gallery/gallery/exemplo.jpg');