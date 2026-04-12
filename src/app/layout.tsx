import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import NoContextMenu from "@/components/NoContextMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://quantumtechwld.com";

// Metadados base (admin, portal e outras rotas fora de [locale])
// A landing page usa generateMetadata em src/app/[locale]/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "QuantumTech",
    template: "%s | QuantumTech",
  },
  authors: [{ name: "QuantumTech", url: BASE_URL }],
  creator: "QuantumTech",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lê o locale setado pelo middleware de i18n (x-next-intl-locale)
  // Para rotas fora de [locale] (admin, portal) cai no padrão "pt"
  const headersList = await headers();
  const locale = headersList.get("x-next-intl-locale") ?? "pt";

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <NoContextMenu />
        {children}
      </body>
    </html>
  );
}
