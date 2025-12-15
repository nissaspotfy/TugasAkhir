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
        totalWeight = 1000; // Default 1kg if no items provided
    }

    const weightInKg = Math.ceil(totalWeight / 1000);
    const options = [];

    // 1. Gojek
    if (distance > 0 && distance <= GOJEK_MAX_KM) {
        // Instant
        const instantCost = Math.ceil(distance * GOJEK_RATE_PER_KM);
        options.push({
            provider: 'Gojek',
            service: 'Instant',
            cost: Math.max(instantCost, 15000), // Min 15k
            estimated: '1-3 Hours'
        });

        // Same Day (Only if <= 20km)
        if (distance <= GOJEK_SAMEDAY_MAX_KM) {
            const sameDayCost = Math.ceil(distance * GOJEK_SAMEDAY_RATE_PER_KM);
            options.push({
                provider: 'Gojek',
                service: 'Same Day',
                cost: Math.max(sameDayCost, 10000), // Min 10k
                estimated: '6-8 Hours'
            });
        }
    }

    // 2. JNE
    // Simulate cost: Base cost * weight. 
    // Add small distance factor for realism (mock).
    const jneBase = 9000;
    const distanceFactor = Math.ceil(distance / 100) * 2000; // +2k per 100km
    const jneCost = (jneBase + distanceFactor) * weightInKg;
    
    options.push({
        provider: 'JNE',
        service: 'REG',
        cost: jneCost,
        estimated: '2-3 Days'
    });
    options.push({
        provider: 'JNE',
        service: 'YES',
        cost: jneCost + 5000 * weightInKg,
        estimated: '1 Day'
    });

    // 3. J&T
    const jntBase = 10000;
    const jntCost = (jntBase + distanceFactor) * weightInKg;
    options.push({
        provider: 'J&T',
        service: 'EZ',
        cost: jntCost,
        estimated: '2-3 Days'
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
