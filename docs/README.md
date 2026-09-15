# WebHaber - Modern Haber Portalı

Teknoloji, yapay zeka, girişimcilik ve yatırım dünyasından güncel haberleri sunan modern web aplikasyonu.

## 📋 Özellikler

### Frontend (Next.js 16)
- **Modern Design**: Responsive ve kullanıcı dostu arayüz
- **SEO Optimized**: Meta tags, sitemap, Open Graph desteği
- **Performance**: Image optimization, lazy loading
- **PWA Ready**: Progressive Web App desteği
- **TypeScript**: Type-safe development

### Backend (Laravel 13)
- **RESTful API**: Tam CRUD operasyonları
- **Authentication**: Laravel Sanctum token authentication
- **File Upload**: Image upload ve optimization
- **Database**: SQLite/MySQL desteği
- **Admin Panel**: Tam özellikli içerik yönetimi

### Admin Panel Özellikleri
- ✅ **Haber Yönetimi**: Oluştur, düzenle, sil, yayınla
- ✅ **Kategori Yönetimi**: Dinamik kategori sistemi
- ✅ **Yazar Yönetimi**: Yazar profilleri ve bio
- ✅ **Kullanıcı Yönetimi**: Admin kullanıcı kontrolü
- ✅ **Görsel Yöneticisi**: Drag&drop file upload
- ✅ **Rich Text Editor**: WYSIWYG editör
- ✅ **SEO Tools**: Slug optimization, meta tags

## 🚀 Kurulum

### Backend Kurulumu

```bash
cd backend

# Dependencies
composer install

# Environment
cp .env.example .env
php artisan key:generate

# Database
php artisan migrate:fresh --seed

# Start server
php artisan serve
```

### Frontend Kurulumu

```bash
cd frontend

# Dependencies
npm install

# Environment
cp .env.example .env.local

# Development
npm run dev

# Production build
npm run build
npm start
```

## 🔧 Konfigürasyon

### Backend (.env)
```env
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database/database.sqlite
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 📁 Proje Yapısı

### Backend
```
backend/
├── app/Http/Controllers/Api/    # API Controllers
├── app/Models/                  # Eloquent Models  
├── app/Http/Resources/         # API Resources
├── database/migrations/        # Database Schema
├── routes/api.php             # API Routes
└── public/storage/            # Uploaded Files
```

### Frontend
```
frontend/
├── src/app/                   # App Router Pages
├── src/components/           # React Components
├── src/lib/                 # Utilities & API
├── src/types/              # TypeScript Types
└── public/                # Static Assets
```

## 🌐 API Endpoints

### Public Endpoints
- `GET /api/news` - Haber listesi
- `GET /api/news/{slug}` - Haber detayı
- `GET /api/categories` - Kategori listesi
- `GET /api/authors` - Yazar listesi
- `POST /api/news/{id}/view` - Görüntülenme sayısı

### Protected Endpoints (Requires Token)
- `POST /api/login` - Admin girişi
- `GET /api/user` - Mevcut kullanıcı
- `POST/PUT/DELETE /api/news` - Haber CRUD
- `POST/PUT/DELETE /api/categories` - Kategori CRUD
- `POST/PUT/DELETE /api/authors` - Yazar CRUD
- `POST/PUT/DELETE /api/users` - Kullanıcı CRUD

## 🔐 Authentication

Admin paneli için varsayılan giriş bilgileri:
- **Email**: `admin@habersitesi.com`
- **Password**: `password123`

## 📱 Sayfalar

### Public Pages
- `/` - Ana sayfa
- `/haberler` - Tüm haberler
- `/haberler/[slug]` - Haber detay
- `/kategori/[slug]` - Kategori sayfası  
- `/yazar/[slug]` - Yazar sayfası
- `/arama` - Arama sayfası

### Admin Pages  
- `/admin/login` - Admin girişi
- `/admin` - Dashboard
- `/admin/news` - Haber yönetimi
- `/admin/categories` - Kategori yönetimi
- `/admin/authors` - Yazar yönetimi
- `/admin/users` - Kullanıcı yönetimi

## 🎨 Tasarım Sistemi

- **Colors**: Slate + Rose accent
- **Typography**: Inter font family
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Components**: Custom design system

## 🚀 Production Deployment

### Backend (Laravel)

```bash
# Optimize for production
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache

# File permissions
chmod -R 755 storage bootstrap/cache
```

### Frontend (Next.js)

```bash
# Build for production
npm run build

# Start production server
npm start

# Or static export
npm run export
```

### Web Server (Nginx)

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    root /path/to/backend/public;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        include fastcgi_params;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/frontend/out;
    
    location / {
        try_files $uri $uri.html $uri/ =404;
    }
}
```

## 📊 Performans

- **Lighthouse Score**: 95+ 
- **Page Load**: < 2s
- **Bundle Size**: < 500kb gzipped
- **Image Optimization**: Next.js automatic
- **Caching**: Browser + API caching

## 🛠 Geliştirme

### Yeni Özellik Ekleme

1. Backend'de API endpoint oluştur
2. Frontend'de API client ekle  
3. UI komponenti geliştir
4. Type definitions güncelle
5. Admin panelini genişlet

### Code Standards

- **Backend**: PSR-12, Laravel conventions
- **Frontend**: ESLint, Prettier, TypeScript strict
- **Git**: Conventional commits
- **Testing**: PHPUnit (backend), Jest (frontend)

## 📞 Destek

Proje hakkında sorularınız için:
- GitHub Issues
- Email: support@webhaber.com

## 📄 Lisans

MIT License - Detaylar için `LICENSE` dosyasını inceleyin.

---

**WebHaber** - Modern web teknolojileri ile geliştirilmiş, ölçeklenebilir haber portalı.