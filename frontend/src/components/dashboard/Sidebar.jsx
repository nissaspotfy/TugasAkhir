import { ShoppingBag, Heart, Settings, LayoutDashboard, ShieldCheck, LogOut, X } from 'lucide-react'
import { Button } from '../ui/button'

export function Sidebar({ isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab, user, logout }) {
    
    const navItems = [
        { id: 'dashboard', label: 'Riwayat Transaksi', icon: <LayoutDashboard size={20} /> },
        { id: 'settings', label: 'Pengaturan Akun', icon: <Settings size={20} /> },
    ]

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-20 flex items-center px-6 border-b border-border/50">
                        <div className="bg-primary/10 p-2 rounded-lg mr-3">
                            <ShieldCheck className="text-primary w-6 h-6" />
                        </div>
                        <span className="font-heading text-2xl text-primary tracking-wide">Draosan</span>
                        <button 
                            onClick={() => setIsSidebarOpen(false)}
                            className="ml-auto md:hidden text-muted-foreground"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                        {/* Home Link */}
                        <a
                            href="/"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm text-muted-foreground hover:bg-secondary/50 hover:text-primary"
                        >
                            <ShoppingBag size={20} />
                            <span>Belanja Lagi</span>
                        </a>

                        {navItems.map((item) => (
                            <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id)
                                setIsSidebarOpen(false)
                            }}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm
                                ${activeTab === item.id 
                                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                : 'text-muted-foreground hover:bg-secondary/50 hover:text-primary'}
                            `}
                            >
                            {item.icon}
                            <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-border/50">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold truncate text-foreground">{user?.name || 'User'}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                            onClick={logout}
                        >
                            <LogOut size={18} />
                            <span>Keluar</span>
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    )
}
