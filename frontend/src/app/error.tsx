"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl shadow-slate-900/5">
          {/* Ikon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-rose-600" />
          </div>
          
          {/* Başlık */}
          <h1 className="text-xl font-extrabold text-slate-900 mb-2">
            Bir Hata Oluştu
          </h1>
          
          {/* Açıklama */}
          <p className="text-sm text-slate-500 mb-8">
            Beklenmedik bir sorun yaşandı. Sayfayı yenilemeyi deneyin 
            veya ana sayfaya dönerek devam edin.
          </p>
          
          {/* Butonlar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <button
              onClick={reset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-xs active:scale-95 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Tekrar Dene</span>
            </button>
            
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs active:scale-95"
            >
              <Home className="h-4 w-4" />
              <span>Ana Sayfa</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}