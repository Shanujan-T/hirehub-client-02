import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({ href = "/", className, size = "md" }: { href?: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const s = { sm: "h-8 w-8", md: "h-9 w-9", lg: "h-11 w-11" }[size];
  const dimensions = { sm: 32, md: 36, lg: 44 }[size];
  const t = { sm: "text-base", md: "text-lg", lg: "text-2xl" }[size];
  
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("relative overflow-hidden rounded-xl shadow-md bg-muted flex items-center justify-center", s)}>
        <Image
          src="/logo-light.jpg"
          alt="HireHub Logo"
          width={dimensions}
          height={dimensions}
          className="object-cover dark:hidden"
          priority
        />
        <Image
          src="/logo-dark.jpg"
          alt="HireHub Logo"
          width={dimensions}
          height={dimensions}
          className="object-cover hidden dark:block"
          priority
        />
      </div>
      <span className={cn("font-extrabold text-brand-gradient", t)}>HireHub</span>
    </Link>
  );
}

