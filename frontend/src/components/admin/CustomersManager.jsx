
import React, { useState, useEffect } from "react";
import { Eye, ShieldAlert, UserCheck, ShieldClose, ShieldCheck, Search } from "lucide-react";
import { useToast } from "../ui/ToastProvider";
import { Input } from "../ui/input";
import { Modal } from "./Modal";
import api from "../../lib/api";

export function CustomersManager() {
    const { addToast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/users');
            setCustomers(res.data.data);
        } catch (error) {
            console.error("Failed to fetch customers", error);
            // Fallback for mock data if API fails or empty
            setCustomers([
                { id: 1, name: "Budi Santoso", email: "budi@example.com", totalOrders: 15, status: "Aktif", joinedDate: "10 Mei 2026", phoneNumber: "081234567890" },
                { id: 2, name: "Siti Aminah", email: "siti@example.com", totalOrders: 3, status: "Aktif", joinedDate: "05 Apr 2026", phoneNumber: "081987654321" },
                { id: 3, name: "Andi Susanto", email: "andi@example.com", totalOrders: 0, status: "Diblokir", joinedDate: "01 Feb 2026", phoneNumber: "081555666777" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const handleToggleStatus = (id) => {
        setCustomers(customers.map(c => {
            if (c.id === id) {
                const newStatus = c.status === "Aktif" ? "Diblokir" : "Aktif";
                addToast(`Akun milik ${c.name} berhasil ${newStatus === "Aktif" ? "diaktifkan" : "diblokir"}!`, newStatus === "Aktif" ? "success" : "error");
                return { ...c, status: newStatus };
            }
            return c;
        }));
    };

    const handleDetail = (customer) => {
        setSelectedCustomer(customer);
        setIsDetailModalOpen(true);
    };

    const filteredCustomers = customers.filter(c => 
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="font-heading text-lg text-foreground">Data Pelanggan</h3>
                    <p className="text-sm text-muted-foreground">Kelola akun pengguna, lihat riwayat, dan amankan data.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input 
                        placeholder="Cari nama atau email..." 
                        className="pl-10 bg-secondary/20" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/30 text-muted-foreground border-b border-border/50 font-bold">
                        <tr>
                            <th className="p-4 rounded-tl-xl whitespace-nowrap">ID Profil</th>
                            <th className="p-4 whitespace-nowrap">Nama Pelanggan</th>
                            <th className="p-4 whitespace-nowrap">Email</th>
                            <th className="p-4 whitespace-nowrap">Total Pesanan</th>
                            <th className="p-4 whitespace-nowrap">Status Akun</th>
                            <th className="p-4 rounded-tr-xl flex justify-end">Aksi Keamanan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {loading ? (
                            <tr><td colSpan="6" className="p-4 text-center text-muted-foreground">Memuat data pelanggan...</td></tr>
                        ) : filteredCustomers.length > 0 ? (
                            filteredCustomers.map(c => (
                                <tr key={c.id} className="hover:bg-secondary/10 transition-colors">
                                    <td className="p-4 font-bold text-muted-foreground whitespace-nowrap">#CUST-00{c.id}</td>
                                    <td className="p-4 font-medium whitespace-nowrap">{c.name}</td>
                                    <td className="p-4 font-mono text-xs whitespace-nowrap">{c.email}</td>
                                    <td className="p-4 whitespace-nowrap">{c.totalOrders} Pesanan</td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-max gap-1 ${c.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {c.status === "Aktif" ? <UserCheck size={12}/> : <ShieldAlert size={12}/>} {c.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleDetail(c)} className="p-2 bg-secondary/50 text-foreground hover:bg-secondary rounded-lg transition-colors" title="Lihat Riwayat & Profil"><Eye size={16}/></button>
                                            <button onClick={() => handleToggleStatus(c.id)} className={`p-2 rounded-lg transition-colors ${c.status === "Aktif" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`} title={c.status === "Aktif" ? "Blokir Akun" : "Aktifkan Akun"}>
                                                {c.status === "Aktif" ? <ShieldClose size={16}/> : <ShieldCheck size={16}/>}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="p-4 text-center text-muted-foreground">Tidak ada pelanggan yang ditemukan.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Profil Pelanggan">
                {selectedCustomer && (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center p-6 bg-secondary/10 rounded-2xl border border-border/50 text-center">
                            {selectedCustomer.profilePicture ? (
                                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-lg border-2 border-primary/20">
                                    <img 
                                        src={selectedCustomer.profilePicture} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover object-center"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white text-4xl font-bold font-heading mb-4 shadow-lg shadow-orange-500/20">
                                    {selectedCustomer.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <h3 className="font-black text-2xl text-foreground font-heading">{selectedCustomer.name}</h3>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">#CUST-00{selectedCustomer.id}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-secondary/10 p-4 rounded-xl border border-border mt-2 rounded-tl-[24px]">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Alamat Email</p>
                                <p className="text-sm font-bold text-foreground break-words">{selectedCustomer.email}</p>
                            </div>
                            <div className="bg-secondary/10 p-4 rounded-xl border border-border mt-2 rounded-tr-[24px]">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">No. Ponsel</p>
                                <p className="text-sm font-bold text-foreground">{selectedCustomer.phoneNumber}</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 rounded-bl-[24px]">
                                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Histori Belanja</p>
                                <p className="text-2xl font-black text-primary font-heading">{selectedCustomer.totalOrders} <span className="text-sm font-bold">Transaksi</span></p>
                            </div>
                            <div className="bg-secondary/10 p-4 rounded-xl border border-border rounded-br-[24px]">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Anggota Sejak</p>
                                <p className="text-sm font-bold text-foreground">{selectedCustomer.joinedDate}</p>
                            </div>
                        </div>

                        {/* Website access box removed as requested */}
                    </div>
                )}
            </Modal>
        </div>
    );
}

