"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, authorsApi } from "@/lib/istemci";
import type { Author } from "@/types/uygulama";
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

export default function YazarFormu({ id }: { id?: string }) {
  const router = useRouter();
  const [values, setValues] = useState({
    name: "",
    slug: "",
    email: "",
    bio: "",
    avatar: "",
  });
  const [slugEdited, setSlugEdited] = useState(Boolean(id));
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    authorsApi.get(id)
      .then((item: Author) => {
        setValues({
          name: item.name,
          slug: item.slug,
          email: item.email,
          bio: item.bio || "",
          avatar: item.avatar || "",
        });
        setSlugEdited(true);
      })
      .catch(() => setError("Yazar yüklenemedi."))
      .finally(() => setLoading(false));
  }, [id]);

  function update(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        ...values,
        bio: values.bio || null,
        avatar: values.avatar || null,
      };
      if (id) {
        await authorsApi.update(id, payload);
      } else {
        await authorsApi.create(payload as Omit<Author, "id">);
      }
      router.push("/admin/authors");
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        setErrors(caught.validationErrors);
      } else {
        setError("Yazar kaydedilemedi.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin text-slate-700 mr-2" />
        <span>Yazar yükleniyor...</span>
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
            onClick={() => router.push("/admin/authors")}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {id ? "Yazarı Düzenle" : "Yeni Yazar Tanımla"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Yazar profil bilgilerini ve biyografisini güncelleyin.
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
        {/* Ad Soyad */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Yazar Adı Soyadı <span className="text-rose-500">*</span>
          </label>
          <input
            required
            type="text"
            value={values.name}
            onChange={(e) => {
              update("name", e.target.value);
              if (!slugEdited) update("slug", createSlug(e.target.value));
            }}
            placeholder="Örn: Tuğçe İçözü"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          {errors.name?.[0] && (
            <span className="mt-1.5 block text-xs text-rose-600 font-medium">{errors.name[0]}</span>
          )}
        </div>

        {/* Kalıcı Bağlantı (Slug) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Profil Bağlantısı (Slug) <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-500 focus-within:border-slate-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-900 transition-all">
            <span className="font-mono text-slate-400">/yazar/</span>
            <input
              required
              type="text"
              value={values.slug}
              onChange={(e) => {
                setSlugEdited(true);
                update("slug", createSlug(e.target.value));
              }}
              placeholder="tugce-icozu"
              className="w-full bg-transparent py-2.5 text-slate-800 focus:outline-none font-mono text-xs font-medium"
            />
          </div>
          {errors.slug?.[0] && (
            <span className="mt-1.5 block text-xs text-rose-600 font-medium">{errors.slug[0]}</span>
          )}
        </div>

        {/* E-posta */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            E-posta Adresi <span className="text-rose-500">*</span>
          </label>
          <input
            required
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="yazar@zernews.com"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          {errors.email?.[0] && (
            <span className="mt-1.5 block text-xs text-rose-600 font-medium">{errors.email[0]}</span>
          )}
        </div>

        {/* Biyografi */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Kısa Biyografi
          </label>
          <textarea
            rows={3}
            value={values.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="Yazarın uzmanlık alanları ve editoryal geçmişi..."
            className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed"
          />
          {errors.bio?.[0] && (
            <span className="mt-1.5 block text-xs text-rose-600 font-medium">{errors.bio[0]}</span>
          )}
        </div>

        {/* Avatar URL */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Avatar Görsel Bağlantısı (URL)
          </label>
          <input
            type="url"
            value={values.avatar}
            onChange={(e) => update("avatar", e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          {errors.avatar?.[0] && (
            <span className="mt-1.5 block text-xs text-rose-600 font-medium">{errors.avatar[0]}</span>
          )}

          {values.avatar && (
            <div className="mt-3 flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-slate-200 shadow-sm bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={values.avatar}
                  alt="Önizleme"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-700">Avatar Önizleme</span>
                <span className="block text-[10px] text-slate-400">1:1 Kare / Dairesel Profil (Önerilen: 400 × 400 px)</span>
              </div>
            </div>
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
          onClick={() => router.push("/admin/authors")}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
