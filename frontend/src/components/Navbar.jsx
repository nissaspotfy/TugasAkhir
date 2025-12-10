import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ShoppingCart, Utensils, Trash2, X } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useCartStore from '../stores/cartStore';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();
  const { items, removeItem, getTotalPrice, getItemCount } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef(null);
  const navigate = useNavigate();

  // Close cart when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cartRef]);

  const handleCheckout = () => {
      setIsCartOpen(false);
      navigate('/checkout');
  };

  const handleLogout = () => {
      logout();
      navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl tracking-tight">
          <div className="bg-accent p-2 rounded-full rotate-3">
            <Utensils className="h-6 w-6 text-white" />
          </div>
          <span className="font-heading text-white tracking-wider">Draosan</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8 font-medium text-primary-foreground/90">
          <Link to="/" className="hover:text-accent transition-colors">Beranda</Link>
          <a href="/#products" className="hover:text-accent transition-colors">Produk</a>
          {isAuthenticated && (
              <Link to="/dashboard" className="hover:text-accent transition-colors">Dashboard</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
            {/* Cart Dropdown */}
            <div className="relative" ref={cartRef}>
                <button 
                    onClick={() => setIsCartOpen(!isCartOpen)}
                    className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ShoppingCart className="h-6 w-6" />
                    {getItemCount() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                            {getItemCount()}
                        </span>
                    )}
                </button>

                <div 
                    className={`
                        absolute right-0 mt-4 w-80 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 
                        transition-all duration-300 ease-in-out origin-top-right
                        ${isCartOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
                    `}
                >
                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                        <h3 className="font-bold text-lg">Keranjang</h3>
                        <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                        {items.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">Keranjang kosong</p>
                        ) : (
                            items.map((item) => (
                                <div key={item.id} className="flex gap-3">
                                    <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                        <img src={item.image_url || 'https://placehold.co/100'} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                                        <p className="text-sm text-gray-500">{item.quantity} x Rp {item.price.toLocaleString()}</p>
                                    </div>
                                    <button 
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-400 hover:text-red-600 self-center"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {items.length > 0 && (
                        <div className="p-4 border-t bg-gray-50">
                            <div className="flex justify-between font-bold mb-4 text-lg">
                                <span>Total</span>
                                <span>Rp {getTotalPrice().toLocaleString()}</span>
                            </div>
                            <Button onClick={handleCheckout} className="w-full bg-accent hover:bg-accent/90 text-white font-bold rounded-full">
                                Checkout
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {isAuthenticated ? (
                <Button 
                    onClick={handleLogout}
                    className="bg-white/10 hover:bg-white/20 text-white rounded-full px-6 font-bold"
                >
                    Keluar
                </Button>
            ) : (
                <Link to="/login">
                    <Button 
                        className="bg-accent text-white hover:bg-accent/90 rounded-full px-6 font-bold shadow-lg"
                    >
                        Masuk
                    </Button>
                </Link>
            )}
        </div>
      </div>
    </nav>
  );
}