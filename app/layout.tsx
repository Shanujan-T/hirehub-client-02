"use client";

import Link from "next/link";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/auth-provider";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <header className="border-b border-border">
              <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <Link href="/" className="text-xl font-extrabold">
                  LocalJobFinder
                </Link>
                <div className="flex gap-4 text-sm">
                  <Link href="/communities">Communities</Link>
                  <Link href="/auth/login">Login</Link>
                  <Link href="/auth/register">Register</Link>
                </div>
              </nav>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
