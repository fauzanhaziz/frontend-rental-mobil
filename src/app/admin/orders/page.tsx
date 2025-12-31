"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import Router
import { motion } from "framer-motion";
import { Eye, Search, Loader2, Plus, User, Laptop, Store, Trash2 } from 'lucide-react';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from "@/lib/axios";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { isAxiosError } from 'axios'; // Import helper type check

// --- 1. DEFINISI TIPE DATA (STRICT - NO ANY) ---

type OrderStatus = 'pending' | 'konfirmasi' | 'selesai' | 'batal' | 'aktif';
type OrderType = 'online' | 'offline';

interface Order {
  id: number;
  kode_booking: string;
  pelanggan_detail: {
    id: number;
    nama: string;
    no_hp: string;
  };
  mobil_detail: {
    id: number;
    nama_mobil: string;
    plat_nomor: string;
  };
  tanggal_mulai: string;
  tanggal_selesai: string;
  total_hari: number;
  harga_total: string;
  status: OrderStatus;
  type_pesanan: OrderType;
  catatan: string;
  created_at: string;
}

interface CustomerOption {
  id: number;
  nama: string;
  no_hp: string;
}

interface CarOption {
  id: number;
  nama_mobil: string;
  plat_nomor: string;
}

interface DriverOption {
  id: number;
  nama: string;
}

interface CreateOrderPayload {
  pelanggan: number;
  mobil: number;
  supir?: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  catatan?: string;
}

interface PaginatedResponse<T> {
  results: T[];
}
type ApiResponse<T> = T[] | PaginatedResponse<T>;

