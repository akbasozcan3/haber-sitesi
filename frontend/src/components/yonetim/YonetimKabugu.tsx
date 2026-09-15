"use client";

import {
  ChevronLeft, Folder, LayoutDashboard, LogOut, Menu,
  Newspaper, UserRound, Users, X, ExternalLink,
  ShieldCheck, Mail, MessageSquare, Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { authApi } from "@/lib/istemci";
import type { User } from "@/types/uygulama";
import SiteLogo from "@/components/common/SiteLogo";
import { useSiteSettings } from "@/context/SiteSettingsContext";

type MenuItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  description?: string;
};

const menuGroups: { label: string; items: MenuItem[] }[] = [
  {
    label: "İçerik",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, description: "Genel bakış" },
      { href: "/admin/news", label: "Haberler", icon: Newspaper, description: "Haber listesi" },
      { href: "/admin/comments", label: "Yorumlar", icon: MessageSquare, description: "Okuyucu yorumları" },
    ],
  },
  {
    label: "Yönetim",
    items: [
      { href: "/admin/categories", label: "Kategoriler", icon: Folder, description: "İçerik grupları" },
      { href: "/admin/authors", label: "Yazarlar", icon: UserRound, description: "Editör kadrosu" },
      { href: "/admin/users", label: "Kullanıcılar", icon: Users, description: "Yönetici hesapları" },
      { href: "/admin/newsletter", label: "Bülten", icon: Mail, description: "E-posta aboneleri" },
      { href: "/admin/settings", label: "Site & Logo", icon: Settings, description: "Logo ve site ayarları" },
    ],
  },
];

function initials(name: string): string {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function YonetimKabugu({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useSiteSettings();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!authApi.hasToken()) {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    authApi.user().then((currentUser) => {
      if (!currentUser.is_admin) {
        authApi.clearToken();
        router.replace("/admin/login?error=admin-required");
        return;
      }
      setUser(currentUser);
    }).catch(() => {
      authApi.clearToken();
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }).finally(() => setChecking(false));
  }, [pathname, router]);

  async function logout() {
    try { await authApi.logout(); } catch { authApi.clearToken(); }
    router.replace("/admin/login");
  }

  if (checking || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-slate-200 border-t-slate-900" />
          <p className="text-xs font-semibold text-slate-500">Yönetim paneli yükleniyor...</p>
        </div>
      </main>
    );
  }

  const allItems = menuGroups.flatMap(g => g.items);
  const currentItem = allItems.find(item =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
  );

  const sidebar = (
    <div className="flex h-full flex-col bg-white text-slate-800">
      {/* LOGO */}
      <div className={`flex h-16 items-center border-b border-slate-100 px-5 ${collapsed ? "justify-center" : ""}`}>
        <Link
          href="/admin"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}
        >
          <SiteLogo
            height={collapsed ? 28 : 34}
            imgClassName="w-auto max-w-[130px] object-contain"
            textClassName="text-base font-black tracking-tight text-slate-900 leading-none"
          />
          {!collapsed && (
            <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-red-600 uppercase border border-red-100/80">
              Admin
            </span>
          )}
        </Link>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {menuGroups.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map(item => {
                // Sadece tam eşleşmede veya alt sayfalarda aktif olur (Dashboard /admin/news'i kapsamaz!)
                const active = item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                      active
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-700"}`} />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Siteyi Görüntüle */}
        {!collapsed && (
          <div className="pt-2 border-t border-slate-100">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>Siteyi Görüntüle</span>
            </a>
          </div>
        )}
      </nav>

      {/* KULLANICI & ÇIKIŞ */}
      <div className="border-t border-slate-100 p-3">
        {!collapsed ? (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-black text-red-500 shadow-xs">
                {initials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900">{user.name}</p>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <p className="text-[10px] font-semibold text-emerald-600">Yönetici</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-black text-red-500">
              {initials(user.name)}
            </div>
            <button
              type="button"
              onClick={logout}
              title="Çıkış Yap"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Mobil karartma */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Masaüstü Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 hidden h-screen border-r border-slate-200 transition-[width] duration-300 lg:flex lg:flex-col ${
          collapsed ? "w-[64px]" : "w-[240px]"
        }`}
      >
        {sidebar}
        <button
          type="button"
          onClick={() => setCollapsed(v => !v)}
          className="absolute -right-3 top-[4.5rem] flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-900 transition-colors cursor-pointer"
          title="Menüyü daralt / genişlet"
        >
          <ChevronLeft className={`h-3.5 w-3.5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>

      {/* Mobil Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[240px] border-r border-slate-200 transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>
      </aside>

      {/* İÇERİK BÖLÜMÜ */}
      <div className={`transition-[margin] duration-300 ${collapsed ? "lg:ml-[64px]" : "lg:ml-[240px]"}`}>
        {/* ÜST BAR */}
        <header className="sticky top-0 z-20 h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden transition-colors"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>

              <div>
                <h1 className="text-sm font-black text-slate-900">
                  {currentItem?.label ?? "Yönetim Paneli"}
                </h1>
                <p className="hidden text-[11px] text-slate-400 sm:block">
                  {settings.site_title || "Zernews"} · {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                <span>Siteyi Gör</span>
              </a>
            </div>
          </div>
        </header>

        {/* İÇERİK ALANI */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
