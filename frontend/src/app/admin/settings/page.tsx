"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import YonetimKabugu from "@/components/yonetim/YonetimKabugu";
import { settingsApi, ApiError } from "@/lib/istemci";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import type { SiteSettings } from "@/types/uygulama";
import {
  Upload, CheckCircle2, AlertCircle, Loader2,
  Image as ImageIcon, Sparkles, Trash2,
  Eye, ShieldCheck, Check, Sliders, Globe,
  RefreshCw,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { refreshSettings, updateSettings } = useSiteSettings();

  const [settings, setSettings] = useState<SiteSettings>({
    site_logo: "",
    site_logo_type: "image",
    site_logo_height: 52,
    site_favicon: "",
    site_title: "Zernews",
    site_tagline: "Teknoloji ve Girişim Ekosistemi",
    ads_enabled: "1",
    adsense_client: "ca-pub-4161709832087107",
    adsense_slot_header: "",
    adsense_slot_billboard: "",
    adsense_slot_sidebar: "",
    adsense_slot_article: "",
    ad_mode: "auto",
  });

  const [logoHeight, setLogoHeight] = useState<number>(52);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    settingsApi
      .get()
      .then((data) => {
        const height = Number(data.site_logo_height) || 52;
        setSettings({
          site_logo: data.site_logo || "",
          site_logo_type: "image",
          site_logo_height: height,
          site_favicon: data.site_favicon || "",
          site_title: data.site_title || "Zernews",
          site_tagline: data.site_tagline || "Teknoloji ve Girişim Ekosistemi",
          ads_enabled: data.ads_enabled ?? "1",
          adsense_client: data.adsense_client || "ca-pub-4161709832087107",
          adsense_slot_header: data.adsense_slot_header || "",
          adsense_slot_billboard: data.adsense_slot_billboard || "",
          adsense_slot_sidebar: data.adsense_slot_sidebar || "",
          adsense_slot_article: data.adsense_slot_article || "",
          ad_mode: data.ad_mode || "auto",
        });
        setLogoHeight(height);
      })
      .catch(() => {
        setErrorMsg("Ayarlar yüklenirken bir hata oluştu.");
      })
      .finally(() => setLoading(false));
  }, []);

  // LOGO DOSYASI SEÇİLDİĞİNDE OTOMATİK YÜKLEME
  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg|webp|svg\+xml)$/)) {
      setErrorMsg("Lütfen geçerli bir görsel formatı seçin (PNG, SVG, WebP, JPG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Logo dosya boyutu 5 MB'dan küçük olmalıdır.");
      return;
    }

    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await settingsApi.uploadLogo(file);
      await settingsApi.update({
        ...res.settings,
        site_logo_height: logoHeight,
      });
      setSettings({
        ...res.settings,
        site_logo_height: logoHeight,
      });
      setSuccessMsg("✓ Logo resmi başarıyla yüklendi ve tüm sitede yayına alındı!");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refreshSettings();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Logo yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  }

  // FAVICON DOSYASI SEÇİLDİĞİNDE OTOMATİK YÜKLEME
  async function handleFaviconChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Favicon dosya boyutu 2 MB'dan küçük olmalıdır.");
      return;
    }

    setUploadingFavicon(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await settingsApi.uploadFavicon(file);
      setSettings(res.settings);
      setSuccessMsg("✓ Favicon başarıyla yüklendi ve tarayıcı sekmesine yansıtıldı!");
      if (faviconInputRef.current) faviconInputRef.current.value = "";
      await refreshSettings();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Favicon yüklenirken bir hata oluştu.");
    } finally {
      setUploadingFavicon(false);
    }
  }

  // LOGOYU AYNI ZAMANDA FAVICON YAP
  async function handleMakeLogoFavicon() {
    if (!settings.site_logo) {
      setErrorMsg("Önce bir logo yüklemelisiniz.");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await settingsApi.update({ site_favicon: settings.site_logo });
      setSettings(res.settings);
      setSuccessMsg("✓ Logo resmi tarayıcı faviconu olarak ayarlandı!");
      await refreshSettings();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Favicon ayarlanamadı.");
    } finally {
      setSaving(false);
    }
  }

  // ÖZEL FAVICONU KALDIR
  async function handleRemoveFavicon() {
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await settingsApi.update({ site_favicon: "" });
      setSettings(res.settings);
      setSuccessMsg("✓ Özel favicon kaldırıldı.");
      await refreshSettings();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Favicon kaldırılamadı.");
    } finally {
      setSaving(false);
    }
  }

  // LOGO BOYUTUNU ANINDA KAYDET VE UYGULA
  async function handleApplyHeight(h: number) {
    setLogoHeight(h);
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await updateSettings({
        site_logo_height: h,
      });
      setSettings((prev) => ({
        ...prev,
        site_logo_height: h,
      }));
      setSuccessMsg(`✓ Logo boyutu ${h}px olarak kaydedildi ve tüm sitede güncellendi!`);
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Logo boyutu kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload: Partial<SiteSettings> = {
        ...settings,
        site_logo_type: "image",
        site_logo_height: logoHeight,
        site_title: settings.site_title.trim() || "Zernews",
      };
      await updateSettings(payload);
      setSettings((prev) => ({
        ...prev,
        ...payload,
      }));
      setSuccessMsg("✓ Ayarlar ve logo boyutu başarıyla kaydedildi!");
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Ayarlar kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveLogo() {
    if (!confirm("Yüklü logoyu kaldırmak istediğinize emin misiniz?")) return;

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await settingsApi.update({
        site_logo: "",
        site_logo_type: "image",
      });
      setSettings(res.settings);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccessMsg("✓ Logo kaldırıldı.");
      await refreshSettings();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Logo kaldırılamadı.");
    } finally {
      setSaving(false);
    }
  }

  const activeFavicon = settings.site_favicon || "/icon.png";

  return (
    <YonetimKabugu>
      <div className="mx-auto max-w-5xl space-y-8">

        {/* BAŞLIK */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Yönetim & Görünüm
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Site Logo & Favicon Yönetimi
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Sitenizin ana logosunu ve tarayıcı sekme ikonunu (Favicon) buradan profesyonelce yönetin.
            </p>
          </div>

          {settings.site_logo && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              disabled={saving || uploading}
              className="inline-flex items-center gap-1.5 self-start rounded-xl border border-red-200 bg-red-50/50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-all cursor-pointer shadow-2xs"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-600" />
              Logoyu Kaldır
            </button>
          )}
        </div>

        {/* BİLDİRİMLER */}
        {successMsg && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-semibold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs font-semibold text-red-700 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12">

            {/* SOL KOLON: LOGO ÖNİZLEME, BOYUT SLIDER & YÜKLEME (7 Sütun) */}
            <div className="space-y-6 lg:col-span-7">

              {/* CANLI LOGO ÖNİZLEME KARTI */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-slate-700" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Canlı Logo Önizleme
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-lg bg-red-50 px-2 py-0.5 text-[11px] font-black text-red-600 border border-red-100">
                      {logoHeight} px
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      settings.site_logo
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {settings.site_logo ? (
                        <>
                          <Check className="h-3 w-3" /> Görsel Logo Aktif
                        </>
                      ) : (
                        <>Varsayılan Logo</>
                      )}
                    </span>
                  </div>
                </div>

                {/* ÖNİZLEME ALANI (AÇIK VE KOYU ZEMİN) */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Açık Zemin (Site Header Simülasyonu) */}
                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 min-h-[140px] relative overflow-hidden">
                    <span className="absolute top-2 left-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Beyaz Zemin (Header)
                    </span>
                    <div className="mt-4 flex items-center justify-center transition-all">
                      {settings.site_logo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={settings.site_logo}
                          alt="Logo Önizleme"
                          style={{
                            height: `${logoHeight}px`,
                            maxHeight: `${logoHeight}px`,
                            width: "auto",
                            objectFit: "contain",
                            imageRendering: "auto",
                          }}
                        />
                      ) : (
                        <span className="text-2xl font-black tracking-tight">
                          <span className="text-neutral-950">web</span>
                          <span className="text-red-600">haber</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Koyu Zemin (Dark / Footer Simülasyonu) */}
                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-neutral-950 p-6 min-h-[140px] relative overflow-hidden">
                    <span className="absolute top-2 left-2 text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                      Koyu Zemin (Footer)
                    </span>
                    <div className="mt-4 flex items-center justify-center transition-all">
                      {settings.site_logo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={settings.site_logo}
                          alt="Logo Önizleme"
                          style={{
                            height: `${logoHeight}px`,
                            maxHeight: `${logoHeight}px`,
                            width: "auto",
                            objectFit: "contain",
                            imageRendering: "auto",
                          }}
                        />
                      ) : (
                        <span className="text-2xl font-black tracking-tight text-white">
                          <span className="text-white">web</span>
                          <span className="text-red-600">haber</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-slate-400">
                  Logo sitede tam olarak bu şekilde ve bu boyutta görünür. Asla yazı içermez.
                </p>
              </div>

              {/* LOGO BOYUTU (YÜKSEKLİK) AYARI */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-slate-700" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Logo Boyutunu Ayarla (Büyüt / Küçült)
                    </h2>
                  </div>
                  <span className="inline-flex items-center rounded-lg bg-neutral-900 px-3 py-1 text-xs font-black text-white shadow-2xs">
                    {logoHeight} piksel
                  </span>
                </div>

                {/* Range Slider */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min={24}
                    max={96}
                    step={2}
                    value={logoHeight}
                    onChange={(e) => setLogoHeight(Number(e.target.value))}
                    onPointerUp={(e) => handleApplyHeight(Number((e.target as HTMLInputElement).value))}
                    onMouseUp={(e) => handleApplyHeight(Number((e.target as HTMLInputElement).value))}
                    onTouchEnd={(e) => handleApplyHeight(Number((e.target as HTMLInputElement).value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>24px (Küçük)</span>
                    <span>52px (Önerilen)</span>
                    <span>68px (Geniş)</span>
                    <span>96px (Maksimum)</span>
                  </div>
                </div>

                {/* Hızlı Hazır Boyut Butonları */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-600">
                    Hızlı Hazır Boyutlar (Tıklayınca Anında Kaydeder):
                  </span>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { label: "Kompakt", val: 40 },
                      { label: "Standart", val: 52 },
                      { label: "Büyük", val: 68 },
                      { label: "Görkemli", val: 84 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => handleApplyHeight(preset.val)}
                        className={`rounded-xl border py-2.5 px-3 text-xs font-bold transition-all cursor-pointer ${
                          logoHeight === preset.val
                            ? "border-red-600 bg-red-50 text-red-700 shadow-2xs ring-2 ring-red-600/20"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {preset.label}
                        <span className="block text-[10px] font-medium text-slate-400">
                          {preset.val}px
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doğrudan Boyut Kaydetme Butonu */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleApplyHeight(logoHeight)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Boyut Uygulanıyor...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> Seçili Boyutu Kaydet ({logoHeight}px)
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* LOGO DOSYASI YÜKLEME KARTI */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-slate-700" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Farklı Logo Resmi Yükle
                  </h2>
                </div>

                {/* Sürükle-Bırak / Dosya Seç Alanı */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center hover:border-red-600 hover:bg-red-50/20 transition-all cursor-pointer"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/svg+xml,image/webp,image/jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {uploading ? (
                    <div className="flex flex-col items-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-2" />
                      <span className="text-xs font-bold text-slate-800">
                        Logo resmi yükleniyor ve yayına alınıyor...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 shadow-xs group-hover:text-red-600 transition-all">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="mt-3 text-sm font-bold text-slate-800">
                        Bilgisayarınızdan Yeni Logo Seçin
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Dosyayı seçtiğiniz anda otomatik olarak yüklenir ve kaydedilir.
                      </p>
                      <p className="mt-2 text-[11px] text-slate-400">
                        PNG, SVG, WebP veya JPG (Maks. 5 MB) • Şeffaf arka plan önerilir
                      </p>
                    </>
                  )}
                </div>

                {/* Doğrudan URL Girişi */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    veya Doğrudan Logo Resmi URL&apos;si:
                  </label>
                  <input
                    type="url"
                    placeholder="https://ornek.com/logo.png"
                    value={settings.site_logo}
                    onChange={(e) => {
                      setSettings((s) => ({
                        ...s,
                        site_logo: e.target.value,
                      }));
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>
            </div>

            {/* SAĞ KOLON: FAVICON YÖNETİMİ & SİTE BİLGİLERİ (5 Sütun) */}
            <div className="space-y-6 lg:col-span-5">

              {/* FAVICON (TARAYICI SEKME İKONU) KARTI */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-700" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Favicon (Tarayıcı Sekme İkonu)
                    </h2>
                  </div>
                  {settings.site_favicon && (
                    <button
                      type="button"
                      onClick={handleRemoveFavicon}
                      disabled={saving || uploadingFavicon}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                    >
                      Kaldır
                    </button>
                  )}
                </div>

                {/* Tarayıcı Sekme Simülasyonu */}
                <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Tarayıcı Sekme Görünümü:
                  </span>
                  <div className="flex items-center gap-2 rounded-t-lg border-t border-x border-slate-300 bg-white px-3.5 py-2 shadow-2xs max-w-[260px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeFavicon}
                      alt="Favicon"
                      className="h-4 w-4 object-contain rounded-xs shrink-0"
                    />
                    <span className="truncate text-xs font-bold text-slate-800">
                      {settings.site_title || "Zernews"} - Haberler
                    </span>
                    <span className="ml-auto text-[11px] text-slate-400 font-bold">×</span>
                  </div>
                </div>

                {/* Favicon Yükleme Butonları */}
                <div className="space-y-2 pt-1">
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/png,image/x-icon,image/svg+xml,image/webp,image/jpeg"
                    onChange={handleFaviconChange}
                    className="hidden"
                  />

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => faviconInputRef.current?.click()}
                      disabled={uploadingFavicon || saving}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 shadow-2xs hover:border-red-600 hover:text-red-600 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {uploadingFavicon ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Yükleniyor...
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" /> İkon Yükle (PNG / ICO)
                        </>
                      )}
                    </button>

                    {settings.site_logo && (
                      <button
                        type="button"
                        onClick={handleMakeLogoFavicon}
                        disabled={saving || uploadingFavicon}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 py-2.5 px-3 text-xs font-bold text-red-700 hover:bg-red-100 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                        title="Mevcut logoyu favicon yap"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Logoyu Favicon Yap
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    veya Doğrudan Favicon Görsel URL&apos;si:
                  </label>
                  <input
                    type="url"
                    placeholder="https://ornek.com/favicon.png"
                    value={settings.site_favicon || ""}
                    onChange={(e) => {
                      setSettings((s) => ({
                        ...s,
                        site_favicon: e.target.value,
                      }));
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* SİTE METİN VE KAYIT FORMU */}
              <form onSubmit={handleSaveSettings} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-slate-700" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Boyut & Site Ayarlarını Kaydet
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Site / Portal Başlığı
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.site_title}
                    onChange={(e) => setSettings((s) => ({ ...s, site_title: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                    placeholder="Zernews"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Tarayıcı sekmesinde ve Google arama sonuçlarında görünür.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Slogan / Açıklama
                  </label>
                  <input
                    type="text"
                    value={settings.site_tagline}
                    onChange={(e) => setSettings((s) => ({ ...s, site_tagline: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                    placeholder="Teknoloji ve Girişim Ekosistemi"
                  />
                </div>

                {/* REKLAM & ADSENSE YÖNETİMİ BÖLÜMÜ */}
                <div className="border-t border-slate-200 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Reklam & Google AdSense Yapılandırması
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      Canlı & Aktif
                    </span>
                  </div>

                  {/* Reklam Aktif/Pasif Switch */}
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <div>
                      <span className="block text-xs font-bold text-slate-800">Sitede Reklamları Yayınla</span>
                      <span className="text-[11px] text-slate-500">Header, billboard ve sidebar reklam alanlarını açar/kapatır.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.ads_enabled !== "0" && settings.ads_enabled !== false}
                      onChange={(e) => setSettings((s) => ({ ...s, ads_enabled: e.target.checked ? "1" : "0" }))}
                      className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                  </div>

                  {/* AdSense Publisher ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Google AdSense Yayıncı Kimliği (Publisher Client ID)
                    </label>
                    <input
                      type="text"
                      value={settings.adsense_client || ""}
                      onChange={(e) => setSettings((s) => ({ ...s, adsense_client: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono text-slate-800 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                      placeholder="ca-pub-4161709832087107"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">
                      Google AdSense hesabınızdaki <code>ca-pub-XXXXXXXXXXXXXXXX</code> kimliği.
                    </p>
                  </div>

                  {/* Reklam Modu */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reklam Yayın Modu
                    </label>
                    <select
                      value={settings.ad_mode || "auto"}
                      onChange={(e) => setSettings((s) => ({ ...s, ad_mode: e.target.value as "auto" | "demo" | "sponsor" | "adsense" }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
                    >
                      <option value="auto">Otomatik: AdSense + Canlı Sponsor Yedekli (Önerilen - Asla Boş Kalmaz)</option>
                      <option value="adsense">Sadece Google AdSense (Onaylı Hesaplar İçin)</option>
                      <option value="sponsor">Sadece Özel Sponsor Reklamları</option>
                    </select>
                  </div>

                  {/* AdSense Slot Kimlikleri */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Header Slot ID (Opsiyonel)
                      </label>
                      <input
                        type="text"
                        value={settings.adsense_slot_header || ""}
                        onChange={(e) => setSettings((s) => ({ ...s, adsense_slot_header: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                        placeholder="Örn: 1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Billboard Slot ID (Opsiyonel)
                      </label>
                      <input
                        type="text"
                        value={settings.adsense_slot_billboard || ""}
                        onChange={(e) => setSettings((s) => ({ ...s, adsense_slot_billboard: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                        placeholder="Örn: 0987654321"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving || uploading || uploadingFavicon}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 py-3.5 text-xs font-bold text-white shadow-xs hover:bg-red-600 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> Tüm Değişiklikleri Kaydet
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* İPUÇLARI */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
                <div className="flex items-center gap-2 text-slate-800">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Favicon & Marka İpuçları
                  </h3>
                </div>
                <ul className="space-y-2 text-[11px] text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-red-600">•</span>
                    <span><strong>Favicon:</strong> Tarayıcı sekmelerinde sitenizin solunda görünen küçük kare ikondur. 32x32 veya 64x64 piksel kare görsel idealdir.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-red-600">•</span>
                    <span><strong>Hızlı Buton:</strong> &quot;Logoyu Favicon Yap&quot; butonuna basarak mevcut logonuzu anında sekme ikonu haline getirebilirsiniz.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-red-600">•</span>
                    <span><strong>Kusursuz Görünüm:</strong> Tarayıcılar faviconları hızlıca önbelleğe alır; sekmenizi yenilediğinizde aktif olur.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        )}

      </div>
    </YonetimKabugu>
  );
}
