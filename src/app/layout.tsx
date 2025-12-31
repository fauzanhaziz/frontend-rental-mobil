import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LoadingCarAnimation } from "@/components/LoadingCarAnimation";
import { Suspense } from "react";
import { PageTransition } from "@/components/PageTransition";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";

// URL Produksi Anda di Vercel
const baseUrl = "https://niagakaryamandiri-rentalmobilpadang.vercel.app";

// === FONT GLOBAL ===
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

// === METADATA GLOBAL UNTUK SEO DASAR ===
export const metadata: Metadata = {
  // MetadataBase disesuaikan ke URL Vercel agar link gambar & SEO valid
  metadataBase: new URL(baseUrl),
  title: {
    default: "Rental Mobil Padang — Sewa Mobil Murah & Terpercaya",
    template: "%s | Rental Mobil Padang",
  },
  description:
    "Sewa mobil di Padang dengan mudah dan cepat. Pilihan mobil keluarga & premium. Harga terjangkau, sopir profesional, dan layanan 24 jam.",
  
  // Verifikasi Google Search Console
  verification: {
    google: "Y7vcSwohEG30UM9iHQu8vpHEEAw_jI-Ut0-XW3D1eUE",
  },

  keywords: [
    "rental mobil padang",
    "sewa mobil padang",
    "mobil keluarga padang",
    "rental avanza padang",
    "rental mobil murah padang",
  ],
  
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: baseUrl, // Menggunakan baseUrl yang benar
    title: "Rental Mobil Padang — Sewa Mobil Murah & Terpercaya",
    description:
      "Sewa mobil di Padang dengan mudah dan cepat. Harga terjangkau, sopir profesional, dan layanan 24 jam.",
    siteName: "RentalMobil.id",
    images: [
      {
        url: "/images/og-image.jpg", // Akan otomatis menjadi baseUrl + path ini
        width: 1200,
        height: 630,
        alt: "Rental Mobil Padang — Sewa Mobil Murah & Terpercaya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@rentalmobilpadang",
    creator: "@rentalmobilpadang",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: baseUrl, // Menggunakan baseUrl agar tidak dianggap duplikat oleh Google
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

// === VIEWPORT ===
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

// === ROOT LAYOUT GLOBAL ===
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={poppins.variable}
      suppressHydrationWarning
    >
      <body className="antialiased scroll-smooth min-h-screen transition-colors duration-300 bg-background text-foreground">
        
        {/* GoogleOAuthProvider untuk fitur login */}
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          
          <PageTransition />
          
          <ThemeProvider>
            <AuthProvider>
              <SearchProvider>
                <NotificationProvider>
                  {/* Suspense untuk menjaga performa saat navigasi */}
                  <Suspense fallback={<LoadingCarAnimation />}>
                    {children}
                  </Suspense>
                  <Toaster position="top-center" richColors />
                </NotificationProvider>
              </SearchProvider>
            </AuthProvider>
          </ThemeProvider>

        </GoogleOAuthProvider>
      </body>
    </html>
  );
}