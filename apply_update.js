const fs = require('fs');

const indexCss = `@import "tailwindcss";
@config "../tailwind.config.js";

@layer base {
  :root {
    /* Fonts */
    --font-heading: "Playfair Display", serif;
    --font-body: "Poppins", sans-serif;

    /* Colors - Elegant White & Gold */
    --background: 0 0% 99%; /* Elegant White */
    --foreground: 0 0% 15%; /* Elegant Dark Charcoal */

    --card: 0 0% 100%;
    --card-foreground: 0 0% 15%;

    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 15%;

    --primary: 0 0% 98%; /* Elegant White */
    --primary-foreground: 0 0% 15%;

    --secondary: 43 65% 52%; /* Elegant Gold */
    --secondary-foreground: 0 0% 100%;

    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 40%;

    --accent: 43 65% 52%; /* Elegant Gold */
    --accent-foreground: 0 0% 100%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;

    --border: 0 0% 90%;
    --input: 0 0% 90%;
    --ring: 43 65% 52%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 0 0% 10%;
    --foreground: 0 0% 98%;
    --primary: 0 0% 15%;
    --primary-foreground: 0 0% 98%;
    --secondary: 43 65% 52%;
    --secondary-foreground: 0 0% 100%;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: var(--font-body);
    @apply bg-background text-foreground;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    font-weight: 600;
  }
}
`;

fs.writeFileSync('frontend/src/index.css', indexCss);

