"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { History, ArrowDownRight, ArrowUpRight, FileSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// Definisi Tipe Data dari Backend
interface InventoryLog {
  ID: number;
  Item: {
    ItemCode: string;
    Name: string;
    Unit: string;
  };
  TransactionType: string;
  Quantity: number;
  ReferenceType: string;
  ReferenceID: number;
  User: {
    FullName: string;
  };
  TransactionDate: string;
}

export default function LaporanMutasiPage() {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/inventory/logs");
      setLogs(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil laporan mutasi", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Fungsi pembantu untuk memformat tipe transaksi
  const getTransactionBadge = (type: string) => {
    if (type === "IN") {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">
          <ArrowDownRight className="w-3 h-3 mr-1" /> Masuk (IN)
        </Badge>
      );
    } else if (type === "OUT") {
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200">
          <ArrowUpRight className="w-3 h-3 mr-1" /> Keluar (OUT)
        </Badge>
      );
    }
    return <Badge variant="outline">{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Laporan Mutasi Barang</h1>
        <p className="text-slate-500 mt-1">Jejak rekam (Audit Trail) seluruh pergerakan inventaris gudang.</p>
      </div>

      {/* Tabel Konten */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Memuat data audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center">
            <FileSearch className="h-12 w-12 mb-3 text-slate-300" />
            <p>Belum ada pergerakan barang yang tercatat di sistem.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Waktu Transaksi</TableHead>
                  <TableHead>Kode & Nama Barang</TableHead>
                  <TableHead>Jenis Mutasi</TableHead>
                  <TableHead className="text-center">Jumlah</TableHead>
                  <TableHead>Referensi</TableHead>
                  <TableHead>Diproses Oleh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.ID} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="text-sm text-slate-600">
                      {new Date(log.TransactionDate).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-800">{log.Item.Name}</div>
                      <div className="text-xs text-slate-500">{log.Item.ItemCode}</div>
                    </TableCell>
                    <TableCell>
                      {getTransactionBadge(log.TransactionType)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-bold text-lg ${log.TransactionType === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {log.TransactionType === 'IN' ? '+' : '-'}{log.Quantity}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">{log.Item.Unit}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{log.ReferenceType}</div>
                      <div className="text-xs text-slate-400">ID Ref: {log.ReferenceID}</div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-700">
                      {log.User?.FullName || "Sistem"}
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