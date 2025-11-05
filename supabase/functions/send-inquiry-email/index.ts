// deno-lint-ignore-file
import { Resend } from "npm:resend@0.17.2";

// Cabeçalhos CORS (em dev, "*" é aceitável; em prod use seu domínio)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // ex.: "http://localhost:8080"
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: any) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY não definido" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resend = new Resend(apiKey);
    const body = await req.json();
    const {
      name,
      email,
      phone,
      notes,
      start_date,
      end_date,
      admin_email,
    } = body || {};

    const toEmail = admin_email || Deno.env.get("ADMIN_EMAIL");
    if (!toEmail) {
      return new Response(JSON.stringify({ error: "ADMIN_EMAIL não definido" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const subject = "Nova solicitação de disponibilidade - Casa da Barra";
    const html = `
      <h2>Nova solicitação de disponibilidade</h2>
      <p><strong>Nome:</strong> ${name || "—"}</p>
      <p><strong>E-mail:</strong> ${email || "—"}</p>
      <p><strong>Telefone:</strong> ${phone || "—"}</p>
      <p><strong>Check-in:</strong> ${start_date || "—"}</p>
      <p><strong>Check-out:</strong> ${end_date || "—"}</p>
      <p><strong>Mensagem:</strong><br/>${(notes || "").replace(/\n/g, "<br/>")}</p>
    `;

    const { error } = await resend.emails.send({
      from: "Casa da Barra <onboarding@resend.dev>",
      to: toEmail,
      replyTo: email || undefined,
      subject,
      html,
    });

    if (error) {
      return new Response(JSON.stringify({ sent: false, error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ sent: true, to: toEmail }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});