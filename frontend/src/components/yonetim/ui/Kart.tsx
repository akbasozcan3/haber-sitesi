import type { HTMLAttributes } from "react";

export default function Kart({ children, className = "", padding = "md", ...props }: HTMLAttributes<HTMLDivElement> & { padding?: "none" | "sm" | "md" | "lg" }) {
  const paddingClass = { none: "p-0", sm: "p-4", md: "p-6", lg: "p-8" }[padding];
  return <div className={`rounded-[18px] border border-slate-200 bg-white ${paddingClass} ${className}`} {...props}>{children}</div>;
}