const { Notification, Transaction } = require('./src/models');

async function run() {
    try {
        const notifs = await Notification.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        console.log("LAST 5 NOTIFICATIONS:");
        console.log(JSON.stringify(notifs.map(n => n.get({ plain: true })), null, 2));

        const trans = await Transaction.findAll({
            limit: 3
        });
        console.log("TRANSACTIONS SAMPLE:");
        console.log(JSON.stringify(trans.map(t => t.get({ plain: true })), null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

run();
