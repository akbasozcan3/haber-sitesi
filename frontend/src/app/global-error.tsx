"use client";

import { RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mb-2">
            Sayfa Yüklenemedi
          </h1>
          <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
            Hizmete erişirken geçici bir kesinti yaşandı. Lütfen sayfayı yenileyerek tekrar deneyin.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Tekrar Dene
            </button>
            <button
              onClick={() => {
                if (typeof window !== "undefined") window.location.href = "/";
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors"
            >
              Ana Sayfa
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
