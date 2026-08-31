import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";

import { Providers } from "@/app/providers";

import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OnTime²",
  description:
    "Previsao de prazos para detalhamento arquitetonico com historico real de produtividade.",
  icons: {
    icon: "/branding/ontime-mark.png",
    apple: "/branding/ontime-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${montserrat.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
