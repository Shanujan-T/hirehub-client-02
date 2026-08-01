"use client";

import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AppToaster } from "@/components/app-toaster";
import { AppHeader } from "@/components/app-header";
import { AuthProvider } from "@/providers/auth-provider";
import { NotificationProvider } from "@/providers/notification-provider";
import { Footer } from "@/sections/layout/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

function isPublicStandalone(path: string) {
  return path === "/" || path.startsWith("/auth") || path.startsWith("/communities");
}

function isPortal(path: string) {
  return (
    path.startsWith("/dashboard") ||
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
      <body className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <NotificationProvider>
            <div className="fixed inset-x-0 top-0 z-[100] h-[3px] bg-brand-gradient" />
            {!standalone && !portal && <AppHeader />}
            <main className={standalone || portal ? "flex-1 pt-[3px]" : "mx-auto max-w-6xl flex-1 px-4 py-8 pt-[3px]"}>
              {children}
            </main>
            {!portal && <Footer />}
            <AppToaster />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
