import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import useCartStore from '../stores/cartStore'
import useNotificationStore from '../stores/notificationStore'
import {
    Menu,
    Search,
    Bell,
    ShoppingCart,
    X,
    Trash2,
    CheckCircle2,
    Package,
    Info
} from 'lucide-react'
import { Sidebar } from '../components/dashboard/Sidebar'
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner'
import { SettingsTab } from '../components/dashboard/SettingsTab'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { getFallbackFoodImage, handleImageError, getProductImageUrl } from '../lib/imageFallback'
import { Button } from '../components/ui/button'

const Dashboard = () => {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('customerActiveTab') || 'dashboard';
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        localStorage.setItem('customerActiveTab', activeTab);
    }, [activeTab]);
    const { items, removeItem, getTotalPrice, getItemCount, fetchCart } = useCartStore()
    const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore()

    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isNotifOpen, setIsNotifOpen] = useState(false)

    const cartRef = useRef(null)
    const notifRef = useRef(null)

    useEffect(() => {
        fetchCart()
        fetchNotifications()

        // Poll notifications every 30 seconds
        const interval = setInterval(() => {
            fetchNotifications()
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    // Close dropdowns on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (cartRef.current && !cartRef.current.contains(event.target)) {
                setIsCartOpen(false)
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

    const getTabLabel = (tabId) => {
        switch (tabId) {
            case 'dashboard': return 'Riwayat Transaksi';
            case 'settings': return 'Pengaturan Akun';
            default: return '';
        }
    }

    const handleCheckout = () => {
        setIsCartOpen(false)
        navigate('/checkout')
    }

    return (
        <div className="min-h-screen bg-background flex font-sans overflow-hidden">

            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                logout={logout}
            />

            {/* Main Layout Grid */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-30 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="md:hidden p-2 hover:bg-secondary rounded-lg text-foreground"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-foreground capitalize hidden sm:block">
                                {getTabLabel(activeTab)}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Cart Icon & Dropdown */}
                        <div className="relative" ref={cartRef}>
                            <button
                                onClick={() => setIsCartOpen(!isCartOpen)}
                                className="p-2 relative hover:bg-secondary rounded-full text-muted-foreground hover:text-primary transition-colors"
                                title="Keranjang Belanja"
                            >
                                <ShoppingCart size={20} className="text-primary" />
                                {getItemCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-bounce">
                                        {getItemCount()}
                                    </span>
                                )}
                            </button>

                            <div
                                className={`
                                    absolute right-0 mt-4 w-80 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 
                                    transition-all duration-300 ease-in-out origin-top-right
                                    ${isCartOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
                                `}
                            >
                                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                    <h3 className="font-bold text-base">Keranjang</h3>
                                    <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600">
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="max-h-64 overflow-y-auto p-4 space-y-4">
                                    {items.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                            <span className="text-4xl mb-2">🛒</span>
                                            <p className="text-xs text-gray-500 whitespace-pre-wrap font-medium">
                                                Keranjang sedang kosong.{"\n"}Pilih menu favoritmu!
                                            </p>
                                        </div>
                                    ) : (
                                        items.map((item) => (
                                            <div key={item.id} className="flex gap-3 text-xs">
                                                <div className="h-12 w-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                    <img 
                                                        src={getProductImageUrl(item.image_url) || getFallbackFoodImage(item.name)} 
                                                        alt={item.name} 
                                                        className="w-full h-full object-cover" 
                                                        onError={(e) => handleImageError(e, item.name)}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800 line-clamp-1">{item.name}</h4>
                                                    <p className="text-gray-500">{item.quantity} x Rp {item.price.toLocaleString()}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-400 hover:text-red-600 self-center"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {items.length > 0 && (
                                    <div className="p-4 border-t bg-gray-50 text-xs">
                                        <div className="flex justify-between font-bold mb-3 text-sm">
                                            <span>Total</span>
                                            <span>Rp {getTotalPrice().toLocaleString()}</span>
                                        </div>
                                        <Button
                                            onClick={handleCheckout}
                                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-full py-4 text-xs"
                                        >
                                            Checkout
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notification Bell & Dropdown */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="p-2 relative hover:bg-secondary rounded-full text-muted-foreground hover:text-primary transition-colors"
                                title="Notifikasi"
                            >
                                <Bell size={20} className={unreadCount > 0 ? "text-primary" : ""} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full border border-white"></span>
                                )}
                            </button>

                            <div
                                className={`
                                    absolute right-0 mt-4 w-80 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 
                                    transition-all duration-300 ease-in-out origin-top-right
                                    ${isNotifOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
                                `}
                            >
                                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                    <h3 className="font-bold text-base">Notifikasi</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={() => markAllAsRead()}
                                            className="text-xs text-primary hover:text-primary/85 font-bold transition-colors"
                                        >
                                            Tandai semua dibaca
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                                    {notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                            <span className="text-4xl mb-2">🔔</span>
                                            <p className="text-xs text-gray-500 font-medium font-sans">Belum ada notifikasi baru.</p>
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                onClick={() => {
                                                    if (!notif.is_read) markAsRead(notif.id);
                                                }}
                                                className={`p-4 hover:bg-secondary/20 transition-colors cursor-pointer flex gap-3 ${!notif.is_read ? 'bg-blue-50/40' : ''}`}
                                            >
                                                <div className="mt-0.5 flex-shrink-0">
                                                    {notif.type === 'payment' ? (
                                                        <div className="p-1.5 bg-green-50 text-green-600 rounded-lg"><CheckCircle2 size={14} /></div>
                                                    ) : notif.type === 'order' ? (
                                                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Package size={14} /></div>
                                                    ) : (
                                                        <div className="p-1.5 bg-gray-50 text-gray-600 rounded-lg"><Info size={14} /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-1 font-sans">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className={`text-xs font-bold ${!notif.is_read ? 'text-gray-900 font-black' : 'text-gray-600'}`}>{notif.title}</h4>
                                                        <span className="text-[9px] text-gray-400 font-medium">
                                                            {new Date(notif.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 leading-normal">{notif.message}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-5xl mx-auto space-y-8 pb-20">

                        {activeTab === 'dashboard' && (
                            <>
                                <WelcomeBanner userName={user?.name} />
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="font-heading text-xl mb-4">Riwayat Transaksi Terakhir</h3>
                                    <RecentActivity />
                                </div>
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <SettingsTab user={user} />
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard