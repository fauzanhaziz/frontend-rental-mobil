"use client";

import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Save, RotateCcw, Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

// Data Default
const defaultSettings = {
  companyName: 'CV. Niaga Karya Mandiri',
  email: 'admin@rentalmobil.id',
  whatsapp: '+6281365338011',
  address: 'Padang, Sumatera Barat',
  notifications: true,
  autoBackup: false,
};

export default function AdminSettings() {
  const { theme, setTheme } = useTheme();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  // State Lokal (Tanpa Database)
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load Data dari LocalStorage saat pertama kali buka
  useEffect(() => {
    const savedSettings = localStorage.getItem('admin_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    setIsLoaded(true);
  }, []);

  // 2. Simpan ke LocalStorage
  const handleSave = () => {
    localStorage.setItem('admin_settings', JSON.stringify(settings));
    toast.success('Pengaturan berhasil disimpan di browser ini! ✅');
  };

  // 3. Reset ke Default
  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.setItem('admin_settings', JSON.stringify(defaultSettings));
    toast.success('Pengaturan dikembalikan ke default');
    setIsResetDialogOpen(false);
  };

  if (!isLoaded) return null; // Mencegah hydration mismatch

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-slate-900 dark:text-slate-100 text-2xl font-bold">Pengaturan Dasar</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Konfigurasi tampilan dan informasi dasar aplikasi
        </p>
      </div>

      {/* Tampilan / Tema */}
      <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <h3 className="text-slate-900 dark:text-slate-100 mb-4 font-semibold flex items-center gap-2">
            <Monitor className="w-5 h-5" /> Tampilan Aplikasi
        </h3>
        <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Mode Tema</Label>
              <p className="text-xs text-slate-500">Pilih tampilan Terang atau Gelap</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-full border border-slate-200 dark:border-slate-700">
                <Button 
                    size="sm" 
                    variant="ghost" 
                    className={`rounded-full h-8 px-3 ${theme === 'light' ? 'bg-white shadow-sm text-yellow-600' : 'text-slate-500'}`}
                    onClick={() => setTheme('light')}
                >
                    <Sun className="w-4 h-4 mr-1" /> Terang
                </Button>
                <Button 
                    size="sm" 
                    variant="ghost" 
                    className={`rounded-full h-8 px-3 ${theme === 'dark' ? 'bg-slate-700 shadow-sm text-blue-400' : 'text-slate-500'}`}
                    onClick={() => setTheme('dark')}
                >
                    <Moon className="w-4 h-4 mr-1" /> Gelap
                </Button>
            </div>
        </div>
      </Card>

      {/* Informasi Umum */}
      <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <h3 className="text-slate-900 dark:text-slate-100 mb-4 font-semibold">Informasi Umum</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="companyName">Nama Perusahaan</Label>
                <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="whatsapp">Nomor WhatsApp Admin</Label>
                <Input
                id="whatsapp"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Admin</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Alamat Kantor</Label>
            <Textarea
              id="address"
              rows={2}
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Preferensi Lokal */}
      <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <h3 className="text-slate-900 dark:text-slate-100 mb-4 font-semibold">Preferensi Admin</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifikasi Suara</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Bunyikan notifikasi saat ada pesanan baru (Simulasi)
              </p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mode Hemat Data</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Kurangi animasi dan gambar untuk performa lebih cepat
              </p>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
            />
          </div>
        </div>
      </Card>

      {/* Reset Section */}
      <Card className="p-6 bg-white dark:bg-slate-800 border-red-200 dark:border-red-900/30">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-red-600 font-bold">Reset Pengaturan</Label>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Kembalikan ke pengaturan awal aplikasi
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsResetDialogOpen(true)}
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </Card>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={handleSave} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg h-12 px-6 rounded-full">
          <Save className="h-5 w-5" /> Simpan Pengaturan
        </Button>
      </div>

      {/* Reset Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Pengaturan?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua data pengaturan di halaman ini akan kembali ke default.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700">
              Ya, Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}