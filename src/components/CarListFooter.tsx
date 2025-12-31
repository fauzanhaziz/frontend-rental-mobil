"use client";

import Link from "next/link";
import Image from "next/image"; 
import { MapPin, Mail, Instagram, Facebook, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Komponen Ikon WhatsApp Custom
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export function CarListFooter() {
  // --- KONFIGURASI INFORMASI ---
  const phone = "6281365338011";
  const email = "niagakaryamandiri373@gmail.com";
  const address = "NKM Auto Rental Padang, Sungai Sapih, Kec. Kuranji, Kota Padang, Sumatera Barat, Indonesia";
  
  // --- LOGIKA LINK ---
  const message = "Halo Admin CV. NIAGA KARYA MANDIRI, saya sedang mencari mobil rental tapi tidak menemukan unit yang saya cari di website. Bisa bantu carikan unit lain?";
  
  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const mailLink = `mailto:${email}`;

  // Fungsi Scroll
  const scrollToSection = (id: string) => {
    const section = document.querySelector(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 pt-20 pb-8 mt-auto border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        
        {/* === SECTION 1: CTA BOX === */}
        <div className="relative -mt-36 mb-16 bg-blue-600 dark:bg-blue-800 rounded-2xl p-6 md:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-500/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              Belum Menemukan Mobil yang Pas?
            </h2>
            <p className="text-blue-100 text-sm md:text-base max-w-lg">
              Jangan khawatir! Kami memiliki jaringan armada luas. Hubungi admin kami untuk permintaan unit khusus.
            </p>
          </div>

          <div className="relative z-10 shrink-0 w-full md:w-auto">
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <Button className="w-full md:w-auto bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm h-11 px-6 rounded-full shadow-md transition-transform hover:scale-105 gap-2">
                <WhatsAppIcon className="w-5 h-5" />
                Chat Admin via WA
              </Button>
            </a>
          </div>
        </div>

        {/* === SECTION 2: INFO RENTAL === */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 border-b border-slate-200 dark:border-slate-800 pb-12">
          
          {/* Brand Info & Logo */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              {/* LOGO FIX */}
              <div className="relative w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700 shrink-0">
                 <Image 
                   src="/images/NKAlogo.png" 
                   alt="Logo CV Niaga Karya Mandiri" 
                   fill 
                   className="object-contain p-1" 
                 />
              </div>
              
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                  CV. NIAGA
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 leading-tight">
                  KARYA MANDIRI
                </span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Penyedia jasa sewa mobil terpercaya di Padang dengan armada terlengkap, bersih, dan terawat. Melayani sewa harian, mingguan, hingga bulanan.
            </p>
            
            {/* SOCIAL MEDIA LINK (Baru) */}
            <div className="flex gap-3">
              <Link 
                href="https://www.instagram.com/niagakaryamandiri?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                target="_blank"
                className="p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-pink-600 hover:text-white hover:border-pink-600 dark:hover:bg-pink-600 transition-all duration-300 shadow-sm text-slate-600 dark:text-slate-400"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link 
                href="https://facebook.com/" 
                target="_blank"
                className="p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-600 transition-all duration-300 shadow-sm text-slate-600 dark:text-slate-400"
              >
                <Facebook className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-slate-900 dark:text-white font-bold text-lg">Menu Cepat</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" /> Beranda
                </Link>
              </li>
              <li>
                <Link href="/mobil" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" /> Daftar Mobil
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" /> Login / Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-slate-900 dark:text-white font-bold text-lg">Hubungi Kami</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a 
                  href={waLink}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center md:justify-start gap-3 hover:text-green-600 dark:hover:text-green-400 transition-colors group"
                >
                  <WhatsAppIcon className="w-5 h-5 text-green-600 dark:text-green-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">+62 813-6533-8011 (Chat WA)</span>
                </a>
              </li>
              <li>
                <a 
                  href={mailLink}
                  className="flex items-center justify-center md:justify-start gap-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <Mail className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span>{email}</span>
                </a>
              </li>
              <li>
                <a 
                  href={mapsLink}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start justify-center md:justify-start gap-3 hover:text-red-600 dark:hover:text-red-400 transition-colors group text-left"
                >
                  <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>{address}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* === SECTION 3: COPYRIGHT === */}
        <div className="pt-8 text-center text-slate-500 dark:text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} CV. Niaga Karya Mandiri. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}