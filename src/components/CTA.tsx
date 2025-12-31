"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section
      id="cta"
      className="py-20 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-white"
      itemScope
      itemType="https://schema.org/Action"
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold mb-4 drop-shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          Siap Memulai Perjalanan Anda?
        </motion.h2>

        <p className="mb-8 text-yellow-50 text-lg leading-relaxed">
          Pesan sekarang dan nikmati layanan sewa mobil cepat dan terpercaya.
          Armada kami siap menemani perjalanan Anda kapan saja.
        </p>

        {/* Tombol CTA */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-gray-800 hover:shadow-lg transition-all duration-300"
          >
            🚗 Sewa Sekarang
          </Link>
          <Link
            href="/mobil"
            className="border border-white text-white px-8 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors duration-300"
          >
            Lihat Semua Mobil
          </Link>
        </div>
      </div>
    </section>
  );
}
