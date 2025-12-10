import React, { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { ArrowRight, Star, Utensils, Leaf, Clock, ShieldCheck, Heart, Instagram, MessageCircle, ShoppingCart, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../lib/api'
import useCartStore from '../stores/cartStore'
import { useToast } from '../components/ui/ToastProvider'

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const { addToast } = useToast();

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

  const handleAddToCart = (product) => {
      addItem(product);
      addToast(`${product.name} berhasil ditambahkan ke keranjang!`, 'success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <header id="home" className="relative bg-primary pt-20 pb-40 overflow-hidden">
        {/* Floating Background Elements (Snacks) */}
        <div className="absolute inset-0 pointer-events-none">
           <img src="https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300" className="absolute top-10 -left-10 w-40 h-40 object-cover rounded-full opacity-40 animate-pulse" style={{animationDuration: '4s'}} alt="bg-snack" />
           <img src="https://images.unsplash.com/photo-1566497014629-4f4b58f2b140?w=300" className="absolute top-20 -right-10 w-48 h-48 object-cover rounded-full opacity-40 animate-bounce" style={{animationDuration: '8s'}} alt="bg-snack" />
           <img src="https://images.unsplash.com/photo-1621451537084-482c73071a06?w=300" className="absolute bottom-20 left-10 w-32 h-32 object-cover rounded-full opacity-30 rotate-12" alt="bg-snack" />
           <img src="https://images.unsplash.com/photo-1600626337889-1045b4832d83?w=300" className="absolute bottom-40 right-20 w-36 h-36 object-cover rounded-full opacity-30 -rotate-12" alt="bg-snack" />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 text-primary-foreground space-y-8">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-bold animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span>UMKM Terbaik di Goalpara</span>
          </div>
          
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl leading-tight drop-shadow-lg">
            Renyah, Gurih <br/>
            <span className="text-accent inline-block transform -rotate-2">Bikin Nagih!</span>
          </h1>
          
          <p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed font-medium">
            Nikmati aneka camilan asli Goalpara yang dibuat dengan bahan pilihan. Teman setia saat santai maupun kerja.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <a href="#products">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-full px-10 h-16 text-xl font-heading shadow-[0_10px_40px_-10px_rgba(234,115,61,0.5)] hover:scale-105 transition-transform">
                Belanja Sekarang
                </Button>
            </a>
          </div>
        </div>

        {/* Torn Paper Bottom Effect */}
        <div className="absolute -bottom-1 left-0 w-full h-16 bg-background torn-paper-top transform rotate-180"></div>
      </header>

      {/* Features Strip */}
      <section className="py-12 bg-background relative z-10 -mt-8">
         <div className="max-w-7xl mx-auto px-4">
            <div className="bg-secondary/50 rounded-3xl p-8 flex flex-wrap justify-around items-center gap-8 shadow-inner">
               <FeatureItem icon={<Leaf />} text="Bahan Alami" />
               <div className="hidden md:block w-px h-12 bg-primary/20"></div>
               <FeatureItem icon={<ShieldCheck />} text="100% Halal" />
               <div className="hidden md:block w-px h-12 bg-primary/20"></div>
               <FeatureItem icon={<Clock />} text="Produksi Harian" />
               <div className="hidden md:block w-px h-12 bg-primary/20"></div>
               <FeatureItem icon={<Heart />} text="Buatan Lokal" />
            </div>
         </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="font-heading text-4xl md:text-5xl text-primary mb-4">Camilan Favorit</h2>
             <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
               Pilih camilan kesukaanmu dari koleksi terbaik kami. Awas ketagihan!
             </p>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {loading ? (
                  <div className="col-span-full text-center py-12">Loading products...</div>
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
                  <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full px-8 h-12 font-bold text-lg transition-all">
                     Lihat Semua Menu
                     <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
              </Link>
           </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-24 bg-primary overflow-hidden">
         <div className="absolute -top-1 left-0 w-full h-12 bg-background torn-paper-bottom transform rotate-180"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-12">
            <div className="grid md:grid-cols-2 gap-16 items-center">
               <div className="relative">
                  <div className="absolute inset-0 bg-accent rounded-[2rem] rotate-3 transform"></div>
                  <img 
                     src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600" 
                     alt="Goalpara" 
                     className="relative rounded-[2rem] shadow-2xl -rotate-2 border-4 border-white"
                  />
               </div>
               <div className="text-primary-foreground space-y-6">
                  <h2 className="font-heading text-4xl md:text-5xl">Cerita Draosan</h2>
                  <p className="text-lg opacity-90 leading-relaxed">
                     Berawal dari dapur kecil di kaki Gunung Gede Pangrango, Draosan hadir untuk membawa cita rasa otentik Sukabumi ke seluruh Indonesia.
                  </p>
                  <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                     <div className="flex items-center gap-4 mb-2">
                        <MapPin className="text-accent w-6 h-6" />
                        <span className="font-bold text-xl">Lokasi Produksi</span>
                     </div>
                     <p className="opacity-80 pl-10">Jl. Goalpara No. 45, Sukabumi, Jawa Barat</p>
                  </div>
               </div>
            </div>
         </div>
         
         <div className="absolute -bottom-1 left-0 w-full h-12 bg-[#2F4F4F] torn-paper-top"></div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2F4F4F] text-white py-16">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
               <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 font-heading text-3xl mb-2">
                     <Utensils className="h-8 w-8 text-accent" />
                     <span>Draosan</span>
                  </div>
                  <p className="text-gray-400">Cita rasa khas yang tak terlupakan.</p>
               </div>
               
               <div className="flex gap-6 justify-center">
                  <a href="javascript:void(0)" onClick={()=>addToast('Coming Soon!', 'info')} className="flex flex-col items-center hover:text-accent transition-colors">
                     <Instagram className="w-6 h-6 mb-1" />
                     Instagram
                  </a>
                  <a href="javascript:void(0)" onClick={()=>addToast('Coming Soon!', 'info')} className="flex flex-col items-center hover:text-accent transition-colors">
                     <MessageCircle className="w-6 h-6 mb-1" />
                     WhatsApp
                  </a>
                  <a href="javascript:void(0)" onClick={()=>addToast('Coming Soon!', 'info')} className="flex flex-col items-center hover:text-accent transition-colors">
                     <ShoppingCart className="w-6 h-6 mb-1" />
                     Tokopedia
                  </a>
               </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
               © 2025 Draosan UMKM. All rights reserved.
            </div>
         </div>
      </footer>
    </div>
  )
}

function FeatureItem({ icon, text }) {
   return (
      <div className="flex items-center gap-3 text-primary font-bold text-lg">
         <div className="bg-white p-2 rounded-full shadow-sm">
            {React.cloneElement(icon, { className: "w-6 h-6 text-accent" })}
         </div>
         <span>{text}</span>
      </div>
   )
}

function ProductCard({ product, onAddToCart }) {
   const color = "bg-orange-100"; 

   return (
      <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-border/50 flex flex-col h-full">
         <div className={`h-48 ${color} relative overflow-hidden flex-shrink-0`}>
             <div className="absolute inset-0 bg-black/5"></div>
             <img 
               src={product.image_url || 'https://placehold.co/500'} 
               alt={product.name} 
               className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
             />
         </div>
         <div className="p-6 relative flex flex-col flex-1">
            <div className="absolute -top-6 right-4 bg-accent text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
               Rp {product.price.toLocaleString()}
            </div>
            <h3 className="font-heading text-xl mb-2 text-foreground">{product.name}</h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">{product.description || 'Gurih, renyah, dan bikin nagih!'}</p>
            
            <Button 
                onClick={() => onAddToCart(product)}
                className="w-full rounded-full bg-primary hover:bg-primary/90 font-bold mt-auto"
            >
                Tambah ke Keranjang
            </Button>
         </div>
      </div>
   )
}