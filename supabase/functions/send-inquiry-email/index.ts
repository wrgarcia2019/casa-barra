// deno-lint-ignore-file
/// <reference path="./types.d.ts" />
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
      // Extras para template
      days,
      subtotal_brl,
      cleaning_fee_brl,
      total_brl,
      price_breakdown,
    } = body || {};

    const toEmail = admin_email || Deno.env.get("ADMIN_EMAIL");
    if (!toEmail) {
      return new Response(JSON.stringify({ error: "ADMIN_EMAIL não definido" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const subject = "Nova solicitação de disponibilidade - Casa da Barra";

    const fmtBRL = (v: number | undefined) => {
      if (typeof v !== 'number') return '—';
      try {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
      } catch {
        return String(v);
      }
    };

    const safe = (s: string | undefined) => String(s || '—');

    const breakdownRows = Array.isArray(price_breakdown) && price_breakdown.length
      ? price_breakdown.map((row: any) => {
          const d = row?.date || '—';
          const p = typeof row?.price === 'number' ? fmtBRL(row.price) : '—';
          return `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee;color:#111">${d}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;color:#111">${p}</td>
          </tr>`;
        }).join('')
      : '';

    const html = `<!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="x-ua-compatible" content="ie=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Solicitação de disponibilidade</title>
    </head>
    <body style="margin:0;padding:0;background:#f6f8fb;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f8fb">
        <tr>
          <td align="center" style="padding:24px">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eaecef">
              <tr>
                <td style="background:linear-gradient(135deg,#0ea5e9,#60a5fa);color:#ffffff;padding:24px">
                  <h1 style="margin:0;font-size:20px">Casa da Barra</h1>
                  <p style="margin:4px 0 0 0;font-size:14px">Nova solicitação de disponibilidade</p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px">
                  <h2 style="margin:0 0 12px 0;font-size:18px;color:#111">Dados do cliente</h2>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
                    <tr>
                      <td style="padding:8px;color:#555;width:160px">Nome</td>
                      <td style="padding:8px;color:#111">${safe(name)}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px;color:#555;width:160px">E-mail</td>
                      <td style="padding:8px;color:#111">${safe(email)}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px;color:#555;width:160px">Telefone</td>
                      <td style="padding:8px;color:#111">${safe(phone)}</td>
                    </tr>
                  </table>

                  <h2 style="margin:16px 0 12px 0;font-size:18px;color:#111">Período</h2>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
                    <tr>
                      <td style="padding:8px;color:#555;width:160px">Check-in</td>
                      <td style="padding:8px;color:#111">${safe(start_date)}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px;color:#555;width:160px">Check-out</td>
                      <td style="padding:8px;color:#111">${safe(end_date)}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px;color:#555;width:160px">Diárias</td>
                      <td style="padding:8px;color:#111">${typeof days === 'number' ? String(days) : '—'}</td>
                    </tr>
                  </table>

                  <h2 style="margin:16px 0 12px 0;font-size:18px;color:#111">Resumo</h2>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
                    <tr>
                      <td style="padding:8px;color:#555;width:160px">Subtotal</td>
                      <td style="padding:8px;color:#111;text-align:right">${fmtBRL(subtotal_brl)}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px;color:#555;width:160px">Taxa de limpeza</td>
                      <td style="padding:8px;color:#111;text-align:right">${fmtBRL(cleaning_fee_brl)}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px;color:#111;font-weight:600;width:160px;border-top:1px solid #eee">Total</td>
                      <td style="padding:8px;color:#111;text-align:right;font-weight:700;border-top:1px solid #eee">${fmtBRL(total_brl)}</td>
                    </tr>
                  </table>

                  ${breakdownRows ? `
                    <h2 style="margin:16px 0 12px 0;font-size:18px;color:#111">Detalhamento por dia</h2>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
                      <thead>
                        <tr>
                          <th align="left" style="padding:8px;border-bottom:2px solid #eaecef;color:#555;font-size:12px;text-transform:uppercase">Data</th>
                          <th align="right" style="padding:8px;border-bottom:2px solid #eaecef;color:#555;font-size:12px;text-transform:uppercase">Preço</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${breakdownRows}
                      </tbody>
                    </table>
                  ` : ''}

                  ${notes ? `
                  <h2 style="margin:16px 0 12px 0;font-size:18px;color:#111">Mensagem do cliente</h2>
                  <div style="padding:12px;background:#f8fafc;border:1px solid #eaecef;border-radius:8px;color:#111;line-height:1.5">${String(notes).replace(/\n/g, '<br/>')}</div>
                  ` : ''}
                </td>
              </tr>
              <tr>
                <td style="background:#f8fafc;color:#555;padding:16px;text-align:center;font-size:12px">© ${new Date().getFullYear()} Casa da Barra</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`;

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