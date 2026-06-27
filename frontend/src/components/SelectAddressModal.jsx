import React, { useState } from 'react';
import { X, MapPin, Plus, Pencil, Trash2, Search, Crosshair } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function SelectAddressModal({ 
    isOpen, 
    onClose, 
    addresses, 
    selectedAddressId, 
    onSelectAddress, 
    onAddAddressClick, 
    onEditAddressClick, 
    onDeleteAddressClick 
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAll, setShowAll] = useState(false);

    if (!isOpen) return null;

    // Filter addresses based on search query
    const filteredAddresses = addresses.filter(addr => {
        const query = searchQuery.toLowerCase();
        return (
            addr.recipient_name?.toLowerCase().includes(query) ||
            addr.address_line?.toLowerCase().includes(query) ||
            addr.city?.toLowerCase().includes(query) ||
            addr.phone_number?.includes(query)
        );
    });

    // Determine which addresses to display in favorit list
    const visibleAddresses = showAll ? filteredAddresses : filteredAddresses.slice(0, 2);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto font-sans">
            <div className="bg-white rounded-2xl w-full max-w-xl p-6 relative my-8 animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground font-heading">
                    Pilih Lokasi Pengiriman
                </h2>

                <div className="space-y-6">
                    {/* Search Address Box */}
                    <div className="relative">
                        <Input
                            placeholder="Cari penerima atau alamat..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 text-sm font-sans w-full"
                        />
                        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                    </div>

                    {/* Quick Action Row */}
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                        <span className="text-xs text-muted-foreground font-bold">
                            Tersimpan: {addresses.length} dari 5 alamat
                        </span>
                        
                        {addresses.length < 5 ? (
                            <button
                                onClick={onAddAddressClick}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-accent bg-accent/5 hover:bg-accent hover:text-white rounded-full transition-colors cursor-pointer border border-accent/20"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Tambah Alamat Baru
                            </button>
                        ) : (
                            <span className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200 animate-pulse">
                                ⚠️ Kuota 5 alamat penuh
                            </span>
                        )}
                    </div>

                    {/* Alamat Favorit Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider">
                                Alamat Favorit
                            </h3>
                            {filteredAddresses.length > 2 && (
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-black transition-colors cursor-pointer"
                                >
                                    {showAll ? 'Tampilkan Lebih Sedikit' : 'Lihat Semua'}
                                </button>
                            )}
                        </div>

                        {filteredAddresses.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                Alamat tidak ditemukan.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {visibleAddresses.map((addr) => (
                                    <div 
                                        key={addr.id}
                                        onClick={() => {
                                            onSelectAddress(addr.id);
                                            onClose();
                                        }}
                                        className={`
                                            p-4 rounded-xl border transition-all text-left relative cursor-pointer group
                                            ${selectedAddressId === addr.id 
                                                ? 'border-accent bg-accent/5 shadow-md ring-1 ring-accent' 
                                                : 'border-gray-200 hover:border-accent/40'}
                                        `}
                                    >
                                        <div className="flex items-start justify-between pr-14">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-bold text-sm text-gray-800">
                                                        {addr.recipient_name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-medium">
                                                        ({addr.phone_number})
                                                    </span>
                                                    {addr.is_primary && (
                                                        <span className="px-2 py-0.5 text-[10px] text-blue-700 bg-blue-100 rounded-full font-bold">
                                                            Utama
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                                                    {addr.address_line}, {addr.city}, {addr.postal_code}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action buttons (Edit/Hapus) floating at top-right of address card */}
                                        <div className="absolute right-3 top-3 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditAddressClick(addr);
                                                }}
                                                className="p-1.5 text-gray-500 hover:text-accent hover:bg-accent/5 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                                title="Edit Alamat"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteAddressClick(addr.id);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                                title="Hapus Alamat"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
