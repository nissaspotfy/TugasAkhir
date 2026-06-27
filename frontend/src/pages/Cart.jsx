import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useCartStore from '../stores/cartStore';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Trash2, ArrowLeft, ShoppingCart, Store } from 'lucide-react';
import { getFallbackFoodImage, handleImageError, getProductImageUrl } from '../lib/imageFallback';

export default function Cart() {
    const navigate = useNavigate();
    const { 
        items, 
        removeItem, 
        updateQuantity, 
        updateItemNote,
        toggleSelectItem,
        toggleSelectAll,
        getSelectedItems,
        getSelectedTotalPrice,
        getSelectedCount
    } = useCartStore();

    const [isStoreOpen, setIsStoreOpen] = useState(true);

    // Fetch store status
    useEffect(() => {
        const fetchStoreStatus = async () => {
            try {
                const res = await api.get('/settings/store-status');
                setIsStoreOpen(res.data.data.isOpen);
            } catch (err) {
                console.error("Failed to fetch store status:", err);
            }
        };
        fetchStoreStatus();
    }, []);

    const isAllSelected = items.length > 0 && items.every(item => item.selected);
    const selectedCount = getSelectedCount();
    const selectedTotalPrice = getSelectedTotalPrice();

    const handleSelectAllChange = (e) => {
        toggleSelectAll(e.target.checked);
    };

    const handleDeleteSelected = async () => {
        if (window.confirm("Apakah Anda yakin ingin menghapus semua barang terpilih dari keranjang?")) {
            const selectedItems = getSelectedItems();
            for (const item of selectedItems) {
                await removeItem(item.id);
            }
        }
    };

    const handleCheckout = () => {
        if (selectedCount === 0) {
            alert("Silakan pilih minimal 1 menu untuk dibeli.");
            return;
        }
        navigate('/checkout');
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            <Navbar />

            <div className="flex-1 max-w-3xl w-full px-4 pt-32 pb-36 mx-auto">
                {/* Back Button */}
                <div className="mb-6">
                    <button 
                        onClick={() => navigate('/menu')}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-primary hover:bg-gray-100 transition-all px-4 py-2 rounded-full -ml-4 cursor-pointer font-bold text-sm border-none bg-transparent"
                        title="Kembali ke Menu"
                    >
                        <ArrowLeft className="w-5 h-5 text-primary" />
                        <span>Kembali ke Menu</span>
                    </button>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-heading font-black text-primary">Keranjang Belanja</h1>
                    {selectedCount > 0 && (
                        <button 
                            onClick={handleDeleteSelected}
                            className="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-1 cursor-pointer border-none bg-transparent hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus Terpilih
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto my-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Keranjang Belanja Kosong</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">
                            Wah, sepertinya kamu belum menambahkan makanan apa pun ke keranjang belanjamu. Pilih menu lezat kami sekarang!
                        </p>
                        <Link to="/menu">
                            <Button className="bg-accent hover:bg-accent/90 text-white font-bold px-8 h-12 rounded-xl w-full">
                                Mulai Belanja
                            </Button>
                        </Link>
                    </div>
                ) : (
                    /* Items List */
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div 
                                key={item.id}
                                className={`p-4 bg-white border shadow-sm rounded-2xl flex items-start gap-4 transition-all duration-200 ${item.selected ? 'border-accent/30 bg-accent/[0.01]' : 'border-gray-100'}`}
                            >
                                {/* Selection Checkbox (Circular) */}
                                <div className="pt-2">
                                    <input 
                                        type="checkbox"
                                        checked={item.selected}
                                        onChange={() => toggleSelectItem(item.id)}
                                        className="w-5.5 h-5.5 rounded-full border-2 border-gray-300 text-green-600 focus:ring-green-600 accent-green-600 cursor-pointer focus:ring-offset-0 transition-all"
                                    />
                                </div>

                                {/* Product Image */}
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                    <img 
                                        src={getProductImageUrl(item.image_url) || getFallbackFoodImage(item.name)}
                                        alt={item.name}
                                        onError={(e) => handleImageError(e, item.name)}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Item Info & Controls */}
                                <div className="flex-1 space-y-3 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm md:text-base leading-snug line-clamp-1">
                                                {item.name}
                                            </h3>
                                            <p className="font-black text-accent text-sm mt-0.5">
                                                Rp {item.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => removeItem(item.id)}
                                            className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer flex-shrink-0"
                                            title="Hapus Menu"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Note input per item */}
                                    <div className="relative">
                                        <Input 
                                            placeholder="Tulis catatan untuk hidangan ini... (opsional)"
                                            value={item.note || ''}
                                            onChange={(e) => updateItemNote(item.id, e.target.value)}
                                            className="text-xs h-8 pl-2 pr-2 py-1 bg-slate-50/50 border-gray-200/80 rounded-lg text-slate-600 w-full"
                                        />
                                    </div>

                                    {/* Quantity Adjuster & Store Status Alert */}
                                    <div className="flex justify-between items-center gap-3">
                                        <div>
                                            {!isStoreOpen && (
                                                <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                    Toko Tutup
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer select-none bg-white text-sm"
                                            >
                                                -
                                            </button>
                                            <span className="font-black text-sm text-slate-800 w-6 text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer select-none bg-white text-sm"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sticky Bottom Bar */}
            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
                    <div className="max-w-3xl mx-auto px-4 h-20 flex items-center justify-between font-sans">
                        {/* Left Group: Circular Select All Checkbox */}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input 
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleSelectAllChange}
                                className="w-5.5 h-5.5 rounded-full border-2 border-gray-300 text-green-600 focus:ring-green-600 accent-green-600 cursor-pointer focus:ring-offset-0 transition-all"
                            />
                            <span className="text-sm font-bold text-gray-500">Semua</span>
                        </label>

                        {/* Right Group: Price & Checkout */}
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="text-base font-black text-slate-800">
                                    Rp{selectedTotalPrice.toLocaleString()}
                                </span>
                            </div>
                            <Button
                                onClick={handleCheckout}
                                disabled={selectedCount === 0 || !isStoreOpen}
                                className={`h-11 px-8 rounded-full font-bold text-sm shadow-md transition-all border-none ${
                                    selectedCount === 0 || !isStoreOpen
                                        ? 'bg-gray-300 text-gray-500 hover:bg-gray-300 cursor-not-allowed shadow-none'
                                        : 'bg-[#00bfa5] hover:bg-[#00a892] text-white cursor-pointer hover:scale-[1.02]'
                                }`}
                            >
                                Checkout
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
