"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from "framer-motion";
import { Eye, Ban, Search, Plus, Loader2, User, CreditCard, Phone, MapPin, Edit } from 'lucide-react';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from "@/lib/axios";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import axios from 'axios'; // Import axios untuk pengecekan isAxiosError

// --- 1. DEFINISI TIPE DATA (STRICT) ---

interface Customer {
  id: number;
  user: number | null; // ID User (null jika offline)
  nama: string;
  email?: string; // Dari relasi User (jika ada)
  no_hp: string;
  alamat: string;
  ktp: string;
  status_akun: 'Online' | 'Offline';
  is_active?: boolean; // Dari User
  created_at: string;
}

interface CustomerFormState {
  nama: string;
  no_hp: string;
  ktp: string;
  alamat: string;
  catatan: string;
}

// API Error Interface untuk Django Rest Framework
interface DrfErrorResponse {
  nama?: string[];
  no_hp?: string[];
  ktp?: string[];
  detail?: string;
  error?: string;
  [key: string]: string[] | string | undefined; // Fallback index signature
}

// Helper Pagination & Response Wrapper
interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

// Type Union untuk menangani respons array langsung atau paginated
type ApiResponse<T> = T[] | PaginatedResponse<T>;

// Helper function untuk menstandarkan output menjadi array
function getResults<T>(data: ApiResponse<T>): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && 'results' in data) {
    return data.results;
  }
  return [];
}

// Initial State Form
const initialForm: CustomerFormState = {
  nama: '',
  no_hp: '',
  ktp: '',
  alamat: '',
  catatan: '',
};

