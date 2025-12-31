"use client";

import { useEffect } from "react";

/**
 * Komponen untuk menyisipkan JSON-LD (structured data) ke <head>.
 * SEO-friendly dan 100% valid di Next.js 15 + TypeScript.
 */
export default function JsonLd({
  jsonld,
}: {
  jsonld: Record<string, unknown>;
}) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonld);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [jsonld]);

  return null;
}
