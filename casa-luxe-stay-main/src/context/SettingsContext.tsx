import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type GalleryItem = {
  imageUrl: string;
  title: string;
  description: string;
};

type PricingRule = {
  scope: 'day' | 'month' | 'week';
  specific_date?: string | null; // YYYY-MM-DD
  year?: number | null;
  month?: number | null; // 1-12
  week?: number | null; // 1-5
  price: number;
};

type SettingsContextType = {
  nightlyPrice: number;
  setNightlyPrice: (price: number) => void;
  bookedDates: string[]; // ISO date strings YYYY-MM-DD
  toggleBookedDate: (date: Date) => void;
  isBooked: (date: Date) => boolean;
  cleaningFee: number;
  setCleaningFee: (fee: number) => void;
  addBookedRange: (start: Date, end: Date) => void;
  removeBookedRange: (start: Date, end: Date) => void;
  heroTitle: string;
  setHeroTitle: (t: string) => void;
  heroSubtitle: string;
  setHeroSubtitle: (t: string) => void;
  heroImageUrl: string | null;
  setHeroImageUrl: (url: string | null) => void;
  galleryItems: GalleryItem[];
  setGalleryItems: (items: GalleryItem[]) => void;
  getNightlyPrice: (date: Date) => number;
  selectedDates: Date[];
  setSelectedDates: (dates: Date[]) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const PRICE_KEY = "nightly_price_brl";
const BOOKED_KEY = "booked_dates";
const CLEANING_KEY = "cleaning_fee_brl";
const HERO_TITLE_KEY = "hero_title";
const HERO_SUBTITLE_KEY = "hero_subtitle";
const HERO_IMAGE_URL_KEY = "hero_image_url";
const GALLERY_ITEMS_KEY = "gallery_items";

function toISO(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return d.toISOString().slice(0, 10);
}

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [nightlyPrice, setNightlyPriceState] = useState<number>(1000);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [cleaningFee, setCleaningFeeState] = useState<number>(200);
  const [heroTitle, setHeroTitleState] = useState<string>("Seu Refúgio à Beira-Mar");
  const [heroSubtitle, setHeroSubtitleState] = useState<string>("Desperte com o som das ondas e relaxe em Itapoá");
  const [heroImageUrl, setHeroImageUrlState] = useState<string | null>(null);
  const [galleryItems, setGalleryItemsState] = useState<GalleryItem[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [selectedDates, setSelectedDatesState] = useState<Date[]>([]);

  useEffect(() => {
    const savedPrice = localStorage.getItem(PRICE_KEY);
    const savedBooked = localStorage.getItem(BOOKED_KEY);
    const savedCleaning = localStorage.getItem(CLEANING_KEY);
    const savedHeroTitle = localStorage.getItem(HERO_TITLE_KEY);
    const savedHeroSubtitle = localStorage.getItem(HERO_SUBTITLE_KEY);
    const savedHeroImageUrl = localStorage.getItem(HERO_IMAGE_URL_KEY);
    const savedGalleryItems = localStorage.getItem(GALLERY_ITEMS_KEY);
    if (savedPrice) setNightlyPriceState(Number(savedPrice));
    if (savedBooked) {
      try {
        const parsed = JSON.parse(savedBooked);
        if (Array.isArray(parsed)) setBookedDates(parsed);
      } catch {}
    }
    if (savedCleaning) setCleaningFeeState(Number(savedCleaning));
    if (savedHeroTitle) setHeroTitleState(savedHeroTitle);
    if (savedHeroSubtitle) setHeroSubtitleState(savedHeroSubtitle);
    if (savedHeroImageUrl) setHeroImageUrlState(savedHeroImageUrl);
    if (savedGalleryItems) {
      try {
        const parsed = JSON.parse(savedGalleryItems);
        if (Array.isArray(parsed)) setGalleryItemsState(parsed as GalleryItem[]);
      } catch {}
    }
    // Buscar conteúdo (Hero/Galeria) do Supabase
    (async () => {
      // Hero settings: pega a configuração mais recente ou a 'default'
      const { data: heroData, error: heroError } = await supabase
        .from('hero_settings')
        .select('id,title,subtitle,image_url,updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);
      if (!heroError && heroData && heroData.length) {
        const row = heroData[0];
        if (row.title) setHeroTitleState(row.title);
        if (row.subtitle) setHeroSubtitleState(row.subtitle);
        if (row.image_url) setHeroImageUrlState(row.image_url);
      }

      // Gallery items
      const { data: galData, error: galError } = await supabase
        .from('gallery_items')
        .select('title,description,image_url')
        .order('created_at', { ascending: true });
      if (!galError && galData) {
        const mapped = galData.map((g) => ({ imageUrl: g.image_url, title: g.title, description: g.description || '' })) as GalleryItem[];
        if (mapped.length) setGalleryItemsState(mapped);
      }

      // Pricing rules
      const { data: rules, error: rulesErr } = await supabase
        .from('pricing_rules')
        .select('scope,specific_date,year,month,week,price');
      if (!rulesErr && rules) {
        const mapped = rules.map((r: any) => ({
          scope: r.scope,
          specific_date: r.specific_date,
          year: r.year,
          month: r.month,
          week: r.week,
          price: Number(r.price),
        })) as PricingRule[];
        setPricingRules(mapped);
      }
    })();
  }, []);

  const setNightlyPrice = (price: number) => {
    setNightlyPriceState(price);
    localStorage.setItem(PRICE_KEY, String(price));
  };

  const toggleBookedDate = (date: Date) => {
    const iso = toISO(date);
    setBookedDates((prev) => {
      const exists = prev.includes(iso);
      const next = exists ? prev.filter((d) => d !== iso) : [...prev, iso];
      localStorage.setItem(BOOKED_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isBooked = (date: Date) => bookedDates.includes(toISO(date));

  const getNightlyPrice = (date: Date) => {
    // Prioridade: day > week > month > default nightlyPrice
    const iso = toISO(date);
    const d = new Date(iso);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1; // 1-12
    const dayOfMonth = d.getUTCDate();
    // Semana do mês: 1-5
    const week = Math.ceil(dayOfMonth / 7);

    // Day rule
    const dayRule = pricingRules.find((r) => r.scope === 'day' && r.specific_date === iso);
    if (dayRule) return dayRule.price;
    // Week rule
    const weekRule = pricingRules.find((r) => r.scope === 'week' && r.year === y && r.month === m && r.week === week);
    if (weekRule) return weekRule.price;
    // Month rule
    const monthRule = pricingRules.find((r) => r.scope === 'month' && r.year === y && r.month === m);
    if (monthRule) return monthRule.price;
    return nightlyPrice;
  };

  const setCleaningFee = (fee: number) => {
    setCleaningFeeState(fee);
    localStorage.setItem(CLEANING_KEY, String(fee));
  };

  const setHeroTitle = async (t: string) => {
    setHeroTitleState(t);
    localStorage.setItem(HERO_TITLE_KEY, t);
    // Persistir no Supabase (upsert na linha 'default')
    await supabase.from('hero_settings').upsert({
      id: 'default',
      title: t,
      subtitle: heroSubtitle,
      image_url: heroImageUrl,
    }, { onConflict: 'id' });
  };

  const setHeroSubtitle = async (t: string) => {
    setHeroSubtitleState(t);
    localStorage.setItem(HERO_SUBTITLE_KEY, t);
    await supabase.from('hero_settings').upsert({
      id: 'default',
      title: heroTitle,
      subtitle: t,
      image_url: heroImageUrl,
    }, { onConflict: 'id' });
  };

  const setHeroImageUrl = async (url: string | null) => {
    setHeroImageUrlState(url);
    if (url) localStorage.setItem(HERO_IMAGE_URL_KEY, url);
    else localStorage.removeItem(HERO_IMAGE_URL_KEY);
    await supabase.from('hero_settings').upsert({
      id: 'default',
      title: heroTitle,
      subtitle: heroSubtitle,
      image_url: url,
    }, { onConflict: 'id' });
  };

  const setGalleryItems = async (items: GalleryItem[]) => {
    setGalleryItemsState(items);
    localStorage.setItem(GALLERY_ITEMS_KEY, JSON.stringify(items));
    // Persistir no Supabase (replace seguro: apagar existentes por id e inserir novos)
    const { data: existing, error: selErr } = await supabase
      .from('gallery_items')
      .select('id');
    if (!selErr && existing && existing.length) {
      const ids = existing.map((e: { id: string }) => e.id);
      await supabase.from('gallery_items').delete().in('id', ids);
    }
    if (items.length) {
      // Se a descrição estiver vazia, preencher com a mensagem da capa (subtitle) para consistência
      const payload = items.map((it) => ({
        title: it.title || 'Sem título',
        description: (it.description && it.description.trim()) ? it.description : (heroSubtitle || ''),
        image_url: it.imageUrl,
      }));
      await supabase.from('gallery_items').insert(payload);
    }
  };

  const addBookedRange = (start: Date, end: Date) => {
    const s = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
    const e = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));
    const days: string[] = [];
    for (let d = s; d <= e; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
      days.push(d.toISOString().slice(0, 10));
    }
    setBookedDates((prev) => {
      const set = new Set(prev);
      days.forEach((iso) => set.add(iso));
      const next = Array.from(set);
      localStorage.setItem(BOOKED_KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeBookedRange = (start: Date, end: Date) => {
    const s = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
    const e = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));
    const days: string[] = [];
    for (let d = s; d <= e; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
      days.push(d.toISOString().slice(0, 10));
    }
    setBookedDates((prev) => {
      const next = prev.filter((iso) => !days.includes(iso));
      localStorage.setItem(BOOKED_KEY, JSON.stringify(next));
      return next;
    });
  };

  const value = useMemo(
    () => ({
      nightlyPrice,
      setNightlyPrice,
      bookedDates,
      toggleBookedDate,
      isBooked,
      cleaningFee,
      setCleaningFee,
      addBookedRange,
      removeBookedRange,
      heroTitle,
      setHeroTitle,
      heroSubtitle,
      setHeroSubtitle,
      heroImageUrl,
      setHeroImageUrl,
      galleryItems,
      setGalleryItems,
      getNightlyPrice,
      selectedDates,
      setSelectedDates: (dates: Date[]) => setSelectedDatesState(dates),
    }),
    [nightlyPrice, bookedDates, cleaningFee, heroTitle, heroSubtitle, heroImageUrl, galleryItems, pricingRules, selectedDates],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};