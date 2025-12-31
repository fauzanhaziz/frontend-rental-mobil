"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Calendar, User, MapPin, Phone, Car, 
  CheckCircle, XCircle, Key, AlertTriangle, Loader2 
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import axios, { isAxiosError } from "axios"; // Import helper axios

import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback"; 

// --- 1. DEFINISI TIPE DATA YANG KUAT (NO ANY) ---

interface PelangganDetail {
  nama: string;
  no_hp: string;
  alamat: string;
  email?: string;
}

interface MobilDetail {
  nama_mobil: string;
  gambar_url: string | null; // Handle jika gambar null
  plat_nomor: string;
  warna: string;
  harga_per_hari: number;
}

interface SupirDetail {
  nama: string;
  no_hp: string;
}

interface OrderDetail {
  id: number;
  kode_booking: string;
  status: 'pending' | 'konfirmasi' | 'aktif' | 'selesai' | 'batal';
  tanggal_mulai: string;
  tanggal_selesai: string;
  total_hari: number;
  harga_total: number;
  denda: number;
  catatan: string | null; // Catatan bisa null dari backend
  created_at: string;
  type_pesanan: string;
  
  // Relations
  pelanggan_detail: PelangganDetail;
  mobil_detail: MobilDetail;
  supir_detail?: SupirDetail | null; // Supir bisa null
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Unwrap params (Next.js 15+)
  const { id } = use(params);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- FETCH DATA ---
  const fetchOrder = async () => {
    try {
      const res = await api.get<OrderDetail>(`/pesanan/${id}/`);
      setOrder(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat detail pesanan");
      router.push("/admin/orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // --- ACTION HANDLERS (TYPE SAFE) ---
  const handleStatusChange = async (action: 'konfirmasi' | 'batal' | 'aktifkan' | 'selesai') => {
    if (!confirm(`Apakah Anda yakin ingin melakukan aksi: ${action.toUpperCase()}?`)) return;

    setIsProcessing(true);
    try {
      // Endpoint: /pesanan/{id}/{action}/
      await api.post(`/pesanan/${id}/${action}/`);
      
      toast.success(`Pesanan berhasil di-${action}`);
      fetchOrder(); // Refresh data
    } catch (error: unknown) {
      // --- PENANGANAN ERROR TANPA ANY ---
      if (isAxiosError(error)) {
        // Ambil pesan error spesifik dari backend jika ada
        const msg = error.response?.data?.error || error.response?.data?.detail || "Gagal mengubah status";
        toast.error(msg);
      } else {
        toast.error("Terjadi kesalahan sistem");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-slate-500">Memuat detail pesanan...</p>
      </div>
    );
  }

  // Guard Clause: Pastikan order ada sebelum render
  if (!order) return null;

  // Helper Warna Badge Status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'konfirmasi': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'aktif': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'selesai': return 'bg-green-100 text-green-800 border-green-200';
      case 'batal': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* HEADER: Back Button & Title */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Order #{order.kode_booking}</h1>
            <Badge className={`uppercase ${getStatusColor(order.status)}`} variant="outline">
              {order.status}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Dibuat pada: {format(parseISO(order.created_at), "dd MMM yyyy, HH:mm", { locale: idLocale })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- KOLOM KIRI (Info Utama) --- */}
        <div className="md:col-span-2 space-y-6">
          
          {/* 1. KARTU MOBIL */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Car className="h-4 w-4 text-blue-600" /> Detail Kendaraan
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
               <div className="h-24 w-36 bg-slate-100 rounded-lg overflow-hidden shrink-0 relative">
                  {/* Gunakan optional chaining atau fallback image */}
                  <ImageWithFallback 
                    src={order.mobil_detail.gambar_url || "/images/placeholder-car.jpg"} 
                    alt={order.mobil_detail.nama_mobil}
                    className="w-full h-full object-cover"
                  />
               </div>
               <div>
                 <h3 className="font-bold text-lg">{order.mobil_detail.nama_mobil}</h3>
                 <div className="text-sm text-slate-500 space-y-1 mt-1">
                    <p>Plat: <span className="font-mono bg-slate-100 px-1 rounded text-slate-900 font-bold">{order.mobil_detail.plat_nomor}</span></p>
                    <p>Warna: {order.mobil_detail.warna}</p>
                 </div>
               </div>
            </CardContent>
          </Card>

          {/* 2. KARTU PELANGGAN & DRIVER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* PELANGGAN */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" /> Informasi Penyewa
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                 <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${order.pelanggan_detail.nama}`} />
                        <AvatarFallback>CS</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-bold">{order.pelanggan_detail.nama}</p>
                        <p className="text-slate-500 text-xs">Customer</p>
                    </div>
                 </div>
                 <Separator />
                 <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <Phone className="h-3.5 w-3.5 mt-0.5 text-slate-400" />
                        <span>{order.pelanggan_detail.no_hp || "-"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 text-slate-400" />
                        <span className="line-clamp-2">{order.pelanggan_detail.alamat || "-"}</span>
                    </div>
                 </div>
              </CardContent>
            </Card>

            {/* SUPIR */}
            <Card>
               <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" /> Supir (Driver)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm h-full">
                {order.supir_detail ? (
                   <div className="space-y-3">
                      <p className="font-bold text-lg">{order.supir_detail.nama}</p>
                      <div className="flex items-center gap-2 text-slate-600">
                         <Phone className="h-3.5 w-3.5" />
                         {order.supir_detail.no_hp}
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        Termasuk Supir
                      </Badge>
                   </div>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 py-2">
                      <Key className="h-8 w-8 mb-2 opacity-20" />
                      <p>Lepas Kunci</p>
                      <p className="text-xs">(Self Drive)</p>
                   </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- KOLOM KANAN (Status & Aksi) --- */}
        <div className="space-y-6">
          
          {/* 3. RINCIAN BIAYA & WAKTU */}
          <Card className="border-blue-100 dark:border-blue-900 shadow-sm overflow-hidden">
             <CardHeader className="bg-slate-50 dark:bg-slate-900/50 pb-4">
                <CardTitle className="text-base flex items-center justify-between">
                   <span>Total Tagihan</span>
                   <span className="text-xl font-bold text-blue-600">
                      Rp {order.harga_total.toLocaleString('id-ID')}
                   </span>
                </CardTitle>
             </CardHeader>
             <CardContent className="pt-6 space-y-4">
                <div className="space-y-1">
                   <p className="text-xs text-slate-500 font-medium uppercase">Jadwal Sewa</p>
                   <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-sm">
                         {format(parseISO(order.tanggal_mulai), "dd MMM")} - {format(parseISO(order.tanggal_selesai), "dd MMM yyyy")}
                      </span>
                   </div>
                   <p className="text-xs text-slate-500 pl-6">Durasi: {order.total_hari} Hari</p>
                </div>

                {order.denda > 0 && (
                   <div className="bg-red-50 p-3 rounded border border-red-100 text-red-700 text-sm flex justify-between items-center animate-pulse">
                      <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Denda Telat</span>
                      <span className="font-bold">+Rp {order.denda.toLocaleString()}</span>
                   </div>
                )}

                {/* --- TOMBOL AKSI ADMIN --- */}
                <Separator />
                <div className="space-y-2 pt-2">
                   <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">Aksi Cepat:</p>
                   
                   {/* STATUS: PENDING */}
                   {order.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-2">
                         <Button 
                            className="bg-green-600 hover:bg-green-700 w-full" 
                            onClick={() => handleStatusChange('konfirmasi')}
                            disabled={isProcessing}
                         >
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            Konfirmasi
                         </Button>
                         <Button 
                            variant="destructive" 
                            className="w-full"
                            onClick={() => handleStatusChange('batal')}
                            disabled={isProcessing}
                         >
                            <XCircle className="h-4 w-4 mr-2" /> Tolak
                         </Button>
                      </div>
                   )}

                   {/* STATUS: KONFIRMASI */}
                   {order.status === 'konfirmasi' && (
                      <Button 
                         className="w-full bg-blue-600 hover:bg-blue-700"
                         onClick={() => handleStatusChange('aktifkan')}
                         disabled={isProcessing}
                      >
                         {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                         Serah Terima Kunci
                      </Button>
                   )}

                   {/* STATUS: AKTIF (SEDANG JALAN) */}
                   {order.status === 'aktif' && (
                      <Button 
                         className="w-full bg-purple-600 hover:bg-purple-700"
                         onClick={() => handleStatusChange('selesai')}
                         disabled={isProcessing}
                      >
                         {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                         Terima Pengembalian
                      </Button>
                   )}

                   {/* STATUS: FINAL */}
                   {(order.status === 'selesai' || order.status === 'batal') && (
                      <div className="text-center py-2 text-sm text-slate-500 bg-slate-100 rounded border border-slate-200">
                         Pesanan ini telah {order.status}.
                      </div>
                   )}
                </div>
             </CardContent>
          </Card>

          {/* 4. CATATAN */}
          <Card>
             <CardHeader className="pb-2">
                <CardTitle className="text-sm">Catatan Pesanan</CardTitle>
             </CardHeader>
             <CardContent>
                {/* --- FIX ERROR DISINI --- */}
                {/* Pastikan tidak merender object secara langsung */}
                <p className="text-sm text-slate-600 italic bg-slate-50 p-3 rounded-md">
                   {order.catatan ? `"${order.catatan}"` : "Tidak ada catatan tambahan."}
                </p>
             </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}