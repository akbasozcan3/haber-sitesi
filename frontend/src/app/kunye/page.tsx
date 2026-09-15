import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Künye - Zernews",
  description: "Zernews medya portalı editoryal yönetim, yayın ilkeleri ve künye bilgileri.",
};

export default function KunyePage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="border-b border-slate-200 pb-8">
          <span className="text-xs font-black uppercase tracking-widest text-red-600">Kurumsal</span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Künye & Editoryal Kadro
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Zernews, basın meslek ilkelerine ve tarafsız habercilik standartlarına bağlı olarak yayın yapan bağımsız dijital teknoloji ve girişim portalıdır.
          </p>
        </div>

        {/* Kadro Kartları */}
        <div className="mt-10 space-y-10 text-slate-800">
          <section className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Yönetim</span>
              <h3 className="mt-2 text-lg font-black text-slate-900">İmtiyaz Sahibi</h3>
              <p className="text-sm font-semibold text-slate-700 mt-1">Zernews Medya ve Teknoloji A.Ş.</p>
              <p className="text-xs text-slate-500 mt-0.5">Yönetim Kurulu Başkanı: Özcan Çetin</p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Yazı İşleri</span>
              <h3 className="mt-2 text-lg font-black text-slate-900">Genel Yayın Yönetmeni</h3>
              <p className="text-sm font-semibold text-slate-700 mt-1">Tuğçe İçözü</p>
              <p className="text-xs text-slate-500 mt-0.5">tugce@zernews.com</p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Haber Masası</span>
              <h3 className="mt-2 text-lg font-black text-slate-900">Girişimcilik Masası Şefi</h3>
              <p className="text-sm font-semibold text-slate-700 mt-1">Arda Güler</p>
              <p className="text-xs text-slate-500 mt-0.5">arda@zernews.com</p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Finans & Teknoloji</span>
              <h3 className="mt-2 text-lg font-black text-slate-900">Fintek & Yatırım Masası</h3>
              <p className="text-sm font-semibold text-slate-700 mt-1">Ahmet Can</p>
              <p className="text-xs text-slate-500 mt-0.5">ahmet@zernews.com</p>
            </div>
          </section>

          {/* Hukuk & Merkez */}
          <section className="rounded-2xl bg-slate-50 border border-slate-200 p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-900 mb-4">Hukuk ve İletişim Merkezi</h2>
            <div className="grid gap-4 sm:grid-cols-2 text-xs leading-relaxed text-slate-600">
              <div>
                <p className="font-semibold text-slate-800">Hukuk Danışmanı:</p>
                <p>Av. Mehmet Aydın & Hukuk Bürosu</p>
                <p className="mt-2 font-semibold text-slate-800">Yer Sağlayıcı:</p>
                <p>Zernews Bulut Altyapı Sistemleri A.Ş.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Yönetim Adresi:</p>
                <p>Büyükdere Cad. No: 195, Levent / Beşiktaş / İstanbul</p>
                <p className="mt-2 font-semibold text-slate-800">E-Posta:</p>
                <p>basin@zernews.com — iletisim@zernews.com</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
