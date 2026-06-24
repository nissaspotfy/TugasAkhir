import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { ShoppingCart, Utensils, Trash2, X, ShoppingBag, Menu } from 'lucide-react';
import useAuthStore, { getUserRole } from '../stores/authStore';
import useCartStore from '../stores/cartStore';
import useNotificationStore from '../stores/notificationStore';
import api from '../lib/api';

export default function Navbar() {
    const { isAuthenticated, logout, user } = useAuthStore();
    const { items, removeItem, getTotalPrice, getItemCount, clearCart } = useCartStore();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const cartRef = useRef(null);
    const navigate = useNavigate();
    const [isStoreOpen, setIsStoreOpen] = useState(true);

    const location = useLocation();
    const isHome = location.pathname === '/';
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchStoreStatus = async () => {
            try {
                const res = await api.get('/settings/store-status');
                setIsStoreOpen(res.data.data.isOpen);
            } catch (err) {
                console.error("Failed to fetch store status:", err);
            }
        };
        fetchStoreStatus();
    }, []);

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
        clearCart();
        try {
            useNotificationStore.getState().clearNotifications();
        } catch (e) {
            console.error(e);
        }
        navigate('/login');
    };

    return (
        <nav className="fixed w-full top-0 left-0 z-50 bg-background text-foreground border-b border-muted transition-colors font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center text-2xl tracking-tight hover:scale-105 transition-transform">
                    <img src="/logodr.png" alt="D'raosan Logo" className="h-14 w-auto object-contain" />
                </Link>

                <div className="hidden md:flex items-center space-x-8 font-medium">
                    <a href="/#home" className="hover:text-primary transition-colors">Beranda</a>
                    <Link to="/menu" className="hover:text-primary transition-colors">Menu</Link>
                    <a href="#footer" className="hover:text-primary transition-colors">Hubungi Kami</a>
                    {isAuthenticated && (
                        <Link
                            to={getUserRole(user) === 'admin' ? "/admin/dashboard" : "/dashboard"}
                            className="hover:text-primary transition-colors"
                        >
                            Dashboard
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Cart Dropdown */}
                    <div className="relative" ref={cartRef}>
                        <button
                            onClick={() => setIsCartOpen(!isCartOpen)}
                            className="relative p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <ShoppingCart className="h-6 w-6 text-primary" />
                            {getItemCount() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
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
                                    <div className="flex flex-col items-center justify-center py-8 px-2 text-center">
                                        <span className="text-6xl mb-3">🛒</span>
                                        <p className="text-gray-500 mb-5 whitespace-pre-wrap font-medium">
                                            Keranjang sedang kosong.{"\n"}Pilih menu favoritmu!
                                        </p>
                                        <Link
                                            to="/menu"
                                            onClick={() => setIsCartOpen(false)}
                                            className="bg-primary text-white hover:bg-primary/90 rounded-full px-6 py-2 text-sm font-bold shadow-sm transition-transform hover:scale-105"
                                        >
                                            Mulai Belanja
                                        </Link>
                                    </div>
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
                                    <Button
                                        onClick={handleCheckout}
                                        disabled={!isStoreOpen}
                                        className={`w-full font-bold rounded-full ${!isStoreOpen ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : 'bg-accent hover:bg-accent/90'} text-white`}
                                    >
                                        {isStoreOpen ? 'Checkout' : 'Toko Sedang Tutup'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {isAuthenticated ? (
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="hidden sm:inline-flex hover:bg-primary hover:text-white border-primary text-primary rounded-full px-6 font-bold"
                        >
                            Keluar
                        </Button>
                    ) : (
                        <Link to="/login" className="hidden sm:inline">
                            <Button
                                className="bg-primary text-white hover:bg-primary/90 rounded-full px-6 font-bold shadow-md"
                            >
                                Masuk
                            </Button>
                        </Link>
                    )}

                    {/* Mobile Hamburger Menu Toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 hover:bg-muted rounded-full transition-colors text-foreground"
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? <X className="h-6 w-6 text-primary" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Links */}
            <div
                className={`
                    md:hidden bg-white text-gray-800 border-t border-muted overflow-hidden transition-all duration-300 ease-in-out
                    ${isMenuOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}
                `}
            >
                <div className="px-6 py-4 flex flex-col space-y-4 font-bold text-sm">
                    <a href="/#home" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-gray-100">Beranda</a>
                    <Link to="/menu" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-gray-100">Menu</Link>
                    <a href="#footer" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-gray-100">Hubungi Kami</a>
                    {isAuthenticated && (
                        <Link
                            to={getUserRole(user) === 'admin' ? "/admin/dashboard" : "/dashboard"}
                            onClick={() => setIsMenuOpen(false)}
                            className="hover:text-primary transition-colors py-2 border-b border-gray-100"
                        >
                            Dashboard
                        </Link>
                    )}
                    {isAuthenticated ? (
                        <button
                            onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                            className="text-left text-red-600 hover:text-red-700 py-2"
                        >
                            Keluar
                        </button>
                    ) : (
                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-primary py-2">
                            Masuk
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}