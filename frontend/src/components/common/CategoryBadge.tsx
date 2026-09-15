"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

interface CategoryBadgeProps {
  category?: {
    name?: string;
    slug?: string;
  } | null;
  variant?: "pill" | "overlay" | "minimal";
  className?: string;
  size?: "sm" | "md";
}

export default function CategoryBadge({
  category,
  variant = "pill",
  className = "",
  size = "sm",
}: CategoryBadgeProps) {
  if (!category?.name) return null;

  const href = category.slug ? `/kategori/${category.slug}` : "/haberler";

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Ebeveyn kart tıklamasıyla çakışmayı önle
    e.stopPropagation();
  };

  const sizeStyles =
    size === "md"
      ? "text-[11px]"
      : "text-[10.5px]";

  if (variant === "overlay") {
    return (
      <Link
        href={href}
        onClick={handleClick}
        className={`inline-flex items-center rounded-md bg-neutral-900/80 px-2.5 py-0.5 font-bold uppercase tracking-wider text-neutral-200 border border-neutral-700/60 backdrop-blur-md transition-colors duration-200 hover:bg-neutral-900 hover:text-white ${sizeStyles} ${className}`}
      >
        {category.name}
      </Link>
    );
  }

  if (variant === "minimal") {
    return (
      <Link
        href={href}
        onClick={handleClick}
        className={`inline-flex items-center p-0 pl-0 font-bold uppercase tracking-wider text-neutral-500 transition-colors hover:text-neutral-900 ${className}`}
      >
        {category.name}
      </Link>
    );
  }

  // Modern, Yalın Rozet Tasarımı: En sola hizalı, sıfır sol girinti, şık gri tipografi
  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`inline-flex items-center justify-start p-0 pl-0 bg-transparent font-bold uppercase tracking-[0.14em] text-neutral-500 transition-colors duration-200 hover:text-neutral-900 ${sizeStyles} ${className}`}
    >
      {category.name}
    </Link>
  );
}