"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Cookies from "js-cookie";
import { User, Shield, Briefcase, Mail, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilPage() {
  const [email, setEmail] = useState("");
  const [roleName, setRoleName] = useState("");
  
  // State form yang bisa diedit
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        const userData = response.data.data;
        
        setFullName(userData.FullName);
        setDepartment(userData.Department);
        setEmail(userData.Email);
        setRoleName(userData.Role.RoleName);
      } catch (error) {
        console.error("Gagal memuat profil", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await api.put("/users/profile", {
        full_name: fullName,
        department: department,
        password: password // Jika kosong, backend tidak akan mengupdate password
      });

      // Update cookie dengan nama baru
      const userCookie = Cookies.get("user");
      if (userCookie) {
        const userData = JSON.parse(userCookie);
        userData.full_name = fullName;
        Cookies.set("user", JSON.stringify(userData));
        
        // Memicu event agar Topbar bisa langsung update namanya (opsional)
        window.dispatchEvent(new Event("profileUpdated"));
      }

      alert("Profil berhasil diperbarui!");
      setPassword(""); // Kosongkan field password setelah sukses
    } catch (error: any) {
      alert("Gagal memperbarui profil: " + (error.response?.data?.error || "Kesalahan server"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Memuat data profil...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Profil Saya</h1>
        <p className="text-slate-500 mt-1">Kelola informasi pribadi dan kata sandi akun Anda.</p>
      </div>

      <Card className="shadow-sm border-t-4 border-t-blue-600">
        <CardHeader>
          <CardTitle>Data Akun</CardTitle>
          <CardDescription>Email dan Hak Akses Anda (Tidak dapat diubah)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 p-4 bg-slate-50 rounded-lg border">
            <div className="flex items-center gap-2 w-1/2">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Email</p>
                <p className="font-semibold text-slate-800">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-1/2">
              <Shield className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Hak Akses (Role)</p>
                <p className="font-semibold text-slate-800">{roleName}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Informasi Pribadi</CardTitle>
          <CardDescription>Perbarui nama, biro/bagian, dan kata sandi Anda di sini.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  id="fullName" 
                  className="pl-9" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Biro / Bagian / Jabatan</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  id="department" 
                  className="pl-9" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="password">Ganti Kata Sandi <span className="text-xs text-slate-400 font-normal">(Kosongkan jika tidak ingin mengubah)</span></Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="********" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white" disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}