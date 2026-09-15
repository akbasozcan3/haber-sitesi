import type { ReactNode } from "react";

export default function SayfaBasligi({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div>{actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}</div>;
}