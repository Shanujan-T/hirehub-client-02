"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { LandingFlowStrip } from "@/components/landing-flow-strip";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background">
      <header className="sticky top-[3px] z-50 border-b border-border/70 bg-card/85 shadow-sm shadow-secondary/5 backdrop-blur-md">
        <div aria-hidden className="h-px w-full bg-brand-gradient opacity-30" />
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <BrandLogo />
          <div className="flex items-center gap-3">
            <Link href="/communities" className="text-sm text-muted transition hover:text-info">
              Communities
            </Link>
            <ThemeToggle />
            <Link href="/auth/login" className="text-sm text-muted transition hover:text-info">
              Login
            </Link>
            <Link href="/auth/register">
              <Button variant="gradient" className="rounded-full">Register</Button>
            </Link>
          </div>
        </nav>
      </header>

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
      </main>
    </div>
  );
}
