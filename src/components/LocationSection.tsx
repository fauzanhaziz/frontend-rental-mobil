"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LocationSection() {
  // Ganti URL ini dengan URL Embed Google Maps bisnis Anda
  // Caranya: Buka Google Maps -> Cari lokasi Anda -> Klik Share -> Embed a map -> Copy link di dalam src="..."
  const googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.327349426422!2d100.39644849999999!3d-0.8988628!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2fd4bb667aaff1ab%3A0x78931cac41a9f9b0!2sNKM%20Auto%20Rental%20Padang!5e0!3m2!1sen!2sid!4v1764756371931!5m2!1sen!2sid";

  const googleMapsDirectLink = "https://maps.app.goo.gl/placeholder";

  return (
    <section className="py-20 bg-white dark:bg-slate-950 relative overflow-hidden">
      <div className="container mx-auto px-4">
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* --- KOLOM KIRI: INFORMASI --- */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                Kunjungi Kantor Kami
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Ingin melihat unit secara langsung? Silakan datang ke kantor kami. Tim kami siap melayani kebutuhan transportasi Anda.
              </p>
            </div>

            <div className="space-y-6">
              
              {/* Alamat */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Alamat Lengkap</h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    NKM Auto Rental Padang, Sungai Sapih,<br />
                    Kec. Kuranji, Kota Padang,<br />
                    Sumatera Barat, Indonesia
                  </p>
                </div>
              </div>

              {/* Jam Operasional */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shrink-0">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Jam Operasional</h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Senin - Minggu: 07:00 - 22:00 WIB<br />
                    <span className="text-sm text-slate-500">(Layanan Chat WA 24 Jam)</span>
                  </p>
                </div>
              </div>

              {/* Kontak */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg shrink-0">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Kontak</h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 font-mono">
                    +62 813-6533-8011
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-4">
              <a href={googleMapsDirectLink} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 gap-2 shadow-lg">
                  <Navigation className="w-4 h-4" />
                  Petunjuk Arah Google Maps
                </Button>
              </a>
            </div>
          </motion.div>

          {/* --- KOLOM KANAN: PETA (IFRAME) --- */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-[400px] lg:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <iframe
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 grayscale-[20%] hover:grayscale-0 transition-all duration-500"
              title="Lokasi Rental Mobil Padang"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}