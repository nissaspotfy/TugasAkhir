const { Address, Product } = require('../../models');
const { NotFoundError } = require('../../common/responses/error-response');
const axios = require('axios');

// Store Location (perum pesona limbangan jalan delima goalpara sukabumi)
const STORE_LOCATION = {
    latitude: -6.888871,
    longitude: 106.965987
};

// Mock rates
const GOJEK_RATE_PER_KM = 5000;
const GOJEK_MAX_KM = 40;
const GOJEK_SAMEDAY_MAX_KM = 20;
const GOJEK_SAMEDAY_RATE_PER_KM = 3000; // Cheaper rate

// Mock JNE/JnT rates per kg (simplified)
// In reality, this depends on origin-destination zones.
// We will simulate zone cost based on distance roughly.
const BASE_WEIGHT_COST = 10000; // Base cost per kg

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

const calculateShippingCost = async (addressId, items = []) => {
    const address = await Address.findByPk(addressId);
    if (!address) throw new NotFoundError('Address not found');

    let distance = 0;
    if (address.latitude && address.longitude) {
        distance = calculateDistance(
            STORE_LOCATION.latitude,
            STORE_LOCATION.longitude,
            address.latitude,
            address.longitude
        );
    } else {
        distance = 3.0; // Fallback distance if no lat/long
    }

    // Calculate Total Weight
    let totalWeight = 0; // grams
    if (items.length > 0) {
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (product) {
                totalWeight += product.weight * item.quantity;
            }
        }
    } else {
        totalWeight = 1000;
    }

    const options = [];

    // 1. Flash (Tercepat)
    // Tarif dasar Rp 12.000 + Rp 2.500/km (dibulatkan ke kelipatan Rp 100)
    const flashBase = 12000;
    const flashDistanceCost = distance * 2500;
    const flashTotalCost = Math.round((flashBase + flashDistanceCost) / 100) * 100;
    // Estimasi waktu: 15-20 menit + (1.5 menit per km)
    const flashMinTime = 15 + Math.round(distance * 1.5);
    const flashMaxTime = 20 + Math.round(distance * 1.5);

    options.push({
        provider: 'Flash',
        service: 'Tercepat',
        cost: Math.max(12000, flashTotalCost),
        estimated: `${flashMinTime}-${flashMaxTime} Menit`
    });

    // 2. Reguler (Standar)
    // Tarif dasar Rp 7.000 + Rp 1.500/km (dibulatkan ke kelipatan Rp 100)
    const regulerBase = 7000;
    const regulerDistanceCost = distance * 1500;
    const regulerTotalCost = Math.round((regulerBase + regulerDistanceCost) / 100) * 100;
    // Estimasi waktu: 20-30 menit + (2.5 menit per km)
    const regulerMinTime = 20 + Math.round(distance * 2.5);
    const regulerMaxTime = 30 + Math.round(distance * 2.5);

    options.push({
        provider: 'Reguler',
        service: 'Standar',
        cost: Math.max(7000, regulerTotalCost),
        estimated: `${regulerMinTime}-${regulerMaxTime} Menit`
    });

    return {
        origin: STORE_LOCATION,
        destination: { lat: address.latitude, long: address.longitude },
        distance: parseFloat(distance.toFixed(2)),
        weight: totalWeight,
        options
    };
};

// Geocoding helper
const geocodeAddress = async (addressString) => {
    // ... (rest same)
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: addressString,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'DraosanApp/1.0'
            }
        });
        if (response.data && response.data.length > 0) {
            return {
                lat: parseFloat(response.data[0].lat),
                lon: parseFloat(response.data[0].lon)
            };
        }
    } catch (error) {
        console.error("Geocoding failed", error);
    }
    return null;
};

module.exports = {
    calculateShippingCost,
    geocodeAddress
};
