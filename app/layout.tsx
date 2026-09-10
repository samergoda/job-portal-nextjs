import "./globals.css";
import type { Metadata } from "next";
import { AppProviders } from "@/components/providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/ui/toast";
import { getCurrentUser } from "@/lib/server/auth";

export const metadata: Metadata = {
  title: "JobPortal",
  description: "Modern job portal built with Next.js",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Resolve the user on the server so the header renders correctly on first paint
  const initialUser = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <AppProviders initialUser={initialUser}>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
