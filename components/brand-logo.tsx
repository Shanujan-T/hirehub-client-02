import Link from "next/link";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export function BrandLogo({ href = "/", className, size = "md" }: { href?: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const t = { sm: "text-base", md: "text-lg", lg: "text-2xl" }[size];
  
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <Logo size={size} />
      <span className={cn("font-extrabold text-brand-gradient", t)}>HireHub</span>
    </Link>
  );
}


