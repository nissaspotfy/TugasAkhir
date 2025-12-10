import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'
import { profileSchema } from '../../schemas/profileSchema'

export function SettingsTab({ user, localLoading, setLocalLoading }) {
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
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            alert("Profile update simulated.")
        }
        setLocalLoading(false)
    }

    return (
        <div className="max-w-2xl">
        <Card className="border-none shadow-lg">
            <CardHeader>
                <CardTitle className="font-heading text-2xl">Edit Profil</CardTitle>
                <CardDescription>Perbarui informasi pribadimu di sini.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid gap-2">
                        <label className="text-sm font-bold text-foreground">Nama Lengkap</label>
                        <Input name="full_name" defaultValue={user?.name} onChange={handleInputChange} className="bg-secondary/20 border-border focus:ring-primary" />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-bold text-foreground">Bio Singkat</label>
                        <Input name="bio" placeholder="Ceritakan sedikit tentangmu..." onChange={handleInputChange} className="bg-secondary/20 border-border focus:ring-primary" />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-bold text-foreground">Email</label>
                        <Input value={user?.email} disabled className="bg-muted text-muted-foreground" />
                    </div>
                    <div className="pt-4">
                        <Button type="submit" disabled={localLoading} className="rounded-full px-8 bg-primary font-bold hover:bg-primary/90">
                            {localLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
        </div>
    )
}