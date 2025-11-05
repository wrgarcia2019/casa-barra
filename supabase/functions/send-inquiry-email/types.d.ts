// Stubs para satisfazer o TypeScript/IDE fora do ambiente Deno.
// Não afetam a execução na Supabase Functions.

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve: (handler: (req: any) => any) => void;
};

declare module "npm:resend@0.17.2" {
  export class Resend {
    constructor(apiKey: string);
    emails: {
      send(payload: {
        from: string;
        to: string;
        subject: string;
        html: string;
        replyTo?: string;
      }): Promise<{ error?: { message: string } }>;
    };
  }
}