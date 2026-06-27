import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useCartStore from '../stores/cartStore';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Trash2, MapPin, Plus, CheckCircle2, ArrowRight, Home, Pencil } from 'lucide-react';
import Navbar from '../components/Navbar';
import AddressModal from '../components/AddressModal';
import SelectAddressModal from '../components/SelectAddressModal';
import { getFallbackFoodImage, handleImageError } from '../lib/imageFallback';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, updateItemNote, getTotalPrice, clearCart } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [shippingType, setShippingType] = useState('delivery'); // 'delivery' or 'takeaway'

  // Address & Shipping State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null); // { provider, service, cost }
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSelectAddressModalOpen, setIsSelectAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  const subtotal = getTotalPrice();
  const discount = appliedPromo ? appliedPromo.discount_amount : 0;
  const shippingCost = shippingType === 'delivery' && selectedShipping ? selectedShipping.cost : 0;
  const finalTotal = (subtotal - discount) + shippingCost;

  // Load Midtrans Script & Fetch Addresses
  useEffect(() => {
    // ... (midtrans script load)
    const script = document.createElement('script');
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-dummy-key');
    document.body.appendChild(script);
    
    fetchAddresses();
    fetchStoreStatus();

    return () => {
        if(document.body.contains(script)) {
             document.body.removeChild(script);
        }
    }
  }, []);

  const fetchStoreStatus = async () => {
      try {
          const res = await api.get('/settings/store-status');
          setIsStoreOpen(res.data.data.isOpen);
      } catch (err) {
          console.error("Failed to fetch store status:", err);
      }
  };

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

  const handleDeleteAddress = async (addressId) => {
      if (window.confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
          try {
              await api.delete(`/addresses/${addressId}`);
              setAddresses(prev => prev.filter(addr => addr.id !== addressId));
              if (selectedAddressId === addressId) {
                  setSelectedAddressId(null);
                  setSelectedShipping(null);
                  setShippingOptions([]);
              }
          } catch (error) {
              console.error("Failed to delete address", error);
              alert("Gagal menghapus alamat.");
          }
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
          setPromoSuccess('Voucher promo berhasil digunakan!');
      } catch (error) {
          setPromoError(error.response?.data?.message || 'Kode promo tidak valid');
          setAppliedPromo(null);
      } finally {
          setLoading(false);
      }
  };

  const handleCheckout = async () => {
      if (shippingType === 'delivery') {
          if (!selectedAddressId) {
              alert("Silakan pilih alamat pengiriman terlebih dahulu.");
              return;
          }
          if (!selectedShipping) {
              alert("Silakan pilih layanan pengiriman.");
              return;
          }
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
              shippingType,
              shippingAddressId: shippingType === 'delivery' ? selectedAddressId : null,
              shippingOption: shippingType === 'delivery' ? {
                  provider: selectedShipping.provider,
                  service: selectedShipping.service,
                  cost: selectedShipping.cost
              } : null
          };

          const res = await api.post('/transactions', payload);
          const { transactionId, snapToken } = res.data.data;

          if (window.snap) {
              window.snap.pay(snapToken, {
                  onSuccess: async function(result){
                      try {
                          await api.post(`/transactions/${transactionId}/sync`);
                      } catch (err) {
                          console.error("Failed to sync transaction status:", err);
                      }
                      navigate(`/payment-success?order_id=${result.order_id || ''}&transaction_status=${result.transaction_status || ''}`);
                  },
                  onPending: async function(result){
                      try {
                          await api.post(`/transactions/${transactionId}/sync`);
                      } catch (err) {
                          console.error("Failed to sync transaction status:", err);
                      }
                      navigate(`/payment-success?order_id=${result.order_id || ''}&transaction_status=${result.transaction_status || ''}`);
                  },
                  onError: function(result){
                      alert("Pembayaran gagal!");
                  },
                  onClose: async function(){
                      setLoading(true);
                      try {
                          await api.post(`/transactions/${transactionId}/cancel-pending`);
                      } catch (err) {
                          console.error("Failed to cancel pending transaction on close:", err);
                      } finally {
                          setLoading(false);
                      }
                  }
              });
          } else {
              alert("Sistem pembayaran (payment gateway) gagal dimuat.");
          }
      } catch (error) {
          console.error("Checkout failed", error);
          alert("Checkout gagal: " + (error.response?.data?.message || error.message));
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
      
      <div className="max-w-5xl px-4 pt-36 mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/', { state: { openCart: true } })}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary hover:bg-gray-100 transition-all px-4 py-2 rounded-full -ml-4 cursor-pointer font-bold text-sm border-none bg-transparent"
            title="Kembali ke Keranjang"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
            <span>Kembali ke Keranjang</span>
          </button>
        </div>
        
        <h1 className="mb-8 text-3xl font-heading text-primary">Checkout</h1>

        <div className="grid gap-8 md:grid-cols-5">
            {/* Left Column */}
            <div className="space-y-6 md:col-span-3">
                
                {/* Pilihan Tipe Layanan */}
                <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        Pilih Opsi Layanan
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setShippingType('takeaway')}
                            className={`p-4 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                                shippingType === 'takeaway' 
                                    ? 'border-accent bg-accent/5 text-accent shadow-md ring-1 ring-accent' 
                                    : 'border-gray-200 hover:border-accent/50 text-gray-600'
                            }`}
                        >
                            Ambil Sendiri
                            <span className="block text-xs font-normal text-gray-500 mt-1">Ambil langsung di Warung</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShippingType('delivery')}
                            className={`p-4 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                                shippingType === 'delivery' 
                                    ? 'border-accent bg-accent/5 text-accent shadow-md ring-1 ring-accent' 
                                    : 'border-gray-200 hover:border-accent/50 text-gray-600'
                            }`}
                        >
                            Diantar (Delivery)
                            <span className="block text-xs font-normal text-gray-500 mt-1">Kirim via Kurir Ekspedisi</span>
                        </button>
                    </div>
                    {shippingType === 'takeaway' && (
                        <div className="mt-4 p-3 bg-secondary/30 rounded-xl text-xs text-gray-600 border border-border">
                            <p className="font-bold text-foreground mb-1">📍 Lokasi Warung D'raosan:</p>
                            <p>Jl. Goalpara No. 45, Sukabumi, Sukaraja, Jawa Barat</p>
                        </div>
                    )}
                </div>

                {shippingType === 'delivery' && (
                    <>
                        {/* Shipping Address */}
                        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="flex items-center gap-2 text-xl font-bold">
                                    <MapPin className="text-accent" /> Alamat Pengiriman
                                </h2>
                                <div className="flex items-center gap-2">
                                    {addresses.length > 0 && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setIsSelectAddressModalOpen(true)}
                                            className="border-accent text-accent hover:bg-accent hover:text-white"
                                        >
                                            Ganti Alamat
                                        </Button>
                                    )}
                                    {addresses.length < 5 && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => {
                                                setAddressToEdit(null);
                                                setIsAddressModalOpen(true);
                                            }}
                                            className="flex items-center gap-1 border-accent text-accent hover:bg-accent hover:text-white active:bg-accent/90 active:text-white focus:text-white transition-colors"
                                        >
                                            <Plus className="w-4 h-4" /> Tambah
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {addresses.length >= 5 && (
                                <p className="text-xs text-amber-600 font-bold mb-3 animate-pulse">
                                    ⚠️ Batas maksimum 5 alamat tersimpan telah tercapai.
                                </p>
                            )}

                            {addresses.length === 0 ? (
                                <div className="py-6 text-center text-gray-500 rounded-lg bg-gray-50">
                                    Belum ada alamat tersimpan. Silakan tambah alamat baru.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {(() => {
                                        const activeAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];
                                        if (!activeAddress) return null;
                                        return (
                                            <div 
                                                className="p-4 rounded-xl border border-accent/25 bg-accent/[0.02]"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-bold">{activeAddress.recipient_name} <span className="font-normal text-gray-500">({activeAddress.phone_number})</span></p>
                                                        <p className="mt-1 text-sm text-gray-600 leading-relaxed">{activeAddress.address_line}, {activeAddress.city}, {activeAddress.postal_code}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        {activeAddress.is_primary && <span className="px-2 py-0.5 text-[10px] text-blue-700 bg-blue-100 rounded-full font-bold mr-1">Utama</span>}
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setAddressToEdit(activeAddress);
                                                                setIsAddressModalOpen(true);
                                                            }}
                                                            className="p-1.5 text-gray-500 hover:text-accent hover:bg-accent/5 rounded-lg transition-colors border-none cursor-pointer bg-transparent"
                                                            title="Edit Alamat"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
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
                    </>
                )}
            </div>

            {/* Right Column: Summary */}
            <div className="space-y-6 md:col-span-2">
                <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                    <h2 className="mb-4 text-xl font-bold">Ringkasan Pesanan</h2>

                    {/* Daftar Barang (Managed inside Summary) */}
                    <div className="mb-6 border-t border-b border-gray-100 py-4">
                        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center justify-between">
                            <span>Daftar Barang</span>
                            <span className="text-xs text-muted-foreground font-normal">{items.length} Menu</span>
                        </h3>
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-50 last:pb-0 last:border-0 text-xs">
                                    <div className="flex-shrink-0 w-16 h-16 overflow-hidden bg-gray-100 rounded-lg">
                                        <img 
                                            src={item.image_url || getFallbackFoodImage(item.name)} 
                                            alt={item.name} 
                                            className="object-cover w-full h-full" 
                                            onError={(e) => handleImageError(e, item.name)}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-1">
                                            <h4 className="font-bold text-gray-800 truncate" title={item.name}>{item.name}</h4>
                                            <p className="font-black text-gray-900 flex-shrink-0">Rp {(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                        <p className="text-[10px] text-gray-500">Harga: Rp {item.price.toLocaleString()}</p>
                                        
                                        <Input 
                                            placeholder="Catatan (opsional)" 
                                            value={item.note || ''}
                                            onChange={(e) => updateItemNote(item.id, e.target.value)}
                                            className="mt-1.5 h-7 text-[11px] py-1 px-2 bg-gray-50 border-gray-200 focus-visible:bg-white"
                                        />

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center border rounded-full bg-white h-7">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="px-2 py-0.5 rounded-l-full hover:bg-gray-100 text-xs font-bold"
                                                >
                                                    -
                                                </button>
                                                <span className="px-2 font-bold text-xs">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="px-2 py-0.5 rounded-r-full hover:bg-gray-100 text-xs font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-400 hover:text-red-600 transition-colors p-1"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Promo Code */}
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium">Kode Promo</label>
                        <div className="flex gap-2 mb-2">
                            <Input 
                                placeholder="Masukan kode promo" 
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                            />
                            <Button 
                                onClick={handleApplyPromo} 
                                disabled={loading || !promoCode}
                                className="bg-primary hover:bg-primary/95 text-white hover:text-white active:bg-primary/90 active:text-white focus:text-white transition-colors"
                            >
                                Gunakan
                            </Button>
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
                        className={`w-full h-12 text-lg font-bold rounded-full shadow-lg ${!isStoreOpen ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : 'bg-accent hover:bg-accent/95 hover:text-white active:bg-accent/90 active:text-white focus:text-white'} text-white transition-colors`}
                        disabled={loading || shippingLoading || !isStoreOpen}
                    >
                        {!isStoreOpen ? 'Toko Sedang Tutup' : (loading ? 'Memproses...' : 'Bayar Sekarang')}
                    </Button>
                </div>
            </div>
        </div>
      </div>

      <AddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => {
            setIsAddressModalOpen(false);
            setAddressToEdit(null);
        }} 
        addressToEdit={addressToEdit}
        onAddressAdded={(newAddress) => {
            fetchAddresses();
        }}
      />

      <SelectAddressModal
        isOpen={isSelectAddressModalOpen}
        onClose={() => setIsSelectAddressModalOpen(false)}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={handleSelectAddress}
        onAddAddressClick={() => {
            setIsSelectAddressModalOpen(false);
            setAddressToEdit(null);
            setIsAddressModalOpen(true);
        }}
        onEditAddressClick={(addr) => {
            setAddressToEdit(addr);
            setIsAddressModalOpen(true);
        }}
        onDeleteAddressClick={handleDeleteAddress}
      />


    </div>
  );
}
