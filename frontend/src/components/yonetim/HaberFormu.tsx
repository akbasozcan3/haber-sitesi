"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, authorsApi, categoriesApi, newsApi, uploadsApi } from "@/lib/istemci";
import ZenginMetinEditoru from "@/components/yonetim/ZenginMetinEditoru";
import type { Author, Category, News, NewsStatus } from "@/types/uygulama";
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  Sparkles, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Smartphone,
  Monitor,
  X,
  Trash2,
  Clock,
  User,
  Plus
} from "lucide-react";
import HaberlerContent from "@/components/haberler/HaberlerContent";
import { chatGptMakalesiniAyristir } from "@/lib/chatgptAyristirici";

type FormValues = {
  category_id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  inner_image: string;
  status: NewsStatus;
  is_featured: boolean;
  published_at: string;
  views: number;
};

const emptyValues: FormValues = {
  category_id: "",
  author_id: "",
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image: "",
  inner_image: "",
  status: "draft",
  is_featured: false,
  published_at: "",
  views: 0,
};

function toValues(item: News): FormValues {
  return {
    category_id: String(item.category_id),
    author_id: String(item.author_id),
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt || "",
    content: item.content,
    image: item.image || "",
    inner_image: item.inner_image || "",
    status: item.status,
    is_featured: item.is_featured,
    published_at: item.published_at ? item.published_at.slice(0, 16) : "",
    views: item.views ?? 0,
  };
}

