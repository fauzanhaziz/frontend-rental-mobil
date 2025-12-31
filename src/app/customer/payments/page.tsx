"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Eye, Loader2, CreditCard, Banknote, ImageIcon, RefreshCw, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Image from 'next/image';
import api from '@/lib/axios';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

// --- TIPE DATA ---
interface Payment {
  id: number;
  pesanan: number;
  kode_booking: string;
  jumlah: string; // Decimal string dari backend
  metode: 'transfer' | 'cash';
  status: 'pending' | 'lunas' | 'gagal';
  bukti_bayar: string | null;
  bukti_bayar_url?: string | null; // URL lengkap dari backend
  created_at: string;
}

interface ApiResponse<T> {
    results: T[];
    count?: number;
}

// Helper untuk handle pagination DRF
function getResults<T>(data: ApiResponse<T> | T[]): T[] {
    if (Array.isArray(data)) return data;
    return data.results || [];
}

export default function CustomerPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State Modal & Upload
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  // 1. FETCH DATA PEMBAYARAN
  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      // Backend otomatis memfilter pembayaran milik user yang login
      const res = await api.get<ApiResponse<Payment>>('/pembayaran/');
      const data = getResults(res.data);
      setPayments(data);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Gagal memuat riwayat pembayaran");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // 2. HANDLE FILE PREVIEW
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      // Validasi ukuran (max 5MB)
      if (f.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }
      setFile(f);
      setPreview(URL.createObjectURL(f)); // Preview lokal
    }
  };

  const handleOpenDetail = (payment: Payment) => {
    setSelectedPayment(payment);
    setFile(null);
    
    // Logika Preview:
    // Jika ada bukti_bayar_url (dari backend), pakai itu.
    // Jika tidak, kosongkan string.
    const existingImage = payment.bukti_bayar_url || payment.bukti_bayar;
    setPreview(existingImage || '');
    
    setIsDialogOpen(true);
  };

  // 3. SUBMIT BUKTI (UPLOAD)
  const handleSubmitBukti = async () => {
    if (!selectedPayment || !file) return toast.warning("Pilih file bukti bayar terlebih dahulu");

    setIsProcessing(true);
    try {
        const formData = new FormData();
        formData.append('bukti_bayar', file);
        
        // Kirim ke backend (PATCH karena update sebagian data)
        await api.patch(`/pembayaran/${selectedPayment.id}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        toast.success("Bukti pembayaran berhasil diupload! Menunggu verifikasi admin.");
        setIsDialogOpen(false);
        fetchPayments(); // Refresh data tabel
    } catch (error) {
        console.error("Upload Error:", error);
        toast.error("Gagal mengupload bukti pembayaran.");
    } finally {
        setIsProcessing(false);
    }
  };

  // --- STATISTIK ---
  const paidCount = payments.filter((p) => p.status === 'lunas').length;
  const totalCount = payments.length;
  const percentage = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  // --- HELPER FORMATTING ---
  const formatRupiah = (val: string) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(val));
  
  const formatDate = (val: string) => 
    format(parseISO(val), "dd MMM yyyy, HH:mm", { locale: id });

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'lunas': return { label: 'Lunas', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
        case 'pending': return { label: 'Menunggu Verifikasi', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Loader2 };
        case 'gagal': return { label: 'Ditolak / Gagal', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle };
        default: return { label: status, className: 'bg-slate-100 text-slate-800', icon: Loader2 };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pembayaran Saya</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
            Kelola tagihan dan konfirmasi pembayaran pesanan Anda.
            </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => fetchPayments()} title="Refresh Data">
            <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* PROGRESS CARD */}
      {totalCount > 0 && (
        <Card className="p-6 gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 border-blue-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Status Pembayaran</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {paidCount} / {totalCount} Lunas ({percentage}%)
            </p>
            </div>
            <Progress value={percentage} className="h-2" />
        </Card>
      )}

      {/* TABLE DATA */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[120px]">Kode Booking</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {payments.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                            Belum ada tagihan. Lakukan pemesanan mobil terlebih dahulu.
                        </TableCell>
                    </TableRow>
                ) : (
                    payments.map((payment) => {
                    const badge = getStatusBadge(payment.status);
                    const StatusIcon = badge.icon;
                    return (
                        <TableRow key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <TableCell className="font-mono font-medium text-blue-600">
                            {payment.kode_booking}
                        </TableCell>
                        <TableCell className="capitalize">
                            <div className="flex items-center gap-2">
                                {payment.metode === 'transfer' ? <CreditCard className="w-4 h-4 text-slate-500" /> : <Banknote className="w-4 h-4 text-green-600" />}
                                <span>{payment.metode}</span>
                            </div>
                        </TableCell>
                        <TableCell className="font-bold">{formatRupiah(payment.jumlah)}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-slate-500">{formatDate(payment.created_at)}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className={`${badge.className} gap-1 pr-3`}>
                                <StatusIcon className="w-3 h-3" /> {badge.label}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                {/* Tombol Upload / Lihat Detail */}
                                <Button
                                    size="sm"
                                    variant={payment.status === 'pending' && payment.metode === 'transfer' ? "default" : "outline"}
                                    onClick={() => handleOpenDetail(payment)}
                                    className={payment.status === 'pending' && payment.metode === 'transfer' ? "bg-blue-600 hover:bg-blue-700 text-white gap-2" : "gap-2"}
                                >
                                    {payment.status === 'pending' && payment.metode === 'transfer' ? (
                                        <>
                                            <Upload className="h-4 w-4" /> Upload Bukti
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="h-4 w-4" /> Detail
                                        </>
                                    )}
                                </Button>
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

      {/* MODAL DETAIL & UPLOAD */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Pembayaran</DialogTitle>
            <DialogDescription>
                Kode Booking: <span className="font-mono font-bold text-blue-600">{selectedPayment?.kode_booking}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                <div>
                  <p className="text-slate-500 text-xs uppercase mb-1">Metode</p>
                  <p className="font-medium capitalize flex items-center gap-1">
                    {selectedPayment.metode === 'transfer' ? <CreditCard className="w-4 h-4" /> : <Banknote className="w-4 h-4" />}
                    {selectedPayment.metode}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase mb-1">Total Tagihan</p>
                  <p className="font-bold text-lg text-blue-600">{formatRupiah(selectedPayment.jumlah)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase mb-1">Status</p>
                  <Badge variant="outline" className={getStatusBadge(selectedPayment.status).className}>
                    {getStatusBadge(selectedPayment.status).label}
                  </Badge>
                </div>
                <div>
                   <p className="text-slate-500 text-xs uppercase mb-1">Dibuat Pada</p>
                   <p className="text-xs">{formatDate(selectedPayment.created_at)}</p>
                </div>
              </div>

              {/* AREA BUKTI BAYAR */}
              <div className="space-y-2">
                <Label>Bukti Pembayaran</Label>
                
                {/* Preview Box */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
                   {preview ? (
                      <Image 
                        src={preview} 
                        alt="Bukti Bayar" 
                        fill 
                        className="object-contain p-2"
                        unoptimized // Wajib untuk gambar dari URL external (backend)
                      />
                   ) : (
                      <div className="text-center text-slate-400">
                         <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                         <p className="text-sm">Belum ada bukti yang diunggah.</p>
                      </div>
                   )}
                </div>

                {/* Input File (Hanya muncul jika Status Pending & Metode Transfer) */}
                {selectedPayment.status !== 'lunas' && selectedPayment.metode === 'transfer' && (
                    <div className="mt-3">
                        <Label htmlFor="bukti-upload" className="cursor-pointer block">
                            <div className="flex items-center justify-center w-full p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                                <Upload className="w-4 h-4 mr-2" /> 
                                {file ? "Ganti File" : "Pilih File Gambar"}
                            </div>
                        </Label>
                        <input 
                            id="bukti-upload" 
                            type="file" 
                            accept="image/jpeg,image/png,image/jpg" 
                            className="hidden" 
                            onChange={handleFileChange} 
                        />
                        {file ? (
                            <p className="text-xs text-green-600 mt-2 text-center font-medium truncate px-4">
                                <CheckCircle className="inline w-3 h-3 mr-1" /> File siap upload: {file.name}
                            </p>
                        ) : (
                            <p className="text-xs text-slate-500 mt-2 text-center">
                                Format: JPG, PNG (Max 5MB)
                            </p>
                        )}
                    </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Tutup</Button>
            
            {selectedPayment?.status !== 'lunas' && selectedPayment?.metode === 'transfer' && (
                <Button onClick={handleSubmitBukti} disabled={isProcessing || !file} className="bg-blue-600 hover:bg-blue-700">
                    {isProcessing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Kirim Bukti
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}