const landingPageJsx = \`import React, { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { ArrowRight, MapPin, Instagram, MessageCircle, ShoppingCart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../lib/api'
import useCartStore from '../stores/cartStore'
import { useToast } from '../components/ui/ToastProvider'

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const res = await api.get('/products?limit=6');
            setProducts(res.data.data.products);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
      try {
          await addItem(product);
          addToast(\\\`\${product.name} berhasil ditambahkan ke keranjang!\\\`, 'success');
      } catch (error) {
          if (error.message === "Login required to add items to cart.") {
              addToast("Anda harus login untuk menambahkan produk ke keranjang.", 'error');
              navigate('/login');
          } else {
              addToast(\\\`Gagal menambahkan \${product.name} ke keranjang.\\\`, 'error');
              console.error("Add to cart error:", error);
          }
      }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <header id="home" className="relative flex items-center justify-center min-h-[90vh]">
        {/* Background Image Overlay */}
        <div 
           className="absolute inset-0 z-0 bg-center bg-cover" 
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1414235077428-33898ed1e829?auto=format&fit=crop&q=80&w=2000')" }}
        >
           <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative z-10 max-w-4xl px-4 py-32 mx-auto space-y-6 text-center text-white">
          <p className="text-sm tracking-[0.3em] font-heading uppercase text-secondary animate-in fade-in slide-in-from-bottom-4">Serve Anytime Anywhere</p>
          <h1 className="text-5xl leading-tight font-heading md:text-7xl lg:text-8xl drop-shadow-md animate-in fade-in slide-in-from-bottom-6">
            D'raosan
          </h1>
          <p className="max-w-2xl mx-auto text-lg font-light leading-relaxed tracking-wide opacity-90 md:text-xl font-body animate-in fade-in slide-in-from-bottom-8">
            Kini pemesanan menu dan camilan favorit Anda dapat diakses kapanpun dan dimanapun.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-6 pt-10 sm:flex-row animate-in fade-in slide-in-from-bottom-10">
            <a href="#products">
                <Button size="lg" className="h-14 px-12 text-sm tracking-widest uppercase transition-all duration-300 border border-white hover:border-secondary rounded-none font-heading bg-transparent hover:bg-secondary text-white hover:text-white">
                  Menu & Order
                </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Our Story Section */}
      <section id="about" className="py-24 bg-background">
         <div className="px-4 mx-auto max-w-5xl text-center sm:px-6 lg:px-8">
            <h2 className="mb-12 text-4xl tracking-widest md:text-5xl font-heading text-foreground">OUR STORY</h2>
            
            <div className="mb-12">
               <img 
                  src="https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=1000" 
                  alt="Our Story" 
                  className="object-cover w-full h-[500px] shadow-md"
               />
            </div>
            
            <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground font-body">
               <p className="text-xl italic leading-relaxed tracking-wide text-foreground font-heading">
                  "D'raosan Kulinari Nusantara adalah usaha kuliner yang berdedikasi untuk memberikan pengalaman kuliner terbaik bagi para pelanggan."
               </p>
               <p className="text-lg leading-relaxed font-light">
                  Berawal dari dapur kecil, kami berkomitmen untuk melestarikan dan mengembangkan cita rasa otentik yang dapat dinikmati semua kalangan. Kami menggunakan bahan baku berkualitas untuk menghasilkan hidangan yang tidak hanya lezat tapi juga penuh memori.
               </p>
            </div>
         </div>
      </section>

      {/* Categories Strip */}
      <section className="py-16 border-t border-b bg-muted/20 border-muted">
         <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 whitespace-nowrap overflow-hidden text-center opacity-80">
                <div>
                    <h5 className="text-md tracking-widest uppercase font-heading text-foreground">NUSANTARA CUISINE</h5>
                </div>
                <div>
                    <h5 className="text-md tracking-widest uppercase font-heading text-foreground">DESSERTS</h5>
                </div>
                <div>
                    <h5 className="text-md tracking-widest uppercase font-heading text-foreground">LOCAL SNACKS</h5>
                </div>
                <div>
                    <h5 className="text-md tracking-widest uppercase font-heading text-foreground">PASTRIES</h5>
                </div>
            </div>
         </div>
      </section>

      {/* From Our Menu Section */}
      <section id="products" className="py-24 bg-background">
        <div className="px-4 mx-auto max-w-5xl sm:px-6 lg:px-8">
           <div className="mb-20 text-center">
             <h2 className="mb-6 text-4xl tracking-widest md:text-5xl font-heading text-foreground">FROM OUR MENU</h2>
             <div className="w-16 h-[2px] mx-auto bg-secondary"></div>
           </div>

           <div className="space-y-16">
              {loading ? (
                  <div className="py-12 text-center text-muted-foreground col-span-full font-heading tracking-widest">Loading menu...</div>
              ) : (
                  products.map((product, index) => (
                      <ProductListItem 
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        reverse={index % 2 !== 0}
                      />
                  ))
              )}
           </div>

           <div className="mt-24 text-center">
              <Link to="/menu">
                  <Button variant="outline" className="h-14 px-12 text-sm tracking-widest uppercase transition-all duration-300 border rounded-none border-foreground text-foreground hover:bg-foreground hover:text-white font-heading">
                     VIEW ALL MENU
                  </Button>
              </Link>
           </div>
        </div>
      </section>

      {/* Visit Our Stores/Contact Us Section */}
      <section id="contact" className="py-24 bg-muted/10 border-t border-muted">
         <div className="px-4 mx-auto max-w-4xl text-center sm:px-6 lg:px-8">
            <h2 className="mb-12 text-3xl tracking-widest md:text-4xl font-heading text-foreground">VISIT OUR STORES</h2>
            
            <div className="mb-12 space-y-6">
               <h5 className="text-xl tracking-widest uppercase font-heading text-foreground">D'RAOSAN CENTRE</h5>
               <address className="not-italic font-light text-muted-foreground font-body space-y-2">
                 <p>Jl. Goalpara No. 45, Kecamatan Sukabumi</p>
                 <p>Jawa Barat, Indonesia</p>
               </address>
               
               <div className="pt-4 space-y-2">
                   <a href="mailto:admin@draosan.id" className="block text-secondary hover:text-secondary/80 font-body">admin@draosan.id</a>
                   <p className="block font-light text-muted-foreground font-body">Office Open: Monday - Friday 08:00 am - 17:00 pm</p>
                   <p className="block font-light text-muted-foreground font-body">Restaurant Open: Everyday 07:00 am - 22:00 pm</p>
               </div>
            </div>

            <div className="flex justify-center gap-8">
                <a href="javascript:void(0)" onClick={()=>addToast('Coming Soon!', 'info')} className="transition-colors text-foreground hover:text-secondary tracking-widest uppercase text-sm font-heading">
                    Facebook
                </a>
                <a href="javascript:void(0)" onClick={()=>addToast('Coming Soon!', 'info')} className="transition-colors text-foreground hover:text-secondary tracking-widest uppercase text-sm font-heading">
                    Instagram
                </a>
                <a href="javascript:void(0)" onClick={()=>addToast('Coming Soon!', 'info')} className="transition-colors text-foreground hover:text-secondary tracking-widest uppercase text-sm font-heading">
                    Tokopedia
                </a>
            </div>
         </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-8 bg-background border-t border-muted text-center text-xs tracking-widest font-light uppercase text-muted-foreground font-heading">
         © 2026 D'raosan. All rights reserved.
      </footer>
    </div>
  )
}

function ProductListItem({ product, onAddToCart, reverse }) {
   return (
      <div className={\`flex flex-col gap-8 md:gap-12 md:items-center \${reverse ? 'md:flex-row-reverse' : 'md:flex-row'}\`}>
         <div className="w-full h-80 md:w-1/2 md:h-80 flex-shrink-0 bg-muted overflow-hidden relative group">
             <img 
               src={product.image_url || 'https://placehold.co/600'} 
               alt={product.name} 
               className="absolute inset-0 object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105"
             />
         </div>
         <div className={\`flex-1 space-y-6 \${reverse ? 'md:text-right' : 'md:text-left'}\`}>
            <div>
                 <h6 className="text-2xl mb-2 tracking-widest uppercase font-heading text-foreground">{product.name}</h6>
                 <div className="w-12 h-[1px] bg-secondary opacity-50 my-4 inline-block"></div>
                 <div className="text-xl font-medium text-secondary font-heading tracking-wider">
                    {product.price.toLocaleString()} IDR
                 </div>
            </div>
            
            <p className="text-muted-foreground font-light leading-relaxed font-body">
               {product.description || 'Pilihan spesial dari menu kami yang wajib Anda nikmati, disiapkan secara cermat untuk pengalaman rasa yang memuaskan.'}
            </p>
            
            <div>
               <Button 
                   onClick={() => onAddToCart(product)}
                   variant="outline"
                   className="mt-4 rounded-none h-12 px-8 tracking-widest uppercase text-xs font-heading border-foreground text-foreground hover:bg-foreground hover:text-background"
               >
                   ORDER NOW
               </Button>
            </div>
         </div>
      </div>
   )
}
\`

fs.writeFileSync('frontend/src/pages/LandingPage.jsx', landingPageJsx);
