"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimoni Pelanggan | RentalMobil",
  description:
    "Lihat ulasan nyata dari pelanggan kami yang telah merasakan kemudahan dan kenyamanan layanan RentalMobil di seluruh Indonesia.",
  openGraph: {
    title: "Testimoni Pelanggan | RentalMobil",
    description:
      "Apa kata pelanggan tentang RentalMobil? Layanan cepat, mobil terawat, dan pengalaman menyenangkan setiap perjalanan.",
    url: "https://rentalmobil.id/testimoni",
    siteName: "RentalMobil",
    images: ["/images/testimoni-cover.jpg"],
    type: "website",
  },
};

const testimonials = [
  {
    id: 1,
    name: "Rizky Saputra",
    role: "Karyawan Swasta",
    photo: "/images/user1.jpg",
    rating: 5,
    comment:
      "Proses sewanya cepat banget! Mobil bersih dan nyaman, harga juga transparan tanpa biaya tambahan.",
  },
  {
    id: 2,
    name: "Nadia Prameswari",
    role: "Traveler",
    photo: "/images/user2.jpg",
    rating: 5,
    comment:
      "Sangat puas! Supirnya ramah dan profesional. Perjalanan keluarga jadi lebih menyenangkan.",
  },
  {
    id: 3,
    name: "Andi Gunawan",
    role: "Pengusaha",
    photo: "/images/user3.jpg",
    rating: 4,
    comment:
      "Pelayanan cepat dan mobilnya terawat. Akan sewa lagi untuk perjalanan bisnis berikutnya.",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimoni"
      className="py-24 bg-white text-gray-900"
      itemScope
      itemType="https://schema.org/Review"
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold mb-12 tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          itemProp="headline"
        >
          💬 Apa Kata Pelanggan Kami
        </motion.h2>

        {/* GRID TESTIMONI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <motion.article
              key={t.id}
              className="bg-neutral-50 rounded-3xl shadow-md hover:shadow-xl p-8 flex flex-col items-center text-center transition-all hover:-translate-y-1"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              itemScope
              itemType="https://schema.org/Review"
            >
              <div className="relative mb-5">
                <Image
                  src={t.photo}
                  alt={`Foto ${t.name}`}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                  itemProp="image"
                />
              </div>

              <h3
                className="text-lg font-semibold text-gray-900 mb-1"
                itemProp="author"
              >
                {t.name}
              </h3>
              <p
                className="text-sm text-gray-500 mb-3"
                itemProp="jobTitle"
              >
                {t.role}
              </p>

              {/* Rating Bintang */}
              <div
                className="flex justify-center mb-3"
                itemProp="reviewRating"
                itemScope
                itemType="https://schema.org/Rating"
              >
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < t.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                    }`}
                  />
                ))}
                <meta itemProp="ratingValue" content={t.rating.toString()} />
              </div>

              <p
                className="text-gray-700 text-sm leading-relaxed mb-2 italic"
                itemProp="reviewBody"
              >
                “{t.comment}”
              </p>

              <meta itemProp="datePublished" content="2025-01-10" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
