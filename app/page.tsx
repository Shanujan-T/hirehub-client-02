"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { LandingFlowStrip } from "@/components/landing-flow-strip";
import { AccountTypeSection } from "@/sections/home/account-type-cards";
import { CtaBannerSection } from "@/sections/home/cta-banner";
import { Button } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background">
      <AppHeader />

      <main>
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-brand-wash" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-hero-glow" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-[0.55] dark:opacity-[0.35]" />

          <div className="section-y relative z-10 mx-auto max-w-3xl px-4 text-center lg:px-8">
            <div className="relative mx-auto max-w-2xl">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-x-8 -top-10 bottom-0 rounded-3xl bg-brand-gradient opacity-[0.04] blur-3xl dark:opacity-[0.08]"
              />

              <h1 className="relative text-4xl font-extrabold tracking-tight text-primary dark:text-foreground sm:text-5xl">
                HireHub
              </h1>

              <LandingFlowStrip className="relative mt-8" />

              <p className="relative mx-auto mt-8 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
                Employers post jobs. Skilled communities apply as teams. Admins assign work internally — one contract platform for local hiring.
              </p>

              <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
                <Link href="/communities">
                  <Button variant="outline" size="lg" className="rounded-full">
                    Browse Communities
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" size="lg" className="rounded-full">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="gradient" size="lg" className="rounded-full">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-brand-gradient opacity-20" />
        </section>

        <AccountTypeSection />
        <CtaBannerSection />
      </main>
    </div>
  );
}
