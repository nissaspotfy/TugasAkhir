const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-dummy-key', // Fallback for dev if not set
    clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-dummy-key'
});

module.exports = snap;