function getResults<T>(data: ApiResponse<T>): T[] {
  if (!Array.isArray(data) && 'results' in data) {
    return data.results;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

export default function AdminOrders() {
  const router = useRouter(); // Init Router
  const { searchTerm: globalSearch } = useSearch();
  
  // State Data Utama
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // State Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // --- STATE UNTUK CREATE ORDER (OFFLINE) ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [cars, setCars] = useState<CarOption[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  
  // Form State
  const [formData, setFormData] = useState<{
    pelanggan: string;
    mobil: string;
    supir: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    useDriver: boolean;
    catatan: string;
  }>({
    pelanggan: "",
    mobil: "",
    supir: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    useDriver: false,
    catatan: "",
  });

  // 1. FETCH DATA ORDER
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      const query = search || globalSearch;
      
      if (query) params.append("search", query);
      if (statusFilter !== 'all') params.append("status", statusFilter);
      
      params.append("ordering", "-created_at");

      const response = await api.get<ApiResponse<Order>>(`/pesanan/?${params.toString()}`);
      const dataList = getResults(response.data);
      
      const filteredList = typeFilter === 'all' 
        ? dataList 
        : dataList.filter(o => o.type_pesanan === typeFilter);

      setOrders(filteredList);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data pesanan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, globalSearch, statusFilter, typeFilter]);

  // 2. FETCH DATA UNTUK FORM CREATE
  const fetchFormResources = async () => {
    try {
        const resCust = await api.get<ApiResponse<CustomerOption>>('/pelanggan/');
        setCustomers(getResults(resCust.data));

        const resCar = await api.get<ApiResponse<CarOption>>('/mobil/?status=aktif');
        setCars(getResults(resCar.data));

        const resDriver = await api.get<ApiResponse<DriverOption>>('/supir/?status=tersedia');
        setDrivers(getResults(resDriver.data));
    } catch (error) {
        console.error("Gagal memuat data form", error);
    }
  };

  useEffect(() => {
    if (isCreateOpen) {
        fetchFormResources();
    }
  }, [isCreateOpen]);

  // 3. HANDLE CREATE ORDER
  const handleCreateOrder = async () => {
    if (!formData.pelanggan || !formData.mobil || !formData.tanggal_mulai || !formData.tanggal_selesai) {
        toast.warning("Pelanggan, Mobil, dan Tanggal wajib diisi.");
        return;
    }

    setIsProcessing(true);
    try {
        const payload: CreateOrderPayload = {
            pelanggan: parseInt(formData.pelanggan),
            mobil: parseInt(formData.mobil),
            tanggal_mulai: formData.tanggal_mulai,
            tanggal_selesai: formData.tanggal_selesai,
            catatan: formData.catatan || "Pesanan Offline (Walk-in)",
        };

        if (formData.useDriver && formData.supir) {
            payload.supir = parseInt(formData.supir);
        }

        await api.post('/pesanan/', payload);
        
        toast.success("Pesanan Offline Berhasil Dibuat! ✅");
        setIsCreateOpen(false);
        setFormData({ pelanggan: "", mobil: "", supir: "", tanggal_mulai: "", tanggal_selesai: "", useDriver: false, catatan: "" });
        fetchOrders();

    } catch (error: unknown) {
        if (isAxiosError(error)) {
             const data = error.response?.data;
             const msg = data?.mobil?.[0] || data?.non_field_errors?.[0] || "Gagal membuat pesanan.";
             toast.error(msg);
        } else {
             toast.error("Terjadi kesalahan sistem.");
        }
    } finally {
        setIsProcessing(false);
    }
  };

  // 4. HANDLE DELETE ORDER
  const handleDeleteOrder = async (id: number, kode: string) => {
    if (!confirm(`⚠️ PERINGATAN: Yakin ingin menghapus pesanan ${kode}?\nData yang dihapus tidak bisa dikembalikan.`)) return;

    setIsProcessing(true);
    try {
        await api.delete(`/pesanan/${id}/`);
        toast.success(`Pesanan ${kode} berhasil dihapus.`);
        fetchOrders();
    } catch (error) {
        console.error("Gagal hapus pesanan", error);
        toast.error("Gagal menghapus pesanan. Pastikan pesanan tidak terkunci.");
    } finally {
        setIsProcessing(false);
    }
  };

  // 5. NAVIGASI KE DETAIL PAGE
  const goToDetail = (id: number) => {
      router.push(`/admin/orders/${id}`);
  };

  // UI HELPERS
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">Menunggu</Badge>;
      case 'konfirmasi': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Dikonfirmasi</Badge>;
      case 'aktif': return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200">Sedang Jalan</Badge>;
      case 'selesai': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Selesai</Badge>;
      case 'batal': return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Dibatalkan</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: OrderType) => {
    if (type === 'online') {
        return (
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 gap-1">
                <Laptop className="w-3 h-3" /> Online
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 gap-1">
            <Store className="w-3 h-3" /> Offline
        </Badge>
    );
  };

  const formatDate = (val: string) => format(new Date(val), "dd MMM yyyy", { locale: idLocale });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Kelola Pesanan</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">List semua transaksi online & offline</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="h-4 w-4" /> Buat Pesanan Offline
        </Button>
      </div>

      {/* FILTERS */}
      <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari Kode Booking atau Nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status Pesanan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="konfirmasi">Dikonfirmasi</SelectItem>
              <SelectItem value="aktif">Sedang Jalan</SelectItem>
              <SelectItem value="selesai">Selesai</SelectItem>
              <SelectItem value="batal">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipe Pesanan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="online">🖥️ Online (Web)</SelectItem>
              <SelectItem value="offline">🏪 Offline (Walk-in)</SelectItem>
            </SelectContent>
          </Select>

        </div>
      </Card>

      {/* TABLE */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
           <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Booking</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Sumber</TableHead>
                  <TableHead>Mobil</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                            Tidak ada data pesanan ditemukan.
                        </TableCell>
                    </TableRow>
                ) : (
                    orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                            {order.kode_booking}
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-900 dark:text-slate-200">
                                    {order.pelanggan_detail.nama}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {order.pelanggan_detail.no_hp}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell>
                            {getTypeBadge(order.type_pesanan)}
                        </TableCell>
                        <TableCell>
                            <span className="text-sm font-medium">{order.mobil_detail.nama_mobil}</span>
                        </TableCell>
                        <TableCell className="text-xs">
                            {formatDate(order.tanggal_mulai)} <br/> s/d {formatDate(order.tanggal_selesai)}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                {/* TOMBOL VIEW DETAIL */}
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => goToDetail(order.id)} 
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                {/* TOMBOL HAPUS */}
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleDeleteOrder(order.id, order.kode_booking)} 
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                )))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* === DIALOG CREATE (OFFLINE ORDER) === */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-white dark:bg-slate-800 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Buat Pesanan Offline</DialogTitle>
                <DialogDescription>Input pesanan untuk pelanggan walk-in.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label>Pilih Pelanggan</Label>
                    <Select value={formData.pelanggan} onValueChange={(val) => setFormData({...formData, pelanggan: val})}>
                        <SelectTrigger><SelectValue placeholder="Cari pelanggan..." /></SelectTrigger>
                        <SelectContent>
                            {customers.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                    {c.nama} ({c.no_hp})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Pilih Mobil (Ready)</Label>
                    <Select value={formData.mobil} onValueChange={(val) => setFormData({...formData, mobil: val})}>
                        <SelectTrigger><SelectValue placeholder="Pilih unit..." /></SelectTrigger>
                        <SelectContent>
                            {cars.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                    {c.nama_mobil} - {c.plat_nomor}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Tgl Mulai</Label>
                        <Input type="date" value={formData.tanggal_mulai} onChange={(e) => setFormData({...formData, tanggal_mulai: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tgl Selesai</Label>
                        <Input type="date" value={formData.tanggal_selesai} onChange={(e) => setFormData({...formData, tanggal_selesai: e.target.value})} />
                    </div>
                </div>

                <div className="flex items-center justify-between border p-3 rounded-md">
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-slate-500" />
                        <Label htmlFor="useDriver">Pakai Supir?</Label>
                    </div>
                    <Switch id="useDriver" checked={formData.useDriver} onCheckedChange={(chk) => setFormData({...formData, useDriver: chk})} />
                </div>

                {formData.useDriver && (
                    <div className="space-y-2 animate-in fade-in zoom-in-95">
                        <Label>Pilih Supir</Label>
                        <Select value={formData.supir} onValueChange={(val) => setFormData({...formData, supir: val})}>
                            <SelectTrigger><SelectValue placeholder="Pilih supir..." /></SelectTrigger>
                            <SelectContent>
                                {drivers.map((d) => (
                                    <SelectItem key={d.id} value={d.id.toString()}>{d.nama}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Catatan</Label>
                    <Textarea 
                        value={formData.catatan} 
                        onChange={(e) => setFormData({...formData, catatan: e.target.value})} 
                        placeholder="Contoh: DP 500rb via Cash..."
                    />
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                <Button onClick={handleCreateOrder} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700">
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Buat Pesanan
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}