"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Bell, Globe, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

export default function CustomerSettings  ()  {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const [settings, setSettings] = useState({
    language: 'id',
    notifications: {
      email: true,
      push: true,
      sms: false,
      promo: true,
    },
    location: 'Jakarta',
  });

  const handleSave = () => {
    toast.success('Pengaturan berhasil disimpan! ✅');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <div>
        <h2 className="text-slate-900 dark:text-slate-100">Pengaturan</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Kelola preferensi dan pengaturan aplikasi Anda
        </p>
      </div>

      {/* Appearance */}
      <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <h3 className="text-slate-900 dark:text-slate-100 mb-4">Tampilan</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                {theme === 'dark' ? '🌙' : '☀️'}
              </div>
              <div className="space-y-0.5">
                <Label>Tema Aplikasi</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Mode {theme === 'dark' ? 'Gelap' : 'Terang'} aktif
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              className="transition-all duration-200"
            />
          </div>
        </div>
      </Card>

      {/* Language & Region */}
      <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <h3 className="text-slate-900 dark:text-slate-100 mb-4">Bahasa & Wilayah</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Bahasa
            </Label>
            <Select
              value={settings.language}
              onValueChange={(value) => setSettings({ ...settings, language: value })}
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Lokasi Utama
            </Label>
            <Input
              id="location"
              value={settings.location}
              onChange={(e) => setSettings({ ...settings, location: e.target.value })}
              placeholder="Jakarta"
            />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-slate-900 dark:text-slate-100" />
          <h3 className="text-slate-900 dark:text-slate-100">Notifikasi</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Terima notifikasi melalui email
              </p>
            </div>
            <Switch
              checked={settings.notifications.email}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, email: checked },
                })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notification</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Notifikasi langsung di browser
              </p>
            </div>
            <Switch
              checked={settings.notifications.push}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, push: checked },
                })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Terima notifikasi via SMS
              </p>
            </div>
            <Switch
              checked={settings.notifications.sms}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, sms: checked },
                })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Promo & Penawaran</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Dapatkan info promo terbaru
              </p>
            </div>
            <Switch
              checked={settings.notifications.promo}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, promo: checked },
                })
              }
            />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={handleSave} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4" />
          Simpan Pengaturan
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Batal
        </Button>
      </div>
    </motion.div>
  );
};
