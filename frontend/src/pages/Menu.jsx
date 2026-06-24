import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../lib/api';
import useCartStore from '../stores/cartStore';
import useAuthStore, { getUserRole } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/ToastProvider';
import { Search } from 'lucide-react';
import { getFallbackFoodImage, handleImageError } from '../lib/imageFallback';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [categories, setCategories] = useState(['Semua']); // State for dynamic categories
  
  const addItem = useCartStore((state) => state.addItem);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && getUserRole(user) === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            const categoryNames = res.data.data.map(cat => cat.name);
            setCategories(['Semua', ...categoryNames]);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };
    fetchCategories();
  }, []); // Run once on mount

  useEffect(() => {
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = { limit: 100 };
            if (debouncedSearch) params.search = debouncedSearch;
            if (selectedCategory !== 'Semua') params.category = selectedCategory;

            const res = await api.get('/products', { params });
            setProducts(res.data.data.products);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };
    fetchProducts();
  }, [debouncedSearch, selectedCategory]);

  const handleAddToCart = async (product) => {
      try {
          await addItem(product);
          addToast(`${product.name} berhasil ditambahkan ke keranjang!`, 'success');
      } catch (error) {
          if (error.message === "Login required to add items to cart.") {
              addToast("Anda harus login untuk menambahkan produk ke keranjang.", 'error');
              navigate('/login'); // Redirect to login page
          } else {
              addToast(`Gagal menambahkan ${product.name} ke keranjang.`, 'error');
              console.error("Add to cart error:", error);
          }
      }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans overflow-x-hidden">
        <Navbar />
        
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
            <h1 className="font-heading text-5xl text-gradient-crimson-spark mb-4 text-center">Menu D'raosan</h1>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                Empat negara, ratusan rasa. India, Indonesia, Korea, Jepang — tersedia lengkap di D'raosan. Cus, mau coba yang mana dulu?
            </p>
            
            {/* Filters */}
            <div className="mb-10 flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Categories */}
                <div className="flex flex-wrap gap-2 justify-center">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-[10px] font-medium transition-all ${
                                selectedCategory === cat 
                                ? 'bg-gradient-to-r from-[#B91C1C] via-[#E11D48] to-[#F59E0B] hover:from-[#9c1818] hover:via-[#c7173e] hover:to-[#db8c0a] text-white shadow-md' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder="Cari makanan..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-[10px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {loading ? (
                  <div className="col-span-full text-center py-12 text-gray-500">Memuat menu lezat...</div>
              ) : products.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                      Tidak ada produk ditemukan untuk "{debouncedSearch || selectedCategory}".
                  </div>
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
        </div>

        <Footer />
    </div>
  );
}

const isStoreClosed = () => {
    const now = new Date();
    const options = { timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: false };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const hour = parseInt(formatter.format(now), 10);
    return hour < 8 || hour >= 19;
};

function ProductCard({ product, onAddToCart }) {
    const isClosed = isStoreClosed();
    const isOutOfStock = product.stock === 0 || product.stock === null;
    const color = "bg-orange-100";
 
    const imgClass = `absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
        isOutOfStock ? 'filter grayscale opacity-50' : ''
    }`;

    return (
       <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-border/50 flex flex-col h-full">
          <div className={`h-48 ${color} relative overflow-hidden flex-shrink-0`}>
              <div className="absolute inset-0 bg-black/5"></div>
              <img 
                src={product.image_url || getFallbackFoodImage(product.name)} 
                alt={product.name} 
                className={imgClass}
                onError={(e) => handleImageError(e, product.name)}
              />
              
              {/* Red badge for Out of Stock */}
              {isOutOfStock && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white font-extrabold px-3 py-1 rounded-full text-xs shadow-md uppercase tracking-wider z-10">
                      Habis
                  </div>
              )}

              {/* Yellow badge for Closed Store */}
              {isClosed && (
                  <div className="absolute bottom-3 left-3 right-3 bg-amber-500/95 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] text-center shadow-md backdrop-blur-sm z-10 border border-amber-400">
                      Toko Tutup (Buka 08:00 - 19:00)
                  </div>
              )}
          </div>
          <div className="p-6 relative flex flex-col flex-1">
             <div className="absolute -top-6 right-4 bg-accent text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                Rp {product.price.toLocaleString()}
             </div>
             <h3 className="font-heading text-xl mb-2 text-foreground">{product.name}</h3>
             <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">{product.description || 'Gurih, renyah, dan bikin nagih!'}</p>
             
             <Button 
                 onClick={() => onAddToCart(product)}
                 disabled={isOutOfStock || isClosed}
                 className="w-full font-bold text-white border-2 border-primary rounded-[10px] bg-primary mt-auto hover:bg-transparent hover:text-primary hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                 Tambah ke Keranjang
             </Button>
          </div>
       </div>
    );
 }