import Link from "next/link";
import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandLogo({ href = "/", className, size = "md" }: { href?: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const s = { sm: "h-8 w-8", md: "h-9 w-9", lg: "h-11 w-11" }[size];
  const t = { sm: "text-base", md: "text-lg", lg: "text-2xl" }[size];
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <span className={cn("flex items-center justify-center rounded-xl bg-brand-gradient shadow-md", s)}>
        <Briefcase className="h-4 w-4 text-white" />
      </span>
      <span className={cn("font-extrabold text-brand-gradient", t)}>LocalJobFinder</span>
    </Link>
  );
}
