"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bell, Search, Menu, X, CheckCheck, Trash2, 
  AlertTriangle, CheckCircle, Clock, XCircle, Loader2, LogOut, User 
} from "lucide-react";
import { isPast, parseISO, isToday, formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { useAuth } from "@/contexts/AuthContext";
import { useSearch } from "@/contexts/SearchContext";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleTheme } from "@/components/admin/ThemeToggle"; 

// --- TYPE DEFINITIONS ---
interface ApiOrder {
  id: number;
  kode_booking: string;
  mobil_detail: { nama_mobil: string };
  status: string;
  tanggal_selesai: string; 
  created_at: string;
}

interface NotificationItem {
  id: string; // Unique ID (kombinasi tipe + orderId)
  orderId: number;
  title: string;
  description: string;
  time: string;
  type: "success" | "warning" | "error" | "info";
  read: boolean;
  priority: number; 
  link: string; // Link tujuan
}

// Helper Type Guard
function getArrayFromResponse(res: unknown): ApiOrder[] {
    if (typeof res === 'object' && res !== null && 'data' in res) {
        const data = (res as { data: unknown }).data;
        if (Array.isArray(data)) return data as ApiOrder[];
        if (typeof data === 'object' && data !== null && 'results' in data) {
            return (data as { results: ApiOrder[] }).results;
        }
    }
    return [];
}

