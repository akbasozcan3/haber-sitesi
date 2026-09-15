"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { settingsApi } from "@/lib/istemci";
import type { SiteSettings } from "@/types/uygulama";

const STORAGE_KEY = "zernews_cached_settings";

const DEFAULT_SETTINGS: SiteSettings = {
  site_logo: "",
  site_logo_type: "image",
  site_logo_height: 52,
  site_favicon: "/storage/logos/favicon_default.png",
  site_title: "Zernews",
  site_tagline: "Teknoloji ve Girişim Ekosistemi",
  ads_enabled: "1",
  adsense_client: "ca-pub-4161709832087107",
  adsense_slot_header: "",
  adsense_slot_billboard: "",
  adsense_slot_sidebar: "",
  adsense_slot_article: "",
  ad_mode: "auto",
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (data: Partial<SiteSettings>) => Promise<void>;
  uploadLogo: (file: File) => Promise<string>;
  uploadFavicon: (file: File) => Promise<string>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SETTINGS,
  loading: false,
  refreshSettings: async () => {},
  updateSettings: async () => {},
  uploadLogo: async () => "",
  uploadFavicon: async () => "",
});

interface SiteSettingsProviderProps {
  children: ReactNode;
  initialSettings?: SiteSettings;
}

export function SiteSettingsProvider({ children, initialSettings }: SiteSettingsProviderProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings ?? DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setSettings((prev) => ({
            ...prev,
            ...parsed,
            site_logo_height: Number(parsed.site_logo_height) || prev.site_logo_height,
          }));
        }
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === "object") {
            setSettings((prev) => ({
              ...prev,
              ...parsed,
              site_logo_height: Number(parsed.site_logo_height) || prev.site_logo_height,
            }));
          }
        } catch {}
      }
    };

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail) {
        setSettings((prev) => ({
          ...prev,
          ...customEvent.detail,
          site_logo_height: Number(customEvent.detail.site_logo_height) || prev.site_logo_height,
        }));
      }
    };

    const handleFocus = () => {
      loadSettings();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("site-settings-changed", handleCustomChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("site-settings-changed", handleCustomChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const [loading, setLoading] = useState(!initialSettings);

  async function loadSettings() {
    try {
      const data = await settingsApi.get();
      if (data) {
        const newSettings: SiteSettings = {
          site_logo: data.site_logo || "",
          site_logo_type: data.site_logo_type === "image" ? "image" : "text",
          site_logo_height: Number(data.site_logo_height) || DEFAULT_SETTINGS.site_logo_height,
          site_favicon: data.site_favicon || DEFAULT_SETTINGS.site_favicon || "",
          site_title: data.site_title || "Zernews",
          site_tagline: data.site_tagline || "Teknoloji ve Girişim Ekosistemi",
          ads_enabled: data.ads_enabled ?? DEFAULT_SETTINGS.ads_enabled,
          adsense_client: data.adsense_client || DEFAULT_SETTINGS.adsense_client,
          adsense_slot_header: data.adsense_slot_header || "",
          adsense_slot_billboard: data.adsense_slot_billboard || "",
          adsense_slot_sidebar: data.adsense_slot_sidebar || "",
          adsense_slot_article: data.adsense_slot_article || "",
          ad_mode: data.ad_mode || "auto",
        };
        setSettings(newSettings);
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
          } catch {}
        }
      }
    } catch {
      // API fallback
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialSettings && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSettings));
      } catch {}
    }
    loadSettings();
  }, [initialSettings]);

  useEffect(() => {
    // Sekme başlığını dinamik senkronize et
    if (typeof window !== "undefined" && settings.site_title) {
      if (document.title.includes("Zernews") || !document.title) {
        document.title = `${settings.site_title} | ${settings.site_tagline || "Teknoloji ve Girişim Ekosistemi"}`;
      }
    }
  }, [settings.site_title, settings.site_tagline]);

  async function updateSettings(data: Partial<SiteSettings>) {
    const res = await settingsApi.update(data);
    if (res?.settings) {
      setSettings(res.settings);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(res.settings));
          window.dispatchEvent(new CustomEvent("site-settings-changed", { detail: res.settings }));
          if (res.settings.site_title) {
            document.title = `${res.settings.site_title} - ${res.settings.site_tagline || "Teknoloji ve Girişim Ekosistemi"}`;
          }
        } catch {}
      }
    }
  }

  async function uploadLogo(file: File): Promise<string> {
    const res = await settingsApi.uploadLogo(file);
    if (res?.settings) {
      setSettings(res.settings);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(res.settings));
          window.dispatchEvent(new CustomEvent("site-settings-changed", { detail: res.settings }));
        } catch {}
      }
    }
    return res.url;
  }

  async function uploadFavicon(file: File): Promise<string> {
    const res = await settingsApi.uploadFavicon(file);
    if (res?.settings) {
      setSettings(res.settings);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(res.settings));
          window.dispatchEvent(new CustomEvent("site-settings-changed", { detail: res.settings }));
          // Dynamically change browser tab favicon
          const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          if (link) link.href = res.url;
        } catch {}
      }
    }
    return res.url;
  }

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: loadSettings,
        updateSettings,
        uploadLogo,
        uploadFavicon,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
