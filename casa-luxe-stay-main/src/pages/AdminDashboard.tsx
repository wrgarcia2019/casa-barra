import { useSettings } from "@/context/SettingsContext";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const AdminDashboard = () => {
  const { nightlyPrice, setNightlyPrice, bookedDates, isBooked, cleaningFee, setCleaningFee, addBookedRange, removeBookedRange, heroTitle, setHeroTitle, heroSubtitle, setHeroSubtitle, heroImageUrl, setHeroImageUrl, galleryItems, setGalleryItems } = useSettings();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tempPrice, setTempPrice] = useState(nightlyPrice);
  const [tempCleaning, setTempCleaning] = useState(cleaningFee);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [tempHeroTitle, setTempHeroTitle] = useState(heroTitle);
  const [tempHeroSubtitle, setTempHeroSubtitle] = useState(heroSubtitle);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  // Fila de uploads pendentes com edição por imagem
  const [pendingUploads, setPendingUploads] = useState<{ file: File; previewUrl: string; title: string; description: string }[]>([]);
  // Pricing rules state
  const [ruleScope, setRuleScope] = useState<'day'|'month'|'week'>('month');
  const [ruleYear, setRuleYear] = useState<number>(new Date().getFullYear());
  const [ruleMonth, setRuleMonth] = useState<number>(new Date().getMonth() + 1);
  const [ruleWeek, setRuleWeek] = useState<number>(1);
  const [ruleDate, setRuleDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [rulePrice, setRulePrice] = useState<number>(nightlyPrice);
  const [rules, setRules] = useState<any[]>([]);
  // Editar regra existente
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editYear, setEditYear] = useState<number>(new Date().getFullYear());
  const [editMonth, setEditMonth] = useState<number>(new Date().getMonth() + 1);
  const [editWeek, setEditWeek] = useState<number>(1);
  const [editDate, setEditDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [editPrice, setEditPrice] = useState<number>(nightlyPrice);

  const sortedBooked = useMemo(() => bookedDates.slice().sort(), [bookedDates]);

  // Load pricing rules on mount
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('pricing_rules').select('id,scope,specific_date,year,month,week,price');
      setRules(data || []);
    })();
  }, []);

  const savePrice = () => {
    setNightlyPrice(tempPrice);
    toast({ title: "Preço atualizado", description: `${currency.format(tempPrice)} por noite` });
  };

  const saveCleaning = () => {
    setCleaningFee(tempCleaning);
    toast({ title: "Taxa de limpeza atualizada", description: `${currency.format(tempCleaning)}` });
  };

  const markRangeBooked = () => {
    if (!range?.from || !range?.to) return;
    addBookedRange(range.from, range.to);
    toast({ title: "Intervalo marcado como ocupado", description: `${format(range.from, "dd/MM/yyyy")} – ${format(range.to, "dd/MM/yyyy")}` });
  };

  const unmarkRangeBooked = () => {
    if (!range?.from || !range?.to) return;
    removeBookedRange(range.from, range.to);
    toast({ title: "Intervalo liberado", description: `${format(range.from, "dd/MM/yyyy")} – ${format(range.to, "dd/MM/yyyy")}` });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Painel do Administrador</h1>
          <button onClick={handleLogout} className="text-sm text-muted-foreground underline">Sair</button>
        </div>

        {/* Preço */}
        <div className="card-elevated p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Preço por noite</h2>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min={0}
              step={10}
              value={tempPrice}
              onChange={(e) => setTempPrice(Number(e.target.value))}
              className="w-48 rounded-lg border border-input bg-card p-3"
            />
            <span className="text-muted-foreground">Atual: {currency.format(nightlyPrice)}</span>
            <button onClick={savePrice} className="gradient-ocean text-white px-4 py-2 rounded-lg font-semibold">
              Salvar
            </button>
          </div>
        </div>

        {/* Taxa de limpeza */}
        <div className="card-elevated p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Taxa de limpeza</h2>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min={0}
              step={10}
              value={tempCleaning}
              onChange={(e) => setTempCleaning(Number(e.target.value))}
              className="w-48 rounded-lg border border-input bg-card p-3"
            />
            <span className="text-muted-foreground">Atual: {currency.format(cleaningFee)}</span>
            <button onClick={saveCleaning} className="gradient-ocean text-white px-4 py-2 rounded-lg font-semibold">
              Salvar
            </button>
          </div>
        </div>

        {/* Ocupação */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card-elevated p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Marcar intervalo de datas ocupadas</h2>
            <Calendar
              mode="range"
              selected={range}
              onSelect={(r) => setRange(r || undefined)}
              locale={ptBR}
              disabled={(date) => date < new Date()}
              modifiers={{ booked: (date) => isBooked(date) }}
              modifiersClassNames={{ booked: "bg-booked text-booked-foreground" }}
              className="w-full"
            />
            <div className="flex items-center gap-3 mt-4">
              <button onClick={markRangeBooked} className="gradient-ocean text-white px-3 py-2 rounded-md">Marcar ocupado</button>
              <button onClick={unmarkRangeBooked} className="bg-secondary px-3 py-2 rounded-md">Liberar</button>
              <span className="text-sm text-muted-foreground">
                Selecione início e fim para aplicar ao intervalo.
              </span>
            </div>
          </div>
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Datas ocupadas</h3>
            {sortedBooked.length ? (
              <ul className="space-y-2">
                {sortedBooked.map((iso) => (
                  <li key={iso} className="text-sm text-muted-foreground">
                    {format(new Date(iso), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma data ocupada.</p>
            )}
          </div>
        </div>
        {/* Capa / Hero */}
        <div className="card-elevated p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Capa do site (Hero)</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">Título</label>
              <input value={tempHeroTitle} onChange={(e) => setTempHeroTitle(e.target.value)} className="w-full rounded-lg border border-input bg-card p-3" />
              <label className="text-sm text-muted-foreground">Subtítulo</label>
              <input value={tempHeroSubtitle} onChange={(e) => setTempHeroSubtitle(e.target.value)} className="w-full rounded-lg border border-input bg-card p-3" />
              <div className="flex items-center gap-3 mt-2">
                <button onClick={() => { setHeroTitle(tempHeroTitle); setHeroSubtitle(tempHeroSubtitle); toast({ title: "Texto salvo" }); }} className="gradient-ocean text-white px-4 py-2 rounded-lg font-semibold">Salvar texto</button>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">Imagem da capa</label>
              <div className="flex items-center gap-3">
                <input id="hero-file-input" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const bucket = import.meta.env.VITE_SUPABASE_BUCKET_HERO || "hero";
                  const filePath = `hero/${Date.now()}-${file.name}`;
                  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
                  if (uploadError) { toast({ title: "Falha no upload", description: uploadError.message }); return; }
                  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
                  setHeroImageUrl(data.publicUrl);
                  toast({ title: "Imagem atualizada" });
                }} />
                <button onClick={() => document.getElementById('hero-file-input')?.click()} className="bg-secondary px-3 py-2 rounded-md">Selecionar imagem</button>
                {heroImageUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={heroImageUrl} alt="Hero atual" className="w-20 h-16 object-cover rounded" />
                    <div className="flex items-center gap-2">
                      <button onClick={() => document.getElementById('hero-file-input')?.click()} className="gradient-ocean text-white px-3 py-2 rounded-md">Substituir</button>
                      <button
                        onClick={async () => {
                          try {
                            const bucket = import.meta.env.VITE_SUPABASE_BUCKET_HERO || "hero";
                            const url = heroImageUrl as string;
                            const bucketPrefix = `/storage/v1/object/public/${bucket}/`;
                            const idx = url.indexOf(bucketPrefix);
                            const path = idx !== -1 ? url.substring(idx + bucketPrefix.length) : '';
                            if (path) {
                              const { error } = await supabase.storage.from(bucket).remove([path]);
                              if (error) {
                                toast({ title: "Falha ao deletar", description: error.message });
                              } else {
                                await setHeroImageUrl(null);
                                toast({ title: "Imagem removida" });
                              }
                            } else {
                              await setHeroImageUrl(null);
                              toast({ title: "Imagem removida localmente" });
                            }
                          } catch (err: any) {
                            toast({ title: "Erro", description: err?.message || 'Erro ao remover imagem' });
                          }
                        }}
                        className="bg-destructive text-destructive-foreground px-3 py-2 rounded-md"
                      >
                        Deletar
                      </button>
                      <a href={heroImageUrl} target="_blank" className="text-sm underline">Ver</a>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Usando imagem padrão</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Galeria */}
        <div className="card-elevated p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Galeria</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">Título do item</label>
              <input value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)} className="w-full rounded-lg border border-input bg-card p-3" />
              <label className="text-sm text-muted-foreground">Descrição do item</label>
              <input value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} className="w-full rounded-lg border border-input bg-card p-3" />
              <label className="text-sm text-muted-foreground">Imagens (até 15)</label>
              <input multiple type="file" accept="image/*" onChange={(e) => {
                const files = Array.from(e.target.files || []).slice(0, 15);
                if (!files.length) return;
                const queue = files.map((file) => ({
                  file,
                  previewUrl: URL.createObjectURL(file),
                  title: newItemTitle || file.name,
                  description: newItemDesc || "",
                }));
                setPendingUploads((prev) => [...prev, ...queue]);
                setNewItemTitle("");
                setNewItemDesc("");
                toast({ title: "Imagens adicionadas à fila", description: `${files.length} selecionadas. Edite títulos e descrições abaixo.` });
              }} />

              {pendingUploads.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">Itens na fila ({pendingUploads.length})</h4>
                    <div className="flex gap-2">
                      <button
                        className="bg-secondary px-3 py-1 rounded-md text-sm"
                        onClick={() => {
                          pendingUploads.forEach((u) => URL.revokeObjectURL(u.previewUrl));
                          setPendingUploads([]);
                          toast({ title: "Fila limpa" });
                        }}
                      >Limpar</button>
                      <button
                        className="gradient-ocean text-white px-3 py-1 rounded-md text-sm"
                        onClick={async () => {
                          const bucket = import.meta.env.VITE_SUPABASE_BUCKET_GALLERY || "gallery";
                          let success = 0;
                          const added: { imageUrl: string; title: string; description: string }[] = [];
                          for (const item of pendingUploads) {
                            const filePath = `gallery/${Date.now()}-${item.file.name}`;
                            const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, item.file, { upsert: true });
                            if (uploadError) {
                              toast({ title: "Falha no upload", description: `${item.file.name}: ${uploadError.message}` });
                              continue;
                            }
                            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
                            added.push({ imageUrl: data.publicUrl, title: item.title || item.file.name, description: item.description || "" });
                            success++;
                          }
                          if (added.length) {
                            const next = [...galleryItems, ...added];
                            await setGalleryItems(next);
                          }
                          pendingUploads.forEach((u) => URL.revokeObjectURL(u.previewUrl));
                          setPendingUploads([]);
                          toast({ title: `Upload concluído`, description: `${success} de ${pendingUploads.length} imagens adicionadas` });
                        }}
                      >Enviar itens</button>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {pendingUploads.map((u, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <img src={u.previewUrl} alt={u.title} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <input
                            className="rounded-lg border border-input bg-card p-2 text-sm"
                            value={u.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPendingUploads((prev) => prev.map((it, i) => i === idx ? { ...it, title: val } : it));
                            }}
                            placeholder="Título"
                          />
                          <input
                            className="rounded-lg border border-input bg-card p-2 text-sm"
                            value={u.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPendingUploads((prev) => prev.map((it, i) => i === idx ? { ...it, description: val } : it));
                            }}
                            placeholder="Descrição"
                          />
                        </div>
                        <button
                          className="bg-secondary px-3 py-1 rounded-md text-sm"
                          onClick={() => {
                            URL.revokeObjectURL(u.previewUrl);
                            setPendingUploads((prev) => prev.filter((_, i) => i !== idx));
                          }}
                        >Remover</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Itens atuais</h3>
              {galleryItems.length ? (
                <ul className="space-y-3">
                  {galleryItems?.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <button onClick={() => {
                        const next = galleryItems.filter((_, i) => i !== idx);
                        setGalleryItems(next);
                        toast({ title: "Item removido" });
                      }} className="bg-secondary px-3 py-1 rounded-md text-sm">Remover</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum item configurado. A galeria usará os itens padrão.</p>
              )}
            </div>
          </div>
        </div>

        {/* Regras de Preço */}
        <div className="card-elevated p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Regras de Preço</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">Escopo</label>
              <select value={ruleScope} onChange={(e) => setRuleScope(e.target.value as any)} className="w-full rounded-lg border border-input bg-card p-3">
                <option value="month">Mês</option>
                <option value="week">Semana do mês</option>
                <option value="day">Dia específico</option>
              </select>
              {ruleScope !== 'day' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Ano</label>
                    <input type="number" value={ruleYear} onChange={(e) => setRuleYear(Number(e.target.value))} className="w-full rounded-lg border border-input bg-card p-3" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Mês (1-12)</label>
                    <input type="number" min={1} max={12} value={ruleMonth} onChange={(e) => setRuleMonth(Number(e.target.value))} className="w-full rounded-lg border border-input bg-card p-3" />
                  </div>
                </div>
              )}
              {ruleScope === 'week' && (
                <div>
                  <label className="text-sm text-muted-foreground">Semana (1-5)</label>
                  <input type="number" min={1} max={5} value={ruleWeek} onChange={(e) => setRuleWeek(Number(e.target.value))} className="w-full rounded-lg border border-input bg-card p-3" />
                </div>
              )}
              {ruleScope === 'day' && (
                <div>
                  <label className="text-sm text-muted-foreground">Data</label>
                  <input type="date" value={ruleDate} onChange={(e) => setRuleDate(e.target.value)} className="w-full rounded-lg border border-input bg-card p-3" />
                </div>
              )}
              <label className="text-sm text-muted-foreground">Preço (BRL)</label>
              <input type="number" value={rulePrice} onChange={(e) => setRulePrice(Number(e.target.value))} className="w-full rounded-lg border border-input bg-card p-3" />
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={async () => {
                    const payload: any = { scope: ruleScope, price: rulePrice };
                    if (ruleScope === 'day') payload.specific_date = ruleDate;
                    if (ruleScope === 'month' || ruleScope === 'week') { payload.year = ruleYear; payload.month = ruleMonth; }
                    if (ruleScope === 'week') payload.week = ruleWeek;
                    const { error } = await supabase.from('pricing_rules').insert(payload);
                    if (error) { toast({ title: 'Erro ao salvar regra', description: error.message }); return; }
                    toast({ title: 'Regra salva' });
                    const { data } = await supabase.from('pricing_rules').select('id,scope,specific_date,year,month,week,price');
                    setRules(data || []);
                  }}
                  className="gradient-ocean text-white px-4 py-2 rounded-lg font-semibold"
                >Salvar regra</button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Regras atuais</h3>
              {rules.length ? (
                <ul className="space-y-3">
                  {rules.map((r) => (
                    <li key={r.id} className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-foreground">
                          {r.scope === 'day' ? `Dia ${r.specific_date}` : r.scope === 'week' ? `Semana ${r.week}/Mês ${r.month}/${r.year}` : `Mês ${r.month}/${r.year}`}
                        </span>
                        <span className="text-muted-foreground">— {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(r.price))}</span>
                        <button
                          onClick={() => {
                            setEditingRuleId(r.id);
                            setEditPrice(Number(r.price));
                            setEditYear(r.year || new Date().getFullYear());
                            setEditMonth(r.month || (new Date().getMonth() + 1));
                            setEditWeek(r.week || 1);
                            setEditDate(r.specific_date || new Date().toISOString().slice(0,10));
                          }}
                          className="gradient-ocean text-white px-3 py-1 rounded-md text-sm"
                        >Editar</button>
                        <button
                          onClick={async () => {
                            const { error } = await supabase.from('pricing_rules').delete().eq('id', r.id);
                            if (error) { toast({ title: 'Erro ao remover', description: error.message }); return; }
                            setRules((prev) => prev.filter((x) => x.id !== r.id));
                            toast({ title: 'Regra removida' });
                          }}
                          className="bg-secondary px-3 py-1 rounded-md text-sm"
                        >Remover</button>
                      </div>
                      {editingRuleId === r.id && (
                        <div className="grid md:grid-cols-2 gap-3 text-sm bg-card p-3 rounded-md border border-input">
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Escopo: {r.scope}</p>
                            {r.scope !== 'day' && (
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-xs text-muted-foreground">Ano</label>
                                  <input type="number" value={editYear} onChange={(e) => setEditYear(Number(e.target.value))} className="w-full rounded-lg border border-input bg-background p-2" />
                                </div>
                                <div>
                                  <label className="text-xs text-muted-foreground">Mês (1-12)</label>
                                  <input type="number" min={1} max={12} value={editMonth} onChange={(e) => setEditMonth(Number(e.target.value))} className="w-full rounded-lg border border-input bg-background p-2" />
                                </div>
                              </div>
                            )}
                            {r.scope === 'week' && (
                              <div>
                                <label className="text-xs text-muted-foreground">Semana (1-5)</label>
                                <input type="number" min={1} max={5} value={editWeek} onChange={(e) => setEditWeek(Number(e.target.value))} className="w-full rounded-lg border border-input bg-background p-2" />
                              </div>
                            )}
                            {r.scope === 'day' && (
                              <div>
                                <label className="text-xs text-muted-foreground">Data</label>
                                <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full rounded-lg border border-input bg-background p-2" />
                              </div>
                            )}
                            <label className="text-xs text-muted-foreground">Preço (BRL)</label>
                            <input type="number" value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} className="w-full rounded-lg border border-input bg-background p-2" />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                const payload: any = { price: editPrice };
                                if (r.scope === 'day') payload.specific_date = editDate;
                                if (r.scope === 'month' || r.scope === 'week') { payload.year = editYear; payload.month = editMonth; }
                                if (r.scope === 'week') payload.week = editWeek;
                                const { error } = await supabase.from('pricing_rules').update(payload).eq('id', r.id);
                                if (error) { toast({ title: 'Erro ao atualizar', description: error.message }); return; }
                                toast({ title: 'Regra atualizada' });
                                const { data } = await supabase.from('pricing_rules').select('id,scope,specific_date,year,month,week,price');
                                setRules(data || []);
                                setEditingRuleId(null);
                              }}
                              className="gradient-ocean text-white px-3 py-2 rounded-md"
                            >Salvar</button>
                            <button
                              onClick={() => setEditingRuleId(null)}
                              className="bg-secondary px-3 py-2 rounded-md"
                            >Cancelar</button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma regra configurada.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;