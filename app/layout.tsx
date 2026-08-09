import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Qur'an Tracker - Pemantau Rutinitas Baca Al-Qur'an",
  description: "Sistem Informasi Pemantau Rutinitas Baca Al-Qur'an. Pantau progres harian Anda, capai target khatam bersama jamaah, dan bangun konsistensi tilawah.",
  manifest: "/manifest.json", // Daftarkan PWA di sini
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}