"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Calendar, MapPin, Phone, Car, 
  CheckCircle, XCircle, Clock, AlertTriangle, Loader2, CreditCard, Banknote, HelpCircle 
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import axios, { isAxiosError } from "axios"; 

import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback"; 

// --- TYPE DEFINITIONS (Strict Type) ---

interface MobilDetail {
  nama_mobil: string;
  gambar_url: string | null;
  plat_nomor: string;
  warna: string;
  harga_per_hari: number;
  tahun: number;
  transmisi: string;
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
  catatan: string | null;
  created_at: string;
  type_pesanan: string;
  
  // Relations
  mobil_detail: MobilDetail;
  supir_detail?: { nama: string; no_hp: string } | null;
}

export default function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Unwrap params (Next.js 15+)
  const { id } = use(params);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  // --- FETCH DATA ---
  const fetchOrder = async () => {
    try {
      const res = await api.get<OrderDetail>(`/pesanan/${id}/`);
      setOrder(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat detail pesanan");
      router.push("/customer/orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // --- ACTION: BATALKAN PESANAN ---
  const handleCancelOrder = async () => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;

    setIsCancelling(true);
    try {
      await api.post(`/pesanan/${id}/batal/`);
      toast.success("Pesanan berhasil dibatalkan");
      fetchOrder(); // Refresh data
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const msg = error.response?.data?.error || "Gagal membatalkan pesanan";
        toast.error(msg);
      } else {
        toast.error("Terjadi kesalahan sistem");
      }
    } finally {
      setIsCancelling(false);
    }
  };

  // --- HELPER: STATUS WARNA & TEXT ---
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': 
        return { 
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
            label: 'Menunggu Konfirmasi',
            icon: Clock,
            desc: 'Mohon tunggu, admin sedang mengecek ketersediaan unit.'
        };
      case 'konfirmasi': 
        return { 
            color: 'bg-blue-100 text-blue-800 border-blue-200', 
            label: 'Disetujui',
            icon: CheckCircle,
            desc: 'Booking disetujui! Silakan datang ke lokasi untuk pengambilan unit.'
        };
      case 'aktif': 
        return { 
            color: 'bg-purple-100 text-purple-800 border-purple-200', 
            label: 'Sedang Jalan',
            icon: Car,
            desc: 'Mobil sedang Anda sewa. Hati-hati di jalan!'
        };
      case 'selesai': 
        return { 
            color: 'bg-green-100 text-green-800 border-green-200', 
            label: 'Selesai',
            icon: CheckCircle,
            desc: 'Pesanan telah selesai. Terima kasih telah menyewa.'
        };
      case 'batal': 
        return { 
            color: 'bg-red-100 text-red-800 border-red-200', 
            label: 'Dibatalkan',
            icon: AlertTriangle,
            desc: 'Pesanan ini telah dibatalkan.'
        };
      default: 
        return { 
            color: 'bg-slate-100 text-slate-800', 
            label: status,
            icon: HelpCircle,
            desc: ''
        };
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

  if (!order) return null;

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Detail Pesanan</h1>
                <p className="text-sm text-slate-500">Kode Booking: <span className="font-mono font-bold text-blue-600">{order.kode_booking}</span></p>
            </div>
        </div>
        
        {/* STATUS BADGE BESAR */}
        <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${statusInfo.color}`}>
            <StatusIcon className="h-5 w-5" />
            <span className="font-semibold">{statusInfo.label}</span>
        </div>
      </div>

      {/* ALERT INFO STATUS */}
      <Alert className={`${statusInfo.color} bg-opacity-50 border-opacity-50`}>
        <StatusIcon className="h-4 w-4" />
        <AlertTitle className="font-semibold">Status: {statusInfo.label}</AlertTitle>
        <AlertDescription>{statusInfo.desc}</AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KIRI: INFO MOBIL & WAKTU */}
        <div className="md:col-span-2 space-y-6">
            
            {/* KARTU MOBIL */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Car className="h-5 w-5 text-blue-600" /> Kendaraan yang Disewa
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="aspect-video w-full bg-slate-100 rounded-lg overflow-hidden relative">
                        <ImageWithFallback 
                            src={order.mobil_detail.gambar_url || "/images/placeholder-car.jpg"} 
                            alt={order.mobil_detail.nama_mobil}
                            className="object-cover w-full h-full"
                        />
                        <Badge className="absolute top-2 right-2 bg-white/90 text-black hover:bg-white">
                            {order.mobil_detail.plat_nomor}
                        </Badge>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{order.mobil_detail.nama_mobil}</h3>
                        <p className="text-slate-500 text-sm">
                            {order.mobil_detail.warna} • {order.mobil_detail.tahun} • {order.mobil_detail.transmisi || 'Manual'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* KARTU JADWAL */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="h-5 w-5 text-blue-600" /> Jadwal Sewa
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="border p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <p className="text-xs text-slate-500 uppercase mb-1">Tanggal Ambil</p>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                            {format(parseISO(order.tanggal_mulai), "eeee, dd MMMM yyyy", { locale: idLocale })}
                        </p>
                    </div>
                    <div className="border p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <p className="text-xs text-slate-500 uppercase mb-1">Tanggal Kembali</p>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                            {format(parseISO(order.tanggal_selesai), "eeee, dd MMMM yyyy", { locale: idLocale })}
                        </p>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4" />
                        <span>Total Durasi: <b>{order.total_hari} Hari</b></span>
                    </div>
                </CardContent>
            </Card>

        </div>

        {/* KANAN: PEMBAYARAN & AKSI */}
        <div className="space-y-6">
            
            {/* KARTU TAGIHAN */}
            <Card className="border-blue-200 dark:border-blue-900 shadow-sm">
                <CardHeader className="bg-blue-50 dark:bg-blue-950/30 pb-4">
                    <CardTitle className="text-lg">Rincian Biaya</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Sewa Mobil ({order.total_hari} hari)</span>
                        <span className="font-medium">Rp {order.harga_total.toLocaleString('id-ID')}</span>
                    </div>
                    
                    {order.supir_detail && (
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Jasa Supir</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Termasuk</span>
                        </div>
                    )}

                    {order.denda > 0 && (
                        <div className="flex justify-between text-sm text-red-600 font-medium bg-red-50 p-2 rounded">
                            <span>Denda Keterlambatan</span>
                            <span>+ Rp {order.denda.toLocaleString('id-ID')}</span>
                        </div>
                    )}

                    <Separator />
                    
                    <div className="flex justify-between items-end">
                        <span className="font-bold text-lg">Total Bayar</span>
                        <span className="font-bold text-xl text-blue-600">
                            Rp {(order.harga_total + order.denda).toLocaleString('id-ID')}
                        </span>
                    </div>
                </CardContent>
                
                {/* PEMBAYARAN INFO */}
                {order.status !== 'batal' && (
                    <CardFooter className="bg-slate-50 dark:bg-slate-900/50 flex-col items-start gap-2 pt-4">
                        <div className="flex items-start gap-2 text-xs text-slate-500">
                            <Banknote className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>Pembayaran dilakukan di tempat (Cash/Transfer) saat pengambilan unit.</p>
                        </div>
                    </CardFooter>
                )}
            </Card>

            {/* INFO LOKASI */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Lokasi Pengambilan
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                    <p className="font-medium text-slate-900 dark:text-slate-100">Kantor Rental Mobil Padang</p>
                    <p>NKM Auto Rental Padang, Sungai Sapih, Kec. Kuranji, Kota Padang, Sumatera Barat, Indonesia</p>
                    <div className="flex items-center gap-2 mt-2 text-blue-600">
                        <Phone className="h-3 w-3" />
                        <a href="https://wa.me/6281365338011" target="_blank" className="hover:underline">Hubungi Admin klik disini (WhatsApp)</a>
                    </div>
                </CardContent>
            </Card>

            {/* TOMBOL BATALKAN (Hanya jika masih Pending) */}
            {order.status === 'pending' && (
                <Button 
                    variant="outline" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                >
                    {isCancelling ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Batalkan Pesanan
                </Button>
            )}

        </div>
      </div>
    </div>
  );
}