-- Tabela de regras de preço para dia, mês e semana
create table if not exists public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('day','month','week')),
  -- Para scope = 'day': usar specific_date
  specific_date date,
  -- Para scope = 'month' ou 'week': usar year/month e opcional week (1-5)
  year int,
  month int check (month between 1 and 12),
  week int check (week between 1 and 5),
  price numeric(10,2) not null,
  created_at timestamp with time zone default now(),
  created_by uuid
);

alter table public.pricing_rules enable row level security;

-- Política: leitura pública (o site precisa calcular preço sem login)
drop policy if exists pricing_rules_select_public on public.pricing_rules;
create policy pricing_rules_select_public
  on public.pricing_rules
  for select
  to public
  using (true);

-- Política: inserir/alterar/deletar apenas usuários autenticados
drop policy if exists pricing_rules_write_authenticated on public.pricing_rules;
create policy pricing_rules_write_authenticated
  on public.pricing_rules
  for all
  to authenticated
  using (true)
  with check (true);

-- Índices úteis para consultas por data
create index if not exists pricing_rules_scope_idx on public.pricing_rules (scope);
create index if not exists pricing_rules_specific_date_idx on public.pricing_rules (specific_date);
create index if not exists pricing_rules_year_month_week_idx on public.pricing_rules (year, month, week);

-- Exemplo de inserções:
-- 1) Preço para todo o mês de Outubro/2025
-- insert into public.pricing_rules (scope, year, month, price) values ('month', 2025, 10, 850.00);
-- 2) Preço para semana 2 de Outubro/2025
-- insert into public.pricing_rules (scope, year, month, week, price) values ('week', 2025, 10, 2, 920.00);
-- 3) Preço para dia específico (2025-10-12)
-- insert into public.pricing_rules (scope, specific_date, price) values ('day', '2025-10-12', 1100.00);