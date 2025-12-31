"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | RentalMobil",
  description:
    "Pertanyaan umum seputar layanan RentalMobil — mulai dari cara pemesanan, pembayaran, hingga ketentuan penggunaan mobil.",
  openGraph: {
    title: "FAQ | RentalMobil",
    description:
      "Temukan jawaban atas pertanyaan umum tentang layanan sewa mobil, pembayaran, dan kebijakan RentalMobil.",
    url: "https://rentalmobil.id/faq",
    siteName: "RentalMobil",
    type: "website",
  },
};

// Daftar pertanyaan
const faqs = [
  {
    id: 1,
    question: "Bagaimana cara memesan mobil di RentalMobil?",
    answer:
      "Anda dapat memesan langsung melalui website kami. Pilih mobil yang diinginkan, isi data penyewa, lalu konfirmasi pembayaran untuk menyelesaikan pemesanan.",
  },
  {
    id: 2,
    question: "Apakah harga sewa sudah termasuk bensin dan supir?",
    answer:
      "Harga yang tertera belum termasuk bensin dan supir. Namun, Anda bisa menambah layanan supir saat proses pemesanan dengan biaya tambahan yang jelas.",
  },
  {
    id: 3,
    question: "Apakah saya perlu membayar uang muka (DP)?",
    answer:
      "Ya, diperlukan pembayaran uang muka sebesar 30% untuk mengamankan pemesanan. Sisanya dapat dibayar saat pengambilan mobil.",
  },
  {
    id: 4,
    question: "Apakah mobil bisa diantar ke lokasi saya?",
    answer:
      "Tentu! Kami menyediakan layanan antar-jemput mobil sesuai lokasi Anda dengan biaya tambahan tergantung jarak pengantaran.",
  },
];

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null);
  const toggleFAQ = (id: number) =>
    setOpenId(openId === id ? null : id);

  return (
    <section
      id="faq"
      className="py-24 bg-neutral-50 text-gray-900"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="max-w-5xl mx-auto px-6">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold mb-12 text-center tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          itemProp="headline"
        >
          ❓ Pertanyaan Umum
        </motion.h2>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full flex justify-between items-center text-left px-6 py-4 focus:outline-none"
                aria-expanded={openId === faq.id}
              >
                <span
                  className="text-lg font-semibold text-gray-900"
                  itemProp="name"
                >
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-yellow-500 transition-transform ${
                    openId === faq.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {openId === faq.id && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="px-6 pb-4 text-gray-600 text-sm leading-relaxed"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <p itemProp="text">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
