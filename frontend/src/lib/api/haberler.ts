import type { Author, Category, News, NewsFilterParams } from "@/types/uygulama";
import { DEFAULT_CATEGORIES, DEFAULT_AUTHORS, DEFAULT_NEWS } from "@/types/uygulama";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

type ResourceResponse<T> = { data: T };

function shouldSkipFetch(url: string): boolean {
  if (typeof window === "undefined") {
    const isCloudEnv = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production");
    if (isCloudEnv && (url.includes("localhost") || url.includes("127.0.0.1") || url.includes("0.0.0.0"))) {
      return true;
    }
  }
  return false;
}

async function publicRequest<T>(path: string, options?: RequestInit): Promise<T | null> {
  const fullUrl = `${API_URL}${path}`;
  if (shouldSkipFetch(fullUrl)) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(fullUrl, {
      ...options,
      signal: options?.signal || controller.signal,
      headers: {
        Accept: "application/json",
        ...options?.headers,
      },
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (response.status === 404) return null;
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function buildQueryString(params?: NewsFilterParams): string {
  if (!params) return "";
  const query = new URLSearchParams();

  if (params.category) query.append("category", params.category);
  if (params.author) query.append("author", params.author);
  if (params.search) query.append("search", params.search);
  if (params.featured !== undefined) query.append("featured", String(params.featured));
  if (params.sort) query.append("sort", params.sort);
  if (params.limit) query.append("limit", String(params.limit));
  if (params.status) query.append("status", params.status);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export async function getPublicNews(params?: NewsFilterParams): Promise<News[]> {
  const qs = buildQueryString(params);
  const response = await publicRequest<ResourceResponse<News[]>>(`/news${qs}`);
  if (Array.isArray(response?.data) && response.data.length > 0) {
    return response.data;
  }

  let list = [...DEFAULT_NEWS];
  if (params?.category) {
    list = list.filter((n) => n.category?.slug === params.category);
  }
  if (params?.author) {
    list = list.filter((n) => n.author?.slug === params.author);
  }
  if (params?.featured !== undefined) {
    list = list.filter((n) => n.is_featured === Boolean(params.featured));
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    list = list.filter((n) => n.title.toLowerCase().includes(s) || n.excerpt.toLowerCase().includes(s));
  }
  if (params?.limit && params.limit > 0) {
    list = list.slice(0, params.limit);
  }
  return list;
}

export async function getFeaturedNews(limit: number = 5): Promise<News[]> {
  return getPublicNews({ featured: 1, status: "published", limit });
}

export async function getPopularNews(limit: number = 5): Promise<News[]> {
  return getPublicNews({ sort: "popular", status: "published", limit });
}

export async function getNewsByCategory(categorySlug: string, limit?: number): Promise<News[]> {
  return getPublicNews({ category: categorySlug, status: "published", limit });
}

export async function getNewsByAuthor(authorSlug: string, limit?: number): Promise<News[]> {
  return getPublicNews({ author: authorSlug, status: "published", limit });
}

export async function searchNews(searchQuery: string, limit: number = 20): Promise<News[]> {
  if (!searchQuery || !searchQuery.trim()) return [];
  return getPublicNews({ search: searchQuery.trim(), status: "published", limit });
}

export async function getNewsBySlug(slug: string): Promise<News | null> {
  const response = await publicRequest<ResourceResponse<News>>(`/news/${encodeURIComponent(slug)}`);
  if (response?.data) return response.data;
  return DEFAULT_NEWS.find((n) => n.slug === slug) || null;
}

export async function getCategories(): Promise<Category[]> {
  const response = await publicRequest<ResourceResponse<Category[]>>("/categories");
  if (Array.isArray(response?.data) && response.data.length > 0) {
    return response.data;
  }
  return DEFAULT_CATEGORIES;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const response = await publicRequest<ResourceResponse<Category>>(`/categories/${encodeURIComponent(slug)}`);
  if (response?.data) return response.data;
  return DEFAULT_CATEGORIES.find((c) => c.slug === slug) || null;
}

export async function getAuthors(): Promise<Author[]> {
  const response = await publicRequest<ResourceResponse<Author[]>>("/authors");
  if (Array.isArray(response?.data) && response.data.length > 0) {
    return response.data;
  }
  return DEFAULT_AUTHORS;
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const response = await publicRequest<ResourceResponse<Author>>(`/authors/${encodeURIComponent(slug)}`);
  if (response?.data) return response.data;
  return DEFAULT_AUTHORS.find((a) => a.slug === slug) || null;
}

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  const STORAGE_KEY = "haber_visitor_uuid";
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "v_" + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export async function incrementNewsView(
  id: number | string
): Promise<{ views: number; counted: boolean } | null> {
  const visitorId = getOrCreateVisitorId();
  const response = await publicRequest<{
    id: number;
    views: number;
    status: string;
    counted?: boolean;
  }>(`/news/${id}/view`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(visitorId ? { "X-Visitor-Id": visitorId } : {}),
    },
    body: JSON.stringify({ visitor_id: visitorId }),
  });

  if (!response) return null;
  return {
    views: response.views,
    counted: Boolean(response.counted),
  };
}

