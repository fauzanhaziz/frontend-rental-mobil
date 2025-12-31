"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Lock, 
  KeyRound, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2 
} from "lucide-react";
import axios from "axios";
import Link from "next/link";

interface VerifyFormInputs {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Ambil email dari URL (?email=user@example.com)
  const emailFromUrl = searchParams.get("email") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const { 
    register, 
    handleSubmit, 
    watch, 
    formState: { errors } 
  } = useForm<VerifyFormInputs>({
    defaultValues: {
        email: emailFromUrl,
        otp: "",
        new_password: "",
        confirm_password: ""
    }
  });

  const onSubmit = async (data: VerifyFormInputs) => {
    setIsLoading(true);
    try {
      // ENDPOINT KONFIRMASI OTP
      await api.post("/users/password-reset/confirm/", data);
      
      toast.success("Password berhasil diubah! Silakan login.");
      router.push("/login");
      
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            // Menangkap pesan error spesifik dari Backend
            const errData = error.response.data;
            if (errData.error) {
                toast.error(errData.error);
            } else if (errData.otp) {
                toast.error("Format OTP salah.");
            } else {
                toast.error("Gagal mereset password.");
            }
        } else {
            toast.error("Terjadi kesalahan jaringan.");
        }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="text-center mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Verifikasi OTP</h1>
            <p className="text-sm text-slate-500 mt-2">
                Masukkan 6 digit kode yang dikirim ke <span className="font-semibold text-slate-700 dark:text-slate-300">{emailFromUrl}</span>
            </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Email (Hidden/Readonly) */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Email Akun</Label>
            <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                    {...register("email")} 
                    readOnly 
                    className="pl-9 bg-slate-50 dark:bg-slate-900 text-slate-500 cursor-not-allowed border-slate-200" 
                />
            </div>
          </div>

          {/* Input OTP */}
          <div className="space-y-2">
            <Label>Kode OTP</Label>
            <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="123456" 
                    className="pl-9 tracking-[0.5em] font-mono font-bold text-lg text-center"
                    maxLength={6}
                    {...register("otp", { 
                        required: "Kode OTP wajib diisi",
                        minLength: { value: 6, message: "Harus 6 digit" },
                        maxLength: { value: 6, message: "Harus 6 digit" }
                    })} 
                />
            </div>
            {errors.otp && <p className="text-red-500 text-xs">{errors.otp.message}</p>}
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />

          {/* Password Baru */}
          <div className="space-y-2">
            <Label>Password Baru</Label>
            <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                    type={showPass ? "text" : "password"} 
                    placeholder="Minimal 8 karakter" 
                    className="pl-9 pr-10" 
                    {...register("new_password", { 
                        required: "Password baru wajib diisi", 
                        minLength: { value: 8, message: "Minimal 8 karakter" } 
                    })} 
                />
                <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)} 
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {errors.new_password && <p className="text-red-500 text-xs">{errors.new_password.message}</p>}
          </div>

          {/* Konfirmasi Password */}
          <div className="space-y-2">
            <Label>Ulangi Password</Label>
            <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                    type={showConfirmPass ? "text" : "password"} 
                    placeholder="Konfirmasi password" 
                    className="pl-9 pr-10" 
                    {...register("confirm_password", { 
                        required: "Konfirmasi password wajib diisi", 
                        validate: (val) => val === watch('new_password') || "Password tidak sama" 
                    })} 
                />
                <button 
                    type="button" 
                    onClick={() => setShowConfirmPass(!showConfirmPass)} 
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {errors.confirm_password && <p className="text-red-500 text-xs">{errors.confirm_password.message}</p>}
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Reset Password"}
          </Button>

          <div className="text-center pt-2">
             <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-blue-600 hover:underline">
                Salah email? Kirim ulang
             </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// WAJIB: Bungkus dengan Suspense agar tidak error saat build (karena pakai useSearchParams)
export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>}>
            <VerifyForm />
        </Suspense>
    )
}