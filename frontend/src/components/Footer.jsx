import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Globe } from 'lucide-react';
import { useToast } from './ui/ToastProvider';

export default function Footer() {
  const { addToast } = useToast();

  const handlePlaceholderClick = (e) => {
    e.preventDefault();
    addToast('Fitur ini segera hadir!', 'info');
  };

  return (
    <footer id="footer" className="bg-[#030712] text-slate-300 border-t border-slate-900 pt-16 pb-8 font-sans w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center justify-start mb-4">
              <img src="/logodr.png" alt="D'raosan Logo" className="h-16 w-auto object-contain brightness-0 invert" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Nikmati kelezatan kuliner Sunda autentik Sukabumi yang diolah dengan bahan segar pilihan kualitas terbaik, disajikan hangat langsung ke meja Anda.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/menu" className="hover:text-white hover:underline transition-all">
                  Jelajahi Menu
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-white hover:underline transition-all">
                  Pesan Online
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white hover:underline transition-all">
                  Riwayat Pesanan
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" onClick={handlePlaceholderClick} className="hover:text-white hover:underline transition-all">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" onClick={handlePlaceholderClick} className="hover:text-white hover:underline transition-all">
                  Community Guidelines
                </a>
              </li>
              <li>
                <a href="#" onClick={handlePlaceholderClick} className="hover:text-white hover:underline transition-all">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Connect</h4>
            <div className="flex items-center gap-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-[#bf3843] rounded-lg transition-all border border-slate-800"
                title="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-[#bf3843] rounded-lg transition-all border border-slate-800"
                title="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="#" 
                onClick={handlePlaceholderClick} 
                className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-[#bf3843] rounded-lg transition-all border border-slate-800"
                title="Website"
              >
                <Globe size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="border-t border-slate-900 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center md:text-left">
            @2026 UMKM D'raosan. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
            <a href="#" onClick={handlePlaceholderClick} className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" onClick={handlePlaceholderClick} className="hover:text-slate-300 transition-colors">
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
