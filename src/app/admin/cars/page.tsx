"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Search, UploadCloud, Loader2, Star, UserCheck } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch"; // Import Switch
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { toast } from "sonner";
import api from "@/lib/axios";

// --- 1. DEFINISI TIPE DATA (STRICT) ---

type CarStatus = "aktif" | "servis" | "nonaktif";
type CarPopularity = "standard" | "bestseller" | "hotdeal" | "new" | "recommended";

interface Car {
  id: number;
  nama_mobil: string;
  merk: string;
  jenis: string;
  plat_nomor: string;
  tahun: number;
  transmisi: string;
  kapasitas_kursi: number;
  harga_per_hari: string;
  denda_per_jam: string;
  status: CarStatus;
  popularity: CarPopularity;
  dengan_supir: boolean; // FIELD BARU
  gambar_url: string | null;
  keterangan: string;
  created_at?: string;
}

interface CarFormState {
  nama_mobil: string;
  merk: string;
  jenis: string;
  plat_nomor: string;
  tahun: string | number;
  transmisi: string;
  kapasitas_kursi: string | number;
  harga_per_hari: string | number;
  denda_per_jam: string | number;
  status: CarStatus;
  popularity: CarPopularity;
  dengan_supir: boolean; // FIELD BARU
  keterangan: string;
}

