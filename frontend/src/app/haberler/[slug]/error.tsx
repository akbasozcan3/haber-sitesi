"use client";

export default function NewsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="flex min-h-[60vh] items-center justify-center bg-white px-6 text-center"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#a97916]">Haber yüklenemedi</p><h1 className="mt-3 text-2xl font-semibold text-slate-900">Şu anda bu habere ulaşılamıyor.</h1><p className="mt-2 text-sm text-slate-500">Bağlantınızı kontrol edip tekrar deneyebilirsiniz.</p><button onClick={reset} className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Tekrar dene</button></div></main>;
}
