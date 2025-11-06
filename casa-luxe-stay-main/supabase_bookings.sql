-- Tabela de datas ocupadas (reservas/indisponibilidade)
create table if not exists public.booked_dates (
  date date primary key,
  created_at timestamptz not null default now(),
  created_by uuid
);

alter table public.booked_dates enable row level security;

-- Leitura pública: o site precisa saber quais datas estão ocupadas
drop policy if exists booked_dates_select_public on public.booked_dates;
create policy booked_dates_select_public
  on public.booked_dates
  for select
  to public
  using (true);

-- Escrita apenas para usuários autenticados (Admin)
drop policy if exists booked_dates_write_authenticated on public.booked_dates;
create policy booked_dates_write_authenticated
  on public.booked_dates
  for all
  to authenticated
  using (true)
  with check (true);

-- Índice auxiliar (opcional)
create index if not exists booked_dates_date_idx on public.booked_dates (date);

-- Observação: se você deseja armazenar períodos em vez de dias individuais,
-- pode usar uma tabela com (start_date, end_date) e expandir no backend.