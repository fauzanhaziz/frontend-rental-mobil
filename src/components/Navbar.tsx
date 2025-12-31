"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation"; 
import { ToggleTheme } from "@/components/admin/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  // Ubah gaya navbar saat scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- LOGIKA NAVIGASI LINTAS HALAMAN ---
  const handleNavigation = (targetId: string) => {
    setIsOpen(false);
    if (pathname === "/") {
      // Jika sudah di Home, langsung scroll
      const section = document.querySelector(targetId);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    } else {
      // Jika di halaman lain, pindah ke Home + Hash
      router.push(`/${targetId}`);
    }
  };

  const handleGoHome = () => {
    setIsOpen(false);
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 w-full z-50 transition-all ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm dark:bg-slate-900/90 dark:border-b dark:border-slate-800"
          : "bg-transparent"
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      role="navigation"
      itemScope
      itemType="https://schema.org/SiteNavigationElement"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        
        {/* === LOGO + NAMA === */}
        <button
          onClick={handleGoHome}
          className="flex items-center space-x-2 focus:outline-none"
          aria-label="Kembali ke Beranda"
          itemProp="url"
        >
          <Image
            src="/images/NKAlogo.png"
            alt="Logo CV. Niaga Karya Mandiri"
            width={80}
            height={80}
            className="object-contain"
            priority
          />
          <span className="text-2xl font-extrabold text-yellow-500 tracking-tight">
            CV. NIAGA <span className="text-red-900 dark:text-red-500">KARYA MANDIRI</span>
          </span>
        </button>

        {/* === MENU DESKTOP === */}
        <div className="hidden md:flex items-center space-x-8 font-medium text-green-700 dark:text-green-400">
          <button
            onClick={handleGoHome}
            className="hover:text-blue-600 transition-colors"
          >
            Beranda
          </button>

          {/* DROPDOWN TENTANG KAMI */}
          <DropdownMenu>
            <DropdownMenuTrigger className="hover:text-blue-600 transition-colors flex items-center gap-1 outline-none">
              Tentang Kami <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 mt-2">
              <DropdownMenuItem className="cursor-pointer focus:bg-green-50 dark:focus:bg-green-900/20">
                <Link href="/tentang-kami" className="w-full text-green-700 dark:text-green-400">Profil Perusahaan</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer focus:bg-green-50 dark:focus:bg-green-900/20">
                <Link href="/ketentuan" className="w-full text-green-700 dark:text-green-400">Syarat & Ketentuan</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => handleNavigation("#fitur-unggulan")}
            className="hover:text-blue-600 transition-colors"
          >
            Fitur
          </button>

          <button
            onClick={() => handleNavigation("#mobil-populer")}
            className="hover:text-blue-600 transition-colors"
          >
            Mobil
          </button>
          
          {/* Link Mobil (Bisa ke Section atau Halaman Katalog) 
          <Link 
            href="/mobil"
            className="hover:text-blue-600 transition-colors"
          >
            Mobil
          </Link>
          */}
          
          <button
            onClick={() => handleNavigation("#dokumentasi")}
            className="hover:text-blue-600 transition-colors"
          >
            Dokumnetasi
          </button>

          {/* === AUTH BUTTONS & THEME === */}
          <div className="flex items-center space-x-4 pl-4 border-l border-gray-300 dark:border-slate-700">
            <ToggleTheme />
            
            <Link
              href="/login"
              className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/registrasi"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-md"
            >
              Daftar
            </Link>
          </div>
        </div>

        {/* === TOMBOL MOBILE === */}
        <div className="md:hidden flex items-center gap-4">
            <ToggleTheme />
            <button
            className="text-green-700 dark:text-green-400"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Buka menu navigasi"
            >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
        </div>
      </div>

      {/* === MENU MOBILE === */}
      <AnimatePresence>
        {isOpen && (
            <motion.div
            className="md:hidden bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 shadow-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            >
            <div className="flex flex-col space-y-4 p-6 text-green-700 dark:text-green-400 font-medium">
                <button onClick={handleGoHome} className="text-left hover:text-yellow-600 transition-colors">
                    Beranda
                </button>
                
                {/* Submenu Mobile */}
                <div className="pl-4 border-l-2 border-green-100 dark:border-slate-800 flex flex-col gap-3">
                    <Link href="/tentang-kami" onClick={() => setIsOpen(false)} className="text-sm hover:text-yellow-600">
                        Profil Perusahaan
                    </Link>
                    <Link href="/ketentuan" onClick={() => setIsOpen(false)} className="text-sm hover:text-yellow-600">
                        Syarat & Ketentuan
                    </Link>
                </div>

                <button onClick={() => handleNavigation("#fitur-unggulan")} className="text-left hover:text-yellow-600 transition-colors">
                    Fitur
                </button>

                <button onClick={() => handleNavigation("#mobil-populer")} className="text-left hover:text-yellow-600 transition-colors">
                    Mobil
                </button>

                {/*<Link href="/mobil" onClick={() => setIsOpen(false)} className="text-left hover:text-yellow-600 transition-colors">
                    Mobil
                </Link>}*/}
                
                <button onClick={() => handleNavigation("#dokumentasi")} className="text-left hover:text-yellow-600 transition-colors">
                    Dokumentasi
                </button>

                {/* === AUTH BUTTONS MOBILE === */}
                <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex flex-col gap-3">
                    <Link href="/login" className="block text-center border border-gray-300 dark:border-slate-700 rounded-lg py-2 text-gray-700 dark:text-gray-300 hover:text-green-600">
                        Masuk
                    </Link>
                    <Link href="/registrasi" className="block bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-center font-semibold transition-all">
                        Daftar
                    </Link>
                </div>
            </div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}