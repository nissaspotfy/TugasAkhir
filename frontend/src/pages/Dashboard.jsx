import { useState } from 'react'
import useAuthStore from '../stores/authStore'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { LayoutDashboard, LogOut, User, ShieldCheck, Loader2 } from 'lucide-react'
import { profileSchema } from '../schemas/profileSchema'
import { z } from 'zod'

const Dashboard = () => {
  const { user, logout } = useAuthStore()
  const [dashboardView, setDashboardView] = useState('home') // 'home', 'profile'
  const [localLoading, setLocalLoading] = useState(false)
  const [formData, setFormData] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const validate = (schema, data) => {
      try {
        schema.parse(data)
        return true
      } catch (error) {
        return false
      }
    }

  const handleProfileUpdate = async (e) => {
      e.preventDefault()
      setLocalLoading(true)
      if(validate(profileSchema, formData)) {
          alert("Profile update simulated.")
      }
      setLocalLoading(false)
  }

  return (
      <div className="min-h-screen bg-[#f9fafb] flex flex-col w-full text-left font-sans">
        {/* Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 px-6 backdrop-blur-sm shadow-sm w-full">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
             <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <ShieldCheck size={20} />
             </div>
             <span>Draosan Dashboard</span>
          </div>
          <nav className="ml-auto flex items-center gap-4">
             <Button 
                variant={dashboardView === 'home' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setDashboardView('home')}
                className="gap-2"
             >
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">Dashboard</span>
             </Button>
             <Button 
                variant={dashboardView === 'profile' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setDashboardView('profile')}
                 className="gap-2"
             >
                <User size={16} />
                <span className="hidden sm:inline">Profile</span>
             </Button>
             <div className="h-6 w-px bg-border mx-2" />
             <Button variant="destructive" size="sm" onClick={logout} className="gap-2">
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
             </Button>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
           {dashboardView === 'home' ? (
               <div className="grid gap-6">
                  <div className="flex flex-col gap-2">
                     <h1 className="text-3xl font-heading tracking-tight text-foreground">Welcome back, {user?.name || 'User'}!</h1>
                     <p className="text-muted-foreground">Here's an overview of your account.</p>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                           <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           <div className="text-2xl font-bold">12</div>
                           <p className="text-xs text-muted-foreground">+2 from last month</p>
                        </CardContent>
                     </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                           <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           <div className="text-2xl font-bold">1</div>
                           <p className="text-xs text-muted-foreground">Current device</p>
                        </CardContent>
                     </Card>
                  </div>
               </div>
           ) : (
               <div className="max-w-2xl mx-auto">
                   <Card>
                       <CardHeader>
                           <CardTitle>Edit Profile</CardTitle>
                           <CardDescription>Update your personal information.</CardDescription>
                       </CardHeader>
                       <CardContent>
                           <form onSubmit={handleProfileUpdate} className="space-y-4">
                               <div className="grid gap-2">
                                   <label className="text-sm font-medium">Full Name</label>
                                   <Input name="full_name" defaultValue={user?.name} onChange={handleInputChange} />
                               </div>
                               <div className="grid gap-2">
                                   <label className="text-sm font-medium">Bio</label>
                                   <Input name="bio" placeholder="Tell us about yourself" onChange={handleInputChange} />
                               </div>
                               <Button type="submit" disabled={localLoading}>
                                   {localLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                   Save Changes
                               </Button>
                           </form>
                       </CardContent>
                   </Card>
               </div>
           )}
        </main>
      </div>
  )
}

export default Dashboard
