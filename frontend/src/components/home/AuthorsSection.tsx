import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import type { Author } from "@/types/uygulama";

export default function AuthorsSection({ authors = [] }: { authors: Author[] }) {
  if (!authors || authors.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Başlık: Profesyonel Kırmızı Vurgulu Çizgi */}
      <div className="relative mb-6 flex items-center justify-between border-b border-neutral-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white shadow-xs">
            <Users className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl">
            Yazarlarımız
          </h2>
        </div>
        <span className="text-xs font-semibold text-neutral-400">Teknoloji & Analiz Kadrosu</span>
        <div className="absolute -bottom-px left-0 h-0.5 w-28 bg-red-600 rounded-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {authors.map((author) => (
          <Link
            key={author.id}
            href={`/yazar/${author.slug}`}
            className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100 border-2 border-neutral-100 transition-colors group-hover:border-slate-400">
              {author.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-900 font-bold text-white text-lg">
                  {author.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              <h3 className="truncate text-sm font-bold text-neutral-900 transition-colors group-hover:text-red-600">
                {author.name}
              </h3>
              {author.bio && (
                <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
                  {author.bio}
                </p>
              )}
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                <span>Yazılarını Gör</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