interface ApiError {
  response?: {
    data?: {
      plat_nomor?: string[];
      nama_mobil?: string[];
      harga_per_hari?: string[];
      denda_per_jam?: string[];
      detail?: string;
      error?: string;
    };
  };
  message?: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

type ApiResponse<T> = T[] | PaginatedResponse<T>;

// --- 2. INITIAL STATE ---
const initialForm: CarFormState = {
  nama_mobil: "",
  merk: "",
  jenis: "MPV",
  plat_nomor: "",
  tahun: new Date().getFullYear(),
  transmisi: "manual",
  kapasitas_kursi: 4,
  harga_per_hari: "",
  denda_per_jam: "50000",
  status: "aktif",
  popularity: "standard",
  dengan_supir: false, // Default Lepas Kunci
  keterangan: "",
};

// --- 3. HELPER TYPE GUARD ---
function getResults<T>(data: ApiResponse<T>): T[] {
  if (!Array.isArray(data) && 'results' in data) {
    return data.results;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

export default function AdminCarsPage() {
  const { searchTerm: globalSearch } = useSearch();
  
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [search, setSearch] = useState("");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState<CarFormState>(initialForm);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCars = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      const query = search || globalSearch;
      if (query) params.append("merk", query); 
      
      const response = await api.get<ApiResponse<Car>>(`/mobil/?${params.toString()}`);
      const dataList = getResults(response.data);
      setCars(dataList);

    } catch (error: unknown) {
      console.error(error);
      toast.error("Gagal memuat data mobil");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, globalSearch]);

  const handleInputChange = (field: keyof CarFormState, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleAdd = () => {
    setEditingCar(null);
    setFormData(initialForm);
    setImageFile(null);
    setPreviewImage(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setFormData({
      nama_mobil: car.nama_mobil || "", // Jika null, ganti string kosong
      merk: car.merk || "",
      jenis: car.jenis || "MPV",
      plat_nomor: car.plat_nomor || "",
      tahun: car.tahun || new Date().getFullYear(), // Default tahun sekarang jika null
      transmisi: car.transmisi || "manual", // Pastikan ada default value
      kapasitas_kursi: car.kapasitas_kursi || 0,
      
      // Cek dulu apakah ada nilainya sebelum di-parse, jika tidak set 0
      harga_per_hari: car.harga_per_hari ? parseInt(car.harga_per_hari.toString()) : 0,
      denda_per_jam: car.denda_per_jam ? parseInt(car.denda_per_jam.toString()) : 0,
      
      status: car.status || "tersedia",
      popularity: car.popularity || "standard",
      dengan_supir: car.dengan_supir || false,
      keterangan: car.keterangan || "",
    });
    
    setPreviewImage(car.gambar_url || null);
    setImageFile(null);
    setIsDialogOpen(true);
};

  const handleSave = async () => {
    if (!formData.nama_mobil || !formData.harga_per_hari) {
      toast.warning("Nama dan Harga wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      const data = new FormData();
      
      // Append Text Data
      data.append("nama_mobil", formData.nama_mobil);
      data.append("merk", formData.merk);
      data.append("jenis", formData.jenis);
      data.append("plat_nomor", formData.plat_nomor || ""); 
      data.append("transmisi", formData.transmisi);
      data.append("status", formData.status);
      data.append("popularity", formData.popularity);
      data.append("keterangan", formData.keterangan || ""); 
      
      // Append Boolean (Convert to String for Django)
      data.append("dengan_supir", formData.dengan_supir ? "True" : "False");

      // Append Numbers (Safe Convert)
      data.append("tahun", String(formData.tahun || new Date().getFullYear()));
      data.append("kapasitas_kursi", String(formData.kapasitas_kursi || "4"));
      
      const cleanHarga = String(formData.harga_per_hari).replace(/\D/g, '') || "0";
      const cleanDenda = String(formData.denda_per_jam).replace(/\D/g, '') || "0";
      data.append("harga_per_hari", cleanHarga);
      data.append("denda_per_jam", cleanDenda);

      // Append Image
      if (imageFile) {
        data.append("gambar", imageFile);
      }

      if (editingCar) {
        await api.patch(`/mobil/${editingCar.id}/`, data);
        toast.success("Mobil berhasil diperbarui");
      } else {
        await api.post("/mobil/", data);
        toast.success("Mobil berhasil ditambahkan");
      }

      setIsDialogOpen(false);
      fetchCars();

    } catch (error: unknown) {
      console.error("Error Save Mobil:", error);
      
      const err = error as ApiError;
      const errData = err.response?.data;

      let msg = "Gagal menyimpan data mobil";
      if (errData) {
        if (errData.plat_nomor) msg = `Plat Nomor: ${errData.plat_nomor[0]}`;
        else if (errData.nama_mobil) msg = `Nama: ${errData.nama_mobil[0]}`;
        else if (errData.harga_per_hari) msg = `Harga: ${errData.harga_per_hari[0]}`;
        else if (errData.detail) msg = errData.detail;
        else if (typeof errData === 'string') msg = errData;
      }
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus mobil ini?")) {
      try {
        await api.delete(`/mobil/${id}/`);
        toast.success("Mobil berhasil dihapus");
        fetchCars();
      } catch (error: unknown) {
        console.error(error);
        toast.error("Gagal menghapus mobil");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Kelola Mobil</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Total {cars.length} armada terdaftar
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Tambah Mobil Baru
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari berdasarkan nama atau merk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
           <div className="flex justify-center p-12">
             <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
           </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Foto</TableHead>
                    <TableHead>Info Mobil</TableHead>
                    <TableHead>Plat Nomor</TableHead>
                    <TableHead>Kapasitas</TableHead> 
                    <TableHead>Tipe Sewa</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Tarif / Hari</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {cars.map((car) => (
                    <TableRow key={car.id}>
                    <TableCell>
                        <div className="w-16 h-12 rounded bg-slate-100 overflow-hidden relative">
                        <ImageWithFallback
                            src={car.gambar_url || "/images/placeholder-car.jpg"}
                            alt={car.nama_mobil}
                            className="w-full h-full object-cover"
                        />
                        </div>
                    </TableCell>
                    <TableCell>
                        <p className="font-medium text-slate-900 dark:text-white">{car.nama_mobil}</p>
                        <p className="text-xs text-slate-500">{car.merk} • {car.tahun} • {car.transmisi}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{car.plat_nomor || "-"}</TableCell>
                    <TableCell className="text-sm">{car.kapasitas_kursi} Kursi</TableCell>

                    {/* KOLOM TIPE SEWA (ALL IN / LEPAS KUNCI) */}
                    <TableCell>
                        {car.dengan_supir ? (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200">
                                <UserCheck className="w-3 h-3 mr-1" /> All In
                            </Badge>
                        ) : (
                            <span className="text-xs text-slate-500">Lepas Kunci</span>
                        )}
                    </TableCell>

                    <TableCell>
                        {car.popularity && car.popularity !== 'standard' && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 capitalize">
                                <Star className="w-3 h-3 mr-1" />
                                {car.popularity.replace('_', ' ')}
                            </Badge>
                        )}
                    </TableCell>
                    <TableCell>Rp {Number(car.harga_per_hari).toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                        <Badge
                        variant="outline"
                        className={
                            car.status === "aktif"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : car.status === "servis"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }
                        >
                        {car.status === "aktif" ? "Ready" : car.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(car)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(car.id)} className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* --- DIALOG FORM --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-800 sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCar ? "Edit Data Mobil" : "Tambah Mobil Baru"}</DialogTitle>
            <DialogDescription>Lengkapi informasi armada di bawah ini.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            
            {/* Foto Upload */}
            <div 
              className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewImage} alt="Preview" className="h-32 object-contain rounded" />
              ) : (
                <div className="text-center text-slate-500">
                  <UploadCloud className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">Klik untuk upload foto mobil</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Mobil</Label>
                <Input value={formData.nama_mobil} onChange={(e) => handleInputChange("nama_mobil", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Merk</Label>
                <Input value={formData.merk} onChange={(e) => handleInputChange("merk", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Label Popularitas</Label>
                    <Select value={formData.popularity} onValueChange={(val: CarPopularity) => handleInputChange("popularity", val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="standard">Standard (Polos)</SelectItem>
                            <SelectItem value="bestseller">⭐ Best Seller</SelectItem>
                            <SelectItem value="hotdeal">🔥 Hot Deal</SelectItem>
                            <SelectItem value="new">✨ New Arrival</SelectItem>
                            <SelectItem value="recommended">👍 Rekomendasi</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Plat Nomor</Label>
                    <Input value={formData.plat_nomor} onChange={(e) => handleInputChange("plat_nomor", e.target.value)} placeholder="Opsional" />
                </div>
            </div>

            {/* --- OPSI BARU: ALL IN DRIVER (SWITCH) --- */}
            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div className="flex flex-col">
                    <Label className="text-base font-semibold flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        Paket All In (Dengan Supir)
                    </Label>
                    <span className="text-xs text-slate-500">Jika aktif, harga sewa sudah termasuk supir & BBM.</span>
                </div>
                <Switch 
                    checked={formData.dengan_supir} 
                    onCheckedChange={(val) => handleInputChange("dengan_supir", val)} 
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Jenis</Label>
                <Select value={formData.jenis} onValueChange={(val) => handleInputChange("jenis", val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MPV">MPV</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="City Car">City Car</SelectItem>
                    <SelectItem value="Hatchback">Hatchback</SelectItem>
                    <SelectItem value="Minibus">Minibus</SelectItem>
                    <SelectItem value="Bus">Bus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Transmisi</Label>
                <Select value={formData.transmisi} onValueChange={(val) => handleInputChange("transmisi", val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="matic">Automatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kapasitas Kursi</Label>
                <Input 
                    type="number" 
                    value={formData.kapasitas_kursi} 
                    onChange={(e) => handleInputChange("kapasitas_kursi", e.target.value)} 
                    placeholder="4"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <div className="space-y-2">
                 <Label>Tahun</Label>
                 <Input type="number" value={formData.tahun} onChange={(e) => handleInputChange("tahun", e.target.value)} />
               </div>
              <div className="space-y-2">
                <Label>Harga / Hari</Label>
                <Input type="number" value={formData.harga_per_hari} onChange={(e) => handleInputChange("harga_per_hari", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(val: CarStatus) => handleInputChange("status", val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktif">Aktif (Ready)</SelectItem>
                    <SelectItem value="servis">Servis / Bengkel</SelectItem>
                    <SelectItem value="nonaktif">Non-Aktif (Arsip)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Keterangan Tambahan</Label>
              <Textarea value={formData.keterangan} onChange={(e) => handleInputChange("keterangan", e.target.value)} placeholder="Kondisi mobil, fitur, dll..." />
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Simpan Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}