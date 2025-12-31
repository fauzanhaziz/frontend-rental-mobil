"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Car,
  Package,
  CreditCard,
  Tag,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";
// Hapus import date-fns jika tidak dipakai untuk logika count sederhana
// import { isPast, parseISO, isToday } from "date-fns";

import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

// --- TYPE DEFINITIONS ---
interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pathname: string;
}

interface ApiOrder {
  id: number;
  status: string;
  tanggal_selesai: string;
}

// Helper untuk memastikan array (Type Guard)
function getResults(data: unknown): ApiOrder[] {
  if (Array.isArray(data)) return data as ApiOrder[];
  if (typeof data === 'object' && data !== null && 'results' in data) {
    return (data as { results: unknown[] }).results as ApiOrder[];
  }
  return [];
}

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/customer/dashboard" },
  { icon: Car, label: "Mobil Tersedia", path: "/customer/cars" },
  { icon: Package, label: "Pesanan Saya", path: "/customer/orders" }, // Badge Target
  { icon: CreditCard, label: "Pembayaran", path: "/customer/payments" },
  { icon: Tag, label: "Promo & Penawaran", path: "/customer/promos" },
  { icon: UserCircle, label: "Profil Saya", path: "/customer/profile" },
  { icon: Settings, label: "Pengaturan", path: "/customer/pengaturan" },
];

export function CustomerSidebar({
  isCollapsed,
  pathname,
}: SidebarProps) {
  const { user, logout } = useAuth();
  
  // --- STATE NOTIFIKASI ---
  const [activeOrderCount, setActiveOrderCount] = useState(0);

  // --- FETCH DATA (POLLING) ---
  useEffect(() => {
    const fetchActiveOrders = async () => {
      try {
        const res = await api.get("/pesanan/");
        const orders = getResults(res.data);

        // LOGIKA BARU:
        // Hitung semua pesanan yang statusnya BUKAN 'selesai' dan BUKAN 'batal'.
        // Artinya: Pending, Konfirmasi, dan Aktif akan terus muncul di badge.
        const activeCount = orders.filter(order => 
            ['pending', 'konfirmasi', 'aktif'].includes(order.status)
        ).length;

        setActiveOrderCount(activeCount);

      } catch (error) {
        console.error("Gagal mengambil status pesanan sidebar", error);
      }
    };

    // Panggil saat mount
    fetchActiveOrders();

    // Polling setiap 30 detik agar sinkron jika admin mengupdate status
    const interval = setInterval(fetchActiveOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Logic Tampilan Nama
  const displayName = user?.nama_pelanggan || user?.username || "Pelanggan";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* === HEADER SIDEBAR === */}
      <div className="h-16 flex items-center justify-center border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Car className="h-5 w-5" />
          </div>
          
          <div 
            className={`
              font-bold text-lg whitespace-nowrap transition-all duration-300 origin-left
              ${isCollapsed ? "w-0 opacity-0 scale-0" : "w-auto opacity-100 scale-100"}
            `}
          >
            Rental<span className="text-blue-600">Mobil</span>
          </div>
        </div>
      </div>

      {/* === USER INFO === */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700 transition-all">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${displayName}&background=2563eb&color=fff`} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <div className="overflow-hidden transition-all duration-300">
              <p className="text-sm font-semibold truncate">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role || 'Customer'}</p>
            </div>
          )}
        </div>
      </div>

      {/* === MENU LIST === */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 custom-scrollbar">
        <TooltipProvider delayDuration={0}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            
            // Logic Badge: Muncul jika menu Pesanan DAN ada order aktif
            const showBadge = item.path === "/customer/orders" && activeOrderCount > 0;

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
                      {/* Container Icon + Badge Collapsed */}
                      <div className="relative">
                          <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                          
                          {/* BADGE SAAT COLLAPSED (Titik Merah) */}
                          {isCollapsed && showBadge && (
                             <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse" />
                          )}
                      </div>
                      
                      {!isCollapsed && (
                        <>
                            <span className="ml-3 truncate flex-1 text-left">{item.label}</span>
                            
                            {/* BADGE SAAT EXPANDED (Angka) */}
                            {showBadge && (
                                <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-in zoom-in duration-300">
                                    {activeOrderCount}
                                </span>
                            )}
                        </>
                      )}
                    </Button>
                  </Link>
                </TooltipTrigger>

                {isCollapsed && (
                  <TooltipContent side="right" className="bg-slate-900 text-white border-slate-800 ml-2 flex items-center gap-2">
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

      {/* === FOOTER === */}
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
}