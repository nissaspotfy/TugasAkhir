import { ShoppingBag, Heart, Settings, LayoutDashboard, ShieldCheck, LogOut, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'

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
                    <div className="h-24 flex items-center justify-center px-6 border-b border-border/50 relative">
                        <Link to="/" className="hover:scale-105 transition-transform flex items-center justify-center">
                            <img src="/logodr.png" alt="Draosan Logo" className="h-14 w-auto object-contain" />
                        </Link>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden text-muted-foreground hover:text-primary transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                        {/* Home Link */}
                        <Link
                            to="/menu"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm text-muted-foreground hover:bg-secondary/50 hover:text-primary"
                        >
                            <ShoppingBag size={20} />
                            <span>Belanja Lagi</span>
                        </Link>

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
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold overflow-hidden border border-border">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0).toUpperCase() || 'U'
                                )}
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
