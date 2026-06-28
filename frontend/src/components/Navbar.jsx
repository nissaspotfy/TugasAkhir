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
    const { getItemCount, clearCart } = useCartStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const [isStoreOpen, setIsStoreOpen] = useState(true);

    const location = useLocation();
    const isHome = location.pathname === '/';
    const [isScrolled, setIsScrolled] = useState(false);

    const getLinkClass = (path) => {
        let isActive = false;
        if (path === '/') {
            isActive = location.pathname === '/' && location.hash !== '#footer';
        } else if (path === '#footer') {
            isActive = location.pathname === '/' && location.hash === '#footer';
        } else if (path === '/dashboard') {
            isActive = location.pathname === '/dashboard' || location.pathname.startsWith('/admin');
        } else {
            isActive = location.pathname === path;
        }

        return isActive 
            ? "text-primary font-bold transition-colors" 
            : "text-foreground hover:text-primary transition-colors";
    };

    const getMobileLinkClass = (path) => {
        let isActive = false;
        if (path === '/') {
            isActive = location.pathname === '/' && location.hash !== '#footer';
        } else if (path === '#footer') {
            isActive = location.pathname === '/' && location.hash === '#footer';
        } else if (path === '/dashboard') {
            isActive = location.pathname === '/dashboard' || location.pathname.startsWith('/admin');
        } else {
            isActive = location.pathname === path;
        }

        return isActive 
            ? "text-primary font-bold transition-colors py-2 border-b border-gray-100" 
            : "text-gray-800 hover:text-primary transition-colors py-2 border-b border-gray-100";
    };

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

    const handleLogoClick = () => {
        if (location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            window.history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    };

    return (
        <nav className="fixed w-full top-0 left-0 z-50 bg-background text-foreground border-b border-muted transition-colors font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <Link to="/" onClick={handleLogoClick} className="flex items-center text-2xl tracking-tight hover:scale-105 transition-transform">
                    <img src="/logodr.png" alt="D'raosan Logo" className="h-14 w-auto object-contain" />
                </Link>

                <div className="hidden md:flex items-center space-x-8 font-medium">
                    <a href="/#home" className={getLinkClass('/')}>Beranda</a>
                    <Link to="/menu" className={getLinkClass('/menu')}>Menu</Link>
                    <a href="/#footer" className={getLinkClass('#footer')}>Hubungi Kami</a>
                    {isAuthenticated && (
                        <Link
                            to={getUserRole(user) === 'admin' ? "/admin/dashboard" : "/dashboard"}
                            onClick={() => localStorage.setItem('customerActiveTab', 'dashboard')}
                            className={getLinkClass('/dashboard')}
                        >
                            Dashboard
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Cart Icon Link */}
                    <div className="relative">
                        <Link
                            to="/cart"
                            className={`relative p-2 rounded-full transition-colors block ${
                                location.pathname === '/cart' 
                                    ? 'bg-muted/80 text-primary border border-primary/20' 
                                    : 'hover:bg-muted text-foreground'
                            }`}
                        >
                            <ShoppingCart className="h-6 w-6 text-primary" />
                            {getItemCount() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                                    {getItemCount()}
                                </span>
                            )}
                        </Link>
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
                    <a href="/#home" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass('/')}>Beranda</a>
                    <Link to="/menu" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass('/menu')}>Menu</Link>
                    <a href="/#footer" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass('#footer')}>Hubungi Kami</a>
                    {isAuthenticated && (
                        <Link
                            to={getUserRole(user) === 'admin' ? "/admin/dashboard" : "/dashboard"}
                            onClick={() => { setIsMenuOpen(false); localStorage.setItem('customerActiveTab', 'dashboard'); }}
                            className={getMobileLinkClass('/dashboard')}
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