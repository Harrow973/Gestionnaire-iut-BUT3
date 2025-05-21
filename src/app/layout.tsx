import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/ui/layout/Navbar";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Manager IUT - Gestion des maquettes pédagogiques",
  description: "Application de gestion des maquettes pédagogiques pour les IUT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} min-h-full bg-gradient-to-br from-gray-50 to-blue-50`}>
        <Navbar />
        <main className="container mx-auto px-4 py-8 pt-20 max-w-7xl">
          {children}
        </main>
      </body>
    </html>
  );
}
