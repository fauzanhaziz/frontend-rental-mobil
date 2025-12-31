import { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { 
  Gauge, Users, AlertCircle, ArrowLeft,  
  CheckCircle2, Star, Flame, Sparkles, ThumbsUp, 
  Fuel, Key, UserCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { CarFilter } from "@/components/CarFilter";
import { LoadingCarAnimation } from "@/components/LoadingCarAnimation";
import { ToggleTheme } from "@/components/admin/ThemeToggle";
import { CarListFooter } from "@/components/CarListFooter";
import { Car } from "@/types"; // Pastikan interface Car sudah ada field 'supir'

export const metadata: Metadata = {
  title: "Daftar Mobil Rental - CV. Niaga Karya Mandiri",
  description: "Temukan berbagai jenis mobil rental berkualitas di Padang. Mulai dari Avanza, Innova, hingga Alphard dengan harga terbaik.",
};

// Fungsi Fetch Data
async function getCars(searchParams: { [key: string]: string | string[] | undefined }): Promise<Car[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  
  const params = new URLSearchParams();
  params.append("status", "aktif");

  if (searchParams.merk) params.append("merk", String(searchParams.merk));
  if (searchParams.transmisi) params.append("transmisi", String(searchParams.transmisi));
  if (searchParams.ordering) params.append("ordering", String(searchParams.ordering));

  try {
    const res = await fetch(`${apiUrl}/mobil/?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Gagal mengambil data");
    
    const data = await res.json();

    if (data.results && Array.isArray(data.results)) {
        return data.results;
    }
    if (Array.isArray(data)) {
        return data;
    }

    return [];
    
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Ikon WA SVG
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default async function MobilPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const cars = await getCars(searchParams);

  // Link WA untuk Empty State
  const phone = "6281365338011"; 
  const waMessage = "Halo Admin, saya sedang mencari mobil di website tapi tidak menemukan yang saya inginkan. Apakah ada rekomendasi lain?";
  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(waMessage)}`;

  // Helper Generate Link WA per Mobil
  const getCarWaLink = (carName: string) => {
    const msg = `Halo Admin CV. Niaga Karya Mandiri, saya tertarik dengan mobil ${carName}. Apakah unit tersedia?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Logika Label Marketing
  const getCarLabel = (popularity?: string, tahun?: number) => {
    if (popularity && popularity !== 'standard') {
        switch (popularity) {
            case 'bestseller': return { text: "Best Seller", color: "bg-yellow-500", icon: <Star className="w-3 h-3 text-white" /> };
            case 'hotdeal': return { text: "Hot Deal", color: "bg-red-600", icon: <Flame className="w-3 h-3 text-white" /> };
            case 'new': return { text: "New Arrival", color: "bg-blue-600", icon: <Sparkles className="w-3 h-3 text-white" /> };
            case 'recommended': return { text: "Rekomendasi", color: "bg-green-600", icon: <ThumbsUp className="w-3 h-3 text-white" /> };
        }
    }
    const currentYear = new Date().getFullYear();
    if (tahun && tahun >= currentYear - 1) {
      return { text: "New Arrival", color: "bg-blue-600", icon: <Sparkles className="w-3 h-3 text-white" /> };
    }
    return null; 
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col font-sans">
      
      {/* === HEADER BAR (Sticky) === */}
      <div className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-4 py-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <Link 
            href="/" 
            className="group flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-red-800 dark:text-gray-300 dark:hover:text-red-400 transition-colors"
          >
            <div className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors border border-transparent group-hover:border-red-200 dark:group-hover:border-red-800">
                <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline uppercase tracking-wide">Kembali ke Beranda</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
                <p className="text-xs text-gray-500 uppercase font-semibold">Layanan Pelanggan</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">+62 813-6533-8011</p>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 hidden md:block"></div>
            <ToggleTheme />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 grow">
        
        {/* JUDUL */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold mb-4 border border-yellow-200 uppercase tracking-wider">
            Katalog Lengkap
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            Pilihan Armada <span className="text-red-800 dark:text-red-500">Terbaik</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Temukan kendaraan yang pas untuk perjalanan bisnis, wisata, atau kebutuhan pribadi Anda.
          </p>
        </div>

        {/* FILTER */}
        <div className="mb-10">
           <CarFilter />
        </div>

        {/* CONTENT GRID */}
        <Suspense fallback={<div className="py-20"><LoadingCarAnimation /></div>}>
          
          {cars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {cars.map((car, ) => {
                const labelData = getCarLabel(car.popularity, car.tahun);
                const allInPrice = Number(car.harga_per_hari);

                // --- LOGIKA PENENTU TAMPILAN SUPIR ---
                // Ganti 'car.supir' dengan nama field di database Anda (misal: car.include_supir, car.is_driver_included)
                // Defaultnya saya asumsikan nama fieldnya 'supir' (boolean)
                const isIncludeDriver = car.dengan_supir === true; 

                return (
                  <div 
                    key={car.id}
                    className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:border-yellow-400 dark:hover:border-yellow-600 transition-all duration-300 flex flex-col h-full relative"
                  >
                    {/* Image Area */}
                    <div className="relative h-56 bg-gray-100 dark:bg-slate-800 overflow-hidden shrink-0">
                      <ImageWithFallback
                        src={car.gambar_url || "/images/placeholder-car.jpg"}
                        alt={car.nama_mobil}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      {/* LABEL POPULARITAS */}
                      {labelData && (
                        <div className={`absolute top-4 left-4 ${labelData.color} text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-md flex items-center gap-1.5 z-10`}>
                            {labelData.icon}
                            {labelData.text}
                        </div>
                      )}

                      {/* Badge Ready */}
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 z-10">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col grow">
                      <div className="mb-2">
                        
                        {/* Nama & Jenis */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-red-800 dark:group-hover:text-red-400 transition-colors" title={car.nama_mobil}>
                            {car.nama_mobil}
                          </h3>
                          {car.jenis && (
                              <span className="shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mt-1">
                                  {car.jenis}
                              </span>
                          )}
                        </div>
                        
                        {/* Specs */}
                        <div className="flex items-center gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400">
                           <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                              <Gauge className="h-3.5 w-3.5 text-yellow-600" />
                              <span className="font-medium">{car.transmisi_display}</span>
                           </div>
                           <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                              <Users className="h-3.5 w-3.5 text-yellow-600" />
                              <span className="font-medium">{car.kapasitas_kursi} Seat</span>
                           </div>
                        </div>
                      </div>

                      {/* === BADGE JENIS LAYANAN (LOGIKA BARU) === */}
                      <div className="flex items-center gap-2 mb-4">
                         {isIncludeDriver ? (
                           /* Jika Include Supir: Tampil Badge Supir */
                           <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800">
                              <UserCheck className="w-3 h-3" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Dengan Supir</span>
                           </div>
                         ) : (
                           /* Jika Tidak: Tampil Badge Lepas Kunci */
                           <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                              <Key className="w-3 h-3" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Lepas Kunci</span>
                           </div>
                         )}
                      </div>

                      {/* === INFO PAKET ALL IN (Hanya tampil jika Include Supir) === */}
                      {isIncludeDriver && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900 rounded-xl flex items-start gap-2.5">
                           <div className="p-1 bg-green-200 dark:bg-green-800 rounded-full shrink-0 mt-0.5">
                              <Fuel className="w-3 h-3 text-green-700 dark:text-green-200" />
                           </div>
                           <div className="text-xs">
                              <p className="font-bold text-green-800 dark:text-green-300">
                                  All in Driver + BBM: Rp {allInPrice.toLocaleString("id-ID")}
                              </p>
                              <p className="text-green-600 dark:text-green-400 text-[10px] mt-0.5 leading-tight">
                                  (Harga belum termasuk parkir/tol dan pajak jika ada)
                              </p>
                           </div>
                        </div>
                      )}

                      <div className="mt-auto pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 mb-4">
                        <div className="flex items-baseline justify-between">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Harga Dasar</span>
                            <div className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                                <span className="text-sm font-bold">Rp</span>
                                <span className="text-xl font-extrabold">
                                {Number(car.harga_per_hari).toLocaleString('id-ID')}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">/hari</span>
                            </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        <a 
                          href={getCarWaLink(car.nama_mobil)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full"
                        >
                          <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs h-11 shadow-md hover:shadow-lg transition-all gap-2 rounded-xl">
                            <WhatsAppIcon className="h-4 w-4" />
                            Booking Now
                          </Button>
                        </a>
                        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2.5 italic">
                          Hubungi admin untuk info lebih lanjut
                        </p>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* === EMPTY STATE === */
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-300 dark:border-slate-700">
              <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <AlertCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Mobil Tidak Ditemukan
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                Sepertinya tidak ada mobil yang cocok dengan filter pencarian Anda saat ini. Coba atur ulang filter atau hubungi admin.
              </p>
              
              <div className="flex flex-col gap-4 w-full max-w-sm px-4">
                <Link href="/mobil" className="w-full">
                    <Button variant="outline" className="w-full border-gray-300 h-12 font-medium hover:bg-gray-50 dark:hover:bg-slate-800">
                        Reset Filter Pencarian
                    </Button>
                </Link>

                <div className="relative flex items-center py-2">
                    <div className="grow border-t border-gray-200 dark:border-slate-700"></div>
                    <span className="shrink-0 mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Atau Hubungi</span>
                    <div className="grow border-t border-gray-200 dark:border-slate-700"></div>
                </div>

                <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-12 font-bold shadow-lg shadow-green-600/20 rounded-xl">
                        <WhatsAppIcon className="h-5 w-5" />
                        Chat Admin via WhatsApp
                    </Button>
                </a>
              </div>
            </div>
          )}

        </Suspense>
      </div>

      {/* FOOTER KHUSUS */}
      <div className="mt-20">
         <CarListFooter />
      </div>

    </div>
  );
}