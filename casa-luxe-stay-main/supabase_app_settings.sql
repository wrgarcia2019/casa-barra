-- Tabela de configurações padrão (preço por noite e taxa de limpeza)
create table if not exists public.app_settings (
  id text primary key,
  nightly_price numeric(10,2),
  cleaning_fee numeric(10,2),
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- Leitura pública (site precisa exibir valores padrão)
drop policy if exists app_settings_select_public on public.app_settings;
create policy app_settings_select_public
  on public.app_settings
  for select
  to public
  using (true);

-- Escrita (upsert) somente autenticados (Admin)
drop policy if exists app_settings_write_authenticated on public.app_settings;
create policy app_settings_write_authenticated
  on public.app_settings
  for all
  to authenticated
  using (true)
  with check (true);

-- Semente inicial (linha 'default')
insert into public.app_settings (id, nightly_price, cleaning_fee)
  values ('default', 1000.00, 200.00)
on conflict (id) do nothing;

-- Índices (opcional)
create index if not exists app_settings_updated_at_idx on public.app_settings (updated_at);