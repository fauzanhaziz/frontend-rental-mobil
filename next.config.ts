import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Optimasi & Keamanan
  compress: true, 
  poweredByHeader: false, 
  reactStrictMode: true, 

  // 2. Konfigurasi Gambar (UPDATE PENTING DISINI)
  images: {
    formats: ["image/avif", "image/webp"], 
    
    remotePatterns: [
      // A. CLOUDINARY (WAJIB: Karena backend sekarang simpan gambar di sini)
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**", // Izinkan semua path folder di Cloudinary
      },

      // B. Backend Render (Opsional: Jaga-jaga jika ada gambar yang tertinggal di server)
      {
        protocol: "https",
        hostname: "backend-rental-mobil.onrender.com",
        port: "",
        pathname: "/media/**",
      },

      // C. Localhost (Tetap simpan untuk keperluan testing di laptop)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;