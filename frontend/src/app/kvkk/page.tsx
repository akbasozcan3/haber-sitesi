import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "6698 Sayılı Kişisel Verilerin Korunması Kanunu Aydınlatma Metni.",
};

export default function KvkkPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">KVKK Aydınlatma Metni</h1>
        <p className="mt-2 text-xs text-slate-400 font-semibold">6698 Sayılı Kanun Kapsamında Bilgilendirme</p>

        <div className="mt-8 space-y-6 text-xs sm:text-sm leading-relaxed text-slate-700">
          <p>
            Zernews Medya ve Teknoloji A.Ş. (&quot;Veri Sorumlusu&quot;) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca kişisel verilerinizin güvenliğine ve hukuka uygun işlenmesine azami özen gösteriyoruz.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">1. İşlenen Kişisel Veriler ve Amaçları</h2>
          <p>
            İnternet sitemizi ziyaret etmeniz, bültene kaydolmanız veya yorum yapmanız halinde adınız, e-posta adresiniz ve log kayıtlarınız; yasal yükümlülüklerin yerine getirilmesi, hizmetlerimizin sunulması ve iletişim faaliyetlerinin yürütülmesi amaçlarıyla işlenmektedir.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">2. İlgili Kişinin Hakları</h2>
          <p>
            KVKK&apos;nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, silinmesini veya düzeltilmesini isteme haklarına sahipsiniz. Başvurularınızı kvkk@zernews.com adresine iletebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
