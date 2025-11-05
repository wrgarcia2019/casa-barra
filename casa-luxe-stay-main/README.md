# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/68303619-92b9-48db-ad3d-28782f2c583f

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/68303619-92b9-48db-ad3d-28782f2c583f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/68303619-92b9-48db-ad3d-28782f2c583f) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Casa Luxe Stay — Setup Supabase e Autenticação

- Ambiente
  - Crie um arquivo `.env` em `casa-luxe-stay-main/` com:
    - `VITE_SUPABASE_URL=<https://YOUR_PROJECT.supabase.co>`
    - `VITE_SUPABASE_ANON_KEY=<anon_public_key>`
    - `VITE_SUPABASE_BUCKET_HERO=hero`
    - `VITE_SUPABASE_BUCKET_GALLERY=gallery`
  - Opcional para scripts (NÃO versionar):
    - `SUPABASE_SERVICE_ROLE_KEY=<service_role_key>`
    - `ADMIN_EMAIL=admin@casaluxe.stay`
    - `ADMIN_PASSWORD=spider`

- Instalação
  - `npm install`

- Banco de Dados: Tabela de consultas
  - Rode o arquivo `supabase_schema.sql` no SQL do Supabase.
  - Cria `public.inquiries` com RLS:
    - `public` pode `insert` (para o formulário de consulta).
    - `authenticated` pode `select` (opcional para leitura no admin).

- Storage: Buckets e Políticas
  - Buckets:
    - `insert into storage.buckets (id,name,public) values ('hero','hero',true) on conflict (id) do nothing;`
    - `insert into storage.buckets (id,name,public) values ('gallery','gallery',true) on conflict (id) do nothing;`
  - Leitura pública:
    - `create policy "public read hero" on storage.objects for select to public using (bucket_id = 'hero');`
    - `create policy "public read gallery" on storage.objects for select to public using (bucket_id = 'gallery');`
  - Upload/remoção autenticados:
    - `create policy "auth insert hero" on storage.objects for insert to authenticated with check (bucket_id = 'hero');`
    - `create policy "auth delete own hero" on storage.objects for delete to authenticated using (bucket_id = 'hero' and owner = auth.uid());`
    - `create policy "auth insert gallery" on storage.objects for insert to authenticated with check (bucket_id = 'gallery');`
    - `create policy "auth delete own gallery" on storage.objects for delete to authenticated using (bucket_id = 'gallery' and owner = auth.uid());`

- Autenticação (Supabase Auth)
  - O app usa `supabase.auth.signInWithPassword(email, password)`.
  - O painel `/admin` exige que o usuário tenha `user_metadata.role = 'admin'`.
  - O login de admin fica em `/admin/login`.

- Criar usuário administrador
  - Requer `SUPABASE_SERVICE_ROLE_KEY` (defina localmente e NÃO versione).
  - `npm run supabase:create-admin`
  - Alternativa cURL:
    - `curl -X POST "https://<PROJECT>.supabase.co/auth/v1/admin/users" -H "Authorization: Bearer <SERVICE_ROLE_KEY>" -H "apikey: <SERVICE_ROLE_KEY>" -H "Content-Type: application/json" -d "{\"email\":\"admin@casaluxe.stay\",\"password\":\"spider\",\"email_confirm\":true,\"user_metadata\":{\"role\":\"admin\"}}"`

- Teste de conexão
  - `npm run supabase:test` (insere registro em `public.inquiries`).
  - Se ocorrer `Invalid API key`:
    - Verifique que `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` pertencem ao mesmo projeto (`ref` na chave deve bater com a URL).
    - Regere a `anon key` em Project Settings → API e atualize o `.env`.
    - Reinicie o dev server após mudanças no `.env`.

- Desenvolvimento
  - `npm run dev`
  - Acesse `http://localhost:5173/` ou a porta configurada.

- Função de e-mail de consulta (opcional)
  - Edge Function `send-inquiry-email` com Resend.
  - Configure `RESEND_API_KEY` como secret da função e `SUPABASE_URL`/`SUPABASE_ANON_KEY` na função, se necessário.
  - Deploy: `supabase functions deploy send-inquiry-email`.

- Notas
  - As credenciais `.env` já estão ignoradas no `.gitignore`.
  - Para persistir configurações de Hero/Galeria entre dispositivos, considere usar tabelas no Supabase em vez de `localStorage`.
