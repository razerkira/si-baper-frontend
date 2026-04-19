"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  Package, FileText, ClipboardList, LayoutDashboard, 
  LogOut, User as UserIcon, History, Users, 
  Menu, X
} from "lucide-react";
import Cookies from "js-cookie";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // State untuk mengontrol Sidebar di mode Mobile (HP)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Katalog Barang", href: "/katalog", icon: Package },
    { name: "Permintaan", href: "/permintaan", icon: FileText },
    { name: "Pengajuan", href: "/pengajuan", icon: FileText },
    { name: "Persetujuan", href: "/persetujuan", icon: ClipboardList },
    { name: "Laporan Mutasi", href: "/laporan", icon: History },
    { name: "Manajemen Pengguna", href: "/pengguna", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-[#f0f4f8] text-slate-900 overflow-hidden">
      
      {/* OVERLAY GELAP: Muncul di HP saat menu terbuka, klik untuk menutup menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR: Tema Biru Otoritas */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1e3a8a] text-white border-r border-blue-900 shadow-2xl md:shadow-lg flex flex-col shrink-0 
        transform transition-transform duration-300 ease-in-out
        /* Logika Responsif: Di HP geser ke luar layar jika tertutup, di Laptop (md) selalu muncul */
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0
      `}>
        
        {/* Header Sidebar & Logo */}
        <div className="h-20 md:h-28 flex items-center justify-center border-b border-blue-800/50 p-4 relative">
          {/* Tombol Silang (X) hanya muncul di HP - warna disesuaikan agar terlihat di background gelap */}
          <button 
            className="md:hidden absolute top-4 right-4 text-blue-200 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>

          <Link href="/" className="flex items-center justify-center w-full mt-2 md:mt-0">
            {/* Asumsi logo kamu memiliki teks berwarna terang. Jika teks logo gelap, 
                kamu mungkin perlu menggunakan logo versi putih/terang untuk sidebar ini. */}
            <Image 
              src="/logo-si-baper.webp" 
              alt="Logo SI-BAPER" 
              width={160}  
              height={60}  
              className="h-auto w-auto max-h-[60px] md:max-h-[80px] object-contain drop-shadow-md" 
              priority
              unoptimized
            />
          </Link>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                // Saat menu diklik di HP, otomatis tutup sidebar-nya
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-600 text-white font-bold shadow-md transform scale-[1.02]" 
                    : "text-blue-200 hover:bg-blue-800 hover:text-white font-medium"
                }`}
              >
                <Icon size={20} className={isActive ? "text-white" : "text-blue-300"} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER ATAS: Tetap putih agar bersih dan kontras dengan sidebar */}
        <header className="h-20 md:h-28 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm shrink-0">
          
          <div className="flex items-center gap-4">
            {/* TOMBOL HAMBURGER: Hanya muncul di HP (dihilangkan di md) */}
            <button 
              className="md:hidden p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={28} />
            </button>

            {/* Judul Header: Responsif agar tidak berantakan di HP */}
            <div className="flex flex-col">
              <h2 className="text-base md:text-lg font-bold text-slate-800 leading-tight">
                SI-BAPER <span className="hidden sm:inline">Inspektorat Jenderal</span>
              </h2>
              <p className="text-[10px] md:text-xs text-slate-500 hidden sm:block">
                Kementerian Hak Asasi Manusia Republik Indonesia
              </p>
            </div>
          </div>

          {/* PROFIL & DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar className="h-9 w-9 md:h-11 md:w-11 border-2 border-transparent hover:border-blue-300 transition-all cursor-pointer shadow-sm">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profil">
                <DropdownMenuItem className="cursor-pointer py-2">
                  <UserIcon className="mr-3 h-4 w-4 text-slate-500" />
                  <span className="font-medium">Profil Saya</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2 text-red-600 focus:text-red-700 focus:bg-red-50">
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-bold">Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* KONTEN HALAMAN (CHILDREN): Background abu-abu kebiruan yang sangat muda */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f0f4f8]">
          {children}
        </main>
      </div>

    </div>
  );
}