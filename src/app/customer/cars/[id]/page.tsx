"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Calendar, User, Loader2, MessageCircle, Globe, 
  CheckCircle, Building2, UserCircle, AlertTriangle, Upload, FileText, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { toast } from "sonner";
import api from "@/lib/axios";
import { differenceInDays, parseISO, format, isWithinInterval, areIntervalsOverlapping, addDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import axios from "axios";

// --- TYPE DEFINITIONS ---

interface Car {
  id: number;
  nama_mobil: string;
  merk: string;
  harga_per_hari: string;
  gambar_url: string | null;
  transmisi_display: string;
  kapasitas_kursi: number;
  tahun: number;
  keterangan?: string;
}

interface Driver {
  id: number;
  nama: string;
  harga_per_hari: string;
}

interface PersonalProfile {
  nama: string;
  no_hp: string;
  alamat: string;
  ktp: string; 
  foto_ktp?: string | null; 
}

interface CorporateProfile {
  nama_perusahaan: string;
  npwp: string;
  alamat_kantor: string;
  nama_pic: string;
  jabatan_pic: string;
  no_hp_pic: string;
}

// Tipe data untuk tanggal yang sudah dibooking
interface BookedDate {
    tanggal_mulai: string;
    tanggal_selesai: string;
}

interface PaginatedResponse<T> {
    results: T[];
}
type ApiResponse<T> = T[] | PaginatedResponse<T>;

function getResults<T>(data: ApiResponse<T>): T[] {
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && data !== null && 'results' in data) return data.results;
    return [];
}

