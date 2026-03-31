"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import * as XLSX from "xlsx"; // <-- Import library Excel
import { Plus, PackageSearch, ExternalLink, FileSpreadsheet } from "lucide-react"; // <-- Tambah ikon FileSpreadsheet
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

interface Category {
  ID: number;
  Name: string;
}

interface Item {
  ID: number;
  ItemCode: string;
  Name: string;
  Description: string;
  Unit: string;
  CurrentStock: number;
  MinimumStock: number;
  QRCodeURL: string;
  Category: Category;
}

export default function KatalogPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // --- STATE MODAL TAMBAH BARANG ---
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [itemCode, setItemCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minStock, setMinStock] = useState(5);
  const [currentStock, setCurrentStock] = useState(0);
  const [unit, setUnit] = useState("Pcs");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE MODAL TAMBAH KATEGORI ---
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        api.get("/items/"),
        api.get("/categories/")
      ]);
      setItems(itemsRes.data.data || []);
      
      const catData = categoriesRes.data.data || [];
      setCategories(catData);
      
      if (catData.length > 0 && !categoryId) {
        setCategoryId(catData[0].ID.toString());
      }
      
    } catch (err: any) {
      setError("Gagal mengambil data katalog. Pastikan server backend menyala.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FUNGSI EXPORT EXCEL ---
  const handleExportExcel = () => {
    // 1. Format ulang data agar rapi saat masuk ke Excel
    const exportData = items.map((item, index) => ({
      "No": index + 1,
      "Kode Barang": item.ItemCode,
      "Nama Barang": item.Name,
      "Kategori": item.Category?.Name || "Tanpa Kategori",
      "Stok Saat Ini": item.CurrentStock,
      "Batas Minimum": item.MinimumStock,
      "Satuan": item.Unit,
      "Deskripsi": item.Description,
      "Link QR Code": item.QRCodeURL || "Tidak ada"
    }));

    // 2. Buat Worksheet (lembar kerja) dari data JSON tadi
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // 3. Buat Workbook (file Excel) dan masukkan lembar kerjanya
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data_Katalog");

    // 4. Unduh file otomatis ke perangkat pengguna
    XLSX.writeFile(workbook, `Katalog_Barang_SIBAPER_${new Date().getTime()}.xlsx`);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/items/", {
        item_code: itemCode,
        name: name,
        description: description,
        category_id: parseInt(categoryId),
        minimum_stock: minStock,
        current_stock: currentStock,
        unit: unit
      });

      alert("Barang berhasil ditambahkan ke Katalog!");
      setIsAddOpen(false);
      
      setItemCode("");
      setName("");
      setDescription("");
      setMinStock(5);
      setCurrentStock(0);
      setUnit("Pcs");
      
      fetchData();
    } catch (error: any) {
      alert("Gagal menambahkan barang: " + (error.response?.data?.error || "Kesalahan server"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCategory(true);
    try {
      const res = await api.post("/categories/", { name: newCategoryName });
      alert("Kategori berhasil ditambahkan!");
      setIsAddCategoryOpen(false);
      setNewCategoryName("");
      
      const categoriesRes = await api.get("/categories/");
      const newCatData = categoriesRes.data.data || [];
      setCategories(newCatData);
      
      if (res.data.data && res.data.data.ID) {
        setCategoryId(res.data.data.ID.toString());
      }
    } catch (error: any) {
      alert("Gagal menambahkan kategori: " + (error.response?.data?.error || "Kesalahan server"));
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Katalog Barang</h1>
          <p className="text-slate-500 mt-1">Kelola data master barang persediaan dan QR Code.</p>
        </div>
        
        {/* --- TOMBOL EXPORT EXCEL & TAMBAH BARANG --- */}
        <div className="flex gap-3">
          <Button 
            variant="outline"
            className="text-green-700 border-green-600 hover:bg-green-50 shadow-sm"
            onClick={handleExportExcel}
            disabled={items.length === 0}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
          </Button>

          <Button 
            className="bg-blue-700 hover:bg-blue-800 text-white shadow-sm"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Barang
          </Button>
        </div>
      </div>

      {/* Area Konten Utama */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <PackageSearch className="h-12 w-12 animate-pulse mb-4 text-blue-300" />
            <p>Memuat data katalog dari server...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Belum ada barang di katalog.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[100px]">Kode QR</TableHead>
                  <TableHead>Kode Barang</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Stok Saat Ini</TableHead>
                  <TableHead>Satuan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.ID} className="hover:bg-slate-50">
                    <TableCell>
                      {item.QRCodeURL ? (
                        <a 
                          href={item.QRCodeURL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 text-xs"
                        >
                          <img 
                            src={item.QRCodeURL} 
                            alt={`QR ${item.ItemCode}`} 
                            className="w-10 h-10 border rounded mr-2 object-cover"
                          />
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">Tidak ada QR</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">{item.ItemCode}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{item.Name}</div>
                      <div className="text-xs text-slate-500 line-clamp-1" title={item.Description}>
                        {item.Description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-100 text-slate-600">
                        {item.Category?.Name || "Tanpa Kategori"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-bold ${item.CurrentStock <= item.MinimumStock ? 'text-red-600' : 'text-slate-800'}`}>
                        {item.CurrentStock}
                      </span>
                      {item.CurrentStock <= item.MinimumStock && (
                        <div className="text-[10px] text-red-500 font-medium mt-1">Stok Menipis</div>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600">{item.Unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* --- MODAL TAMBAH BARANG --- */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Tambah Barang Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddItem}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kode Barang</Label>
                  <Input required value={itemCode} onChange={(e) => setItemCode(e.target.value)} placeholder="Contoh: ATK-001" />
                </div>
                
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <div className="flex gap-2">
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required
                    >
                      {categories.map((cat) => (
                        <option key={cat.ID} value={cat.ID}>{cat.Name}</option>
                      ))}
                    </select>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      title="Tambah Kategori Baru"
                      onClick={() => setIsAddCategoryOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nama Barang</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Pulpen Faster Hitam" />
              </div>

              <div className="space-y-2">
                <Label>Deskripsi / Spesifikasi</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tinta hitam, ketebalan 0.5mm" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Stok Awal</Label>
                  <Input type="number" required min={0} value={currentStock} onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Batas Minimum</Label>
                  <Input type="number" required min={0} value={minStock} onChange={(e) => setMinStock(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Satuan</Label>
                  <Input required value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Rim, Kotak, Pcs..." />
                </div>
              </div>
              
              <p className="text-xs text-blue-600 italic">
                *Sistem akan otomatis menghasilkan dan menyimpan QR Code ke Google Cloud Storage setelah barang disimpan.
              </p>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>Batal</Button>
              <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan Katalog"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL TAMBAH KATEGORI KECIL --- */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Kategori Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nama Kategori</Label>
                <Input 
                  required 
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)} 
                  placeholder="Contoh: Elektronik, Barang Cetakan..." 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddCategoryOpen(false)} disabled={isSubmittingCategory}>
                Batal
              </Button>
              <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={isSubmittingCategory}>
                {isSubmittingCategory ? "Menyimpan..." : "Simpan Kategori"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}