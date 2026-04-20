// src/app/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { Search, FileEdit, Activity, ChevronDown, Check } from 'lucide-react';

// --- Tipe Data ---
interface UserProfile {
  id: number;
  name: string;
  email: string;
  nip?: string;
}

interface CatalogItem {
  ID: number;
  Name: string;
  CurrentStock: number;
  Unit: string;
}

interface RequestHistory {
  ID: number;
  Status: string;
  Notes: string;
  RequestDetails: {
    Item: CatalogItem;
    QuantityRequested: number;
  }[];
}

interface SubmissionHistory {
  ID: number;
  item_name?: string;
  ItemName?: string;
  quantity?: number;
  Quantity?: number;
  status?: string;
  Status?: string;
}

export default function BerandaPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [reqHistory, setReqHistory] = useState<RequestHistory[]>([]);
  const [subHistory, setSubHistory] = useState<SubmissionHistory[]>([]);

  // State untuk Custom Combobox Pencarian Barang
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formPermintaan, setFormPermintaan] = useState({
    nip: "",
    barangId: "",
    namaBarangDipilih: "",
    catatan: "",
    jumlah: ""
  });

  const [formPengajuan, setFormPengajuan] = useState({
    nip: "",
    namaBarang: "",
    jumlah: ""
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    
    Promise.allSettled([
      api.get("/public/items").then(res => setCatalog(res.data.data || [])),
      api.get("/users/profile").then(async (res) => {
        setIsLoggedIn(true);
        setUser(res.data.data);
        const reqRes = await api.get("/requests/my-history");
        setReqHistory(reqRes.data.data || []);
        const subRes = await api.get("/submissions/my-history");
        const sData = subRes.data.data || subRes.data || [];
        setSubHistory(Array.isArray(sData) ? sData : []);
      }).catch(() => {
        setIsLoggedIn(false);
      })
    ]).finally(() => {
      setTimeout(() => setIsLoading(false), 800); 
    });
  }, []);

  const handlePermintaanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPermintaan.nip || !formPermintaan.barangId || !formPermintaan.jumlah) {
      return toast.error("NIP, Barang, dan Jumlah wajib diisi!");
    }

    const loadingToast = toast.loading("Mengirim permintaan...");
    try {
      await api.post("/public/requests", {
        nip: formPermintaan.nip,
        notes: formPermintaan.catatan,
        items: [
          {
            item_id: parseInt(formPermintaan.barangId),
            quantity_requested: parseInt(formPermintaan.jumlah)
          }
        ]
      });
      toast.success("Berhasil! Permintaan Anda telah masuk ke sistem.", { id: loadingToast });
      setFormPermintaan({ nip: "", barangId: "", namaBarangDipilih: "", catatan: "", jumlah: "" });
      setSearchQuery("");
    } catch (error: any) {
      toast.error("Gagal mengirim: " + (error.response?.data?.error || "Pastikan NIP Anda benar."), { id: loadingToast });
    }
  };

  const handlePengajuanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPengajuan.nip || !formPengajuan.namaBarang || !formPengajuan.jumlah) {
      return toast.error("NIP, Nama Barang, dan Jumlah wajib diisi!");
    }

    const loadingToast = toast.loading("Mengirim pengajuan...");
    try {
      await api.post("/public/submissions", {
        nip: formPengajuan.nip,
        item_name: formPengajuan.namaBarang,
        quantity: parseInt(formPengajuan.jumlah)
      });
      toast.success("Berhasil! Pengajuan barang baru telah dikirim.", { id: loadingToast });
      setFormPengajuan({ nip: "", namaBarang: "", jumlah: "" });
    } catch (error: any) {
      toast.error("Gagal mengirim: " + (error.response?.data?.error || "Pastikan NIP Anda benar."), { id: loadingToast });
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("disetujui") || s.includes("approved")) {
      return <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">Disetujui</span>;
    } else if (s.includes("ditolak") || s.includes("rejected")) {
      return <span className="bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">Ditolak</span>;
    } else {
      return <span className="bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">Menunggu</span>;
    }
  };

  const filteredCatalog = catalog.filter(item => 
    item.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen font-sans flex flex-col bg-[#0A0ED4]">
      <Toaster position="top-center" reverseOrder={false} />

      <header className="bg-white p-4 shadow-sm flex justify-between items-center px-6 md:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo-si-baper.webp" alt="SI-BAPER Logo" className="w-12 h-12 object-contain" />
          <div className="flex flex-col text-slate-800">
            <span className="text-xl font-bold leading-none">SI-BAPER</span>
            <span className="text-[11px] font-semibold opacity-70">Kementerian Hak Asasi Manusia</span>
          </div>
        </div>
        
        {isLoggedIn ? (
          <Link href="/dasbor">
            <button className="bg-[#0A0ED4] text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-800 transition-all shadow-md">
              Ke Dasbor
            </button>
          </Link>
        ) : (
          <Link href="/login">
            <button className="bg-white text-[#0A0ED4] font-bold px-6 py-2 rounded-lg border-2 border-[#0A0ED4] hover:bg-blue-50 transition-all active:scale-95">
              Log In
            </button>
          </Link>
        )}
      </header>

      <main className="grow flex flex-col pb-20">
        <div className="text-white pt-16 pb-32 px-6 md:px-16 relative">
          <section className="flex flex-col md:flex-row items-center gap-10 max-w-7xl mx-auto">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-md">
                SISTEM INFORMASI<br /> BARANG PERSEDIAAN
              </h1>
              <p className="text-xl md:text-2xl font-medium opacity-90 text-blue-100">Kementerian Hak Asasi Manusia</p>
              
              {/* TOMBOL BUKU PANDUAN: Hijau sesuai gambar */}
              <button 
                type="button"
                className="bg-[#00a651] text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-[#008c44] shadow-xl transition-all hover:-translate-y-1 mt-4"
              >
                Buku Panduan
              </button>

            </div>
            <div className="flex-1 flex justify-center">
              <img 
                src="/si-baper-homepage-orang.png"
                alt="Illustration"
                className="w-full max-w-xl drop-shadow-2xl md:-mt-10"
              />
            </div>
          </section>
        </div>

        <div className="max-w-7xl mx-auto w-full px-6 md:px-16 -mt-16 relative z-10 mb-16">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-full text-[#0A0ED4]">
                <Search size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">1. Pilih Barang</h3>
                <p className="text-sm text-slate-500">Cari barang yang tersedia di katalog atau ajukan barang baru.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-full text-[#0A0ED4]">
                <FileEdit size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">2. Isi Formulir</h3>
                <p className="text-sm text-slate-500">Masukkan NIP dan lengkapi detail permintaan kebutuhan Anda.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-full text-green-700">
                <Activity size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">3. Pantau Status</h3>
                <p className="text-sm text-slate-500">Lacak apakah permintaan disetujui, ditolak, atau masih menunggu.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-16 space-y-24 max-w-7xl mx-auto w-full">
          
          <section className="grid grid-cols-1 lg:grid-cols-[1fr,0.8fr] gap-12">
            
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-white">Lacak Status Permintaan Anda</h2>
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <table className="w-full text-left text-slate-800">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-4">Barang</th>
                      <th className="p-4">Catatan</th>
                      <th className="p-4">Jumlah</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="animate-pulse bg-white">
                          <td className="p-4"><div className="h-4 bg-slate-200 rounded w-3/4"></div></td>
                          <td className="p-4"><div className="h-4 bg-slate-200 rounded w-1/2"></div></td>
                          <td className="p-4"><div className="h-4 bg-slate-200 rounded w-1/4"></div></td>
                          <td className="p-4"><div className="h-6 bg-slate-200 rounded-full w-16"></div></td>
                        </tr>
                      ))
                    ) : !isLoggedIn ? (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-slate-500">
                          <p className="mb-2">Riwayat permintaan disembunyikan untuk publik.</p>
                          <Link href="/login"><span className="text-[#0A0ED4] font-bold hover:underline cursor-pointer">Log In ke Dasbor</span></Link> untuk melacak status barang Anda.
                        </td>
                      </tr>
                    ) : reqHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center opacity-70">
                            <img src="/file.svg" alt="Empty" className="w-16 h-16 mb-4 grayscale" />
                            <p className="font-semibold text-lg text-slate-700">Belum ada riwayat permintaan</p>
                            <span className="text-sm text-slate-400 mt-1">Permintaan barang yang Anda buat akan muncul di sini.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      reqHistory.slice(0, 5).map((req) => (
                        <tr key={req.ID} className="hover:bg-blue-50 transition-colors">
                          <td className="p-4 font-bold text-[#0A0ED4] text-sm">
                            {req.RequestDetails[0]?.Item?.Name || "Berbagai Barang"}
                          </td>
                          <td className="p-4 text-sm text-slate-600 truncate max-w-[150px]">{req.Notes || "-"}</td>
                          <td className="p-4 text-sm font-semibold text-slate-700">
                            {req.RequestDetails[0]?.QuantityRequested || 0} {req.RequestDetails[0]?.Item?.Unit}
                          </td>
                          <td className="p-4">
                            {getStatusBadge(req.Status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-white">
                Formulir Permintaan 
                <span className="text-sm font-medium text-blue-200 block mt-2">Silakan isi formulir untuk meminta barang dari katalog.</span>
              </h2>
              <form onSubmit={handlePermintaanSubmit} className="bg-white p-8 rounded-3xl shadow-2xl space-y-5 relative">
                
                <div className="flex flex-col gap-1.5 text-slate-800">
                  <label className="font-bold text-xs text-slate-500 uppercase tracking-wider">NIP Pegawai*</label>
                  <input 
                    type="text" 
                    required
                    value={formPermintaan.nip}
                    onChange={(e) => setFormPermintaan({...formPermintaan, nip: e.target.value})}
                    placeholder="Masukkan NIP Anda yang terdaftar" 
                    className="w-full p-3.5 border border-slate-300 rounded-xl bg-slate-50 outline-none text-sm focus:ring-2 focus:ring-[#0A0ED4] focus:bg-white transition-all" 
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-slate-800" ref={dropdownRef}>
                  <label className="font-bold text-xs text-slate-500 uppercase">Pilih Barang*</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full p-3.5 border border-slate-300 rounded-xl text-sm bg-slate-50 flex justify-between items-center focus:ring-2 focus:ring-[#0A0ED4] focus:bg-white transition-all text-left"
                    >
                      <span className={formPermintaan.namaBarangDipilih ? "text-slate-800" : "text-slate-400"}>
                        {formPermintaan.namaBarangDipilih || "-- Ketik untuk mencari barang --"}
                      </span>
                      <ChevronDown size={16} className="text-slate-400" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text" 
                              autoFocus
                              placeholder="Cari nama barang..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0A0ED4]"
                            />
                          </div>
                        </div>
                        <ul className="overflow-y-auto custom-scrollbar p-1">
                          {filteredCatalog.length === 0 ? (
                            <li className="p-3 text-sm text-slate-500 text-center">Barang tidak ditemukan</li>
                          ) : (
                            filteredCatalog.map(item => (
                              <li 
                                key={item.ID}
                                onClick={() => {
                                  setFormPermintaan({
                                    ...formPermintaan, 
                                    barangId: item.ID.toString(),
                                    namaBarangDipilih: `${item.Name} (Stok: ${item.CurrentStock})`
                                  });
                                  setIsDropdownOpen(false);
                                  setSearchQuery("");
                                }}
                                className="p-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#0A0ED4] cursor-pointer rounded-lg flex justify-between items-center"
                              >
                                <span>{item.Name} <span className="text-xs text-slate-400 ml-1">Stok: {item.CurrentStock}</span></span>
                                {formPermintaan.barangId === item.ID.toString() && <Check size={14} className="text-[#0A0ED4]" />}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[1fr,120px] gap-4 text-slate-800">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-xs text-slate-500 uppercase">Catatan</label>
                    <input 
                      type="text" 
                      value={formPermintaan.catatan}
                      onChange={(e) => setFormPermintaan({...formPermintaan, catatan: e.target.value})}
                      placeholder="Keperluan rapat..." 
                      className="w-full p-3.5 border border-slate-300 rounded-xl text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-[#0A0ED4] focus:bg-white transition-all" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-xs text-slate-500 uppercase">Jumlah*</label>
                    <input 
                      type="number" 
                      min="1"
                      required
                      value={formPermintaan.jumlah}
                      onChange={(e) => setFormPermintaan({...formPermintaan, jumlah: e.target.value})}
                      placeholder="0" 
                      className="w-full p-3.5 border border-slate-300 rounded-xl text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-[#0A0ED4] focus:bg-white transition-all" 
                    />
                  </div>
                </div>

                {/* TOMBOL KIRIM PERMINTAAN: Hijau sesuai gambar */}
                <button type="submit" className="w-full bg-[#00a651] text-white font-bold py-4 rounded-xl hover:bg-[#008c44] transition-all shadow-md text-sm mt-4 flex justify-center items-center gap-2">
                  Kirim Permintaan Barang
                </button>
              </form>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-[1fr,0.8fr] gap-12">
            
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-white">Lihat Pengajuan Barang Baru</h2>
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <table className="w-full text-left text-slate-800">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-4">Nama Barang</th>
                      <th className="p-4 text-center">Jumlah Diajukan</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {isLoading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="animate-pulse bg-white">
                          <td className="p-4"><div className="h-4 bg-slate-200 rounded w-3/4"></div></td>
                          <td className="p-4 flex justify-center"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                          <td className="p-4"><div className="h-6 bg-slate-200 rounded-full w-16"></div></td>
                        </tr>
                      ))
                    ) : !isLoggedIn ? (
                      <tr>
                        <td colSpan={3} className="p-10 text-center text-slate-500">
                          <p className="mb-2">Riwayat pengajuan disembunyikan untuk publik.</p>
                          <Link href="/login"><span className="text-[#0A0ED4] font-bold hover:underline cursor-pointer">Log In ke Dasbor</span></Link> untuk melacak status pengajuan Anda.
                        </td>
                      </tr>
                    ) : subHistory.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-12 text-center text-slate-500">
                           <div className="flex flex-col items-center justify-center opacity-70">
                            <img src="/lockers.gif" alt="Empty" className="w-16 h-16 mb-4 grayscale mix-blend-multiply" />
                            <p className="font-semibold text-lg text-slate-700">Belum ada riwayat pengajuan</p>
                            <span className="text-sm text-slate-400 mt-1">Pengajuan barang baru Anda akan muncul di sini.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      subHistory.slice(0, 5).map((sub, index) => (
                        <tr key={sub.ID || index} className="hover:bg-blue-50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-sm text-[#0A0ED4]">{sub.item_name || sub.ItemName}</p>
                          </td>
                          <td className="p-4 text-sm font-semibold text-slate-700 text-center">
                            {sub.quantity || sub.Quantity}
                          </td>
                          <td className="p-4">
                            {getStatusBadge(sub.status || sub.Status || "")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-white">
                Formulir Pengajuan Baru 
                <span className="text-sm font-medium text-blue-200 block mt-2">Pengajuan untuk barang yang belum ada di katalog.</span>
              </h2>
              <form onSubmit={handlePengajuanSubmit} className="bg-white p-8 rounded-3xl shadow-2xl space-y-5">
                
                <div className="flex flex-col gap-1.5 text-slate-800 text-sm">
                  <label className="font-bold text-xs text-slate-500 uppercase">NIP Pegawai*</label>
                  <input 
                    type="text" 
                    required
                    value={formPengajuan.nip}
                    onChange={(e) => setFormPengajuan({...formPengajuan, nip: e.target.value})}
                    placeholder="Masukkan NIP Anda yang terdaftar" 
                    className="w-full p-3.5 border border-slate-300 rounded-xl text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-[#0A0ED4] focus:bg-white transition-all" 
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-slate-800">
                  <label className="font-bold text-xs text-slate-500 uppercase">Nama Barang Baru*</label>
                  <input 
                    type="text" 
                    required
                    value={formPengajuan.namaBarang}
                    onChange={(e) => setFormPengajuan({...formPengajuan, namaBarang: e.target.value})}
                    placeholder="Contoh: Tinta Printer Epson L3110" 
                    className="w-full p-3.5 border border-slate-300 rounded-xl text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-[#0A0ED4] focus:bg-white transition-all" 
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-slate-800">
                  <label className="font-bold text-xs text-slate-500 uppercase">Jumlah yang Dibutuhkan*</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={formPengajuan.jumlah}
                    onChange={(e) => setFormPengajuan({...formPengajuan, jumlah: e.target.value})}
                    placeholder="Contoh: 5" 
                    className="w-full p-3.5 border border-slate-300 rounded-xl text-sm outline-none bg-slate-50 focus:ring-2 focus:ring-[#0A0ED4] focus:bg-white transition-all" 
                  />
                </div>

                {/* TOMBOL KIRIM PENGAJUAN: Hijau sesuai gambar */}
                <button type="submit" className="w-full bg-[#00a651] text-white font-bold py-4 rounded-xl hover:bg-[#008c44] transition-all shadow-md text-sm mt-4">
                  Kirim Pengajuan Barang Baru
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-white/10 border-t border-white/20 py-8 px-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-white">
          <p className="text-blue-100 text-sm font-medium">
            &copy; 2026 Kementerian Hak Asasi Manusia Republik Indonesia. Hak Cipta Dilindungi.
          </p>
          <div className="flex gap-8 text-sm font-bold uppercase tracking-widest">
            <Link href="#" className="hover:text-blue-200 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-blue-200 transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}