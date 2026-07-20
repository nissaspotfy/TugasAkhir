import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Input } from "../ui/input";
import api from "../../lib/api";
import { useToast } from "../ui/ToastProvider";
import { Modal } from "./Modal";
import { getFallbackFoodImage, handleImageError } from "../../lib/imageFallback";
import { ImageCropperModal } from "./ImageCropperModal";

export function ProductsManager() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    // Pagination & Search states
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // add or edit
    const [formData, setFormData] = useState({ 
        id: null, 
        name: "", 
        price: "", 
        stock: "", 
        image_file: null, 
        image_url: "",
        description: "", 
        category_id: "" 
    });

    // States for cropping and preview
    const [cropperOpen, setCropperOpen] = useState(false);
    const [cropperImageSrc, setCropperImageSrc] = useState(null);
    const [cropperFileName, setCropperFileName] = useState("");
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch products when page or debounced search changes
    useEffect(() => {
        fetchProducts(currentPage, debouncedSearch);
    }, [currentPage, debouncedSearch]);

    // Fetch categories once on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get("/categories");
            setCategories(res.data.data || []);
        } catch (error) {
            console.error("Gagal mengambil kategori:", error);
        }
    };

    const fetchProducts = async (page = 1, searchQuery = "") => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 10
            };
            if (searchQuery) {
                params.search = searchQuery;
            }
            const res = await api.get("/products", { params });
            if (res.data?.data) {
                setProducts(res.data.data.products || []);
                setCurrentPage(res.data.data.page || 1);
                setTotalPages(res.data.data.totalPages || 1);
                setTotalProducts(res.data.data.total || 0);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Gagal mengambil produk:", error);
            addToast("Gagal mengambil data produk dari server", "error");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Hapus produk ini secara permanen?")) {
            try {
                await api.delete(`/products/${id}`);
                addToast("Produk berhasil dihapus secara permanen", "success");
                const isLastItem = products.length === 1;
                const nextPage = isLastItem ? Math.max(currentPage - 1, 1) : currentPage;
                fetchProducts(nextPage, debouncedSearch);
            } catch (error) {
                console.error("Gagal menghapus produk:", error);
                const errMsg = error.response?.data?.message || "Gagal menghapus produk dari server";
                addToast(errMsg, "error");
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreviewUrl);
        }
        setImagePreviewUrl(null);
    };

    const openAddModal = () => {
        setFormData({ 
            id: null, 
            name: "", 
            price: "", 
            stock: "", 
            image_file: null, 
            image_url: "",
            description: "", 
            category_id: categories[0]?.id || "" 
        });
        setImagePreviewUrl(null);
        setModalMode("add");
        setIsModalOpen(true);
    };

    const openEditModal = (p) => {
        setFormData({ 
            id: p.id, 
            name: p.name, 
            price: p.price, 
            stock: p.stock, 
            image_file: null, 
            image_url: p.image_url || "", 
            description: p.description || "", 
            category_id: p.category_id || "" 
        });
        setImagePreviewUrl(p.image_url || null);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const handleCropComplete = (croppedFile) => {
        if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreviewUrl);
        }
        const previewUrl = URL.createObjectURL(croppedFile);
        setFormData(prev => ({ ...prev, image_file: croppedFile }));
        setImagePreviewUrl(previewUrl);
        setCropperOpen(false);
        
        if (cropperImageSrc) {
            URL.revokeObjectURL(cropperImageSrc);
            setCropperImageSrc(null);
        }
    };

    const handleCropCancel = () => {
        setCropperOpen(false);
        if (cropperImageSrc) {
            URL.revokeObjectURL(cropperImageSrc);
            setCropperImageSrc(null);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Validasi: gambar wajib diisi saat menambah produk baru
        if (modalMode === "add" && !formData.image_file) {
            addToast("Gambar produk wajib diunggah sebelum menyimpan.", "error");
            return;
        }

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("price", formData.price);
            data.append("stock", formData.stock);
            data.append("description", formData.description);
            if (formData.category_id) {
                data.append("category_id", formData.category_id);
            }
            if (formData.image_file) {
                data.append("image", formData.image_file);
            }

            if (modalMode === "add") {
                await api.post("/products", data, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                addToast("Produk berhasil ditambahkan", "success");
                setCurrentPage(1);
                fetchProducts(1, debouncedSearch);
            } else {
                await api.put(`/products/${formData.id}`, data, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                addToast("Produk berhasil diperbarui", "success");
                fetchProducts(currentPage, debouncedSearch);
            }
            
            handleCloseModal();
        } catch (error) {
            console.error("Gagal menyimpan produk:", error);
            const errMsg = error.response?.data?.message || error.message || "Terjadi kesalahan saat menyimpan produk";
            addToast(errMsg, "error");
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input 
                        placeholder="Cari nama produk..." 
                        className="pl-10 bg-secondary/20" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90 rounded-[10px] whitespace-nowrap">
                    <Plus size={18} className="mr-2" /> Tambah Produk
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/30 text-muted-foreground border-b border-border/50 font-bold">
                        <tr>
                            <th className="p-4 rounded-tl-xl">Foto</th>
                            <th className="p-4">Nama Menu</th>
                            <th className="p-4">Kategori</th>
                            <th className="p-4">Harga</th>
                            <th className="p-4">Stok</th>
                            <th className="p-4 rounded-tr-xl flex justify-end">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-4 text-center">Memuat...</td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-muted-foreground">
                                    Tidak ada produk ditemukan.
                                </td>
                            </tr>
                        ) : (
                            products.map(p => (
                                <tr key={p.id} className="hover:bg-secondary/10 transition-colors">
                                    <td className="p-4">
                                        <div className="w-12 h-12 rounded-lg bg-muted border border-border/50 overflow-hidden">
                                            <img 
                                                src={p.image_url || getFallbackFoodImage(p.name)} 
                                                alt={p.name} 
                                                className="w-full h-full object-cover" 
                                                onError={(e) => handleImageError(e, p.name)}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-foreground">{p.name}</td>
                                    <td className="p-4">
                                        <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-[6px] text-xs font-bold border border-primary/20">
                                            {p.category?.name || "Umum"}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium">Rp {Number(p.price).toLocaleString()}</td>
                                    <td className="p-4 font-medium">{p.stock}</td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => openEditModal(p)} 
                                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Edit Produk"
                                            >
                                                <Edit size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(p.id)} 
                                                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Hapus Produk"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/50 pt-4 mt-6 gap-4">
                    <p className="text-sm text-muted-foreground text-center sm:text-left">
                        Menampilkan Halaman <span className="font-bold text-foreground">{currentPage}</span> dari <span className="font-bold text-foreground">{totalPages}</span> ({totalProducts} Produk)
                    </p>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="rounded-lg font-bold"
                        >
                            Sebelumnya
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                                        currentPage === pageNum 
                                            ? "bg-primary text-white" 
                                            : "hover:bg-secondary text-muted-foreground"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="rounded-lg font-bold"
                        >
                            Selanjutnya
                        </Button>
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={modalMode === "add" ? "Tambah Produk" : "Edit Produk"} size="2xl">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-muted-foreground block mb-2">Nama Menu</label>
                                <Input 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                    placeholder="Misal: Nasi Goreng Gila" 
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-muted-foreground block mb-2">Kategori Produk</label>
                                <select 
                                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={formData.category_id}
                                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                                    required
                                >
                                    <option value="" disabled>Pilih Kategori</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-muted-foreground block mb-2">Harga (Rp)</label>
                                    <Input 
                                        type="number" 
                                        value={formData.price} 
                                        onChange={e => setFormData({...formData, price: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-muted-foreground block mb-2">Stok</label>
                                    <Input 
                                        type="number" 
                                        value={formData.stock} 
                                        onChange={e => setFormData({...formData, stock: e.target.value})} 
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-muted-foreground block mb-2">Deskripsi Produk</label>
                                <textarea 
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[96px] resize-none"
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    placeholder="Jelaskan cita rasa makanan ini (Opsional)" 
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-muted-foreground block mb-2">
                                    Gambar Produk
                                    {modalMode === "add" && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                <div className="relative group">
                                    {/* Hidden file input */}
                                    <input 
                                        type="file" 
                                        id="product-image-upload"
                                        accept="image/*" 
                                        onChange={e => {
                                            const file = e.target.files?.[0] || null;
                                            if (file) {
                                                const objectUrl = URL.createObjectURL(file);
                                                setCropperImageSrc(objectUrl);
                                                setCropperFileName(file.name);
                                                setCropperOpen(true);
                                            }
                                            e.target.value = "";
                                        }}
                                        className="hidden"
                                    />
                                    
                                    {imagePreviewUrl ? (
                                        <div className="relative w-full h-32 rounded-2xl border border-border/60 overflow-hidden shadow-inner bg-secondary/15 flex items-center justify-center">
                                            <img 
                                                src={imagePreviewUrl} 
                                                alt="Preview" 
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                                onError={(e) => handleImageError(e, formData.name)}
                                            />
                                            <label 
                                                htmlFor="product-image-upload"
                                                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white font-semibold cursor-pointer transition-all duration-300 gap-2"
                                            >
                                                <Plus className="w-6 h-6 animate-pulse" />
                                                <span className="text-xs">Ganti Gambar</span>
                                            </label>
                                        </div>
                                    ) : (
                                        <label 
                                            htmlFor="product-image-upload"
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/30 hover:border-primary/60 rounded-2xl cursor-pointer transition-all duration-300 bg-secondary/10 hover:bg-primary/5 p-2 text-center group"
                                        >
                                            <div className="p-2 bg-white rounded-full shadow-sm text-muted-foreground group-hover:text-primary transition-colors duration-300">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-semibold text-foreground/80 mt-2 group-hover:text-primary transition-colors duration-300">
                                                Pilih Gambar Produk
                                            </span>
                                        </label>
                                    )}
                                </div>
                                {formData.image_file ? (
                                    <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                                        <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                        File terpilih: {formData.image_file.name}
                                    </p>
                                ) : modalMode === "add" && (
                                    <p className="text-[10px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
                                        <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                        Gambar produk wajib diunggah
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <Button type="submit" className="w-full bg-primary text-white rounded-xl py-5 font-bold text-md hover:bg-primary/95 transition-all shadow-md">
                        Simpan Produk
                    </Button>
                </form>
            </Modal>

            <ImageCropperModal
                isOpen={cropperOpen}
                imageSrc={cropperImageSrc}
                fileName={cropperFileName}
                onCrop={handleCropComplete}
                onClose={handleCropCancel}
            />
        </div>
    );
}
