"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CarFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State untuk nilai filter
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [transmisi, setTransmisi] = useState(searchParams.get("transmisi") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  // Fungsi untuk update URL saat filter berubah
  const applyFilter = () => {
    const params = new URLSearchParams();
    
    if (search) params.set("merk", search); // Backend Django filter by 'merk'
    if (transmisi && transmisi !== "all") params.set("transmisi", transmisi);
    if (sort) params.set("ordering", sort === "lowest" ? "harga_per_hari" : "-created_at");

    // Push router agar halaman refresh dengan data baru
    router.push(`/mobil?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm mb-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Search Input */}
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari merk mobil (Toyota, Honda...)" 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
          />
        </div>

        {/* Transmisi Select */}
        <div className="md:col-span-3">
          <Select value={transmisi} onValueChange={setTransmisi}>
            <SelectTrigger>
              <SelectValue placeholder="Transmisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Transmisi</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="matic">Automatic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Select */}
        <div className="md:col-span-2">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="lowest">Termurah</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Button */}
        <div className="md:col-span-2">
          <Button onClick={applyFilter} className="w-full bg-blue-600 hover:bg-blue-700">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Terapkan
          </Button>
        </div>

      </div>
    </div>
  );
}