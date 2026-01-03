"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Play, X, Image as ImageIcon, Film, ZoomIn, Loader2 } from "lucide-react";
import api from "@/lib/axios";

// --- TIPE DATA ---
interface DocumentationItem {
  id: number;
  judul: string;
  deskripsi: string;
  media_url: string;
  media_type?: string; 
}

const categories = [
  { id: "all", label: "Semua Galeri" },
  { id: "image", label: "Foto" },
  { id: "video", label: "Video" },
];

// --- HELPER 1: Deteksi Tipe (Fallback) ---
const getMediaTypeFromUrl = (url: string): "video" | "image" => {
  if (!url) return "image";
  const extension = url.split('.').pop()?.toLowerCase();
  const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi'];
  
  if (extension && videoExts.includes(extension)) {
    return "video";
  }
  return "image";
};

// --- HELPER 2: Generate Thumbnail Cloudinary (BARU & PENTING) ---
const getVideoThumbnail = (url: string) => {
  if (!url) return "";
  
  // 1. Cek apakah ini URL dari Cloudinary
  if (url.includes("cloudinary.com")) {
    // Ganti ekstensi video (misal .mp4) menjadi .jpg
    // Cloudinary otomatis akan mengambil frame tengah sebagai cover
    return url.replace(/\.(mp4|webm|ogg|mov|mkv|avi)$/i, ".jpg");
  }

  // 2. Jika bukan Cloudinary, biarkan kosong (browser akan coba ambil frame ke-0)
  return undefined;
};

export default function Documentation() {
  const [items, setItems] = useState<DocumentationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<DocumentationItem | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await api.get("/konten/public/dokumentasi/");
        const data = res.data.results ? res.data.results : res.data;
        setItems(data);
      } catch (error) {
        console.error("Gagal load galeri", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    let type = item.media_type;
    if (!type || type === 'unknown') {
        type = getMediaTypeFromUrl(item.media_url);
    }
    return type.toLowerCase() === filter;
  });

  return (
    <section className="py-24 bg-white dark:bg-slate-950" id="dokumentasi">
      <div className="container mx-auto px-6">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-yellow-600 font-bold tracking-wider uppercase text-sm mb-2 block">
            Galeri & Portfolio
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
            Jejak Perjalanan <span className="text-red-700">Kami</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Rekaman momen terbaik bersama CV. Niaga Karya Mandiri.
          </p>
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${
                filter === cat.id
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                  : "bg-transparent text-slate-500 border-slate-200 hover:border-slate-400 dark:border-slate-800 dark:text-slate-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
          </div>
        ) : (
          /* GRID GALLERY */
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => {
                const finalType = (!item.media_type || item.media_type === 'unknown') 
                    ? getMediaTypeFromUrl(item.media_url) 
                    : item.media_type;

                return (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="group relative aspect-video rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl bg-gray-100 dark:bg-slate-800"
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* LOGIKA TAMPILAN THUMBNAIL */}
                    {finalType === 'video' ? (
                      <div className="w-full h-full relative bg-black">
                        {/* UPDATE DISINI: Menambahkan Poster & trik URL */}
                        <video 
                          // Trik 1: Tambah #t=0.1 agar browser mengambil detik ke-0.1 (bukan detik 0 yg hitam)
                          src={`${item.media_url}#t=0.1`} 
                          // Trik 2: Gunakan fungsi poster Cloudinary (.jpg)
                          poster={getVideoThumbnail(item.media_url)}
                          className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" 
                          muted 
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Play className="w-10 h-10 text-white opacity-80" />
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={item.media_url}
                        alt={item.judul}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    
                    {/* Overlay Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4 text-center z-10">
                      <div className="mb-2 p-3 bg-white/20 backdrop-blur-sm rounded-full">
                        {finalType === "video" ? <Play className="w-8 h-8 fill-white" /> : <ZoomIn className="w-8 h-8" />}
                      </div>
                      <h3 className="font-bold text-sm md:text-base drop-shadow-md line-clamp-1">{item.judul}</h3>
                    </div>

                    {/* Icon Badge Type */}
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white p-1.5 rounded-lg z-10">
                      {finalType === "video" ? <Film className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredItems.length === 0 && (
            <div className="text-center py-20 text-slate-400">
                Belum ada dokumentasi untuk kategori ini.
            </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full z-50 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <div 
              className="relative w-full max-w-5xl h-auto max-h-[90vh] flex flex-col items-center justify-center rounded-xl overflow-hidden bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              {((!selectedItem.media_type || selectedItem.media_type === 'unknown') 
                  ? getMediaTypeFromUrl(selectedItem.media_url) 
                  : selectedItem.media_type) === "video" ? (
                <div className="w-full aspect-video bg-black">
                  <video
                    src={selectedItem.media_url}
                    controls
                    autoPlay
                    // Di modal juga pakai poster agar saat loading tidak hitam
                    poster={getVideoThumbnail(selectedItem.media_url)}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="relative flex justify-center items-center w-full h-full">
                   <Image
                    src={selectedItem.media_url}
                    alt={selectedItem.judul}
                    width={1200}
                    height={800}
                    className="w-auto h-auto max-h-[80vh] max-w-full object-contain"
                    priority
                  />
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 text-white text-center md:text-left">
                <h3 className="text-xl font-bold drop-shadow-lg">{selectedItem.judul}</h3>
                <p className="text-gray-300 text-sm mt-1 drop-shadow-md line-clamp-2">
                  {selectedItem.deskripsi}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}