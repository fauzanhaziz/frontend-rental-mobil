import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Optimasi & Keamanan (Sesuai kode Anda)
  compress: true, // Kompresi gzip/brotli
  poweredByHeader: false, // Hilangkan header X-Powered-By
  reactStrictMode: true, // Strict mode untuk debugging
  swcMinify: true, // Minifier cepat

  // 2. Konfigurasi Gambar (GABUNGAN)
  images: {
    // A. Format Modern (Punya Anda)
    formats: ["image/avif", "image/webp"], 
    
    // B. Izin Domain Eksternal (SOLUSI ERROR IMAGE)
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000", // Port Backend Django
        pathname: "/media/**", // Izinkan akses folder media
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },

  // Catatan: 'srcDir' dihapus karena Next.js mendeteksi folder 'src' secara otomatis.
  // Menambahkan properti yang tidak dikenal ke dalam object NextConfig akan menyebabkan error TypeScript.
  experimental: {
    // Tambahkan fitur eksperimental di sini jika perlu
  },
};

export default nextConfig;