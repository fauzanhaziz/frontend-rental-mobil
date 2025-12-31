"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Car, 
  Package, 
  CreditCard, 
  Tag,
  Loader2,
  Clock,
  ArrowRight,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CardStat } from "@/components/customer/CardStat"; 
import api from "@/lib/axios";
import { format, differenceInDays, parseISO, differenceInHours } from "date-fns";
import { id } from "date-fns/locale";

// --- INTERFACES ---
interface Order {
  id: number;
  kode_booking: string;
  mobil_detail: { nama_mobil: string };
  tanggal_mulai: string;
  tanggal_selesai: string;
  harga_total: string;
  status: string;
  created_at: string;
}

interface Payment {
  jumlah: string;
  status: string;
}

interface Promo {
  id: number;
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // State Data
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalSpent: 0,
    activePromos: 0
  });
  
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [currentRental, setCurrentRental] = useState<Order | null>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resOrders, resPayments, resPromos] = await Promise.all([
          api.get('/pesanan/'),
          api.get('/pembayaran/'),
          api.get('/promo/')
        ]);

        // --- 1. Process Orders ---
        let ordersData: Order[] = [];
        if (Array.isArray(resOrders.data)) {
            ordersData = resOrders.data;
        } else if (resOrders.data && 'results' in resOrders.data && Array.isArray(resOrders.data.results)) {
            ordersData = resOrders.data.results;
        }

        const activeOrds = ordersData.filter(o => ['pending', 'konfirmasi'].includes(o.status));
        
        const ongoing = ordersData.find(o => {
            const now = new Date();
            const start = parseISO(o.tanggal_mulai);
            const end = parseISO(o.tanggal_selesai);
            return o.status === 'konfirmasi' && now >= start && now <= end;
        });

        // --- 2. Process Payments ---
        let paymentsData: Payment[] = [];
        if (Array.isArray(resPayments.data)) {
            paymentsData = resPayments.data;
        } else if (resPayments.data && 'results' in resPayments.data && Array.isArray(resPayments.data.results)) {
            paymentsData = resPayments.data.results;
        }

        const totalSpent = paymentsData
            .filter(p => p.status === 'lunas')
            .reduce((acc, curr) => acc + parseFloat(curr.jumlah), 0);

        // --- 3. Process Promos ---
        let promosData: Promo[] = [];
        if (Array.isArray(resPromos.data)) {
            promosData = resPromos.data;
        } else if (resPromos.data && 'results' in resPromos.data && Array.isArray(resPromos.data.results)) {
            promosData = resPromos.data.results;
        }

        setStats({
            totalOrders: ordersData.length,
            activeOrders: activeOrds.length,
            totalSpent: totalSpent,
            activePromos: promosData.length
        });
        
        setRecentOrders(ordersData.slice(0, 5));
        setCurrentRental(ongoing || null);

      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- HELPERS ---
  const formatRupiah = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const formatDate = (dateStr: string) => format(parseISO(dateStr), "dd MMM yyyy", { locale: id });

  const getRentalProgress = (startStr: string, endStr: string) => {
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    const now = new Date();
    
    const totalDuration = differenceInHours(end, start);
    const elapsed = differenceInHours(now, start);
    
    if (totalDuration === 0) return 0;
    const progress = (elapsed / totalDuration) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getDaysRemaining = (endStr: string) => {
    const end = parseISO(endStr);
    const now = new Date();
    const days = differenceInDays(end, now);
    return days > 0 ? `${days} hari lagi` : "Hari terakhir";
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-950">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardStat 
            icon={Package} 
            title="Total Pesanan" 
            value={stats.totalOrders.toString()} 
            color="blue" 
        />
        <CardStat 
            icon={Car} 
            title="Pesanan Aktif" 
            value={stats.activeOrders.toString()} 
            color="green" 
        />
        <CardStat 
            icon={CreditCard} 
            title="Total Pengeluaran" 
            value={new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short", style: "currency", currency: "IDR" }).format(stats.totalSpent)} 
            color="orange" 
        />
        <CardStat 
            icon={Tag} 
            title="Promo Tersedia" 
            value={stats.activePromos.toString()} 
            color="purple" 
        />
      </div>

      {/* Active Rental Widget */}
      {currentRental ? (
        <Card className="p-6 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900 shadow-sm">
            <div className="flex items-center justify-between mb-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Sewa Berlangsung</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 ml-9">
                    {currentRental.mobil_detail.nama_mobil} • {formatDate(currentRental.tanggal_mulai)} - {formatDate(currentRental.tanggal_selesai)}
                </p>
            </div>
            <div className="text-right bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Sisa Waktu</p>
                <p className="font-bold text-lg flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Clock className="h-4 w-4" />
                    {getDaysRemaining(currentRental.tanggal_selesai)}
                </p>
            </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Mulai</span>
                    <span>Selesai</span>
                </div>
                <Progress value={getRentalProgress(currentRental.tanggal_mulai, currentRental.tanggal_selesai)} className="h-2" />
            </div>
        </Card>
      ) : (
        // CTA Card (No Active Rental) - FIXED COLORS
        <Card className="p-6 bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Car className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Siap untuk perjalanan baru?</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Pilih mobil favoritmu dan mulai petualangan sekarang.</p>
                </div>
            </div>
            <Button 
                onClick={() => router.push("/customer/cars")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 shadow-md"
            >
                Sewa Mobil Sekarang <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </Card>
      )}

      {/* Recent Orders + Promos Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <Card className="p-0 lg:col-span-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white">Pesanan Terbaru</h3>
            <Button
              variant="ghost"
              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={() => router.push("/customer/orders")}
            >
              Lihat Semua
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="text-slate-500 dark:text-slate-400">Booking ID</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400">Mobil</TableHead>
                    <TableHead className="hidden sm:table-cell text-slate-500 dark:text-slate-400">Tanggal</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400">Status</TableHead>
                    <TableHead className="text-right text-slate-500 dark:text-slate-400">Total</TableHead>
                </TableRow>
                </TableHeader>

                <TableBody>
                {recentOrders.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-slate-500 dark:text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Package className="h-8 w-8 text-slate-300" />
                                <p>Belum ada riwayat pesanan.</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    recentOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <TableCell className="font-mono font-medium text-slate-900 dark:text-slate-200">{order.kode_booking}</TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">{order.mobil_detail.nama_mobil}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-slate-500 dark:text-slate-400">{formatDate(order.tanggal_mulai)}</TableCell>
                        <TableCell>
                            <Badge
                            variant="secondary"
                            className={
                                order.status === "konfirmasi"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 border-green-200 dark:border-green-800"
                                : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100 border-yellow-200 dark:border-yellow-800"
                                : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-100"
                            }
                            >
                            {order.status === 'konfirmasi' ? 'Aktif' : order.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-900 dark:text-slate-200">
                            {formatRupiah(order.harga_total)}
                        </TableCell>
                        </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
          </div>
        </Card>

        {/* Promo / Info Cards (Stacked) - FIXED COLORS */}
        <div className="space-y-6">
            <Card 
                className="p-6 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-900 shadow-sm cursor-pointer hover:shadow-md transition-all group" 
                onClick={() => router.push('/customer/promos')}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                        <Tag className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 hover:bg-orange-200 border-none">Promo</Badge>
                </div>
                <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">Diskon Spesial!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Hemat biaya sewa dengan kode promo eksklusif untuk member.
                </p>
                <div className="text-xs font-bold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 inline-block px-3 py-1 rounded-full border border-orange-100 dark:border-orange-800">
                    {stats.activePromos} Promo Tersedia
                </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Pembayaran</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Cek status pembayaran atau upload bukti transfer.
                </p>
                <Button 
                    variant="outline" 
                    className="w-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200" 
                    onClick={() => router.push('/customer/payments')}
                >
                    Kelola Pembayaran
                </Button>
            </Card>
        </div>

      </div>
    </motion.div>
  );
}