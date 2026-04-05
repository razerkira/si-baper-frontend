// src/app/(dashboard)/persetujuan/page.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { CheckCircle, XCircle, ClipboardCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

// Definisi Tipe Data
interface RequestDetail {
  ID: number;
  Item: {
    Name: string;
    CurrentStock: number;
    Unit: string;
  };
  QuantityRequested: number;
}

interface PendingRequest {
  ID: number;
  RequestNumber: string;
  Notes: string;
  CreatedAt?: string;
  created_at?: string; // Fallback jika backend menggunakan snake_case
  User: {
    FullName: string;
    Department: string;
  };
  RequestDetails: RequestDetail[];
}

export default function PersetujuanPage() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Modal Persetujuan
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [actionType, setActionType] = useState<"Approved" | "Rejected" | null>(null);
  const [comments, setComments] = useState("");
  
  // Menyimpan jumlah barang yang disetujui untuk setiap item
  // Format: { [request_detail_id]: quantity_approved }
  const [approvedQuantities, setApprovedQuantities] = useState<Record<number, number>>({});

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/approvals/pending");
      setRequests(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil antrean persetujuan", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // Membuka modal dan menyiapkan data bawaan
  const openApprovalModal = (request: PendingRequest, type: "Approved" | "Rejected") => {
    setSelectedRequest(request);
    setActionType(type);
    setComments("");
    
    // Jika disetujui, set nilai awal quantity_approved sama dengan quantity_requested
    if (type === "Approved") {
      const initialQuantities: Record<number, number> = {};
      request.RequestDetails.forEach(detail => {
        initialQuantities[detail.ID] = detail.QuantityRequested;
      });
      setApprovedQuantities(initialQuantities);
    } else {
      setApprovedQuantities({});
    }

    setIsDialogOpen(true);
  };

  const handleQuantityChange = (detailId: number, value: number) => {
    setApprovedQuantities(prev => ({
      ...prev,
      [detailId]: value
    }));
  };

  const submitProcess = async () => {
    if (!selectedRequest || !actionType) return;

    // Siapkan array items jika statusnya Approved
    const itemsPayload = actionType === "Approved" 
      ? Object.entries(approvedQuantities).map(([id, qty]) => ({
          request_detail_id: parseInt(id),
          quantity_approved: qty
        }))
      : [];

    try {
      await api.post("/approvals/process", {
        request_id: selectedRequest.ID,
        status: actionType,
        comments: comments,
        items: itemsPayload
      });

      alert(`Permintaan berhasil di-${actionType === "Approved" ? "Setujui" : "Tolak"}!`);
      setIsDialogOpen(false);
      fetchPendingRequests(); // Refresh tabel setelah berhasil
    } catch (error: any) {
      alert("Gagal memproses persetujuan: " + (error.response?.data?.error || "Kesalahan server"));
    }
  };

  // Fungsi pembantu untuk format tanggal secara aman
  const formatSafeDate = (req: PendingRequest) => {
    const dateValue = req.CreatedAt || req.created_at || (req as any).UpdatedAt || (req as any).updated_at;
    
    if (!dateValue) return "-";
    
    const dateObj = new Date(dateValue);
    
    // Mengecek apakah parsing tanggal valid atau menghasilkan Invalid Date (NaN)
    if (isNaN(dateObj.getTime())) return "-";
    
    // Menggunakan format yang sama dengan halaman permintaan agar seragam
    return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Verifikasi Permintaan</h1>
        <p className="text-slate-500 mt-1">Daftar antrean permintaan barang yang menunggu persetujuan Anda.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Memuat antrean...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center">
            <ClipboardCheck className="h-12 w-12 mb-3 text-slate-300" />
            <p>Hore! Tidak ada antrean permintaan yang perlu diproses saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>No. Tiket</TableHead>
                  <TableHead>Pemohon</TableHead>
                  <TableHead>Barang yang Diminta</TableHead>
                  <TableHead className="text-center">Aksi Persetujuan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.ID}>
                    <TableCell>
                      <div className="font-medium text-slate-700">{req.RequestNumber}</div>
                      <div className="text-xs text-slate-500">
                        {/* Menggunakan formatSafeDate alih-alih Date langsung */}
                        {formatSafeDate(req)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{req.User.FullName}</div>
                      <div className="text-xs text-slate-500">{req.User.Department}</div>
                    </TableCell>
                    <TableCell>
                      <ul className="list-disc list-inside text-sm">
                        {req.RequestDetails.map((detail, idx) => (
                          <li key={idx}>
                            {detail.Item.Name} <span className="font-medium">({detail.QuantityRequested} {detail.Item.Unit})</span>
                          </li>
                        ))}
                      </ul>
                      {req.Notes && (
                        <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border">
                          <span className="font-semibold">Catatan:</span> {req.Notes}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => openApprovalModal(req, "Approved")}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Setujui
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => openApprovalModal(req, "Rejected")}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Tolak
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Modal Proses Persetujuan */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className={actionType === "Approved" ? "text-green-700" : "text-red-700"}>
              {actionType === "Approved" ? "Setujui Permintaan" : "Tolak Permintaan"}
            </DialogTitle>
            <DialogDescription>
              Tiket: <span className="font-semibold text-slate-800">{selectedRequest?.RequestNumber}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Jika Setujui, tampilkan form untuk mengubah jumlah barang */}
            {actionType === "Approved" && selectedRequest && (
              <div className="bg-slate-50 p-4 rounded-md border space-y-3">
                <Label className="text-sm font-semibold text-slate-700">Penyesuaian Jumlah Disetujui</Label>
                {selectedRequest.RequestDetails.map((detail) => (
                  <div key={detail.ID} className="flex items-center justify-between gap-4 bg-white p-2 rounded border-b last:border-0">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{detail.Item.Name}</div>
                      <div className="text-xs text-slate-500">Stok Gudang: {detail.Item.CurrentStock} {detail.Item.Unit}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Minta: {detail.QuantityRequested}</span>
                      <Input 
                        type="number" 
                        className="w-20 text-center" 
                        min="0" 
                        max={detail.Item.CurrentStock} // Maksimal tidak boleh melebihi stok
                        value={approvedQuantities[detail.ID] || 0}
                        onChange={(e) => handleQuantityChange(detail.ID, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-slate-500 italic">*Anda dapat mengurangi jumlah yang disetujui jika stok terbatas.</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Catatan Verifikator {actionType === "Rejected" && <span className="text-red-500">*</span>}</Label>
              <Textarea 
                placeholder={actionType === "Approved" ? "Contoh: Barang bisa diambil siang ini." : "Alasan penolakan..."}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button 
              className={actionType === "Approved" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
              onClick={submitProcess}
              disabled={actionType === "Rejected" && comments.trim() === ""} // Wajib isi alasan jika ditolak
            >
              Konfirmasi {actionType === "Approved" ? "Persetujuan" : "Penolakan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}