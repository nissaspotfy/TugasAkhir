require('dotenv').config();
const { getAnalyticsData } = require('./src/services/transaction/transaction');

async function debug() {
    try {
        console.log("Calling getAnalyticsData...");
        const result = await getAnalyticsData();
        console.log("SUCCESS! Result keys:", Object.keys(result));
    } catch (error) {
        console.error("ERROR IN getAnalyticsData:", error);
    } finally {
        process.exit();
    }
}

debug();
