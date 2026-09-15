"use client";

import { useEffect, useState } from "react";
import YonetimKabugu from "@/components/yonetim/YonetimKabugu";
import { ApiError, newsletterApi } from "@/lib/istemci";
import { Mail, Trash2, Search, AlertCircle, Loader2, Download } from "lucide-react";

interface Subscriber {
  id: number | string;
  email: string;
  created_at: string;
}

export default function NewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<number | string | null>(null);

  function load() {
    setLoading(true);
    newsletterApi
      .list()
      .then(setSubscribers)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Aboneler yüklenemedi."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: number | string, email: string) {
    if (!window.confirm(`"${email}" bülten listesinden silinsin mi?`)) return;
    setDeleting(id);
    try {
      await newsletterApi.remove(id);
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Abone silinemedi.");
    } finally {
      setDeleting(null);
    }
  }

  function exportCsv() {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["ID,E-Posta,Kayıt Tarihi", ...subscribers.map((s) => `${s.id},"${s.email}","${s.created_at}"`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bulten_aboneleri_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filtered = subscribers.filter((s) =>
    !search.trim() || s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <YonetimKabugu>
      <div className="space-y-6">
        {/* Üst Başlık */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Pazarlama & İletişim
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bülten Aboneleri</h1>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">
              {loading ? "Yükleniyor..." : `Toplam ${subscribers.length} kayıtlı e-posta abonesi`}
            </p>
          </div>

          {subscribers.length > 0 && (
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4 text-red-500" />
              <span>CSV Olarak İndir</span>
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Arama */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="E-posta ile ara..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none shadow-xs transition-colors"
          />
        </div>

        {/* Liste Tablosu */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          {loading ? (
            <div className="p-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-900 mx-auto" />
              <p className="mt-3 text-xs text-slate-400">Aboneler yükleniyor...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Mail className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="mt-3 text-sm font-bold text-slate-700">Abone bulunamadı</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">#</th>
                    <th className="px-5 py-3">E-Posta Adresi</th>
                    <th className="px-5 py-3">Kayıt Tarihi</th>
                    <th className="px-5 py-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Mail className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-bold text-slate-900 text-sm">{item.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {new Intl.DateTimeFormat("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(item.created_at))}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => remove(item.id, item.email)}
                          disabled={deleting === item.id}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 transition-colors cursor-pointer"
                          title="Aboneliği Sil"
                        >
                          {deleting === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </YonetimKabugu>
  );
}
