import { useState, useEffect } from 'react';
import useAuthStore, { getUserRole } from '../../stores/authStore';
import useCartStore from '../../stores/cartStore';
import { loginSchema, registerSchema } from '../../schemas/authSchema';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../components/ui/ToastProvider';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);

  // Sync state with URL path
  useEffect(() => {
    // Clear any previous authentication errors when switching pages
    useAuthStore.setState({ error: null });

    if (location.pathname === '/register') {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, [location.pathname]);

  // Handler to switch modes
  const handleModeSwitch = (mode) => {
    if (mode === 'signup') {
      navigate('/register');
    } else {
      navigate('/login');
    }
  };

  // --- Login Logic ---
  const { login, register: registerUser, isLoading, error: authError } = useAuthStore();
  const { isAuthenticated, user } = useAuthStore();
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    if (isAuthenticated) {
      if (getUserRole(user) === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({});

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (loginErrors[name]) setLoginErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse(loginData);
    if (!validation.success) {
        const fieldErrors = {};
        
        // Zod v3 uses .errors, Zod v4 might use .issues
        const issues = validation.error.errors || validation.error.issues;

        if (issues) {
             issues.forEach(err => { fieldErrors[err.path[0]] = err.message; });
        } else if (Array.isArray(validation.error)) {
             validation.error.forEach(err => { fieldErrors[err.path[0]] = err.message; });
        } else {
             console.error("Unknown validation error structure", validation);
        }
        setLoginErrors(fieldErrors);
        return;
    }
    
    setLoginErrors({});
    
    try {
      await login(loginData.email, loginData.password);
      try {
        await fetchCart();
      } catch (err) {
        console.error("Cart fetch failed but login succeeded", err);
      }
      
      const currentUser = useAuthStore.getState().user;
      if (getUserRole(currentUser) === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- Register Logic ---
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [registerErrors, setRegisterErrors] = useState({});

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    if (registerErrors[name]) setRegisterErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    const validation = registerSchema.safeParse(registerData);
    if (!validation.success) {
        const fieldErrors = {};
        const issues = validation.error.errors || validation.error.issues;
        
        if (issues) {
            issues.forEach(err => { fieldErrors[err.path[0]] = err.message; });
        } else {
             console.error("Register validation error structure unknown", validation);
        }
        setRegisterErrors(fieldErrors);
        return;
    }

    setRegisterErrors({});
    
    try {
      await registerUser({
        name: registerData.username,
        email: registerData.email,
        password: registerData.password,
        confirm_password: registerData.confirmPassword
      });
      // After successful register, switch to login view automatically
      addToast('Pendaftaran berhasil! Silakan masuk.', 'success');
      // Clear forms
      setRegisterData({ username: '', email: '', password: '', confirmPassword: '' });
      setLoginData({ email: '', password: '' });
      navigate('/login');
    } catch (error) {
      if (error.response?.status === 409) {
        addToast('Email sudah terdaftar. Silakan gunakan email lain.', 'error');
        setRegisterErrors(prev => ({ ...prev, email: 'Email sudah terdaftar. Silakan gunakan email lain.' }));
      } else {
        console.error(error);
        const errMsg = error.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.';
        addToast(errMsg, 'error');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-background font-sans flex items-center justify-center p-4">
       <div className={`relative bg-white rounded-[2rem] shadow-2xl overflow-hidden max-w-[1000px] w-full min-h-[600px] flex flex-col md:block ${isSignUp ? 'right-panel-active' : ''}`}>
          
          {/* Mobile Toggle (Visible only on small screens) */}
          <div className="md:hidden flex justify-center p-4 gap-4 z-50 bg-white relative">
             <button 
               onClick={() => handleModeSwitch('signin')}
               className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${!isSignUp ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
             >
               Masuk
             </button>
             <button 
               onClick={() => handleModeSwitch('signup')}
               className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${isSignUp ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
             >
               Daftar
             </button>
          </div>

          {/* Sign Up Form Container */}
          <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out md:w-1/2 w-full
              ${isSignUp ? 'md:translate-x-full md:opacity-100 md:z-50 block md:visible pointer-events-auto' : 'md:opacity-0 md:z-0 hidden md:block md:invisible pointer-events-none'}
              left-0
              ${!isSignUp ? 'hidden' : ''} md:flex
          `}>
             <form onSubmit={handleRegisterSubmit} className="bg-white flex flex-col items-center justify-center h-full px-8 text-center space-y-4 w-full">
                <h1 className="text-3xl font-heading font-bold text-primary">Buat Akun</h1>
                <p className="text-sm text-muted-foreground mb-4">Gunakan email Anda untuk pendaftaran</p>
                
                <fieldset disabled={!isSignUp} className="w-full space-y-3 max-w-xs text-left">
                    <div>
                        <Input name="username" placeholder="Nama" value={registerData.username} onChange={handleRegisterChange} className="bg-gray-100 border-none" />
                        {registerErrors.username && <span className="text-xs text-red-500 ml-1">{registerErrors.username}</span>}
                    </div>
                    <div>
                        <Input name="email" type="email" placeholder="Email" value={registerData.email} onChange={handleRegisterChange} className="bg-gray-100 border-none" />
                        {registerErrors.email && <span className="text-xs text-red-500 ml-1">{registerErrors.email}</span>}
                    </div>
                    <div>
                        <Input name="password" type="password" placeholder="Kata Sandi" value={registerData.password} onChange={handleRegisterChange} className="bg-gray-100 border-none" />
                        {registerErrors.password && <span className="text-xs text-red-500 ml-1">{registerErrors.password}</span>}
                    </div>
                     <div>
                        <Input name="confirmPassword" type="password" placeholder="Konfirmasi Kata Sandi" value={registerData.confirmPassword} onChange={handleRegisterChange} className="bg-gray-100 border-none" />
                        {registerErrors.confirmPassword && <span className="text-xs text-red-500 ml-1">{registerErrors.confirmPassword}</span>}
                    </div>
                </fieldset>

                {authError && <div className="text-xs text-red-500">{authError}</div>}

                <Button type="submit" className="rounded-full px-12 font-bold uppercase tracking-wider mt-4" disabled={isLoading || !isSignUp}>
                   {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Daftar'}
                </Button>
             </form>
          </div>

          {/* Sign In Form Container */}
          <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out md:w-1/2 w-full
              ${isSignUp ? 'md:translate-x-full md:opacity-0 md:invisible pointer-events-none' : 'md:z-20 md:opacity-100 md:visible pointer-events-auto'}
              left-0
              ${isSignUp ? 'hidden' : ''} md:flex
          `}>
             <form onSubmit={handleLoginSubmit} className="bg-white flex flex-col items-center justify-center h-full px-8 text-center space-y-6 w-full">
                <div className="absolute top-6 left-6">
                    <Link to="/">
                        <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent text-muted-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Beranda
                        </Button>
                    </Link>
                </div>

                <h1 className="text-3xl font-heading font-bold text-primary">Masuk</h1>
                <p className="text-sm text-muted-foreground mb-4">Gunakan akun Anda</p>
                
                <fieldset disabled={isSignUp} className="w-full space-y-3 max-w-xs text-left">
                    <div>
                        <Input name="email" type="email" placeholder="Email" value={loginData.email} onChange={handleLoginChange} onKeyDown={(e) => { if (e.key === 'Enter') handleLoginSubmit(e); }} className="bg-gray-100 border-none" />
                        {loginErrors.email && <span className="text-xs text-red-500 ml-1">{loginErrors.email}</span>}
                    </div>
                    <div>
                        <Input name="password" type="password" placeholder="Kata Sandi" value={loginData.password} onChange={handleLoginChange} onKeyDown={(e) => { if (e.key === 'Enter') handleLoginSubmit(e); }} className="bg-gray-100 border-none" />
                        {loginErrors.password && <span className="text-xs text-red-500 ml-1">{loginErrors.password}</span>}
                    </div>
                </fieldset>

                <div className="text-xs text-muted-foreground">
                    <Link to="/forgot-password" className="hover:text-primary transition-colors">Lupa kata sandi?</Link>
                </div>

                {authError && <div className="text-xs text-red-500">{authError}</div>}

                <Button type="submit" className="rounded-full px-12 font-bold uppercase tracking-wider mt-4" disabled={isLoading || isSignUp}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Masuk'}
                </Button>
             </form>
          </div>

          {/* Overlay Container (The slider) - Hidden on Mobile */}
          <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-[100] hidden md:block
               ${isSignUp ? '-translate-x-full' : ''}
          `}>
              <div className={`bg-primary text-white relative -left-full h-full w-[200%] transform transition-transform duration-700 ease-in-out flex
                  ${isSignUp ? 'translate-x-1/2' : 'translate-x-0'}
              `}>
                  
                  {/* Left Overlay Panel (Visible when Sign In is Active -> Shows "Hello, Friend" to prompt Sign Up) 
                      WAIT. 
                      Standard Pattern:
                      - If showing Login Form (Left), Overlay is on Right. Overlay Right Panel is visible. 
                      - If showing Register Form (Right), Overlay is on Left. Overlay Left Panel is visible.
                  */}
                  
                  {/* Overlay Left (For returning users, visible when Slider is on Left side i.e., SignUp form is active) */}
                  <div className={`w-1/2 flex flex-col items-center justify-center px-8 text-center h-full transform transition-transform duration-700 ease-in-out
                      ${isSignUp ? 'translate-x-0' : '-translate-x-[20%]'}
                  `}>
                      <div 
                        className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-multiply"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')" }}
                      />
                      <div className="relative z-10 max-w-xs">
                        <h1 className="text-4xl font-heading font-bold mb-4">Selamat Datang Kembali!</h1>
                        <p className="text-lg font-medium mb-8">Untuk tetap terhubung dengan kami, silakan masuk dengan informasi pribadi Anda</p>
                        <Button 
                            variant="outline" 
                            className="bg-transparent border-white text-white hover:bg-white hover:text-primary rounded-full px-12 py-6 font-bold uppercase tracking-wider text-base"
                            onClick={() => handleModeSwitch('signin')}
                        >
                            Masuk
                        </Button>
                      </div>
                  </div>

                  {/* Overlay Right (For new users, visible when Slider is on Right side i.e., SignIn form is active) */}
                  <div className={`w-1/2 flex flex-col items-center justify-center px-8 text-center h-full transform transition-transform duration-700 ease-in-out
                       ${isSignUp ? 'translate-x-[20%]' : 'translate-x-0'}
                  `}>
                      <div 
                        className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-multiply"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2070&auto=format&fit=crop')" }}
                      />
                      <div className="relative z-10 max-w-xs">
                        <h1 className="text-4xl font-heading font-bold mb-4">Halo, Teman!</h1>
                        <p className="text-lg font-medium mb-8">Masukkan data diri Anda dan mulai perjalanan bersama kami</p>
                        <Button 
                            variant="outline" 
                            className="bg-transparent border-white text-white hover:bg-white hover:text-primary rounded-full px-12 py-6 font-bold uppercase tracking-wider text-base"
                            onClick={() => handleModeSwitch('signup')}
                        >
                            Daftar
                        </Button>
                      </div>
                  </div>

              </div>
          </div>

       </div>
    </div>
  );
};

export default AuthPage;
