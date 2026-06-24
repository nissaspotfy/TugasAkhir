import { useState } from 'react'
import useAuthStore from '../../stores/authStore'
import { registerSchema } from '../../schemas/authSchema'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const Register = () => {
  const { register, isLoading, error: authError } = useAuthStore()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validate = (schema, data) => {
    try {
      schema.parse(data)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {}
        error.errors.forEach(err => {
          fieldErrors[err.path[0]] = err.message
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (validate(registerSchema, formData)) {
      try {
        // registerSchema expects "username" but backend register expects "name"
        // mapping username to name for backend payload
        await register({
            name: formData.username, 
            email: formData.email, 
            password: formData.password,
            confirm_password: formData.confirmPassword
        })
        // On success, redirect to login
        navigate('/login') 
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-4 font-sans">
      <div className="w-full max-w-[350px] space-y-6">
         <div className="text-left mb-4">
            <Link to="/">
                <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Beranda
                </Button>
            </Link>
         </div>

         <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-heading font-bold tracking-tight text-primary">
              Buat akun baru
            </h1>
            <p className="text-sm text-muted-foreground">
              Masukkan data diri Anda untuk memulai.
            </p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Nama Pengguna</label>
                <Input 
                    name="username"
                    placeholder="johndoe" 
                    onChange={handleInputChange}
                    value={formData.username}
                />
                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Email</label>
                <Input 
                    name="email"
                    type="email" 
                    placeholder="name@example.com" 
                    onChange={handleInputChange} 
                    value={formData.email}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Kata Sandi</label>
                <Input 
                    name="password"
                    type="password" 
                    placeholder="••••••••" 
                    onChange={handleInputChange}
                    value={formData.password}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Konfirmasi Kata Sandi</label>
                <Input 
                    name="confirmPassword"
                    type="password" 
                    placeholder="••••••••" 
                    onChange={handleInputChange}
                    value={formData.confirmPassword}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              {authError && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                      {authError}
                  </div>
              )}

              <Button type="submit" className="w-full font-bold rounded-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buat Akun
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
         </form>

         <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#f9fafb] px-2 text-muted-foreground">Atau</span>
            </div>
         </div>

         <div className="text-center text-sm text-muted-foreground">
            <p>
              Sudah punya akun?{' '}
              <Link to="/login" className="underline underline-offset-4 hover:text-primary font-bold text-primary">
                  Masuk
              </Link>
            </p>
         </div>
      </div>
    </div>
  )
}

export default Register
