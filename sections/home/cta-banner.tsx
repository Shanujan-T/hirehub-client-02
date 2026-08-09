import Link from "next/link";
import { Button } from "@/components/ui";

export function CtaBannerSection() {
  return (
    <section className="relative overflow-hidden border-t border-border/70">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-brand-wash" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-hero-glow opacity-80" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand-gradient opacity-25" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-14 text-center lg:px-8 lg:py-16">
        <h2 className="text-2xl font-extrabold tracking-tight text-primary dark:text-foreground sm:text-3xl">
          Ready to take the next step?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Join HireHub — build your skill profile, team up with a community, and start winning contracts.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link href="/auth/register" className="w-full sm:w-auto">
            <Button variant="gradient" className="w-full rounded-xl sm:min-w-[220px]">
              Join HireHub Free
            </Button>
          </Link>
          <Link href="/communities" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full rounded-xl sm:min-w-[220px]">
              Browse Communities
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
