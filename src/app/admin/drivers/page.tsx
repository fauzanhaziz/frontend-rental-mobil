"use client";

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Search, UploadCloud, Loader2, Phone, } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { toast } from 'sonner';
import api from "@/lib/axios";

// --- 1. DEFINISI TIPE DATA (NO ANY) ---

type DriverStatus = 'tersedia' | 'bertugas' | 'off';

// Tipe Data Supir dari API
interface Driver {
  id: number;
  nama: string;
  no_hp: string;
  harga_per_hari: string; // Django Decimal -> String
  status: DriverStatus;
  foto_url: string | null; // Serializer kita pakai method field 'foto_url'
  foto: string | null;     // Raw path
  created_at?: string;
}

// Tipe untuk State Form
interface DriverFormState {
  nama: string;
  no_hp: string;
  harga_per_hari: string | number;
  status: DriverStatus;
}

// Interface Error API Django
interface ApiError {
  response?: {
    data?: {
      nama?: string[];
      no_hp?: string[];
      harga_per_hari?: string[];
      detail?: string;
      error?: string;
    };
  };
  message?: string;
}

// Interface Pagination
interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

type ApiResponse<T> = T[] | PaginatedResponse<T>;

// --- 2. INITIAL STATE ---
const initialForm: DriverFormState = {
  nama: '',
  no_hp: '',
  harga_per_hari: '150000',
  status: 'tersedia',
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

export default function AdminDrivers() {
  const { searchTerm: globalSearch } = useSearch();
  
  // State Data
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // State Modal & Form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<DriverFormState>(initialForm);
  
  // State Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. FETCH DATA
  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      const query = search || globalSearch;
      if (query) params.append("search", query); // DRF SearchFilter pakai param 'search'
      
      if (statusFilter !== 'all') {
        params.append("status", statusFilter);
      }
      
      const response = await api.get<ApiResponse<Driver>>(`/supir/?${params.toString()}`);
      const dataList = getResults(response.data);
      setDrivers(dataList);

    } catch (error: unknown) {
      console.error(error);
      toast.error("Gagal memuat data supir");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, globalSearch, statusFilter]);

  // 2. HANDLERS FORM
  const handleInputChange = (field: keyof DriverFormState, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 3. MODAL CONTROLS
  const handleAdd = () => {
    setEditingDriver(null);
    setFormData(initialForm);
    setImageFile(null);
    setPreviewImage(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      nama: driver.nama,
      no_hp: driver.no_hp,
      harga_per_hari: parseInt(driver.harga_per_hari),
      status: driver.status,
    });
    setPreviewImage(driver.foto_url); // Gunakan URL foto dari serializer
    setImageFile(null);
    setIsDialogOpen(true);
  };

  // 4. SAVE DATA (STRICT)
  const handleSave = async () => {
    if (!formData.nama || !formData.no_hp || !formData.harga_per_hari) {
      toast.warning('Nama, No HP, dan Harga wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      const data = new FormData();
      
      // Append Fields Manual (Type Safe)
      data.append("nama", formData.nama);
      data.append("no_hp", formData.no_hp);
      data.append("harga_per_hari", String(formData.harga_per_hari));
      data.append("status", formData.status);

      if (imageFile) {
        data.append("foto", imageFile);
      }

      if (editingDriver) {
        // UPDATE
        await api.patch(`/supir/${editingDriver.id}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success('Supir berhasil diperbarui');
      } else {
        // CREATE
        await api.post("/supir/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success('Supir berhasil ditambahkan');
      }

      setIsDialogOpen(false);
      fetchDrivers();

    } catch (error: unknown) {
      console.error(error);
      const err = error as ApiError;
      const errData = err.response?.data;
      
      let msg = 'Gagal menyimpan data supir';
      if (errData?.nama) msg = `Nama: ${errData.nama[0]}`;
      else if (errData?.no_hp) msg = `No HP: ${errData.no_hp[0]}`;
      else if (errData?.detail) msg = errData.detail;
      
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // 5. DELETE
  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus supir ini?')) {
      try {
        await api.delete(`/supir/${id}/`);
        toast.success('Supir berhasil dihapus');
        fetchDrivers();
      } catch (error: unknown) {
        console.error(error);
        toast.error('Gagal menghapus supir');
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Kelola Supir</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Total {drivers.length} supir terdaftar
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Tambah Supir
        </Button>
      </div>

      {/* Search & Filter */}
      <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari supir berdasarkan nama atau nomor HP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="w-full md:w-[200px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="tersedia">Tersedia</SelectItem>
                <SelectItem value="bertugas">Sedang Bertugas</SelectItem>
                <SelectItem value="off">Libur / Off</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                  <TableHead>Nama Supir</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Tarif / Hari</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <TableCell>
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                        <ImageWithFallback
                          src={driver.foto_url || "https://ui-avatars.com/api/?name=" + driver.nama}
                          alt={driver.nama}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{driver.nama}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Phone className="h-3 w-3" /> {driver.no_hp}
                        </div>
                    </TableCell>
                    <TableCell>Rp {Number(driver.harga_per_hari).toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      <Badge
                        variant={driver.status === 'tersedia' ? 'outline' : 'secondary'}
                        className={
                          driver.status === 'tersedia'
                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400'
                            : driver.status === 'bertugas'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }
                      >
                        {driver.status === 'tersedia' ? '🟢 Tersedia' : driver.status === 'bertugas' ? '🔵 Bertugas' : '🔴 Off'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(driver)}
                          className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(driver.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {drivers.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    Tidak ada data supir ditemukan.
                </div>
            )}
          </div>
        )}
      </Card>

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDriver ? 'Edit Supir' : 'Tambah Supir Baru'}</DialogTitle>
            <DialogDescription>
              {editingDriver ? 'Perbarui informasi supir' : 'Tambahkan supir baru ke sistem'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Image Upload */}
            <div className="flex items-center gap-4 justify-center mb-4">
                <div 
                  className="relative w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-400 group-hover:text-slate-600">
                      <UploadCloud className="mx-auto h-6 w-6" />
                      <span className="text-[10px]">Upload</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
                <div className="text-sm text-slate-500">
                    <p>Klik lingkaran untuk ganti foto.</p>
                    <p className="text-xs">Max 2MB (JPG/PNG)</p>
                </div>
            </div>

            <div className="grid gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nama Supir</Label>
                    <Input
                        id="name"
                        value={formData.nama}
                        onChange={(e) => handleInputChange('nama', e.target.value)}
                        placeholder="Budi Santoso"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">No HP</Label>
                        <Input
                            id="phone"
                            value={formData.no_hp}
                            onChange={(e) => handleInputChange('no_hp', e.target.value)}
                            placeholder="0812xxxx"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">Tarif / Hari</Label>
                        <Input
                            id="price"
                            type="number"
                            value={formData.harga_per_hari}
                            onChange={(e) => handleInputChange('harga_per_hari', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                        value={formData.status} 
                        onValueChange={(val: DriverStatus) => handleInputChange('status', val)}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tersedia">🟢 Tersedia</SelectItem>
                            <SelectItem value="bertugas">🔵 Bertugas</SelectItem>
                            <SelectItem value="off">🔴 Libur / Off</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}