import React, { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { ArrowRight, Star, Utensils, Leaf, Clock, ShieldCheck, Heart, Instagram, MessageCircle, ShoppingCart, MapPin } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../lib/api'
import useCartStore from '../stores/cartStore'
import { useToast } from '../components/ui/ToastProvider'

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const res = await api.get('/products?limit=8');
            setProducts(res.data.data.products);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
      try {
          await addItem(product);
          addToast(`${product.name} berhasil ditambahkan ke keranjang!`, 'success');
      } catch (error) {
          if (error.message === "Login required to add items to cart.") {
              addToast("Anda harus login untuk menambahkan produk ke keranjang.", 'error');
              navigate('/login');
          } else {
              addToast(`Gagal menambahkan ${product.name} ke keranjang.`, 'error');
              console.error("Add to cart error:", error);
          }
      }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden font-sans bg-background">
      <Navbar />

      {/* Hero Section */}
      <header id="home" className="relative pt-20 pb-40 overflow-hidden bg-primary">
        {/* Floating Background Elements (Snacks) */}
        <div className="absolute inset-0 pointer-events-none">
           <img src="https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300" className="absolute object-cover w-40 h-40 rounded-full top-10 -left-10 opacity-40 animate-pulse" style={{animationDuration: '4s'}} alt="bg-snack" />
           <img src="https://images.unsplash.com/photo-1566497014629-4f4b58f2b140?w=300" className="absolute object-cover w-48 h-48 rounded-full top-20 -right-10 opacity-40 animate-bounce" style={{animationDuration: '8s'}} alt="bg-snack" />
           <img src="https://images.unsplash.com/photo-1621451537084-482c73071a06?w=300" className="absolute object-cover w-32 h-32 rounded-full bottom-20 left-10 opacity-30 rotate-12" alt="bg-snack" />
           <img src="https://images.unsplash.com/photo-1600626337889-1045b4832d83?w=300" className="absolute object-cover rounded-full bottom-40 right-20 w-36 h-36 opacity-30 -rotate-12" alt="bg-snack" />
        </div>

        <div className="relative z-10 max-w-4xl px-4 mx-auto space-y-8 text-center text-primary-foreground">
          <div className="inline-flex items-center gap-2 px-6 py-2 text-sm font-bold duration-1000 border rounded-full bg-white/10 backdrop-blur-md border-white/20 animate-in fade-in slide-in-from-bottom-4">
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span>UMKM Terbaik di Goalpara</span>
          </div>
          
          <h1 className="text-5xl leading-tight font-heading md:text-7xl lg:text-8xl drop-shadow-lg">
            Renyah, Gurih <br/>
            <span className="inline-block transform text-accent -rotate-2">Bikin Nagih!</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl font-medium leading-relaxed opacity-90">
            Nikmati aneka camilan asli Goalpara yang dibuat dengan bahan pilihan. Teman setia saat santai maupun kerja.
          </p>
          
          <div className="flex flex-col justify-center gap-4 pt-8 sm:flex-row">
            <a href="#products">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-full px-10 h-16 text-xl font-heading shadow-[0_10px_40px_-10px_rgba(234,115,61,0.5)] hover:scale-105 transition-transform">
                Belanja Sekarang
                </Button>
            </a>
          </div>
        </div>

        {/* Torn Paper Bottom Effect */}
        <div className="absolute left-0 w-full h-16 transform rotate-180 -bottom-1 bg-background torn-paper-top"></div>
      </header>

      {/* Features Strip */}
      <section className="relative z-10 py-12 -mt-8 bg-background">
         <div className="px-4 mx-auto max-w-7xl">
            <div className="flex flex-wrap items-center justify-around gap-8 p-8 shadow-inner bg-secondary/50 rounded-3xl">
               <FeatureItem icon={<Leaf />} text="Bahan Alami" />
               <div className="hidden w-px h-12 md:block bg-primary/20"></div>
               <FeatureItem icon={<ShieldCheck />} text="100% Halal" />
               <div className="hidden w-px h-12 md:block bg-primary/20"></div>
               <FeatureItem icon={<Clock />} text="Produksi Harian" />
               <div className="hidden w-px h-12 md:block bg-primary/20"></div>
               <FeatureItem icon={<Heart />} text="Buatan Lokal" />
            </div>
         </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-background">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
           <div className="mb-16 text-center">
             <h2 className="mb-4 text-4xl font-heading md:text-5xl text-primary">Camilan Favorit</h2>
             <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
               Pilih camilan kesukaanmu dari koleksi terbaik kami. Awas ketagihan!
             </p>
           </div>

           <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {loading ? (
                  <div className="py-12 text-center col-span-full">Loading products...</div>
              ) : (
                  products.map((product) => (
                      <ProductCard 
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                  ))
              )}
           </div>

           <div className="mt-16 text-center">
              <Link to="/menu">
                  <Button variant="outline" className="h-12 px-8 text-lg font-bold transition-all border-2 rounded-full border-primary text-primary hover:bg-primary hover:text-white">
                     Lihat Semua Menu
                     <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
              </Link>
           </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-24 overflow-hidden bg-primary">
         <div className="absolute left-0 w-full h-12 transform rotate-180 -top-1 bg-background torn-paper-bottom"></div>
         
         <div className="relative z-10 px-4 pt-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid items-center gap-16 md:grid-cols-2">
               <div className="relative">
                  <div className="absolute inset-0 bg-accent rounded-[2rem] rotate-3 transform"></div>
                  <img 
                     src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600" 
                     alt="Goalpara" 
                     className="relative rounded-[2rem] shadow-2xl -rotate-2 border-4 border-white"
                  />
               </div>
               <div className="space-y-6 text-primary-foreground">
                  <h2 className="text-4xl font-heading md:text-5xl">Cerita Draosan</h2>
                  <p className="text-lg leading-relaxed opacity-90">
                     Berawal dari dapur kecil di kaki Gunung Gede Pangrango, Draosan hadir untuk membawa cita rasa otentik Sukabumi ke seluruh Indonesia.
                  </p>
                  <div className="p-6 border bg-white/10 rounded-2xl border-white/10 backdrop-blur-sm">
                     <div className="flex items-center gap-4 mb-2">
                        <MapPin className="w-6 h-6 text-accent" />
                        <span className="text-xl font-bold">Lokasi Produksi</span>
                     </div>
                     <p className="pl-10 opacity-80">Jl. Goalpara No. 45, Sukabumi, Jawa Barat</p>
                  </div>
               </div>
            </div>
         </div>
         
         <div className="absolute -bottom-1 left-0 w-full h-12 bg-[#2F4F4F] torn-paper-top"></div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2F4F4F] text-white py-16">
         <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
               <div className="text-center md:text-left">
                  <div className="flex items-center justify-center gap-2 mb-2 text-3xl md:justify-start font-heading">
                     <Utensils className="w-8 h-8 text-accent" />
                     <span>Draosan</span>
                  </div>
                  <p className="text-gray-400">Cita rasa khas yang tak terlupakan.</p>
               </div>
               
               <div className="flex justify-center gap-6">
                  <a href="javascript:void(0)" onClick={()=>addToast('Coming Soon!', 'info')} className="flex flex-col items-center transition-colors hover:text-accent">
                     <Instagram className="w-6 h-6 mb-1" />
                     Instagram
                  </a>
                  <a href="javascript:void(0)" onClick={()=>addToast('Coming Soon!', 'info')} className="flex flex-col items-center transition-colors hover:text-accent">
                     <MessageCircle className="w-6 h-6 mb-1" />
                     WhatsApp
                  </a>
                  <a href="javascript:void(0)" onClick={()=>addToast('Coming Soon!', 'info')} className="flex flex-col items-center transition-colors hover:text-accent">
                     <ShoppingCart className="w-6 h-6 mb-1" />
                     Tokopedia
                  </a>
               </div>
            </div>
            <div className="pt-8 mt-12 text-sm text-center text-gray-500 border-t border-white/10">
               © 2025 Draosan UMKM. All rights reserved.
            </div>
         </div>
      </footer>
    </div>
  )
}

