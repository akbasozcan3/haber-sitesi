# WebHaber — Türkiye Teknoloji & Girişim Haber Portalı

WebHaber; büyük dil modelleri, yapay zeka, girişimcilik, fintek, yatırım turları ve dijital ekosisteme odaklanan, bağımsız ve yüksek performanslı yeni nesil dijital haber platformudur.

---

## 🏗️ Mimari & Klasör Yapısı

```
haber-sitesi/
├── backend/          Laravel 12 API (PHP 8.5 + MySQL + MongoDB Desteği)
├── frontend/         Next.js 16 (React 19 + TypeScript + Tailwind CSS)
├── docs/             Kurulum, dağıtım ve mimari belgeleri (DEPLOYMENT.md)
├── start.bat         Tek tıkla backend ve frontend'i başlatan Windows betiği
└── .vscode/          Çalışma alanı ayarları
```

---

## ⚡ Hızlı Başlangıç (Geliştirme Ortamı)

### Seçenek 1: Tek Tıkla Başlatma (Tavsiye Edilen)
Proje ana dizinindeki `start.bat` dosyasını çift tıklayarak veya komut satırından çalıştırın:
```bash
start.bat
```

### Seçenek 2: Manuel Başlatma
```bash
# Terminal 1: Backend
cd backend
C:\php85\php.exe artisan serve    # http://localhost:8000

# Terminal 2: Frontend
cd frontend
npm run dev                       # http://localhost:3000
```

---

## 🔐 Yönetim Paneli (Admin)

- **URL:** [http://localhost:3000/admin](http://localhost:3000/admin)

- **E-Posta:** `admin@habersitesi.com`
- **Şifre:** `password123`

### Yönetim Kabiliyetleri:
- **Haberler:** Zengin metin editörü, görsel yükleme, taslak/yayın durumu, manşet (is_featured) yönetimi.
- **Kategoriler:** Kategori oluşturma, düzenleme, navbar ve öne çıkarma ayarları.
- **Yazarlar:** Biyografi, avatar ve editör yönetimi.
- **Yorumlar & Moderasyon:** Okuyucu yorumlarını listeleme, anında onaylama/yayından kaldırma ve silme.
- **Bülten:** Abone olan kullanıcıları listeleme ve CSV formatında dışa aktarma.
- **Yöneticiler:** Admin kullanıcı ekleme ve şifre yönetimi.

---

## 🍃 MongoDB Entegrasyonu & Senkronizasyon

Sistem ana veritabanı olarak ilişkisel bütünlük için **MySQL** kullanır ve istenildiği anda tüm verileri **MongoDB** NoSQL veritabanına tek komutla aktarabilen senkronizasyon motoruna sahiptir:

1. `backend/.env` dosyasındaki `MONGODB_URI` değerini belirleyin (örneğin yerel `mongodb://127.0.0.1:27017` veya MongoDB Atlas Cloud bağlantı adresiniz `mongodb+srv://...`).
2. Senkronizasyonu başlatın:
```bash
cd backend
C:\php85\php.exe artisan mongo:sync
```
Tüm kategoriler, yazarlar, haberler, kullanıcılar, okuyucu yorumları ve bülten aboneleri otomatik olarak MongoDB koleksiyonlarına aktarılır.

---

## 📰 Sayfa ve Rota Haritası

- `/` — Ana sayfa (Hero Slider Manşet, Öne Çıkanlar, Kategorik Bloklar, Yazarlar)
- `/haberler` — Canlı haber ve gündem akışı (Filtreleme, Sıralama, Arama)
- `/haberler/[slug]` — Haber detay sayfası (Sayfalamalı haber okuma, benzer içerikler, canlı yorum sistemi)
- `/kategori/[slug]` — Kategoriye özel haber listesi
- `/yazar/[slug]` — Editör ve yazar profil sayfası, tüm yazıları
- `/kunye` — İmtiyaz sahibi, yazı işleri ve yayın ilkeleri
- `/gizlilik` — Gizlilik politikası ve çerez bildirimleri
- `/kullanim-sartlari` — Telif hakları ve alıntı kuralları
- `/kvkk` — 6698 sayılı kanun kapsamındaki aydınlatma metni
- `/robots.txt` & `/sitemap.xml` — Arama motoru optimizasyonu (SEO)

---

## 🧪 Test & Doğrulama

Backend API birim ve entegrasyon testlerini çalıştırmak için:
```bash
cd backend
C:\php85\php.exe artisan test
```
*Tüm testler (23/23) eksiksiz olarak geçmektedir.*

Frontend üretim derlemesini (production build) test etmek için:
```bash
cd frontend
npm run build
```
*(28 statik ve dinamik rota hatasız derlenmektedir.)*
