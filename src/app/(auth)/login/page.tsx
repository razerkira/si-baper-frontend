"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  // State untuk menyimpan input user dan status form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi yang dijalankan saat tombol Login ditekan
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Mengirim request ke Backend Go
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // Jika sukses, ambil token dan data user dari response
      const { token, data } = response.data;

      // Simpan token ke Cookies (berlaku 1 hari)
      Cookies.set("token", token, { expires: 1 });
      // Simpan data user (seperti nama, nip, role) sebagai string JSON
      Cookies.set("user", JSON.stringify(data), { expires: 1 });

      // Arahkan pengguna ke halaman Dashboard utama
      router.push("/");
    } catch (err: any) {
      // Tangkap pesan error dari backend jika email/password salah
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Terjadi kesalahan pada server. Coba lagi nanti.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-700">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-wider text-blue-800">
            SI-BAPER
          </CardTitle>
          <CardDescription>
            Sistem Informasi Barang Persediaan <br/> Inspektorat Jenderal Kementerian Hak Asasi Manusia Republik Indonesia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Tampilkan pesan error jika ada */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center text-sm">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Pegawai</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@kemenham.go.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-700 hover:bg-blue-800 text-white" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk ke Sistem"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Itjen Kemenham
        </CardFooter>
      </Card>
    </div>
  );
}