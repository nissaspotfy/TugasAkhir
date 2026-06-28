
import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { Eye, Search, Filter, Edit, Trash2, CalendarDays, ShoppingBag, Receipt, MapPin, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Input } from "../ui/input";
import { useToast } from "../ui/ToastProvider";
import { Modal } from "./Modal";

const printHtmlContent = (htmlContent) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
        iframe.contentWindow.print();
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    }, 500);
};

export function OrdersManager() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSplitDropdownOpen, setIsSplitDropdownOpen] = useState(false);
    const [editStatus, setEditStatus] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ORDERS_PER_PAGE = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get("/transactions"); 
            if(res.data.data && res.data.data.length > 0) {
                setOrders(res.data.data);
            } else {
                throw new Error("fallback");
            }
        } catch (error) {
            console.error(error);
            setOrders([
                { id: 101, user: { username: "nissanurs", email: "nissa@example.com" }, items: [{ product: { name: "Nasi Goreng Spesial", price: 25000 }, quantity: 2 }], createdAt: new Date().toISOString(), total_amount: 50000, status: "pending", note: "Pedas, karet pisah" },
                { id: 102, user: { username: "budi", email: "budi@example.com" }, items: [{ product: { name: "Es Teh Manis", price: 5000 }, quantity: 3 }], createdAt: new Date(Date.now() - 3600000).toISOString(), total_amount: 15000, status: "paid", note: "" },
                { id: 103, user: { username: "siti", email: "siti@example.com" }, items: [{ product: { name: "Ayam Bakar", price: 30000 }, quantity: 1 }], createdAt: new Date(Date.now() - 86400000).toISOString(), total_amount: 30000, status: "failed", note: "" },
            ])
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Listen for socket notifications to refresh order list and open detail modal instantly (admin-side)
    useEffect(() => {
        const handleNewNotification = async (e) => {
            console.log("Real-time trigger admin orders reload", e.detail);
            await fetchOrders();
            
            // If the detail modal is currently open, update its detailed data as well
            if (isDetailModalOpen && selectedOrder) {
                try {
                    const res = await api.get("/transactions");
                    if (res.data.data && res.data.data.length > 0) {
                        const updated = res.data.data.find(o => o.id === selectedOrder.id);
                        if (updated) {
                            setSelectedOrder(updated);
                        }
                    }
                } catch (err) {
                    console.error("Failed to refresh detail order in real-time", err);
                }
            }
        };
        window.addEventListener('new_notification_alert', handleNewNotification);
        return () => {
            window.removeEventListener('new_notification_alert', handleNewNotification);
        };
    }, [isDetailModalOpen, selectedOrder]);

    const getStatusStyle = (status) => {
        if(status === "success") return "bg-green-100 text-green-700";
        if(status === "processing") return "bg-blue-100 text-blue-700 font-semibold";
        if(status === "paid") return "bg-emerald-100 text-emerald-700";
        if(status === "pending") return "bg-yellow-100 text-yellow-700";
        if(status === "cancelled") return "bg-red-100 text-red-700";
        return "bg-red-100 text-red-700";
    }

    const handleDetail = (order) => {
        setSelectedOrder(order);
        setIsDetailModalOpen(true);
    }

    const handleEditStatus = (order) => {
        setSelectedOrder(order);
        setEditStatus(order.status);
        setIsSplitDropdownOpen(false);
        setIsEditModalOpen(true);
    }

    const handleUpdateStatus = async (id, newStatus) => {
        let statusLabel = "";
        if (newStatus === "processing") statusLabel = "DIPROSES/DIMASAK";
        else if (newStatus === "success") statusLabel = "SELESAI";
        else if (newStatus === "cancelled") statusLabel = "DIBATALKAN";
        else if (newStatus === "paid") statusLabel = "LUNAS";
        else if (newStatus === "pending") statusLabel = "MENUNGGU";
        
        if (window.confirm(`Ubah status pesanan menjadi ${statusLabel}?`)) {
            try {
                await api.put(`/transactions/${id}`, { status: newStatus });
                setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
                addToast(`Status pesanan #ORD-${id} berhasil diperbarui`, "success");
                if (selectedOrder && selectedOrder.id === id) {
                    setSelectedOrder(prev => ({ ...prev, status: newStatus }));
                }
            } catch (error) {
                console.error(error);
                setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
                addToast(`Status pesanan #ORD-${id} berhasil diperbarui (Simulasi)`, "success");
                if (selectedOrder && selectedOrder.id === id) {
                    setSelectedOrder(prev => ({ ...prev, status: newStatus }));
                }
            }
        }
    };

    const handleMainAction = () => {
        if (!selectedOrder) return;
        let nextStatus = null;
        if (selectedOrder.status === 'pending') nextStatus = 'paid';
        else if (selectedOrder.status === 'paid') nextStatus = 'processing';
        else if (selectedOrder.status === 'processing') nextStatus = 'success';
        else if (selectedOrder.status === 'success') nextStatus = 'processing';
        else if (selectedOrder.status === 'cancelled' || selectedOrder.status === 'failed') nextStatus = 'pending';

        if (nextStatus) {
            handleUpdateStatus(selectedOrder.id, nextStatus);
        }
    };

    const handleSecondaryAction = () => {
        if (!selectedOrder) return;
        let prevStatus = null;
        if (selectedOrder.status === 'pending') prevStatus = 'cancelled';
        else if (selectedOrder.status === 'paid') prevStatus = 'pending';
        else if (selectedOrder.status === 'processing') prevStatus = 'paid';

        if (prevStatus) {
            handleUpdateStatus(selectedOrder.id, prevStatus);
        }
    };

    const handlePrintInvoice = (order) => {
        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                    ${item.product?.name || "Produk"}
                    ${item.note ? `<br/><small style="color: #bf3843; font-weight: bold; font-style: italic;">Catatan: ${item.note}</small>` : ''}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">Rp ${item.product?.price?.toLocaleString() || 0}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">Rp ${((item.product?.price || 0) * item.quantity).toLocaleString()}</td>
            </tr>
        `).join("");

        const htmlContent = `
            <html>
            <head>
                <title>Invoice #ORD-${order.id}</title>
                <style>
                    body { font-family: 'Poppins', Arial, sans-serif; color: #333; margin: 40px; line-height: 1.6; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                    .logo { font-size: 24px; font-weight: bold; color: #bf3843; }
                    .info { display: flex; justify-content: space-between; margin-bottom: 40px; }
                    .info-box { flex: 1; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { background-color: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: bold; }
                    .total-section { display: flex; justify-content: flex-end; font-size: 16px; margin-top: 20px; }
                    .total-table { width: 300px; }
                    .total-table td { padding: 8px 0; }
                    .total-row { font-size: 20px; font-weight: bold; color: #bf3843; border-top: 2px dashed #ddd; }
                    .footer { text-align: center; margin-top: 80px; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">D'raosan</div>
                        <div>Jl. Goalpara No. 45, Sukabumi</div>
                    </div>
                    <div style="text-align: right;">
                        <h2 style="margin: 0; color: #bf3843;">INVOICE</h2>
                        <div>No: #ORD-${order.id}</div>
                        <div>Tanggal: ${new Date(order.createdAt).toLocaleDateString("id-ID")}</div>
                    </div>
                </div>

                <div class="info">
                    <div class="info-box">
                        <strong>Penerima:</strong>
                        <div>Nama: ${order.user?.username || "Pelanggan"}</div>
                        <div>Email: ${order.user?.email || "-"}</div>
                        <div>Layanan: ${order.shipping_provider === 'Ambil Sendiri' ? 'Ambil Sendiri (Takeaway)' : 'Kirim Kurir'}</div>
                    </div>
                    <div class="info-box" style="text-align: right;">
                        <strong>Status Pembayaran:</strong>
                        <div style="font-size: 18px; font-weight: bold; color: ${order.status === 'success' || order.status === 'paid' || order.status === 'processing' ? 'green' : 'orange'}">
                            ${order.status === 'success' || order.status === 'paid' || order.status === 'processing' ? 'LUNAS' : order.status.toUpperCase()}
                        </div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Menu</th>
                            <th style="text-align: center; width: 80px;">Jml</th>
                            <th style="text-align: right; width: 120px;">Harga</th>
                            <th style="text-align: right; width: 150px;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="total-section">
                    <table class="total-table">
                        <tr>
                            <td>Total Belanja:</td>
                            <td style="text-align: right;">Rp ${(order.total_amount - (order.shipping_cost || 0)).toLocaleString()}</td>
                        </tr>
                        ${order.shipping_cost ? `
                        <tr>
                            <td>Ongkos Kirim:</td>
                            <td style="text-align: right;">Rp ${order.shipping_cost.toLocaleString()}</td>
                        </tr>
                        ` : ''}
                        <tr class="total-row">
                            <td>Total Bayar:</td>
                            <td style="text-align: right;">Rp ${order.total_amount.toLocaleString()}</td>
                        </tr>
                    </table>
                </div>

                <div class="footer">
                    Terima kasih atas pesanan Anda di D'raosan!<br/>
                    Cita rasa khas yang tak terlupakan.
                </div>
            </body>
            </html>
        `;

        printHtmlContent(htmlContent);
    };

    const handlePrintReceipt = (order) => {
        const itemsHtml = order.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>
                    ${item.product?.name || "Produk"} x ${item.quantity}
                    ${item.note ? `<br/><span style="font-size: 11px; font-weight: bold; font-style: italic;">*Catatan: ${item.note}</span>` : ''}
                </span>
                <span>Rp ${((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
            </div>
        `).join("");

        const htmlContent = `
            <html>
            <head>
                <title>Struk #ORD-${order.id}</title>
                <style>
                    body { 
                        font-family: 'Courier New', Courier, monospace; 
                        color: #000; 
                        margin: 10px; 
                        font-size: 14px; 
                        width: 80mm; 
                    }
                    .center { text-align: center; }
                    .line { border-top: 1px dashed #000; margin: 10px 0; }
                    .bold { font-weight: bold; }
                    table { width: 100%; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="center">
                    <span style="font-size: 20px; font-weight: bold;">D'RAOSAN</span><br/>
                    <span>Goalpara, Sukabumi</span><br/>
                    <span>Telp: (0266) -xxxxxx</span>
                </div>
                
                <div class="line"></div>
                
                <div>
                    Tanggal: ${new Date(order.createdAt).toLocaleDateString("id-ID")}<br/>
                    No. Resi: #ORD-${order.id}<br/>
                    Pelanggan: ${order.user?.username || "Pelanggan"}<br/>
                    Layanan: ${order.shipping_provider === 'Ambil Sendiri' ? 'Ambil Sendiri' : 'Kirim'}
                </div>
                
                <div class="line"></div>
                
                <div>
                    ${itemsHtml}
                </div>
                
                <div class="line"></div>
                
                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                    <span>TOTAL:</span>
                    <span>Rp ${order.total_amount.toLocaleString()}</span>
                </div>
                
                <div class="line"></div>
                
                <div class="footer">
                    Matur Nuhun / Terima Kasih<br/>
                    Selamat Menikmati!
                </div>
            </body>
            </html>
        `;

        printHtmlContent(htmlContent);
    };

    const handleDelete = async (id) => {
        if(window.confirm("Yakin ingin menghapus pesanan ini secara permanen?")) {
            try {
                await api.delete(`/transactions/${id}`);
                setOrders(orders.filter(o => o.id !== id));
                addToast(`Pesanan #ORD-${id} berhasil dihapus`, "success");
                if (selectedOrder && selectedOrder.id === id) setIsDetailModalOpen(false);
            } catch (error) {
                console.error(error);
                // Fallback for mock IDs
                setOrders(orders.filter(o => o.id !== id));
                addToast(`Pesanan #ORD-${id} berhasil dihapus (Simulasi)`, "success");
                if (selectedOrder && selectedOrder.id === id) setIsDetailModalOpen(false);
            }
        }
    }

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) || `ord-${o.id}`.includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" ? true : o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const indexOfLastOrder = currentPage * ORDERS_PER_PAGE;
    const indexOfFirstOrder = indexOfLastOrder - ORDERS_PER_PAGE;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === "pending").length,
        completed: orders.filter(o => o.status === "paid" || o.status === "success").length,
        revenue: orders.filter(o => o.status === "paid" || o.status === "success").reduce((sum, o) => sum + (o.total_amount || 0), 0)
    };

    let mainButtonText = "";
    let secondaryButtonText = "";
    let showSecondaryButton = true;
    let isMainDisabled = false;

    if (selectedOrder) {
        if (selectedOrder.status === 'pending') {
            mainButtonText = "Tandai Lunas";
            secondaryButtonText = "Batalkan Pesanan";
        } else if (selectedOrder.status === 'paid') {
            mainButtonText = "Terima & Proses Masak";
            secondaryButtonText = "Kembalikan ke Menunggu";
        } else if (selectedOrder.status === 'processing') {
            mainButtonText = "Tandai Selesai";
            secondaryButtonText = "Kembalikan ke Lunas";
        } else if (selectedOrder.status === 'success') {
            mainButtonText = "Kembalikan ke Terima & Proses Masak";
            showSecondaryButton = false;
        } else {
            // Cancelled or Failed
            mainButtonText = "Pulihkan ke Menunggu";
            showSecondaryButton = false;
        }
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
            {/* Dashboard Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-2">Total Pesanan</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <p className="text-xs font-bold text-yellow-600 uppercase mb-2">Menunggu</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <p className="text-xs font-bold text-green-600 uppercase mb-2">Selesai</p>
                    <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="relative w-full md:w-96 flex items-center">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input 
                        placeholder="Cari ID Pesanan / Nama..." 
                        className="pl-10 bg-secondary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-muted-foreground" size={18} />
                    <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Semua Status</option>
                        <option value="pending">Menunggu</option>
                        <option value="paid">Lunas</option>
                        <option value="processing">Diproses</option>
                        <option value="success">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                        <option value="failed">Gagal</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/30 text-muted-foreground border-b border-border/50 font-bold">
                        <tr>
                            <th className="p-4 rounded-tl-xl whitespace-nowrap">ID Pesanan</th>
                            <th className="p-4 whitespace-nowrap">Pelanggan</th>
                            <th className="p-4 whitespace-nowrap">Waktu</th>
                            <th className="p-4 whitespace-nowrap">Total Tagihan</th>
                            <th className="p-4 whitespace-nowrap">Status</th>
                            <th className="p-4 rounded-tr-xl flex justify-end">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {loading ? <tr><td colSpan="6" className="p-4 text-center">Memuat...</td></tr> : currentOrders.map(o => (
                            <tr key={o.id} className="hover:bg-secondary/10 transition-colors">
                                <td className="p-4 font-bold text-primary">#ORD-{o.id}</td>
                                <td className="p-4 font-medium">{o.user?.username || "Guest"}</td>
                                <td className="p-4 text-muted-foreground">{new Date(o.createdAt).toLocaleString("id-ID")}</td>
                                <td className="p-4 font-bold">Rp {o.total_amount?.toLocaleString() || 0}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(o.status)}`}>
                                        {o.status === "success" ? "SELESAI" : (o.status === "processing" ? "DIPROSES" : (o.status === "paid" ? "LUNAS" : (o.status === "pending" ? "MENUNGGU" : (o.status === "cancelled" ? "DIBATALKAN" : "GAGAL"))))}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleDetail(o)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Detail Pesanan"><Eye size={16}/></button>
                                        <button onClick={() => handleEditStatus(o)} className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors" title="Edit Status Pesanan"><Edit size={16}/></button>
                                        <button onClick={() => handleDelete(o.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Hapus Permanen"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredOrders.length === 0 && !loading && (
                            <tr><td colSpan="6" className="p-4 text-center text-muted-foreground">Tidak ada pesanan yang sesuai.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-slate-50 p-4 rounded-xl border border-border/50">
                    <p className="text-xs text-muted-foreground font-medium">
                        Menampilkan <span className="font-bold text-slate-800">{indexOfFirstOrder + 1}</span> hingga <span className="font-bold text-slate-800">{Math.min(indexOfLastOrder, filteredOrders.length)}</span> dari <span className="font-bold text-slate-800">{filteredOrders.length}</span> pesanan
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 rounded-lg border border-input bg-background flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-white disabled:pointer-events-none disabled:opacity-50 transition-colors cursor-pointer"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`h-8 w-8 rounded-lg font-bold text-xs flex items-center justify-center transition-colors cursor-pointer border ${
                                    currentPage === pageNum 
                                        ? "bg-[#bf3843] border-[#bf3843] text-white" 
                                        : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-white"
                                }`}
                            >
                                {pageNum}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 rounded-lg border border-input bg-background flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-white disabled:pointer-events-none disabled:opacity-50 transition-colors cursor-pointer"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Rekayasa Modal yang Lebih Elegan & Minimalis */}
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={<span className="flex items-center gap-2"><Receipt size={20}/> Tiket Tagihan</span>} size="xl">
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Header Nota */}
                        <div className="bg-secondary/20 p-4 rounded-xl flex items-center justify-between border border-border/50">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">ID Transaksi</p>
                                <p className="font-heading font-black text-2xl text-foreground">#ORD-{selectedOrder.id}</p>
                            </div>
                            <div className="text-right">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase ${getStatusStyle(selectedOrder.status)}`}>
                                    {selectedOrder.status === "success" ? "SELESAI" : (selectedOrder.status === "processing" ? "DIPROSES" : (selectedOrder.status === "paid" ? "LUNAS" : (selectedOrder.status === "pending" ? "MENUNGGU" : "BATAL/GAGAL")))}
                                </span>
                            </div>
                        </div>

                        {/* Info Pelanggan & Waktu */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/10 transition-colors border border-transparent hover:border-border/50">
                                <div className="mt-0.5 text-muted-foreground"><ShoppingBag size={18}/></div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground">Oleh</p>
                                    <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]" title={selectedOrder.user?.username || "Pengunjung"}>
                                        {selectedOrder.user?.username || "Pengunjung"}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground truncate max-w-[200px]" title={selectedOrder.user?.email || "-"}>
                                        {selectedOrder.user?.email || "-"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/10 transition-colors border border-transparent hover:border-border/50">
                                <div className="mt-0.5 text-muted-foreground"><CalendarDays size={18}/></div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground">Dibuat Pada</p>
                                    <p className="text-sm font-bold text-slate-800">{new Date(selectedOrder.createdAt).toLocaleDateString("id-ID")}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(selectedOrder.createdAt).toLocaleTimeString("id-ID")}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/10 transition-colors border border-transparent hover:border-border/50">
                                <div className="mt-0.5 text-muted-foreground"><MapPin size={18}/></div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground">Layanan</p>
                                    <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]" title={selectedOrder.shipping_provider === 'Ambil Sendiri' ? 'Ambil Sendiri' : `Kirim (${selectedOrder.shipping_provider || 'Kurir'})`}>
                                        {selectedOrder.shipping_provider === 'Ambil Sendiri' ? 'Ambil Sendiri' : `Kirim (${selectedOrder.shipping_provider || 'Kurir'})`}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]" title={selectedOrder.shipping_provider === 'Ambil Sendiri' ? 'Dine-in/Takeaway' : (selectedOrder.shipping_service || '-')}>
                                        {selectedOrder.shipping_provider === 'Ambil Sendiri' ? 'Dine-in/Takeaway' : (selectedOrder.shipping_service || '-')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* List Garis Rincian Makanan */}
                        <div>
                            <p className="text-sm font-bold text-foreground mb-3 border-b border-border/50 pb-2">Rincian Belanjaan</p>
                            <div className="space-y-3">
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-secondary/30 flex items-center justify-center font-bold text-muted-foreground">
                                                {item.quantity}x
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">{item.product?.name || "Produk Tidak Dikenal"}</p>
                                                <p className="text-xs text-muted-foreground">@ Rp {item.product?.price?.toLocaleString() || 0}</p>
                                                {item.note && (
                                                    <p className="text-[11px] text-amber-700 bg-amber-50/70 border border-amber-200/50 rounded-lg px-2 py-0.5 mt-1 inline-block font-medium">
                                                        Catatan: {item.note}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <p className="font-bold text-foreground">Rp {((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Catatan Pelanggan */}
                        {selectedOrder.note && (
                            <div className="bg-yellow-50/50 text-yellow-800 p-3 rounded-xl text-sm border-l-4 border-yellow-400">
                                <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Catatan Khusus:</p>
                                <i>"{selectedOrder.note}"</i>
                            </div>
                        )}

                        {/* Live Tracking UI */}
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200 my-4">
                            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Pelacakan Status Real-time</p>
                            <div className="flex items-center justify-between relative mt-4">
                                <div className="flex flex-col items-center flex-1 z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${
                                        selectedOrder.status === "paid" || selectedOrder.status === "processing" || selectedOrder.status === "success" 
                                            ? "bg-green-500 text-white" 
                                            : "bg-gray-300 text-gray-600"
                                    }`}>
                                        {selectedOrder.status === "paid" || selectedOrder.status === "processing" || selectedOrder.status === "success" ? "✓" : "•"}
                                    </div>
                                    <p className="text-[10px] font-bold">Lunas</p>
                                </div>
                                <div className={`absolute top-4 left-[15%] right-[50%] h-1 ${selectedOrder.status === "processing" || selectedOrder.status === "success" ? "bg-green-500" : "bg-gray-300"}`}></div>
                                <div className="flex flex-col items-center flex-1 z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${
                                        selectedOrder.status === "processing" || selectedOrder.status === "success" 
                                            ? "bg-green-500 text-white" 
                                            : "bg-gray-300 text-gray-600"
                                    }`}>
                                        {selectedOrder.status === "processing" || selectedOrder.status === "success" ? "✓" : "•"}
                                    </div>
                                    <p className="text-[10px] font-bold">Diterima/Diproses</p>
                                </div>
                                <div className={`absolute top-4 left-[50%] right-[15%] h-1 ${selectedOrder.status === "success" ? "bg-green-500" : "bg-gray-300"}`}></div>
                                <div className="flex flex-col items-center flex-1 z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${selectedOrder.status === "success" ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"}`}>
                                        {selectedOrder.status === "success" ? "✓" : "◯"}
                                    </div>
                                    <p className="text-[10px] font-bold">Selesai</p>
                                </div>
                            </div>
                        </div>

                        {/* Total Pembayaran Bawah */}
                        <div className="pt-4 border-t-2 border-dashed border-border flex justify-between items-center bg-background rounded-b-xl mb-4">
                            <p className="font-bold text-muted-foreground uppercase text-xs tracking-widest">Total Keseluruhan</p>
                            <p className="text-3xl font-black text-primary font-heading">
                                <span className="text-lg opacity-50 mr-1">Rp</span> 
                                {selectedOrder.total_amount?.toLocaleString() || 0}
                            </p>
                        </div>

                        {/* Aksi Pesanan & Cetak Dokumen */}
                        {(selectedOrder.status === "processing" || selectedOrder.status === "success") && (
                            <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                                <div className="w-full flex gap-2">
                                    <button 
                                        onClick={() => handlePrintInvoice(selectedOrder)}
                                        className="flex-1 border border-border hover:bg-secondary/50 text-foreground rounded-xl py-2 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Receipt size={14} /> Cetak Invoice (A4)
                                    </button>
                                    <button 
                                        onClick={() => handlePrintReceipt(selectedOrder)}
                                        className="flex-1 border border-border hover:bg-secondary/50 text-foreground rounded-xl py-2 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Receipt size={14} /> Cetak Struk (80mm)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Modal Edit Status Pesanan */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={<span className="flex items-center gap-2"><Edit size={20}/> Edit Status Pesanan</span>} size="xl">
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Header Nota */}
                        <div className="bg-secondary/20 p-4 rounded-xl flex items-center justify-between border border-border/50">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">ID Transaksi</p>
                                <p className="font-heading font-black text-2xl text-foreground">#ORD-{selectedOrder.id}</p>
                            </div>
                            <div className="text-right">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase ${getStatusStyle(selectedOrder.status)}`}>
                                    {selectedOrder.status === "success" ? "SELESAI" : (selectedOrder.status === "processing" ? "DIPROSES" : (selectedOrder.status === "paid" ? "LUNAS" : (selectedOrder.status === "pending" ? "MENUNGGU" : "BATAL/GAGAL")))}
                                </span>
                            </div>
                        </div>

                        {/* Info Pelanggan & Waktu */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/10 transition-colors border border-transparent hover:border-border/50">
                                <div className="mt-0.5 text-muted-foreground"><ShoppingBag size={18}/></div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground">Oleh</p>
                                    <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]" title={selectedOrder.user?.username || "Pengunjung"}>
                                        {selectedOrder.user?.username || "Pengunjung"}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground truncate max-w-[200px]" title={selectedOrder.user?.email || "-"}>
                                        {selectedOrder.user?.email || "-"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/10 transition-colors border border-transparent hover:border-border/50">
                                <div className="mt-0.5 text-muted-foreground"><CalendarDays size={18}/></div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground">Dibuat Pada</p>
                                    <p className="text-sm font-bold text-slate-800">{new Date(selectedOrder.createdAt).toLocaleDateString("id-ID")}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(selectedOrder.createdAt).toLocaleTimeString("id-ID")}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/10 transition-colors border border-transparent hover:border-border/50">
                                <div className="mt-0.5 text-muted-foreground"><MapPin size={18}/></div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground">Layanan</p>
                                    <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]" title={selectedOrder.shipping_provider === 'Ambil Sendiri' ? 'Ambil Sendiri' : `Kirim (${selectedOrder.shipping_provider || 'Kurir'})`}>
                                        {selectedOrder.shipping_provider === 'Ambil Sendiri' ? 'Ambil Sendiri' : `Kirim (${selectedOrder.shipping_provider || 'Kurir'})`}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]" title={selectedOrder.shipping_provider === 'Ambil Sendiri' ? 'Dine-in/Takeaway' : (selectedOrder.shipping_service || '-')}>
                                        {selectedOrder.shipping_provider === 'Ambil Sendiri' ? 'Dine-in/Takeaway' : (selectedOrder.shipping_service || '-')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* List Garis Rincian Makanan */}
                        <div>
                            <p className="text-sm font-bold text-foreground mb-3 border-b border-border/50 pb-2">Rincian Belanjaan</p>
                            <div className="space-y-3">
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-secondary/30 flex items-center justify-center font-bold text-muted-foreground">
                                                {item.quantity}x
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">{item.product?.name || "Produk Tidak Dikenal"}</p>
                                                <p className="text-xs text-muted-foreground">@ Rp {item.product?.price?.toLocaleString() || 0}</p>
                                                {item.note && (
                                                    <p className="text-[11px] text-amber-700 bg-amber-50/70 border border-amber-200/50 rounded-lg px-2 py-0.5 mt-1 inline-block font-medium">
                                                        Catatan: {item.note}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <p className="font-bold text-foreground">Rp {((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Catatan Pelanggan */}
                        {selectedOrder.note && (
                            <div className="bg-yellow-50/50 text-yellow-800 p-3 rounded-xl text-sm border-l-4 border-yellow-400">
                                <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Catatan Khusus:</p>
                                <i>"{selectedOrder.note}"</i>
                            </div>
                        )}

                        {/* Live Tracking UI */}
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200 my-4">
                            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Pelacakan Status Real-time</p>
                            <div className="flex items-center justify-between relative mt-4">
                                <div className="flex flex-col items-center flex-1 z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${
                                        selectedOrder.status === "paid" || selectedOrder.status === "processing" || selectedOrder.status === "success" 
                                            ? "bg-green-500 text-white" 
                                            : "bg-gray-300 text-gray-600"
                                    }`}>
                                        {selectedOrder.status === "paid" || selectedOrder.status === "processing" || selectedOrder.status === "success" ? "✓" : "•"}
                                    </div>
                                    <p className="text-[10px] font-bold">Lunas</p>
                                </div>
                                <div className={`absolute top-4 left-[15%] right-[50%] h-1 ${selectedOrder.status === "processing" || selectedOrder.status === "success" ? "bg-green-500" : "bg-gray-300"}`}></div>
                                <div className="flex flex-col items-center flex-1 z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${
                                        selectedOrder.status === "processing" || selectedOrder.status === "success" 
                                            ? "bg-green-500 text-white" 
                                            : "bg-gray-300 text-gray-600"
                                    }`}>
                                        {selectedOrder.status === "processing" || selectedOrder.status === "success" ? "✓" : "•"}
                                    </div>
                                    <p className="text-[10px] font-bold">Diterima/Diproses</p>
                                </div>
                                <div className={`absolute top-4 left-[50%] right-[15%] h-1 ${selectedOrder.status === "success" ? "bg-green-500" : "bg-gray-300"}`}></div>
                                <div className="flex flex-col items-center flex-1 z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${selectedOrder.status === "success" ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"}`}>
                                        {selectedOrder.status === "success" ? "✓" : "◯"}
                                    </div>
                                    <p className="text-[10px] font-bold">Selesai</p>
                                </div>
                            </div>
                        </div>

                        {/* Total Pembayaran Bawah */}
                        <div className="pt-4 border-t-2 border-dashed border-border flex justify-between items-center bg-background rounded-b-xl mb-4">
                            <p className="font-bold text-muted-foreground uppercase text-xs tracking-widest">Total Keseluruhan</p>
                            <p className="text-3xl font-black text-primary font-heading">
                                <span className="text-lg opacity-50 mr-1">Rp</span> 
                                {selectedOrder.total_amount?.toLocaleString() || 0}
                            </p>
                        </div>

                        {/* Aksi Pesanan (2 Button Utama) */}
                        <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                            <div className="flex gap-2 relative">
                                {/* Button 1: Main Action (Red) */}
                                <button 
                                    onClick={handleMainAction}
                                    disabled={isMainDisabled}
                                    className="flex-1 bg-[#bf3843] hover:bg-[#a32f38] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer text-center shadow-md hover:scale-[1.01] active:scale-[0.99]"
                                >
                                    {mainButtonText}
                                </button>

                                {/* Button 2: Secondary Action (Cancel/Revert) */}
                                {showSecondaryButton && (
                                    <button 
                                        onClick={handleSecondaryAction}
                                        className="bg-red-50 hover:bg-red-100 text-red-600 rounded-xl px-6 py-2.5 font-bold text-sm transition-all cursor-pointer text-center"
                                    >
                                        {secondaryButtonText}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>


        </div>
    );
}

