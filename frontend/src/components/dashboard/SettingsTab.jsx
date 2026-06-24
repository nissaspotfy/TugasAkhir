import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Loader2, Camera, Pencil, X } from 'lucide-react'
import { profileSchema } from '../../schemas/profileSchema'
import useAuthStore, { getUserRole } from '../../stores/authStore'
import { useToast } from '../ui/ToastProvider'
import api from '../../lib/api'

export function SettingsTab({ user }) {
    const [localLoading, setLocalLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({})
    const [previewImage, setPreviewImage] = useState(user?.profilePicture || null)
    const [selectedFile, setSelectedFile] = useState(null)
    const fileInputRef = useRef(null)
    const setUser = useAuthStore(state => state.setUser)
    const logout = useAuthStore(state => state.logout)
    const { addToast } = useToast()

    const [notificationPromo, setNotificationPromo] = useState(true)
    const [notificationStatus, setNotificationStatus] = useState(true)
    const [isStoreOpen, setIsStoreOpen] = useState(true)
    const [settingsLoading, setSettingsLoading] = useState(false)
    
    // Fetch profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                if (res.data.data) {
                    const prof = res.data.data;
                    setFormData({
                        full_name: prof.full_name || '',
                        bio: prof.bio || '',
                        email: prof.email || ''
                    });
                    if (prof.profilePicture) {
                        setPreviewImage(prof.profilePicture);
                    }
                    if (prof.notification_promo !== undefined) {
                        setNotificationPromo(prof.notification_promo);
                    }
                    if (prof.notification_status !== undefined) {
                        setNotificationStatus(prof.notification_status);
                    }
                }
            } catch (e) {
                console.error('Error fetching profile:', e);
            }
        };

        const fetchStoreStatus = async () => {
            try {
                const res = await api.get('/settings/store-status');
                setIsStoreOpen(res.data.data.isOpen);
            } catch (e) {
                console.error('Error fetching store status:', e);
            }
        };

        fetchProfile();
        if (getUserRole(user) === 'admin') {
            fetchStoreStatus();
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewImage(reader.result)
            }
            reader.readAsDataURL(file)
        }
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
        
        try {
            const data = new FormData();
            if (formData.full_name) data.append("full_name", formData.full_name);
            if (formData.bio) data.append("bio", formData.bio);
            if (formData.email) data.append("email", formData.email);
            if (selectedFile) data.append("profile_picture", selectedFile);

            const res = await api.put('/users/update-profile', data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            const updatedProfile = res.data.data;
            
            // Update auth store
            if (typeof setUser === 'function' && user) {
                setUser({
                    ...user,
                    name: updatedProfile.full_name || formData.full_name || user.name,
                    email: updatedProfile.email || formData.email || user.email,
                    bio: updatedProfile.bio || formData.bio || user.bio,
                    profilePicture: updatedProfile.profilePicture || previewImage
                });
            }
            
            addToast("Profil berhasil diubah dan disimpan ke database!", "success")
            setIsEditing(false)
        } catch (error) {
            console.error('Error updating profile:', error);
            addToast("Terjadi kesalahan, gagal menyimpan profil.", "error")
        } finally {
            setLocalLoading(false)
        }
    }

    const handleToggleNotification = async (type, val) => {
        try {
            if (type === 'promo') {
                setNotificationPromo(val);
            } else {
                setNotificationStatus(val);
            }

            const data = new FormData();
            data.append(type === 'promo' ? 'notification_promo' : 'notification_status', val);

            await api.put('/users/update-profile', data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            addToast("Preferensi notifikasi berhasil diperbarui!", "success");
        } catch (error) {
            console.error('Error updating notification preference:', error);
            addToast("Gagal memperbarui preferensi notifikasi.", "error");
        }
    };

    const handleToggleStoreStatus = async (isOpenVal) => {
        setSettingsLoading(true);
        try {
            const res = await api.put('/settings/store-status', { isOpen: isOpenVal });
            setIsStoreOpen(res.data.data.isOpen);
            addToast(`Toko berhasil ${isOpenVal ? 'DIBUKA' : 'DITUTUP'}!`, "success");
        } catch (err) {
            console.error("Failed to update store status", err);
            addToast("Gagal memperbarui status operasional toko.", "error");
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "Apakah Anda yakin ingin menghapus akun Anda? Seluruh riwayat pesanan, keranjang, alamat, dan data profil Anda akan dihapus secara permanen dari sistem kami. Tindakan ini tidak dapat dibatalkan."
        );
        if (!confirmed) return;

        setLocalLoading(true);
        try {
            await api.delete('/users/delete-account');
            addToast("Akun Anda telah berhasil dihapus secara permanen.", "success");
            logout();
            window.location.href = '/login';
        } catch (err) {
            console.error("Failed to delete account", err);
            addToast("Gagal menghapus akun. Silakan coba lagi.", "error");
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto w-full relative space-y-6">
        <Card className="border-none shadow-lg">
            <CardHeader className="relative">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="font-heading text-2xl">Profil Anda</CardTitle>
                        <CardDescription>Informasi pribadi dan foto profil.</CardDescription>
                    </div>
                    {!isEditing ? (
                        <button 
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="p-3 bg-primary/10 hover:bg-primary/20 rounded-full text-primary transition-colors border border-primary/20 shadow-sm"
                            title="Edit Profil"
                        >
                            <Pencil size={20} />
                        </button>
                    ) : (
                        <button 
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="p-3 bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition-colors border border-red-200 shadow-sm"
                            title="Batalkan Edit"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center justify-center gap-2 mb-6">
                        <div className="relative group">
                            <div className={`w-32 h-32 rounded-full overflow-hidden bg-secondary border-4 shadow-md flex items-center justify-center relative transition-colors ${isEditing ? 'border-primary' : 'border-white'}`}>
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="absolute inset-0 w-full h-full object-cover object-center" />
                                ) : (
                                    <span className="text-4xl font-bold text-muted-foreground">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                                )}
                            </div>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors border-2 border-white animate-in"
                                >
                                    <Camera size={18} />
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="text-center mt-2">
                            <h3 className="font-bold text-foreground text-xl">{user?.name || "Pengguna"}</h3>
                            {isEditing && <p className="text-sm text-primary font-medium mt-1">Ketuk ikon kamera untuk mengubah foto</p>}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-bold text-foreground">Nama Lengkap</label>
                        <Input 
                            name="full_name" 
                            disabled={!isEditing}
                            value={formData.full_name !== undefined ? formData.full_name : (user?.name || "")} 
                            onChange={handleInputChange} 
                            className={`transition-all outline-none ${!isEditing ? 'bg-secondary/10 border-border/50 text-foreground cursor-default' : 'bg-white border-border focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20'}`} 
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-bold text-foreground">Bio Singkat</label>
                        <Input 
                            name="bio" 
                            disabled={!isEditing}
                            value={formData.bio !== undefined ? formData.bio : (user?.bio || "")} 
                            placeholder={isEditing ? "Ceritakan sedikit tentangmu..." : ""} 
                            onChange={handleInputChange} 
                            className={`transition-all outline-none ${!isEditing ? 'bg-secondary/10 border-border/50 text-foreground cursor-default' : 'bg-white border-border focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20'}`} 
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-bold text-foreground">Email</label>
                        <Input 
                            name="email" 
                            disabled={!isEditing}
                            value={formData.email !== undefined ? formData.email : (user?.email || "")} 
                            onChange={handleInputChange} 
                            className={`transition-all outline-none ${!isEditing ? 'bg-secondary/10 border-border/50 text-foreground cursor-default' : 'bg-white border-border focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20'}`} 
                        />
                    </div>
                    
                    {isEditing && (
                        <div className="pt-6 flex justify-center animate-in slide-in-from-bottom-2 fade-in duration-200">
                            <Button type="submit" disabled={localLoading} className="rounded-full px-12 bg-primary font-bold hover:bg-primary/90 w-full sm:w-auto">
                                {localLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan Perubahan
                            </Button>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>

        {/* 1. Customer Settings (Preferences & Deletion) */}
        {getUserRole(user) !== 'admin' && (
            <Card className="border-none shadow-lg overflow-hidden transition-all hover:shadow-xl border-t border-red-100">
                <CardHeader className="bg-gradient-to-r from-red-50/20 to-white border-b border-border/40 py-5">
                    <CardTitle className="font-heading text-lg font-bold text-red-600">Manajemen Data & Privasi</CardTitle>
                    <CardDescription>Kelola data akun Anda dan hak untuk dilupakan.</CardDescription>
                </CardHeader>
                <CardContent className="py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="max-w-md">
                        <p className="font-bold text-sm text-slate-800">Hapus Akun Permanen</p>
                        <p className="text-xs text-muted-foreground">Menghapus semua data profil, alamat, keranjang belanja, serta riwayat pesanan secara permanen dari server kami.</p>
                    </div>
                    <Button 
                        type="button"
                        onClick={handleDeleteAccount}
                        className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-full font-bold px-6 text-xs transition-colors py-2 h-auto"
                    >
                        Ajukan Penghapusan Akun
                    </Button>
                </CardContent>
            </Card>
        )}

        {/* 2. Admin Settings (Store Operational Toggle) */}
        {getUserRole(user) === 'admin' && (
            <Card className="border-none shadow-lg overflow-hidden transition-all hover:shadow-xl">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-border/40 py-5">
                    <CardTitle className="font-heading text-lg font-bold text-slate-800">Manajemen Jam Operasional</CardTitle>
                    <CardDescription>Atur status buka dan tutup operasional warung D'raosan saat ini.</CardDescription>
                </CardHeader>
                <CardContent className="py-5 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-sm text-slate-800 flex items-center gap-2">
                            Status Toko: 
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${isStoreOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isStoreOpen ? 'Buka' : 'Tutup'}
                            </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-md">
                            Gunakan toggle ini jika sedang libur atau bahan baku habis. Jika ditutup, tombol Checkout pelanggan akan otomatis dinonaktifkan (abu-abu).
                        </p>
                    </div>
                    <button
                        type="button"
                        disabled={settingsLoading}
                        onClick={() => handleToggleStoreStatus(!isStoreOpen)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${isStoreOpen ? 'bg-green-600' : 'bg-red-500'} ${settingsLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isStoreOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </CardContent>
            </Card>
        )}
        </div>
    )
}