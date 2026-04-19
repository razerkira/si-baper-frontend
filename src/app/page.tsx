// src/app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

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

  // Data dari API
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [reqHistory, setReqHistory] = useState<RequestHistory[]>([]);
  const [subHistory, setSubHistory] = useState<SubmissionHistory[]>([]);

  // State Formulir (Mode Publik mengandalkan NIP manual)
  const [formPermintaan, setFormPermintaan] = useState({
    nip: "",
    barangId: "",
    catatan: "",
    jumlah: ""
  });

  const [formPengajuan, setFormPengajuan] = useState({
    nip: "",
    namaBarang: "",
    jumlah: ""
  });

  // --- FUNGSI STARTUP ---
  useEffect(() => {
    // 1. Ambil Katalog Publik (Tidak perlu login)
    api.get("/public/items")
      .then(res => setCatalog(res.data.data || []))
      .catch(err => console.error("Gagal load katalog:", err));

    // 2. Cek status login (Opsional, hanya untuk mengubah tombol header dan menampilkan tabel riwayat)
    api.get("/users/profile")
      .then(res => {
        setIsLoggedIn(true);
        setUser(res.data.data);
        // Jika login, sekalian ambil riwayatnya
        api.get("/requests/my-history").then(r => setReqHistory(r.data.data || []));
        api.get("/submissions/my-history").then(s => {
          const sData = s.data.data || s.data || [];
          setSubHistory(Array.isArray(sData) ? sData : []);
        });
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, []);

  // --- FUNGSI SUBMIT (PUBLIK) ---
  const handlePermintaanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPermintaan.nip || !formPermintaan.barangId || !formPermintaan.jumlah) {
      return alert("NIP, Barang, dan Jumlah wajib diisi!");
    }

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
      alert("Berhasil! Permintaan Anda telah masuk ke sistem.");
      setFormPermintaan({ nip: "", barangId: "", catatan: "", jumlah: "" });
    } catch (error: any) {
      alert("Gagal mengirim permintaan: " + (error.response?.data?.error || "Pastikan NIP Anda benar."));
    }
  };

  const handlePengajuanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPengajuan.nip || !formPengajuan.namaBarang || !formPengajuan.jumlah) {
      return alert("NIP, Nama Barang, dan Jumlah wajib diisi!");
    }

    try {
      await api.post("/public/submissions", {
        nip: formPengajuan.nip,
        item_name: formPengajuan.namaBarang,
        quantity: parseInt(formPengajuan.jumlah)
      });
      alert("Berhasil! Pengajuan barang baru telah dikirim ke Pimpinan.");
      setFormPengajuan({ nip: "", namaBarang: "", jumlah: "" });
    } catch (error: any) {
      alert("Gagal mengirim pengajuan: " + (error.response?.data?.error || "Pastikan NIP Anda benar."));
    }
  };

  // --- FUNGSI BANTUAN UI ---
  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("disetujui") || s.includes("approved")) {
      return <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">Disetujui</span>;
    } else if (s.includes("ditolak") || s.includes("rejected")) {
      return <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">Ditolak</span>;
    } else {
      return <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">Menunggu</span>;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gray-100 flex flex-col">
      
      {/* HEADER */}
      <header className="bg-white p-4 shadow-md flex justify-between items-center px-6 md:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo-si-baper.webp" alt="SI-BAPER Logo" className="w-12 h-12 object-contain" />
          <div className="flex flex-col text-gray-800">
            <span className="text-xl font-bold leading-none">SI-BAPER</span>
            <span className="text-[11px] font-medium opacity-70">Kementerian Hak Asasi Manusia</span>
          </div>
        </div>
        
        {isLoggedIn ? (
          <Link href="/dasbor">
            <button className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md">
              Ke Dasbor
            </button>
          </Link>
        ) : (
          <Link href="/login">
            <button className="bg-white text-blue-600 font-bold px-6 py-2 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all active:scale-95">
              Log In
            </button>
          </Link>
        )}
      </header>

      {/* HERO SECTION */}
      <main className="grow bg-linear-to-br from-blue-700 to-blue-900 text-white p-6 md:p-16">
        <section className="flex flex-col md:flex-row items-center gap-10 mb-20 max-w-7xl mx-auto">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              SISTEM INFORMASI<br /> BARANG PERSEDIAAN
            </h1>
            <p className="text-xl md:text-2xl font-medium opacity-80">Kementerian Hak Asasi Manusia</p>
            <button className="bg-green-600 text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-green-700 shadow-xl transition-all hover:-translate-y-1">
              Buku Panduan
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            <img 
              src="/si-baper-homepage-orang.png"
              alt="Illustration"
              className="w-full max-w-xl drop-shadow-2xl"
            />
          </div>
        </section>

        {/* SECTION PERMINTAAN */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr,0.8fr] gap-12 mb-24 bg-blue-800/30 p-8 rounded-3xl shadow-inner max-w-7xl mx-auto border border-blue-400/20">
          
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Lacak Status Permintaan Anda!</h2>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <table className="w-full text-left text-gray-800">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                  <tr>
                    <th className="p-4">Barang</th>
                    <th className="p-4">Catatan</th>
                    <th className="p-4">Jumlah</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!isLoggedIn ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        <p className="mb-2">Riwayat permintaan disembunyikan untuk publik.</p>
                        <Link href="/login"><span className="text-blue-600 font-bold hover:underline cursor-pointer">Log In ke Dasbor</span></Link> untuk melacak status barang Anda.
                      </td>
                    </tr>
                  ) : reqHistory.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">Belum ada riwayat permintaan.</td></tr>
                  ) : (
                    reqHistory.slice(0, 5).map((req) => (
                      <tr key={req.ID} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-blue-900 text-sm">
                          {req.RequestDetails[0]?.Item?.Name || "Berbagai Barang"}
                        </td>
                        <td className="p-4 text-sm text-gray-600 truncate max-w-[150px]">{req.Notes || "-"}</td>
                        <td className="p-4 text-sm font-semibold text-gray-700">
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
            <h2 className="text-3xl font-bold">Formulir Permintaan <span className="text-xs font-normal opacity-70 block mt-1 italic">Silakan isi formulir untuk meminta barang dari katalog.</span></h2>
            <form onSubmit={handlePermintaanSubmit} className="bg-white p-8 rounded-3xl shadow-2xl space-y-4">
              
              <div className="flex flex-col gap-1 text-gray-800">
                <label className="font-bold text-xs text-gray-500 uppercase tracking-wider">NIP Pegawai*</label>
                <input 
                  type="text" 
                  required
                  value={formPermintaan.nip}
                  onChange={(e) => setFormPermintaan({...formPermintaan, nip: e.target.value})}
                  placeholder="Masukkan NIP Anda yang terdaftar" 
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white outline-none text-sm shadow-inner focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="flex flex-col gap-1 text-gray-800">
                <label className="font-bold text-xs text-gray-500 uppercase">Pilih Barang*</label>
                <select 
                  required
                  value={formPermintaan.barangId}
                  onChange={(e) => setFormPermintaan({...formPermintaan, barangId: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none cursor-pointer"
                >
                  <option value="" disabled>-- Pilih barang dari katalog --</option>
                  {catalog.map(item => (
                    <option key={item.ID} value={item.ID}>{item.Name} (Stok: {item.CurrentStock})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-[1fr,120px] gap-3 text-gray-800">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-xs text-gray-500 uppercase">Catatan</label>
                  <input 
                    type="text" 
                    value={formPermintaan.catatan}
                    onChange={(e) => setFormPermintaan({...formPermintaan, catatan: e.target.value})}
                    placeholder="Keperluan rapat..." 
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-xs text-gray-500 uppercase">Jumlah*</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={formPermintaan.jumlah}
                    onChange={(e) => setFormPermintaan({...formPermintaan, jumlah: e.target.value})}
                    placeholder="0" 
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none" 
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-all shadow-lg text-sm mt-2">
                Kirim Permintaan Barang
              </button>
            </form>
          </div>
        </section>

        {/* SECTION PENGAJUAN */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr,0.8fr] gap-12 bg-blue-800/30 p-8 rounded-3xl shadow-inner max-w-7xl mx-auto border border-blue-400/20">
          
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Lihat Pengajuan Barang Baru!</h2>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <table className="w-full text-left text-gray-800">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                  <tr>
                    <th className="p-4">Nama Barang</th>
                    <th className="p-4 text-center">Jumlah Diajukan</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!isLoggedIn ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">
                        <p className="mb-2">Riwayat pengajuan disembunyikan untuk publik.</p>
                        <Link href="/login"><span className="text-blue-600 font-bold hover:underline cursor-pointer">Log In ke Dasbor</span></Link> untuk melacak status pengajuan Anda.
                      </td>
                    </tr>
                  ) : subHistory.length === 0 ? (
                    <tr><td colSpan={3} className="p-8 text-center text-gray-500">Belum ada riwayat pengajuan.</td></tr>
                  ) : (
                    subHistory.slice(0, 5).map((sub, index) => (
                      <tr key={sub.ID || index} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-sm text-blue-900">{sub.item_name || sub.ItemName}</p>
                        </td>
                        <td className="p-4 text-sm font-semibold text-gray-700 text-center">
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
            <h2 className="text-3xl font-bold">Formulir Pengajuan Baru <span className="text-xs font-normal opacity-70 block mt-1 italic">Pengajuan untuk barang yang belum ada di katalog.</span></h2>
            <form onSubmit={handlePengajuanSubmit} className="bg-white p-8 rounded-3xl shadow-2xl space-y-4">
              
              <div className="flex flex-col gap-1 text-gray-800 text-sm">
                <label className="font-bold text-xs text-gray-500 uppercase">NIP Pegawai*</label>
                <input 
                  type="text" 
                  required
                  value={formPengajuan.nip}
                  onChange={(e) => setFormPengajuan({...formPengajuan, nip: e.target.value})}
                  placeholder="Masukkan NIP Anda yang terdaftar" 
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none shadow-inner focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="flex flex-col gap-1 text-gray-800">
                <label className="font-bold text-xs text-gray-500 uppercase">Nama Barang Baru*</label>
                <input 
                  type="text" 
                  required
                  value={formPengajuan.namaBarang}
                  onChange={(e) => setFormPengajuan({...formPengajuan, namaBarang: e.target.value})}
                  placeholder="Contoh: Tinta Printer Epson L3110" 
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none shadow-inner" 
                />
              </div>

              <div className="flex flex-col gap-1 text-gray-800">
                <label className="font-bold text-xs text-gray-500 uppercase">Jumlah yang Dibutuhkan*</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={formPengajuan.jumlah}
                  onChange={(e) => setFormPengajuan({...formPengajuan, jumlah: e.target.value})}
                  placeholder="Contoh: 5" 
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none shadow-inner" 
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg text-sm mt-4">
                Kirim Pengajuan Barang Baru
              </button>
            </form>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-8 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-sm font-medium">
            &copy; 2026 Kementerian Hak Asasi Manusia Republik Indonesia. Hak Cipta Dilindungi.
          </p>
          <div className="flex gap-8 text-sm font-bold text-blue-600 uppercase tracking-widest">
            <Link href="#" className="hover:text-blue-800 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-blue-800 transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}