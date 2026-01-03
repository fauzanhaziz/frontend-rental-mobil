"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import Link from "next/link";
import { Car, Loader2, ArrowDown } from "lucide-react";
import Head from "next/head";
import api from "@/lib/axios";

// --- KONFIGURASI STATIC ---
const ADMIN_PHONE = "6281365338011"; 
const WA_MESSAGE = "Halo Admin CV. Niaga Karya Mandiri, saya ingin melakukan Booking Mobil.";
const WA_LINK = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(WA_MESSAGE)}`;

// Interface Data
interface HeroData {
  id: number;
  judul: string;
  sub_judul: string;
  media_url: string;
  // Ubah jadi string agar aman jika backend kirim "unknown"
  media_type?: string; 
  urutan: number;
}

// Fallback Default (Jika database kosong/error)
const defaultSlides: HeroData[] = [
  {
    id: 1,
    judul: "Rental Mobil Terpercaya Skala Global",
    sub_judul: "Layanan transportasi premium tidak hanya di Padang, tapi menjangkau seluruh kota besar di Indonesia hingga kebutuhan internasional.",
    media_url: "/videos/mobil1.mp4", // Pastikan file ini ada di folder public/videos/
    media_type: 'video',
    urutan: 1
  }
];

// --- HELPER: Deteksi Tipe Manual (Sama seperti Documentation) ---
const getMediaTypeFromUrl = (url: string): "video" | "image" => {
  if (!url) return "image";
  const extension = url.split('.').pop()?.toLowerCase();
  // Daftar ekstensi video
  const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi'];
  
  if (extension && videoExts.includes(extension)) {
    return "video";
  }
  return "image";
};

export default function Hero() {
  const [heroList, setHeroList] = useState<HeroData[]>([]);
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldLoadMedia, setShouldLoadMedia] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // 1. FETCH DATA (LIST)
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await api.get('/konten/public/hero/');
        
        // PERBAIKAN 1: Handle Pagination (results) vs Array Biasa
        const data = res.data.results ? res.data.results : res.data;
        const dataArray = Array.isArray(data) ? data : [data];
        
        // Urutkan berdasarkan 'urutan' dari backend
        const sortedData = dataArray.sort((a: HeroData, b: HeroData) => a.urutan - b.urutan);
        
        // Filter hanya yang punya media_url
        const validData = sortedData.filter((item: HeroData) => item.media_url);

        if (validData.length > 0) {
          setHeroList(validData);
        } else {
          setHeroList(defaultSlides);
        }
      } catch (error) {
        console.warn("Gagal load hero, pakai default.", error);
        setHeroList(defaultSlides);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHero();
  }, []);

  // 2. AUTO SLIDE (15 Detik)
  useEffect(() => {
    if (heroList.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroList.length);
    }, 15000); 
    return () => clearInterval(timer);
  }, [heroList.length]);

  // 3. LAZY LOAD OBSERVER
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setShouldLoadMedia(true); },
      { threshold: 0.1 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // Navigasi Manual
  const nextSlide = () => setIndex((prev) => (prev + 1) % heroList.length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + heroList.length) % heroList.length);

  // Ambil Data Aktif
  const activeData = heroList[index] || defaultSlides[0];

  // PERBAIKAN 2: Tentukan tipe media final (Backend vs URL Detection)
  const finalType = (!activeData.media_type || activeData.media_type === 'unknown') 
    ? getMediaTypeFromUrl(activeData.media_url) 
    : activeData.media_type;

  // Variasi Animasi
  const mediaVariants = {
    enter: { opacity: 0, scale: 1.05 },
    center: { opacity: 1, scale: 1, transition: { duration: 1.5, ease: easeInOut } },
    exit: { opacity: 0, scale: 1.02, transition: { duration: 1.5, ease: easeInOut } },
  };

  const textVariants = {
    enter: { opacity: 0, y: 30 },
    center: { opacity: 1, y: 0, transition: { duration: 1.0, ease: easeInOut, delay: 0.3 } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.8, ease: easeInOut } },
  };

  return (
    <>
      <Head>
        <link rel="canonical" href="https://rentalmobil.id/" />
        {/* SEO SCHEMA */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "CV. Niaga Karya Mandiri",
              "url": "https://rentalmobil.id",
              "description": activeData.sub_judul,
            }),
          }}
        />
      </Head>

      <header
        ref={heroRef}
        className="relative h-screen overflow-hidden bg-slate-900 group"
        role="banner"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black">
            <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
          </div>
        )}

        {/* --- BACKGROUND MEDIA --- */}
        <AnimatePresence mode="popLayout">
          {shouldLoadMedia && (
            <motion.div
              key={activeData.id} // Re-render jika ID berubah
              variants={mediaVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full"
            >
              {/* PERBAIKAN 3: Gunakan finalType untuk render */}
              {finalType === 'video' ? (
                <video
                  className="w-full h-full object-cover"
                  src={activeData.media_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  crossOrigin="anonymous" // PENTING untuk Cloudinary
                  poster="/images/placeholder-video.jpg"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={activeData.media_url} 
                  alt={activeData.judul}
                  className="w-full h-full object-cover"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay Gelap */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-10" />

        {/* --- TEXT CONTENT --- */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6 md:px-20 z-20 h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeData.id + "-text"}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-xl tracking-tight leading-tight">
                {activeData.judul}
              </h1>
              
              <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed max-w-2xl mx-auto">
                {activeData.sub_judul}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="mobil"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3.5 rounded-full text-lg font-bold shadow-lg shadow-yellow-500/30 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Car className="w-5 h-5" />
                  Lihat Armada
                </Link>
                
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white hover:text-slate-900 text-white px-8 py-3.5 rounded-full text-lg font-semibold transition-all hover:scale-105 flex items-center gap-2"
                >
                  Booking via WA
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- NAVIGATION: MOBIL ICON BUTTONS --- */}
        {heroList.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-5 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 p-3 rounded-full text-yellow-400 transition-all duration-300 group backdrop-blur-sm"
              aria-label="Previous Slide"
            >
              <Car className="w-8 h-8 scale-x-[-1] group-hover:-translate-x-1 transition-transform duration-300" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-5 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 p-3 rounded-full text-yellow-400 transition-all duration-300 group backdrop-blur-sm"
              aria-label="Next Slide"
            >
              <Car className="w-8 h-8 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            {/* --- INDICATORS (DOTS) --- */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex gap-3">
              {heroList.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? "bg-yellow-500 w-8" : "bg-white/50 w-2 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* --- SCROLL INSTRUCTION --- */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-white/70"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll Down</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="w-5 h-5 text-yellow-400" />
          </motion.div>
        </motion.div>

      </header>
    </>
  );
}