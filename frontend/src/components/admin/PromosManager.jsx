import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Plus, Tag, Edit, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { Input } from "../ui/input";
import { useToast } from "../ui/ToastProvider";
import api from "../../lib/api";

export function PromosManager() {
    const { addToast } = useToast();
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPromos();
    }, []);

    const fetchPromos = async () => {
        try {
            setLoading(true);
            const res = await api.get('/promos');
            if (res.data && res.data.data) {
                const list = res.data.data.map(p => ({
                    id: p.id,
                    code: p.code,
                    discount_type: p.discount_type,
                    discount_value: p.discount_value,
                    max_usage: p.max_usage,
                    status: p.is_active ? "Aktif" : "Nonaktif"
                }));
                setPromos(list);
            } else {
                setPromos([]);
            }
        } catch(e) { 
            console.error('Error fetching promos:', e);
            addToast("Gagal memuat data promo dari server", "error");
            setPromos([]);
        } finally {
            setLoading(false);
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); 
    const [formData, setFormData] = useState({ 
        id: null, 
        code: "", 
        discount_type: "percentage", 
        discount_value: "", 
        max_usage: "", 
        status: "Aktif" 
    });

    const handleDelete = async (id) => {
        if(window.confirm("Hapus promo ini secara permanen?")) {
            try {
                await api.delete(`/promos/${id}`);
                fetchPromos();
                addToast("Promo berhasil dihapus", "success");
            } catch (error) {
                console.error('Error deleting promo:', error);
                const errMsg = error.response?.data?.message || "Gagal menghapus promo";
                addToast(errMsg, "error");
            }
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === "Aktif" ? "Nonaktif" : "Aktif";
        const isActive = newStatus === "Aktif";
        
        try {
            const promo = promos.find(p => p.id === id);
            await api.put(`/promos/${id}`, {
                code: promo.code,
                discount_type: promo.discount_type,
                discount_value: promo.discount_value,
                max_usage: promo.max_usage,
                is_active: isActive
            });
            fetchPromos();
            addToast(`Promo di${isActive ? "aktifkan" : "nonaktifkan"}`, "info");
        } catch (error) {
            console.error('Error updating promo status:', error);
            const errMsg = error.response?.data?.message || "Gagal mengubah status promo";
            addToast(errMsg, "error");
        }
    }

    const openAddModal = () => {
        setFormData({ 
            id: null, 
            code: "", 
            discount_type: "percentage", 
            discount_value: "", 
            max_usage: "", 
            status: "Aktif" 
        });
        setModalMode("add");
        setIsModalOpen(true);
    };

    const openEditModal = (promo) => {
        setFormData({ 
            id: promo.id, 
            code: promo.code, 
            discount_type: promo.discount_type || "percentage", 
            discount_value: promo.discount_value.toString(), 
            max_usage: promo.max_usage !== null && promo.max_usage !== undefined ? promo.max_usage.toString() : "", 
            status: promo.status 
        });
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = {
            code: formData.code.toUpperCase().trim(),
            discount_type: formData.discount_type,
            discount_value: parseInt(formData.discount_value, 10),
            is_active: formData.status === "Aktif",
            max_usage: formData.max_usage ? parseInt(formData.max_usage, 10) : null
        };

        try {
            if(modalMode === "add") {
                await api.post('/promos', payload);
                addToast("Promo baru berhasil ditambahkan", "success");
            } else {
                await api.put(`/promos/${formData.id}`, payload);
                addToast("Promo berhasil diperbarui", "success");
            }
            fetchPromos();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving promo:', error);
            const errMsg = error.response?.data?.message || error.message || "Gagal menyimpan promo";
            addToast(errMsg, "error");
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="font-heading text-lg text-foreground font-bold">Kelola Promo</h3>
                    <p className="text-sm text-muted-foreground">Buat dan atur voucher yang dapat digunakan pelanggan.</p>
                </div>
                <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90 rounded-[10px] whitespace-nowrap">
                    <Plus size={18} className="mr-2" /> Buat Promo Baru
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-muted-foreground">Memuat promo...</div>
            ) : promos.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-xl text-muted-foreground">
                    Belum ada promo terdaftar. Klik "Buat Promo Baru" untuk menambahkan.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {promos.map(promo => (
                        <div key={promo.id} className="p-4 border border-border rounded-xl flex items-center justify-between bg-secondary/10 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <Tag size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground">Voucher {promo.code}</h4>
                                    <div className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <span className="bg-muted px-2 py-0.5 rounded font-mono text-xs font-bold border border-border text-foreground">
                                            {promo.code}
                                        </span>
                                        <span>• Potongan {promo.discount_type === "percentage" ? `${promo.discount_value}%` : `Rp ${Number(promo.discount_value).toLocaleString()}`}</span>
                                        {promo.max_usage !== null && promo.max_usage !== undefined && (
                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">Sisa: {promo.max_usage}x</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <button 
                                    onClick={() => handleToggleStatus(promo.id, promo.status)} 
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-opacity hover:opacity-80 ${
                                        promo.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {promo.status}
                                </button>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => openEditModal(promo)} 
                                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors" 
                                        title="Edit Promo"
                                    >
                                        <Edit size={16}/>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(promo.id)} 
                                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors" 
                                        title="Hapus Promo"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal CRUD Promo */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === "add" ? "Buat Promo Baru" : "Edit Promo"}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-muted-foreground block mb-2">Kode Voucher</label>
                        <Input 
                            value={formData.code} 
                            onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                            required 
                            placeholder="Misal: MERDEKA45" 
                            className="font-mono" 
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-muted-foreground block mb-2">Tipe Diskon</label>
                        <select 
                            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            value={formData.discount_type}
                            onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                            required
                        >
                            <option value="percentage">Persentase (%)</option>
                            <option value="fixed">Nominal Tetap (Rp)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-muted-foreground block mb-2">
                            Nilai Diskon {formData.discount_type === "percentage" ? "(%)" : "(Rupiah)"}
                        </label>
                        <Input 
                            type="number"
                            value={formData.discount_value} 
                            onChange={e => setFormData({...formData, discount_value: e.target.value})} 
                            required 
                            placeholder={formData.discount_type === "percentage" ? "Misal: 10" : "Misal: 20000"} 
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-muted-foreground block mb-2">Batas Penggunaan (Opsional)</label>
                        <Input 
                            type="number"
                            value={formData.max_usage} 
                            onChange={e => setFormData({...formData, max_usage: e.target.value})} 
                            placeholder="Kosongkan jika tidak ada batas penggunaan" 
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-muted-foreground block mb-2">Status Promo</label>
                        <select 
                            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="Aktif">Aktif</option>
                            <option value="Nonaktif">Nonaktif</option>
                        </select>
                    </div>
                    <Button type="submit" className="w-full mt-4 bg-primary text-white rounded-xl py-6 font-bold text-md">
                        Simpan Promo
                    </Button>
                </form>
            </Modal>
        </div>
    );
}