export default function AdminCustomers() {
  const { searchTerm: globalSearch } = useSearch();
  
  // State Data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State Filter
  const [search, setSearch] = useState('');
  
  // State Modal Detail
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // State Modal Form (Create/Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null); // Track siapa yg diedit
  const [formData, setFormData] = useState<CustomerFormState>(initialForm);

  // State Alert (Toggle Status)
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [actionCustomer, setActionCustomer] = useState<Customer | null>(null);

  // 1. FETCH CUSTOMERS
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      const query = search || globalSearch;
      
      if (query) params.append("search", query);
      
      // Gunakan generics pada api.get
      const response = await api.get<ApiResponse<Customer>>(`/pelanggan/?${params.toString()}`);
      
      // Proses data dengan helper getResults
      const dataList = getResults(response.data);
      setCustomers(dataList);

    } catch (error: unknown) {
      console.error("Error fetching customers:", error);
      toast.error("Gagal memuat data pelanggan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [search, globalSearch]); // Dependensi useCallback

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // 2. HANDLE OPEN MODAL
  const handleAdd = () => {
    setEditingCustomer(null); // Mode Create
    setFormData(initialForm);
    setIsFormOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer); // Mode Edit
    setFormData({
      nama: customer.nama,
      no_hp: customer.no_hp,
      ktp: customer.ktp || '',
      alamat: customer.alamat || '',
      catatan: '', // Catatan biasanya tidak disimpan di profil publik, opsional
    });
    setIsFormOpen(true);
  };

  // 3. HANDLE SAVE (CREATE & UPDATE)
  const handleSave = async () => {
    // VALIDASI SEDERHANA
    if (!formData.nama.trim() || !formData.no_hp.trim()) {
      toast.warning("Nama dan No HP wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      if (editingCustomer) {
        // --- LOGIKA UPDATE (PATCH) ---
        await api.patch(`/pelanggan/${editingCustomer.id}/`, formData);
        toast.success("Data pelanggan berhasil diperbarui");
      } else {
        // --- LOGIKA CREATE (POST) ---
        await api.post('/pelanggan/', formData);
        toast.success("Pelanggan Baru berhasil ditambahkan");
      }
      
      setIsFormOpen(false);
      fetchCustomers(); // Refresh data

    } catch (error: unknown) {
      // PENANGANAN ERROR STRICT (TANPA ANY)
      let errorMessage = "Gagal menyimpan data pelanggan";

      if (axios.isAxiosError(error) && error.response) {
        // Type assertion aman karena kita tahu struktur DRF
        const errorData = error.response.data as DrfErrorResponse;
        
        if (errorData.ktp) {
          errorMessage = `KTP: ${errorData.ktp[0]}`;
        } else if (errorData.no_hp) {
          errorMessage = `No HP: ${errorData.no_hp[0]}`;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
           errorMessage = errorData.error;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // 4. TOGGLE STATUS (Hanya untuk User Online)
  const handleToggleStatus = (customer: Customer) => {
    if (!customer.user) {
      toast.info("Pelanggan Offline tidak memiliki akun login untuk dinonaktifkan.");
      return;
    }
    setActionCustomer(customer);
    setIsAlertOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!actionCustomer || !actionCustomer.user) return;
    
    try {
      // Asumsi API endpoint untuk toggle status user
      // Jika 'is_active' ada di endpoint users:
      const newStatus = !actionCustomer.is_active; // Pastikan properti ini ada di data Customer yg di-fetch
      
      await api.patch(`/users/${actionCustomer.user}/`, {
        is_active: newStatus
      });
      
      toast.success(`Akun berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchCustomers();
      
    } catch (error: unknown) {
        console.error("Error toggling status:", error);
        toast.error("Gagal mengubah status akun");
    } finally {
        setIsAlertOpen(false);
        setActionCustomer(null);
    }
  };

  // UI HELPERS
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: id });
    } catch {
      return "-";
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Kelola Pelanggan</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Database pelanggan online & offline</p>
        </div>
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="h-4 w-4" /> Tambah Pelanggan
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari Nama, KTP, atau No HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
           <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Tipe Akun</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                            Tidak ada data pelanggan ditemukan.
                        </TableCell>
                    </TableRow>
                ) : (
                    customers.map((cust) => (
                    <TableRow key={cust.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <TableCell>#{cust.id}</TableCell>
                        <TableCell>
                            <p className="font-medium text-slate-900 dark:text-white">{cust.nama}</p>
                            <p className="text-xs text-slate-500">{cust.ktp || "-"}</p>
                        </TableCell>
                        <TableCell>
                            <p className="text-sm">{cust.no_hp}</p>
                            {cust.email && <p className="text-xs text-slate-500 truncate max-w-[150px]">{cust.email}</p>}
                        </TableCell>
                        <TableCell>
                            <Badge variant={cust.status_akun === 'Online' ? 'default' : 'secondary'} className={cust.status_akun === 'Online' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}>
                                {cust.status_akun}
                            </Badge>
                        </TableCell>
                        <TableCell>{formatDate(cust.created_at)}</TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                {/* Tombol Edit */}
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => handleEdit(cust)}
                                  className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  title="Edit Pelanggan"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                
                                {/* Tombol Detail */}
                                <Button size="sm" variant="ghost" onClick={() => { setSelectedCustomer(cust); setIsDetailOpen(true); }}>
                                    <Eye className="h-4 w-4 mr-1" /> Detail
                                </Button>

                                {/* Tombol Ban (Hanya User Online) */}
                                {cust.status_akun === 'Online' && (
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => handleToggleStatus(cust)}
                                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        title="Nonaktifkan Akun Login"
                                    >
                                        <Ban className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* --- DIALOG FORM (CREATE & EDIT) --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-white dark:bg-slate-800 sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>{editingCustomer ? "Edit Data Pelanggan" : "Tambah Pelanggan Baru"}</DialogTitle>
                <DialogDescription>
                    {editingCustomer ? "Perbarui informasi pelanggan." : "Tambah pelanggan walk-in (Offline)."}
                </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label>Nama Lengkap <span className="text-red-500">*</span></Label>
                    <Input 
                      value={formData.nama} 
                      onChange={(e) => setFormData({...formData, nama: e.target.value})} 
                      placeholder="Contoh: Budi Santoso" 
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>No. HP <span className="text-red-500">*</span></Label>
                        <Input 
                          value={formData.no_hp} 
                          onChange={(e) => setFormData({...formData, no_hp: e.target.value})} 
                          placeholder="0812..." 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>No. KTP (Opsional)</Label>
                        <Input 
                          value={formData.ktp} 
                          onChange={(e) => setFormData({...formData, ktp: e.target.value})} 
                          placeholder="16 digit" 
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label>Alamat</Label>
                    <Textarea 
                      value={formData.alamat} 
                      onChange={(e) => setFormData({...formData, alamat: e.target.value})} 
                    />
                </div>
                {/* Catatan hanya untuk Create Offline */}
                {!editingCustomer && (
                  <div className="grid gap-2">
                      <Label>Catatan Admin</Label>
                      <Input 
                        value={formData.catatan} 
                        onChange={(e) => setFormData({...formData, catatan: e.target.value})} 
                        placeholder="Opsional" 
                      />
                  </div>
                )}
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>Batal</Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingCustomer ? "Update Data" : "Simpan")}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG DETAIL --- */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-white dark:bg-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Pelanggan</DialogTitle>
            <DialogDescription>ID: #{selectedCustomer?.id}</DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{selectedCustomer.nama}</h3>
                        <p className="text-sm text-slate-500">{selectedCustomer.status_akun} User</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">No Handphone</Label>
                        <div className="flex items-center gap-2 font-medium"><Phone className="h-3 w-3" /> {selectedCustomer.no_hp}</div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">Nomor KTP</Label>
                        <div className="flex items-center gap-2 font-medium"><CreditCard className="h-3 w-3" /> {selectedCustomer.ktp || "-"}</div>
                    </div>
                    <div className="col-span-2 space-y-1">
                        <Label className="text-xs text-slate-500">Alamat Lengkap</Label>
                        <div className="flex items-start gap-2 font-medium"><MapPin className="h-3 w-3 mt-1" /> {selectedCustomer.alamat || "-"}</div>
                    </div>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG (TOGGLE STATUS) */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-800">
            <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Tindakan</AlertDialogTitle>
                <AlertDialogDescription>
                    Apakah Anda yakin ingin mengubah status aktif akun milik <strong>{actionCustomer?.nama}</strong>?
                    User mungkin tidak bisa login jika dinonaktifkan.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={confirmToggleStatus} className="bg-red-600 hover:bg-red-700">
                    Ya, Lanjutkan
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </motion.div>
  );
}