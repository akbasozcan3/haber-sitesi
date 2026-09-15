"use client";

export default function HaberlerError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="flex min-h-[60vh] items-center justify-center bg-[#f8fafc] px-6 text-center"><div><h1 className="text-2xl font-semibold text-slate-900">Haberler yüklenemedi.</h1><p className="mt-2 text-sm text-slate-500">Lütfen bağlantınızı kontrol edip tekrar deneyin.</p><button onClick={reset} className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Tekrar dene</button></div></main>;
}