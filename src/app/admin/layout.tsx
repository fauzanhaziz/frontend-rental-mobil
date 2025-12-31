"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // State
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false); // Tambahan state deteksi layar

  useEffect(() => {
    setMounted(true);
    // Deteksi ukuran layar awal
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1024);
    checkScreen();
    
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Auto close mobile menu
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (!mounted) return null;

  // Margin konten utama di Desktop
  const mainContentMargin = isDesktopCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]";
  
  // Lebar sidebar wrapper
  // Di Mobile: Selalu 280px (agar teks terbaca)
  // Di Desktop: Sesuai status collapse (80px atau 280px)
  const sidebarWidthClass = isDesktop 
    ? (isDesktopCollapsed ? "w-[80px]" : "w-[280px]") 
    : "w-[280px]";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex font-sans">

      {/* MOBILE OVERLAY */}
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

      {/* SIDEBAR WRAPPER */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 
          ${sidebarWidthClass} 
        `}
      >
        <AdminSidebar
          pathname={pathname}
          // LOGIC FIX: Di HP (isDesktop=false), sidebar selalu Expanded (false) agar teks muncul
          isCollapsed={isDesktop && isDesktopCollapsed}
          onToggleCollapse={() => {
            if (!isDesktop) {
              setIsMobileOpen(false);
            } else {
              setIsDesktopCollapsed(!isDesktopCollapsed);
            }
          }}
        />
      </aside>

      {/* MAIN CONTENT */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AdminHeader
          pathname={pathname}
          isSidebarCollapsed={isDesktopCollapsed}
          onToggleSidebar={() => {
            if (!isDesktop) {
              setIsMobileOpen(!isMobileOpen);
            } else {
              setIsDesktopCollapsed(!isDesktopCollapsed);
            }
          }}
        />

        <main className="flex-1 pt-24 px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

    </div>
  );
}