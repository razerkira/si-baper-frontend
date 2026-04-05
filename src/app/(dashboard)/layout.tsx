"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Package, FileText, ClipboardList, LayoutDashboard, LogOut, User as UserIcon, History, Users } from "lucide-react";
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

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Katalog Barang", href: "/katalog", icon: Package },
    { name: "Permintaan", href: "/permintaan", icon: FileText },
    { name: "Persetujuan", href: "/persetujuan", icon: ClipboardList },
    { name: "Laporan Mutasi", href: "/laporan", icon: History },
    { name: "Manajemen Pengguna", href: "/pengguna", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        {/* Tinggi kontainer diubah menjadi h-20 (80px) agar logo bisa lebih besar */}
        <div className="h-20 flex items-center justify-center border-b p-4">
          <Link href="/">
            <Image 
              src="/si-baper.webp" 
              alt="Logo SI-BAPER" 
              width={220}  /* Lebar diperbesar */
              height={70}  /* Tinggi diperbesar */
              className="object-contain w-auto h-full" /* max-h-12 dihapus agar bisa menyesuaikan h-full dari kontainer */
              priority
            />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tinggi header utama disamakan dengan header sidebar yaitu h-20 agar sejajar */}
        <header className="h-20 bg-white border-b flex items-center justify-between px-8 shadow-sm shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">
            Inspektorat Jenderal Kementerian Hak Asasi Manusia Republik Indonesia
          </h2>

          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar className="h-10 w-10 border-2 border-transparent hover:border-blue-200 transition-all cursor-pointer">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profil">
                <DropdownMenuItem className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profil Saya</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}