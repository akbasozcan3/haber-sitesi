"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, categoriesApi } from "@/lib/istemci";
import type { Category } from "@/types/uygulama";
import { ArrowLeft, Save, AlertCircle, Loader2 } from "lucide-react";

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

export default function KategoriFormu({ id }: { id?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [showInNavbar, setShowInNavbar] = useState(false);
  const [slugEdited, setSlugEdited] = useState(Boolean(id));
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    categoriesApi.get(id)
      .then((item: Category) => {
        setName(item.name);
        setSlug(item.slug);
        setDescription(item.description ?? "");
        setIcon(item.icon ?? "");
        setIsFeatured(item.is_featured ?? false);
        setShowInNavbar(item.show_in_navbar ?? false);
        setSlugEdited(true);
      })
      .catch(() => setError("Kategori yüklenemedi."))
      .finally(() => setLoading(false));
  }, [id]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setErrors({});
    setSaving(true);
    try {
      const payload = { name, slug, description, icon, is_featured: isFeatured, show_in_navbar: showInNavbar };
      if (id) await categoriesApi.update(id, payload);
      else await categoriesApi.create(payload);
      router.push("/admin/categories");
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        setErrors(caught.validationErrors);
      } else {
        setError("Kategori kaydedilemedi.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin text-slate-700 mr-2" />
        <span>Kategori yükleniyor...</span>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      {/* Üst Başlık */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/categories")}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {id ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kategori adını ve bağlantısını yapılandırın.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Kategori Adı <span className="text-rose-500">*</span>
          </label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugEdited) setSlug(createSlug(e.target.value));
            }}
            placeholder="Örn: Yapay Zeka"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          {errors.name?.[0] && (
            <span className="mt-1.5 block text-xs text-rose-600 font-medium">{errors.name[0]}</span>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Açıklama
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Kategori için kısa ve açıklayıcı metin..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">İkon anahtarı</label>
            <input 
              value={icon} 
              onChange={(e) => setIcon(e.target.value)} 
              maxLength={40} 
              placeholder="google, mobile, cart" 
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900" 
            />
          </div>
          <label className="flex items-center gap-3 self-end rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
            Öne çıkan kategori
          </label>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors">
          <input type="checkbox" checked={showInNavbar} onChange={(e) => setShowInNavbar(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
          Public navbar’da göster
        </label>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Kalıcı Bağlantı (Slug) <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-500 focus-within:border-slate-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-900 transition-all">
            <span className="font-mono text-slate-400">/kategori/</span>
            <input
              required
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(createSlug(e.target.value));
              }}
              placeholder="yapay-zeka"
              className="w-full bg-transparent py-2.5 text-slate-800 focus:outline-none font-mono text-xs font-medium"
            />
          </div>
          {errors.slug?.[0] && (
            <span className="mt-1.5 block text-xs text-rose-600 font-medium">{errors.slug[0]}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? "Kaydediliyor..." : "Kaydet"}</span>
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
