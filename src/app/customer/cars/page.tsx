"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Gauge, Users, Filter, Calendar } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { LoadingCarAnimation } from '@/components/LoadingCarAnimation';
import api from '@/lib/axios';
import Link from 'next/link';

// --- 1. DEFINISI TIPE DATA (STRICT - NO ANY) ---

interface Car {
  id: number;
  nama_mobil: string;
  merk: string;
  jenis: string | null;
  tahun: number | null;
  harga_per_hari: string; // Django Decimal field dikirim sebagai string
  gambar_url: string | null;
  transmisi_display: string;
  kapasitas_kursi: number;
  status: string;
}

// Interface untuk Pagination Django REST Framework
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Union Type: Respon bisa berupa Array murni ATAU Object Pagination
type ApiResponse<T> = T[] | PaginatedResponse<T>;

// --- 2. HELPER FUNCTION (TYPE GUARD) ---
function getResults<T>(data: ApiResponse<T>): T[] {
  // Cek jika data adalah object dan punya properti 'results' (Pagination)
  if (!Array.isArray(data) && 'results' in data) {
    return data.results;
  }
  // Cek jika data adalah array biasa
  if (Array.isArray(data)) {
    return data;
  }
  // Default kosong jika format tidak dikenali
  return [];
}

export default function CustomerCars() {
  const { searchTerm: globalSearch } = useSearch();
  
  // State Data
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // State Filter
  const [search, setSearch] = useState('');
  const [transmisi, setTransmisi] = useState('all');
  const [sort, setSort] = useState('newest');

  // Sync Global Search dari Header
  useEffect(() => {
    if (globalSearch) setSearch(globalSearch);
  }, [globalSearch]);

  // Fungsi Fetch Data
  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('status', 'aktif'); // Hanya tampilkan mobil aktif
      
      if (search) params.append('merk', search); // Backend filter by merk/nama
      if (transmisi !== 'all') params.append('transmisi', transmisi);
      
      // Sorting
      if (sort === 'lowest') params.append('ordering', 'harga_per_hari');
      else if (sort === 'highest') params.append('ordering', '-harga_per_hari');
      else if (sort === 'newest') params.append('ordering', '-created_at');

      // Panggil API dengan Tipe Generics
      const response = await api.get<ApiResponse<Car>>(`/mobil/?${params.toString()}`);
      
      // Proses data menggunakan helper yang aman
      const dataList = getResults(response.data);
      setCars(dataList);

    } catch (error: unknown) {
      console.error("Gagal ambil mobil:", error);
      toast.error("Gagal memuat daftar mobil.");
    } finally {
      setLoading(false);
    }
  }, [search, transmisi, sort]);

  // Debounce Search (Tunggu user selesai mengetik 500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCars();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchCars]);

  if (loading && cars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingCarAnimation />
        <p className="text-slate-600 dark:text-slate-400 mt-4 animate-pulse">
          Mencari armada terbaik...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Armada Tersedia</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Pilih mobil yang sesuai dengan kebutuhan perjalanan Anda.
        </p>
      </div>

      {/* FILTER BAR */}
      <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm sticky top-20 z-20">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari merk mobil (Toyota, Honda...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 focus-visible:ring-blue-500"
            />
          </div>

          {/* Filter Transmisi */}
          <div className="w-full md:w-[200px]">
            <Select value={transmisi} onValueChange={setTransmisi}>
              <SelectTrigger>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Gauge className="h-4 w-4" />
                  <SelectValue placeholder="Transmisi" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Transmisi</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="matic">Automatic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Harga */}
          <div className="w-full md:w-[200px]">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Urutkan" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="lowest">Harga Terendah</SelectItem>
                <SelectItem value="highest">Harga Tertinggi</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </Card>

      {/* CAR LIST GRID */}
      {cars.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-slate-500 mb-4">Tidak ada mobil yang ditemukan dengan kriteria tersebut.</p>
          <Button 
            variant="outline" 
            onClick={() => { setSearch(''); setTransmisi('all'); }}
          >
            Reset Filter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cars.map((car, index) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                
                {/* Image Section */}
                <div className="relative h-48 bg-gray-100 dark:bg-slate-700 overflow-hidden">
                  <ImageWithFallback
                    src={car.gambar_url || "/images/placeholder-car.jpg"}
                    alt={car.nama_mobil}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Badge Ready */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-green-600 hover:bg-green-700 shadow-sm">
                      Ready
                    </Badge>
                  </div>

                  {/* Badge Tahun */}
                  {car.tahun && (
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {car.tahun}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col grow">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 line-clamp-1" title={car.nama_mobil}>
                      {car.nama_mobil}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                      {car.merk} {car.jenis ? `• ${car.jenis}` : ''}
                    </p>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                      <Users className="h-3.5 w-3.5 text-blue-500" />
                      <span>{car.kapasitas_kursi} Kursi</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                      <Gauge className="h-3.5 w-3.5 text-blue-500" />
                      <span>{car.transmisi_display}</span>
                    </div>
                  </div>

                  {/* Footer Price & Action */}
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-400">Harga Sewa</p>
                      <p className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                        Rp {Number(car.harga_per_hari).toLocaleString('id-ID')}
                      </p>
                    </div>
                    
                    {/* Tombol Sewa */}
                    <Link href={`/customer/cars/${car.id}`}>
                      <Button size="sm" className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 hover:scale-105 transition-transform shadow-md">
                        Sewa
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}