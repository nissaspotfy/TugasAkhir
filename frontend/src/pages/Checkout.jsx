import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useCartStore from '../stores/cartStore';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discount_amount }
  const [loading, setLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const subtotal = getTotalPrice();
  const discount = appliedPromo ? appliedPromo.discount_amount : 0;
  const finalTotal = subtotal - discount;

  // Load Midtrans Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-dummy-key');
    document.body.appendChild(script);
    
    return () => {
        document.body.removeChild(script);
    }
  }, []);

  const handleApplyPromo = async () => {
      setPromoError('');
      setPromoSuccess('');
      setLoading(true);
      try {
          const res = await api.post('/promos/check', { code: promoCode, totalAmount: subtotal });
          setAppliedPromo(res.data.data);
          setPromoSuccess('Promo applied successfully!');
      } catch (error) {
          setPromoError(error.response?.data?.message || 'Invalid promo code');
          setAppliedPromo(null);
      } finally {
          setLoading(false);
      }
  };

  const handleCheckout = async () => {
      setLoading(true);
      try {
          const payload = {
              items: items.map(item => ({
                  productId: item.id,
                  quantity: item.quantity
              })),
              promoCode: appliedPromo ? appliedPromo.code : null
          };

          const res = await api.post('/transactions', payload);
          const { snapToken } = res.data.data;

          if (window.snap) {
              window.snap.pay(snapToken, {
                  onSuccess: function(result){
                      alert("Payment success!");
                      clearCart();
                      navigate('/dashboard');
                  },
                  onPending: function(result){
                      alert("Waiting for payment!");
                      clearCart();
                      navigate('/dashboard');
                  },
                  onError: function(result){
                      alert("Payment failed!");
                  },
                  onClose: function(){
                      console.log('customer closed the popup without finishing the payment');
                  }
              });
          } else {
              alert("Payment gateway not loaded properly.");
          }
      } catch (error) {
          console.error("Checkout failed", error);
          alert("Checkout failed: " + (error.response?.data?.message || error.message));
      } finally {
          setLoading(false);
      }
  };

  if (items.length === 0) {
      return (
          <div className="min-h-screen bg-gray-50 font-sans">
              <Navbar />
              <div className="flex flex-col items-center justify-center pt-20">
                  <h2 className="text-2xl font-bold mb-4">Keranjang Kosong</h2>
                  <Link to="/">
                      <Button>Belanja Sekarang</Button>
                  </Link>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Belanja
        </Link>
        
        <h1 className="text-3xl font-heading text-primary mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="md:col-span-2 space-y-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Daftar Barang</h2>
                    <div className="space-y-6">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-6 last:pb-0 last:border-0">
                                <div className="h-24 w-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={item.image_url || 'https://placehold.co/150'} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-2">
                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                        <p className="font-bold">Rp {(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-4">Harga satuan: Rp {item.price.toLocaleString()}</p>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border rounded-full">
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="px-3 py-1 hover:bg-gray-100 rounded-l-full"
                                            >
                                                -
                                            </button>
                                            <span className="px-3 font-bold">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="px-3 py-1 hover:bg-gray-100 rounded-r-full"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-400 hover:text-red-600 ml-auto"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Kode Promo</h2>
                    <div className="flex gap-2 mb-2">
                        <Input 
                            placeholder="Masukan kode promo" 
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                        />
                        <Button onClick={handleApplyPromo} disabled={loading || !promoCode}>Apply</Button>
                    </div>
                    {promoError && <p className="text-red-500 text-sm">{promoError}</p>}
                    {promoSuccess && <p className="text-green-500 text-sm">{promoSuccess}</p>}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>Rp {subtotal.toLocaleString()}</span>
                        </div>
                        {appliedPromo && (
                            <div className="flex justify-between text-green-600">
                                <span>Diskon ({appliedPromo.code})</span>
                                <span>- Rp {discount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="border-t pt-3 flex justify-between font-bold text-lg">
                            <span>Total Bayar</span>
                            <span>Rp {finalTotal.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={handleCheckout} 
                        className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/90 rounded-full shadow-lg"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Bayar Sekarang'}
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
