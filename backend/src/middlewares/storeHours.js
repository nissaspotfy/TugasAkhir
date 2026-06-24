const { StatusCodes } = require('http-status-codes');

const checkStoreHours = (req, res, next) => {
    const now = new Date();
    
    // Format to Asia/Jakarta timezone to get the exact hour in WIB
    const options = { timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: false };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const hour = parseInt(formatter.format(now), 10);
    
    if (hour < 8 || hour >= 19) {
        return res.status(StatusCodes.FORBIDDEN).json({
            status: StatusCodes.FORBIDDEN,
            message: "Maaf, D'raosan saat ini tutup. Silakan pesan kembali pada pukul 08:00 hingga 19:00."
        });
    }
    
    next();
};

module.exports = {
    checkStoreHours
};
