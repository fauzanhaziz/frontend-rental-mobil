import { Metadata } from "next";
import { 
  ShieldCheck, Users, Clock, Wrench, Award, 
  Briefcase, Building2, Car, CheckCircle2, Instagram, Facebook 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tentang Kami - CV. Niaga Karya Mandiri",
  description: "Profil perusahaan CV. Niaga Karya Mandiri (NKM Auto Rental), penyedia jasa sewa mobil terpercaya di Padang sejak 2017.",
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      
      {/* === HERO SECTION === */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/80 z-10" />
        {/* Ganti gambar background sesuai keinginan */}
        <div className="absolute inset-0 bg-slate-800 bg-cover bg-center" />
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-bold mb-4 border border-yellow-500/50">
            ESTABLISHED 2017
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            CV. NIAGA <span className="text-red-500">KARYA MANDIRI</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Mitra transportasi terpercaya di Kota Padang dengan komitmen pelayanan sepenuh hati dan profesionalitas tinggi.
          </p>
        </div>
      </section>

      {/* === PROFIL PERUSAHAAN === */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Sekilas Tentang <span className="text-blue-600">NKM Auto Rental</span>
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>NKM Auto Rental</strong> adalah perusahaan penyedia sewa mobil dan tour travel yang berdiri sejak tahun 2017. 
                Pada tahun 2021, kami resmi terdaftar secara legal sebagai perusahaan Rental Mobil di Kota Padang dengan nama 
                <strong> CV. Niaga Karya Mandiri</strong>.
              </p>
              <p>
                Kami bergerak khusus menangani persewaan mobil, baik untuk jangka pendek (<em>Short Term</em>) maupun 
                jangka panjang (<em>Long Term</em>). Didirikan dengan komitmen untuk memberikan kepuasan sempurna 
                melalui pelayanan yang sepenuh hati.
              </p>
              <p>
                Selain sewa mobil, kami juga melayani pengaturan perjalanan wisata, reservasi hotel, 
                wisata petualangan, hingga layanan outbond untuk perusahaan dan instansi.
              </p>
            </div>

            {/* INFO TAMBAHAN: Legalitas & Sosmed */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <Building2 className="text-blue-600 h-5 w-5" />
                <span className="font-bold text-slate-800 dark:text-white">Resmi & Legal</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <Car className="text-blue-600 h-5 w-5" />
                <span className="font-bold text-slate-800 dark:text-white">Armada Prima</span>
              </div>

              {/* Link Sosmed */}
              <div className="flex gap-3 ml-auto sm:ml-0">
                <Link 
                  href="https://instagram.com/" 
                  target="_blank"
                  className="p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 transition-colors text-slate-600 dark:text-slate-400"
                >
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link 
                  href="https://facebook.com/" 
                  target="_blank"
                  className="p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors text-slate-600 dark:text-slate-400"
                >
                  <Facebook className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Image Area */}
          <div className="relative h-[400px] bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <div className="text-slate-400 dark:text-slate-500 text-center p-6">
               <Car className="w-20 h-20 mx-auto mb-4 opacity-50" />
               <p className="font-medium">Foto Kantor / Armada</p>
               <p className="text-sm mt-2">Jl. Raya Balai Baru, Kec. Kuranji, Kota Padang</p>
            </div>
          </div>
        </div>
      </section>

      {/* === VISI & MISI === */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Visi */}
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-6">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Visi Kami</h3>
              <p className="text-slate-300 leading-relaxed italic">
                &quot;Menjadi yang terdepan dalam pelayanan penyedia jasa transportasi di kota Padang & 
                di kota besar lainnya serta mampu berkembang dan bersaing di tingkat global.&quot;
              </p>
            </div>

            {/* Misi */}
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Misi Kami</h3>
              <p className="text-slate-300 leading-relaxed italic">
                &quot;Meningkatkan dan Memajukan pelayanan di bidang transportasi baik dari sektor 
                Pemerintahan maupun Sektor Pariwisata dan Sektor Swasta.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === MENGAPA MEMILIH KAMI === */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Mengapa Memilih <span className="text-blue-600">NKM Rental?</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Kami menawarkan keunggulan kompetitif untuk menjamin kenyamanan dan keamanan perjalanan Anda.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors group">
              <div className="w-12 h-12 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <item.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === KLIEN KAMI === */}
      <section className="py-20 bg-slate-100 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Dipercaya Oleh Instansi & Perusahaan
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Pengalaman kerjasama jangka pendek maupun panjang.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {clients.map((client, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center justify-center text-center h-24 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 line-clamp-2">
                  {client}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section className="py-20 container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Siap untuk Perjalanan Anda?
        </h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/mobil" className="w-full sm:w-auto">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full">
              Lihat Armada
            </Button>
          </Link>
          <Link href="https://wa.me/6281365338011" target="_blank" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full">
              Hubungi Admin
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}

// --- DATA CONTENT ---

const features = [
  {
    icon: Car,
    title: "Kondisi Prima",
    desc: "Armada maksimal berusia 5 tahun, terawat rutin, dan selalu dalam kondisi bersih."
  },
  {
    icon: Users,
    title: "Driver Profesional",
    desc: "Pengemudi terlatih, sopan, menguasai wilayah, dan berlisensi resmi."
  },
  {
    icon: ShieldCheck,
    title: "Aman & Terlindungi",
    desc: "Seluruh armada dilindungi oleh asuransi All Risk untuk ketenangan Anda."
  },
  {
    icon: Clock,
    title: "Layanan 24 Jam",
    desc: "Dukungan bantuan darurat dan pelayanan pelanggan siap sedia."
  },
  {
    icon: Wrench,
    title: "Mobil Pengganti",
    desc: "Jaminan unit pengganti segera jika terjadi kendala teknis di perjalanan."
  },
  {
    icon: CheckCircle2,
    title: "Harga Kompetitif",
    desc: "Tarif bersaing yang dapat disesuaikan dengan anggaran perusahaan Anda."
  }
];

const clients = [
  "PT. Pelabuhan Indonesia II (Persero)",
  "Kementrian Dalam Negeri (Kemendagri)",
  "Komisi Pemberantas Korupsi (KPK)",
  "Dinas PUPR Sumatera Barat",
  "PT. Pos Indonesia Sumbar",
  "PLTU Teluk Sirih",
  "Kemenag Kota Padang",
  "Unilever Indonesia",
  "Dinas Pendidikan Sumbar",
  "Perum Damri",
  "Event MTQ Nasional",
  "Ikatan Dokter Indonesia (IDI)"
];