function FeatureItem({ icon, text }) {
   return (
      <div className="flex items-center gap-3 text-lg font-bold text-primary">
         <div className="p-2 bg-white rounded-full shadow-sm">
            {React.cloneElement(icon, { className: "w-6 h-6 text-accent" })}
         </div>
         <span>{text}</span>
      </div>
   )
}

function ProductCard({ product, onAddToCart }) {
   const color = "bg-orange-100"; 

   return (
      <div className="relative flex flex-col h-full overflow-hidden transition-all duration-300 bg-white border shadow-lg group rounded-3xl hover:shadow-xl hover:-translate-y-1 border-border/50">
         <div className={`h-48 ${color} relative overflow-hidden flex-shrink-0`}>
             <div className="absolute inset-0 bg-black/5"></div>
             <img 
               src={product.image_url || 'https://placehold.co/500'} 
               alt={product.name} 
               className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
             />
         </div>
         <div className="relative flex flex-col flex-1 p-6">
            <div className="absolute px-4 py-1 text-sm font-bold text-white rounded-full shadow-md -top-6 right-4 bg-accent">
               Rp {product.price.toLocaleString()}
            </div>
            <h3 className="mb-2 text-xl font-heading text-foreground">{product.name}</h3>
            <p className="flex-1 mb-4 text-sm text-muted-foreground line-clamp-2">{product.description || 'Gurih, renyah, dan bikin nagih!'}</p>
            
            <Button 
                onClick={() => onAddToCart(product)}
                className="w-full mt-auto font-bold rounded-full bg-primary hover:bg-primary/90"
            >
                Tambah ke Keranjang
            </Button>
         </div>
      </div>
   )
}