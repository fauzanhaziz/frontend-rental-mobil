"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import { CustomerHeader } from "@/components/customer/CustomerHeader";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // State untuk Desktop (Mini/Full)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  
  // State untuk Mobile (Buka/Tutup Drawer)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Hydration check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Tutup sidebar mobile secara otomatis saat pindah halaman (Navigasi)
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (!mounted) {
    return <div className="bg-slate-50 dark:bg-slate-900 min-h-screen" />;
  }

  // Lebar Sidebar untuk Desktop (Tailwind class logic)
  // 280px (w-70) vs 80px (w-20)
  const desktopMarginClass = isDesktopCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      
      {/* === 1. MOBILE OVERLAY (Hanya muncul di Mobile saat menu terbuka) === */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* === 2. SIDEBAR WRAPPER === */}
      {/* - Mobile: Fixed, z-50, transform translate (slide in/out)
          - Desktop: Fixed, z-30, selalu terlihat (translate-x-0)
      */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 
        `}
        style={{ 
          width: isDesktopCollapsed ? 80 : 280 
        }}
      >
        <CustomerSidebar
          pathname={pathname || ""} // <--- PERBAIKAN DI SINI
          isCollapsed={isDesktopCollapsed}
          // Di Mobile tombol ini menutup sidebar, di Desktop mengecilkan sidebar
          onToggleCollapse={() => {
            if (window.innerWidth < 1024) {
              setIsMobileOpen(false);
            } else {
              setIsDesktopCollapsed((prev) => !prev);
            }
          }}
        />
      </aside>

      {/* === 3. MAIN CONTENT WRAPPER === */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${desktopMarginClass}`}>
        
        {/* HEADER */}
        <CustomerHeader
          pathname={pathname || ""} // Tambahkan juga di sini agar aman
          // Tombol menu di header: Buka mobile drawer ATAU toggle desktop collapse
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setIsMobileOpen(!isMobileOpen);
            } else {
              setIsDesktopCollapsed(!isDesktopCollapsed);
            }
          }}
          isSidebarCollapsed={isDesktopCollapsed}
        />

        {/* PAGE CONTENT */}
        <main className="flex-1 pt-24 px-4 pb-10 sm:px-6 lg:px-8">
          <motion.div
            key={pathname} // Animasi ulang saat ganti halaman
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>

      </div>
    </div>
  );
}