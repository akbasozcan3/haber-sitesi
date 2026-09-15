import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Şartları",
  description: "Kullanım şartları ve telif hakları bildirimi.",
};

export default function KullanimSartlariPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Kullanım Şartları</h1>
        <p className="mt-2 text-xs text-slate-400 font-semibold">Son Güncelleme: 14 Eylül 2026</p>

        <div className="mt-8 space-y-6 text-xs sm:text-sm leading-relaxed text-slate-700">
          <p>
            Zernews portalına erişerek ve içerikleri kullanarak aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">1. Fikri Mülkiyet ve Telif Hakları</h2>
          <p>
            Web sitemizde yer alan tüm metinler, grafikler, logolar, analizler ve yazılım kodları Zernews&apos;e aittir veya lisanslı olarak kullanılmaktadır. 5846 sayılı Fikir ve Sanat Eserleri Kanunu uyarınca, kaynak gösterilmeden ve aktif bağlantı (link) verilmeden içeriklerin tamamı kopyalanamaz veya ticari amaçla yayınlanamaz.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">2. Alıntı Yapma Kuralı</h2>
          <p>
            Haberlerimizden makul ölçüde alıntı yapılabilir; ancak alıntılanan metnin altında doğrudan ilgili haberin orijinal sayfasına tıklanabilir bağlantı verilmesi zorunludur.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">3. Yorum Kuralları</h2>
          <p>
            Okuyucu yorumlarında hakaret, nefret söylemi, yasa dışı içerik veya reklam içeren ifadeler yayınlanamaz. Zernews editörleri bu tür yorumları onaylamama veya silme hakkını saklı tutar.
          </p>
        </div>
      </div>
    </div>
  );
}
