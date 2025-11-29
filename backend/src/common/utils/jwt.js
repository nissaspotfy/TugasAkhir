const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;


/**
 * Generate a JWT token
 * @param {Object} payload - The payload to encode in the token
 * @param {string} secret - The secret key to sign the token
 * @param {number} expiresIn - The expiration time in seconds
 * @returns {string} - The generated JWT token
 */

const generateToken = (payload, secret = JWT_SECRET, expiresIn = '12h') => {
     try {
        return jwt.sign(payload, secret, { expiresIn });
     } catch (error) {
        throw new Error('Error generating token' + error.message);
     }
    }
/**
 * Verify a JWT token
 * @param {string} token - token jwt untuk diverifikasi
 * @param {string} secret  - secret jey dari env
 * @param {boolean} ignoreExpiration - untuk mengabaikan masa expired token
 * @returns {Object} - payload yang sudah di decode
 * @throws {Error} - jika token tidak valid
 */

const verifyToken = (token, secret = JWT_SECRET, ignoreExpiration = false) => {
    try {
        return jwt.verify(token, secret, { ignoreExpiration });
    } catch (error) {
        return Error('terjadi kesalahan saat memverifikasi token' + error.message);
    }
}

/**
 * Decode a JWT token without verifying it
 * @param {string} token - The JWT token to decode
 * @returns {Object} - The decoded payload
 * @throws {Error} - If there is an error decoding the token
 */
const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        throw new Error('Error decoding token' + error.message);
    }
}

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
};