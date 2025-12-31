"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Car, UserCircle, Package, CreditCard, Users, FileText, Settings, LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

const adminMenuItems = [
  { icon: Home, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Car, label: "Kelola Mobil", path: "/admin/cars" },
  { icon: UserCircle, label: "Kelola Supir", path: "/admin/drivers" },
  { icon: Package, label: "Kelola Pesanan", path: "/admin/orders" }, // Badge muncul di sini
  { icon: CreditCard, label: "Kelola Pembayaran", path: "/admin/payments" },
  { icon: Users, label: "Kelola Pelanggan", path: "/admin/customers" },
  { icon: Users, label: "Kelola Promo", path: "/admin/promo" },
  { icon: FileText, label: "Laporan & Statistik", path: "/admin/reports" },
  { icon: Settings, label: "Pengaturan", path: "/admin/pengaturan" },
  { icon: Settings, label: "Konten", path: "/admin/content" },
];

interface SidebarProps {
  pathname: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Helper untuk menghitung data dari response API (baik pagination maupun array biasa)
// Menggunakan 'unknown' sebagai pengganti 'any' untuk type safety
const getCountFromResponse = (res: { data: { count?: number; results?: unknown[]; length?: number } | unknown[] }): number => {
    if (Array.isArray(res.data)) {
        return res.data.length;
    }
    if (typeof res.data === 'object' && res.data !== null) {
        if ('count' in res.data && typeof res.data.count === 'number') {
            return res.data.count;
        }
        if ('results' in res.data && Array.isArray(res.data.results)) {
            return res.data.results.length;
        }
    }
    return 0;
};

export const AdminSidebar = ({
  isCollapsed,
}: SidebarProps) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  
  // State menyimpan jumlah pesanan aktif (Pending + Konfirmasi + Aktif)
  const [activeOrderCount, setActiveOrderCount] = useState(0);

  // --- LOGIC FETCH PESANAN AKTIF ---
  useEffect(() => {
    const fetchActiveOrders = async () => {
      try {
        // Kita perlu menghitung semua pesanan yang BELUM selesai.
        // Request secara paralel agar efisien
        const [resPending, resKonfirmasi, resAktif] = await Promise.all([
            api.get('/pesanan/?status=pending'),
            api.get('/pesanan/?status=konfirmasi'),
            api.get('/pesanan/?status=aktif')
        ]);
        
        // Hitung total dari ketiga status tersebut
        const total = 
            getCountFromResponse(resPending) + 
            getCountFromResponse(resKonfirmasi) + 
            getCountFromResponse(resAktif);

        setActiveOrderCount(total);
      } catch (error) {
        console.error("Gagal mengambil data pesanan aktif", error);
      }
    };

    // 1. Panggil saat load
    fetchActiveOrders();

    // 2. Polling setiap 30 detik agar angka selalu update jika ada order baru/perubahan status
    const intervalId = setInterval(fetchActiveOrders, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* HEADER */}
      <div className="h-16 flex items-center justify-center border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Car className="h-5 w-5" />
          </div>
          <div 
            className={`
              font-bold text-lg whitespace-nowrap transition-all duration-300 origin-left
              ${isCollapsed ? "w-0 opacity-0 scale-0" : "w-auto opacity-100 scale-100"}
            `}
          >
            Admin<span className="text-blue-600">Panel</span>
          </div>
        </div>
      </div>

      {/* USER INFO */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700 transition-all">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.username}&background=2563eb&color=fff`} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
              {user?.username?.substring(0, 2).toUpperCase() ?? "AD"}
            </AvatarFallback>
          </Avatar>
          
          {!isCollapsed && (
            <div className="overflow-hidden transition-all duration-300">
              <p className="text-sm font-semibold truncate">{user?.username || "Administrator"}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role || "Admin"}</p>
            </div>
          )}
        </div>
      </div>

      {/* MENU NAVIGASI */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 custom-scrollbar">
        <TooltipProvider delayDuration={0}>
          {adminMenuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            
            // LOGIC BADGE:
            // Tampilkan badge jika ini menu "Pesanan" DAN ada pesanan yang belum selesai (activeOrderCount > 0)
            const showBadge = item.path === "/admin/orders" && activeOrderCount > 0;

            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link href={item.path} className="block relative"> 
                    <Button
                      variant="ghost"
                      className={`
                        w-full h-11 mb-1 transition-all duration-200 group relative
                        ${isCollapsed ? "px-0 justify-center" : "px-4 justify-start"}
                        ${isActive 
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-semibold shadow-sm" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}
                      `}
                    >
                      <div className="relative">
                          <item.icon 
                            className={`
                              h-5 w-5 shrink-0 transition-colors
                              ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200"}
                            `} 
                          />
                          
                          {/* BADGE COLLAPSED (Titik Merah) */}
                          {isCollapsed && showBadge && (
                             <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse" />
                          )}
                      </div>
                      
                      {!isCollapsed && (
                        <>
                            <span className="ml-3 truncate flex-1 text-left">{item.label}</span>
                            
                            {/* BADGE EXPANDED (Angka Total Active) */}
                            {showBadge && (
                                <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-in zoom-in duration-300">
                                    {activeOrderCount > 99 ? '99+' : activeOrderCount}
                                </span>
                            )}
                        </>
                      )}
                    </Button>
                  </Link>
                </TooltipTrigger>

                {isCollapsed && (
                  <TooltipContent side="right" className="bg-slate-900 text-white border-slate-800 ml-2 font-medium flex items-center gap-2">
                    {item.label}
                    {showBadge && (
                         <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{activeOrderCount}</span>
                    )}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={logout}
                className={`
                  w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 transition-colors
                  ${isCollapsed ? "justify-center px-0" : "justify-start px-4"}
                `}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="ml-3">Logout</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
                <TooltipContent side="right" className="bg-red-600 text-white border-red-600">
                    Logout
                </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

    </div>
  );
};