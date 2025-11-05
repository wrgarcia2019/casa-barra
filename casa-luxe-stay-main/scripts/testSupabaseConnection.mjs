import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function run() {
  const start = new Date();
  const end = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('inquiries')
    .insert({
      name: 'Teste Conexão',
      email: 'teste@exemplo.com',
      phone: '000000000',
      start_date: fmt(start),
      end_date: fmt(end),
      notes: 'ping',
    })
    .select();

  if (error) {
    console.error('Erro ao inserir na tabela inquiries:', error.message);
    process.exit(1);
  }

  console.log('Conexão OK. Inserido com ID:', data?.[0]?.id);
}

run().catch((e) => {
  console.error('Erro inesperado:', e);
  process.exit(1);
});