"use client";

import { motion, Variants } from "framer-motion"; // Tambahkan Variants
import { 
  CarFront, 
  Wallet, 
  UserCheck, 
  PlaneTakeoff, 
  Sparkles 
} from "lucide-react";

// Data Fitur
const features = [
  {
    id: 1,
    icon: <CarFront className="w-8 h-8 text-white" />,
    color: "bg-blue-600",
    title: "Unit Terlengkap & Prima",
    desc: "Pilihan armada beragam mulai dari MPV keluarga hingga Luxury Car. Seluruh unit rutin diservis untuk menjamin keamanan perjalanan Anda.",
  },
  {
    id: 2,
    icon: <UserCheck className="w-8 h-8 text-white" />,
    color: "bg-yellow-500",
    title: "Lepas Kunci / Dengan Supir",
    desc: "Fleksibilitas penuh. Pilih layanan self-drive (lepas kunci) untuk privasi, atau gunakan jasa supir profesional kami yang ramah dan hafal rute.",
  },
  {
    id: 3,
    icon: <PlaneTakeoff className="w-8 h-8 text-white" />,
    color: "bg-red-600",
    title: "Antar Jemput Bandara BIM",
    desc: "Layanan tepat waktu. Kami siap menjemput atau mengantar Anda ke Bandara Internasional Minangkabau (BIM) kapan saja.",
  },
  {
    id: 4,
    icon: <Wallet className="w-8 h-8 text-white" />,
    color: "bg-green-600",
    title: "Harga Transparan & Kompetitif",
    desc: "Tidak ada biaya tersembunyi (hidden fees). Nikmati harga sewa terbaik di Padang dengan fasilitas All-In yang menguntungkan.",
  },
];

// Animasi Stagger
// PENTING: Tambahkan tipe ': Variants' di sini untuk memperbaiki Error Merah
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// PENTING: Tambahkan tipe ': Variants' di sini juga
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  },
};

export default function Features() {
  return (
    <section
      id="fitur-unggulan"
      className="py-24 bg-gray-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300"
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-200/20 dark:bg-yellow-900/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-200/20 dark:bg-red-900/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* JSON-LD untuk SEO Service */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Car Rental",
            "provider": {
              "@type": "Organization",
              "name": "CV. Niaga Karya Mandiri"
            },
            "areaServed": {
              "@type": "City",
              "name": "Padang"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Layanan Rental Mobil",
              "itemListElement": [
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Sewa Mobil Lepas Kunci" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Sewa Mobil Dengan Supir" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Antar Jemput Bandara BIM" } }
              ]
            }
          }),
        }}
      />

      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold mb-4 border border-red-200 dark:border-red-800 uppercase tracking-wider">
              Kenapa Memilih Kami?
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
              Standar Baru <span className="text-yellow-500 underline decoration-red-600 decoration-4 underline-offset-4">Kenyamanan</span> Rental Mobil
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Kami berkomitmen memberikan pengalaman berkendara terbaik di Sumatera Barat dengan pelayanan profesional CV. Niaga Karya Mandiri.
            </p>
          </motion.div>
        </div>

        {/* GRID FEATURES */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((f) => (
            <motion.div
              key={f.id}
              variants={itemVariants}
              // PERBAIKAN: rounded-[2rem] diubah jadi rounded-3xl agar warning hilang
              className="group relative bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-slate-800"
            >
              {/* Icon Circle */}
              <div className={`w-16 h-16 rounded-2xl ${f.color} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {f.desc}
              </p>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}