import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "700", "900"], variable: "--font-roboto" });

export const metadata: Metadata = {
  title: "Премиум Каталог Grundfos",
  description: "Каталог насосов Grundfos с парсером минимальных цен",
};

import Header from "../components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${roboto.variable}`}>
      <body className="antialiased min-h-screen">
        <Header />
        {children}
      </body>
    </html>
  );
}
