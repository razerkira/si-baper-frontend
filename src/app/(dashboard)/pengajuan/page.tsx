"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

// Interface fleksibel (menangkap huruf besar/kecil dari GORM)
interface Submission {
  ID?: number;           
  id?: number;
  item_name?: string;    
  ItemName?: string;     
  quantity?: number;
  Quantity?: number;
  status?: string;
  Status?: string;
  created_at?: string;
  CreatedAt?: string;
}

export default function PengajuanPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState<number | string>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(""); 
    try {
      // Menggunakan instance API standar, sama seperti halaman permintaan
      const res = await api.get("/submissions/my-history");
      const dataArray = res.data.data || res.data || [];
      setSubmissions(Array.isArray(dataArray) ? dataArray : []);
    } catch (err: any) {
      setError("Gagal mengambil riwayat pengajuan. Pastikan backend menyala dan rute sudah terdaftar.");
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/submissions", {
        item_name: itemName,
        quantity: Number(quantity),
      });

      alert("Pengajuan berhasil dikirim!");
      
      setIsAddOpen(false);
      setItemName("");
      setQuantity(1);
      
      fetchData();
    } catch (error: any) {
      alert("Gagal mengirim pengajuan: " + (error.response?.data?.error || "Terjadi kesalahan server"));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (sub: Submission) => {
    const currentStatus = sub.status || sub.Status || "Menunggu Persetujuan";
    const statusLower = currentStatus.toLowerCase();

    if (statusLower.includes("disetujui") || statusLower.includes("approved")) {
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200"><CheckCircle className="w-3 h-3 mr-1"/> Disetujui</Badge>;
    } else if (statusLower.includes("ditolak") || statusLower.includes("rejected")) {
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200"><XCircle className="w-3 h-3 mr-1"/> Ditolak</Badge>;
    } else {
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200"><Clock className="w-3 h-3 mr-1"/> Menunggu</Badge>;
    }
  };

  const formatSafeDate = (sub: Submission) => {
    const dateValue = sub.created_at || sub.CreatedAt;
    if (!dateValue) return "-";
    
    const dateObj = new Date(dateValue);
    if (isNaN(dateObj.getTime())) return "-";
    
    return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Pengajuan Barang Baru</h1>
          <p className="text-slate-500 mt-1">Ajukan pengadaan untuk barang yang belum ada atau stok habis.</p>
        </div>
        
        <Button 
          className="bg-blue-700 hover:bg-blue-800 text-white shadow-sm"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Buat Pengajuan
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Memuat riwayat pengajuan...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center text-slate-500">
            <ClipboardList className="h-12 w-12 mb-3 text-slate-300" />
            <p>Anda belum pernah mengajukan pengadaan barang.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[80px]">No</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Tanggal Pengajuan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub, index) => {
                  const uniqueId = sub.ID || sub.id || index;
                  const itemName = sub.item_name || sub.ItemName || "Tanpa Nama";
                  const quantity = sub.quantity || sub.Quantity || 0;

                  return (
                    <TableRow key={uniqueId} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-500">{index + 1}</TableCell>
                      <TableCell className="font-semibold text-slate-700">{itemName}</TableCell>
                      <TableCell>
                        <span className="font-bold text-slate-800">{quantity}</span>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">{formatSafeDate(sub)}</TableCell>
                      <TableCell>{getStatusBadge(sub)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Form Pengajuan Barang</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Nama Barang yang Diajukan</Label>
                <Input 
                  id="itemName"
                  required 
                  value={itemName} 
                  onChange={(e) => setItemName(e.target.value)} 
                  placeholder="Contoh: Tinta Printer Epson L3110 Hitam" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Jumlah Kebutuhan</Label>
                <Input 
                  id="quantity"
                  type="number" 
                  required 
                  min={1} 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)} 
                  placeholder="Contoh: 5" 
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={isSubmitting}>
                {isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}