function createSlug(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function HaberFormu({ id }: { id?: string }) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [innerImageFile, setInnerImageFile] = useState<File | null>(null);
  const [innerImagePreview, setInnerImagePreview] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [slugEdited, setSlugEdited] = useState(Boolean(id));
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiSuccessMsg, setAiSuccessMsg] = useState("");

  const hasMetadataInContent = /SEO Title:|Meta Description:|Slug:|Excerpt:|Odak Anahtar/i.test(values.content);

  function cleanExistingContent() {
    const parsed = chatGptMakalesiniAyristir(values.content);
    setValues((curr) => ({
      ...curr,
      title: curr.title || parsed.title,
      slug: curr.slug || parsed.slug,
      excerpt: curr.excerpt || parsed.excerpt,
      content: parsed.content,
    }));
    setAiSuccessMsg("Makale içerisindeki ChatGPT meta etiketleri başarıyla temizlendi!");
    setTimeout(() => setAiSuccessMsg(""), 6000);
  }

  function handleApplyAiText() {
    if (!aiInput.trim()) return;
    const parsed = chatGptMakalesiniAyristir(aiInput);
    setValues((curr) => ({
      ...curr,
      title: parsed.title || curr.title,
      slug: parsed.slug || curr.slug,
      excerpt: parsed.excerpt || curr.excerpt,
      content: parsed.content || curr.content,
    }));
    setSlugEdited(true);
    setAiInput("");
    setShowAiModal(false);
    setAiSuccessMsg("ChatGPT metni başarıyla ayrıştırıldı: Başlık, slug, özet ve makale gövdesi otomatik dolduruldu!");
    setTimeout(() => setAiSuccessMsg(""), 6000);
  }

  useEffect(() => {
    Promise.all([
      categoriesApi.list(),
      authorsApi.list(),
      id ? newsApi.get(id) : Promise.resolve(null),
    ])
      .then(([categoryItems, authorItems, item]) => {
        setCategories(categoryItems);
        setAuthors(authorItems);
        if (item) {
          const itemValues = toValues(item);
          setValues(itemValues);
          setImagePreview(itemValues.image);
          setInnerImagePreview(itemValues.inner_image);
          setSlugEdited(true);
        } else if (categoryItems.length > 0 && authorItems.length > 0) {
          // Yeni haber için ilk kategori ve yazarı varsayılan ata
          setValues((prev) => ({
            ...prev,
            category_id: String(categoryItems[0].id),
            author_id: String(authorItems[0].id),
          }));
        }
      })
      .catch(() => setError("Form verileri yüklenemedi."))
      .finally(() => setLoading(false));
  }, [id]);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function fieldError(field: keyof FormValues) {
    return errors[field]?.[0];
  }

  function updateTitle(value: string) {
    setValues((current) => ({
      ...current,
      title: value,
      slug: slugEdited ? current.slug : createSlug(value),
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setError("");
    setSaving(true);
    try {
      let imageUrl = values.image || null;
      if (imageFile) {
        imageUrl = (await uploadsApi.image(imageFile)).url;
      }
      let innerImageUrl = values.inner_image || null;
      if (innerImageFile) {
        innerImageUrl = (await uploadsApi.image(innerImageFile)).url;
      }
      const payload = {
        ...values,
        category_id: Number(values.category_id),
        author_id: Number(values.author_id),
        image: imageUrl,
        inner_image: innerImageUrl,
        published_at: values.published_at || null,
      };

      if (id) {
        await newsApi.update(id, payload);
      } else {
        await newsApi.create(payload);
      }
      router.push("/admin/news");
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        setErrors(caught.validationErrors);
      } else {
        setError("Haber kaydedilirken bir hata oluştu.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-slate-700 mr-2" />
        <span>Haber verileri yükleniyor...</span>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      {/* ÜST BAŞLIK & İPTAL / KAYDET */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/news")}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {id ? "Haberi Düzenle" : "Yeni Haber Oluştur"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              İçeriğinizi editoryal standartlara uygun biçimde hazırlayın.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs cursor-pointer"
          >
            <Eye className="h-4 w-4 text-slate-600" />
            <span>Canlı Önizleme</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAiModal((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>ChatGPT ile Doldur</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/news")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{id ? "Değişiklikleri Kaydet" : "Haberi Yayınla"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {aiSuccessMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 animate-in fade-in">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{aiSuccessMsg}</span>
        </div>
      )}

      {showAiModal && (
        <div className="rounded-2xl border-2 border-indigo-200/80 bg-indigo-50/40 p-5 space-y-4 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                ChatGPT / Yapay Zeka Makale Ayrıştırıcı
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAiModal(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Kapat ✕
            </button>
          </div>
          <p className="text-xs text-indigo-900 leading-relaxed">
            ChatGPT veya herhangi bir yapay zekadan kopyaladığınız tüm metni (Başlık, SEO Title, Meta Description, Slug, Excerpt ve makale dahil) aşağıdaki kutuya yapıştırın. Sistem; başlığı, kalıcı bağlantıyı, spotu ve temiz makale metnini tek tıkla otomatik olarak ayırıp forma dolduracaktır.
          </p>
          <textarea
            rows={5}
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="ChatGPT yanıtının tamamını buraya yapıştırın..."
            className="w-full rounded-xl border border-indigo-200 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              * SEO Title, Slug, Excerpt gibi meta etiketler makale gövdesinden otomatik temizlenir.
            </span>
            <button
              type="button"
              onClick={handleApplyAiText}
              disabled={!aiInput.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ayrıştır ve Formu Doldur</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 2 KOLONLU EDİTORYAL FORM */}
      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* SOL KOLON: BAŞLIK, SLUG, ÖZET, EDİTÖR (8/12) */}
        <div className="space-y-6 lg:col-span-8">
          
          {/* Başlık */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Haber Başlığı <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={values.title}
                onChange={(e) => updateTitle(e.target.value)}
                placeholder="Örn: OpenAI, yeni akıl yürütme modelini duyurdu..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              {fieldError("title") && (
                <span className="mt-1.5 block text-xs text-rose-600 font-medium">{fieldError("title")}</span>
              )}
            </div>

            {/* Slug / Bağlantı */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kalıcı Bağlantı (Slug)
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-500 focus-within:border-slate-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-900 transition-all">
                <span className="hidden sm:inline font-mono text-slate-400">/haberler/</span>
                <input
                  type="text"
                  required
                  value={values.slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    update("slug", createSlug(e.target.value));
                  }}
                  className="w-full bg-transparent py-2.5 text-slate-800 focus:outline-none font-mono text-xs font-medium"
                />
              </div>
              {fieldError("slug") && (
                <span className="mt-1.5 block text-xs text-rose-600 font-medium">{fieldError("slug")}</span>
              )}
            </div>

            {/* Spot / Özet (Excerpt) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Spot / Özet Cümle (Excerpt)
              </label>
              <textarea
                rows={3}
                value={values.excerpt}
                onChange={(e) => update("excerpt", e.target.value)}
                placeholder="Haberin ana fikrini özetleyen vurucu giriş paragrafı..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed"
              />
              {fieldError("excerpt") && (
                <span className="mt-1.5 block text-xs text-rose-600 font-medium">{fieldError("excerpt")}</span>
              )}
            </div>
          </div>

          {/* Zengin Metin Editörü */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Makale Metni ve İçerik <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>ChatGPT Metni Yapıştır</span>
              </button>
            </div>

            {hasMetadataInContent && (
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong className="font-semibold block text-amber-950">
                      Makalede ChatGPT Meta Bilgileri Tespit Edildi
                    </strong>
                    <span className="text-amber-800 text-[11px]">
                      İçerikte SEO Title, Slug veya Excerpt etiketleri var. Tek tıkla gövdeden temizleyip ilgili form alanlarına aktarabilirsiniz.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={cleanExistingContent}
                  className="shrink-0 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors cursor-pointer"
                >
                  Şimdi Temizle & Ayrıştır
                </button>
              </div>
            )}

            <ZenginMetinEditoru
              value={values.content}
              onChange={(content) => update("content", content)}
            />
            {fieldError("content") && (
              <span className="mt-2 block text-xs text-rose-600 font-medium">{fieldError("content")}</span>
            )}
          </div>
        </div>

        {/* SAĞ KOLON: YAYIN AYARLARI, KATEGORİ, YAZAR, GÖRSEL (4/12) */}
        <div className="space-y-6 lg:col-span-4">
          
          {/* YAYIN DURUMU KARTI */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Yayın Durumu
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Görünürlük
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => update("status", "published")}
                  className={`rounded-xl py-2 text-xs font-bold transition-all ${
                    values.status === "published"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  Yayında
                </button>
                <button
                  type="button"
                  onClick={() => update("status", "draft")}
                  className={`rounded-xl py-2 text-xs font-bold transition-all ${
                    values.status === "draft"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  Taslak
                </button>
              </div>
            </div>

            {/* Öne Çıkarılan */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800">Manşette Öne Çıkar</span>
              </div>
              <input
                type="checkbox"
                checked={values.is_featured}
                onChange={(e) => update("is_featured", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
            </div>

            {/* Yayın Tarihi */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Yayın Tarihi & Saati
              </label>
              <input
                type="datetime-local"
                value={values.published_at}
                onChange={(e) => update("published_at", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Görüntülenme Sayısı */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-600">
                  Görüntülenme Sayısı
                </label>
                {values.views > 0 && (
                  <button
                    type="button"
                    onClick={() => update("views", 0)}
                    className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Sıfırla
                  </button>
                )}
              </div>
              <input
                type="number"
                min="0"
                value={values.views}
                onChange={(e) => update("views", Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Site okundukça organik olarak artar.
              </p>
            </div>
          </div>

          {/* SINIFLANDIRMA KARTI */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Sınıflandırma
            </h3>

            {/* Kategori */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={values.category_id}
                onChange={(e) => update("category_id", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="">Kategori Seçin</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {fieldError("category_id") && (
                <span className="mt-1 block text-xs text-rose-600 font-medium">{fieldError("category_id")}</span>
              )}
            </div>

            {/* Yazar */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Yazar <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={values.author_id}
                onChange={(e) => update("author_id", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="">Yazar Seçin</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              {fieldError("author_id") && (
                <span className="mt-1 block text-xs text-rose-600 font-medium">{fieldError("author_id")}</span>
              )}
            </div>
          </div>

          {/* KAPAK GÖRSELİ KARTI */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-slate-700" />
                <span>Kapak Görseli</span>
              </h3>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                16:9 • 1200×675 px
              </span>
            </div>

            {/* Görsel Önizleme */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 group">
              {imagePreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Kapak Önizleme"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute bottom-2 left-2 rounded bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs tracking-wide">
                    16:9 Oranında Kırpılır (1200 × 675 px)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                      update("image", "");
                    }}
                    title="Kapak görselini kaldır"
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/90 text-white shadow-sm hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
                  <ImageIcon className="h-8 w-8 text-slate-300" />
                  <span className="text-[11px] font-medium text-slate-500">Kapak görseli seçilmedi</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Önerilen: 1200 × 675 px (16:9 Yatay)</span>
                </div>
              )}
            </div>

            {/* Dosya Seç */}
            <div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-colors">
                <Upload className="h-4 w-4 text-slate-600" />
                <span>Kapak Görseli Yükle</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    if (file && file.size > 5 * 1024 * 1024) {
                      setError("Görsel boyutu 5 MB'dan büyük olamaz.");
                      return;
                    }
                    setError("");
                    setImageFile(file);
                    setImagePreview(file ? URL.createObjectURL(file) : values.image);
                  }}
                />
              </label>
              <p className="mt-1 text-[10px] text-slate-400 text-center">
                Önerilen: <strong className="text-slate-600">1200 × 675 px (16:9)</strong> • JPG, PNG, WEBP (Maks 5 MB)
              </p>
            </div>

            {/* Veya Doğrudan Görsel URL'si */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Veya Görsel Bağlantısı (URL)
              </label>
              <input
                type="url"
                value={values.image}
                onChange={(e) => {
                  update("image", e.target.value);
                  if (!imageFile) setImagePreview(e.target.value);
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* İÇ GÖRSEL KARTI (MAKALE DETAY GÖRSELİ) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-slate-700" />
                <span>İç Görsel</span>
              </h3>
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                16:9 • 1200×675 px
              </span>
            </div>

            {/* İç Görsel Önizleme */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 group">
              {innerImagePreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={innerImagePreview}
                    alt="İç Görsel Önizleme"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute bottom-2 left-2 rounded bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs tracking-wide">
                    16:9 Oranında Kırpılır (1200 × 675 px)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setInnerImageFile(null);
                      setInnerImagePreview("");
                      update("inner_image", "");
                    }}
                    title="İç görseli kaldır"
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/90 text-white shadow-sm hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
                  <ImageIcon className="h-8 w-8 text-slate-300" />
                  <span className="text-[11px] font-medium text-slate-500">İç görsel seçilmedi</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Önerilen: 1200 × 675 px (16:9 Yatay)</span>
                </div>
              )}
            </div>

            {/* Dosya Seç */}
            <div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-colors">
                <Upload className="h-4 w-4 text-slate-600" />
                <span>İç Görsel Yükle</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    if (file && file.size > 5 * 1024 * 1024) {
                      setError("İç görsel boyutu 5 MB'dan büyük olamaz.");
                      return;
                    }
                    setError("");
                    setInnerImageFile(file);
                    setInnerImagePreview(file ? URL.createObjectURL(file) : values.inner_image);
                  }}
                />
              </label>
              <p className="mt-1 text-[10px] text-slate-400 text-center">
                Önerilen: <strong className="text-slate-600">1200 × 675 px (16:9)</strong> • JPG, PNG, WEBP (Maks 5 MB)
              </p>
            </div>

            {/* Veya URL */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Veya İç Görsel Bağlantısı (URL)
              </label>
              <input
                type="url"
                value={values.inner_image}
                onChange={(e) => {
                  update("inner_image", e.target.value);
                  if (!innerImageFile) setInnerImagePreview(e.target.value);
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* İçeriğe Ekle Kısayolu */}
            {innerImagePreview && (
              <button
                type="button"
                onClick={() => {
                  const targetUrl = innerImagePreview || values.inner_image;
                  if (!targetUrl) return;
                  const caption = values.title || "Haber Detay Görseli";
                  const md = `\n\n![${caption}](${targetUrl})\n\n`;
                  setValues((curr) => ({
                    ...curr,
                    content: curr.content ? `${curr.content}${md}` : md,
                  }));
                  setAiSuccessMsg("İç görsel makale metninin sonuna başarıyla eklendi!");
                  setTimeout(() => setAiSuccessMsg(""), 5000);
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 p-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Metin İçine Görsel Olarak Ekle</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CANLI ÖNİZLEME MODALI */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-hidden">
          {/* Modal Üst Çubuk */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-red-500" />
              <div>
                <h2 className="text-sm font-black tracking-wide text-white">
                  Zernews Canlı Haber Önizlemesi
                </h2>
                <p className="text-[11px] text-slate-400">
                  Yayına girmeden önce haberin sitede nasıl görüneceğini test edin.
                </p>
              </div>
            </div>

            {/* Cihaz Görünüm Değiştirici */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-800 p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  previewDevice === "desktop"
                    ? "bg-slate-950 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Masaüstü</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  previewDevice === "mobile"
                    ? "bg-slate-950 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobil (390px)</span>
              </button>
            </div>

            {/* Kapat Butonu */}
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>Önizlemeyi Kapat</span>
            </button>
          </div>

          {/* Modal Gövdesi: Simülasyon Alanı */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/40">
            <div
              className={`mx-auto bg-white transition-all duration-300 ${
                previewDevice === "mobile"
                  ? "max-w-[420px] rounded-[2.5rem] border-[8px] border-slate-800 p-6 shadow-2xl my-4"
                  : "max-w-4xl rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xl my-4"
              }`}
            >
              {/* Breadcrumb Simülasyonu */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-6">
                <span>Ana Sayfa</span>
                <span>›</span>
                <span>Haberler</span>
                <span>›</span>
                <span className="text-red-600 font-bold">
                  {categories.find((c) => String(c.id) === values.category_id)?.name || "Kategori"}
                </span>
              </div>

              {/* Kategori Rozeti */}
              <div className="mb-4">
                <span className="inline-block rounded-md bg-red-50 border border-red-100 px-2.5 py-1 text-xs font-bold text-red-600">
                  {categories.find((c) => String(c.id) === values.category_id)?.name || "Genel"}
                </span>
              </div>

              {/* Başlık */}
              <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                {values.title || "Örnek Haber Başlığı Buraya Gelecek..."}
              </h1>

              {/* Spot / Excerpt */}
              {values.excerpt && (
                <p className="mt-4 text-base sm:text-lg font-medium text-slate-600 leading-relaxed">
                  {values.excerpt}
                </p>
              )}

              {/* Yazar & Meta Bilgisi */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-slate-100 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
                    {authors.find((a) => String(a.id) === values.author_id)?.name?.charAt(0).toUpperCase() || (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-900">
                      {authors.find((a) => String(a.id) === values.author_id)?.name || "Zernews Editörü"}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Bugün</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        ~2 dk okuma
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-slate-400" />
                  <span>1 görüntülenme</span>
                </div>
              </div>

              {/* KAPAK GÖRSELİ (HERO IMAGE) */}
              {imagePreview ? (
                <figure className="mt-6 overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 shadow-xs">
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt={values.title || "Kapak"}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </figure>
              ) : (
                <div className="mt-6 flex aspect-[16/9] w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-xs font-medium text-slate-400">
                  Kapak görseli seçilmediğinde varsayılan arkaplan kullanılır.
                </div>
              )}

              {/* İÇ GÖRSEL (EĞER VARSA VE İÇERİKTE TEKRAR ETMİYORSA) */}
              {innerImagePreview && !values.content.includes(innerImagePreview) && (
                <figure className="my-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-xs">
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={innerImagePreview}
                      alt={`${values.title} - Detay Görseli`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="px-4 py-2 text-center text-xs text-slate-500 bg-slate-50 border-t border-slate-100 font-medium">
                    {values.title} - Detay Görseli
                  </figcaption>
                </figure>
              )}

              {/* MAKALE İÇERİĞİ */}
              <div className="mt-8 text-sm leading-relaxed text-slate-800">
                <HaberlerContent content={values.content || "Haber içeriği henüz girilmedi."} />
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
