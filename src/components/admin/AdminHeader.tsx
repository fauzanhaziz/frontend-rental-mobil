"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, Menu, X, CheckCheck, Loader2, Key, Car, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { useAuth } from "@/contexts/AuthContext";
import { useSearch } from "@/contexts/SearchContext";
import api from "@/lib/axios";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { ToggleTheme } from "./ThemeToggle";

// --- TYPE DEFINITIONS ---

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  time: string;
  status: string; // 'pending' | 'konfirmasi' | 'aktif'
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link: string;
}

interface ApiOrder {
  id: number;
  kode_booking: string;
  pelanggan_detail: { nama: string };
  mobil_detail: { nama_mobil: string };
  created_at: string;
  status: string;
}

// Helper untuk memastikan array hasil API
const getArrayFromResponse = (res: unknown): ApiOrder[] => {
    if (typeof res === 'object' && res !== null && 'data' in res) {
        const data = (res as { data: unknown }).data;
        if (Array.isArray(data)) return data as ApiOrder[];
        if (typeof data === 'object' && data !== null && 'results' in data) {
            return (data as { results: ApiOrder[] }).results;
        }
    }
    return [];
};

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export const AdminHeader = ({
  onToggleSidebar,
  isSidebarCollapsed,
}: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { searchTerm, setSearchTerm, clearSearch } = useSearch();

  // State Notifikasi
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [readIds, setReadIds] = useState<number[]>([]);

  // 1. Load Read IDs dari LocalStorage saat mount
  useEffect(() => {
      const stored = localStorage.getItem("admin_read_notifications");
      if (stored) {
          try {
              setReadIds(JSON.parse(stored));
          } catch (e) {
              console.error("Gagal parse localstorage", e);
          }
      }
  }, []);

  // Judul Halaman Otomatis
  const getPageTitle = () => {
    if (!pathname) return "Dashboard";
    const parts = pathname.split("/"); 
    const page = parts[2] || "Dashboard";
    return page
      .replace(/-/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  const getNotificationIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-5 w-5 text-yellow-500" />;     // Menunggu
      case "konfirmasi": return <CheckCheck className="h-5 w-5 text-blue-500" />; // Siap Ambil
      case "aktif": return <Key className="h-5 w-5 text-purple-500" />;         // Sedang Jalan
      default: return <Bell className="h-5 w-5 text-slate-400" />;
    }
  };

  const getNotificationTitle = (status: string, kode: string) => {
      switch (status) {
          case "pending": return `Pesanan Baru: ${kode}`;
          case "konfirmasi": return `Siap Diambil: ${kode}`;
          case "aktif": return `Sedang Jalan: ${kode}`;
          default: return `Pesanan: ${kode}`;
      }
  };

  // --- FETCH NOTIFIKASI (SEMUA YANG AKTIF) ---
  const fetchNotifications = async () => {
    try {
      // Ambil Pending, Konfirmasi, dan Aktif
      const [resPending, resKonfirmasi, resAktif] = await Promise.all([
          api.get("/pesanan/?status=pending"),
          api.get("/pesanan/?status=konfirmasi"),
          api.get("/pesanan/?status=aktif")
      ]);
      
      const orders = [
          ...getArrayFromResponse(resPending),
          ...getArrayFromResponse(resKonfirmasi),
          ...getArrayFromResponse(resAktif)
      ];

      // Mapping ke format NotificationItem
      const mappedNotifs: NotificationItem[] = orders.map((order) => ({
        id: order.id,
        title: getNotificationTitle(order.status, order.kode_booking),
        description: `${order.pelanggan_detail?.nama || 'Guest'} - ${order.mobil_detail?.nama_mobil}`,
        time: order.created_at,
        status: order.status,
        type: "info",
        // Cek apakah ID ini ada di state readIds
        read: readIds.includes(order.id), 
        link: `/admin/orders/${order.id}` 
      }));

      // Urutkan: Unread dulu, baru berdasarkan waktu terbaru
      mappedNotifs.sort((a, b) => {
          if (a.read === b.read) {
              return new Date(b.time).getTime() - new Date(a.time).getTime();
          }
          return a.read ? 1 : -1;
      });

      setNotifications(mappedNotifs);
    } catch (error) {
      console.error("Gagal mengambil notifikasi", error);
    }
  };

  // Fetch data loop
  useEffect(() => {
    setLoadingNotif(true);
    fetchNotifications().finally(() => setLoadingNotif(false));

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readIds]); // Re-run jika readIds berubah agar sorting update

  // --- ACTIONS ---

  const handleNotificationClick = (notif: NotificationItem) => {
    // Tandai sebagai read saat diklik
    if (!readIds.includes(notif.id)) {
        const newReadIds = [...readIds, notif.id];
        setReadIds(newReadIds);
        localStorage.setItem("admin_read_notifications", JSON.stringify(newReadIds));
    }
    router.push(notif.link);
  };

  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation(); // Biar dropdown gak nutup
    const allIds = notifications.map(n => n.id);
    // Gabungkan unique IDs
    const newReadIds = Array.from(new Set([...readIds, ...allIds]));
    
    setReadIds(newReadIds);
    localStorage.setItem("admin_read_notifications", JSON.stringify(newReadIds));
  };

  // Hitung jumlah yang belum dibaca saja untuk Badge Merah
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header
      className={`
        fixed top-0 right-0 z-30 h-16 border-b 
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-md
        border-slate-200 dark:border-slate-800
        transition-all duration-300 ease-in-out
        left-0 
        ${isSidebarCollapsed ? 'lg:left-[80px]' : 'lg:left-[280px]'}
      `}
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        
        {/* LEFT: Toggle & Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <Menu size={20} />
          </Button>

          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 hidden sm:block capitalize">
            {getPageTitle()}
          </h1>
        </div>

        {/* MIDDLE: Search */}
        <div className="flex-1 max-w-md hidden md:block px-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <Input
              placeholder="Cari data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 transition-all w-full"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          <ToggleTheme />

          {/* Notifikasi Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-80 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-xl"
              sideOffset={8}
            >
              <DropdownMenuLabel className="flex items-center justify-between py-3">
                <span className="font-bold">Notifikasi ({unreadCount})</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-7 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Tandai Terbaca
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <ScrollArea className="h-[320px]">
                {loadingNotif ? (
                   <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin mb-2" />
                      <span className="text-xs">Memuat...</span>
                   </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-sm">
                    <Bell className="h-8 w-8 mb-2 opacity-20" />
                    Tidak ada pesanan aktif
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`
                        p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors relative 
                        ${notif.read ? "bg-white dark:bg-slate-950 opacity-70" : "bg-blue-50/40 dark:bg-blue-900/10"} 
                        hover:bg-slate-50 dark:hover:bg-slate-800/50
                      `}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 text-lg shrink-0">
                          {getNotificationIcon(notif.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                              <p className={`text-sm ${notif.read ? "font-medium text-slate-600 dark:text-slate-400" : "font-bold text-slate-900 dark:text-slate-100"}`}>
                                {notif.title}
                              </p>
                              {!notif.read && <span className="h-2 w-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                          </div>
                          
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-1">
                            {notif.description}
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            {formatDistanceToNow(new Date(notif.time), { addSuffix: true, locale: idLocale })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
              
              {notifications.length > 0 && (
                  <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                      <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline">
                          Lihat Semua Pesanan
                      </Link>
                  </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs">
                    {user?.username?.substring(0, 2).toUpperCase() ?? "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start text-left mr-1">
                  <span className="text-sm font-medium leading-none">{user?.username || "Admin"}</span>
                  <span className="text-[10px] text-slate-500 capitalize">{user?.role || 'Administrator'}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/admin/reports">Laporan</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/admin/pengaturan">Pengaturan</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
};