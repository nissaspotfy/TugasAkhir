import React, { useState, useEffect, useRef } from "react";
import { X, Sparkles, Copy, Check, Tag, Info, Gift } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/ToastProvider";
import useAuthStore, { getUserRole } from "../stores/authStore";
import api from "../lib/api";

export default function GamifiedPopup() {
    const { addToast } = useToast();
    const { user } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);

    const isAdminRoute = window.location.pathname.startsWith('/admin');
    const isCustomer = user && getUserRole(user) !== 'admin';

    // Auto open popup after 4 seconds on first load in this session for customer only
    useEffect(() => {
        if (!isCustomer || isAdminRoute) return;

        const hasSeenPromo = sessionStorage.getItem("hasSeenPromoPopup");
        if (!hasSeenPromo) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem("hasSeenPromoPopup", "true");
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isCustomer, isAdminRoute]);

    // Scroll Lock on background
    useEffect(() => {
        if (isOpen) {
            document.body.style.setProperty("overflow", "hidden", "important");
            document.documentElement.style.setProperty("overflow", "hidden", "important");
        } else {
            document.body.style.removeProperty("overflow");
            document.documentElement.style.removeProperty("overflow");
        }
        return () => {
            document.body.style.removeProperty("overflow");
            document.documentElement.style.removeProperty("overflow");
        };
    }, [isOpen]);

    const modalRef = useRef(null);

    // Strict wheel and touch event interceptor to disable background scroll chaining
    useEffect(() => {
        if (!isOpen) return;

        const handleWheel = (e) => {
            const scrollContainer = modalRef.current?.querySelector('.scroll-container');
            if (!scrollContainer) return;

            // Check if scroll target is inside scrollContainer
            const isInside = scrollContainer.contains(e.target);
            if (!isInside) {
                e.preventDefault();
                return;
            }

            // If inside scrollContainer, prevent scroll chaining at top/bottom boundaries
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
            const isScrollingUp = e.deltaY < 0;
            const isScrollingDown = e.deltaY > 0;

            if (isScrollingUp && scrollTop <= 0) {
                e.preventDefault();
            } else if (isScrollingDown && scrollTop + clientHeight >= scrollHeight - 1) {
                e.preventDefault();
            }
        };

        const handleTouchMove = (e) => {
            const scrollContainer = modalRef.current?.querySelector('.scroll-container');
            if (!scrollContainer) return;

            const isInside = scrollContainer.contains(e.target);
            if (!isInside) {
                e.preventDefault();
            }
        };

        const modalElement = modalRef.current;
        if (modalElement) {
            modalElement.addEventListener('wheel', handleWheel, { passive: false });
            modalElement.addEventListener('touchmove', handleTouchMove, { passive: false });
        }

        // Also lock backdrop overlay scroll
        const backdropElement = modalElement?.parentElement;
        const handleBackdropWheel = (e) => {
            if (e.target === backdropElement) {
                e.preventDefault();
            }
        };
        if (backdropElement) {
            backdropElement.addEventListener('wheel', handleBackdropWheel, { passive: false });
            backdropElement.addEventListener('touchmove', handleBackdropWheel, { passive: false });
        }

        return () => {
            if (modalElement) {
                modalElement.removeEventListener('wheel', handleWheel);
                modalElement.removeEventListener('touchmove', handleTouchMove);
            }
            if (backdropElement) {
                backdropElement.removeEventListener('wheel', handleBackdropWheel);
                backdropElement.removeEventListener('touchmove', handleBackdropWheel);
            }
        };
    }, [isOpen]);

    // Fetch active vouchers from backend dynamically
    useEffect(() => {
        if (!isCustomer || isAdminRoute) return;

        const fetchVouchers = async () => {
            try {
                setLoading(true);
                const res = await api.get('/promos');
                if (res.data && res.data.data) {
                    // Filter only active promos
                    const activePromos = res.data.data.filter(p => p.is_active === true);
                    setVouchers(activePromos);
                }
            } catch (error) {
                console.error("Gagal mengambil voucher promo:", error);
            } finally {
                setLoading(false);
            }
        };

        // Importing api dynamically or using the imported instance
        // Let's import api from '../../lib/api' directly
        fetchVouchers();
    }, [isCustomer, isAdminRoute]);

    // Do not show button or popup for Admins, Admin routes, or unauthenticated guests
    if (!isCustomer || isAdminRoute) {
        return null;
    }

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        addToast(`Kode voucher "${code}" berhasil disalin!`, "success");
        setTimeout(() => setCopiedCode(null), 2000);
    };


    return (
        <>
            {/* Custom CSS for Slow Bounce and Scrollbar */}
            <style>{`
                @keyframes slow-bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-4px);
                    }
                }
                .animate-slow-bounce {
                    animation: slow-bounce 5s ease-in-out infinite;
                }
                .scroll-container::-webkit-scrollbar {
                    width: 6px;
                    display: block !important;
                }
                .scroll-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }
                .scroll-container::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 4px;
                }
                .scroll-container::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
            `}</style>

            {/* Floating Promo Tag Button (Visible only to customers) */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 bg-accent text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-white animate-slow-bounce group"
                title="Lihat Promo Aktif!"
            >
                <Tag className="w-6 h-6" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 ease-out text-sm font-bold whitespace-nowrap">
                    Voucher Promo!
                </span>
            </button>

            {/* Popup Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-8 md:p-12 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-hidden">
                    <div 
                        ref={modalRef}
                        className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] p-6 md:p-8 relative overflow-hidden border border-border shadow-2xl flex flex-col"
                    >
                        
                        {/* Close button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 hover:bg-secondary rounded-full transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="text-center space-y-2 mb-6">
                            <div className="inline-flex p-3 bg-primary/10 text-primary rounded-full mb-1">
                                <Sparkles className="w-6 h-6 text-primary fill-primary/30" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-heading font-black text-foreground">
                                Promo Spesial Hari Ini!
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                                Salin kode voucher di bawah ini dan masukkan pada halaman checkout untuk menikmati diskon instan dari D'raosan!
                            </p>
                        </div>

                        {/* Vouchers List Container - Wide Grid Layout */}
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground text-sm">
                                Memuat voucher aktif...
                            </div>
                        ) : vouchers.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-border rounded-2xl text-muted-foreground text-sm">
                                Saat ini tidak ada voucher promo aktif yang tersedia.
                            </div>
                        ) : (
                            <div 
                                className="overflow-y-auto max-h-[280px] py-2 px-2 scroll-container"
                                style={{ overscrollBehavior: "contain" }}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1">
                                    {vouchers.map((voucher) => {
                                        const isPercentage = voucher.discount_type === "percentage";
                                        const discountLabel = isPercentage 
                                            ? `Diskon ${voucher.discount_value}%` 
                                            : `Potongan Rp ${Number(voucher.discount_value).toLocaleString()}`;
                                        
                                        return (
                                            <div 
                                                key={voucher.id}
                                                className="p-5 border border-border/80 rounded-2xl bg-secondary/10 hover:border-accent/40 transition-all hover:shadow-md flex flex-col justify-between relative overflow-hidden min-h-[160px] h-full"
                                            >
                                                {/* Ticket Deco Cutouts */}
                                                <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-r border-border/80"></div>
                                                <div className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-l border-border/80"></div>

                                                <div className="space-y-2 pl-2 pr-2">
                                                    <span className="inline-block text-[11px] font-black text-accent uppercase tracking-wider bg-accent/10 px-2.5 py-1 rounded-md">
                                                        {discountLabel}
                                                    </span>
                                                    <h4 className="font-bold text-foreground text-sm">Voucher {voucher.code}</h4>
                                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                        Gunakan kode kupon ini untuk mendapatkan {discountLabel.toLowerCase()} pada pesanan Anda.
                                                        {voucher.max_usage !== null && (
                                                            <span className="block mt-1 font-semibold text-blue-600">Sisa kuota: {voucher.max_usage}x penggunaan</span>
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="mt-4 pt-3 border-t border-dashed border-border/80 flex items-center justify-between pl-2 pr-2">
                                                    <span className="font-mono font-black text-xs tracking-wider text-foreground bg-white border border-border px-2.5 py-1 rounded-lg shadow-inner">
                                                        {voucher.code}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopy(voucher.code)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                                            copiedCode === voucher.code 
                                                                ? "bg-green-100 text-green-700 border border-green-200" 
                                                                : "bg-primary text-white hover:bg-primary/90 hover:shadow"
                                                        }`}
                                                    >
                                                        {copiedCode === voucher.code ? (
                                                            <>
                                                                <Check className="w-3 h-3" />
                                                                Disalin!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-3 h-3" />
                                                                Salin
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Information Note */}
                        <div className="mt-6 flex items-start gap-2.5 p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100/60 text-xs text-blue-700">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p className="leading-relaxed text-left">
                                <strong>Catatan:</strong> Setiap pemesanan hanya dapat menggunakan satu kode voucher. Pastikan memilih voucher yang paling menguntungkan belanjaan Anda!
                            </p>
                        </div>

                        <Button
                            onClick={() => setIsOpen(false)}
                            className="mt-6 w-full bg-primary font-bold rounded-xl py-5 hover:bg-primary/95 text-white"
                        >
                            Mulai Belanja Lezat!
                        </Button>

                    </div>
                </div>
            )}
        </>
    );
}
