import type {
  ApiErrorPayload,
  Author,
  Category,
  News,
  User,
  Comment,
  SiteSettings,
} from "@/types/uygulama";
import { ApiError } from "@/types/uygulama";

export { ApiError } from "@/types/uygulama";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const TOKEN_KEY = "haber_admin_token";

type ResourceResponse<T> = { data: T };

type RequestOptions = RequestInit & {
  json?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.json === undefined ? options.body : JSON.stringify(options.json),
  });

  const payload = (await response.json().catch(() => ({}))) as
    | T
    | ApiErrorPayload;

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.startsWith("/admin/login")) {
        window.location.assign(new URL(`/admin/login?next=${encodeURIComponent(window.location.pathname)}`, window.location.origin).toString());
      }
    }
    throw new ApiError(response.status, payload as ApiErrorPayload);
  }

  return payload as T;
}

function unwrap<T>(response: ResourceResponse<T> | T): T {
  if (typeof response === "object" && response !== null && "data" in response) {
    return (response as ResourceResponse<T>).data;
  }

  return response as T;
}

export const authApi = {
  async login(email: string, password: string, remember: boolean = false): Promise<User> {
    const response = await request<{ token: string; user: User }>("/login", {
      method: "POST",
      json: { email, password, remember },
    });
    window.localStorage.setItem(TOKEN_KEY, response.token);
    if (remember) {
      window.localStorage.setItem("haber_admin_remember_email", email);
      window.localStorage.setItem("haber_admin_remember", "true");
    } else {
      window.localStorage.removeItem("haber_admin_remember_email");
      window.localStorage.removeItem("haber_admin_remember");
    }
    return response.user;
  },
  async user(): Promise<User> {
    return request<User>("/user");
  },
  async logout(): Promise<void> {
    await request("/logout", { method: "POST" });
    window.localStorage.removeItem(TOKEN_KEY);
  },
  hasToken(): boolean {
    return typeof window !== "undefined" && Boolean(window.localStorage.getItem(TOKEN_KEY));
  },
  clearToken(): void {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  },
};

export const newsApi = {
  list: async (): Promise<News[]> => unwrap(await request<ResourceResponse<News[]>>("/news")),
  get: async (id: number | string): Promise<News> => unwrap(await request<ResourceResponse<News>>(`/news/${id}`)),
  create: async (data: Partial<News>): Promise<News> =>
    unwrap(await request<ResourceResponse<News>>("/news", { method: "POST", json: data })),
  update: async (id: number | string, data: Partial<News>): Promise<News> =>
    unwrap(await request<ResourceResponse<News>>(`/news/${id}`, { method: "PUT", json: data })),
  remove: (id: number | string): Promise<void> => request(`/news/${id}`, { method: "DELETE" }),
};

export const categoriesApi = {
  list: async (): Promise<Category[]> => unwrap(await request<ResourceResponse<Category[]>>("/categories")),
  get: async (id: number | string): Promise<Category> => unwrap(await request<ResourceResponse<Category>>(`/categories/${id}`)),
  create: async (data: Pick<Category, "name" | "slug" | "description" | "icon" | "is_featured" | "show_in_navbar">): Promise<Category> =>
    unwrap(await request<ResourceResponse<Category>>("/categories", { method: "POST", json: data })),
  update: async (id: number | string, data: Pick<Category, "name" | "slug" | "description" | "icon" | "is_featured" | "show_in_navbar">): Promise<Category> =>
    unwrap(await request<ResourceResponse<Category>>(`/categories/${id}`, { method: "PUT", json: data })),
  remove: (id: number | string): Promise<void> => request(`/categories/${id}`, { method: "DELETE" }),
};

export const authorsApi = {
  list: async (): Promise<Author[]> => unwrap(await request<ResourceResponse<Author[]>>("/authors")),
  get: async (id: number | string): Promise<Author> => unwrap(await request<ResourceResponse<Author>>(`/authors/${id}`)),
  create: async (data: Omit<Author, "id">): Promise<Author> =>
    unwrap(await request<ResourceResponse<Author>>("/authors", { method: "POST", json: data })),
  update: async (id: number | string, data: Partial<Author>): Promise<Author> =>
    unwrap(await request<ResourceResponse<Author>>(`/authors/${id}`, { method: "PUT", json: data })),
  remove: (id: number | string): Promise<void> => request(`/authors/${id}`, { method: "DELETE" }),
};

