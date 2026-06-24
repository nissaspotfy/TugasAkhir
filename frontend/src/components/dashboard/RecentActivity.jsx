import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import api from '../../lib/api';
import { useToast } from '../ui/ToastProvider';
import { Star, X, ChevronLeft, ChevronRight, Eye, Receipt, CalendarDays, MapPin, Package, Truck, RefreshCw, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import useCartStore from '../../stores/cartStore';
import { Modal } from '../admin/Modal';

export function TableRow({ id, menu, total, status, date, onReview, hasReview, onReorder, onDetail, onCancel }) {
   const getStatusInfo = (stat) => {
      switch (stat) {
         case 'success':
            return { label: 'Selesai', class: 'bg-green-50 text-green-700 border-green-200' };
         case 'paid':
            return { label: 'Lunas', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
         case 'processing':
            return { label: 'Diproses', class: 'bg-blue-50 text-blue-700 border-blue-200' };
         case 'pending':
            return { label: 'Menunggu', class: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
         case 'cancelled':
            return { label: 'Dibatalkan', class: 'bg-red-50 text-red-700 border-red-200' };
         default:
            return { label: 'Gagal', class: 'bg-red-50 text-red-700 border-red-200' };
      }
   };

   const statusInfo = getStatusInfo(status);

   return (
      <tr className="hover:bg-secondary/10 transition-colors">
         <td className="p-4 font-bold text-primary font-mono">{id}</td>
         <td className="p-4 text-foreground font-medium">{menu}</td>
         <td className="p-4 font-extrabold text-foreground">{total}</td>
         <td className="p-4">
            <span className={`px-2.5 py-1 rounded-[6px] text-xs font-bold border ${statusInfo.class}`}>
               {statusInfo.label}
            </span>
         </td>
         <td className="p-4 text-muted-foreground text-sm">{date}</td>
         <td className="p-4">
            <div className="flex items-center justify-end gap-2">
               {/* Detail */}
               <button
                  onClick={onDetail}
                  className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer border-none"
                  title="Detail Pesanan"
               >
                  <Eye size={16} />
               </button>

               {/* Ulasan */}
               {status === 'success' && (
                  hasReview ? (
                     <button
                        className="p-2 bg-gray-50 text-gray-400 rounded-lg cursor-default border-none"
                        title="Sudah Diulas"
                        disabled
                     >
                        <CheckCircle size={16} />
                     </button>
                  ) : (
                     <button
                        onClick={() => onReview(id, menu)}
                        className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors cursor-pointer border-none"
                        title="Beri Ulasan"
                     >
                        <Star size={16} />
                     </button>
                  )
               )}

               {/* Batalkan Pesanan */}
               {status === 'paid' && (
                  <button
                     onClick={onCancel}
                     className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer border-none"
                     title="Batalkan Pesanan"
                  >
                     <X size={16} />
                  </button>
               )}

               {/* Pesan Lagi */}
               {(status === 'paid' || status === 'processing' || status === 'success') && (
                  <button
                     onClick={onReorder}
                     className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors cursor-pointer border-none"
                     title="Pesan Lagi"
                  >
                     <RefreshCw size={16} />
                  </button>
               )}
            </div>
         </td>
      </tr>
   )
}

function ReviewModal({ isOpen, onClose, onSubmit, orderId, menuName }) {
   const [rating, setRating] = useState(0);
   const [reviewText, setReviewText] = useState("");

   if (!isOpen) return null;

   const handleSubmit = () => {
      onSubmit(orderId, rating, reviewText);
      setRating(0);
      setReviewText("");
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
         <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
               <X size={20} />
            </button>
            <h3 className="text-xl font-heading text-foreground mb-2">Ulas Pesanan {orderId}</h3>
            <p className="text-sm text-muted-foreground mb-4">{menuName}</p>

            <div className="flex justify-center gap-2 mb-6">
               {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                     key={star}
                     size={32}
                     className={`cursor-pointer transition-colors ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                     onClick={() => setRating(star)}
                  />
               ))}
            </div>

            <textarea
               value={reviewText}
               onChange={(e) => setReviewText(e.target.value)}
               placeholder="Tulis pendapatmu tentang pesanan ini..."
               className="w-full border border-border rounded-lg p-3 text-sm min-h-[100px] mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            <Button
               onClick={handleSubmit}
               disabled={rating === 0}
               className="w-full bg-primary font-bold rounded-full py-6 hover:bg-primary/90"
            >
               Kirim Ulasan
            </Button>
         </div>
      </div>
   );
}

function TransactionDetailModal({ isOpen, onClose, transaction, onCancel }) {
   if (!isOpen || !transaction) return null;

   const t = transaction;

   const getStatusStyle = (status) => {
      if (status === 'success') return 'bg-green-100 text-green-700';
      if (status === 'paid') return 'bg-emerald-100 text-emerald-700';
      if (status === 'processing') return 'bg-blue-100 text-blue-700';
      if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
      if (status === 'cancelled') return 'bg-red-100 text-red-700';
      return 'bg-red-100 text-red-700';
   };

   const getStatusLabel = (status) => {
      if (status === 'success') return 'SELESAI';
      if (status === 'paid') return 'LUNAS';
      if (status === 'processing') return 'DIPROSES';
      if (status === 'pending') return 'MENUNGGU';
      if (status === 'cancelled') return 'DIBATALKAN';
      return 'GAGAL';
   };

   const isDelivery = t.shipping_provider && t.shipping_provider !== 'Ambil Sendiri';
   const address = t.shippingAddress;

   // Cost breakdown
   const subtotal = t.items?.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0) || 0;
   const shippingCost = t.shipping_cost || 0;
   const promoDiscount = t.promo ? (t.promo.discount_amount || Math.round(subtotal * (t.promo.discount_percent || 0) / 100)) : 0;

   return (
      <Modal isOpen={isOpen} onClose={onClose} title={<span className="flex items-center gap-2"><Receipt size={20} /> Detail Pesanan</span>} size="xl">
         <div className="space-y-6">
            {/* Header Nota */}
            <div className="bg-secondary/20 p-4 rounded-xl flex items-center justify-between border border-border/50">
               <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">ID Transaksi</p>
                  <p className="font-heading font-black text-2xl text-foreground">#ORD-{t.id}</p>
               </div>
               <div className="text-right">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase ${getStatusStyle(t.status)}`}>
                     {getStatusLabel(t.status)}
                  </span>
               </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/10 transition-colors border border-transparent hover:border-border/50">
                  <div className="mt-0.5 text-muted-foreground"><CalendarDays size={18} /></div>
                  <div>
                     <p className="text-xs font-bold text-muted-foreground">Tanggal Pesanan</p>
                     <p className="text-sm font-bold text-slate-800">{new Date(t.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                     <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleTimeString('id-ID')}</p>
                  </div>
               </div>
               <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/10 transition-colors border border-transparent hover:border-border/50">
                  <div className="mt-0.5 text-muted-foreground">{isDelivery ? <Truck size={18} /> : <Package size={18} />}</div>
                  <div>
                     <p className="text-xs font-bold text-muted-foreground">Tipe Layanan</p>
                     <p className="text-sm font-bold text-slate-800">
                        {isDelivery ? `Diantar (${t.shipping_provider})` : 'Ambil Sendiri'}
                     </p>
                     <p className="text-xs text-muted-foreground">
                        {isDelivery ? (t.shipping_service || 'Kurir') : 'Dine-in / Takeaway'}
                     </p>
                  </div>
               </div>
            </div>

            {/* Alamat Pengiriman */}
            {isDelivery && address && (
               <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                     <MapPin size={16} className="text-blue-600" />
                     <p className="text-sm font-bold text-blue-800">Alamat Pengiriman</p>
                  </div>
                  <div className="pl-6 space-y-1">
                     <p className="text-sm font-semibold text-slate-800">{address.recipient_name}</p>
                     <p className="text-xs text-muted-foreground">{address.phone_number}</p>
                     <p className="text-sm text-slate-700">{address.address_line}</p>
                     <p className="text-xs text-muted-foreground">{address.city}{address.postal_code ? `, ${address.postal_code}` : ''}</p>
                  </div>
               </div>
            )}

            {/* List Rincian Item Menu */}
            <div>
               <p className="text-sm font-bold text-foreground mb-3 border-b border-border/50 pb-2">Rincian Belanjaan</p>
               <div className="space-y-3">
                  {t.items?.map((item, idx) => (
                     <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-secondary/30 flex items-center justify-center font-bold text-muted-foreground">
                              {item.quantity}x
                           </div>
                           <div>
                              <p className="font-bold text-foreground">{item.product?.name || 'Produk Tidak Dikenal'}</p>
                              <p className="text-xs text-muted-foreground">@ Rp {item.product?.price?.toLocaleString() || 0}</p>
                           </div>
                        </div>
                        <p className="font-bold text-foreground">Rp {((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Rincian Biaya */}
            <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
               <p className="text-sm font-bold text-foreground mb-2">Rincian Biaya</p>
               <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal Menu</span>
                  <span className="font-medium">Rp {subtotal.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ongkos Kirim</span>
                  <span className="font-medium">{shippingCost > 0 ? `Rp ${shippingCost.toLocaleString()}` : 'Gratis'}</span>
               </div>
               {t.promo && (
                  <div className="flex justify-between text-sm text-green-600">
                     <span>Diskon Promo ({t.promo.code})</span>
                     <span className="font-medium">- Rp {promoDiscount.toLocaleString()}</span>
                  </div>
               )}
               <div className="border-t border-dashed border-gray-300 pt-2 mt-2 flex justify-between text-sm font-bold">
                  <span>Total</span>
                  <span className="text-primary text-lg">Rp {t.total_amount?.toLocaleString() || 0}</span>
               </div>
            </div>

            {/* Live Tracking UI */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
               <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Pelacakan Status Real-time</p>
               <div className="flex items-center justify-between relative mt-4">
                  <div className="flex flex-col items-center flex-1 z-10">
                     <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mb-2">✓</div>
                     <p className="text-[10px] font-bold text-center">Diterima</p>
                  </div>
                  <div className={`absolute top-4 left-[15%] right-[50%] h-1 ${t.status === 'paid' || t.status === 'processing' || t.status === 'success' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div className="flex flex-col items-center flex-1 z-10">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${(t.status === 'paid' || t.status === 'processing' || t.status === 'success') ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {t.status === 'paid' || t.status === 'processing' || t.status === 'success' ? '✓' : '•'}
                     </div>
                     <p className="text-[10px] font-bold text-center">Diproses / Lunas</p>
                  </div>
                  <div className={`absolute top-4 left-[50%] right-[15%] h-1 ${t.status === 'success' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div className="flex flex-col items-center flex-1 z-10">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${t.status === 'success' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {t.status === 'success' ? '✓' : '◯'}
                     </div>
                     <p className="text-[10px] font-bold text-center">Selesai</p>
                  </div>
               </div>
            </div>

            {/* Total Pembayaran Bawah */}
            <div className="pt-4 border-t-2 border-dashed border-border flex justify-between items-center bg-background rounded-b-xl">
               <p className="font-bold text-muted-foreground uppercase text-xs tracking-widest">Total Keseluruhan</p>
               <p className="text-3xl font-black text-primary font-heading">
                  <span className="text-lg opacity-50 mr-1">Rp</span>
                  {t.total_amount?.toLocaleString() || 0}
               </p>
            </div>

            {/* Cancel Button inside Modal */}
            {t.status === 'paid' && (
               <div className="pt-4 border-t border-border flex justify-end">
                  <Button
                     onClick={() => onCancel(t.id)}
                     className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer border-none"
                  >
                     <X size={16} />
                     Batalkan Pesanan
                  </Button>
               </div>
            )}
         </div>
      </Modal>
   );
}

export function RecentActivity() {
   const [transactions, setTransactions] = useState([]);
   const [loading, setLoading] = useState(true);
   const { addToast } = useToast();
   const [reviewModalOpen, setReviewModalOpen] = useState(false);
   const [selectedOrder, setSelectedOrder] = useState(null);
   const navigate = useNavigate();
   const { clearCart, addItem, updateQuantity } = useCartStore();

   // Detail Modal State
   const [detailModalOpen, setDetailModalOpen] = useState(false);
   const [detailOrder, setDetailOrder] = useState(null);

   // Pagination State
   const [currentPage, setCurrentPage] = useState(1);
   const ITEMS_PER_PAGE = 5;

   const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
   const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
   const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
   const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);

   const handlePageChange = (pageNumber) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
         setCurrentPage(pageNumber);
      }
   };

   useEffect(() => {
      const fetchTransactions = async () => {
         try {
            const res = await api.get('/transactions/my-transactions');
            setTransactions(res.data.data);
         } catch (error) {
            console.error("Failed to fetch transactions", error);
         } finally {
            setLoading(false);
         }
      };
      fetchTransactions();
   }, []);

   const handleOpenReview = (id, menu) => {
      setSelectedOrder({ id, menu });
      setReviewModalOpen(true);
   };

   const handleOpenDetail = (transaction) => {
      setDetailOrder(transaction);
      setDetailModalOpen(true);
   };

   const handleReorder = async (transaction) => {
      try {
         // Get current cart items to accumulate quantities if item already exists
         const currentItems = useCartStore.getState().items;
         let currentCartMap = {};
         currentItems.forEach(ci => {
            currentCartMap[ci.id] = ci.quantity;
         });

         for (const item of transaction.items) {
            if (!item.product) continue;

            const pId = item.product.id;
            if (currentCartMap[pId] !== undefined) {
               // Item already in cart, accumulate quantity
               const newQty = currentCartMap[pId] + item.quantity;
               currentCartMap[pId] = newQty;
               await updateQuantity(pId, newQty);
            } else {
               // Item not in cart, add first then set total quantity
               currentCartMap[pId] = item.quantity;
               await addItem({
                  id: pId,
                  name: item.product.name,
                  price: item.product.price,
                  image_url: item.product.image_url
               });

               if (item.quantity > 1) {
                  await updateQuantity(pId, item.quantity);
               }
            }
         }
         addToast(
            <span>
               Menu berhasil ditambahkan!{" "}
               <a href="/checkout" className="underline font-bold text-primary hover:text-primary/80 transition-colors">
                  Lihat Keranjang
               </a>
            </span>,
            "success"
         );
      } catch (error) {
         console.error("Reorder failed:", error);
         addToast("Gagal mengulang pesanan. Silakan coba lagi.", "error");
      }
   };

   const handleSubmitReview = async (orderId, rating, text) => {
      try {
         await api.post('/reviews', {
            transactionId: orderId,
            rating,
            comment: text
         });
         addToast(`Terima kasih! Ulasan untuk ${orderId} berhasil dikirim.`, 'success');
         setReviewModalOpen(false);
         setSelectedOrder(null);

         // Re-fetch transactions to reflect the update
         const res = await api.get('/transactions/my-transactions');
         setTransactions(res.data.data);
      } catch (error) {
         console.error("Failed to submit review", error);
         addToast(error.response?.data?.message || "Gagal mengirimkan ulasan. Silakan coba lagi.", "error");
      }
   };

   const handleCancelOrder = async (transactionId) => {
      const confirmCancel = window.confirm(
         "Apakah Anda yakin ingin membatalkan pesanan ini? Dana pembayaran Anda akan dikembalikan sepenuhnya."
      );
      if (!confirmCancel) return;

      try {
         await api.post(`/transactions/${transactionId}/cancel-customer`);
         addToast("Pesanan Anda berhasil dibatalkan. Dana telah dikembalikan ke saldo/rekening Anda.", "success");
         
         // Re-fetch transactions to reflect the update
         const res = await api.get('/transactions/my-transactions');
         setTransactions(res.data.data);
      } catch (error) {
         console.error("Failed to cancel order:", error);
         addToast(error.response?.data?.message || "Gagal membatalkan pesanan. Silakan coba lagi.", "error");
      }
   };

   if (loading) return <div className="text-center py-8 text-muted-foreground">Memuat riwayat transaksi...</div>;

   return (
      <div>
         <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/30 text-muted-foreground border-b border-border/50">
                     <tr>
                        <th className="p-4 font-bold whitespace-nowrap">ID Pesanan</th>
                        <th className="p-4 font-bold whitespace-nowrap">Menu</th>
                        <th className="p-4 font-bold whitespace-nowrap">Total</th>
                        <th className="p-4 font-bold whitespace-nowrap">Status</th>
                        <th className="p-4 font-bold whitespace-nowrap">Tanggal</th>
                        <th className="p-4 font-bold whitespace-nowrap">Aksi</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                     {transactions.length === 0 ? (
                        <tr>
                           <td colSpan="6" className="p-4 text-center text-muted-foreground">Belum ada transaksi</td>
                        </tr>
                     ) : (
                        currentTransactions.map((t) => {
                           const menu = t.items.map(i => `${i.product.name} x${i.quantity}`).join(', ');
                           const date = new Date(t.createdAt).toLocaleDateString('id-ID');
                           return (
                              <TableRow
                                 key={t.id}
                                 id={`#ORD-${t.id}`}
                                 menu={menu}
                                 total={`Rp ${t.total_amount.toLocaleString()}`}
                                 status={t.status}
                                 date={date}
                                 onReview={handleOpenReview}
                                 hasReview={!!t.review}
                                 onReorder={() => handleReorder(t)}
                                 onDetail={() => handleOpenDetail(t)}
                                 onCancel={() => handleCancelOrder(t.id)}
                              />
                           );
                        })
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Pagination Controls */}
         {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white p-4 rounded-xl border border-border/50">
               <p className="text-xs text-muted-foreground font-medium">
                  Menampilkan <span className="font-bold text-slate-800">{indexOfFirstItem + 1}</span> hingga <span className="font-bold text-slate-800">{Math.min(indexOfLastItem, transactions.length)}</span> dari <span className="font-bold text-slate-800">{transactions.length}</span> transaksi
               </p>
               <div className="flex items-center gap-1.5">
                  <Button
                     variant="outline"
                     size="sm"
                     className="h-8 w-8 p-0 rounded-lg hover:text-white"
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                  >
                     <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                     <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className={`h-8 w-8 p-0 rounded-lg font-bold text-xs ${currentPage === pageNum
                              ? "bg-accent hover:bg-accent/90 text-white"
                              : "hover:text-white"
                           }`}
                        onClick={() => handlePageChange(pageNum)}
                     >
                        {pageNum}
                     </Button>
                  ))}

                  <Button
                     variant="outline"
                     size="sm"
                     className="h-8 w-8 p-0 rounded-lg hover:text-white"
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage === totalPages}
                  >
                     <ChevronRight className="h-4 w-4" />
                  </Button>
               </div>
            </div>
         )}

         <ReviewModal
            isOpen={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            orderId={selectedOrder?.id}
            menuName={selectedOrder?.menu}
            onSubmit={handleSubmitReview}
         />

         <TransactionDetailModal
            isOpen={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            transaction={detailOrder}
            onCancel={(id) => {
               setDetailModalOpen(false);
               handleCancelOrder(id);
            }}
         />
      </div>
   )
}