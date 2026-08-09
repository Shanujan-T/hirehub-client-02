import { BrandLogo } from "@/components/brand-logo";
import { Card } from "@/components/ui";

export function AuthLayout({ title, subtitle, children, aside }: { title: string; subtitle: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-brand-wash" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-40 dark:opacity-25" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-hero-glow opacity-80" />
      <div className={aside ? "relative z-10 grid w-full max-w-[520px] items-stretch gap-8 lg:max-w-5xl lg:grid-cols-[minmax(0,1fr)_minmax(480px,520px)]" : "relative z-10 w-full max-w-md"}>
        {aside && (
          <aside className="relative hidden overflow-hidden rounded-3xl border border-[#007ACD]/25 bg-gradient-to-br from-[#08308B]/20 via-[#4D2BD8]/15 to-[#7D07DB]/20 p-10 shadow-lg shadow-[#4D2BD8]/10 lg:flex lg:flex-col lg:justify-center dark:border-[#4D2BD8]/40 dark:from-[#08308B]/35 dark:via-[#4D2BD8]/25 dark:to-[#7D07DB]/30">
            {aside}
          </aside>
        )}
        <Card className="w-full border-border/80 shadow-xl shadow-secondary/10 dark:shadow-black/30">
          <div className="mb-6 flex flex-col items-center text-center">
            <BrandLogo size="lg" />
            <h1 className="mt-5 text-2xl font-extrabold text-primary dark:text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          </div>
          {children}
        </Card>
      </div>
    </div>
  );
}
