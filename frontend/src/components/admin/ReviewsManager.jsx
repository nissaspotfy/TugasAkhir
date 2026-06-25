import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Star, MessageSquare, Calendar, ShoppingBag, RefreshCw } from 'lucide-react';
import { useToast } from '../ui/ToastProvider';

export function ReviewsManager() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [togglingId, setTogglingId] = useState(null);
    const { addToast } = useToast();

    const handleToggleHomepage = async (id, currentStatus) => {
        setTogglingId(id);
        try {
            await api.put(`/reviews/${id}/toggle-homepage`);
            setReviews(prev => prev.map(r => r.id === id ? { ...r, show_on_homepage: !currentStatus } : r));
            addToast(!currentStatus ? "Ulasan berhasil ditampilkan di Beranda" : "Ulasan berhasil disembunyikan dari Beranda", "success");
        } catch (err) {
            console.error("Failed to toggle homepage status", err);
            addToast(err.response?.data?.message || "Gagal mengubah status tampilan ulasan.", "error");
        } finally {
            setTogglingId(null);
        }
    };

    const fetchReviews = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/reviews');
            setReviews(res.data.data);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
            setError(err.response?.data?.message || err.message || "Gagal memuat ulasan.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // Calculate statistics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
        : '0.0';

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        className={`stroke-[1.5] ${rating >= star
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-slate-200 fill-slate-50'
                            }`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <p className="font-semibold text-sm">Memuat data ulasan...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-border/50 p-6 shadow-sm">
                <p className="text-red-500 font-bold mb-4">Gagal memuat ulasan: {error}</p>
                <button
                    onClick={fetchReviews}
                    className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-sm"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Total Reviews Card */}
                <div className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Ulasan</p>
                        <h3 className="text-2xl font-bold text-slate-800">{totalReviews} Ulasan</h3>
                    </div>
                </div>

                {/* Average Rating Card */}
                <div className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center flex-shrink-0">
                        <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Rata-rata Rating</p>
                        <h3 className="text-2xl font-bold text-slate-800 flex items-baseline gap-1.5">
                            {averageRating}
                            <span className="text-xs text-muted-foreground font-semibold">/ 5.0</span>
                        </h3>
                    </div>
                </div>

                {/* Homepage Reviews Card */}
                <div className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Ulasan di Beranda</p>
                        <h3 className="text-2xl font-bold text-slate-800 flex items-baseline gap-1.5">
                            {reviews.filter(r => r.show_on_homepage).length}
                            <span className="text-xs text-muted-foreground font-semibold">/ 10</span>
                        </h3>
                    </div>
                </div>
            </div>

            {/* Reviews Grid */}
            {totalReviews === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-border/50 shadow-sm">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/45 mx-auto mb-4" />
                    <h3 className="font-bold text-slate-700 mb-1">Belum Ada Ulasan</h3>
                    <p className="text-muted-foreground text-sm">Pelanggan belum memberikan ulasan atau rating untuk pesanan mereka.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {reviews.map((r) => {
                        const dateFormatted = new Date(r.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        });

                        return (
                            <div key={r.id} className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="space-y-4">
                                    {/* Header: Customer Info & Rating */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold overflow-hidden border border-border">
                                                {r.customer.profilePicture ? (
                                                    <img src={r.customer.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    r.customer.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{r.customer.name}</h4>
                                                <p className="text-[11px] text-muted-foreground line-clamp-1">{r.customer.email}</p>
                                            </div>
                                        </div>
                                        {renderStars(r.rating)}
                                    </div>

                                    {/* Comment */}
                                    <p className="text-slate-600 text-sm italic leading-relaxed">
                                        "{r.comment || 'Tidak ada komentar tertulis.'}"
                                    </p>

                                    {/* Toggle sakelar "Tampilkan di Beranda" */}
                                    <div className="flex items-center justify-between bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/60 mt-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700">Tampilkan di Beranda</span>
                                            <span className="text-[10px] text-muted-foreground">Tampilkan ulasan ini di beranda depan</span>
                                        </div>
                                        <button
                                            onClick={() => handleToggleHomepage(r.id, r.show_on_homepage)}
                                            disabled={togglingId === r.id}
                                            className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 disabled:opacity-50 ${
                                                r.show_on_homepage ? 'bg-green-500' : 'bg-slate-300'
                                            }`}
                                        >
                                            <div
                                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                                                    r.show_on_homepage ? 'translate-x-4' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Footer: Transaction Items & Date */}
                                <div className="mt-5 pt-4 border-t border-border/40 space-y-3">
                                    {/* Items list */}
                                    <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <ShoppingBag className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        <div className="text-xs text-slate-600">
                                            <p className="font-semibold text-slate-700 mb-0.5">Pesanan:</p>
                                            <p className="line-clamp-2">
                                                {r.transaction.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Date and Order ID */}
                                    <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            <span>{dateFormatted}</span>
                                        </div>
                                        <span className="font-mono font-semibold text-primary">#ORD-{r.transaction.id.slice(0, 8)}...</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
