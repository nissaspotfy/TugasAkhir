import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';
import useCartStore from '../stores/cartStore';
import api from '../lib/api';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id') || 'ORDER-XXXXXX';
  const transactionStatus = searchParams.get('transaction_status') || 'Settlement';
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Clear the cart on success page load to prevent "Keranjang Kosong" flashing on checkout page
    clearCart();

    // Sync status with backend
    const syncStatus = async () => {
      try {
        const transactionId = orderId.replace('ORDER-', '');
        await api.post(`/transactions/${transactionId}/sync`);
      } catch (err) {
        console.error("Failed to sync on success page load:", err);
      }
    };
    syncStatus();
  }, [orderId, clearCart]);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-28 pb-12">
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 max-w-md w-full p-8 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          {/* Top Decorative bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#00bfa5]"></div>
          
          {/* Success Icon */}
          <div className="inline-flex p-4 bg-emerald-50 rounded-full text-[#00bfa5] mb-6 mt-4">
            <CheckCircle2 className="w-16 h-16 stroke-[1.5]" />
          </div>
          
          <h1 className="text-3xl font-heading font-black text-slate-800 mb-3">
            Pembayaran Berhasil!
          </h1>
          
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Terima kasih atas pesanan Anda. Kami telah menerima pembayaran Anda dan pesanan Anda sedang kami proses.
          </p>

          {/* Transaction Info Box */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8 text-left space-y-2">
            <div className="flex justify-between text-xs font-bold text-[#888] uppercase tracking-wider">
              <span>Detail Transaksi</span>
              <span className="text-[#00bfa5] font-extrabold">LUNAS</span>
            </div>
            <div className="h-px bg-slate-200/60 my-2"></div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">Nomor Pesanan:</span>
              <span className="font-mono font-bold text-slate-700 break-all">{orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">Status Gateway:</span>
              <span className="font-bold text-slate-700 capitalize">{transactionStatus}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Link to="/dashboard" className="w-full">
              <Button className="w-full h-12 bg-[#b73a43] hover:bg-[#a02f37] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer border-none">
                Lihat Riwayat Pesanan
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            
            <Link to="/" className="w-full">
              <Button variant="outline" className="w-full h-12 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                <Home className="w-4 h-4" />
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
