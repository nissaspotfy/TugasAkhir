import { useState, useEffect } from 'react'
import useAuthStore from '../stores/authStore'
import { 
  Menu, 
  Search,
  Bell
} from 'lucide-react'
import { Sidebar } from '../components/dashboard/Sidebar'
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner'
import { SettingsTab } from '../components/dashboard/SettingsTab'
import { RecentActivity } from '../components/dashboard/RecentActivity'

const Dashboard = () => {
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard', 'settings'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const getTabLabel = (tabId) => {
      switch(tabId) {
          case 'dashboard': return 'Riwayat Transaksi';
          case 'settings': return 'Pengaturan Akun';
          default: return '';
      }
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
                <button className="p-2 relative hover:bg-secondary rounded-full text-muted-foreground hover:text-primary transition-colors">
                   <Bell size={20} />
                   {/* <span className="absolute top-1.5 right-2 w-2 h-2 bg-destructive rounded-full border border-white"></span> */}
                </button>
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