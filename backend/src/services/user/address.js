const { Address } = require('../../models');
const { BaseError, NotFoundError, BadRequestError } = require('../../common/responses/error-response');
const { StatusCodes } = require('http-status-codes');
const { geocodeAddress } = require('../shipping/shipping');

const addAddress = async (userId, data) => {
    // Geocode if missing coords
    if (!data.latitude || !data.longitude) {
        const addressString = `${data.address_line}, ${data.city}, ${data.postal_code}`;
        const coords = await geocodeAddress(addressString);
        if (coords) {
            data.latitude = coords.lat;
            data.longitude = coords.lon;
        }
    }

    // If setting as primary, unset others
    if (data.is_primary) {
        await Address.update({ is_primary: false }, { where: { user_id: userId } });
    } else {
        // If first address, make it primary
        const count = await Address.count({ where: { user_id: userId } });
        if (count === 0) data.is_primary = true;
    }

    const address = await Address.create({
        ...data,
        user_id: userId
    });
    return address;
};

const getUserAddresses = async (userId) => {
    return await Address.findAll({ where: { user_id: userId } });
};

const updateAddress = async (userId, addressId, data) => {
    const address = await Address.findOne({ where: { id: addressId, user_id: userId } });
    if (!address) throw new NotFoundError('Address not found');

    if (data.is_primary) {
        await Address.update({ is_primary: false }, { where: { user_id: userId } });
    }

    await address.update(data);
    return address;
};

const deleteAddress = async (userId, addressId) => {
    const address = await Address.findOne({ where: { id: addressId, user_id: userId } });
    if (!address) throw new NotFoundError('Address not found');

    await address.destroy();
};

module.exports = {
    addAddress,
    getUserAddresses,
    updateAddress,
    deleteAddress
};
