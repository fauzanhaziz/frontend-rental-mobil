// src/types/index.ts

export interface Car {
  id: number;
  nama_mobil: string;
  merk: string;
  jenis?: string;
  harga_per_hari: string | number;
  gambar_url: string | null;
  transmisi_display: string;
  kapasitas_kursi: number;
  status: string;
  popularity?: string;
  tahun?: number;
  dengan_supir?: boolean;
}