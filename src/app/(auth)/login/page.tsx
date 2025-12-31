"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

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
      error?: string;
    };
  };
  message?: string;
}

interface LoginResponse {
  tokens: {
    access: string;
    refresh: string;
  };
}

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<LoginResponse>('/users/auth/login/', {
        username: data.username,
        password: data.password,
      });

      const { access, refresh } = response.data.tokens;
      login(access, refresh);
      
    } catch (err: unknown) {
      console.error(err);
      const apiError = err as ApiError;
      
      setError(
        apiError.response?.data?.error || 
        'Login gagal. Periksa username dan password Anda.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<LoginResponse>('/users/auth/google/', {
        token: credentialResponse.credential,
      });

      const { access, refresh } = response.data.tokens;
      login(access, refresh);

    } catch (err: unknown) {
      console.error("Google Login Error:", err);
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.error || 
        'Gagal login dengan Google. Silakan coba lagi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      
      {/* Left Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 relative"
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

        <div className="w-full max-w-md mt-12 sm:mt-0">
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg shadow-blue-200 dark:shadow-none shadow-lg">
                <Car className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">RentalMobil</span>
            </div>
            <ToggleTheme />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Selamat Datang 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Masuk ke akun Anda untuk mulai menyewa
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="username"
                  placeholder="Masukkan username Anda"
                  className="pl-10 focus-visible:ring-blue-600"
                  disabled={isLoading}
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-500 font-medium">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 focus-visible:ring-blue-600"
                  disabled={isLoading}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                <Label htmlFor="remember" className="cursor-pointer text-sm text-slate-600 dark:text-slate-400">
                  Ingat saya
                </Label>
              </div>
              
              {/* --- LINK LUPA PASSWORD BARU --- */}
              <Link 
                href="/forgot-password" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk Sekarang'
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-slate-50 dark:bg-slate-900 px-4 text-slate-500 dark:text-slate-400">
                  atau masuk dengan
                </span>
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
                    text="signin_with"
                    shape="rectangular"
                    width="100%" 
                />
               </div>
            </div>

            <div className="text-center text-sm mt-6">
              <span className="text-slate-600 dark:text-slate-400">Belum punya akun? </span>
              <Link href="/registrasi" className="font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
                Daftar Gratis
              </Link>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Right Side - Image */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-1 relative bg-linear-to-br from-blue-600 to-blue-900"
      >
        <div className="absolute inset-0 bg-black/30 z-10" />
        <ImageWithFallback
          src="/images/NKAlogo.png" 
          alt="Car Rental"
          className="w-full h-full object-cover absolute inset-0"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 z-20">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center max-w-lg backdrop-blur-sm bg-white/10 p-8 rounded-2xl border border-white/10"
          >
            <h2 className="text-4xl font-bold mb-6 leading-tight">Perjalanan Nyaman Dimulai di Sini</h2>
            <p className="text-lg opacity-90 font-light">
              Nikmati pengalaman sewa mobil terbaik dengan armada terawat dan layanan 24 jam.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}