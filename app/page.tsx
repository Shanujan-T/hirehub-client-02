"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background">
      <header className="sticky top-[3px] z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <BrandLogo />
          <div className="flex items-center gap-3">
            <Link href="/communities" className="text-sm text-muted hover:text-info">Communities</Link>
            <ThemeToggle />
            <Link href="/auth/login" className="text-sm text-muted hover:text-info">Login</Link>
            <Link href="/auth/register">
              <Button variant="gradient" className="rounded-full">Register</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-20 text-center lg:px-8">
        <h1 className="text-4xl font-extrabold text-primary dark:text-foreground sm:text-5xl">
          LocalJobFinder
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-muted">
          Employers post jobs. Skilled communities apply as teams. Admins assign work internally — one contract platform for local hiring.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/communities">
            <Button variant="outline" size="lg" className="rounded-full">Browse Communities</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="lg" className="rounded-full">Login</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="gradient" size="lg" className="rounded-full">Register</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
