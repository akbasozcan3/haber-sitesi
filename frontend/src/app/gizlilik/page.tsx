import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Gizlilik ve kişisel verilerin korunması politikası.",
};

export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Gizlilik Politikası</h1>
        <p className="mt-2 text-xs text-slate-400 font-semibold">Son Güncelleme: 14 Eylül 2026</p>

        <div className="mt-8 space-y-6 text-xs sm:text-sm leading-relaxed text-slate-700">
          <p>
            Zernews olarak okuyucularımızın ve ziyaretçilerimizin gizliliğine ve kişisel verilerinin güvenliğine en üst düzeyde önem veriyoruz. Bu Gizlilik Politikası, web sitemizi ziyaret ettiğinizde toplanan bilgilerin nasıl kullanıldığını açıklamaktadır.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">1. Toplanan Veriler</h2>
          <p>
            Web sitemizde gezinirken çerezler (cookies) aracılığıyla anonim trafik verileri, IP adresi ve tarayıcı bilgileri analiz amacıyla toplanabilir. Bülten aboneliği veya yorum formları aracılığıyla paylaştığınız e-posta adresi ve isim bilgileri yalnızca ilgili hizmetin ifası için saklanır.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">2. Çerezler (Cookies) ve Reklamlar</h2>
          <p>
            Web sitemizde Google AdSense ve analiz sağlayıcılarının çerezleri kullanılmaktadır. Bu çerezler, ilgi alanlarınıza göre reklam sunulması ve site performansının ölçülmesi amacıyla çalışır. Tarayıcı ayarlarınızdan çerezleri dilediğiniz zaman devre dışı bırakabilirsiniz.
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6">3. Bilgi Güvenliği</h2>
          <p>
            Toplanan tüm veriler endüstri standardı SSL şifreleme ve modern güvenlik protokolleriyle korunmaktadır. Kişisel verileriniz hiçbir koşulda ticari amaçlarla üçüncü şahıslara satılmaz veya kiralanmaz.
          </p>
        </div>
      </div>
    </div>
  );
}
