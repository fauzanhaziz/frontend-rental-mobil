"use client";

import Link from "next/link";
import Image from "next/image"; 
import { motion } from "framer-motion";
import { Mail, MapPin, Instagram, Facebook } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

// Komponen Ikon WhatsApp (SVG Manual)
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  
  // --- KONFIGURASI INFORMASI ---
  const phone = "6281365338011"; 
  const email = "niagakaryamandiri373@gmail.com";
  const address = "NKM Auto Rental Padang, Sungai Sapih, Kec. Kuranji, Kota Padang, Sumatera Barat, Indonesia";
  
  // --- LOGIKA LINK ---
  const message = "Halo Admin CV. NIAGA KARYA MANDIRI, saya ingin bertanya seputar layanan rental mobil.";
  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const mailLink = `mailto:${email}`;

  // --- LOGIKA SCROLL ---
  const handleNavigation = (targetId: string) => {
    if (pathname === "/") {
      const section = document.querySelector(targetId);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/${targetId}`);
    }
  };

  return (
    // PERBAIKAN DISINI: bg-slate-50 (Light) | dark:bg-slate-950 (Dark)
    <footer
      className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-12 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300"
      itemScope
      itemType="https://schema.org/WPFooter"
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        
        {/* Brand */}
        <div>
          <motion.h3
            className="text-2xl font-extrabold text-yellow-500 mb-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            itemProp="name"
          >
            CV. NIAGA <span className="text-red-800 dark:text-red-500">KARYA MANDIRI</span>
          </motion.h3>
          <p className="text-sm leading-relaxed mb-6" itemProp="description">
            Solusi rental mobil terpercaya di Padang. Layanan cepat,
            harga transparan, dan armada berkualitas.
          </p>
          
          {/* SOCIAL MEDIA ICONS (Responsive Theme) */}
          <div className="flex justify-center md:justify-start gap-4">
            <Link 
              href="https://www.instagram.com/niagakaryamandiri?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
              target="_blank"
              className="p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-pink-500 hover:text-white hover:border-pink-500 dark:hover:bg-pink-600 transition-all duration-300 shadow-sm"
            >
              <Instagram className="w-5 h-5" />
            </Link>
            <Link 
              href="https://facebook.com/" 
              target="_blank"
              className="p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-700 transition-all duration-300 shadow-sm"
            >
              <Facebook className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Navigasi */}
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Navigasi</h4>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleNavigation("#fitur-unggulan")}
                className="hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
              >
                Fitur
              </button>
            </li>
            <li>
              <Link href="/mobil" className="hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                Daftar Mobil
              </Link>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("#testimoni")}
                className="hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
              >
                Testimoni
              </button>
            </li>
             <li>
              <Link href="/tentang-kami" className="hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                Tentang Kami
              </Link>
            </li>
            <li>
              <Link href="/ketentuan" className="hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                Syarat & Ketentuan
              </Link>
            </li>
          </ul>
        </div>

        {/* Kontak */}
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Hubungi Kami</h4>
          <ul className="text-sm space-y-4">
            
            {/* WhatsApp */}
            <li>
              <a 
                href={waLink}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-start gap-3 hover:text-green-600 dark:hover:text-green-400 transition-colors group"
              >
                <WhatsAppIcon className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
                <span className="font-medium">+62 813-6533-8011 (Chat WA)</span>
              </a>
            </li>

            {/* Email */}
            <li>
              <a 
                href={mailLink}
                className="flex items-center justify-center md:justify-start gap-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <Mail className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span>{email}</span>
              </a>
            </li>

            {/* Google Maps */}
            <li>
              <a 
                href={mapsLink}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start justify-center md:justify-start gap-3 hover:text-red-600 dark:hover:text-red-400 transition-colors group text-left"
              >
                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span>NKM Auto Rental Padang, Sungai Sapih, Kec. Kuranji, Kota Padang, Sumatera Barat, Indonesia</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-slate-500 dark:text-slate-500 mt-10 border-t border-slate-200 dark:border-slate-800 pt-6">
        © {new Date().getFullYear()} CV. Niaga Karya Mandiri. All rights reserved.
      </div>
    </footer>
  );
}