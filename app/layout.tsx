import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Ini adalah pengaturan untuk Judul Tab Browser (Chrome/Edge)
export const metadata: Metadata = {
  title: "Qur'an Tracker - Pemantau Rutinitas Baca Al-Qur'an",
  description: "Sistem Informasi Pemantau Rutinitas Baca Al-Qur'an. Pantau progres harian Anda, capai target khatam bersama jamaah, dan bangun konsistensi tilawah.",
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