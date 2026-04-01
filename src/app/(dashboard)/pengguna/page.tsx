"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users as UsersIcon, UserPlus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Role {
  ID: number;
  RoleName: string;
}

interface User {
  ID: number;
  NIP: string;
  FullName: string;
  Email: string;
  Department: string;
  Role: Role;
}

export default function PenggunaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editRoleId, setEditRoleId] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addNIP, setAddNIP] = useState("");
  const [addFullName, setAddFullName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addDepartment, setAddDepartment] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRoleId, setAddRoleId] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get("/users/"),
        api.get("/users/roles"),
      ]);
      setUsers(usersRes.data.data || []);

      const rolesData = rolesRes.data.data || [];
      setRoles(rolesData);

      if (rolesData.length > 0) {
        setAddRoleId(rolesData[0].ID.toString());
      }
    } catch (error) {
      console.error("Gagal mengambil data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", {
        nip: addNIP,
        full_name: addFullName,
        email: addEmail,
        department: addDepartment,
        password: addPassword,
        role_id: parseInt(addRoleId),
      });

      alert("Pengguna baru berhasil ditambahkan!");
      setIsAddOpen(false);

      // Reset form
      setAddNIP("");
      setAddFullName("");
      setAddEmail("");
      setAddDepartment("");
      setAddPassword("");
      setAddRoleId(roles[0]?.ID.toString() || "");

      fetchData();
    } catch (error: any) {
      alert(
        "Gagal menambahkan: " + (error.response?.data?.error || "Error server"),
      );
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditFullName(user.FullName);
    setEditDepartment(user.Department);
    setEditRoleId(user.Role.ID.toString());
    setIsEditOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await api.put(`/users/${editingUser.ID}`, {
        full_name: editFullName,
        department: editDepartment,
        role_id: parseInt(editRoleId),
      });
      alert("Data pengguna berhasil diperbarui!");
      setIsEditOpen(false);
      fetchData();
    } catch (error: any) {
      alert(
        "Gagal memperbarui: " + (error.response?.data?.error || "Error server"),
      );
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus akun ${name}?`,
    );
    if (confirmDelete) {
      try {
        await api.delete(`/users/${id}`);
        alert("Pengguna berhasil dihapus!");
        fetchData();
      } catch (error: any) {
        alert(
          "Gagal menghapus: " + (error.response?.data?.error || "Error server"),
        );
      }
    }
  };

  const getRoleBadge = (roleName: string) => {
    switch (roleName) {
      case "Admin":
        return <Badge className="bg-red-100 text-red-700">Admin</Badge>;
      case "Eksekutif":
        return <Badge className="bg-amber-100 text-amber-700">Eksekutif</Badge>;
      case "Pegawai":
        return <Badge className="bg-blue-100 text-blue-700">Pegawai</Badge>;
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700">
            {roleName || "Tidak Diketahui"}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Manajemen Pengguna
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola data pegawai, hak akses, dan biro/bagian.
          </p>
        </div>
        <Button
          className="bg-blue-700 hover:bg-blue-800 text-white shadow-sm"
          onClick={() => setIsAddOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" /> Tambah Pengguna
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">
            Memuat data pengguna...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center">
            <UsersIcon className="h-12 w-12 mb-3 text-slate-300" />
            <p>Belum ada pengguna yang terdaftar di sistem.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Nama Pegawai</TableHead>
                  <TableHead>NIP</TableHead>
                  <TableHead>Bagian / Jabatan</TableHead>
                  <TableHead>Hak Akses</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.ID}>
                    <TableCell>
                      <div className="font-semibold text-slate-800">
                        {user.FullName}
                      </div>
                      <div className="text-xs text-slate-500">{user.Email}</div>
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      {user.NIP}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {user.Department}
                    </TableCell>
                    <TableCell>{getRoleBadge(user.Role?.RoleName)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          onClick={() => openEditModal(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() =>
                            handleDeleteUser(user.ID, user.FullName)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
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

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>NIP</Label>
                  <Input
                    required
                    value={addNIP}
                    onChange={(e) => setAddNIP(e.target.value)}
                    placeholder="Contoh: 1990..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hak Akses</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={addRoleId}
                    onChange={(e) => setAddRoleId(e.target.value)}
                    required
                  >
                    {roles.map((role) => (
                      <option key={role.ID} value={role.ID}>
                        {role.RoleName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input
                  required
                  value={addFullName}
                  onChange={(e) => setAddFullName(e.target.value)}
                  placeholder="Nama Pegawai"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="nama@kemenham.go.id"
                />
              </div>
              <div className="space-y-2">
                <Label>Bagian / Biro / Jabatan</Label>
                <Input
                  required
                  value={addDepartment}
                  onChange={(e) => setAddDepartment(e.target.value)}
                  placeholder="Contoh: Bagian Umum"
                />
              </div>
              <div className="space-y-2">
                <Label>Kata Sandi (Default)</Label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" className="bg-blue-700 hover:bg-blue-800">
                Simpan Pengguna
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Pengguna</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Bagian / Jabatan</Label>
              <Input
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Hak Akses (Role)</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={editRoleId}
                onChange={(e) => setEditRoleId(e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role.ID} value={role.ID}>
                    {role.RoleName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Batal
            </Button>
            <Button
              className="bg-blue-700 hover:bg-blue-800"
              onClick={handleUpdateUser}
            >
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
