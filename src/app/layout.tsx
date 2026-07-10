import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProviders } from "@/providers/AppProviders";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.brandName} — Handmade vases & baskets`,
    template: `%s · ${siteConfig.brandName}`,
  },
  description:
    "Aman Shop — handmade flower vases and baskets by Amanuel. Browse, order, and pay in person at pickup.",
  metadataBase: new URL(siteConfig.siteUrl),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${outfit.variable} flex min-h-screen flex-col antialiased`}>
        <AppProviders>
          <ErrorBoundary>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </ErrorBoundary>
        </AppProviders>
      </body>
    </html>
  );
}
