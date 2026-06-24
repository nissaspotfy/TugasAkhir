const cron = require('node-cron');
const { Product } = require('./models');

// Schedule to run daily at 07:55 AM (cron: '55 7 * * *')
cron.schedule('55 7 * * *', async () => {
    console.log('[CRON] Starting daily stock reset scheduler...');
    try {
        const [affectedCount] = await Product.update(
            { stock: 50 },
            {
                where: {
                    status: 'aktif'
                }
            }
        );
        console.log(`[CRON SUCCESS] Daily stock reset complete. Updated ${affectedCount} products to stock=50.`);
    } catch (error) {
        console.error('[CRON ERROR] Failed to reset product stocks:', error.message);
    }
});

console.log('[CRON] Scheduler initialized: reset active products stock to 50 daily at 07:55 AM.');
