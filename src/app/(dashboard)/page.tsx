"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";
import { format, isSameDay } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// KOMPONEN CUSTOM
import { CustomCalendar } from "@/components/ui/custom-calendar";
import { Loading } from "@/components/ui/loading"; // <-- IMPORT KOMPONEN LOADING BARU

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

  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
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

    const fetchData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/inventory/logs")
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

  const selectedDateActivities = activities.filter((activity) =>
    date && isSameDay(new Date(activity.TransactionDate), date)
  );

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Selamat datang kembali, <span className="font-semibold text-[#6366f1]">{userName || "Admin"}</span>!
        </p>
      </div>

      {isLoading ? (
        // PANGGIL KOMPONEN LOADING DI SINI
        <Loading />
      ) : (
        <>
          {/* --- KOTAK STATISTIK --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                <div>
                  <p className="text-[13px] text-slate-500 font-medium mb-1">Katalog</p>
                  <CardTitle className="text-base font-bold text-slate-800">Total Barang</CardTitle>
                </div>
                <img src="/lockers.gif" alt="Total Barang" className="h-10 w-10 object-contain" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{stats?.total_items || 0}</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                <div>
                  <p className="text-[13px] text-slate-500 font-medium mb-1">Permintaan</p>
                  <CardTitle className="text-base font-bold text-slate-800">Menunggu Persetujuan</CardTitle>
                </div>
                <img src="/clock.gif" alt="Menunggu Persetujuan" className="h-10 w-10 object-contain" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{stats?.pending_requests || 0}</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                <div>
                  <p className="text-[13px] text-slate-500 font-medium mb-1">Permintaan</p>
                  <CardTitle className="text-base font-bold text-slate-800">Total Permintaan</CardTitle>
                </div>
                <img src="/task-management.gif" alt="Total Permintaan" className="h-10 w-10 object-contain" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{stats?.total_requests || 0}</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                <div>
                  <p className="text-[13px] text-slate-500 font-medium mb-1">Permintaan</p>
                  <CardTitle className="text-base font-bold text-slate-800">Disetujui</CardTitle>
                </div>
                <img src="/form.gif" alt="Disetujui" className="h-10 w-10 object-contain" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{stats?.approved_requests || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* --- BAGIAN KALENDER & AKTIVITAS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 items-start h-auto lg:h-[calc(100vh-280px)] min-h-[550px]">
            
            {/* Widget Kalender */}
            <Card className="col-span-1 shadow-sm border-slate-200 flex flex-col h-full">
              <CardHeader className="pb-0 shrink-0">
                <CardTitle className="text-base font-bold text-slate-800">
                  Kalender Sistem
                </CardTitle>
                <CardDescription className="text-xs">Pilih tanggal untuk melihat aktivitas</CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 flex-1 flex flex-col w-full px-6 pb-6">
                <CustomCalendar 
                  selected={date} 
                  onSelect={setDate} 
                />
              </CardContent>
            </Card>

            {/* Widget Daftar Aktivitas */}
            <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200 flex flex-col h-full">
              <CardHeader className="pb-4 shrink-0">
                <CardTitle className="text-base font-bold text-slate-800">
                  Aktivitas - {date ? format(date, "d MMMM yyyy", { locale: localeID }) : "..."}
                </CardTitle>
                <CardDescription className="text-xs">Riwayat barang masuk dan keluar di Gudang</CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0 flex-1 overflow-y-auto">
                {selectedDateActivities.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 pb-8">
                    <img src="/form.gif" alt="Kosong" className="h-16 w-16 opacity-50 grayscale object-contain" />
                    <p className="text-sm">Tidak ada pergerakan barang pada tanggal ini.</p>
                  </div>
                ) : (
                  <div className="space-y-3 pr-2 pb-4">
                    {selectedDateActivities.map((activity) => (
                      <div key={activity.ID} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white">
                        
                        <div className="flex items-center gap-4">
                          {/* Ikon IN / OUT Box */}
                          <div className={`p-2 rounded-lg border ${activity.TransactionType === 'IN' ? 'border-emerald-200 text-emerald-500' : 'border-[#6366f1]/30 text-[#6366f1]'}`}>
                            {activity.TransactionType === 'IN' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                          </div>
                          
                          {/* Detail Aktivitas */}
                          <div>
                            <p className="text-[14px] font-bold text-slate-800">
                              {activity.Item.Name}
                            </p>
                            <p className="text-[12px] text-slate-500 leading-tight mt-0.5">
                              Oleh: {activity.User?.FullName || "Admin"}<br/>
                              {format(new Date(activity.TransactionDate), "HH:mm 'WIB'")}
                            </p>
                          </div>
                        </div>
                        
                        {/* Badge Jumlah */}
                        <div>
                          <Badge className={`rounded-md px-3 py-1 font-medium text-white shadow-none ${activity.TransactionType === 'IN' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-[#ff3b3b] hover:bg-[#e63535]'}`}>
                            {activity.TransactionType === 'IN' ? '+' : '-'}{activity.Quantity} {activity.Item.Unit || ''}
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