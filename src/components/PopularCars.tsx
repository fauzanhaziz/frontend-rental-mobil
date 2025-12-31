"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { Gauge, Users, Car as CarIcon, Star, Flame, ThumbsUp, Sparkles, CheckCircle2, Fuel, ArrowRight, Key, UserCheck } from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback"; 
import { Button } from "@/components/ui/button";
import { Car } from "@/types"; 

// Ikon WA SVG
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

// Animasi Stagger
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" } 
  },
};

export default function PopularCars({ initialData }: { initialData: Car[] }) {
  
  const showPlaceholders = !initialData || initialData.length === 0;
  
  // --- LOGIKA SORTING (Bestseller First) ---
  const getRank = (popularity?: string) => {
    switch (popularity) {
      case 'bestseller': return 1;    // Paling Atas
      case 'hotdeal': return 2;
      case 'new': return 3;
      case 'recommended': return 4;
      default: return 5;              // Standard paling bawah
    }
  };

  // Urutkan data sebelum ditampilkan
  // Kita copy array dulu ([...initialData]) agar tidak memutasi props asli
  const sortedData = [...initialData].sort((a, b) => {
    return getRank(a.popularity) - getRank(b.popularity);
  });

  const displayItems = showPlaceholders ? [1, 2, 3, 4] : sortedData;

  const getWaLink = (carName: string) => {
    const phone = "6281365338011"; 
    const message = `Halo Admin CV. Niaga Karya Mandiri, saya tertarik dengan mobil ${carName}. Apakah unit tersedia?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // Logika Label Marketing
  const getCarLabel = (car: Car) => {
    // 1. Cek Popularity dari DB
    if (car.popularity && car.popularity !== 'standard') {
        switch (car.popularity) {
            case 'bestseller': return { text: "Best Seller", color: "bg-yellow-500", icon: <Star className="w-3 h-3 text-white" /> };
            case 'hotdeal': return { text: "Hot Deal", color: "bg-red-600", icon: <Flame className="w-3 h-3 text-white" /> };
            case 'new': return { text: "New Arrival", color: "bg-blue-600", icon: <Sparkles className="w-3 h-3 text-white" /> };
            case 'recommended': return { text: "Rekomendasi", color: "bg-green-600", icon: <ThumbsUp className="w-3 h-3 text-white" /> };
        }
    }
    // 2. Fallback Tahun
    const currentYear = new Date().getFullYear();
    if (car.tahun && car.tahun >= currentYear - 1) {
      return { text: "New Arrival", color: "bg-blue-600", icon: <Sparkles className="w-3 h-3 text-white" /> };
    }
    return null; 
  };

  return (
    <section id="mobil-populer" className="py-24 bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      
      <div className="absolute top-0 left-0 w-full h-1.5 bg-red-900 dark:bg-red-600" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-bold mb-4 border border-yellow-200 dark:border-yellow-700 tracking-wider">
              ARMADA TERBAIK
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              Pilihan Mobil <span className="text-red-800 dark:text-red-500">Favorit</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Armada terawat dengan standar kebersihan tinggi, siap menemani perjalanan bisnis maupun liburan keluarga Anda.
            </p>
          </motion.div>
        </div>

        {/* GRID (ANIMATED) */}
        <motion.div 
           className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
           variants={containerVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, margin: "-50px" }}
        >
          
          {/* RENDER CARD */}
          {showPlaceholders ? (
            displayItems.map((_, index) => (
              <motion.div
                key={`ph-${index}`}
                variants={cardVariants}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center h-[450px] shadow-sm"
              >
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                  <CarIcon className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500 mb-2">Segera Hadir</h3>
                <p className="text-sm text-slate-400 dark:text-slate-600">Mobil sedang disiapkan.</p>
              </motion.div>
            ))
          ) : (
            // LOOP DATA YANG SUDAH DIURUTKAN (sortedData)
            (displayItems as Car[]).map((car) => {
              const labelData = getCarLabel(car); 
              const allInPrice = Number(car.harga_per_hari);

              // --- LOGIKA PENENTU TAMPILAN SUPIR ---
              // Sesuaikan field 'supir' dengan database Anda (boolean)
              const isIncludeDriver = car.dengan_supir === true; 

              return (
                <motion.article
                  key={car.id}
                  variants={cardVariants} 
                  className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-yellow-400 dark:hover:border-yellow-600 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col h-full relative"
                >
                  {/* IMAGE AREA */}
                  <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-slate-700">
                    <ImageWithFallback
                      src={car.gambar_url || "/images/placeholder-car.jpg"}
                      alt={car.nama_mobil}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* LABEL POPULARITAS */}
                    {labelData && (
                      <div className={`absolute top-3 left-3 ${labelData.color} text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-md flex items-center gap-1.5 z-10`}>
                          {labelData.icon}
                          {labelData.text}
                      </div>
                    )}

                    {/* Badge Ready */}
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 z-10">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </div>
                  </div>

                  {/* CONTENT AREA */}
                  <div className="p-5 flex flex-col grow">
                    
                    {/* Nama & Jenis */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-red-800 dark:group-hover:text-red-400 transition-colors" title={car.nama_mobil}>
                        {car.nama_mobil}
                      </h3>
                      {car.jenis && (
                          <span className="shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                              {car.jenis}
                          </span>
                      )}
                    </div>
                    
                    {/* Specs */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                          <Gauge className="h-3.5 w-3.5 text-yellow-600" />
                          <span className="font-medium">{car.transmisi_display}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                          <Users className="h-3.5 w-3.5 text-yellow-600" />
                          <span className="font-medium">{car.kapasitas_kursi} Seat</span>
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
                              (Harga belum termasuk parkir/tol)
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="mt-auto pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 mb-4">
                      <div className="flex items-baseline justify-between">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Harga Dasar</span>
                          <div className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                            <span className="text-sm font-bold">Rp</span>
                            <span className="text-xl font-extrabold">
                            {Number(car.harga_per_hari).toLocaleString("id-ID")}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">/hari</span>
                          </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      <a 
                        href={getWaLink(car.nama_mobil)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                      >
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs h-10 shadow-md hover:shadow-lg transition-all gap-2 rounded-lg">
                          <WhatsAppIcon className="h-4 w-4" />
                          Booking Now
                        </Button>
                      </a>
                      <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2.5 italic">
                        Hubungi admin untuk info lebih lanjut
                      </p>
                    </div>

                  </div>
                </motion.article>
              );
            })
          )}
        </motion.div>

        {/* BOTTOM CTA */}
        <div className="mt-16 text-center">
          <Link href="/mobil">
            <Button 
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-base px-8 py-6 rounded-full shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all hover:-translate-y-1"
            >
              Lihat Semua Armada
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}