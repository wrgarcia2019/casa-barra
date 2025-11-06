import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSettings } from "@/context/SettingsContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

// Datas reservadas vêm do contexto de configurações

const CalendarSection = () => {
  const { nightlyPrice, isBooked, cleaningFee, getNightlyPrice, selectedDates, setSelectedDates } = useSettings();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Bloqueia seleção em datas já ocupadas
    if (isBooked(date)) return;

    if (selectedDates.length === 0) {
      setSelectedDates([date]);
    } else if (selectedDates.length === 1) {
      const [firstDate] = selectedDates;
      if (date < firstDate) {
        setSelectedDates([date, firstDate]);
      } else {
        setSelectedDates([firstDate, date]);
      }
    } else {
      setSelectedDates([date]);
    }
  };

  const handleOpenInquiry = () => {
    if (selectedDates.length === 2) {
      setIsDialogOpen(true);
    }
  };

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "wrgarcia2003@gmail.com";

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone || selectedDates.length !== 2) {
      toast({ title: "Dados incompletos", description: "Preencha nome, e-mail, telefone e selecione check-in e check-out." });
      return;
    }

    // Alinhar com a tabela public.inquiries (start_date, end_date, notes)
    const payload = {
      name,
      email,
      phone,
      notes: message,
      start_date: selectedDates[0].toISOString(),
      end_date: selectedDates[1].toISOString(),
    };

    const { error: insertError } = await supabase.from("inquiries").insert(payload);
    if (insertError) {
      toast({ title: "Erro ao salvar", description: insertError.message });
      return;
    }

    // Preparar dados extras para o template de e-mail (diárias, valores e detalhamento)
    const days = calculateDays();
    const subtotal_brl = calculateTotal();
    const cleaning_fee_brl = typeof cleaningFee === 'number' ? cleaningFee : 0;
    const total_brl = subtotal_brl + cleaning_fee_brl;

    const price_breakdown = (() => {
      if (selectedDates.length !== 2) return [] as { date: string; price: number }[];
      const start = new Date(Date.UTC(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), selectedDates[0].getDate()));
      const end = new Date(Date.UTC(selectedDates[1].getFullYear(), selectedDates[1].getMonth(), selectedDates[1].getDate()));
      const rows: { date: string; price: number }[] = [];
      for (let d = start; d <= end; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
        rows.push({
          date: format(new Date(d), 'dd/MM/yyyy'),
          price: getNightlyPrice(new Date(d)),
        });
      }
      return rows;
    })();

    // Tenta invocar função Edge para enviar e-mail (configure no Supabase)
    try {
      if (!ADMIN_EMAIL) {
        throw new Error("ADMIN_EMAIL ausente. Configure VITE_ADMIN_EMAIL no .env.");
      }
      const { data, error: funcError } = await supabase.functions.invoke("send-inquiry-email", {
        body: {
          ...payload,
          admin_email: ADMIN_EMAIL,
          days,
          subtotal_brl,
          cleaning_fee_brl,
          total_brl,
          price_breakdown,
        },
      });
      if (funcError) throw funcError;
      if (data && data.sent === false) {
        throw new Error(data.error || "E-mail não enviado pela função.");
      }
    } catch (err: any) {
      const detail = typeof err?.message === "string" ? err.message : String(err);
      // Informar claramente que salvou, mas o e-mail falhou, com o motivo.
      toast({ title: "Solicitação registrada", description: "Mensagem salva. E-mail não enviado: " + detail });
      setIsDialogOpen(false);
      return;
    }

    toast({ title: "Solicitação enviada", description: `E-mail enviado para ${ADMIN_EMAIL}. Você receberá os valores em breve.` });
    setIsDialogOpen(false);
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  const calculateDays = () => {
    if (selectedDates.length === 2) {
      const start = new Date(Date.UTC(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), selectedDates[0].getDate()));
      const end = new Date(Date.UTC(selectedDates[1].getFullYear(), selectedDates[1].getMonth(), selectedDates[1].getDate()));
      const msPerDay = 24 * 60 * 60 * 1000;
      const diff = Math.floor((end.getTime() - start.getTime()) / msPerDay);
      return diff + 1; // diária: inclui o dia de checkout
    }
    return 0;
  };

  const calculateTotal = () => {
    if (selectedDates.length === 2) {
      const start = new Date(Date.UTC(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), selectedDates[0].getDate()));
      const end = new Date(Date.UTC(selectedDates[1].getFullYear(), selectedDates[1].getMonth(), selectedDates[1].getDate()));
      let sum = 0;
      for (let d = start; d <= end; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
        sum += getNightlyPrice(new Date(d));
      }
      return sum;
    }
    return 0;
  };

  return (
    <section id="calendar" className="py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
            <CalendarIcon className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Escolha Suas Datas
          </h2>
          <p className="text-xl text-muted-foreground">
            Escolha o período ideal para sua estadia.
          </p>
          <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
            Clique no dia do check-in e, em seguida, no dia do check-out. Para reiniciar, basta escolher outra data.
          </p>
          <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
            Este calendário é informativo: após selecionar as datas, você pode enviar seus dados para receber o valor e os detalhes por e-mail. A confirmação é feita pelo administrador.
          </p>
          {selectedDates.length > 0 && (
            <div className="mt-6 inline-flex items-center gap-3 bg-secondary rounded-lg px-4 py-2">
              {selectedDates.length === 1 ? (
                <span className="text-foreground">
                  Check-in: {format(selectedDates[0], "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} — selecione a data de check-out
                </span>
              ) : (
                <span className="text-foreground font-semibold">
                  {calculateDays()} diárias = {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotal())}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="card-elevated p-8">
              <Calendar
                mode="single"
                selected={selectedDates[0]}
                onSelect={handleDateSelect}
                locale={ptBR}
                disabled={(date) => date < new Date()}
                modifiers={{ booked: (date) => isBooked(date) }}
                modifiersClassNames={{ booked: "bg-booked text-booked-foreground" }}
                className="w-full"
              />
              
              <div className="flex flex-wrap gap-4 justify-center mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-accent"></div>
                  <span className="text-sm text-foreground">Livre</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-booked"></div>
                  <span className="text-sm text-foreground">Reservado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blocked"></div>
                  <span className="text-sm text-foreground">Bloqueado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="card-elevated p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4 text-foreground">Resumo da Reserva</h3>
              
              {selectedDates.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-secondary rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Check-in</p>
                    <p className="font-semibold text-foreground">
                      {format(selectedDates[0], "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  
                  {selectedDates.length === 2 && (
                    <>
                      <div className="bg-secondary rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Check-out</p>
                        <p className="font-semibold text-foreground">
                          {format(selectedDates[1], "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      
                      <div className="border-t border-border pt-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-muted-foreground">{calculateDays()} diárias</span>
                          <span className="font-semibold text-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotal())}</span>
                        </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Taxa de limpeza</span>
                        <span className="font-semibold text-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cleaningFee)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="font-bold text-foreground">Total</span>
                        <span className="font-bold text-xl text-foreground">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotal() + cleaningFee)}
                        </span>
                      </div>
                      </div>
                      
                      <button onClick={handleOpenInquiry} className="w-full gradient-ocean text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                        Verificar Disponibilidade
                      </button>
                    </>
                  )}
                  
                  {selectedDates.length === 1 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Selecione a data de check-out
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Selecione as datas para ver o valor total.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    O valor por diária pode variar conforme a data. A taxa de limpeza é adicionada ao total.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Preço padrão: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nightlyPrice)} / diária • Taxa de limpeza: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cleaningFee)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal de Solicitação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Solicitação de Consulta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitInquiry} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(xx) xxxxx-xxxx" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Mensagem</Label>
              <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escreva uma mensagem para o administrador (opcional)" className="w-full rounded-lg border border-input bg-card p-3 min-h-24" />
            </div>
            <div className="bg-secondary rounded-lg p-4 text-sm text-muted-foreground">
              <p>Datas selecionadas:</p>
              <ul className="list-disc ml-4">
                <li>{selectedDates[0] ? format(selectedDates[0], "dd/MM/yyyy") : "—"} (Check-in)</li>
                <li>{selectedDates[1] ? format(selectedDates[1], "dd/MM/yyyy") : "—"} (Check-out)</li>
              </ul>
            </div>
            <DialogFooter>
              <button type="button" className="bg-secondary px-4 py-2 rounded-md" onClick={() => setIsDialogOpen(false)}>Cancelar</button>
              <button type="submit" className="gradient-ocean text-white px-4 py-2 rounded-md">Enviar Email</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CalendarSection;