type CustomerType = "personal" | "corporate";
type BookingMethod = "website" | "whatsapp";

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  // Data State
  const [car, setCar] = useState<Car | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [blockedDates, setBlockedDates] = useState<BookedDate[]>([]); // State baru untuk tanggal sibuk
  
  // Form State
  const [customerType, setCustomerType] = useState<CustomerType>("personal");
  const [bookingMethod, setBookingMethod] = useState<BookingMethod>("website");
  
  // Profile Data State
  const [personalData, setPersonalData] = useState<PersonalProfile>({ nama: "", no_hp: "", alamat: "", ktp: "" });
  const [corporateData, setCorporateData] = useState<CorporateProfile>({ 
      nama_perusahaan: "", npwp: "", alamat_kantor: "", nama_pic: "", jabatan_pic: "", no_hp_pic: "" 
  });

  // Booking Data State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [useDriver, setUseDriver] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [catatan, setCatatan] = useState("");
  const [ktpFile, setKtpFile] = useState<File | null>(null);

  // Logic State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false); 
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Check if KTP is available (either freshly uploaded OR already in profile)
  const isKtpAvailable = !!ktpFile || !!personalData.foto_ktp;

  // 1. FETCH DATA INITIAL (CAR + PROFILE + UNAVAILABLE DATES)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. Fetch Mobil
        const resCar = await api.get<Car>(`/mobil/${id}/`);
        setCar(resCar.data);

        // B. Fetch Tanggal Sibuk (Fitur Baru)
        try {
            const resDates = await api.get<BookedDate[]>(`/mobil/${id}/unavailable_dates/`);
            setBlockedDates(resDates.data);
        } catch (err) {
            console.warn("Failed to fetch blocked dates", err);
        }

        // C. Fetch Profil User
        try {
            const resUser = await api.get('/pelanggan/'); 
            
            let profiles: PersonalProfile[] = [];
            if (Array.isArray(resUser.data)) {
                profiles = resUser.data;
            } else if ('results' in resUser.data) {
                profiles = resUser.data.results;
            }

            if (profiles.length > 0) {
                const myProfile = profiles[0];
                setPersonalData(myProfile);
                
                if (myProfile.nama && myProfile.no_hp && myProfile.alamat && myProfile.ktp) {
                    setIsProfileComplete(true);
                } else {
                    setIsProfileComplete(false);
                }
            } else {
                setIsProfileComplete(false);
            }
        } catch (userError) {
            console.warn("Failed to check user profile", userError);
            setIsProfileComplete(false);
        }

      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load car data.");
        router.push("/customer/cars");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  // 2. FETCH DRIVERS
  useEffect(() => {
    // Jalankan jika useDriver aktif DAN data drivers belum ada
    if (useDriver && drivers.length === 0) {
      const loadDrivers = async () => {
          try {
            const res = await api.get<ApiResponse<Driver>>("/supir/?status=tersedia");
            const driverList = getResults(res.data);
            setDrivers(driverList);

            // LOGIKA BARU: Otomatis pilih supir pertama jika ada
            if (driverList.length > 0) {
                setSelectedDriver(driverList[0].id.toString());
            }
          } catch (e) { console.error(e); }
      };
      loadDrivers();
    }
  }, [useDriver, drivers.length]);

  // --- LOGIC VALIDASI TANGGAL ---
  const checkDateValidity = (start: string, end: string) => {
    if (!start || !end) return true;

    const startDateObj = parseISO(start);
    const endDateObj = parseISO(end);

    // 1. Cek tanggal terbalik
    if (startDateObj > endDateObj) {
        toast.warning("Tanggal selesai harus setelah tanggal mulai.");
        setTotalDays(0); setTotalPrice(0);
        return false;
    }

    // 2. Cek apakah ada tanggal yang bentrok dengan jadwal yang sudah ada
    const hasOverlap = blockedDates.some(blocked => {
        const blockedStart = parseISO(blocked.tanggal_mulai);
        const blockedEnd = parseISO(blocked.tanggal_selesai);

        return areIntervalsOverlapping(
            { start: startDateObj, end: endDateObj },
            { start: blockedStart, end: blockedEnd },
            { inclusive: true } // Overlap hitungan hari yang sama
        );
    });

    if (hasOverlap) {
        toast.error("Mobil tidak tersedia di rentang tanggal tersebut. Silakan cek tanggal lain.");
        setTotalDays(0); setTotalPrice(0);
        return false;
    }

    return true;
  };

  // 3. CALCULATE PRICE & VALIDATE
  useEffect(() => {
    if (startDate && endDate && car) {
      // Validasi Bentrok
      const isValid = checkDateValidity(startDate, endDate);
      if (!isValid) return; // Stop kalkulasi jika tanggal tidak valid

      const start = parseISO(startDate);
      const end = parseISO(endDate);
      
      const days = differenceInDays(end, start) + 1;
      setTotalDays(days);

      let basePrice = parseFloat(car.harga_per_hari) * days;
      if (useDriver && selectedDriver) {
        const d = drivers.find((x) => x.id.toString() === selectedDriver);
        if (d) basePrice += parseFloat(d.harga_per_hari) * days;
      }
      setTotalPrice(basePrice);
    }
  }, [startDate, endDate, useDriver, selectedDriver, car, drivers, blockedDates]);

  // 4. HANDLE SUBMIT
  const handleBooking = async () => {
    if (!startDate || !endDate) return toast.warning("Please select rental dates!");
    
    // Final Validasi sebelum kirim
    if (!checkDateValidity(startDate, endDate)) return;

    if (useDriver && !selectedDriver) return toast.warning("Please select a driver!");
    
    if (bookingMethod === "website") {
        if (customerType === "personal") {
            if (!isProfileComplete) {
                toast.error("Your profile is incomplete. Please update it in the Profile menu.");
                return;
            }
            if (!isKtpAvailable) {
                toast.warning("Uploading an ID Card (KTP) photo is mandatory!");
                return;
            }
        } else {
            if (!corporateData.nama_perusahaan || !corporateData.npwp || !corporateData.nama_pic) {
                return toast.warning("Please complete the company details!");
            }
        }
    }

    setIsSubmitting(true);

    try {
        if (bookingMethod === "website") {
            const isCorp = customerType === "corporate";
            
            const formData = new FormData();
            formData.append("mobil", car!.id.toString());
            formData.append("tanggal_mulai", startDate);
            formData.append("tanggal_selesai", endDate);
            formData.append("type_pesanan", "online");
            formData.append("catatan", catatan);
            if (useDriver && selectedDriver) formData.append("supir", selectedDriver);
            
            formData.append("is_corporate", isCorp ? "true" : "false");
            
            if (isCorp) {
                formData.append("perusahaan_nama", corporateData.nama_perusahaan);
                formData.append("perusahaan_npwp", corporateData.npwp);
                formData.append("perusahaan_alamat", corporateData.alamat_kantor);
                formData.append("perusahaan_pic", corporateData.nama_pic);
                formData.append("perusahaan_pic_kontak", corporateData.no_hp_pic);
            } else {
                if (ktpFile) {
                    formData.append("foto_ktp", ktpFile);
                }
            }

            await api.post("/pesanan/", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Booking Successful! Please wait for admin confirmation.");
            router.push("/customer/orders");
        } else {
            // WHATSAPP METHOD
            const phoneAdmin = "6281365338011"; 
            const startFmt = format(parseISO(startDate), "dd MMM yyyy", { locale: idLocale });
            const endFmt = format(parseISO(endDate), "dd MMM yyyy", { locale: idLocale });
            
            let userDetailWA = "";
            if (customerType === "personal") {
                userDetailWA = `👤 *Renter:* ${personalData.nama}\n🆔 *ID:* ${personalData.ktp}`;
            } else {
                userDetailWA = `🏢 *Company:* ${corporateData.nama_perusahaan}\n👨‍💼 *PIC:* ${corporateData.nama_pic}`;
            }

            const message = 
`Halo Admin, I want to book a unit via WA:

🚘 *${car!.nama_mobil}*
📅 ${startFmt} to ${endFmt} (${totalDays} Days)
${useDriver ? "✅ With Driver" : "❌ Self Drive"}

${userDetailWA}
📝 *Note:* ${catatan || "-"}

💰 Estimate: Rp ${totalPrice.toLocaleString("id-ID")}`;

            window.open(`https://wa.me/${phoneAdmin}?text=${encodeURIComponent(message)}`, "_blank");
        }

    } catch (error: unknown) {
        console.error(error);
        if (axios.isAxiosError(error)) {
             // Tangkap error validasi spesifik dari serializer backend
             const errData = error.response?.data;
             if (errData?.mobil) {
                 toast.error(errData.mobil[0]); // Pesan: "Mobil tidak tersedia..."
             } else if (errData?.detail) {
                 toast.error(errData.detail);
             } else {
                 toast.error("Failed to process booking.");
             }
        } else {
             toast.error("System error occurred.");
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading || !car) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>;
  }

  // Helper: Tanggal minimum adalah hari ini
  const minDate = new Date().toISOString().split("T")[0];

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 md:py-12"
    >
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-slate-200 dark:hover:bg-slate-800">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: CAR INFO */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-none shadow-lg bg-white dark:bg-slate-800">
              <div className="relative h-[300px] sm:h-[400px]">
                <ImageWithFallback
                  src={car.gambar_url || "/images/placeholder-car.jpg"}
                  alt={car.nama_mobil}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow-md">
                  Rp {parseInt(car.harga_per_hari).toLocaleString("id-ID")} / day
                </div>
              </div>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">{car.nama_mobil}</h1>
                <p className="text-slate-500 mb-4">{car.merk} • {car.tahun}</p>
                
                {/* Data Completeness Info */}
                {bookingMethod === "website" && customerType === "personal" && (
                    <div className={`mb-6 p-4 border rounded-lg flex items-start gap-3 ${isProfileComplete ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                        {isProfileComplete ? (
                            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                            <h4 className={`font-bold text-sm ${isProfileComplete ? "text-green-700" : "text-red-700"}`}>
                                {isProfileComplete ? "Profile Verified" : "Profile Incomplete"}
                            </h4>
                            <p className={`text-xs mt-1 ${isProfileComplete ? "text-green-600" : "text-red-600"}`}>
                                {isProfileComplete 
                                    ? "Your personal data is complete. You can proceed with the booking." 
                                    : "You must complete your Name, Phone Number, Address, and NIK in the Profile menu before booking."
                                }
                            </p>
                            {!isProfileComplete && (
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                                    onClick={() => router.push("/customer/profile")}
                                >
                                    Complete Profile Now
                                </Button>
                            )}
                        </div>
                    </div>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: BOOKING FORM */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 shadow-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                    <Calendar className="h-5 w-5 text-blue-600" /> Booking Form
                </h2>

                <div className="mb-6 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg grid grid-cols-2 gap-1">
                    <button 
                        onClick={() => setCustomerType("personal")}
                        className={`py-2 px-3 rounded-md text-sm font-medium transition-all ${customerType === "personal" ? "bg-white dark:bg-slate-700 shadow text-blue-600" : "text-slate-500"}`}
                    >
                        <UserCircle className="h-4 w-4 inline mr-2" /> Personal
                    </button>
                    <button 
                        onClick={() => setCustomerType("corporate")}
                        className={`py-2 px-3 rounded-md text-sm font-medium transition-all ${customerType === "corporate" ? "bg-white dark:bg-slate-700 shadow text-purple-600" : "text-slate-500"}`}
                    >
                        <Building2 className="h-4 w-4 inline mr-2" /> Corporate
                    </button>
                </div>

                <Tabs value={bookingMethod} onValueChange={(v) => setBookingMethod(v as BookingMethod)} className="mb-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="website" className="gap-2"><Globe className="h-4 w-4" /> Website</TabsTrigger>
                        <TabsTrigger value="whatsapp" className="gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="space-y-4">
                    {/* TANGGAL INPUT DENGAN VALIDASI */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Start Date</Label>
                            <Input 
                                type="date" 
                                min={minDate} 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)}
                                className="cursor-pointer"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">End Date</Label>
                            <Input 
                                type="date" 
                                min={startDate || minDate} 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)} 
                                className="cursor-pointer"
                            />
                        </div>
                    </div>
                    {/* Info Tanggal Sibuk Sederhana */}
                    {blockedDates.length > 0 && (
                        <p className="text-[10px] text-red-500 mt-1">
                            *Mobil ini memiliki jadwal sibuk. Jika tanggal tidak bisa dipilih/gagal, berarti sudah dibooking.
                        </p>
                    )}

                    {/* Driver Option */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-500" />
                            <Label htmlFor="driver-switch" className="cursor-pointer text-sm">With Driver</Label>
                        </div>
                        <Switch id="driver-switch" checked={useDriver} onCheckedChange={setUseDriver} />
                    </div>

                    {useDriver && (
                        <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                            <SelectTrigger><SelectValue placeholder="Select Driver..." /></SelectTrigger>
                            <SelectContent>
                                {drivers.map(d => (
                                    <SelectItem key={d.id} value={d.id.toString()}>
                                        {d.nama} (+Rp {parseInt(d.harga_per_hari).toLocaleString('id-ID')})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* --- WEBSITE SPECIFIC INPUTS --- */}
                    {bookingMethod === "website" && (
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2">
                            {customerType === "personal" ? (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                                        <p className="flex justify-between"><span>Renter:</span> <strong>{personalData.nama || "..."}</strong></p>
                                        <p className="flex justify-between"><span>ID:</span> <strong>{personalData.ktp || "..."}</strong></p>
                                    </div>

                                    {/* KTP UPLOAD SECTION */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold">Original ID Card (KTP) <span className="text-red-500">*</span></Label>
                                            
                                            {/* STATUS BADGE */}
                                            {isKtpAvailable ? (
                                                <span className="flex items-center text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 font-bold">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> ID Card Uploaded
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 font-bold">
                                                    <XCircle className="w-3 h-3 mr-1" /> Upload Required
                                                </span>
                                            )}
                                        </div>

                                        <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${isKtpAvailable ? "border-green-300 bg-green-50/50 hover:bg-green-50" : "border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"}`}>
                                            <Input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => e.target.files && setKtpFile(e.target.files[0])} 
                                                className="hidden" 
                                                id="ktp-upload"
                                            />
                                            <label htmlFor="ktp-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                                {isKtpAvailable ? (
                                                    <>
                                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                                        <span className="text-xs text-green-700 font-medium">
                                                            {ktpFile ? ktpFile.name : "ID Card Available in Profile"}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 underline">Click to change</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="h-6 w-6 text-slate-400" />
                                                        <span className="text-xs text-slate-500">
                                                            Click to upload photo
                                                        </span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Corporate Form
                                <div className="space-y-3">
                                    <Input placeholder="Company Name PT / CV" value={corporateData.nama_perusahaan} onChange={(e) => setCorporateData({...corporateData, nama_perusahaan: e.target.value})} className="h-9 text-sm" />
                                    <Input placeholder="Company NPWP" value={corporateData.npwp} onChange={(e) => setCorporateData({...corporateData, npwp: e.target.value})} className="h-9 text-sm" />
                                    <Input placeholder="PIC Name" value={corporateData.nama_pic} onChange={(e) => setCorporateData({...corporateData, nama_pic: e.target.value})} className="h-9 text-sm" />
                                    <Textarea placeholder="Office Address" value={corporateData.alamat_kantor} onChange={(e) => setCorporateData({...corporateData, alamat_kantor: e.target.value})} className="min-h-[60px] text-sm" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* NOTES FIELD */}
                    <div className="pt-2">
                        <Label className="text-xs mb-1 block">Notes (Optional)</Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Textarea 
                                placeholder="Additional requests..." 
                                className="-h-[80px] pl-9 text-sm"
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-dashed border-slate-300 dark:border-slate-600">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-slate-500 text-sm">Total Cost ({totalDays} Days)</span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">Rp {totalPrice.toLocaleString('id-ID')}</span>
                        </div>

                        <Button 
                            className={`w-full py-6 text-lg shadow-lg ${bookingMethod === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                            onClick={handleBooking}
                            disabled={isSubmitting || totalDays <= 0 || (bookingMethod === 'website' && customerType === 'personal' && !isProfileComplete)}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : (
                                bookingMethod === 'whatsapp' ? <><MessageCircle className="mr-2" /> Order via WA</> : <><CheckCircle className="mr-2" /> Book Now</>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
          </div>

        </div>
      </div>
    </motion.div>
  );
}