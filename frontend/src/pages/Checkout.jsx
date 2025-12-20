import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useCartStore from '../stores/cartStore';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Trash2, MapPin, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import AddressModal from '../components/AddressModal';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, updateItemNote, getTotalPrice, clearCart } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Address & Shipping State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null); // { provider, service, cost }
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);

  const subtotal = getTotalPrice();
  const discount = appliedPromo ? appliedPromo.discount_amount : 0;
  const shippingCost = selectedShipping ? selectedShipping.cost : 0;
  const finalTotal = (subtotal - discount) + shippingCost;

  // Load Midtrans Script & Fetch Addresses
  useEffect(() => {
    // ... (midtrans script load)
    const script = document.createElement('script');
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-dummy-key');
    document.body.appendChild(script);
    
    fetchAddresses();

    return () => {
        if(document.body.contains(script)) {
             document.body.removeChild(script);
        }
    }
  }, []);

  // Recalculate shipping if items change (weight changes)
  useEffect(() => {
      if (selectedAddressId) {
          handleSelectAddress(selectedAddressId);
      }
  }, [items.length, items.reduce((a, b) => a + b.quantity, 0)]);

  const fetchAddresses = async () => {
      try {
          const res = await api.get('/addresses');
          setAddresses(res.data.data);
          const primary = res.data.data.find(a => a.is_primary);
          if (primary) {
              handleSelectAddress(primary.id);
          } else if (res.data.data.length > 0) {
              handleSelectAddress(res.data.data[0].id);
          }
      } catch (error) {
          console.error("Failed to fetch addresses", error);
      }
  };

  const handleSelectAddress = async (addressId) => {
      setSelectedAddressId(addressId);
      setShippingLoading(true);
      setShippingOptions([]);
      setSelectedShipping(null);
      
      try {
          const payload = {
              addressId,
              items: items.map(i => ({ productId: i.id, quantity: i.quantity }))
          };
          const res = await api.post('/shipping/cost', payload);
          setShippingOptions(res.data.data.options);
      } catch (error) {
          console.error("Failed to calculate shipping", error);
      } finally {
          setShippingLoading(false);
      }
  };

  const handleApplyPromo = async () => {
      // ... (same as before)
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
      if (!selectedAddressId) {
          alert("Silakan pilih alamat pengiriman terlebih dahulu.");
          return;
      }
      if (!selectedShipping) {
          alert("Silakan pilih layanan pengiriman.");
          return;
      }

      setLoading(true);
      try {
          const payload = {
              items: items.map(item => ({
                  productId: item.id,
                  quantity: item.quantity,
                  note: item.note || ''
              })),
              promoCode: appliedPromo ? appliedPromo.code : null,
              shippingAddressId: selectedAddressId,
              shippingOption: {
                  provider: selectedShipping.provider,
                  service: selectedShipping.service,
                  cost: selectedShipping.cost
              }
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
          <div className="min-h-screen font-sans bg-gray-50">
              <Navbar />
              <div className="flex flex-col items-center justify-center pt-20">
                  <h2 className="mb-4 text-2xl font-bold">Keranjang Kosong</h2>
                  <Link to="/">
                      <Button>Belanja Sekarang</Button>
                  </Link>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen pb-20 font-sans bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl px-4 pt-8 mx-auto">
        <Link to="/" className="inline-flex items-center mb-6 text-gray-500 hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Belanja
        </Link>
        
        <h1 className="mb-8 text-3xl font-heading text-primary">Checkout</h1>

        <div className="grid gap-8 md:grid-cols-3">
            {/* Left Column */}
            <div className="space-y-6 md:col-span-2">
                
                {/* Shipping Address */}
                <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="flex items-center gap-2 text-xl font-bold">
                            <MapPin className="text-accent" /> Alamat Pengiriman
                        </h2>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsAddressModalOpen(true)}
                            className="flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Tambah
                        </Button>
                    </div>

                    {addresses.length === 0 ? (
                        <div className="py-6 text-center text-gray-500 rounded-lg bg-gray-50">
                            Belum ada alamat tersimpan. Silakan tambah alamat baru.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {addresses.map((addr) => (
                                <div 
                                    key={addr.id} 
                                    onClick={() => handleSelectAddress(addr.id)}
                                    className={`
                                        p-4 rounded-xl border cursor-pointer transition-all
                                        ${selectedAddressId === addr.id 
                                            ? 'border-accent bg-accent/5 shadow-md' 
                                            : 'border-gray-200 hover:border-accent/50'}
                                    `}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-bold">{addr.recipient_name} <span className="font-normal text-gray-500">({addr.phone_number})</span></p>
                                            <p className="mt-1 text-sm text-gray-600">{addr.address_line}, {addr.city}, {addr.postal_code}</p>
                                        </div>
                                        {addr.is_primary && <span className="px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded-full">Utama</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Shipping Method */}
                <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                    <h2 className="mb-4 text-xl font-bold">Metode Pengiriman</h2>
                    
                    {shippingLoading && <p className="text-gray-500">Menghitung ongkos kirim...</p>}
                    
                    {!shippingLoading && shippingOptions.length === 0 && selectedAddressId && (
                        <p className="text-red-500">Tidak ada pengiriman tersedia untuk lokasi ini.</p>
                    )}

                    {!shippingLoading && shippingOptions.length > 0 && (
                        <div className="space-y-3">
                            {shippingOptions.map((opt, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => setSelectedShipping(opt)}
                                    className={`
                                        flex justify-between items-center p-4 rounded-xl border cursor-pointer transition-all
                                        ${selectedShipping?.provider === opt.provider && selectedShipping?.service === opt.service
                                            ? 'border-accent bg-accent/5 shadow-md ring-1 ring-accent' 
                                            : 'border-gray-200 hover:border-accent/50'}
                                    `}
                                >
                                    <div>
                                        <p className="font-bold">{opt.provider} - {opt.service}</p>
                                        <p className="text-xs text-gray-500">Estimasi: {opt.estimated}</p>
                                    </div>
                                    <span className="font-bold text-accent">Rp {opt.cost.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Items List */}
                <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                    <h2 className="mb-4 text-xl font-bold">Daftar Barang</h2>
                    <div className="space-y-6">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-4 pb-6 border-b border-gray-100 last:pb-0 last:border-0">
                                <div className="flex-shrink-0 w-24 h-24 overflow-hidden bg-gray-100 rounded-lg">
                                    <img src={item.image_url || 'https://placehold.co/150'} alt={item.name} className="object-cover w-full h-full" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-2">
                                        <h3 className="text-lg font-bold">{item.name}</h3>
                                        <p className="font-bold">Rp {(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                    <p className="mb-2 text-sm text-gray-500">Harga satuan: Rp {item.price.toLocaleString()}</p>
                                    
                                    <Input 
                                        placeholder="Catatan (opsional)" 
                                        value={item.note || ''}
                                        onChange={(e) => updateItemNote(item.id, e.target.value)}
                                        className="mb-4 text-sm"
                                    />

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border rounded-full">
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="px-3 py-1 rounded-l-full hover:bg-gray-100"
                                            >
                                                -
                                            </button>
                                            <span className="px-3 font-bold">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="px-3 py-1 rounded-r-full hover:bg-gray-100"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => removeItem(item.id)}
                                            className="ml-auto text-red-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Summary */}
            <div className="space-y-6">
                <div className="sticky p-6 bg-white border border-gray-100 shadow-sm rounded-2xl top-24">
                    <h2 className="mb-4 text-xl font-bold">Ringkasan Pesanan</h2>
                    
                    {/* Promo Code */}
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium">Kode Promo</label>
                        <div className="flex gap-2 mb-2">
                            <Input 
                                placeholder="Masukan kode promo" 
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                            />
                            <Button onClick={handleApplyPromo} disabled={loading || !promoCode}>Apply</Button>
                        </div>
                        {promoError && <p className="text-sm text-red-500">{promoError}</p>}
                        {promoSuccess && <p className="text-sm text-green-500">{promoSuccess}</p>}
                    </div>

                    <div className="pt-4 mb-6 space-y-3 border-t">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>Rp {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Ongkos Kirim</span>
                            <span>
                                {shippingLoading ? 'Menghitung...' : (shippingCost > 0 ? `Rp ${shippingCost.toLocaleString()}` : '-')}
                            </span>
                        </div>
                        {appliedPromo && (
                            <div className="flex justify-between text-green-600">
                                <span>Diskon ({appliedPromo.code})</span>
                                <span>- Rp {discount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-3 text-lg font-bold border-t">
                            <span>Total Bayar</span>
                            <span>Rp {finalTotal.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={handleCheckout} 
                        className="w-full h-12 text-lg font-bold rounded-full shadow-lg bg-accent hover:bg-accent/90"
                        disabled={loading || shippingLoading}
                    >
                        {loading ? 'Processing...' : 'Bayar Sekarang'}
                    </Button>
                </div>
            </div>
        </div>
      </div>

      <AddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onAddressAdded={(newAddress) => {
            console.log("New Address:", newAddress);
            if (newAddress && newAddress.id) {
                setAddresses(prev => [...prev, newAddress]);
                handleSelectAddress(newAddress.id);
            } else {
                console.warn("New address missing ID, refreshing list...");
                fetchAddresses();
            }
        }}
      />
    </div>
  );
}
