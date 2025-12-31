"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Car, Package, CreditCard, Users, TrendingUp, Plus, Loader2 } from "lucide-react";
import { CardStat } from "@/components/admin/StatsCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

// --- DEFINISI TIPE DATA (Sesuai Response Backend) ---
interface DashboardData {
  stats: {
    total_mobil: number;
    total_pesanan: number;
    pembayaran_lunas: number;
    total_pelanggan: number;
  };
  charts: {
    month: string;
    revenue: number;
    orders: number;
  }[];
  recent_activities: {
    id: number;
    customer: string;
    action: string;
    time: string;
  }[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. FETCH DATA DARI BACKEND
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Pastikan endpoint ini sesuai dengan yang ada di backend (pesanan/views_dashboard.py)
        // Jika endpoint backend adalah /api/pesanan/dashboard/stats/, gunakan path tersebut
        const response = await api.get<DashboardData>("/pesanan/dashboard/stats/");
        setData(response.data);
      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 2. NAVIGASI HALAMAN
  const handleNavigate = (path: string) => {
    router.push(`/admin/${path}`);
  };

  // 3. LOADING STATE
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Fallback data agar tidak crash jika API kosong/error
  const stats = data?.stats || { total_mobil: 0, total_pesanan: 0, pembayaran_lunas: 0, total_pelanggan: 0 };
  const charts = data?.charts || [];
  const activities = data?.recent_activities || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* --- Statistics Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardStat 
            icon={Car} 
            title="Total Mobil" 
            value={stats.total_mobil.toString()} 
            color="blue" 
        />
        <CardStat 
            icon={Package} 
            title="Total Pesanan" 
            value={stats.total_pesanan.toString()} 
            color="green" 
        />
        <CardStat 
            icon={CreditCard} 
            title="Pembayaran Lunas" 
            value={stats.pembayaran_lunas.toString()} 
            color="orange" 
        />
        <CardStat 
            icon={Users} 
            title="Total Pelanggan" 
            value={stats.total_pelanggan.toString()} 
            color="purple" 
        />
      </div>

      {/* --- Charts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 dark:text-slate-100 font-semibold">Pendapatan per Bulan</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    color: "#1e293b"
                  }}
                  formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Orders Chart */}
        <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 dark:text-slate-100 font-semibold">Pesanan per Bulan</h3>
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    color: "#1e293b"
                  }}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* --- Recent Activities & Quick Actions --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activities */}
        <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 lg:col-span-2">
          <h3 className="text-slate-900 dark:text-slate-100 mb-4 font-semibold">Aktivitas Terbaru</h3>
          <div className="space-y-3">
            {activities.length > 0 ? (
                activities.map((activity) => (
                <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <div>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                        <span className="font-medium">{activity.customer}</span>{" "}
                        <span className="text-slate-600 dark:text-slate-400">
                            {activity.action}
                        </span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                        {formatDistanceToNow(new Date(activity.time), { addSuffix: true, locale: id })}
                        </p>
                    </div>
                    </div>
                </motion.div>
                ))
            ) : (
                <div className="text-center py-8 text-slate-500 text-sm">Belum ada aktivitas baru.</div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-fit">
          <h3 className="text-slate-900 dark:text-slate-100 mb-4 font-semibold">Aksi Cepat</h3>
          <div className="space-y-3">
            <Button
              className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => handleNavigate("cars")}
            >
              <Car className="h-4 w-4" />
              Tambah Mobil Baru
            </Button>
            <Button
              className="w-full justify-start gap-2"
              variant="outline"
              onClick={() => handleNavigate("drivers")}
            >
              <Plus className="h-4 w-4" />
              Tambah Supir
            </Button>
            <Button
              className="w-full justify-start gap-2"
              variant="outline"
              onClick={() => handleNavigate("payments")}
            >
              <CreditCard className="h-4 w-4" />
              Cek Pembayaran
            </Button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}