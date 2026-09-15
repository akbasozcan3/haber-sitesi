import type { Author, Category, News, NewsFilterParams } from "@/types/uygulama";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type ResourceResponse<T> = { data: T };

async function publicRequest<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...options?.headers,
      },
      cache: "no-store",
    });

    if (response.status === 404) return null;
    if (!response.ok) {
      console.warn(`API uyarisi: [${response.status}] ${path}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`API istegi basarisiz oldu: ${path}`, error);
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
  return response?.data ?? [];
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
  return response?.data ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const response = await publicRequest<ResourceResponse<Category[]>>("/categories");
  return response?.data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const response = await publicRequest<ResourceResponse<Category>>(`/categories/${encodeURIComponent(slug)}`);
  return response?.data ?? null;
}

export async function getAuthors(): Promise<Author[]> {
  const response = await publicRequest<ResourceResponse<Author[]>>("/authors");
  return response?.data ?? [];
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const response = await publicRequest<ResourceResponse<Author>>(`/authors/${encodeURIComponent(slug)}`);
  return response?.data ?? null;
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

