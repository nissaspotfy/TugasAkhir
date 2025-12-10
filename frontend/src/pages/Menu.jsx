import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import useCartStore from '../stores/cartStore';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/ToastProvider';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
        try {
            // Ideally support pagination logic here too
            const res = await api.get('/products?limit=100'); 
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
        
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="font-heading text-4xl text-primary mb-8 text-center">Menu Kami</h1>
            
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