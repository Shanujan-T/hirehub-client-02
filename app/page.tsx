"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { LandingFlowStrip } from "@/components/landing-flow-strip";
import { AccountTypeSection } from "@/sections/home/account-type-cards";
import { CtaBannerSection } from "@/sections/home/cta-banner";
import { Button } from "@/components/ui";
import { getPublicStats, type PublicStats } from "@/services/platform";

function HeroStats({ stats }: { stats: PublicStats | null }) {
  if (!stats) return null;

  return (
    <div className="relative mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted">
      <span>
        <span className="font-bold tabular-nums text-foreground">{stats.communities}</span> active
        communities
      </span>
      <span>
        <span className="font-bold tabular-nums text-foreground">{stats.jobs}</span> jobs posted
      </span>
      <span>
        <span className="font-bold tabular-nums text-foreground">{stats.contracts_completed}</span>{" "}
        contracts completed
      </span>
    </div>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    getPublicStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen bg-background">
      <AppHeader />

      <main>
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-brand-wash" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-hero-glow" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-hero-blobs" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-[0.45] dark:opacity-[0.28]" />

          <div className="hero-y relative z-10 mx-auto max-w-3xl px-4 text-center lg:px-8">
            <div className="relative mx-auto max-w-2xl">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-x-6 -top-6 bottom-4 rounded-3xl bg-brand-gradient opacity-[0.06] blur-3xl dark:opacity-[0.12]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full bg-secondary/15 blur-3xl dark:bg-secondary/25"
              />

              <h1 className="relative text-4xl font-extrabold tracking-tight text-primary dark:text-foreground sm:text-5xl">
                HireHub
              </h1>

              <LandingFlowStrip className="relative mt-5 sm:mt-6" />

              <p className="relative mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted sm:mt-6 sm:text-lg">
                Anyone can post a job. Skilled communities apply as teams. Admins assign work internally — one
                contract platform for local hiring.
              </p>

              <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-7">
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
              </div>

              <HeroStats stats={stats} />
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
