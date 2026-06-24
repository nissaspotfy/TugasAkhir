import { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  ShoppingBag, 
  Tag, 
  Users, 
  Menu as MenuIcon, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  Star,
  Bell,
  X,
  CheckCircle2,
  Info
} from 'lucide-react';
import { ProductsManager } from '../../components/admin/ProductsManager';
import { OrdersManager } from '../../components/admin/OrdersManager';
import { PromosManager } from '../../components/admin/PromosManager';
import { CustomersManager } from '../../components/admin/CustomersManager';
import { SettingsTab } from '../../components/dashboard/SettingsTab';
import { AnalyticsDashboard } from '../../components/admin/AnalyticsDashboard';
import { ReviewsManager } from '../../components/admin/ReviewsManager.jsx';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('adminActiveTab') || 'analytics';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout, user } = useAuthStore();

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();

    // Poll notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics': return <AnalyticsDashboard />;
      case 'products': return <ProductsManager />;
      case 'orders': return <OrdersManager />;
      case 'promos': return <PromosManager />;
      case 'customers': return <CustomersManager />;
      case 'reviews': return <ReviewsManager />;
      case 'settings': return <SettingsTab user={user} />;
      default: return <AnalyticsDashboard />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'analytics': return 'Dashboard Analitik';
      case 'products': return 'Kelola Produk';
      case 'orders': return 'Pesanan Masuk';
      case 'promos': return 'Kelola Promo & Diskon';
      case 'customers': return 'Data Pelanggan';
      case 'reviews': return 'Ulasan & Rating Pelanggan';
      case 'settings': return 'Pengaturan Akun';
      default: return 'Admin Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
        <div className="py-6 flex flex-col items-center justify-center border-b border-border/50">
          <img src="/logodr.png" alt="Draosan Logo" className="h-12 w-auto mb-2" />
          <span className="font-heading text-sm uppercase tracking-widest text-primary font-bold">Admin Dashboard</span>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'analytics' ? 'bg-gradient-to-r from-[#B91C1C] via-[#E11D48] to-[#F59E0B] text-white font-bold shadow-md' : 'text-muted-foreground hover:bg-secondary/50'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-gradient-to-r from-[#B91C1C] via-[#E11D48] to-[#F59E0B] text-white font-bold shadow-md' : 'text-muted-foreground hover:bg-secondary/50'}`}>
            <ShoppingBag size={20} /> Pesanan
          </button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'products' ? 'bg-gradient-to-r from-[#B91C1C] via-[#E11D48] to-[#F59E0B] text-white font-bold shadow-md' : 'text-muted-foreground hover:bg-secondary/50'}`}>
            <Package size={20} /> Produk
          </button>
          <button onClick={() => setActiveTab('promos')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'promos' ? 'bg-gradient-to-r from-[#B91C1C] via-[#E11D48] to-[#F59E0B] text-white font-bold shadow-md' : 'text-muted-foreground hover:bg-secondary/50'}`}>
            <Tag size={20} /> Promo
          </button>
          <button onClick={() => setActiveTab('customers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'customers' ? 'bg-gradient-to-r from-[#B91C1C] via-[#E11D48] to-[#F59E0B] text-white font-bold shadow-md' : 'text-muted-foreground hover:bg-secondary/50'}`}>
            <Users size={20} /> Pelanggan
          </button>
          <button onClick={() => setActiveTab('reviews')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'reviews' ? 'bg-gradient-to-r from-[#B91C1C] via-[#E11D48] to-[#F59E0B] text-white font-bold shadow-md' : 'text-muted-foreground hover:bg-secondary/50'}`}>
            <Star size={20} /> Ulasan
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-gradient-to-r from-[#B91C1C] via-[#E11D48] to-[#F59E0B] text-white font-bold shadow-md' : 'text-muted-foreground hover:bg-secondary/50'}`}>
            <Settings size={20} /> Pengaturan
          </button>
        </div>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold overflow-hidden border border-border">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'A'
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate max-w-[130px]">{user?.name || 'Admin Kepercayaan'}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[130px]">{user?.email || 'admin@draosan.com'}</p>
            </div>
          </div>
          <button onClick={() => { logout(); window.location.href = '/login'; }} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-bold text-sm">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden mr-4 p-2 text-foreground hover:bg-secondary rounded-lg">
              <MenuIcon size={24} />
            </button>
            <h1 className="text-xl font-heading text-foreground">{getTitle()}</h1>
          </div>

          <div className="flex items-center gap-4">
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
                        <h3 className="font-bold text-base">Notifikasi Admin</h3>
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

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/20">
          <div className="max-w-6xl mx-auto space-y-6">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}