import { Metadata } from "next";
import { 
  FileText,  Users, Clock, Shield, 
  CheckCircle2, AlertCircle 
} from "lucide-react";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan - CV. Niaga Karya Mandiri",
  description: "Informasi lengkap mengenai syarat sewa mobil lepas kunci, dengan supir, dan dokumen yang diperlukan.",
};

export default function TermsPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-20">
      
      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-20 text-center px-4">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Syarat & Ketentuan</h1>
        <p className="text-slate-300 max-w-xl mx-auto">
          Mohon baca dengan seksama persyaratan sewa kendaraan di CV. Niaga Karya Mandiri demi kenyamanan bersama.
        </p>
      </div>

      <div className="container mx-auto px-4 -mt-10">
        
        {/* 1. Dokumen Persyaratan */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 md:p-12 mb-8 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <FileText className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dokumen Persyaratan</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" /> Perorangan / Pribadi
              </h3>
              <ul className="space-y-3">
                {personalDocs.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" /> Perusahaan / Instansi
              </h3>
              <ul className="space-y-3">
                {corpDocs.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 2. Jenis Layanan */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-yellow-500" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sewa Jangka Pendek</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Layanan sewa untuk kebutuhan di bawah 1 bulan. Cocok untuk wisata, perjalanan dinas singkat, atau acara keluarga. Hitungan bisa harian, mingguan, atau per jam sesuai kesepakatan.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-green-500" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sewa Jangka Panjang</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Kontrak sewa minimal 1 bulan hingga tahunan. Solusi hemat untuk operasional perusahaan. Termasuk jaminan perawatan rutin, perpanjangan STNK, dan mobil pengganti jika ada kerusakan.
            </p>
          </div>
        </div>

        {/* 3. Ketentuan Pembayaran */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ketentuan Pembayaran</h3>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-2">
                <li>Pembayaran dapat dilakukan melalui Transfer Bank atau Tunai di kantor.</li>
                <li>Untuk booking tanggal, diperlukan Down Payment (DP) minimal 30%.</li>
                <li>Pelunasan dilakukan saat serah terima kendaraan (sebelum pemakaian).</li>
                <li>Harga sewa belum termasuk BBM, Tol, Parkir, dan Makan Supir (jika menggunakan supir).</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import { Building2 } from "lucide-react";

// Data Dokumen (Dari PDF Halaman 8)
const personalDocs = [
  "KTP Asli (Wajib)",
  "SIM A (Untuk Lepas Kunci)",
  "Kartu Keluarga (KK)",
  "Kartu Mahasiswa (Jika Mahasiswa)",
  "Paspor (Bagi WNA)"
];

const corpDocs = [
  "NPWP Perusahaan",
  "SIUP / TDP / NIB",
  "Surat Keterangan Domisili",
  "KTP Direktur / Penanggung Jawab",
  "ID Card Karyawan",
  "Kontrak Notaris (Untuk Sewa Bulanan/Tahunan)"
];