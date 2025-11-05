import 'dotenv/config';

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL || 'admin@casaluxe.stay';
const adminPassword = process.env.ADMIN_PASSWORD || 'spider';

if (!url) {
  console.error('VITE_SUPABASE_URL não definido. Configure no .env');
  process.exit(1);
}

if (!serviceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY não definido. Defina um secret fora do versionamento.');
  process.exit(1);
}

async function createAdmin() {
  const endpoint = `${url}/auth/v1/admin/users`;
  const payload = {
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { role: 'admin' },
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Falha ao criar usuário admin:', res.status, json?.error || json);
    process.exit(1);
  }

  console.log('Usuário admin criado com sucesso:', {
    id: json.id,
    email: json.email,
    role: json.user_metadata?.role,
  });
}

createAdmin().catch((e) => {
  console.error('Erro inesperado:', e);
  process.exit(1);
});