"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Loader2, Calendar, Percent, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { AxiosError } from "axios";

// --- 1. STRICT INTERFACES ---

type TipeDiskon = 'nominal' | 'persen';

// Interface Data dari Backend (Response)
interface Promo {
  id: number;
  kode: string;
  nama_promo: string;
  keterangan: string | null;
  tipe_diskon: TipeDiskon;
  nilai_diskon: string; // DecimalField dari Django biasanya string di JSON
  max_potongan: string;
  min_transaksi: string;
  kuota: number;
  sudah_digunakan: number;
  berlaku_mulai: string; // ISO String
  berlaku_sampai: string; // ISO String
  aktif: boolean;
}

// Interface untuk State Form (Input)
interface PromoFormData {
  id?: number;
  kode: string;
  nama_promo: string;
  keterangan: string;
  tipe_diskon: TipeDiskon;
  nilai_diskon: string | number;
  max_potongan: string | number;
  min_transaksi: string | number;
  kuota: string | number;
  berlaku_mulai: string; // Format untuk input datetime-local: YYYY-MM-DDTHH:mm
  berlaku_sampai: string;
  aktif: boolean;
}

// Interface Error Response dari DRF
interface ApiValidationError {
  [key: string]: string[];
}

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Initial State
  const initialForm: PromoFormData = {
    kode: "",
    nama_promo: "",
    keterangan: "",
    tipe_diskon: "nominal",
    nilai_diskon: 0,
    max_potongan: 0,
    min_transaksi: 0,
    kuota: 0,
    berlaku_mulai: "",
    berlaku_sampai: "",
    aktif: true
  };

  const [formData, setFormData] = useState<PromoFormData>(initialForm);

  // --- 1. FETCH DATA ---
  const fetchPromos = async () => {
    setIsLoading(true);
    try {
      // Definisikan tipe return generic untuk api.get
      const res = await api.get<{ results: Promo[] } | Promo[]>("/promo/");
      const data = 'results' in res.data ? res.data.results : res.data;
      setPromos(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data promo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPromos(); }, []);

  // --- 2. HANDLERS ---
  
  const handleOpenCreate = () => {
    setFormData(initialForm);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: Promo) => {
    // Convert ISO string (Backend) to Input Datetime Format (YYYY-MM-DDTHH:mm)
    const toInputFormat = (isoStr: string) => {
        if (!isoStr) return "";
        return new Date(isoStr).toISOString().slice(0, 16);
    };

    setFormData({
        id: item.id,
        kode: item.kode,
        nama_promo: item.nama_promo,
        keterangan: item.keterangan || "",
        tipe_diskon: item.tipe_diskon,
        nilai_diskon: parseFloat(item.nilai_diskon), // Convert "10000.00" -> 10000
        max_potongan: parseFloat(item.max_potongan),
        min_transaksi: parseFloat(item.min_transaksi),
        kuota: item.kuota,
        berlaku_mulai: toInputFormat(item.berlaku_mulai),
        berlaku_sampai: toInputFormat(item.berlaku_sampai),
        aktif: item.aktif
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    // Validasi Basic di Frontend
    if (!formData.kode || !formData.nama_promo || !formData.berlaku_mulai || !formData.berlaku_sampai) {
        return toast.warning("Mohon lengkapi data wajib (Kode, Nama, Tanggal).");
    }

    setIsProcessing(true);
    try {
        if (formData.id) {
            await api.patch<Promo>(`/promo/${formData.id}/`, formData);
            toast.success("Promo berhasil diperbarui!");
        } else {
            await api.post<Promo>("/promo/", formData);
            toast.success("Promo baru berhasil dibuat!");
        }
        
        setIsDialogOpen(false);
        fetchPromos();
    } catch (error: unknown) {
        // Strict Error Handling
        if (error instanceof AxiosError && error.response?.data) {
            const errData = error.response.data as ApiValidationError;
            // Ambil pesan error pertama dari field 'kode' atau 'non_field_errors' atau default
            const msg = errData.kode?.[0] || errData.non_field_errors?.[0] || "Gagal menyimpan promo.";
            toast.error(msg);
        } else {
            console.error(error);
            toast.error("Terjadi kesalahan sistem.");
        }
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus promo ini secara permanen?")) return;
    try {
        await api.delete(`/promo/${id}/`);
        toast.success("Promo dihapus.");
        fetchPromos();
    } catch (error) { 
        console.error(error);
        toast.error("Gagal menghapus promo."); 
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
        // Optimistic Update
        setPromos(prev => prev.map(p => p.id === id ? { ...p, aktif: !currentStatus } : p));
        await api.patch(`/promo/${id}/`, { aktif: !currentStatus });
        toast.success(currentStatus ? "Promo dinonaktifkan" : "Promo diaktifkan");
    } catch (error) {
        console.error(error);
        toast.error("Gagal update status");
        fetchPromos(); // Revert jika gagal
    }
  };

  // --- UTILS ---
  const filteredPromos = promos.filter(p => 
    p.kode.toLowerCase().includes(search.toLowerCase()) || 
    p.nama_promo.toLowerCase().includes(search.toLowerCase())
  );

  const formatRupiah = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const formatDateTime = (val: string) => {
    try {
        return val ? format(parseISO(val), "dd MMM yyyy, HH:mm", { locale: id }) : "-";
    } catch (e) {
        return "-";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Manajemen Promo</h1>
            <p className="text-slate-500">Buat kode diskon untuk pelanggan.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Tambah Promo
        </Button>
      </div>

      {/* FILTER & LIST */}
      <Card>
        <CardHeader className="pb-3">
            <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Cari kode atau nama promo..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
            ) : (
                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900">
                            <TableRow>
                                <TableHead>Kode Promo</TableHead>
                                <TableHead>Tipe & Nilai</TableHead>
                                <TableHead>Syarat Min.</TableHead>
                                <TableHead>Masa Berlaku</TableHead>
                                <TableHead>Kuota</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPromos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">Tidak ada data promo.</TableCell>
                                </TableRow>
                            ) : (
                                filteredPromos.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-base text-blue-600 font-mono tracking-wide">{item.kode}</span>
                                                <span className="text-xs text-slate-500">{item.nama_promo}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={item.tipe_diskon === 'persen' ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-green-50 text-green-700 border-green-200"}>
                                                {item.tipe_diskon === 'persen' ? <Percent className="w-3 h-3 mr-1" /> : <DollarSign className="w-3 h-3 mr-1" />}
                                                {item.tipe_diskon === 'persen' ? `${parseFloat(item.nilai_diskon)}%` : formatRupiah(item.nilai_diskon)}
                                            </Badge>
                                            {item.tipe_diskon === 'persen' && parseFloat(item.max_potongan) > 0 && (
                                                <div className="text-[10px] text-slate-500 mt-1">Max: {formatRupiah(item.max_potongan)}</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm">{parseFloat(item.min_transaksi) > 0 ? formatRupiah(item.min_transaksi) : "Tanpa Min."}</TableCell>
                                        <TableCell>
                                            <div className="text-xs flex flex-col gap-1 text-slate-600">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDateTime(item.berlaku_mulai)}</span>
                                                <span className="text-slate-400 pl-4">s/d</span>
                                                <span className="flex items-center gap-1 text-red-500"><Calendar className="w-3 h-3" /> {formatDateTime(item.berlaku_sampai)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {item.kuota > 0 ? (
                                                    <span>{item.sudah_digunakan} / {item.kuota}</span>
                                                ) : (
                                                    <span className="text-green-600 font-medium">∞ Unlimited</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Switch 
                                                checked={item.aktif} 
                                                onCheckedChange={() => toggleStatus(item.id, item.aktif)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}><Pencil className="h-4 w-4 text-blue-600" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </CardContent>
      </Card>

      {/* DIALOG FORM */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{formData.id ? "Edit Promo" : "Buat Promo Baru"}</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
                {/* Kode & Nama */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Kode Promo (Unik)</Label>
                        <Input 
                            value={formData.kode} 
                            onChange={(e) => setFormData({...formData, kode: e.target.value.toUpperCase()})} // Auto Uppercase
                            placeholder="MISAL: DISKON10" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Nama Promo</Label>
                        <Input 
                            value={formData.nama_promo} 
                            onChange={(e) => setFormData({...formData, nama_promo: e.target.value})} 
                            placeholder="Promo Lebaran" 
                        />
                    </div>
                </div>

                {/* Deskripsi */}
                <div className="space-y-2">
                    <Label>Deskripsi / Syarat</Label>
                    <Textarea 
                        value={formData.keterangan} 
                        onChange={(e) => setFormData({...formData, keterangan: e.target.value})} 
                        placeholder="Keterangan singkat promo..."
                    />
                </div>

                <hr className="border-slate-100" />

                {/* Tipe & Nilai Diskon */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Tipe Diskon</Label>
                        <Select 
                            value={formData.tipe_diskon} 
                            onValueChange={(val: TipeDiskon) => setFormData({...formData, tipe_diskon: val, max_potongan: 0})}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="nominal">Nominal (Rp)</SelectItem>
                                <SelectItem value="persen">Persentase (%)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{formData.tipe_diskon === 'nominal' ? 'Nominal Potongan (Rp)' : 'Besar Diskon (%)'}</Label>
                        <Input 
                            type="number" 
                            min="0"
                            value={formData.nilai_diskon} 
                            onChange={(e) => setFormData({...formData, nilai_diskon: e.target.value})} 
                        />
                    </div>
                </div>

                {/* Max Potongan (Hanya untuk Persen) & Min Transaksi */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className={formData.tipe_diskon === 'nominal' ? "text-slate-400" : ""}>Max. Potongan (Rp)</Label>
                        <Input 
                            type="number" 
                            min="0"
                            value={formData.max_potongan} 
                            onChange={(e) => setFormData({...formData, max_potongan: e.target.value})} 
                            disabled={formData.tipe_diskon === 'nominal'}
                            placeholder={formData.tipe_diskon === 'nominal' ? "Tidak berlaku" : "0 = Unlimited"}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Min. Transaksi (Rp)</Label>
                        <Input 
                            type="number" 
                            min="0"
                            value={formData.min_transaksi} 
                            onChange={(e) => setFormData({...formData, min_transaksi: e.target.value})} 
                            placeholder="0 = Tanpa Minimum"
                        />
                    </div>
                </div>

                {/* Kuota & Tanggal */}
                <div className="space-y-2">
                    <Label>Kuota Penggunaan</Label>
                    <Input 
                        type="number" 
                        min="0"
                        value={formData.kuota} 
                        onChange={(e) => setFormData({...formData, kuota: e.target.value})} 
                        placeholder="0 = Unlimited / Tak Terbatas"
                    />
                    <p className="text-[10px] text-slate-500">Isi 0 jika kuota tak terbatas.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Berlaku Mulai</Label>
                        <Input 
                            type="datetime-local" 
                            value={formData.berlaku_mulai} 
                            onChange={(e) => setFormData({...formData, berlaku_mulai: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Berlaku Sampai</Label>
                        <Input 
                            type="datetime-local" 
                            value={formData.berlaku_sampai} 
                            onChange={(e) => setFormData({...formData, berlaku_sampai: e.target.value})} 
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <Switch id="active-mode" checked={formData.aktif} onCheckedChange={(c) => setFormData({...formData, aktif: c})} />
                    <Label htmlFor="active-mode">Aktifkan Promo Ini?</Label>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                <Button onClick={handleSave} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700">
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Promo
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}