interface HeaderProps {
  pathname: string;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export function CustomerHeader({
  pathname,
  onToggleSidebar,
  isSidebarCollapsed,
}: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { searchTerm, setSearchTerm, clearSearch } = useSearch();

  // --- STATE ---
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  // 1. Load Read IDs dari LocalStorage
  useEffect(() => {
      const stored = localStorage.getItem("customer_read_notifications");
      if (stored) {
          try {
              setReadIds(JSON.parse(stored));
          } catch (e) {
              console.error("Gagal parse localstorage customer", e);
          }
      }
  }, []);

  // --- LOGIKA NAMA DISPLAY ---
  const displayName = user?.nama_pelanggan || user?.username || "Pelanggan";
  const initials = displayName.substring(0, 2).toUpperCase();

  // --- PAGE TITLE LOGIC ---
  const menuTitles = [
    { path: "/customer/dashboard", label: "Dashboard" },
    { path: "/customer/cars", label: "Mobil Tersedia" },
    { path: "/customer/orders", label: "Pesanan Saya" },
    { path: "/customer/payments", label: "Pembayaran" },
    { path: "/customer/promos", label: "Promo" },
    { path: "/customer/profile", label: "Profil Saya" },
    { path: "/customer/settings", label: "Pengaturan" },
  ];

  const pageTitle = menuTitles.find((m) => pathname.startsWith(m.path))?.label || "Dashboard";

  // --- FETCH & GENERATE NOTIFIKASI ---
  const fetchOrderNotifications = async () => {
    try {
      const res = await api.get("/pesanan/");
      const orders = getArrayFromResponse(res);

      const generatedNotifs: NotificationItem[] = [];

      orders.forEach((order) => {
        const endDate = parseISO(order.tanggal_selesai);
        const linkDetail = `/customer/orders/${order.id}`; // Link ke detail pesanan
        
        // 1. NOTIFIKASI OVERDUE (Telat)
        if (
           (order.status === 'aktif' || order.status === 'konfirmasi') && 
           isPast(endDate) && 
           !isToday(endDate)
        ) {
            const notifId = `overdue-${order.id}`;
            generatedNotifs.push({
                id: notifId,
                orderId: order.id,
                title: "⚠️ PENGEMBALIAN TERLAMBAT!",
                description: `Masa sewa ${order.mobil_detail.nama_mobil} habis. Segera kembalikan!`,
                time: order.tanggal_selesai,
                type: "error",
                read: readIds.includes(notifId),
                priority: 1,
                link: linkDetail
            });
        }

        // 2. NOTIFIKASI KONFIRMASI (Disetujui)
        else if (order.status === 'konfirmasi') {
            const notifId = `confirmed-${order.id}`;
            generatedNotifs.push({
                id: notifId,
                orderId: order.id,
                title: "✅ Pesanan Disetujui",
                description: `Sewa ${order.mobil_detail.nama_mobil} siap diambil.`,
                time: order.created_at,
                type: "success",
                read: readIds.includes(notifId),
                priority: 2,
                link: linkDetail
            });
        }

        // 3. NOTIFIKASI PENDING (Menunggu)
        else if (order.status === 'pending') {
            const notifId = `pending-${order.id}`;
            generatedNotifs.push({
                id: notifId,
                orderId: order.id,
                title: "⏳ Menunggu Konfirmasi",
                description: `Booking ${order.mobil_detail.nama_mobil} sedang diproses admin.`,
                time: order.created_at,
                type: "info",
                read: readIds.includes(notifId),
                priority: 3,
                link: linkDetail
            });
        }
        
        // 4. NOTIFIKASI AKTIF (Sedang Jalan)
        else if (order.status === 'aktif') {
            const notifId = `active-${order.id}`;
            generatedNotifs.push({
                id: notifId,
                orderId: order.id,
                title: "🔑 Sedang Disewa",
                description: `Mobil ${order.mobil_detail.nama_mobil} sedang Anda gunakan.`,
                time: order.created_at, // Bisa diganti tgl ambil
                type: "info",
                read: readIds.includes(notifId),
                priority: 4,
                link: linkDetail
            });
        }
      });

      // Urutkan: Unread dulu -> Priority -> Waktu Terbaru
      generatedNotifs.sort((a, b) => {
          if (a.read !== b.read) return a.read ? 1 : -1; // Unread di atas
          if (a.priority !== b.priority) return a.priority - b.priority;
          return new Date(b.time).getTime() - new Date(a.time).getTime();
      });

      setNotifications(generatedNotifs);

    } catch (error) {
      console.error("Gagal load notifikasi customer", error);
    }
  };

  useEffect(() => {
    setLoadingNotif(true);
    fetchOrderNotifications().finally(() => setLoadingNotif(false));

    // Polling setiap 30 detik
    const interval = setInterval(fetchOrderNotifications, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readIds]); // Re-run jika readIds berubah

  // --- HANDLERS ---

  const handleNotifClick = (notif: NotificationItem) => {
      // Tandai Read
      if (!readIds.includes(notif.id)) {
          const newReads = [...readIds, notif.id];
          setReadIds(newReads);
          localStorage.setItem("customer_read_notifications", JSON.stringify(newReads));
      }
      // Pindah Halaman
      router.push(notif.link);
  };

  const markAllAsRead = (e: React.MouseEvent) => {
      e.stopPropagation();
      const allIds = notifications.map(n => n.id);
      const newReads = Array.from(new Set([...readIds, ...allIds]));
      setReadIds(newReads);
      localStorage.setItem("customer_read_notifications", JSON.stringify(newReads));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // --- HELPER ICON ---
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error": return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

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
      <div className="w-full h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        
        {/* LEFT: MENU TOGGLE + TITLE */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <Menu size={20} />
          </Button>

          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 hidden sm:block">
            {pageTitle}
          </h1>
        </div>

        {/* CENTER: SEARCH BAR (Optional) */}
        <div className="flex-1 max-w-md hidden md:block px-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <Input
              placeholder="Cari sesuatu..."
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

        {/* RIGHT: ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          <ToggleTheme />

          {/* NOTIFIKASI DROPDOWN */}
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

            <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-xl">
              <DropdownMenuLabel className="flex items-center justify-between py-3">
                <span className="font-bold">Notifikasi ({unreadCount})</span>
                {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-7 text-xs text-blue-600 hover:bg-blue-50 px-2">
                        <CheckCheck className="h-3 w-3 mr-1" /> Baca Semua
                    </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[320px]">
                {loadingNotif ? (
                     <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-sm">
                    <CheckCircle className="h-8 w-8 mb-2 opacity-20 text-green-500" /> 
                    Tidak ada notifikasi penting
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                        key={notif.id} 
                        onClick={() => handleNotifClick(notif)}
                        className={`
                            p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors relative
                            hover:bg-slate-50 dark:hover:bg-slate-800/50
                            ${notif.read ? "bg-white dark:bg-slate-950 opacity-70" : ""}
                            ${!notif.read && notif.type === 'error' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}
                            ${!notif.read && notif.type === 'success' ? 'bg-green-50/50 dark:bg-green-900/10' : ''}
                            ${!notif.read && notif.type === 'info' ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}
                        `}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 shrink-0">{getNotificationIcon(notif.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                              <p className={`text-sm ${notif.read ? "font-medium text-slate-600" : "font-bold text-slate-900"} dark:text-slate-100`}>
                                  {notif.title}
                              </p>
                              {!notif.read && <span className="h-2 w-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                          </div>
                          
                          <p className="text-xs text-slate-500 line-clamp-2 mb-1">{notif.description}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              {notif.type === 'error' && 'Jatuh tempo: '}
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
                   <Link href="/customer/orders" className="text-xs text-blue-600 hover:underline">
                      Lihat Semua Pesanan
                   </Link>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* PROFILE DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${displayName}&background=2563eb&color=fff`} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="hidden md:flex flex-col items-start text-left mr-1">
                  <span className="text-sm font-medium leading-none max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize">
                    {user?.role || 'Customer'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel>
                <p className="font-medium truncate">{displayName}</p>
                <p className="text-xs text-slate-500 font-normal truncate">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/customer/profile">
                   <User className="mr-2 h-4 w-4" /> Profil Saya
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/customer/orders">
                   <Clock className="mr-2 h-4 w-4" /> Riwayat Pesanan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}