"use client";

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { motion } from "framer-motion";
import { Eye, CheckCircle, Search, Loader2, XCircle, Image as ImageIcon, Plus, RefreshCw } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import api from "@/lib/axios";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';
import axios from 'axios';

// --- TIPE DATA ---
interface Payment {
  id: number;
  pesanan: number;
  kode_booking?: string; 
  pelanggan_nama?: string;
  mobil_nama?: string;
  jumlah: string;
  metode: 'transfer' | 'cash';
  status: 'pending' | 'lunas' | 'gagal';
  bukti_bayar: string | null;
  bukti_bayar_url?: string | null;
  created_at: string;
}

// Tipe data untuk Dropdown Pesanan di Modal
interface OrderOption {
  id: number;
  kode_booking: string;
  pelanggan_nama: string;
  mobil_nama: string;
  total_harga: string;
  status: string;
}

interface PaymentFormData {
  pesanan_id: string; // ID Pesanan yang akan dibayar
  jumlah: string;
  metode: 'transfer' | 'cash';
  bukti_bayar: File | null;
}

interface ApiResponse<T> {
    results: T[];
    count?: number;
}

function getResults<T>(data: ApiResponse<T> | T[]): T[] {
    if (Array.isArray(data)) return data;
    return data.results || [];
}

