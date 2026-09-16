export type Id = number | string;

export interface Category {
  id: Id;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  is_featured?: boolean;
  show_in_navbar?: boolean;
  news_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 22, name: "Yapay Zeka", slug: "yapay-zeka", show_in_navbar: true, is_featured: true },
  { id: 23, name: "Girişimler", slug: "girisimler", show_in_navbar: true, is_featured: true },
  { id: 24, name: "Yatırım", slug: "yatirim", show_in_navbar: true, is_featured: true },
  { id: 25, name: "Fintek", slug: "fintek", show_in_navbar: true, is_featured: true },
  { id: 26, name: "E-Ticaret", slug: "e-ticaret", show_in_navbar: true, is_featured: true },
  { id: 27, name: "SaaS & Yazılım", slug: "saas", show_in_navbar: true, is_featured: true },
  { id: 28, name: "Mobilite", slug: "mobilite", show_in_navbar: true, is_featured: false },
  { id: 29, name: "Siber Güvenlik", slug: "siber-guvenlik", show_in_navbar: true, is_featured: false },
];

export const DEFAULT_AUTHORS: Author[] = [
  {
    id: 1,
    name: "Tuğçe İçözü",
    slug: "tugce-icozu",
    email: "tugce@zernews.com",
    bio: "Kıdemli teknoloji yazarı, üretken yapay zeka sistemleri ve küresel teknoloji trendleri analisti.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 5,
    name: "Arda Güler",
    slug: "arda-guler",
    email: "arda@zernews.com",
    bio: "Girişimcilik ve risk sermayesi masası şefi, melek yatırım ekosistemi araştırmacısı.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 6,
    name: "Ahmet Can",
    slug: "ahmet-can",
    email: "ahmet@zernews.com",
    bio: "Fintek ve ödeme sistemleri uzmanı, dijital varlıklar ve açık bankacılık yazarı.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 7,
    name: "Zeynep Kaya",
    slug: "zeynep-kaya",
    email: "zeynep@zernews.com",
    bio: "B2B SaaS, bulut mimarileri ve siber güvenlik araştırmacısı.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
  },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  site_logo: "/icon.png",
  site_logo_type: "text",
  site_logo_height: "40",
  site_favicon: "/icon.png",
  site_title: "Zernews",
  site_tagline: "Teknoloji, Yapay Zeka & Girişim Ekosistemi",
  site_description: "Zernews - Türkiye ve küresel teknoloji ekosistemine odaklı en güncel yapay zeka, girişimcilik, fintek ve yatırım haberleri.",
  ads_enabled: "1",
  adsense_client: "ca-pub-4161709832087107",
  ad_mode: "auto",
};

