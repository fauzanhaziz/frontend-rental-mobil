"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { ToggleTheme } from '@/components/admin/ThemeToggle';
import api from '@/lib/axios';

interface ApiError {
  response?: {
    data?: {
      username?: string[];
      email?: string[];
      error?: string;
    };
  };
  message?: string;
}

// 1. Skema Validasi (KTP DIHAPUS)
const registerSchema = z.object({
  nama: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  username: z.string().min(3, 'Username minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  no_hp: z.string().min(10, 'Nomor HP minimal 10 digit'),
  // KTP dihapus dari sini
  password: z.string().min(8, 'Password minimal 8 karakter'),
  password2: z.string(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "Anda harus menyetujui Syarat & Ketentuan",
  }),
}).refine((data) => data.password === data.password2, {
  message: "Password tidak cocok",
  path: ["password2"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);

    try {
      // Kirim data TANPA KTP
      const response = await api.post('/users/auth/register/', {
        username: data.username,
        email: data.email,
        password: data.password,
        password2: data.password2,
        nama: data.nama,
        no_hp: data.no_hp,
        // ktp tidak dikirim
      });

      toast.success('Registrasi berhasil! Anda otomatis login.');

      const { access, refresh } = (response.data as { tokens: { access: string; refresh: string } }).tokens;
      login(access, refresh);

    } catch (err: unknown) {
      console.error(err);
      const apiError = err as ApiError;
      
      let errorMsg = 'Registrasi gagal. Periksa koneksi atau data Anda.';
      
      if (apiError.response?.data?.username) errorMsg = 'Username sudah digunakan.';
      else if (apiError.response?.data?.email) errorMsg = 'Email sudah terdaftar.';
      else if (apiError.response?.data?.error) errorMsg = apiError.response.data.error;
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/users/auth/google/', {
        token: credentialResponse.credential,
      });
      const { access, refresh } = (response.data as { tokens: { access: string; refresh: string } }).tokens;
      login(access, refresh);
      toast.success('Login Google berhasil!');
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError('Gagal mendaftar dengan Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      
      {/* --- LEFT SIDE: IMAGE --- */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-1 relative bg-linear-to-br from-blue-600 to-blue-900"
      >
        <div className="absolute inset-0 bg-black/20 z-10" />
        <ImageWithFallback
          src="/images/NKAlogo.png"
          alt="Luxury Car"
          className="w-full h-full object-cover absolute inset-0"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 z-20">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center max-w-lg backdrop-blur-sm bg-white/10 p-8 rounded-2xl border border-white/10"
          >
            <h2 className="text-4xl font-bold mb-4">Bergabung Bersama Kami</h2>
            <p className="text-lg opacity-90 font-light">
              Daftar sekarang tanpa ribet. Lengkapi data diri Anda nanti saat akan menyewa.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* --- RIGHT SIDE: FORM --- */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-900 relative overflow-y-auto h-screen"
      >
        <div className="absolute top-6 left-6 z-10">
          <Link 
            href="/" 
            className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
          >
             <div className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-all">
                <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline">Kembali ke Beranda</span>
          </Link>
        </div>

        <div className="w-full max-w-md mt-16 lg:mt-0 mb-8">
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
                <Car className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">RentalMobil</span>
            </div>
            <ToggleTheme />
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Buat Akun Baru
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Registrasi cepat dalam hitungan detik
            </p>
          </div>

          {error && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
             >
               <AlertCircle className="h-5 w-5 shrink-0" />
               <p>{error}</p>
             </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Row 1: Nama */}
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="nama" placeholder="Budi Santoso" className="pl-9" {...register('nama')} />
              </div>
              {errors.nama && <p className="text-xs text-red-500">{errors.nama.message}</p>}
            </div>

            {/* Row 2: Username & No HP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="username" placeholder="budisantoso" className="pl-9" {...register('username')} />
                    </div>
                    {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="no_hp">No. HP (WhatsApp)</Label>
                    <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="no_hp" type="tel" placeholder="0812..." className="pl-9" {...register('no_hp')} />
                    </div>
                    {errors.no_hp && <p className="text-xs text-red-500">{errors.no_hp.message}</p>}
                </div>
            </div>

            {/* Row 3: Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="email" type="email" placeholder="email@contoh.com" className="pl-9" {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Row 4: Passwords */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Minimal 8 karakter" 
                  className="pl-9 pr-9" 
                  {...register('password')} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password2">Konfirmasi Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="password2" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Ulangi password" 
                  className="pl-9" 
                  {...register('password2')} 
                />
              </div>
              {errors.password2 && <p className="text-xs text-red-500">{errors.password2.message}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-2">
              <Checkbox 
                id="terms" 
                checked={watch('agreeToTerms')}
                onCheckedChange={(checked) => setValue('agreeToTerms', checked as boolean)}
              />
              <Label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400 leading-snug cursor-pointer">
                Saya menyetujui <span className="text-blue-600 font-bold">Syarat & Ketentuan</span> serta <span className="text-blue-600 font-bold">Kebijakan Privasi</span>.
              </Label>
            </div>
            {errors.agreeToTerms && <p className="text-xs text-red-500">{errors.agreeToTerms.message}</p>}

            {/* Submit */}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Mendaftar...</> : 'Buat Akun Sekarang'}
            </Button>

            {/* Divider & Google & Login Link (Sama seperti sebelumnya) */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-slate-50 dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">atau daftar dengan</span>
              </div>
            </div>

            <div className="flex justify-center w-full">
               <div className="w-full max-w-xs">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Gagal terhubung ke Google")}
                    useOneTap={false}
                    theme="outline" 
                    size="large"
                    text="signup_with"
                    shape="rectangular"
                    width="100%" 
                />
               </div>
            </div>

            <div className="text-center text-sm mt-4 pb-8">
              <span className="text-slate-600 dark:text-slate-400">Sudah punya akun? </span>
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                Masuk Sini
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};