import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const PLATFORM_LINKS = [
  { href: "/communities", label: "Browse Communities" },
  { href: "/jobs/new", label: "Post a Job" },
  { href: "/auth/login", label: "Login" },
  { href: "/auth/register", label: "Register" },
] as const;

const COMPANY_LINKS = [
  { href: "#", label: "About" },
  { href: "#", label: "Contact" },
] as const;

const LEGAL_LINKS = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms" },
] as const;

const linkClass =
  "text-sm text-muted transition hover:text-info focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/30 focus-visible:rounded-sm";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/50">
      <div aria-hidden className="h-px w-full bg-brand-gradient opacity-20" />
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <BrandLogo size="sm" />
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              Community-based job contracts, done right.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-foreground">Platform</h2>
            <ul className="mt-3 space-y-2">
              {PLATFORM_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-foreground">Company</h2>
            <ul className="mt-3 space-y-2">
              {COMPANY_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={linkClass} aria-disabled="true">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">© 2026 HireHub. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {LEGAL_LINKS.map((item) => (
              <Link key={item.label} href={item.href} className="text-xs text-muted transition hover:text-info">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
