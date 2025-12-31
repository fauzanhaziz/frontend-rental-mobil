"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Save, 
  Loader2, 
  Upload,
  Camera,
  AlertCircle,
  Lock,
  KeyRound,
  Eye,       // Icon Mata Buka
  EyeOff,    // Icon Mata Tutup
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import api from "@/lib/axios";
import axios from "axios";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

// --- DATA TYPE ---
interface ProfileData {
  id?: number;
  user?: number;
  nama: string;
  no_hp: string;
  alamat: string;
  ktp: string; 
  foto_ktp?: string | null;      
  foto_ktp_url?: string | null;  
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // --- STATE DATA ---
  const [profileData, setProfileData] = useState<ProfileData>({
    nama: "", no_hp: "", alamat: "", ktp: "", foto_ktp: null, foto_ktp_url: null
  });

  // --- STATE PASSWORD ---
  const [hasPassword, setHasPassword] = useState(false); 
  const [isPassSaving, setIsPassSaving] = useState(false);
  
  // State Data Password
  const [passData, setPassData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  // State Toggle Visibility Password (Mata)
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // --- 1. FETCH DATA (PROFILE + USER INFO) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. Fetch Data Pelanggan (Profil)
        const resProfile = await api.get('/pelanggan/');
        let pData = [];
        if (Array.isArray(resProfile.data)) pData = resProfile.data;
        else if ('results' in resProfile.data) pData = resProfile.data.results;

        if (pData.length > 0) {
            const profile = pData[0];
            setProfileData(profile); 
            if (profile.foto_ktp_url) setPreviewUrl(profile.foto_ktp_url);
            else if (profile.foto_ktp) setPreviewUrl(profile.foto_ktp);
        }

        // B. Fetch Data User (Untuk cek has_password)
        const resUser = await api.get('/users/'); 
        let uData = [];
        if (Array.isArray(resUser.data)) uData = resUser.data;
        else if ('results' in resUser.data) uData = resUser.data.results;

        if (uData.length > 0) {
            setHasPassword(uData[0].has_password); 
        }

      } catch (error) {
        console.error("Failed to load data", error);
        toast.error("Gagal memuat data profil.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. HANDLE FILE CHANGE ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran foto maksimal 2MB!");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // --- 3. HANDLE SAVE PROFILE ---
  const handleSaveProfile = async () => {
    if (!profileData.nama || !profileData.no_hp) {
        toast.warning("Nama dan No HP wajib diisi.");
        return;
    }

    setIsSaving(true);
    try {
        const formData = new FormData();
        formData.append("nama", profileData.nama);
        formData.append("no_hp", profileData.no_hp);
        formData.append("alamat", profileData.alamat || "");
        formData.append("ktp", profileData.ktp || "");
        if (selectedFile) formData.append("foto_ktp", selectedFile);

        let response;
        if (profileData.id) {
            response = await api.patch<ProfileData>(`/pelanggan/${profileData.id}/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Profil berhasil diperbarui!");
        } else {
            response = await api.post<ProfileData>("/pelanggan/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Profil berhasil dibuat!");
        }

        const updatedProfile = response.data;
        setProfileData(updatedProfile);
        if (updatedProfile.foto_ktp_url) setPreviewUrl(updatedProfile.foto_ktp_url);
        setSelectedFile(null);

    } catch (error) {
        console.error(error);
        toast.error("Gagal menyimpan profil.");
    } finally {
        setIsSaving(false);
    }
  };

  // --- 4. HANDLE SAVE PASSWORD ---
  const handleSavePassword = async () => {
    // Validasi Frontend
    if (!passData.new_password || !passData.confirm_password) {
        toast.warning("Password baru wajib diisi.");
        return;
    }
    if (passData.new_password !== passData.confirm_password) {
        toast.warning("Konfirmasi password tidak cocok.");
        return;
    }
    if (passData.new_password.length < 8) {
        toast.warning("Password minimal 8 karakter.");
        return;
    }
    if (hasPassword && !passData.current_password) {
        toast.warning("Password lama wajib diisi.");
        return;
    }

    setIsPassSaving(true);
    try {
        await api.post('/users/set_password/', {
            current_password: hasPassword ? passData.current_password : undefined,
            new_password: passData.new_password,
            confirm_password: passData.confirm_password
        });

        toast.success("Password berhasil diperbarui! Silakan login ulang jika diperlukan.");
        
        // Reset Form & State
        setPassData({ current_password: "", new_password: "", confirm_password: "" });
        setHasPassword(true);
        setShowCurrentPass(false);
        setShowNewPass(false);
        setShowConfirmPass(false);

    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            const errData = error.response.data;
            if (errData.error) {
                toast.error(errData.error);
            } else if (errData.current_password) {
                toast.error(`Password Lama: ${errData.current_password[0]}`);
            } else if (errData.confirm_password) {
                toast.error(errData.confirm_password[0]);
            } else {
                toast.error("Gagal mengganti password.");
            }
        } else {
            toast.error("Terjadi kesalahan sistem.");
        }
    } finally {
        setIsPassSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12 container mx-auto px-4 max-w-6xl"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Profil Saya</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
            Kelola informasi pribadi dan keamanan akun Anda.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (4/12): PHOTO & SUMMARY */}
        <div className="lg:col-span-4 space-y-6">
            {/* Profile Photo Card */}
            <Card className="text-center pt-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                <CardContent className="flex flex-col items-center">
                    <div className="relative">
                        <Avatar className="h-28 w-28 mb-4 border-4 border-white dark:border-slate-700 shadow-lg">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${profileData.nama || 'User'}&background=2563EB&color=fff&bold=true`} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">U</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-4 right-0 bg-green-500 w-5 h-5 rounded-full border-4 border-white dark:border-slate-800" title="Online"></div>
                    </div>
                    
                    <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-1">{profileData.nama || "Nama User"}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{profileData.no_hp || "-"}</p>
                    
                    <div className="mt-4 w-full border-t border-slate-100 dark:border-slate-700 pt-4">
                        <BadgeVerification isVerified={!!profileData.ktp && !!profileData.foto_ktp_url} />
                    </div>
                </CardContent>
            </Card>

            {/* KTP Preview Card */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-600" /> Foto Identitas (KTP)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-2 relative group overflow-hidden bg-slate-50 dark:bg-slate-900 min-h-[160px] flex items-center justify-center transition-colors hover:border-blue-400 dark:hover:border-blue-700">
                        {previewUrl ? (
                            <ImageWithFallback 
                                src={previewUrl} 
                                alt="KTP Preview" 
                                className="w-full h-auto object-contain rounded-lg max-h-[200px]"
                            />
                        ) : (
                            <div className="text-center text-slate-400 p-4">
                                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full w-fit mx-auto mb-3">
                                    <Camera className="h-6 w-6 text-slate-400" />
                                </div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Belum ada foto</p>
                                <p className="text-xs text-slate-400 mt-1">Upload foto KTP asli</p>
                            </div>
                        )}
                        
                        <label htmlFor="ktp-upload-profile" className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]">
                            <Upload className="h-8 w-8 text-white mb-2" />
                            <span className="text-white text-sm font-semibold">Ganti Foto</span>
                        </label>
                        <input 
                            id="ktp-upload-profile" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileChange} 
                        />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-3 text-center bg-blue-50 dark:bg-blue-900/20 py-2 px-3 rounded text-blue-700 dark:text-blue-300">
                        *Wajib diupload untuk verifikasi sewa mobil.
                    </p>
                </CardContent>
            </Card>
        </div>

        {/* RIGHT COLUMN (8/12): FORMS */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* 1. FORM EDIT INFO PRIBADI */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" /> Informasi Pribadi
                    </CardTitle>
                    <CardDescription>Update data diri Anda agar kami dapat menghubungi Anda dengan mudah.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="nama" className="text-slate-600 dark:text-slate-300">Nama Lengkap <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                                <Input 
                                    id="nama" 
                                    className="pl-10 h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500" 
                                    placeholder="Sesuai KTP" 
                                    // PERBAIKAN: Gunakan || "" untuk menangani null
                                    value={profileData.nama || ""}
                                    onChange={(e) => setProfileData({...profileData, nama: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hp" className="text-slate-600 dark:text-slate-300">No WhatsApp <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                                <Input 
                                    id="hp" 
                                    className="pl-10 h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500" 
                                    placeholder="0812..." 
                                    // PERBAIKAN: Gunakan || "" untuk menangani null
                                    value={profileData.no_hp || ""}
                                    onChange={(e) => setProfileData({...profileData, no_hp: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ktp" className="text-slate-600 dark:text-slate-300">NIK (Nomor KTP)</Label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                            <Input 
                                id="ktp" 
                                className="pl-10 h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500" 
                                placeholder="16 Digit NIK" 
                                // PERBAIKAN: Gunakan || "" untuk menangani null
                                value={profileData.ktp || ""}
                                onChange={(e) => setProfileData({...profileData, ktp: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="alamat" className="text-slate-600 dark:text-slate-300">Alamat Lengkap</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                            <Textarea 
                                id="alamat" 
                                className="pl-10 min-h-[100px] border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none" 
                                placeholder="Nama Jalan, Kecamatan, Kota, Kode Pos..." 
                                // PERBAIKAN: Gunakan || "" untuk menangani null
                                value={profileData.alamat || ""}
                                onChange={(e) => setProfileData({...profileData, alamat: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 min-w-[140px] shadow-md shadow-blue-200 dark:shadow-none transition-all">
                            {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Simpan Perubahan
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 2. FORM SECURITY (CHANGE PASSWORD) */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/50 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-blue-600" /> Keamanan Akun
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {hasPassword 
                                    ? "Ganti password akun Anda secara berkala agar tetap aman." 
                                    : "Akun Google terdeteksi. Buat password untuk login manual."}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    
                    {/* Password Lama (Conditional) */}
                    {hasPassword && (
                        <div className="space-y-2">
                            <Label htmlFor="curr_pass" className="text-slate-600 dark:text-slate-300">Password Lama</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                <Input 
                                    id="curr_pass" 
                                    type={showCurrentPass ? "text" : "password"}
                                    className="pl-10 pr-10" 
                                    placeholder="••••••••" 
                                    value={passData.current_password}
                                    onChange={(e) => setPassData({...passData, current_password: e.target.value})}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="new_pass" className="text-slate-600 dark:text-slate-300">Password Baru</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                <Input 
                                    id="new_pass" 
                                    type={showNewPass ? "text" : "password"}
                                    className="pl-10 pr-10"
                                    placeholder="Min 8 karakter" 
                                    value={passData.new_password}
                                    onChange={(e) => setPassData({...passData, new_password: e.target.value})}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowNewPass(!showNewPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="conf_pass" className="text-slate-600 dark:text-slate-300">Ulangi Password Baru</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                <Input 
                                    id="conf_pass" 
                                    type={showConfirmPass ? "text" : "password"}
                                    className="pl-10 pr-10"
                                    placeholder="Konfirmasi password" 
                                    value={passData.confirm_password}
                                    onChange={(e) => setPassData({...passData, confirm_password: e.target.value})}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button onClick={handleSavePassword} disabled={isPassSaving} variant="outline" className="min-w-[140px] border-slate-300 hover:bg-slate-50 text-slate-700">
                            {isPassSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                            {hasPassword ? "Update Password" : "Buat Password"}
                        </Button>
                    </div>

                </CardContent>
            </Card>

        </div>

      </div>
    </motion.div>
  );
}

// --- HELPER COMPONENT (BADGE) ---
function BadgeVerification({ isVerified }: { isVerified: boolean }) {
    if (isVerified) {
        return (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                Akun Terverifikasi
            </div>
        );
    }
    return (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-sm">
            <AlertCircle className="h-4 w-4" />
            Belum Verifikasi Identitas
        </div>
    );
}