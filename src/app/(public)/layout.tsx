import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";

// ✅ Metadata SEO tingkat "section" (otomatis digabung dengan global metadata dari root layout)
export const metadata = {
  title: {
    default: "Rental Mobil Padang — Sewa Mobil Murah & Terpercaya",
    template: "%s | RentalMobil.id",
  },
  description:
    "Sewa mobil di Padang dengan mudah dan cepat. Armada lengkap, harga hemat, dan pelayanan profesional.",
  keywords: [
    "rental mobil Padang",
    "sewa mobil murah",
    "rental avanza Padang",
    "rental mobil keluarga",
    "rental mobil harian Padang",
  ],
  openGraph: {
    title: "Rental Mobil Padang — Sewa Mobil Murah & Terpercaya",
    description:
      "Sewa mobil di Padang dengan mudah dan cepat. Armada lengkap, harga hemat, dan pelayanan profesional.",
    url: "https://rentalmobil.id",
    siteName: "RentalMobil.id",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rental Mobil Padang",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@rentalmobilid",
    title: "Sewa Mobil Padang | RentalMobil.id",
    description:
      "Platform sewa mobil terpercaya di Padang — harga terjangkau & sopir profesional.",
    images: ["/images/og-image.jpg"],
  },
  alternates: {
    canonical: "https://rentalmobil.id",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

// ✅ Layout khusus untuk halaman publik
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // === JSON-LD GLOBAL (struktur bisnis dan situs) ===
  const globalJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://rentalmobil.id/#organization",
        name: "CV. Niaga Karya Mandiri",
        url: "https://rentalmobil.id",
        logo: {
          "@type": "ImageObject",
          url: "https://rentalmobil.id/images/logo.png",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+62-812-3456-7890",
          contactType: "customer service",
          areaServed: "ID",
          availableLanguage: ["Indonesian"],
        },
        sameAs: [
          "https://facebook.com/rentalmobilpadang",
          "https://instagram.com/rentalmobilpadang",
          "https://www.youtube.com/@rentalmobilpadang",
          "https://goo.gl/maps/xxxx",
          "https://www.linkedin.com/company/rentalmobilid/",
        ],
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://rentalmobil.id/#business",
        name: "RentalMobil Padang",
        url: "https://rentalmobil.id",
        logo: "https://rentalmobil.id/images/logo.png",
        image: "https://rentalmobil.id/images/og-image.jpg",
        description:
          "Penyedia jasa sewa mobil murah dan terpercaya di Padang dengan armada lengkap & layanan 24 jam.",
        telephone: "+62-812-3456-7890",
        priceRange: "Rp300.000 - Rp1.000.000",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Jl. Khatib Sulaiman No.15",
          addressLocality: "Padang",
          addressRegion: "Sumatera Barat",
          postalCode: "25112",
          addressCountry: "ID",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: -0.9471,
          longitude: 100.4172,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Beranda",
            item: "https://rentalmobil.id",
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://rentalmobil.id/#website",
        name: "RentalMobil.id",
        url: "https://rentalmobil.id",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://rentalmobil.id/cari?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <JsonLd jsonld={globalJsonLd} />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
