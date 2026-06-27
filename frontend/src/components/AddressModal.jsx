import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import api from '../lib/api';
import { X, MapPin, Crosshair } from 'lucide-react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon in Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultCenter = {
  lat: -6.175392,
  lng: 106.827153,
};

export default function AddressModal({ isOpen, onClose, onAddressAdded, addressToEdit }) {
    const [formData, setFormData] = useState({
        recipient_name: '',
        phone_number: '',
        address_line: '',
        city: '',
        postal_code: '',
        latitude: null,
        longitude: null,
        is_primary: false
    });
    const [loading, setLoading] = useState(false);
    
    // Map State
    const [markerPosition, setMarkerPosition] = useState(defaultCenter);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    
    const mapRef = useRef(null);
    const leafletMapInstance = useRef(null);
    const markerRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Initialize Leaflet map
    useEffect(() => {
        if (!isOpen) return;

        // Give React a small tick to render the DOM container before initializing Leaflet
        const timeout = setTimeout(() => {
            if (!leafletMapInstance.current && mapRef.current) {
                const initialMap = L.map(mapRef.current).setView([markerPosition.lat, markerPosition.lng], 13);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(initialMap);

                const initialMarker = L.marker([markerPosition.lat, markerPosition.lng], {
                    draggable: true
                }).addTo(initialMap);

                // Marker drag end listener
                initialMarker.on('dragend', (event) => {
                    const marker = event.target;
                    const position = marker.getLatLng();
                    setMarkerPosition({ lat: position.lat, lng: position.lng });
                    reverseGeocode(position.lat, position.lng);
                });

                // Map click listener
                initialMap.on('click', (event) => {
                    const { lat, lng } = event.latlng;
                    setMarkerPosition({ lat, lng });
                    initialMarker.setLatLng([lat, lng]);
                    reverseGeocode(lat, lng);
                });

                leafletMapInstance.current = initialMap;
                markerRef.current = initialMarker;
            }
        }, 100);

        return () => {
            clearTimeout(timeout);
            if (leafletMapInstance.current) {
                leafletMapInstance.current.remove();
                leafletMapInstance.current = null;
                markerRef.current = null;
            }
        };
    }, [isOpen]);

    // Handle form reset or editing data load
    useEffect(() => {
        if (!isOpen) return;

        if (addressToEdit) {
            setFormData({
                recipient_name: addressToEdit.recipient_name || '',
                phone_number: addressToEdit.phone_number || '',
                address_line: addressToEdit.address_line || '',
                city: addressToEdit.city || '',
                postal_code: addressToEdit.postal_code || '',
                latitude: addressToEdit.latitude || null,
                longitude: addressToEdit.longitude || null,
                is_primary: !!addressToEdit.is_primary
            });
            const lat = addressToEdit.latitude || defaultCenter.lat;
            const lng = addressToEdit.longitude || defaultCenter.lng;
            setMarkerPosition({ lat, lng });
            setSearchQuery(addressToEdit.address_line || '');
            setSuggestions([]);
            if (leafletMapInstance.current) {
                updateMapMarker(lat, lng);
            }
        } else {
            setFormData({
                recipient_name: '',
                phone_number: '',
                address_line: '',
                city: '',
                postal_code: '',
                latitude: null,
                longitude: null,
                is_primary: false
            });
            setMarkerPosition(defaultCenter);
            setSearchQuery('');
            setSuggestions([]);
            if (leafletMapInstance.current) {
                updateMapMarker(defaultCenter.lat, defaultCenter.lng, 13);
            }
        }
    }, [isOpen, addressToEdit]);

    const updateMapMarker = (lat, lng, zoomLevel = 15) => {
        if (leafletMapInstance.current && markerRef.current) {
            leafletMapInstance.current.setView([lat, lng], zoomLevel);
            markerRef.current.setLatLng([lat, lng]);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Reverse Geocode (Coordinates -> Address Details)
    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
                params: {
                    lat,
                    lon: lng,
                    format: 'json',
                    addressdetails: 1
                }
            });
            
            if (response.data && response.data.address) {
                const addr = response.data.address;
                const city = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || '';
                const postcode = addr.postcode || '';
                const displayName = response.data.display_name;

                setFormData(prev => ({
                    ...prev,
                    address_line: displayName,
                    city,
                    postal_code: postcode,
                    latitude: lat,
                    longitude: lng
                }));
            }
        } catch (err) {
            console.error("Reverse geocoding failed:", err);
        }
    };

    // Nominatim Geocoding Search
    const handleSearch = async (query) => {
        if (!query) return;
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: {
                    q: query,
                    format: 'json',
                    addressdetails: 1,
                    limit: 5,
                    countrycodes: 'id'
                }
            });
            setSuggestions(response.data);
        } catch (err) {
            console.error("Geocoding search failed:", err);
        }
    };

    const debounceSearch = (query) => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }
        searchTimeoutRef.current = setTimeout(() => {
            handleSearch(query);
        }, 600);
    };

    const handleSelectSuggestion = (sug) => {
        const lat = parseFloat(sug.lat);
        const lng = parseFloat(sug.lon);
        
        setMarkerPosition({ lat, lng });
        updateMapMarker(lat, lng);
        
        const addr = sug.address || {};
        const city = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || '';
        const postcode = addr.postcode || '';
        
        setFormData(prev => ({
            ...prev,
            address_line: sug.display_name,
            city,
            postal_code: postcode,
            latitude: lat,
            longitude: lng
        }));
        
        setSearchQuery(sug.display_name);
        setSuggestions([]);
    };

    const handleMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setMarkerPosition({ lat: latitude, lng: longitude });
                    updateMapMarker(latitude, longitude);
                    reverseGeocode(latitude, longitude);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    alert("Gagal mendapatkan lokasi.");
                }
            );
        } else {
            alert("Geolocation tidak didukung oleh browser Anda.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (addressToEdit) {
                const res = await api.put(`/addresses/${addressToEdit.id}`, formData);
                onAddressAdded(res.data.data);
            } else {
                const res = await api.post('/addresses', formData);
                onAddressAdded(res.data.data);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save address", error);
            alert("Gagal menyimpan alamat.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto font-sans">
            <div className="bg-white rounded-2xl w-full max-w-4xl p-6 relative my-8">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 cursor-pointer">
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MapPin className="text-accent" />
                    {addressToEdit ? 'Edit Alamat' : 'Tambah Alamat Baru'}
                </h2>

                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-4 order-2 lg:order-1">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nama Penerima</label>
                                <Input
                                    name="recipient_name"
                                    value={formData.recipient_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Nomor Telepon</label>
                                <Input
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    required
                                    placeholder="0812..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
                                <textarea
                                    name="address_line"
                                    value={formData.address_line}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm font-sans"
                                    placeholder="Cari lokasi atau isi alamat lengkap secara manual..."
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kota</label>
                                    <Input
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                        placeholder="Jakarta"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kode Pos</label>
                                    <Input
                                        name="postal_code"
                                        value={formData.postal_code}
                                        onChange={handleChange}
                                        required
                                        placeholder="12345"
                                    />
                                </div>
                            </div>

                            {formData.latitude && (
                                <p className="text-xs text-gray-500">
                                    Pinpoint: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                                </p>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="is_primary"
                                    id="is_primary"
                                    checked={formData.is_primary}
                                    onChange={handleChange}
                                    className="rounded text-accent focus:ring-accent cursor-pointer"
                                />
                                <label htmlFor="is_primary" className="text-sm cursor-pointer select-none">Jadikan Alamat Utama</label>
                            </div>

                            <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-white font-bold cursor-pointer">
                                {loading ? 'Menyimpan...' : 'Simpan Alamat'}
                            </Button>
                        </form>
                    </div>

                    <div className="order-1 lg:order-2 space-y-3">
                        <div className="flex gap-2 relative">
                            <div className="flex-1 relative">
                                <Input
                                    placeholder="Cari lokasi (OpenStreetMap)..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        debounceSearch(e.target.value);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSearch(searchQuery);
                                        }
                                    }}
                                    className="text-sm w-full"
                                />
                                {suggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-gray-100 font-sans text-xs">
                                        {suggestions.map((sug, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleSelectSuggestion(sug)}
                                                className="p-3 hover:bg-secondary/20 cursor-pointer transition-colors text-left"
                                            >
                                                <p className="font-bold text-gray-800">{sug.name || sug.display_name.split(',')[0]}</p>
                                                <p className="text-gray-500 text-[10px] mt-0.5 truncate">{sug.display_name}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleMyLocation}
                                title="Gunakan Lokasi Saya"
                                className="cursor-pointer"
                            >
                                <Crosshair className="h-4 w-4 text-primary" />
                            </Button>
                        </div>

                        <div className="h-64 lg:h-[400px] rounded-xl overflow-hidden border border-gray-200 relative z-0">
                            <div ref={mapRef} className="w-full h-full z-0" />
                            <div className="absolute bottom-2 left-2 right-2 bg-white/90 p-2 rounded text-[10px] font-bold text-center pointer-events-none z-10 shadow-sm text-gray-600">
                                Geser marker atau klik peta untuk menandai lokasi pinpoint secara manual
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
