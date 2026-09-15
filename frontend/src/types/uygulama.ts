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
