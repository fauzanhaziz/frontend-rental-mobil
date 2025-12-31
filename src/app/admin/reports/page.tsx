"use client";

import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Download, TrendingUp, BarChart3, FileSpreadsheet, FileText, Loader2, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';
import api from "@/lib/axios";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import axios from 'axios';

// --- TYPE DEFINITIONS ---

interface ReportData {
  orders: { month: string; orders: number }[];
  revenue: { month: string; revenue: number }[];
  car_types: { name: string; value: number; color: string }[];
}

// Interface Extension untuk jsPDF agar properti lastAutoTable dikenali (Tanpa ANY)
interface JsPDFWithPlugin extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

// Helper: Load Image ke Base64 untuk PDF
const loadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } else {
        reject("Canvas context error");
      }
    };
    img.onerror = (error) => reject(error);
  });
};

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('orders');
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<ReportData>('/pesanan/reports/dashboard/');
        setData(response.data);
      } catch (error: unknown) {
        console.error("Gagal memuat laporan:", error);
        if (axios.isAxiosError(error)) {
            toast.error(`Gagal memuat data: ${error.message}`);
        } else {
            toast.error("Terjadi kesalahan sistem.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Hitung Summary untuk Laporan
  const totalOrders = data?.orders.reduce((acc, curr) => acc + curr.orders, 0) || 0;
  const totalRevenue = data?.revenue.reduce((acc, curr) => acc + curr.revenue, 0) || 0;
  
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // 2. EXPORT PDF PROFESIONAL
  const exportPDF = async () => {
    if (!data) return;
    
    const toastId = toast.loading("Menyiapkan dokumen PDF...");

    try {
      const doc = new jsPDF() as JsPDFWithPlugin;
      const pageWidth = doc.internal.pageSize.width;
      
      // --- A. KOP SURAT (HEADER) ---
      // Load Logo
      try {
        // Ganti path ini dengan logo asli di public folder Anda
        const logoData = await loadImage("/images/NKAlogo.png"); 
        doc.addImage(logoData, 'PNG', 14, 10, 20, 20); // x, y, w, h
      } catch (e) {
        console.warn("Logo tidak ditemukan, skip logo.");
      }

      // Teks Perusahaan
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("CV. NIAGA KARYA MANDIRI", 40, 18);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Jalan Utama Padang No. 123, Sumatera Barat, Indonesia", 40, 24);
      doc.text("Telp: +62 813-6533-8011 | Email: admin@rentalmobil.id", 40, 29);

      // Garis Pemisah Header
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(14, 35, pageWidth - 14, 35);

      // --- B. JUDUL LAPORAN ---
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("LAPORAN KINERJA KEUANGAN & PESANAN", pageWidth / 2, 45, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Periode Tahun: ${new Date().getFullYear()}`, pageWidth / 2, 51, { align: "center" });

      // --- C. RINGKASAN EKSEKUTIF (KOTAK INFO) ---
      const summaryY = 60;
      doc.setFillColor(245, 247, 250); // Abu-abu sangat muda
      doc.roundedRect(14, summaryY, pageWidth - 28, 25, 3, 3, "F");

      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text("Total Pendapatan (YTD)", 20, summaryY + 8);
      doc.text("Total Transaksi", pageWidth / 2, summaryY + 8);
      doc.text("Unit Paling Laris", pageWidth - 50, summaryY + 8);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0); // Hitam
      doc.text(formatCurrency(totalRevenue), 20, summaryY + 18);
      doc.text(`${totalOrders} Pesanan`, pageWidth / 2, summaryY + 18);
      
      const topCar = data.car_types.length > 0 ? data.car_types[0].name : "-";
      doc.text(topCar, pageWidth - 50, summaryY + 18);

      // --- D. TABEL 1: PENDAPATAN BULANAN ---
      doc.setFontSize(12);
      doc.text("1. Rincian Pendapatan Bulanan", 14, summaryY + 40);

      autoTable(doc, {
        startY: summaryY + 45,
        head: [['Bulan', 'Jumlah Pesanan', 'Pendapatan (IDR)', 'Status']],
        body: data.orders.map((order, index) => {
            const rev = data.revenue[index]?.revenue || 0;
            return [
                order.month,
                order.orders,
                formatCurrency(rev),
                rev > 0 ? "Normal" : "Low"
            ];
        }),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' }, // Biru Profesional
        styles: { fontSize: 10, cellPadding: 3 },
        alternateRowStyles: { fillColor: [240, 248, 255] },
      });

      // --- E. TABEL 2: STATISTIK TIPE MOBIL ---
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("2. Distribusi Tipe Mobil", 14, finalY);

      autoTable(doc, {
        startY: finalY + 5,
        head: [['Tipe Mobil', 'Jumlah Sewa', 'Persentase (%)']],
        body: data.car_types.map(car => {
            const percent = totalOrders > 0 ? ((car.value / totalOrders) * 100).toFixed(1) : "0";
            return [car.name, car.value, `${percent}%`];
        }),
        theme: 'grid',
        headStyles: { fillColor: [39, 174, 96], textColor: 255 }, // Hijau
      });

      // --- F. FOOTER (Tanda Tangan & Halaman) ---
      const pageHeight = doc.internal.pageSize.height;
      
      // Info Cetak
      doc.setFontSize(8);
      doc.setTextColor(150);
      const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      doc.text(`Dicetak Otomatis oleh Sistem pada: ${dateStr}`, 14, pageHeight - 10);
      
      // Tanda Tangan Area (Opsional)
      const signY = doc.lastAutoTable.finalY + 30;
      if (signY < pageHeight - 40) {
          doc.setTextColor(0);
          doc.setFontSize(10);
          doc.text("Padang, " + new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}), pageWidth - 60, signY);
          doc.text("Mengetahui,", pageWidth - 60, signY + 6);
          doc.text("( Admin Keuangan )", pageWidth - 60, signY + 25);
      }

      // Save
      doc.save(`Laporan_Keuangan_NKAM_${new Date().toISOString().slice(0,10)}.pdf`);
      toast.success("Laporan PDF berhasil diunduh", { id: toastId });

    } catch (error) {
      console.error(error);
      toast.error("Gagal membuat PDF", { id: toastId });
    }
  };

  // 3. EXPORT EXCEL
  const exportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    // Sheet Summary
    const summaryData = [
        ["Laporan Kinerja - CV. Niaga Karya Mandiri"],
        ["Tanggal Cetak", new Date().toLocaleString()],
        [],
        ["Total Pendapatan", totalRevenue],
        ["Total Pesanan", totalOrders],
        [],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

    // Sheet Data Bulanan (Gabungan)
    const combinedData = data.orders.map((o, i) => ({
        Bulan: o.month,
        "Jumlah Pesanan": o.orders,
        "Pendapatan (IDR)": data.revenue[i]?.revenue || 0
    }));
    const wsData = XLSX.utils.json_to_sheet(combinedData);
    XLSX.utils.book_append_sheet(wb, wsData, "Data Bulanan");

    XLSX.writeFile(wb, "Laporan_Lengkap_NKAM.xlsx");
    toast.success("Laporan Excel berhasil diunduh");
  };

  // 4. EXPORT CSV
  const exportCSV = () => {
    if (!data) return;
    const csvContent = data.orders.map(o => ({
        Bulan: o.month,
        Pesanan: o.orders,
        Pendapatan: data.revenue.find(r => r.month === o.month)?.revenue || 0
    }));
    
    const ws = XLSX.utils.json_to_sheet(csvContent);
    const csv = XLSX.utils.sheet_to_csv(ws);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Data_Transaksi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Laporan CSV berhasil diunduh");
  };

  // --- RENDER COMPONENT ---
  const avgOrders = Math.round(totalOrders / 12);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100 text-2xl font-bold">Laporan & Statistik</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Analisis kinerja bisnis tahun {new Date().getFullYear()}
          </p>
        </div>
        
        {/* Tombol Export */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md">
              <Download className="h-4 w-4" /> Download Laporan
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={exportPDF} className="cursor-pointer gap-2 py-2">
              <FileText className="h-4 w-4 text-red-500" /> 
              <span>PDF Document (Resmi)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportExcel} className="cursor-pointer gap-2 py-2">
              <FileSpreadsheet className="h-4 w-4 text-green-600" /> 
              <span>Excel Spreadsheet</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportCSV} className="cursor-pointer gap-2 py-2">
              <FileJson className="h-4 w-4 text-blue-500" /> 
              <span>CSV (Raw Data)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-medium">Total Pesanan</p>
              <p className="text-3xl mt-2 font-bold">{totalOrders}</p>
              <p className="text-xs mt-1 opacity-75">Tahun Ini</p>
            </div>
            <BarChart3 className="h-12 w-12 opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-medium">Total Pendapatan</p>
              <p className="text-3xl mt-2 font-bold">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalRevenue)}
              </p>
              <p className="text-xs mt-1 opacity-75">Pembayaran Lunas</p>
            </div>
            <TrendingUp className="h-12 w-12 opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-medium">Rata-rata Bulanan</p>
              <p className="text-3xl mt-2 font-bold">{avgOrders}</p>
              <p className="text-xs mt-1 opacity-75">Pesanan / Bulan</p>
            </div>
            <BarChart3 className="h-12 w-12 opacity-80" />
          </div>
        </Card>
      </div>

      {/* Tabs Charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid mb-6">
          <TabsTrigger value="orders">Trend Pesanan</TabsTrigger>
          <TabsTrigger value="revenue">Trend Pendapatan</TabsTrigger>
          <TabsTrigger value="cars">Unit Favorit</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Grafik Pesanan Bulanan</h3>
            <div className="h-[400px] w-full">
                {totalOrders > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.orders}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f1f5f9' }}
                        />
                        <Bar dataKey="orders" name="Pesanan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">Belum ada data pesanan</div>
                )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Grafik Pendapatan Bulanan</h3>
            <div className="h-[400px] w-full">
                {totalRevenue > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.revenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} width={80} />
                        <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
                        />
                        <Line type="monotone" dataKey="revenue" name="Pendapatan" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">Belum ada data pendapatan</div>
                )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cars" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Distribusi Tipe Mobil</h3>
              <div className="h-[300px] w-full">
                {(data?.car_types?.length ?? 0) > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={data?.car_types}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data?.car_types.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">Belum ada data tipe mobil</div>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-auto max-h-[400px]">
              <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Detail Statistik Unit</h3>
              <div className="space-y-4 mt-8">
                {data?.car_types.map((item, index) => {
                   const percentage = totalOrders > 0 ? Math.round((item.value / totalOrders) * 100) : 0;
                   return (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-white">{item.value} Unit</span>
                        <span className="text-xs text-slate-500 ml-2">({percentage}%)</span>
                      </div>
                    </div>
                   );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};