export const usersApi = {
  list: async (): Promise<User[]> => request<User[]>("/users"),
  get: async (id: number | string): Promise<User> => request<User>(`/users/${id}`),
  create: async (data: { name: string; email: string; password: string }): Promise<User> =>
    request<User>("/users", { method: "POST", json: data }),
  update: async (id: number | string, data: { name?: string; email?: string; password?: string }): Promise<User> =>
    request<User>(`/users/${id}`, { method: "PUT", json: data }),
  remove: (id: number | string): Promise<void> => request(`/users/${id}`, { method: "DELETE" }),
};

export const uploadsApi = {  async image(file: File): Promise<{ url: string; path: string }> {
    const headers = new Headers({ Accept: "application/json" });
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const body = new FormData();
    body.append("image", file);
    const response = await fetch(`${API_URL}/uploads/image`, { method: "POST", headers, body });
    const payload = (await response.json().catch(() => ({}))) as { url?: string; path?: string } & ApiErrorPayload;
    if (!response.ok || !payload.url || !payload.path) throw new ApiError(response.status, payload);
    return { url: payload.url, path: payload.path };
  },
};

export const newsletterApi = {
  list: async (): Promise<{ id: number | string; email: string; created_at: string }[]> =>
    request<{ id: number | string; email: string; created_at: string }[]>("/newsletter/subscribers"),
  remove: (id: number | string): Promise<void> =>
    request(`/newsletter/subscribers/${id}`, { method: "DELETE" }),
  subscribe: (email: string): Promise<{ message: string; subscribed: boolean }> =>
    request<{ message: string; subscribed: boolean }>("/newsletter/subscribe", {
      method: "POST",
      json: { email },
    }),
};

export const commentsApi = {
  listForNews: (newsId: number | string): Promise<Comment[]> =>
    request<Comment[]>(`/news/${newsId}/comments`),
  create: (
    newsId: number | string,
    data: { name: string; content: string }
  ): Promise<{ message: string; comment: Comment }> =>
    request<{ message: string; comment: Comment }>(`/news/${newsId}/comments`, {
      method: "POST",
      json: data,
    }),
  like: (commentId: number | string): Promise<{ message: string; likes: number }> =>
    request<{ message: string; likes: number }>(`/comments/${commentId}/like`, {
      method: "POST",
    }),
  listAll: (params?: {
    status?: string;
    search?: string;
    page?: number;
  }): Promise<{ data: Comment[]; total: number }> => {
    const sp = new URLSearchParams();
    if (params?.status) sp.set("status", params.status);
    if (params?.search) sp.set("search", params.search);
    if (params?.page) sp.set("page", String(params.page));
    const qs = sp.toString();
    return request<{ data: Comment[]; total: number }>(`/comments${qs ? `?${qs}` : ""}`);
  },
  toggle: (id: number | string): Promise<{ message: string; comment: Comment }> =>
    request<{ message: string; comment: Comment }>(`/comments/${id}/toggle`, {
      method: "PATCH",
    }),
  remove: (id: number | string): Promise<{ message: string }> =>
    request<{ message: string }>(`/comments/${id}`, { method: "DELETE" }),
};

export const settingsApi = {
  get: async (): Promise<SiteSettings> => {
    const res = await request<{ settings: SiteSettings }>("/settings");
    return res.settings;
  },
  update: async (data: Partial<SiteSettings>): Promise<{ message: string; settings: SiteSettings }> => {
    return request<{ message: string; settings: SiteSettings }>("/settings", {
      method: "POST",
      json: data,
    });
  },
  uploadLogo: async (file: File): Promise<{ message: string; url: string; settings: SiteSettings }> => {
    const formData = new FormData();
    formData.append("logo", file);
    return request<{ message: string; url: string; settings: SiteSettings }>("/settings/logo", {
      method: "POST",
      body: formData,
    });
  },
  uploadFavicon: async (file: File): Promise<{ message: string; url: string; settings: SiteSettings }> => {
    const formData = new FormData();
    formData.append("favicon", file);
    return request<{ message: string; url: string; settings: SiteSettings }>("/settings/favicon", {
      method: "POST",
      body: formData,
    });
  },
};

export { TOKEN_KEY };
