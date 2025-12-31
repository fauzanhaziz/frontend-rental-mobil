// src/components/BlogSection.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import JsonLd from "@/components/JsonLd";

const posts = [
  {
    id: "tips-merawat-mobil",
    title: "5 Tips Merawat Mobil Saat Liburan Panjang",
    excerpt:
      "Persiapan kecil sebelum roadtrip dapat menjaga kenyamanan dan mencegah gangguan. Simak 5 tips praktis ini.",
    cover: "/images/blog1.jpg",
    datePublished: "2024-12-01",
    author: "CV. Niaga Karya Mandiri",
  },
  {
    id: "pilih-mobil-untuk-keluarga",
    title: "Cara Memilih Mobil Keluarga yang Tepat",
    excerpt:
      "Ingin kenyamanan dan keamanan? Pelajari fitur penting sebelum memilih mobil keluarga.",
    cover: "/images/blog2.jpg",
    datePublished: "2024-12-10",
    author: "CV. Niaga Karya Mandiri",
  },
];

export default function BlogSection() {
  // === JSON-LD Schema untuk semua artikel ===
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Artikel & Tips Berkendara - RentalMobil.id",
    url: "https://rentalmobil.id/blog",
    description:
      "Artikel seputar tips berkendara, perawatan mobil, dan panduan memilih mobil keluarga dari RentalMobil.id.",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      image: `https://rentalmobil.id${post.cover}`,
      url: `https://rentalmobil.id/blog/${post.id}`,
      author: {
        "@type": "Organization",
        name: post.author,
      },
      publisher: {
        "@type": "Organization",
        name: "RentalMobil.id",
        logo: {
          "@type": "ImageObject",
          url: "https://rentalmobil.id/images/logo.png",
        },
      },
      datePublished: post.datePublished,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://rentalmobil.id/blog/${post.id}`,
      },
    })),
  };

  return (
    <section
      id="blog"
      className="py-20 bg-neutral-50 text-gray-900"
      itemScope
      itemType="https://schema.org/Blog"
    >
      {/* === Tambahkan JSON-LD di sini === */}
      <JsonLd jsonld={blogSchema} />

      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Artikel & Tips Berkendara
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((p) => (
            <article
              key={p.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              itemScope
              itemType="https://schema.org/BlogPosting"
            >
              <Link href={`/blog/${p.id}`} className="block md:flex">
                <div className="md:w-44 relative h-48 md:h-auto flex-shrink-0">
                  <Image
                    src={p.cover}
                    alt={p.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={false}
                  />
                </div>
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <h3
                      className="text-xl font-semibold mb-2"
                      itemProp="headline"
                    >
                      {p.title}
                    </h3>
                    <p
                      className="text-sm text-gray-600 mb-4 line-clamp-3"
                      itemProp="description"
                    >
                      {p.excerpt}
                    </p>
                  </div>
                  <span className="text-yellow-600 font-medium">
                    Baca Selengkapnya →
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
