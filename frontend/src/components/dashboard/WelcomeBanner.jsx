import { Button } from '../ui/button'

export function WelcomeBanner({ userName }) {
    return (
        <div className="bg-primary rounded-3xl p-8 text-primary-foreground relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-2xl">
                <h1 className="font-heading text-3xl md:text-5xl mb-4 leading-tight">
                Halo, {userName || 'Teman'}! <br/>
                <span className="text-accent">Laparan?</span> Ayo ngemil!
                </h1>
                <p className="opacity-90 mb-6 text-lg">Ada diskon 50% khusus buat kamu hari ini. Cek menu favoritmu sekarang.</p>
                <Button className="bg-accent hover:bg-accent/90 text-white rounded-full px-8 font-bold shadow-lg">
                Lihat Menu
                </Button>
            </div>
            {/* Decor */}
            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-20"></div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
        </div>
    )
}
