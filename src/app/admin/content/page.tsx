"use client";

import { useState, useEffect } from "react";
import { Trash2, Video, Image as ImageIcon, Loader2, PlayCircle, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/lib/axios";
import { toast } from "sonner";
import Image from "next/image";

// --- TYPES ---
interface HeroData {
  id?: number;
  judul: string;
  sub_judul: string;
  urutan: number;
  media_url?: string;
  media_type?: 'video' | 'image';
  is_active?: boolean;
}

interface DocItem {
  id?: number;
  judul: string;
  deskripsi: string;
  urutan: number;
  media_url?: string;
  media_type?: 'video' | 'image';
}

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState("hero");

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Manajemen Konten Website</h1>
        <p className="text-slate-500">Kelola tampilan Banner Utama dan Galeri Dokumentasi.</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="hero">Hero Section (Banner)</TabsTrigger>
          <TabsTrigger value="docs">Galeri Dokumentasi</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-6">
          <HeroManager />
        </TabsContent>

        <TabsContent value="docs" className="mt-6">
          <DocsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- HERO MANAGER ---
function HeroManager() {
  const [heroes, setHeroes] = useState<HeroData[]>([]);
  const [formData, setFormData] = useState<HeroData>({ judul: "", sub_judul: "", urutan: 0, is_active: true });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchHeroes = async () => {
    try {
      const res = await api.get("/konten/hero/");
      setHeroes(res.data.results || res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchHeroes(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const openEdit = (item: HeroData) => {
    setFormData(item);
    setPreview(item.media_url || null);
    setFile(null);
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setFormData({ judul: "", sub_judul: "", urutan: 0, is_active: true });
    setPreview(null);
    setFile(null);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.judul) return toast.warning("Judul wajib diisi.");
    setIsLoading(true);
    try {
      const payload = new FormData();
      payload.append("judul", formData.judul);
      payload.append("sub_judul", formData.sub_judul);
      payload.append("urutan", formData.urutan.toString());
      payload.append("is_active", formData.is_active ? "true" : "false");
      if (file) payload.append("background_media", file);

      if (formData.id) {
        await api.patch(`/konten/hero/${formData.id}/`, payload, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Hero diupdate!");
      } else {
        await api.post("/konten/hero/", payload, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Hero dibuat!");
      }
      setIsDialogOpen(false);
      fetchHeroes();
    } catch (e) { toast.error("Gagal simpan."); } 
    finally { setIsLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus hero ini?")) return;
    try { await api.delete(`/konten/hero/${id}/`); toast.success("Terhapus"); fetchHeroes(); } catch (e) { toast.error("Gagal hapus"); }
  };

  const toggleActive = async (id: number, current: boolean) => {
    try {
        await api.patch(`/konten/hero/${id}/`, { is_active: !current });
        toast.success("Status diubah");
        fetchHeroes();
    } catch (e) { toast.error("Gagal ubah status"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Daftar Banner Hero</h2>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Tambah Baru</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead className="w-[80px]">Media</TableHead>
              <TableHead>Judul & Deskripsi</TableHead>
              <TableHead className="w-[80px]">Urutan</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {heroes.map((item, idx) => (
              <TableRow key={item.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>
                  <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden relative border">
                    {item.media_type === 'video' ? <Video className="m-auto mt-3 h-5 w-5 text-slate-400" /> : <Image src={item.media_url || ''} alt="thumb" fill className="object-cover" />}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{item.judul}</div>
                  <div className="text-xs text-slate-500 line-clamp-1">{item.sub_judul}</div>
                </TableCell>
                <TableCell>{item.urutan}</TableCell>
                <TableCell>
                  <Switch checked={item.is_active} onCheckedChange={() => item.id && toggleActive(item.id, item.is_active || false)} />
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4 text-blue-600" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => item.id && handleDelete(item.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* DIALOG FORM HERO */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{formData.id ? "Edit Hero" : "Buat Hero Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Preview Box */}
            <div className="relative aspect-video w-full bg-slate-100 rounded overflow-hidden border">
                {preview ? (
                    file?.type.startsWith('video') || (!file && formData.media_type === 'video') ? 
                    <video src={preview} className="w-full h-full object-cover" autoPlay muted loop /> : 
                    <Image src={preview} alt="prev" fill className="object-cover" />
                ) : <div className="flex h-full items-center justify-center text-slate-400">No Media</div>}
            </div>
            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                    <Label>Judul</Label>
                    <Input value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} />
                </div>
                <div className="col-span-1 space-y-2">
                    <Label>Urutan</Label>
                    <Input type="number" value={formData.urutan} onChange={e => setFormData({...formData, urutan: parseInt(e.target.value) || 0})} />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea value={formData.sub_judul} onChange={e => setFormData({...formData, sub_judul: e.target.value})} />
            </div>
            <div className="space-y-2">
                <Label>Upload Media</Label>
                <Input type="file" accept="image/*,video/*" onChange={handleFileChange} />
            </div>
            <div className="flex items-center gap-2">
                <Switch id="active" checked={formData.is_active} onCheckedChange={c => setFormData({...formData, is_active: c})} />
                <Label htmlFor="active">Aktifkan Sekarang</Label>
            </div>
            <Button onClick={handleSave} disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- DOCS MANAGER (GALERI) ---
function DocsManager() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [formData, setFormData] = useState<DocItem>({ judul: "", deskripsi: "", urutan: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await api.get("/konten/dokumentasi/");
      setDocs(res.data.results || res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const openCreate = () => {
    setFormData({ judul: "", deskripsi: "", urutan: 0 });
    setFile(null);
    setPreview(null);
    setIsDialogOpen(true);
  };

  const openEdit = (item: DocItem) => {
    setFormData(item);
    setPreview(item.media_url || null);
    setFile(null);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.judul) return toast.warning("Judul wajib.");
    setIsLoading(true);
    try {
      const payload = new FormData();
      payload.append("judul", formData.judul);
      payload.append("deskripsi", formData.deskripsi);
      payload.append("urutan", formData.urutan.toString());
      if (file) payload.append("file_media", file); // Field backend: file_media

      if (formData.id) {
        await api.patch(`/konten/dokumentasi/${formData.id}/`, payload, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Galeri diupdate!");
      } else {
        await api.post("/konten/dokumentasi/", payload, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Galeri ditambah!");
      }
      setIsDialogOpen(false);
      fetchDocs();
    } catch (e) { toast.error("Gagal simpan."); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus item galeri ini?")) return;
    try { await api.delete(`/konten/dokumentasi/${id}/`); toast.success("Terhapus"); fetchDocs(); } catch (e) { toast.error("Gagal hapus"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Galeri Dokumentasi</h2>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Tambah Galeri</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {docs.map((item) => (
          <div key={item.id} className="group relative border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
            <div className="aspect-square relative bg-black">
                {item.media_type === 'video' ? (
                    <video src={item.media_url} className="w-full h-full object-cover opacity-90" />
                ) : (
                    <Image src={item.media_url || ''} alt={item.judul} fill className="object-cover" />
                )}
                {/* Overlay Buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <Button variant="secondary" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => item.id && handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                {item.media_type === 'video' && <PlayCircle className="absolute top-2 right-2 text-white h-6 w-6 opacity-80" />}
            </div>
            <div className="p-3">
                <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm truncate w-3/4" title={item.judul}>{item.judul}</p>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">#{item.urutan}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-1">{item.deskripsi}</p>
            </div>
          </div>
        ))}
      </div>

      {/* DIALOG FORM DOCS */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{formData.id ? "Edit Galeri" : "Tambah Galeri Baru"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative aspect-video w-full bg-slate-100 rounded overflow-hidden border">
                {preview ? (
                    file?.type.startsWith('video') || (!file && formData.media_type === 'video') ? 
                    <video src={preview} className="w-full h-full object-contain bg-black" controls /> : 
                    <Image src={preview} alt="prev" fill className="object-contain" />
                ) : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-8 w-8" /></div>}
            </div>
            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                    <Label>Judul Kegiatan</Label>
                    <Input value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} />
                </div>
                <div className="col-span-1 space-y-2">
                    <Label>Urutan</Label>
                    <Input type="number" value={formData.urutan} onChange={e => setFormData({...formData, urutan: parseInt(e.target.value) || 0})} />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} />
            </div>
            <div className="space-y-2">
                <Label>File Media</Label>
                <Input type="file" accept="image/*,video/*" onChange={handleFileChange} />
            </div>
            <Button onClick={handleSave} disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}