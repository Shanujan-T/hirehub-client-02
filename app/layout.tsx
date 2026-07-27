"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider } from "@/providers/auth-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

function isPublicStandalone(path: string) {
  return path === "/" || path.startsWith("/auth") || path.startsWith("/communities");
}

function isPortal(path: string) {
  return (
    path === "/dashboard" ||
    path.startsWith("/jobs") ||
    path.startsWith("/contracts") ||
    path.startsWith("/reviews") ||
    path.startsWith("/community-admin") ||
    path.startsWith("/member") ||
    path.startsWith("/admin")
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone = isPublicStandalone(pathname);
  const portal = isPortal(pathname);

  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <div className="fixed inset-x-0 top-0 z-[100] h-[3px] bg-brand-gradient" />
            {!standalone && !portal && (
              <header className="sticky top-[3px] z-50 border-b border-border bg-card/90 backdrop-blur-md">
                <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                  <BrandLogo size="sm" />
                  <div className="flex items-center gap-3 text-sm">
                    <Link href="/communities" className="text-muted hover:text-info">Communities</Link>
                    <ThemeToggle />
                    <Link href="/auth/login" className="text-muted hover:text-info">Login</Link>
                  </div>
                </nav>
              </header>
            )}
            <main className={standalone || portal ? "pt-[3px]" : "mx-auto max-w-6xl px-4 py-8 pt-[3px]"}>
              {children}
            </main>
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