export default function AdminPayments() {
  const { searchTerm: globalSearch } = useSearch();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [unpaidOrders, setUnpaidOrders] = useState<OrderOption[]>([]); // State untuk dropdown pesanan
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  
  // State Modal
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    pesanan_id: '',
    jumlah: '',
    metode: 'cash', // Default cash untuk admin (biasanya terima tunai di tempat)
    bukti_bayar: null
  });

  // 1. FETCH DATA PEMBAYARAN
  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
        const params = new URLSearchParams();
        const query = search || globalSearch;
        if (query) params.append("search", query);
        
        const response = await api.get<ApiResponse<Payment>>(`/pembayaran/?${params.toString()}`); 
        const data = getResults(response.data);
        setPayments(data);
    } catch (error: unknown) {
        console.error("Gagal mengambil data pembayaran:", error);
        toast.error("Gagal memuat data pembayaran");
    } finally {
        setIsLoading(false);
    }
  }, [search, globalSearch]);

  // 2. FETCH DATA PESANAN (Untuk Dropdown Modal)
  const fetchUnpaidOrders = async () => {
    try {
        // Ambil semua pesanan, nanti difilter yang statusnya butuh bayar
        // Idealnya backend menyediakan endpoint khusus, tapi kita filter client-side dulu
        const response = await api.get<ApiResponse<OrderOption>>('/pesanan/');
        const allOrders = getResults(response.data);
        
        // Filter: Hanya tampilkan yang statusnya 'pending' atau 'konfirmasi'
        // dan belum lunas sepenuhnya (logika sederhana)
        const activeOrders = allOrders.filter(o => 
            o.status === 'pending' || o.status === 'konfirmasi'
        );
        setUnpaidOrders(activeOrders);
    } catch (error) {
        console.error("Gagal load pesanan:", error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Effect saat Modal dibuka -> Load data pesanan
  useEffect(() => {
    if (isFormOpen) {
        fetchUnpaidOrders();
    }
  }, [isFormOpen]);

  // 3. HANDLE CREATE MANUAL PAYMENT
  const handleCreatePayment = async () => {
    // Validasi
    if (!formData.pesanan_id || !formData.jumlah) {
        toast.warning("Silakan pilih Pesanan dan pastikan Jumlah terisi!");
        return;
    }

    setIsSaving(true);
    try {
        const payload = new FormData();
        payload.append('pesanan', formData.pesanan_id);
        payload.append('jumlah', formData.jumlah);
        payload.append('metode', formData.metode);
        // Status otomatis handled by backend (biasanya jadi 'lunas' kalau admin yang input dan uang pas)
        
        if (formData.bukti_bayar) {
            payload.append('bukti_bayar', formData.bukti_bayar);
        }

        await api.post('/pembayaran/', payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        toast.success("Pembayaran berhasil dicatat!");
        setIsFormOpen(false);
        setFormData({ pesanan_id: '', jumlah: '', metode: 'cash', bukti_bayar: null }); // Reset
        fetchPayments(); // Refresh table

    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            const errData = error.response.data as Record<string, string[]>;
            if (errData.pesanan) toast.error(`Pesanan: ${errData.pesanan[0]}`);
            else if (errData.jumlah) toast.error(`Jumlah: ${errData.jumlah[0]}`);
            else if (errData.detail) toast.error(errData.detail); // Error umum dr backend
            else toast.error("Gagal menyimpan pembayaran.");
        } else {
            toast.error("Terjadi kesalahan sistem.");
        }
    } finally {
        setIsSaving(false);
    }
  };

  // 4. HANDLE UPDATE STATUS
  const handleUpdateStatus = async (id: number, newStatus: 'lunas' | 'gagal') => {
    try {
        // Optimistic UI update (ubah tampilan dulu biar cepat)
        setPayments(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        
        await api.patch(`/pembayaran/${id}/`, { status: newStatus });
        
        const msg = newStatus === 'lunas' ? 'Pembayaran diverifikasi LUNAS' : 'Pembayaran DITOLAK';
        toast.success(msg);
        fetchPayments(); // Refresh full data untuk memastikan sinkronisasi
    } catch (error) {
        console.error(error);
        toast.error("Gagal memperbarui status");
        fetchPayments(); // Revert jika gagal
    }
  };

  // Helper: Saat Pesanan dipilih di Dropdown -> Auto isi jumlah
  const handleOrderSelect = (orderIdStr: string) => {
    const orderId = parseInt(orderIdStr);
    const selected = unpaidOrders.find(o => o.id === orderId);
    
    if (selected) {
        // Remove .000 if exists and strictly string
        const amount = parseFloat(selected.total_harga).toString();
        setFormData({
            ...formData,
            pesanan_id: orderIdStr,
            jumlah: amount 
        });
    } else {
        setFormData({ ...formData, pesanan_id: orderIdStr });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, bukti_bayar: e.target.files[0] });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'lunas': return { label: 'Lunas', className: 'bg-green-100 text-green-800 border-green-200' };
        case 'pending': return { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
        case 'gagal': return { label: 'Ditolak', className: 'bg-red-100 text-red-800 border-red-200' };
        default: return { label: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatRupiah = (amount: string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount));
  };

  const paidCount = payments.filter((p) => p.status === 'lunas').length;
  const percentage = payments.length > 0 ? Math.round((paidCount / payments.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-slate-900 dark:text-slate-100 font-bold text-2xl">Keuangan & Pembayaran</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Verifikasi transfer dan input pembayaran tunai.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => fetchPayments()} title="Refresh Data">
                <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="h-4 w-4" /> Input Pembayaran Manual
            </Button>
        </div>
      </div>

      {/* Stats */}
      <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-slate-600">Realisasi Pembayaran</p>
          <p className="text-sm font-bold text-slate-900">{paidCount} / {payments.length} ({percentage}%)</p>
        </div>
        <Progress value={percentage} className="h-2" />
      </Card>

      {/* Search */}
      <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari Kode Booking, Nama, atau Mobil..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
             <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Booking</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Bukti</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">Belum ada data pembayaran.</TableCell>
                  </TableRow>
              ) : (
                  payments.map((payment) => {
                    const statusBadge = getStatusBadge(payment.status);
                    const imageSrc = payment.bukti_bayar_url || payment.bukti_bayar;
                    return (
                      <TableRow key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <TableCell>
                            <span className="font-mono font-medium text-blue-600">{payment.kode_booking || `#${payment.pesanan}`}</span>
                            <div className="text-xs text-slate-500 mt-1">{format(new Date(payment.created_at), 'dd MMM HH:mm', { locale: id })}</div>
                        </TableCell>
                        <TableCell>
                            <div className="font-medium">{payment.pelanggan_nama || "Umum"}</div>
                            <div className="text-xs text-slate-500">{payment.mobil_nama}</div>
                        </TableCell>
                        <TableCell className="font-bold">{formatRupiah(payment.jumlah)}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className="uppercase text-[10px]">{payment.metode}</Badge>
                        </TableCell>
                        <TableCell>
                            {imageSrc ? (
                                <Button size="sm" variant="ghost" className="h-8 gap-2 text-blue-600" onClick={() => { setSelectedImage(imageSrc); setIsImageOpen(true); }}>
                                    <ImageIcon className="h-4 w-4" /> Lihat
                                </Button>
                            ) : <span className="text-xs text-slate-400 italic">-</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusBadge.className}>{statusBadge.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {payment.status === 'pending' && (
                                <>
                                  <Button size="sm" onClick={() => handleUpdateStatus(payment.id, 'lunas')} className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0" title="Verifikasi Lunas">
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" onClick={() => handleUpdateStatus(payment.id, 'gagal')} className="bg-red-600 hover:bg-red-700 text-white h-8 w-8 p-0" title="Tolak / Salah Transfer">
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                            )}
                            {payment.status !== 'pending' && (
                                <span className="text-xs text-slate-400 font-medium px-2">Selesai</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* --- MODAL INPUT MANUAL (UPDATED: DROPDOWN PESANAN) --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-800">
            <DialogHeader>
                <DialogTitle>Input Pembayaran Manual</DialogTitle>
                <DialogDescription>
                    Gunakan ini untuk pelanggan yang membayar Tunai di tempat atau transfer manual via WA.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                {/* PILIH PESANAN */}
                <div className="grid gap-2">
                    <Label>Pilih Pesanan (Pending/Konfirmasi)</Label>
                    <Select onValueChange={handleOrderSelect} value={formData.pesanan_id}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="-- Cari Pesanan --" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            {unpaidOrders.length === 0 ? (
                                <SelectItem value="0" disabled>Tidak ada tagihan aktif</SelectItem>
                            ) : (
                                unpaidOrders.map((order) => (
                                    <SelectItem key={order.id} value={order.id.toString()}>
                                        <span className="font-bold mr-2">{order.kode_booking}</span> 
                                        - {order.pelanggan_nama} 
                                        ({order.mobil_nama})
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* NOMINAL */}
                <div className="grid gap-2">
                    <Label htmlFor="jumlah">Nominal (Rp) <span className="text-red-500">*</span></Label>
                    <Input 
                        id="jumlah"
                        placeholder="0"
                        type="number"
                        value={formData.jumlah}
                        onChange={(e) => setFormData({...formData, jumlah: e.target.value})}
                    />
                    <p className="text-[10px] text-slate-500">Nominal terisi otomatis sesuai tagihan pesanan.</p>
                </div>

                {/* METODE */}
                <div className="grid gap-2">
                    <Label>Metode Pembayaran</Label>
                    <Select 
                        value={formData.metode} 
                        onValueChange={(val: 'cash' | 'transfer') => setFormData({...formData, metode: val})}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cash">Tunai (Cash)</SelectItem>
                            <SelectItem value="transfer">Transfer Bank</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* BUKTI (OPSIONAL) */}
                <div className="grid gap-2">
                    <Label>Bukti / Nota (Opsional)</Label>
                    <div className="flex items-center gap-2">
                        <Input 
                            type="file" 
                            onChange={handleFileChange} 
                            className="cursor-pointer text-sm" 
                            accept="image/*"
                        />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>Batal</Button>
                <Button onClick={handleCreatePayment} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Pembayaran"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL BUKTI BAYAR --- */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 p-0 overflow-hidden">
            <DialogHeader className="p-4 pb-0"><DialogTitle>Bukti Pembayaran</DialogTitle></DialogHeader>
            <div className="relative aspect-[3/4] w-full bg-slate-100 mt-4">
                {selectedImage ? (
                     <Image 
                        src={selectedImage} 
                        alt="Bukti" 
                        fill 
                        className="object-contain" 
                        unoptimized // Penting untuk gambar dari external URL (backend/Cloudinary)
                     />
                ) : <div className="flex h-full items-center justify-center text-slate-400">Gambar rusak</div>}
            </div>
            <div className="p-4 flex justify-end"><Button variant="outline" onClick={() => setIsImageOpen(false)}>Tutup</Button></div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};