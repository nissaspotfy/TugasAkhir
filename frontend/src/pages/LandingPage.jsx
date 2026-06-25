import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import {
  ArrowRight,
  Star,
  Utensils,
  Leaf,
  Clock,
  ShieldCheck,
  Heart,
  ShoppingCart,
  MapPin,
  Wallet,
  Truck,
  Smartphone,
  Quote
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../lib/api';
import useCartStore from '../stores/cartStore';
import useAuthStore, { getUserRole } from '../stores/authStore';
import { useToast } from '../components/ui/ToastProvider';
import { getFallbackFoodImage, handleImageError } from '../lib/imageFallback';

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && getUserRole(user) === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch top 4 products for Bestsellers
        const res = await api.get('/products?limit=4');
        setProducts(res.data.data.products);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchReviews = async () => {
      try {
        const res = await api.get('/reviews/homepage');
        setReviews(res.data.data);
      } catch (error) {
        console.error("Failed to fetch homepage reviews", error);
      }
    };
    fetchProducts();
    fetchReviews();
  }, []);

  const handleAddToCart = async (product) => {
    try {
      await addItem(product);
      addToast(`${product.name} berhasil ditambahkan ke keranjang!`, 'success');
    } catch (error) {
      if (error.message === "Login required to add items to cart.") {
        addToast("Anda harus login untuk menambahkan produk ke keranjang.", 'error');
        navigate('/login');
      } else {
        addToast(`Gagal menambahkan ${product.name} ke keranjang.`, 'error');
        console.error("Add to cart error:", error);
      }
    }
  };

  const handleInstallApp = () => {
    addToast("Untuk instalasi: Klik tombol menu browser Anda (titik tiga atau bagi) dan pilih 'Tambahkan ke Layar Utama' / 'Instal Aplikasi'.", "info");
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden font-sans bg-background">
      <Navbar />

      {/* Hero Section */}
      <header id="home" className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-24 overflow-hidden bg-slate-950 text-white">
        {/* Background Image Container with Ken Burns zoom animation */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
          <img
            src="/tomyum_hero_banner.png"
            alt="D'raosan Tom Yum Special"
            className="w-full h-full object-cover object-center opacity-65 scale-105 animate-bg-zoom filter brightness-75 contrast-[1.05]"
          />
          {/* Gradient overlays to guarantee maximum readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/75"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-slate-950/50"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 text-xs font-black tracking-wider uppercase border rounded-full bg-white/10 border-white/20 text-yellow-300 animate-pulse mb-5 drop-shadow-md">
            <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
            <span>Menu Spesial Tom Yum</span>
          </div>

          <h1 className="text-2xl leading-tight font-heading sm:text-4xl lg:text-5xl drop-shadow-2xl font-black text-white uppercase max-w-3xl mx-auto mb-5">
            Rasa Autentik,<br />
            Pesan Cuma Sekali Klik.<br />
            <span className="inline-block transform text-gradient-crimson-spark -rotate-1 mt-1">Bebas Antre!</span>
          </h1>

          <p className="max-w-xl mx-auto text-xs sm:text-sm md:text-base font-medium leading-relaxed text-slate-200 drop-shadow-md mb-6">
            Temukan berbagai pilihan menu istimewa yang dimasak dengan bahan terbaik oleh koki lokal. Tanpa perantara, tanpa biaya tambahan. Harga jujur, rasa enaknya tiada tanding!
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <a href="#bestsellers">
              <Button className="bg-gradient-to-r from-[#B91C1C] via-[#E11D48] to-[#F59E0B] hover:from-[#9c1818] hover:via-[#c7173e] hover:to-[#db8c0a] text-white rounded-full px-8 h-11 text-base font-heading shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 font-bold">
                Pesan Sekarang
              </Button>
            </a>
            <Link to="/menu">
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-slate-950 rounded-full px-8 h-11 text-base font-heading shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-bold bg-transparent">
                Lihat Menu
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Strip */}
      <section className="relative z-10 py-6 bg-background">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-around gap-8 p-8 shadow-inner bg-secondary/50 rounded-3xl">
            <FeatureItem icon={<Leaf />} text="Bahan Alami" />
            <div className="hidden w-px h-12 md:block bg-primary/20"></div>
            <FeatureItem icon={<ShieldCheck />} text="100% Halal" />
            <div className="hidden w-px h-12 md:block bg-primary/20"></div>
            <FeatureItem icon={<Clock />} text="Produksi Harian" />
            <div className="hidden w-px h-12 md:block bg-primary/20"></div>
            <FeatureItem icon={<Heart />} text="Buatan Lokal" />
          </div>
        </div>
      </section>

      {/* Top Picks / Bestseller Section */}
      <section id="bestsellers" className="py-20 bg-background">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center space-y-3">
            <h2 className="text-3xl font-heading font-black text-slate-800 tracking-tight md:text-4xl">
              Menu Terfavorit (Bestsellers)
            </h2>
            <p className="max-w-xl mx-auto text-sm text-slate-500 font-medium">
              Menu paling laris yang disukai oleh ratusan pelanggan setia kami di Goalpara.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <div className="py-12 text-center col-span-full text-slate-500">Memuat menu terfavorit...</div>
            ) : (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))
            )}
          </div>

          <div className="mt-16 text-center">
            <Link to="/menu">
              <Button variant="outline" className="h-12 px-8 text-sm font-black transition-all border-2 rounded-full border-primary text-primary hover:bg-primary hover:text-white">
                Lihat Semua Menu
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl font-heading font-black text-slate-800 tracking-tight md:text-4xl">
              Cara Pesan Mudah & Cepat
            </h2>
            <p className="max-w-xl mx-auto text-sm text-slate-500 font-medium">
              Tiga langkah sederhana menikmati kuliner khas kami langsung dari dapur ke meja Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-[#E11D48] flex items-center justify-center">
                <Utensils size={28} />
              </div>
              <h3 className="text-lg font-heading font-black text-slate-800">Pilih Hidangan Favorit</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Jelajahi beragam kuliner terbaik dari menu otentik Sunda yang menggugah selera makan Anda.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-[#F59E0B] flex items-center justify-center">
                <Wallet size={28} />
              </div>
              <h3 className="text-lg font-heading font-black text-slate-800">Bayar Cepat & Aman</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Transaksi aman & otomatis terverifikasi menggunakan Midtrans dengan QRIS, Gopay, atau Transfer Bank.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Truck size={28} />
              </div>
              <h3 className="text-lg font-heading font-black text-slate-800">Pesanan Siap Dinikmati</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Makanan dimasak hangat dan siap disajikan langsung untuk diantar atau diambil sendiri ke outlet kami.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Social Proof (Testimonials) Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl font-heading font-black text-slate-800 tracking-tight md:text-4xl">
              Ulasan Pelanggan Setia
            </h2>
            <p className="max-w-xl mx-auto text-sm text-slate-500 font-medium">
              Kepercayaan Anda adalah prioritas utama kami. Berikut ulasan jujur dari mereka.
            </p>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] max-w-md mx-auto">
              <Quote className="text-rose-100 w-10 h-10 mx-auto mb-4" />
              <p className="text-sm text-slate-500 font-medium">Belum ada ulasan pelanggan yang ditampilkan di Beranda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all duration-300">
                  <Quote className="text-rose-200 w-10 h-10 flex-shrink-0" />
                  <p className="text-sm text-slate-600 leading-relaxed italic flex-1">
                    "{rev.comment || 'Tidak ada komentar tertulis.'}"
                  </p>
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{rev.customer?.name || 'Pelanggan'}</span>
                    <div className="flex text-yellow-400 gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={12} className="fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* App Promo Banner */}
      <section className="py-12 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-slate-800 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-8 py-12 sm:px-12">
              {/* Left Text */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200/50 rounded-full text-xs font-semibold text-slate-600 tracking-wider">
                  <Smartphone size={14} /> Mobile App Experience
                </div>
                <h2 className="text-3xl sm:text-4xl font-heading font-black leading-tight text-slate-900">
                  Akses D'raosan Lebih Cepat dari Layar HP Anda
                </h2>
                <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
                  Tambahkan aplikasi web D'raosan ke layar utama smartphone Anda dan nikmati pemesanan instan tanpa perlu mengunduh apa pun dari App Store.
                </p>
                <div className="pt-2">
                  <Button
                    onClick={handleInstallApp}
                    className="bg-[#bf3843] hover:bg-[#a32f38] text-white rounded-full px-8 py-3.5 h-auto text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    Tambahkan ke Layar Utama
                  </Button>
                </div>
              </div>

              {/* Right Phone Mockup */}
              <div className="lg:col-span-5 flex justify-center items-end self-end lg:-mb-12 z-10">
                <div className="w-64 h-64 sm:w-80 sm:h-80 relative">
                  <img
                    src="/iphone_mockup.png"
                    alt="iPhone app mockup"
                    className="w-full h-full object-contain drop-shadow-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map / Hubungi Kami Section */}
      <section id="contact" className="py-16 bg-[#0a111a] text-white border-t border-[#0a111a] w-full">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-[2rem]"></div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15843.468840742183!2d106.94056261550993!3d-6.906527581566896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6835de38ad6f59%3A0xe1ac6dbdd93060f6!2sGoalpara%2C%20Kec.%20Sukaraja%2C%20Kabupaten%20Sukabumi%2C%20Jawa%20Barat!5e0!3m2!1sid!2sid!4v1715525547466!5m2!1sid!2sid"
                className="relative w-full h-[350px] rounded-[2rem] shadow-xl border-4 border-white/20"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Draosan"
              ></iframe>
            </div>
            <div className="space-y-6 text-white">
              <h2 className="text-4xl font-heading md:text-5xl text-white">Kunjungi D'raosan</h2>
              <p className="text-lg leading-relaxed opacity-90 text-white/80">
                Temukan dapur tempat kami meracik cita rasa otentik Sukabumi. Kami selalu senang menyambut Anda!
              </p>
              <div className="p-6 border bg-black/30 rounded-2xl border-white/10">
                <div className="flex items-center gap-4 mb-2">
                  <MapPin className="w-6 h-6 text-primary" />
                  <span className="text-xl font-bold">Lokasi Produksi</span>
                </div>
                <p className="pl-10 opacity-90 text-white/80">Jl. Goalpara No. 45, Sukabumi, Jawa Barat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureItem({ icon, text }) {
  return (
    <div className="flex items-center gap-3 text-base sm:text-lg font-bold text-primary">
      <div className="text-primary">{icon}</div>
      <span className="text-foreground">{text}</span>
    </div>
  )
}

const isStoreClosed = () => {
  const now = new Date();
  const options = { timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: false };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const hour = parseInt(formatter.format(now), 10);
  return hour < 8 || hour >= 19;
};

function ProductCard({ product, onAddToCart }) {
  const isClosed = isStoreClosed();
  const isOutOfStock = product.stock === 0 || product.stock === null;

  const imgClass = `absolute inset-0 object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 ${
    isOutOfStock ? 'filter grayscale opacity-50' : ''
  }`;

  return (
    <div className="relative flex flex-col h-full overflow-hidden transition-all duration-300 bg-white border border-slate-100 shadow-sm rounded-2xl hover:shadow-md hover:-translate-y-1 group">
      <div className="h-52 bg-slate-50 relative overflow-hidden flex-shrink-0">
        <img
          src={product.image_url || getFallbackFoodImage(product.name)}
          alt={product.name}
          className={imgClass}
          onError={(e) => handleImageError(e, product.name)}
        />
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-[#B91C1C] font-black px-3 py-1 rounded-full text-xs shadow-sm z-10">
          Rp {product.price.toLocaleString()}
        </div>

        {/* Red badge for Out of Stock */}
        {isOutOfStock && (
          <div className="absolute top-3 left-3 bg-red-600 text-white font-extrabold px-3 py-1 rounded-full text-xs shadow-md uppercase tracking-wider z-10">
            Habis
          </div>
        )}

        {/* Yellow badge for Closed Store */}
        {isClosed && (
          <div className="absolute bottom-3 left-3 right-3 bg-amber-500/95 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] text-center shadow-md backdrop-blur-sm z-10 border border-amber-400">
            Toko Tutup (Buka 08:00 - 19:00)
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5 space-y-2 bg-white">
        <h3 className="text-lg font-heading font-black text-slate-800 line-clamp-1">{product.name}</h3>
        <p className="flex-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">{product.description || 'Hidangan lezat khas D\'raosan yang dimasak dengan resep turun-temurun.'}</p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-500 bg-amber-50 px-2 py-0.5 rounded">Bestseller</span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock || isClosed}
            className="p-2.5 bg-gradient-to-r from-[#B91C1C] via-[#E11D48] to-[#F59E0B] hover:from-[#9c1818] hover:via-[#c7173e] hover:to-[#db8c0a] text-white rounded-full transition-all duration-300 shadow hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:scale-100 disabled:pointer-events-none"
            title="Tambah ke Keranjang"
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}