import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteLayout from "@/components/layout/SiteLayout";
import type { Category, SiteSettings } from "@/types/uygulama";
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from "@/types/uygulama";
import { fetchSettingsFromMongo, fetchCategoriesFromMongo } from "@/lib/mongoService";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

async function getInitialLayoutData(): Promise<{
  settings?: SiteSettings;
  categories: Category[];
}> {
  try {
    const [settings, categories] = await Promise.all([
      fetchSettingsFromMongo(),
      fetchCategoriesFromMongo(),
    ]);
    return {
      settings: settings || DEFAULT_SETTINGS,
      categories: categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES,
    };
  } catch {
    return { settings: DEFAULT_SETTINGS, categories: DEFAULT_CATEGORIES };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getInitialLayoutData();
  const siteTitle = settings?.site_title?.trim() || "Zernews";
  const siteTagline = settings?.site_tagline?.trim() || "Teknoloji, Yapay Zeka & Girişim Ekosistemi";
  const defaultFullTitle = `${siteTitle} - ${siteTagline}`;
  const rawFavicon = settings?.site_favicon || "/icon.png";
  const faviconUrl = rawFavicon.includes("/storage/")
    ? rawFavicon.substring(rawFavicon.indexOf("/storage/"))
    : rawFavicon.replace(/^http:\/\/(localhost|127\.0\.0\.1):8000/, "");

  return {
    title: {
      default: defaultFullTitle,
      template: `%s | ${siteTitle}`,
    },
    description:
      settings?.site_description?.trim() ||
      `${siteTitle} - Türkiye ve küresel teknoloji ekosistemine odaklı en güncel yapay zeka, girişimcilik, fintek ve yatırım haberleri.`,
    keywords: [
      "teknoloji",
      "girişimler",
      "yapay zeka",
      "yatırım",
      "fintek",
      "e-ticaret",
      "haber",
      "dijital medya",
    ],
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
    other: {
      "google-adsense-account": settings?.adsense_client?.trim() || "ca-pub-4161709832087107",
    },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { settings, categories } = await getInitialLayoutData();

  const rawFavicon = settings?.site_favicon || "/icon.png";
  const faviconUrl = rawFavicon.includes("/storage/")
    ? rawFavicon.substring(rawFavicon.indexOf("/storage/"))
    : rawFavicon.replace(/^http:\/\/(localhost|127\.0\.0\.1):8000/, "");

  return (
    <html
      lang="tr"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          id="turbopack-measure-guard"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(typeof window!=='undefined'){window.addEventListener('error',function(e){if(e&&e.message&&(e.message.indexOf('adsbygoogle')!==-1||e.message.indexOf('availableWidth')!==-1)){e.preventDefault();e.stopImmediatePropagation();return true;}},true);window.addEventListener('unhandledrejection',function(e){if(e&&e.reason&&String(e.reason).indexOf('adsbygoogle')!==-1){e.preventDefault();e.stopImmediatePropagation();}});if(window.performance&&typeof window.performance.measure==='function'){var o=window.performance.measure.bind(window.performance);window.performance.measure=function(n,s,e){try{if(typeof s==='object'&&s!==null){var c=Object.assign({},s);if(typeof c.start==='number'&&c.start<0)c.start=0;if(typeof c.end==='number'&&c.end<0)c.end=0;if(typeof c.start==='number'&&typeof c.end==='number'&&c.end<c.start)c.end=c.start;return o(n,c,e);}return o(n,s,e);}catch(x){return undefined;}};}}}catch(e){}})();`,
          }}
        />
        <link rel="icon" href={faviconUrl} sizes="any" />
        <link rel="shortcut icon" href={faviconUrl} />
        <link rel="apple-touch-icon" href={faviconUrl} />
        {settings?.ads_enabled !== "0" && settings?.ads_enabled !== false && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings?.adsense_client?.trim() || "ca-pub-4161709832087107"}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white text-neutral-900">
        <SiteLayout initialSettings={settings} initialCategories={categories}>
          {children}
        </SiteLayout>
      </body>
    </html>
  );
}
