import { BrandLogo } from "@/components/brand-logo";
import { Card } from "@/components/ui";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-brand-wash" />
      <Card className="relative z-10 w-full max-w-md shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandLogo size="lg" />
          <h1 className="mt-5 text-2xl font-extrabold text-primary dark:text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        {children}
      </Card>
    </div>
  );
}
