"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation"; // Kita butuh ini untuk redirect
import { toast } from "sonner";
import api from "@/lib/axios"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2, ArrowLeft, KeyRound } from "lucide-react"; // Ganti icon Mail jadi KeyRound
import axios from "axios";

interface ForgotForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter(); // Hook untuk navigasi
  const [isLoading, setIsLoading] = useState(false);
  
  // Kita tidak butuh state 'isSent' lagi karena kalau sukses langsung pindah halaman
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>();

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true);
    try {
      // 1. ENDPOINT BARU (OTP Request)
      // Endpoint ini mengirim 6 digit angka ke email
      await api.post("/users/password-reset/request/", data);
      
      toast.success("Kode OTP terkirim! Silakan cek email Anda.");
      
      // 2. REDIRECT KE HALAMAN VERIFIKASI
      // Kita bawa email di URL query agar user tidak perlu mengetik ulang
      router.push(`/reset-password/verify?email=${encodeURIComponent(data.email)}`);

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
          // Menangkap pesan error dari backend
          const msg = error.response?.data?.error || "Gagal mengirim kode OTP. Pastikan email terdaftar.";
          toast.error(msg);
      } else {
          toast.error("Terjadi kesalahan sistem.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Lupa Password?</h1>
            <p className="text-sm text-slate-500 mt-2">
                Masukkan email Anda. Kami akan mengirimkan <strong>Kode OTP 6 digit</strong> untuk mereset password.
            </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Terdaftar</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                className="pl-4"
                {...register("email", { 
                    required: "Email wajib diisi",
                    pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Format email tidak valid"
                    }
                })}
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors" disabled={isLoading}>
              {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim OTP...
                  </>
              ) : (
                  "Kirim Kode OTP"
              )}
            </Button>

            <div className="text-center pt-2">
                <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 flex items-center justify-center gap-1 transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Kembali ke Login
                </Link>
            </div>
        </form>
      </div>
    </div>
  );
}