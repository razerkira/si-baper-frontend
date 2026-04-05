// src/app/(dashboard)/permintaan/page.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Trash2, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

// Tipe Data
interface Item {
  ID: number;
  Name: string;
  CurrentStock: number;
  Unit: string;
}

interface RequestHistory {
  ID: number;
  RequestNumber: string;
  Status: string;
  Notes: string;
  CreatedAt?: string;
  created_at?: string; // Fallback jika backend merespons dengan snake_case
  RequestDetails: {
    Item: Item;
    QuantityRequested: number;
    QuantityApproved: number;
  }[];
}

interface CartItem {
  item_id: number;
  name: string;
  quantity_requested: number;
  unit: string;
}

export default function PermintaanPage() {
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [catalog, setCatalog] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State untuk Formulir Permintaan
  const [notes, setNotes] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Ambil Riwayat & Katalog saat halaman dimuat
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [historyRes, catalogRes] = await Promise.all([
        api.get("/requests/my-history"),
        api.get("/items/"),
      ]);
      setHistory(historyRes.data.data || []);
      setCatalog(catalogRes.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Tambah barang ke keranjang sementara
  const handleAddToCart = () => {
    if (!selectedItemId || quantity < 1) return;
    const item = catalog.find((i) => i.ID.toString() === selectedItemId);
    if (!item) return;

    // Cek apakah barang sudah ada di keranjang
    const existing = cart.find((c) => c.item_id === item.ID);
    if (existing) {
      alert("Barang ini sudah ada di daftar permintaan Anda.");
      return;
    }

    setCart([...cart, {
      item_id: item.ID,
      name: item.Name,
      quantity_requested: quantity,
      unit: item.Unit,
    }]);
    
    // Reset input pilihan
    setSelectedItemId("");
    setQuantity(1);
  };

  const handleRemoveFromCart = (id: number) => {
    setCart(cart.filter((c) => c.item_id !== id));
  };

  // Kirim data ke Backend
  const handleSubmitRequest = async () => {
    if (cart.length === 0) {
      alert("Pilih minimal 1 barang untuk diminta.");
      return;
    }

    try {
      await api.post("/requests/", {
        notes: notes,
        items: cart.map(c => ({
          item_id: c.item_id,
          quantity_requested: c.quantity_requested
        }))
      });
      
      // Bersihkan form & tutup modal
      setNotes("");
      setCart([]);
      setIsDialogOpen(false);
      
      // Refresh tabel riwayat
      fetchData();
      alert("Permintaan berhasil diajukan!");
    } catch (error: any) {
      alert("Gagal mengajukan permintaan: " + (error.response?.data?.error || "Kesalahan server"));
    }
  };

  // Fungsi pembantu untuk warna status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending_Approval": return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200"><Clock className="w-3 h-3 mr-1"/> Menunggu</Badge>;
      case "Approved": return <Badge className="bg-green-100 text-green-700 hover:bg-green-200"><CheckCircle className="w-3 h-3 mr-1"/> Disetujui</Badge>;
      case "Rejected": return <Badge className="bg-red-100 text-red-700 hover:bg-red-200"><XCircle className="w-3 h-3 mr-1"/> Ditolak</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  // Fungsi pembantu untuk format tanggal secara aman
  const formatSafeDate = (req: RequestHistory) => {
    // Mengecek beberapa kemungkinan penamaan field dari backend
    const dateValue = req.CreatedAt || req.created_at || (req as any).UpdatedAt || (req as any).updated_at;
    
    if (!dateValue) return "-";
    
    const dateObj = new Date(dateValue);
    
    // Mengecek apakah parsing tanggal valid atau menghasilkan Invalid Date (NaN)
    if (isNaN(dateObj.getTime())) return "-";
    
    return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Permintaan Barang</h1>
          <p className="text-slate-500 mt-1">Ajukan dan pantau status permintaan barang Anda di sini.</p>
        </div>

        {/* Modal/Dialog Formulir Permintaan */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-700 hover:bg-blue-800">
              <Plus className="mr-2 h-4 w-4" /> Buat Permintaan Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Formulir Permintaan Barang</DialogTitle>
              <DialogDescription>
                Pilih barang dari katalog dan tentukan jumlah yang dibutuhkan.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Keterangan / Keperluan</Label>
                <Textarea 
                  placeholder="Contoh: Untuk keperluan rapat pimpinan bulan April"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex items-end gap-3 p-4 bg-slate-50 rounded-lg border">
                <div className="flex-1 space-y-2">
                  <Label>Pilih Barang</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                  >
                    <option value="" disabled>-- Pilih Barang dari Katalog --</option>
                    {catalog.map((item) => (
                      <option key={item.ID} value={item.ID}>
                        {item.Name} (Sisa Stok: {item.CurrentStock} {item.Unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24 space-y-2">
                  <Label>Jumlah</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <Button type="button" variant="secondary" onClick={handleAddToCart}>
                  Tambah
                </Button>
              </div>

              {/* Tabel Keranjang Sementara */}
              {cart.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-100">
                      <TableRow>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead className="w-24 text-center">Jumlah</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((c) => (
                        <TableRow key={c.item_id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell className="text-center">{c.quantity_requested} {c.unit}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveFromCart(c.item_id)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button className="bg-blue-700 hover:bg-blue-800" onClick={handleSubmitRequest} disabled={cart.length === 0}>
                Kirim Permintaan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Area Konten Utama: Tabel Riwayat Permintaan */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Memuat riwayat permintaan...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center">
            <FileText className="h-12 w-12 mb-3 text-slate-300" />
            <p>Anda belum pernah mengajukan permintaan barang.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>No. Tiket</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Barang yang Diminta</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((req) => (
                  <TableRow key={req.ID}>
                    <TableCell className="font-medium text-slate-700">{req.RequestNumber}</TableCell>
                    <TableCell className="text-slate-500">
                      {/* Pemanggilan fungsi format aman yang baru ditambahkan */}
                      {formatSafeDate(req)}
                    </TableCell>
                    <TableCell>
                      <ul className="list-disc list-inside text-sm">
                        {req.RequestDetails.map((detail, idx) => (
                          <li key={idx}>
                            {detail.Item.Name} <span className="text-slate-500">({detail.QuantityRequested} {detail.Item.Unit})</span>
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-xs truncate" title={req.Notes}>
                      {req.Notes || "-"}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(req.Status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}