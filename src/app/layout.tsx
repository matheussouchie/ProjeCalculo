import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { Providers } from "@/app/providers";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProjeCalculo",
  description:
    "Previsao de prazos para detalhamento arquitetonico com historico real de produtividade.",
  icons: {
    icon: [
      {
        url: "/icons/projecalculo-icon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/icons/projecalculo-icon.svg",
    apple: "/icons/projecalculo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
