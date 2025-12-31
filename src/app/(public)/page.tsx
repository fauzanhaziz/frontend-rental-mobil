import { Suspense } from "react";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import PopularCars from "@/components/PopularCars";
import { Car } from "@/types";
// import { Testimonials } from "@/components/Testimonials";
// import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import BlogSection from "@/components/BlogSection";
import { LoadingCarAnimation } from "@/components/LoadingCarAnimation";
import LocationSection from "@/components/LocationSection";
import Documentation from "@/components/Documentation";

// 2. FUNGSI FETCH DATA (Menggunakan tipe Car yang diimport)
async function getFeaturedCars(): Promise<Car[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  
  try {
    const res = await fetch(`${apiUrl}/mobil/rekomendasi/`, {
      cache: "no-store", // Pastikan data selalu fresh
    });

    if (!res.ok) {
      throw new Error("Gagal mengambil data mobil");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching cars:", error);
    return []; // Return array kosong agar tidak crash
  }
}

export default async function HomePage() {
  const cars = await getFeaturedCars();

  // Schema JSON-LD untuk Organisasi
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Rental Mobil Padang",
    "url": "https://rentalmobil.id",
    "logo": "https://rentalmobil.id/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+6281234567890",
      "contactType": "customer service"
    }
  };

  // 3. MAPPING DATA KE SCHEMA (Menggunakan tipe Car yang diimport)
  const productSchema = cars.map((car: Car) => ({
    "@type": "Product",
    "name": `Sewa ${car.nama_mobil}`,
    "image": car.gambar_url || "https://rentalmobil.id/images/placeholder.jpg",
    "description": `Sewa mobil ${car.nama_mobil} ${car.transmisi_display} di Padang. Kapasitas ${car.kapasitas_kursi} orang.`,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "IDR",
      // Konversi ke string/number aman karena interface Car sudah support keduanya
      "price": car.harga_per_hari,
      "availability": "https://schema.org/InStock"
    }
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      ...productSchema
    ]
  };

  return (
    <main className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero />
      
      <Features />

      {/* 4. SUSPENSE DENGAN LOADING ANIMATION */}
      <Suspense fallback={<div className="py-20"><LoadingCarAnimation /></div>}>
        <PopularCars initialData={cars} />
      </Suspense>
      <Documentation />

      {/*<Testimonials />}*/}

      <BlogSection />
      
      <FAQ />

      <LocationSection />

      <CTA />
    </main>
  );
}