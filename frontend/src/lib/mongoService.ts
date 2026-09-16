import { getDatabase } from "./mongodb";
import type { Category, Author, News, SiteSettings, NewsFilterParams } from "@/types/uygulama";
import { DEFAULT_SETTINGS, DEFAULT_CATEGORIES, DEFAULT_AUTHORS } from "@/types/uygulama";

export async function fetchSettingsFromMongo(): Promise<SiteSettings> {
  try {
    const db = await getDatabase();
    const docs = await db.collection("settings").find({}).toArray();
    if (!docs || docs.length === 0) return DEFAULT_SETTINGS;

    const map: Record<string, string> = {};
    for (const d of docs) {
      if (d.key && d.value !== undefined) {
        map[d.key] = String(d.value);
      }
    }

    return {
      site_logo: map.site_logo || DEFAULT_SETTINGS.site_logo,
      site_logo_type: (map.site_logo_type === "text" ? "text" : "image") as "image" | "text",
      site_logo_height: Number(map.site_logo_height) || DEFAULT_SETTINGS.site_logo_height,
      site_favicon: map.site_favicon || DEFAULT_SETTINGS.site_favicon,
      site_title: map.site_title || DEFAULT_SETTINGS.site_title,
      site_tagline: map.site_tagline || DEFAULT_SETTINGS.site_tagline,
      site_description: map.site_description || DEFAULT_SETTINGS.site_description,
      ads_enabled: map.ads_enabled ?? DEFAULT_SETTINGS.ads_enabled,
      adsense_client: map.adsense_client || DEFAULT_SETTINGS.adsense_client,
      adsense_slot_header: map.adsense_slot_header || "",
      adsense_slot_billboard: map.adsense_slot_billboard || "",
      adsense_slot_sidebar: map.adsense_slot_sidebar || "",
      adsense_slot_article: map.adsense_slot_article || "",
      ad_mode: (map.ad_mode as SiteSettings["ad_mode"]) || "auto",
    };
  } catch (err) {
    console.warn("MongoDB fetchSettings error, using defaults:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function fetchCategoriesFromMongo(): Promise<Category[]> {
  try {
    const db = await getDatabase();
    const docs = await db.collection("categories").find({}).sort({ order: 1, _id: 1 }).toArray();
    if (!docs || docs.length === 0) return DEFAULT_CATEGORIES;

    return docs.map((c) => ({
      id: c._id !== undefined ? (typeof c._id === "object" ? String(c._id) : c._id) : c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || null,
      icon: c.icon || null,
      is_featured: c.is_featured ?? true,
      show_in_navbar: c.show_in_navbar ?? true,
      news_count: c.news_count || 0,
      created_at: c.created_at ? String(c.created_at) : undefined,
      updated_at: c.updated_at ? String(c.updated_at) : undefined,
    }));
  } catch (err) {
    console.warn("MongoDB fetchCategories error, using defaults:", err);
    return DEFAULT_CATEGORIES;
  }
}

export async function fetchCategoryBySlugFromMongo(slug: string): Promise<Category | null> {
  try {
    const db = await getDatabase();
    const c = await db.collection("categories").findOne({ slug });
    if (!c) return null;

    return {
      id: c._id !== undefined ? (typeof c._id === "object" ? String(c._id) : c._id) : c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || null,
      icon: c.icon || null,
      is_featured: c.is_featured ?? true,
      show_in_navbar: c.show_in_navbar ?? true,
      news_count: c.news_count || 0,
      created_at: c.created_at ? String(c.created_at) : undefined,
      updated_at: c.updated_at ? String(c.updated_at) : undefined,
    };
  } catch {
    return null;
  }
}

export async function fetchAuthorsFromMongo(): Promise<Author[]> {
  try {
    const db = await getDatabase();
    const docs = await db.collection("authors").find({}).toArray();
    if (!docs || docs.length === 0) return DEFAULT_AUTHORS;

    return docs.map((a) => ({
      id: a._id !== undefined ? (typeof a._id === "object" ? String(a._id) : a._id) : a.id,
      name: a.name,
      slug: a.slug,
      email: a.email || "",
      bio: a.bio || null,
      avatar: a.avatar || null,
      created_at: a.created_at ? String(a.created_at) : undefined,
      updated_at: a.updated_at ? String(a.updated_at) : undefined,
    }));
  } catch (err) {
    console.warn("MongoDB fetchAuthors error, using defaults:", err);
    return DEFAULT_AUTHORS;
  }
}

export async function fetchAuthorBySlugFromMongo(slug: string): Promise<Author | null> {
  try {
    const db = await getDatabase();
    const a = await db.collection("authors").findOne({ slug });
    if (!a) return null;

    return {
      id: a._id !== undefined ? (typeof a._id === "object" ? String(a._id) : a._id) : a.id,
      name: a.name,
      slug: a.slug,
      email: a.email || "",
      bio: a.bio || null,
      avatar: a.avatar || null,
      created_at: a.created_at ? String(a.created_at) : undefined,
      updated_at: a.updated_at ? String(a.updated_at) : undefined,
    };
  } catch {
    return null;
  }
}

export async function fetchNewsFromMongo(params?: NewsFilterParams): Promise<News[]> {
  try {
    const db = await getDatabase();
    const [cats, authors] = await Promise.all([
      db.collection("categories").find({}).toArray(),
      db.collection("authors").find({}).toArray(),
    ]);

    const catMap = new Map<any, any>();
    const catSlugMap = new Map<string, any>();
    for (const c of cats) {
      catMap.set(c._id, c);
      if (c.id !== undefined) catMap.set(c.id, c);
      catSlugMap.set(c.slug, c);
    }

    const authorMap = new Map<any, any>();
    const authorSlugMap = new Map<string, any>();
    for (const a of authors) {
      authorMap.set(a._id, a);
      if (a.id !== undefined) authorMap.set(a.id, a);
      authorSlugMap.set(a.slug, a);
    }

    const query: Record<string, any> = {};
    if (params?.status && params.status !== "all") {
      query.status = params.status;
    } else {
      query.status = "published";
    }

    if (params?.featured !== undefined) {
      query.is_featured = params.featured ? { $in: [true, 1, "1"] } : { $in: [false, 0, "0", null] };
    }

    if (params?.category) {
      const targetCat = catSlugMap.get(params.category);
      if (targetCat) {
        query.category_id = targetCat._id !== undefined ? targetCat._id : targetCat.id;
      } else {
        query["category.slug"] = params.category;
      }
    }

    if (params?.author) {
      const targetAuthor = authorSlugMap.get(params.author);
      if (targetAuthor) {
        query.author_id = targetAuthor._id !== undefined ? targetAuthor._id : targetAuthor.id;
      } else {
        query["author.slug"] = params.author;
      }
    }

    if (params?.search) {
      const regex = new RegExp(params.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [{ title: regex }, { excerpt: regex }];
    }

    let sortOption: Record<string, 1 | -1> = { published_at: -1, _id: -1 };
    if (params?.sort === "popular") {
      sortOption = { views: -1, published_at: -1 };
    }

    let cursor = db.collection("news").find(query).sort(sortOption);
    if (params?.limit && params.limit > 0) {
      cursor = cursor.limit(params.limit);
    }

    const docs = await cursor.toArray();
    if (!docs || docs.length === 0) return [];

    return docs.map((n) => {
      const c = catMap.get(n.category_id);
      const a = authorMap.get(n.author_id);

      return {
        id: n._id !== undefined ? (typeof n._id === "object" ? String(n._id) : n._id) : n.id,
        category_id: n.category_id,
        author_id: n.author_id,
        title: n.title,
        slug: n.slug,
        excerpt: n.excerpt || "",
        content: n.content || "",
        image: n.image || null,
        inner_image: n.inner_image || null,
        status: (n.status === "draft" ? "draft" : "published") as "draft" | "published",
        is_featured: Boolean(n.is_featured === true || n.is_featured === 1 || n.is_featured === "1"),
        views: Number(n.views) || 0,
        published_at: n.published_at ? String(n.published_at) : null,
        created_at: n.created_at ? String(n.created_at) : undefined,
        updated_at: n.updated_at ? String(n.updated_at) : undefined,
        category: c
          ? {
              id: c._id !== undefined ? (typeof c._id === "object" ? String(c._id) : c._id) : c.id,
              name: c.name,
              slug: c.slug,
            }
          : n.category || null,
        author: a
          ? {
              id: a._id !== undefined ? (typeof a._id === "object" ? String(a._id) : a._id) : a.id,
              name: a.name,
              slug: a.slug,
              bio: a.bio || null,
              avatar: a.avatar || null,
            }
          : n.author || null,
      };
    });
  } catch (err) {
    console.warn("MongoDB fetchNews error, returning empty array:", err);
    return [];
  }
}

export async function fetchNewsBySlugFromMongo(slug: string): Promise<News | null> {
  try {
    const db = await getDatabase();
    const n = await db.collection("news").findOne({ slug });
    if (!n) return null;

    const [c, a] = await Promise.all([
      db.collection("categories").findOne({ $or: [{ _id: n.category_id }, { id: n.category_id }] }),
      db.collection("authors").findOne({ $or: [{ _id: n.author_id }, { id: n.author_id }] }),
    ]);

    return {
      id: n._id !== undefined ? (typeof n._id === "object" ? String(n._id) : n._id) : n.id,
      category_id: n.category_id,
      author_id: n.author_id,
      title: n.title,
      slug: n.slug,
      excerpt: n.excerpt || "",
      content: n.content || "",
      image: n.image || null,
      inner_image: n.inner_image || null,
      status: (n.status === "draft" ? "draft" : "published") as "draft" | "published",
      is_featured: Boolean(n.is_featured === true || n.is_featured === 1 || n.is_featured === "1"),
      views: Number(n.views) || 0,
      published_at: n.published_at ? String(n.published_at) : null,
      created_at: n.created_at ? String(n.created_at) : undefined,
      updated_at: n.updated_at ? String(n.updated_at) : undefined,
      category: c
        ? {
            id: c._id !== undefined ? (typeof c._id === "object" ? String(c._id) : c._id) : c.id,
            name: c.name,
            slug: c.slug,
          }
        : n.category || null,
      author: a
        ? {
            id: a._id !== undefined ? (typeof a._id === "object" ? String(a._id) : a._id) : a.id,
            name: a.name,
            slug: a.slug,
            bio: a.bio || null,
            avatar: a.avatar || null,
          }
        : n.author || null,
    };
  } catch {
    return null;
  }
}
