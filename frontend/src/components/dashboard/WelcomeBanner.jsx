import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
import { Sparkles, Tag } from 'lucide-react'
import api from '../../lib/api'

export function WelcomeBanner({ userName }) {
    const [activePromos, setActivePromos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const res = await api.get('/promos');
                if (res.data && res.data.data) {
                    const active = res.data.data.filter(p => p.is_active === true);
                    setActivePromos(active);
                }
            } catch (err) {
                console.error("Gagal memuat promo di banner:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPromos();
    }, []);

    const getPromoText = () => {
        if (loading) {
            return "Sedang memuat promo spesial untuk Anda...";
        }
        if (activePromos.length === 0) {
            return "Nikmati kelezatan aneka menu D'raosan dengan cita rasa Nusantara hari ini!";
        }

        // Find best promo (highest discount value)
        const bestPromo = activePromos.reduce((prev, current) => {
            return (Number(prev.discount_value) > Number(current.discount_value)) ? prev : current;
        }, activePromos[0]);

        const discountStr = bestPromo.discount_type === 'percentage'
            ? `Diskon ${bestPromo.discount_value}%`
            : `Potongan Rp ${Number(bestPromo.discount_value).toLocaleString('id-ID')}`;

        return `Dapatkan penawaran terbaik hari ini: ${discountStr} dengan kode voucher "${bestPromo.code}"!`;
    };

    return (
        <div className="bg-gradient-to-r from-[#B91C1C] via-[#E11D48] to-[#F59E0B] rounded-2xl p-5 sm:p-6 text-primary-foreground relative overflow-hidden shadow-md border border-amber-500/20">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold bg-white/10 rounded-full border border-white/20 text-yellow-300">
                        <Sparkles size={11} className="animate-pulse" />
                        <span>Promo Spesial Hari Ini</span>
                    </div>

                    <h1 className="font-heading text-2xl sm:text-3xl font-black">
                        Halo, {userName || 'Pelanggan'}!
                    </h1>

                    <p className="text-sm sm:text-base font-semibold text-yellow-100/90">
                        Perut keroncongan? Saatnya nyemil seru dengan D'raosan!
                    </p>

                    <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                        {getPromoText()}
                    </p>

                    <p className="text-[11px] text-yellow-200 flex items-center gap-1">
                        <span>🏷️</span> <span>Klik tombol melayang di pojok kanan bawah untuk menyalin voucher lainnya!</span>
                    </p>
                </div>

                <div className="flex-shrink-0">
                    <Link to="/menu">
                        <Button className="bg-white hover:bg-gray-100 text-primary hover:text-[#941c26] rounded-full px-6 py-3.5 h-auto text-sm font-bold shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95">
                            Lihat Menu
                        </Button>
                    </Link>
                </div>
            </div>
            {/* Elegant Decor */}
            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-20 pointer-events-none"></div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>
    )
}
