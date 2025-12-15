import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import useCartStore from '../stores/cartStore';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/ToastProvider';
import { Search } from 'lucide-react';

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
        
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="font-heading text-4xl text-primary mb-8 text-center">Menu Kami</h1>
            
            {/* Filters */}
            <div className="mb-10 flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Categories */}
                <div className="flex flex-wrap gap-2 justify-center">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full font-medium transition-all ${
                                selectedCategory === cat 
                                ? 'bg-primary text-white shadow-md' 
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
                        className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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

        <footer className="bg-[#2F4F4F] text-white py-16 mt-auto">
             <div className="max-w-7xl mx-auto px-4 text-center">
                 <p className="text-gray-400">© 2025 Draosan UMKM. All rights reserved.</p>
             </div>
        </footer>
    </div>
  );
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