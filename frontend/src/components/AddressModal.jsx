import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import api from '../lib/api';
import { X, MapPin, Crosshair } from 'lucide-react';
import { GoogleMap, useLoadScript, Marker, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '100%',
};
const defaultCenter = {
  lat: -6.175392,
  lng: 106.827153,
};

export default function AddressModal({ isOpen, onClose, onAddressAdded }) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        libraries,
    });

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
    const [map, setMap] = useState(null);
    const [markerPosition, setMarkerPosition] = useState(defaultCenter);
    const autocompleteRef = useRef(null);

    const onMapLoad = (mapInstance) => {
        setMap(mapInstance);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Reverse Geocode
    const geocodePosition = (lat, lng) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const addressComponents = results[0].address_components;
                let city = '';
                let postalCode = '';

                addressComponents.forEach(component => {
                    if (component.types.includes('administrative_area_level_2') || component.types.includes('locality')) {
                        city = component.long_name;
                    }
                    if (component.types.includes('postal_code')) {
                        postalCode = component.long_name;
                    }
                });

                setFormData(prev => ({
                    ...prev,
                    address_line: results[0].formatted_address,
                    city,
                    postal_code: postalCode,
                    latitude: lat,
                    longitude: lng
                }));
            }
        });
    };

    const handleMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPosition({ lat, lng });
        geocodePosition(lat, lng);
    };

    const handleMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const pos = { lat: latitude, lng: longitude };
                    setMarkerPosition(pos);
                    map?.panTo(pos);
                    map?.setZoom(15);
                    geocodePosition(latitude, longitude);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    alert("Gagal mendapatkan lokasi.");
                }
            );
        }
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                
                setMarkerPosition({ lat, lng });
                map?.panTo({ lat, lng });
                map?.setZoom(15);
                
                // Extract address details
                let city = '';
                let postalCode = '';
                if (place.address_components) {
                    place.address_components.forEach(component => {
                        if (component.types.includes('administrative_area_level_2') || component.types.includes('locality')) {
                            city = component.long_name;
                        }
                        if (component.types.includes('postal_code')) {
                            postalCode = component.long_name;
                        }
                    });
                }

                setFormData(prev => ({
                    ...prev,
                    address_line: place.formatted_address || place.name,
                    city,
                    postal_code: postalCode,
                    latitude: lat,
                    longitude: lng
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/addresses', formData);
            onAddressAdded(res.data.data);
            onClose();
        } catch (error) {
            console.error("Failed to add address", error);
            alert("Failed to add address");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-4xl p-6 relative my-8">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                    <X className="h-5 w-5" />
                </button>
                
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MapPin className="text-accent" /> 
                    Tambah Alamat Baru
                </h2>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Form Section */}
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
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="Cari lokasi atau klik pada peta..."
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
                                    className="rounded text-accent focus:ring-accent"
                                />
                                <label htmlFor="is_primary" className="text-sm">Jadikan Alamat Utama</label>
                            </div>

                            <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-white font-bold">
                                {loading ? 'Menyimpan...' : 'Simpan Alamat'}
                            </Button>
                        </form>
                    </div>

                    {/* Map Section */}
                    <div className="order-1 lg:order-2 space-y-3">
                        <div className="flex gap-2 relative">
                            <div className="flex-1">
                                <Autocomplete
                                    onLoad={ref => autocompleteRef.current = ref}
                                    onPlaceChanged={onPlaceChanged}
                                >
                                    <Input 
                                        placeholder="Cari lokasi (Google Maps)..." 
                                        className="text-sm w-full"
                                    />
                                </Autocomplete>
                            </div>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleMyLocation}
                                title="Gunakan Lokasi Saya"
                            >
                                <Crosshair className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="h-64 lg:h-[400px] rounded-xl overflow-hidden border border-gray-200 relative z-0">
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={defaultCenter}
                                zoom={13}
                                onLoad={onMapLoad}
                                onClick={handleMapClick}
                                options={{
                                    streetViewControl: false,
                                    mapTypeControl: false,
                                }}
                            >
                                <Marker position={markerPosition} />
                            </GoogleMap>
                            <div className="absolute bottom-2 left-2 right-2 bg-white/90 p-2 rounded text-xs text-center pointer-events-none">
                                Klik peta untuk menandai lokasi
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
