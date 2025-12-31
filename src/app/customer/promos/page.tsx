"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, Clock, Users, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

// --- TIPE DATA DARI BACKEND ---
interface Promo {
  id: number;
  kode: string;
  nama_promo: string;
  keterangan: string;
  tipe_diskon: 'nominal' | 'persen';
  nilai_diskon: string;
  max_potongan: string;
  min_transaksi: string;
  kuota: number;
  berlaku_sampai: string;
}

export default function CustomerPromos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. FETCH DATA
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await api.get('/promo/');
        // Handle pagination DRF (results) atau array langsung
        const data = 'results' in res.data ? res.data.results : res.data;
        setPromos(data);
      } catch (error) {
        console.error("Gagal memuat promo", error);
        toast.error("Gagal memuat daftar promo.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPromos();
  }, []);

  const handleUsePromo = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Kode promo ${code} berhasil disalin! 🎉`);
  };

  // --- HELPER FORMATTING ---
  const formatRupiah = (val: string | number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(val));

  const formatDate = (dateStr: string) => 
    format(parseISO(dateStr), "d MMM yyyy", { locale: id });

  // Helper untuk Menentukan Warna Card berdasarkan Tipe Diskon
  // Persen -> Gaya "Weekend" (Orange), Nominal -> Gaya "Cashback" (Purple)
  const getStyleByType = (tipe: 'nominal' | 'persen') => {
    if (tipe === 'persen') {
        return {
            gradient: 'from-orange-500 to-orange-600',
            badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            label: 'Spesial Diskon'
        };
    }
    return {
        gradient: 'from-purple-500 to-purple-600',
        badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        label: 'Potongan Langsung'
    };
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
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
      <div>
        <h2 className="text-slate-900 dark:text-slate-100">Promo & Penawaran</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Dapatkan penawaran terbaik untuk rental mobil Anda (Berlaku Terbatas!)
        </p>
      </div>

      {/* Empty State */}
      {!isLoading && promos.length === 0 && (
        <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-xl">
            <Tag className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Belum ada promo yang tersedia saat ini.</p>
        </div>
      )}

      {/* Promos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promos.map((promo, index) => {
          const style = getStyleByType(promo.tipe_diskon);
          
          // Generate Terms Dinamis dari Data Backend
          const terms = [];
          if (Number(promo.min_transaksi) > 0) terms.push(`Min. transaksi ${formatRupiah(promo.min_transaksi)}`);
          if (promo.tipe_diskon === 'persen' && Number(promo.max_potongan) > 0) terms.push(`Maks. potongan ${formatRupiah(promo.max_potongan)}`);
          if (promo.kuota > 0) terms.push(`Kuota terbatas (${promo.kuota} voucher)`);
          if (promo.keterangan) terms.push(promo.keterangan);

          return (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="flex flex-col h-full overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300">
                {/* Header with Gradient */}
                <div className={`p-6 gradient-to-br ${style.gradient} text-white`}>
                  <div className="flex items-start justify-between mb-4">
                    <Tag className="h-8 w-8" />
                    <Badge className="bg-white/20 text-white border-none">
                      {style.label}
                    </Badge>
                  </div>
                  <h3 className="mb-2 font-bold text-lg line-clamp-1" title={promo.nama_promo}>{promo.nama_promo}</h3>
                  <p className="text-sm opacity-90 line-clamp-2 min-h-[40px]">
                    {promo.keterangan || "Gunakan kode ini saat checkout untuk mendapatkan potongan harga."}
                  </p>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col grow justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold">Besar Diskon</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {promo.tipe_diskon === 'persen' ? `${Number(promo.nilai_diskon)}%` : formatRupiah(promo.nilai_diskon)}
                        </p>
                        </div>
                        <div className="text-right">
                        <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold">Kode</p>
                        <p className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 tracking-wide">{promo.kode}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-900 p-2 rounded">
                        <Clock className="h-4 w-4 text-red-500" />
                        <span className="text-xs">Berlaku s/d <b>{formatDate(promo.berlaku_sampai)}</b></span>
                    </div>

                    <div className="space-y-2 mb-6">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Syarat & Ketentuan:</p>
                        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        {terms.length > 0 ? terms.map((term, i) => (
                            <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400">•</span>
                            <span className="line-clamp-1" title={term}>{term}</span>
                            </li>
                        )) : (
                            <li className="text-slate-400 italic">Tidak ada syarat khusus</li>
                        )}
                        </ul>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleUsePromo(promo.kode)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Salin Kode
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="p-6 gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-lg text-white">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-slate-100 mb-2 font-bold">
              Tips Hemat Rental Mobil
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
              
              Pantau terus halaman ini untuk mendapatkan kode promo terbaru. 
              Biasanya promo besar muncul saat hari libur nasional atau akhir tahun!
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}