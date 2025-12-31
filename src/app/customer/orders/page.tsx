"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import Router
import { motion } from 'framer-motion';
import { Eye, Search, Loader2, Clock, Car, Calendar } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/axios';
import { format, differenceInDays, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

// --- TIPE DATA STRICT ---
interface MobilDetail {
  nama_mobil: string;
  plat_nomor: string;
  gambar_url: string | null;
}

interface Order {
  id: number;
  kode_booking: string;
  mobil_detail: MobilDetail;
  tanggal_mulai: string;
  tanggal_selesai: string;
  total_hari: number;
  harga_total: string; // Bisa string/number dari API
  status: 'pending' | 'konfirmasi' | 'aktif' | 'selesai' | 'batal';
  catatan: string;
  created_at: string;
}

// Helper untuk handle response pagination atau array
function getResults(data: unknown): Order[] {
    if (Array.isArray(data)) return data as Order[];
    if (typeof data === 'object' && data !== null && 'results' in data) return data.results as Order[];
    return [];
}

export default function CustomerOrders() {
  const router = useRouter(); // Init Router
  const { searchTerm: globalSearch, clearSearch } = useSearch();
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. FETCH DATA
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/pesanan/'); 
        const data = getResults(res.data);
        // Urutkan dari yang terbaru (ID besar / Created At baru)
        data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(data);
      } catch (error) {
        console.error("Gagal memuat riwayat pesanan", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Sync Global Search
  useEffect(() => {
    if (globalSearch) setLocalSearchTerm(globalSearch);
  }, [globalSearch]);

  const searchTerm = globalSearch || localSearchTerm;

  // 2. FILTERING LOGIC
  // Active: Pending, Konfirmasi, Aktif (Sedang Jalan)
  const activeOrders = orders.filter(o => ['pending', 'konfirmasi', 'aktif'].includes(o.status));
  // Completed: Selesai, Batal
  const completedOrders = orders.filter(o => ['selesai', 'batal'].includes(o.status));

  // Search Filter
  const filterList = (list: Order[]) => {
    return list.filter(order => 
      order.kode_booking.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.mobil_detail.nama_mobil.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredActive = filterList(activeOrders);
  const filteredCompleted = filterList(completedOrders);
  // Gabungkan untuk tabel riwayat (jika ingin menampilkan semua di tabel bawah)
  const allFiltered = [...filteredActive, ...filteredCompleted]; 

  // --- HELPERS ---
  
  // Navigasi ke Detail Page
  const goToDetail = (id: number) => {
      router.push(`/customer/orders/${id}`);
  };

  const calculateProgress = (order: Order) => {
    const start = parseISO(order.tanggal_mulai);
    const end = parseISO(order.tanggal_selesai);
    const today = new Date();
    
    const totalDuration = differenceInDays(end, start) + 1;
    const daysPassed = differenceInDays(today, start);
    
    if (daysPassed < 0) return 0; 
    if (daysPassed > totalDuration) return 100;
    
    return Math.min(100, Math.max(0, Math.round((daysPassed / totalDuration) * 100)));
  };

  const getDaysRemaining = (order: Order) => {
    const end = parseISO(order.tanggal_selesai);
    const today = new Date();
    const diff = differenceInDays(end, today);
    return diff >= 0 ? diff : 0;
  };

  const formatRupiah = (val: string | number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(val));
  const formatDate = (val: string) => format(parseISO(val), "dd MMM yyyy", { locale: idLocale });

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">Menunggu</Badge>;
        case 'konfirmasi': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Disetujui</Badge>;
        case 'aktif': return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200">Sedang Jalan</Badge>;
        case 'selesai': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Selesai</Badge>;
        case 'batal': return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Dibatalkan</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pesanan Saya</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Lihat riwayat dan status pesanan rental mobil Anda.
        </p>
      </div>

      {/* Search */}
      <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari berdasarkan Kode Booking atau Nama Mobil..."
            value={searchTerm}
            onChange={(e) => {
              setLocalSearchTerm(e.target.value);
              if (globalSearch) clearSearch();
            }}
            className="pl-10 pr-20"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">
             {allFiltered.length} Data
          </div>
        </div>
      </Card>

      {/* --- BAGIAN 1: ACTIVE ORDERS (CARD VIEW) --- */}
      {filteredActive.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
             <Clock className="h-5 w-5 text-blue-600" /> Sedang Berlangsung
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredActive.map((order) => {
              const sisaHari = getDaysRemaining(order);
              const progress = calculateProgress(order);

              return (
                <Card key={order.id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    {/* Header Card */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{order.mobil_detail.nama_mobil}</h3>
                                <Badge variant="outline" className="font-mono bg-slate-50 text-slate-600 border-slate-200">
                                    {order.kode_booking}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(order.tanggal_mulai)} - {formatDate(order.tanggal_selesai)}
                            </div>
                        </div>
                        {getStatusBadge(order.status)}
                    </div>

                    {/* Progress Bar (Hanya untuk Konfirmasi/Aktif) */}
                    {(order.status === 'konfirmasi' || order.status === 'aktif') && (
                        <div className="mb-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between text-xs text-slate-500 mb-2">
                                <span>Durasi: {order.total_hari} Hari</span>
                                <span className={sisaHari === 0 ? "text-red-500 font-bold" : "text-blue-600"}>
                                    {sisaHari === 0 ? "Kembali Hari Ini" : `${sisaHari} Hari Lagi`}
                                </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}

                    {/* Pending Alert */}
                    {order.status === 'pending' && (
                       <div className="mb-4 text-xs text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-100">
                          Menunggu konfirmasi admin. Harap pantau notifikasi Anda.
                       </div>
                    )}

                    {/* Footer / Action */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {formatRupiah(order.harga_total)}
                        </div>
                        <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => goToDetail(order.id)}>
                            <Eye className="h-4 w-4" /> Lihat Detail
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* --- BAGIAN 2: HISTORY TABLE (SEMUA DATA) --- */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Riwayat Semua Pesanan</h3>
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Booking</TableHead>
                <TableHead>Mobil</TableHead>
                <TableHead className="hidden md:table-cell">Tanggal Sewa</TableHead>
                <TableHead>Total Biaya</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allFiltered.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        Tidak ada riwayat pesanan ditemukan.
                    </TableCell>
                 </TableRow>
              ) : (
                allFiltered.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <TableCell className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                            {order.kode_booking}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">{order.mobil_detail.nama_mobil}</span>
                            </div>
                            <div className="md:hidden text-xs text-slate-500 mt-1">
                                {formatDate(order.tanggal_mulai)}
                            </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(order.tanggal_mulai)} <span className="mx-1">-</span> {formatDate(order.tanggal_selesai)}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                            {formatRupiah(order.harga_total)}
                        </TableCell>
                        <TableCell>
                            {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => goToDetail(order.id)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Eye className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

    </motion.div>
  );
}