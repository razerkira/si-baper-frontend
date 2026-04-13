"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function BerandaPage() {
  // --- STATE UNTUK FORM PERMINTAAN ---
  const [formPermintaan, setFormPermintaan] = useState({
    nip: "",
    namaLengkap: "",
    barang: "",
    catatan: "",
    jumlah: ""
  });

  // --- STATE UNTUK FORM PENGAJUAN ---
  const [formPengajuan, setFormPengajuan] = useState({
    nip: "",
    namaLengkap: "",
    kodeBarang: "",
    kategori: "",
    namaBarang: "",
    catatan: "",
    jumlah: ""
  });

  // --- FUNGSI CEK NIP (SIMULASI) ---
  const handleCekNip = (tipe: 'permintaan' | 'pengajuan') => {
    const nipTarget = tipe === 'permintaan' ? formPermintaan.nip : formPengajuan.nip;
    
    if (!nipTarget) {
      alert("Masukkan NIP terlebih dahulu!");
      return;
    }

    // Simulasi: Jika NIP 123, maka nama otomatis muncul
    if (nipTarget === "123") {
      if (tipe === 'permintaan') {
        setFormPermintaan({ ...formPermintaan, namaLengkap: "Budi Santoso (Pegawai Pusat)" });
      } else {
        setFormPengajuan({ ...formPengajuan, namaLengkap: "Budi Santoso (Pegawai Pusat)" });
      }
      alert("NIP Ditemukan!");
    } else {
      alert("NIP tidak ditemukan di database.");
    }
  };

  // --- FUNGSI KIRIM DATA ---
  const handleSubmit = (e: React.FormEvent, tipe: string) => {
    e.preventDefault();
    alert(`Berhasil! Data ${tipe} telah dikirim ke sistem.`);
    console.log(`Data ${tipe}:`, tipe === 'Permintaan' ? formPermintaan : formPengajuan);
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
        <Link href="/login">
          <button className="bg-white text-blue-600 font-bold px-6 py-2 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all active:scale-95">
            Log In
          </button>
        </Link>
      </header>

      {/* MAIN CONTENT */}
      <main className="grow bg-linear-to-br from-blue-700 to-blue-900 text-white p-6 md:p-16">
        
        {/* HERO SECTION */}
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

        {/* SECTION 1: PERMINTAAN BARANG */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr,0.8fr] gap-12 mb-24 bg-blue-800/30 p-8 rounded-3xl shadow-inner max-w-7xl mx-auto border border-blue-400/20">
          
          {/* Tabel Status */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Lihat Status Permintaan Barang anda!</h2>
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
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-blue-900 text-sm">Kertas HVS A4 80 Gram</td>
                    <td className="p-4 text-sm text-gray-600">Rapat Internal</td>
                    <td className="p-4 text-sm font-semibold text-gray-700">1 Rim</td>
                    <td className="p-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">Disetujui</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Permintaan */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Formulir <span className="text-xs font-normal opacity-70 block mt-1 italic">Silakan isi formulir untuk permintaan barang baru.</span></h2>
            <form onSubmit={(e) => handleSubmit(e, "Permintaan")} className="bg-white p-8 rounded-3xl shadow-2xl space-y-4">
              <div className="flex flex-col gap-1 text-gray-800">
                <label className="font-bold text-xs text-gray-500 uppercase tracking-wider">NIP*</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={formPermintaan.nip}
                    onChange={(e) => setFormPermintaan({...formPermintaan, nip: e.target.value})}
                    placeholder="Masukkan NIP" 
                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-inner" 
                  />
                  <button type="button" onClick={() => handleCekNip('permintaan')} className="bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all">Cek NIP</button>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-gray-800">
                <label className="font-bold text-xs text-gray-500 uppercase">Nama Lengkap*</label>
                <input type="text" value={formPermintaan.namaLengkap} readOnly placeholder="Terisi otomatis" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
              </div>
              <div className="flex flex-col gap-1 text-gray-800">
                <label className="font-bold text-xs text-gray-500 uppercase">Pilih Barang*</label>
                <select 
                  onChange={(e) => setFormPermintaan({...formPermintaan, barang: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none cursor-pointer"
                >
                  <option value="">Pilih barang...</option>
                  <option value="HVS">Kertas HVS A4</option>
                  <option value="Tinta">Tinta Printer Black</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 text-gray-800">
                <label className="font-bold text-xs text-gray-500 uppercase">Jumlah*</label>
                <input 
                  type="text" 
                  onChange={(e) => setFormPermintaan({...formPermintaan, jumlah: e.target.value})}
                  placeholder="-" 
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none" 
                />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-all shadow-lg text-sm mt-2">
                Kirim Permintaan Barang
              </button>
            </form>
          </div>
        </section>

        {/* SECTION 2: PENGAJUAN BARANG */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr,0.8fr] gap-12 bg-blue-800/30 p-8 rounded-3xl shadow-inner max-w-7xl mx-auto border border-blue-400/20">
          
          {/* Tabel Pengajuan */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Lihat Pengajuan Barang anda!</h2>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <table className="w-full text-left text-gray-800">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                  <tr>
                    <th className="p-4">Nama & Kode</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-sm text-blue-900">Kertas HVS A4</p>
                      <p className="text-[10px] text-gray-400">ATK-001</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">Alat Tulis Kantor</td>
                    <td className="p-4 text-sm font-semibold text-gray-700">1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Pengajuan */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Formulir <span className="text-xs font-normal opacity-70 block mt-1 italic">Silakan isi formulir untuk pengajuan barang baru yang belum ada di katalog.</span></h2>
            <form onSubmit={(e) => handleSubmit(e, "Pengajuan")} className="bg-white p-8 rounded-3xl shadow-2xl space-y-4">
              <div className="flex flex-col gap-1 text-gray-800">
                <label className="font-bold text-xs text-gray-500 uppercase tracking-wider">NIP*</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    onChange={(e) => setFormPengajuan({...formPengajuan, nip: e.target.value})}
                    placeholder="Masukkan NIP" 
                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-inner" 
                  />
                  <button type="button" onClick={() => handleCekNip('pengajuan')} className="bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all">Cek NIP</button>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-gray-800 text-sm">
                <label className="font-bold text-xs text-gray-500 uppercase">Nama Lengkap*</label>
                <input type="text" value={formPengajuan.namaLengkap} readOnly placeholder="Terisi otomatis" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 text-gray-800">
                  <label className="font-bold text-xs text-gray-500 uppercase">Kode*</label>
                  <input type="text" placeholder="ATK-..." className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none shadow-inner" />
                </div>
                <div className="flex flex-col gap-1 text-gray-800">
                  <label className="font-bold text-xs text-gray-500 uppercase">Kategori*</label>
                  <select className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none cursor-pointer">
                    <option value="">Pilih...</option>
                    <option value="Kertas">Kertas</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-gray-800">
                <label className="font-bold text-xs text-gray-500 uppercase">Nama Barang*</label>
                <input type="text" placeholder="Masukkan nama barang" className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none shadow-inner" />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-all shadow-lg text-sm mt-2">
                Kirim Pengajuan Barang
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