"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";
import { format, isSameDay } from "date-fns";
import { id as localeID } from "date-fns/locale"; // Untuk format tanggal Bahasa Indonesia
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, FileText, CheckCircle, Clock, Loader2, CalendarDays, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

// Struktur data dari backend
interface DashboardStats {
  total_items: number;
  pending_requests: number;
  approved_requests: number;
  total_requests: number;
}

interface ActivityLog {
  ID: number;
  Item: { Name: string; Unit: string; };
  TransactionType: string;
  Quantity: number;
  User: { FullName: string; };
  TransactionDate: string;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk kalender
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    // 1. Ambil nama user dari Cookies
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        setUserName(userData.full_name);
        
        if (userData.role_id === 1) setUserRole("Admin Gudang");
        else if (userData.role_id === 2) setUserRole("Pegawai");
        else if (userData.role_id === 3) setUserRole("Verifikator");
      } catch (error) {
        console.error("Gagal membaca data user", error);
      }
    }

    // 2. Ambil data statistik DAN log aktivitas secara bersamaan
    const fetchData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/inventory/logs") // Kita gunakan endpoint audit trail sebagai aktivitas
        ]);
        setStats(statsRes.data.data);
        setActivities(logsRes.data.data || []);
      } catch (error) {
        console.error("Gagal mengambil data dashboard", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter aktivitas berdasarkan tanggal yang dipilih di kalender
  const selectedDateActivities = activities.filter((activity) =>
    date && isSameDay(new Date(activity.TransactionDate), date)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Selamat datang kembali, <span className="font-semibold text-blue-700">{userName || "Pengguna"}</span> {userRole && `(${userRole})`}.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          Memuat data statistik...
        </div>
      ) : (
        <>
          {/* --- KOTAK STATISTIK --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500 shadow-sm transition-transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-600">Total Barang (Katalog)</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">{stats?.total_items || 0}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 shadow-sm transition-transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-600">Menunggu Persetujuan</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">{stats?.pending_requests || 0}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-sm transition-transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-600">Permintaan Disetujui</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">{stats?.approved_requests || 0}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-sm transition-transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-600">Total Permintaan</CardTitle>
                <FileText className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">{stats?.total_requests || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* --- BAGIAN KALENDER & AKTIVITAS HARI INI --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            
            {/* Widget Kalender */}
            <Card className="col-span-1 shadow-sm">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="flex items-center text-lg">
                  <CalendarDays className="h-5 w-5 mr-2 text-blue-600" /> Kalender Sistem
                </CardTitle>
                <CardDescription>Pilih tanggal untuk melihat aktivitas</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border shadow-sm"
                  locale={localeID} // Bahasa Indonesia
                />
              </CardContent>
            </Card>

            {/* Widget Daftar Aktivitas */}
            <Card className="col-span-1 lg:col-span-2 shadow-sm flex flex-col">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-lg">
                  Aktivitas pada {date ? format(date, "dd MMMM yyyy", { locale: localeID }) : "..."}
                </CardTitle>
                <CardDescription>Riwayat barang masuk dan keluar di gudang</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex-1 overflow-y-auto max-h-[350px]">
                {selectedDateActivities.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 py-10">
                    <CheckCircle className="h-10 w-10 text-slate-300" />
                    <p>Tidak ada pergerakan barang pada tanggal ini.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateActivities.map((activity) => (
                      <div key={activity.ID} className="flex items-start gap-4 p-3 rounded-lg border bg-slate-50 hover:bg-slate-100 transition-colors">
                        
                        {/* Ikon IN / OUT */}
                        <div className={`p-2 rounded-full mt-1 ${activity.TransactionType === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {activity.TransactionType === 'IN' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                        </div>
                        
                        {/* Detail Aktivitas */}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            {activity.Item.Name}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Oleh: <span className="font-medium">{activity.User?.FullName || "Sistem"}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {format(new Date(activity.TransactionDate), "HH:mm 'WIB'")}
                          </p>
                        </div>
                        
                        {/* Badge Jumlah */}
                        <div className="text-right">
                          <Badge className={activity.TransactionType === 'IN' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}>
                            {activity.TransactionType === 'IN' ? '+' : '-'}{activity.Quantity} {activity.Item.Unit}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </>
      )}
    </div>
  );
}