export const DEFAULT_NEWS: News[] = [
  {
    id: 43,
    category_id: 22,
    author_id: 1,
    title: "Yapay zeka arama motoru Perplexity, 9 milyar dolar değerleme ile yeni yatırım turuna çıkıyor",
    slug: "perplexity-9-milyar-dolar-degerleme-yatirim",
    excerpt: "Geleneksel web aramalarını dönüştüren Perplexity AI, SoftBank ve küresel fonların liderliğinde yeni fonlama turunu tamamlamaya hazırlanıyor.",
    content: "## Arama Motoru Pazarında Yeni Güç Dengesi\\n\\nYapay zeka tabanlı doğrudan yanıt motoru **Perplexity AI**, değerlemesini bir önceki turun neredeyse üç katına çıkararak 9 milyar dolar seviyesine ulaştırdı. Şirket, kurumsal abonelik gelirlerindeki yüzde 400'lük artış ve yeni nesil finansal araştırma modülleriyle pazar payını hızla büyütüyor.\\n\\n### Kurumsal Müşteri Tabanında Büyük Artış\\n\\nFortune 500 şirketlerinin yarısından fazlasının kurum içi bilgi aramaları için Perplexity Enterprise Pro kullandığı belirtiliyor. Yeni kaynak, çok modlu akıl yürütme altyapısının geliştirilmesi ve veri merkezlerinin ölçeklendirilmesi için kullanılacak.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    is_featured: true,
    views: 1420,
    published_at: "2026-09-14T05:12:01.000000Z",
    category: { id: 22, name: "Yapay Zeka", slug: "yapay-zeka" },
    author: {
      id: 1,
      name: "Tuğçe İçözü",
      slug: "tugce-icozu",
      bio: "Kıdemli teknoloji yazarı, üretken yapay zeka sistemleri ve küresel teknoloji trendleri analisti.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    },
  },
  {
    id: 45,
    category_id: 25,
    author_id: 6,
    title: "Merkez Bankası Dijital Türk Lirası Faz 2 pilot testlerini bankalarla başlattı",
    slug: "dijital-turk-lirasi-faz-2-pilot-testleri",
    excerpt: "Dağıtık defter teknolojisi üzerinde çalışan Dijital Türk Lirası, toptan ve perakende ödeme senaryolarıyla pilot bankaların mobil uygulamalarına entegre edildi.",
    content: "## Geleceğin Para Mimarisi Şekilleniyor\\n\\nTCMB öncülüğünde yürütülen Dijital Türk Lirası İşbirliği Platformu, ikinci faz pilot testlerini kamu ve özel bankaların katılımıyla hayata geçirdi. Bu aşamada akıllı sözleşmeler ve programlanabilir ödeme altyapıları test ediliyor.\\n\\n### Pilot Fazın Ana Odak Noktaları\\n\\n- **Çevrimdışı Ödemeler:** İnternet bağlantısı olmaksızın cihazdan cihaza güvenli bakiye transferi.\\n- **Toptan Mutabakat:** Bankalar arası yüksek tutarlı transferlerin saniyeler içinde kesinleşmesi.",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    is_featured: true,
    views: 980,
    published_at: "2026-09-13T23:12:01.000000Z",
    category: { id: 25, name: "Fintek", slug: "fintek" },
    author: {
      id: 6,
      name: "Ahmet Can",
      slug: "ahmet-can",
      bio: "Fintek ve ödeme sistemleri uzmanı, dijital varlıklar ve açık bankacılık yazarı.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    },
  },
  {
    id: 44,
    category_id: 23,
    author_id: 5,
    title: "Otonom depo robotları geliştiren yerli girişim Robex, 8 milyon dolar tohum yatırım aldı",
    slug: "yerli-girisim-robex-tohum-yatirim",
    excerpt: "E-ticaret lojistik merkezlerinde palet ve koli taşımacılığını yapay zeka destekli otonom mobil robotlarla dönüştüren Robex, Avrupa operasyonlarını genişletiyor.",
    content: "## Akıllı Depolarda Yerli Teknoloji İmzası\\n\\nİstanbul ve Berlin merkezli robotik girişimi **Robex**, Seri Tohum turunda Avrupa merkezli fonların liderliğinde 8 milyon dolar yatırım almayı başardı. Girişim, geleneksel forklift ve manuel taşımayı ortadan kaldıran haritasız otonom sürüş teknolojisiyle öne çıkıyor.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    is_featured: false,
    views: 750,
    published_at: "2026-09-14T02:12:01.000000Z",
    category: { id: 23, name: "Girişimler", slug: "girisimler" },
    author: {
      id: 5,
      name: "Arda Güler",
      slug: "arda-guler",
      bio: "Girişimcilik ve risk sermayesi masası şefi, melek yatırım ekosistemi araştırmacısı.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    },
  },
  {
    id: 46,
    category_id: 24,
    author_id: 5,
    title: "Earlybird Digital East, Doğu Avrupa ve Türkiye odaklı 200 milyon dolarlık yeni fon kapattı",
    slug: "earlybird-digital-east-200-milyon-dolar-fon",
    excerpt: "UiPath ve Trendyol gibi devlerin ilk kurumsal yatırımcısı olan Earlybird Digital East, tohum ve Seri A aşamasındaki derin teknoloji ve SaaS girişimlerine odaklanacak.",
    content: "## Bölgenin En Büyük Girişim Sermayesi Fonu\\n\\nRisk sermayesi sektörünün küresel oyuncularından **Earlybird Digital East**, üçüncü fonunu 200 milyon dolar taahhütle tamamladı. Fon, bölgeden çıkan ve küresel pazarlara yazılım ihraç eden ekipleri finanse etmeye devam edecek.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    is_featured: false,
    views: 620,
    published_at: "2026-09-13T19:12:01.000000Z",
    category: { id: 24, name: "Yatırım", slug: "yatirim" },
    author: {
      id: 5,
      name: "Arda Güler",
      slug: "arda-guler",
      bio: "Girişimcilik ve risk sermayesi masası şefi, melek yatırım ekosistemi araştırmacısı.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    },
  },
  {
    id: 47,
    category_id: 26,
    author_id: 1,
    title: "Yapay zeka ile kişiselleştirilmiş canlı yayın alışverişi e-ticaret dönüşümünü üçe katladı",
    slug: "yapay-zeka-canli-yayin-alisverisi-donusum",
    excerpt: "Kullanıcının geçmiş zevklerini ve gerçek zamanlı etkileşimlerini analiz eden yapay zeka avatarları, canlı yayında kişiye özel indirimler sunarak sepet terk oranını düşürüyor.",
    content: "## Yeni Nesil Sosyal Ticaret Trendi\\n\\nE-ticaret platformları, standart ürün sayfaları yerine yapay zeka moderatörlü etkileşimli canlı yayınlara ağırlık veriyor. Türkiye'deki öncü pazaryerlerinde yapılan testler, canlı video alışverişinin sepet tamamlama oranını yüzde 24'ten yüzde 68'e çıkardığını gösteriyor.",
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    is_featured: false,
    views: 890,
    published_at: "2026-09-13T07:12:01.000000Z",
    category: { id: 26, name: "E-Ticaret", slug: "e-ticaret" },
    author: {
      id: 1,
      name: "Tuğçe İçözü",
      slug: "tugce-icozu",
      bio: "Kıdemli teknoloji yazarı, üretken yapay zeka sistemleri ve küresel teknoloji trendleri analisti.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    },
  },
  {
    id: 40,
    category_id: 27,
    author_id: 7,
    title: "B2B SaaS şirketlerinde yapay zeka maliyetlerini optimize eden yerli platform: CloudOptimize",
    slug: "b2b-saas-yapay-zeka-maliyet-optimizasyonu-cloudoptimize",
    excerpt: "LLM ve bulut GPU harcamalarını otomatik analiz eden CloudOptimize, kurumsal firmaların model harcamalarını akıllı yönlendirmeyle yüzde 60 oranında azaltıyor.",
    content: "## Bulut Faturasında Yapay Zeka Devrimi\\n\\nBüyük dil modellerinin ve yapay zeka API'lerinin yaygınlaşması, teknoloji şirketlerinin bulut faturalarını katladı. Türk mühendisler tarafından kurulan **CloudOptimize**, istekleri en uygun maliyetli modellere yönlendirerek gerçek zamanlı tasarruf sağlıyor.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    is_featured: false,
    views: 540,
    published_at: "2026-09-09T20:20:16.000000Z",
    category: { id: 27, name: "SaaS & Yazılım", slug: "saas" },
    author: {
      id: 7,
      name: "Zeynep Kaya",
      slug: "zeynep-kaya",
      bio: "B2B SaaS, bulut mimarileri ve siber güvenlik araştırmacısı.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    },
  },
  {
    id: 41,
    category_id: 28,
    author_id: 5,
    title: "Elektrikli araç şarj ağı yatırımları hız kazandı: 81 ilde ultra hızlı şarj istasyonları",
    slug: "elektrikli-arac-sarj-agi-yatirimlari-turkiye",
    excerpt: "EPDK verilerine göre Türkiye'deki soket sayısı 30 bini aştı. Yerli şebeke operatörleri 300 kW üzeri DC hızlı şarj teknolojilerine 250 milyon dolarlık ek bütçe ayırdı.",
    content: "## Otoyollarda Kesintisiz Elektrikli Ulaşım\\n\\nTogg ve küresel elektrikli araç modellerinin pazar payını hızla artırmasıyla birlikte şarj altyapısı yatırımları kritik bir eşiği aştı. Şarj süreleri yeni nesil istasyonlarda 15 dakikaya kadar indi.",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    is_featured: false,
    views: 430,
    published_at: "2026-09-09T19:20:16.000000Z",
    category: { id: 28, name: "Mobilite", slug: "mobilite" },
    author: {
      id: 5,
      name: "Arda Güler",
      slug: "arda-guler",
      bio: "Girişimcilik ve risk sermayesi masası şefi, melek yatırım ekosistemi araştırmacısı.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    },
  },
  {
    id: 42,
    category_id: 29,
    author_id: 7,
    title: "Yapay zeka güdümlü otonom siber saldırılara karşı Sıfır Güven (Zero Trust) zorunluluğu",
    slug: "otonom-siber-saldirilar-sifir-guven-mimarisi",
    excerpt: "Deepfake ve otonom kimlik avı saldırılarının yüzde 300 arttığı 2026 yılında, kurumsal BT liderleri klasik çevre güvenliği yerine Sıfır Güven (Zero Trust) mimarisine geçiş yapıyor.",
    content: "## Kurumsal Ağlarda Her İstek Doğrulanmak Zorunda\\n\\nSiber güvenlik uzmanları, çalışanların kimlik bilgilerinin çalınmasını önlemek için donanım tabanlı güvenlik anahtarları ve biyometrik doğrulama standartlarının artık bir tercih değil yasal zorunluluk haline geldiğini belirtiyor.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    is_featured: false,
    views: 780,
    published_at: "2026-09-09T13:20:16.000000Z",
    category: { id: 29, name: "Siber Güvenlik", slug: "siber-guvenlik" },
    author: {
      id: 7,
      name: "Zeynep Kaya",
      slug: "zeynep-kaya",
      bio: "B2B SaaS, bulut mimarileri ve siber güvenlik araştırmacısı.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    },
  },
  {
    id: 54,
    category_id: 24,
    author_id: 5,
    title: "BIST Teknoloji Endeksi yabancı fon girişleriyle tarihi rekor tazeledi",
    slug: "bist-teknoloji-endeksi-yabanci-fon-girisleri-rekor",
    excerpt: "Yazılım ihracatı yapan yerli teknoloji şirketlerinin bilançolarındaki güçlü büyüme, kurumsal yabancı yatırımcıların Borsa İstanbul teknoloji hisselerine olan ilgisini artırdı.",
    content: "## Yerli Teknoloji Şirketleri Küresel Radarda\\n\\nYüksek katma değerli yazılım, siber güvenlik ve savunma sanayi teknolojileri üreten şirketlerin işlem gördüğü endeks, yılbaşından bu yana dolar bazında yüzde 42 getiri sağladı.",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    is_featured: false,
    views: 650,
    published_at: "2026-09-09T07:12:01.000000Z",
    category: { id: 24, name: "Yatırım", slug: "yatirim" },
    author: {
      id: 5,
      name: "Arda Güler",
      slug: "arda-guler",
      bio: "Girişimcilik ve risk sermayesi masası şefi, melek yatırım ekosistemi araştırmacısı.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    },
  },
  {
    id: 56,
    category_id: 29,
    author_id: 7,
    title: "Yapay zeka deepfake saldırılarına karşı blokzincir tabanlı medya doğrulama standardı",
    slug: "deepfake-saldirilari-blokzincir-medya-dogrulama",
    excerpt: "C2PA koalisyonu tarafından onaylanan yeni kriptografik imza protokolü, kameralardan çıkan orijinal fotoğraf ve videoların değiştirilmediğini ispatlıyor.",
    content: "## Dezenformasyon Çağında Dijital Orijinallik\\n\\nSosyal ağlar ve haber ajansları, yapay zeka tarafından manipüle edilmiş içerikleri otomatik olarak süzebilen şifreli imza sistemini haber akışlarına entegre etmeye başladı.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    is_featured: false,
    views: 590,
    published_at: "2026-09-08T07:12:01.000000Z",
    category: { id: 29, name: "Siber Güvenlik", slug: "siber-guvenlik" },
    author: {
      id: 7,
      name: "Zeynep Kaya",
      slug: "zeynep-kaya",
      bio: "B2B SaaS, bulut mimarileri ve siber güvenlik araştırmacısı.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    },
  },
];

export interface Author {
  id: Id;
  name: string;
  slug: string;
  email: string;
  bio: string | null;
  avatar: string | null;
  created_at?: string;
  updated_at?: string;
}

export type NewsStatus = "draft" | "published";

export interface News {
  id: Id;
  category_id: Id;
  author_id: Id;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string | null;
  inner_image?: string | null;
  status: NewsStatus;
  is_featured: boolean;
  views: number;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
  author?: Pick<Author, "id" | "name" | "slug" | "bio" | "avatar"> | null;
}

export interface NewsFilterParams {
  category?: string;
  author?: string;
  search?: string;
  featured?: boolean | number;
  sort?: "latest" | "popular";
  limit?: number;
  status?: NewsStatus | "all";
}

export interface NewsletterSubscriber {
  id: Id;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: Id;
  name: string;
  email: string;
  is_admin?: boolean;
}

export interface SiteSettings {
  site_logo: string;
  site_logo_type: "image" | "text";
  site_logo_height?: number | string;
  site_favicon?: string;
  site_title: string;
  site_tagline: string;
  site_description?: string;
  ads_enabled?: string | boolean;
  adsense_client?: string;
  adsense_slot_header?: string;
  adsense_slot_billboard?: string;
  adsense_slot_sidebar?: string;
  adsense_slot_article?: string;
  ad_mode?: "auto" | "demo" | "sponsor" | "adsense";
}

export interface Comment {
  id: Id;
  news_id: Id;
  name: string;
  content: string;
  likes: number;
  is_approved: boolean;
  created_at: string;
  updated_at?: string;
  news?: Pick<News, "id" | "title" | "slug"> | null;
}

export interface ValidationErrors {
  [field: string]: string[];
}

export interface ApiErrorPayload {
  message?: string;
  errors?: ValidationErrors;
}

export class ApiError extends Error {
  status: number;
  validationErrors: ValidationErrors;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message || "İstek sırasında bir hata oluştu.");
    this.name = "ApiError";
    this.status = status;
    this.validationErrors = payload.errors || {};
  }
}
