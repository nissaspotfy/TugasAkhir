const { Transaction, TransactionItem, Product, Promo, Address, user, role, sequelize } = require('../../models');
const { BaseError, NotFoundError, BadRequestError } = require('../../common/responses/error-response');
const { StatusCodes } = require('http-status-codes');
const snap = require('../../common/utils/midtrans');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const shippingService = require('../shipping/shipping');
const { createNotification } = require('../notification/notification');

const createTransaction = async (user, items, promoCode, shippingAddressId, shippingOption, shippingType) => {
    // items: [{ productId: 1, quantity: 2, note: "..." }]
    // shippingOption: { provider: 'JNE', service: 'REG', cost: 10000 }

    const { getStoreStatus } = require('../setting/setting');
    const isStoreOpen = await getStoreStatus();
    if (!isStoreOpen) {
        throw new BaseError(StatusCodes.BAD_REQUEST, 'Maaf, toko sedang tutup saat ini.');
    }

    const t = await sequelize.transaction();

    try {
        let totalAmount = 0;
        const transactionItemsData = [];

        // 1. Validate products and calculate total
        for (const item of items) {
            // ... (rest of loop same) ...
            const product = await Product.findByPk(item.productId, { 
                transaction: t,
                lock: t.LOCK.UPDATE
            });
            if (!product) {
                throw new NotFoundError(`Produk ${item.productId} tidak ditemukan`);
            }
            if (product.stock < item.quantity) {
                throw new BaseError(StatusCodes.BAD_REQUEST, `Stok untuk produk ${product.name} tidak mencukupi`);
            }

            const price = product.price;
            const subtotal = price * item.quantity;
            totalAmount += subtotal;

            transactionItemsData.push({
                product_id: product.id,
                quantity: item.quantity,
                price_at_time: price,
                name: product.name,
                note: item.note
            });

            // Decrease stock
            await product.update({ stock: product.stock - item.quantity }, { transaction: t });
        }

        // Validate Shipping Option
        let shippingCost = 0;
        if (shippingType === 'takeaway') {
            shippingCost = 0;
        } else if (shippingAddressId && shippingOption) {
            const shippingResult = await shippingService.calculateShippingCost(shippingAddressId, items);
            const validOption = shippingResult.options.find(opt =>
                opt.provider === shippingOption.provider &&
                opt.service === shippingOption.service
            );

            if (!validOption) {
                throw new BaseError(StatusCodes.BAD_REQUEST, 'Invalid shipping option selected');
            }

            // Use server-calculated cost to prevent tampering
            shippingCost = validOption.cost;
        } else {
            throw new BaseError(StatusCodes.BAD_REQUEST, 'Shipping address and option required');
        }

        // 2. Apply Promo Code if exists
        // ... (promo logic same) ...
        let discountAmount = 0;
        let promoId = null;

        if (promoCode) {
            const promo = await Promo.findOne({
                where: {
                    code: promoCode,
                    is_active: true
                },
                transaction: t
            });

            if (promo) {
                if (promo.max_usage !== null && promo.max_usage <= 0) {
                    throw new BaseError(StatusCodes.BAD_REQUEST, 'Promo code usage limit reached');
                }

                if (promo.discount_type === 'percentage') {
                    discountAmount = Math.floor((totalAmount * promo.discount_value) / 100);
                } else {
                    discountAmount = promo.discount_value;
                }

                if (discountAmount > totalAmount) discountAmount = totalAmount;

                promoId = promo.id;

                if (promo.max_usage !== null) {
                    await promo.update({ max_usage: promo.max_usage - 1 }, { transaction: t });
                }
            } else {
                throw new NotFoundError('Promo code not found or inactive');
            }
        }

        const finalAmount = (totalAmount - discountAmount) + shippingCost;

        // 3. Create Transaction Record
        const transaction = await Transaction.create({
            user_id: user.id,
            total_amount: finalAmount,
            status: 'pending',
            promo_id: promoId,
            discount_amount: discountAmount,
            shipping_cost: shippingCost,
            shipping_address_id: shippingType === 'takeaway' ? null : shippingAddressId,
            shipping_provider: shippingType === 'takeaway' ? 'Ambil Sendiri' : shippingOption.provider,
            shipping_service: shippingType === 'takeaway' ? 'Ambil Sendiri' : shippingOption.service
        }, { transaction: t });

        // 4. Create Transaction Items
        // ... (rest same) ...
        const itemsWithId = transactionItemsData.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_time: item.price_at_time,
            transaction_id: transaction.id,
            note: item.note
        }));
        await TransactionItem.bulkCreate(itemsWithId, { transaction: t });

        // 5. Call Midtrans
        // Midtrans order_id limit is 50 chars. UUID is 36 chars.
        // ORDER- (6) + UUID (36) = 42 chars.
        const orderId = `ORDER-${transaction.id}`;

        const midtransItems = transactionItemsData.map(item => ({
            id: item.product_id.toString(),
            price: item.price_at_time,
            quantity: item.quantity,
            name: item.name.substring(0, 50)
        }));

        if (shippingCost > 0) {
            midtransItems.push({
                id: 'SHIPPING',
                price: shippingCost,
                quantity: 1,
                name: 'Shipping Cost'
            });
        }

        if (discountAmount > 0) {
            midtransItems.push({
                id: 'DISCOUNT',
                price: -discountAmount,
                quantity: 1,
                name: 'Promo Discount'
            });
        }

        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').trim();
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: finalAmount
            },
            customer_details: {
                first_name: user.name,
                email: user.email,
            },
            item_details: midtransItems,
            callbacks: {
                finish: `${frontendUrl}/payment-success`
            }
        };

        let snapToken = null;
        try {
            if (process.env.MIDTRANS_SERVER_KEY) {
                const midtransTransaction = await snap.createTransaction(parameter);
                snapToken = midtransTransaction.token;
            } else {
                console.warn("Midtrans Server Key not found, generating dummy token.");
                snapToken = `dummy-token-${uuidv4()}`;
            }
        } catch (midtransError) {
            console.error("Midtrans Error:", midtransError);
            const errorMessage = midtransError.ApiResponse ? JSON.stringify(midtransError.ApiResponse) : midtransError.message;
            throw new BaseError(StatusCodes.INTERNAL_SERVER_ERROR, `Payment gateway initialization failed: ${errorMessage}`);
        }

        await transaction.update({ snap_token: snapToken }, { transaction: t });

        await t.commit();

        // Create notification for admin
        try {
            await createNotification({
                userId: null, // null for admin
                title: 'Pesanan Baru Masuk!',
                message: `Pelanggan ${user.name} telah membuat pesanan baru #ORD-${transaction.id} sebesar Rp ${finalAmount.toLocaleString()}`,
                type: 'order'
            });
        } catch (notifErr) {
            console.error('Failed to create admin notification on checkout:', notifErr);
        }

        return {
            transactionId: transaction.id,
            snapToken,
            totalAmount: finalAmount,
            originalAmount: totalAmount,
            discountAmount,
            shippingCost,
            status: transaction.status
        };

    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const getUserTransactions = async (userId) => {
    const transactions = await Transaction.findAll({
        where: { user_id: userId },
        include: [
            {
                model: TransactionItem,
                as: 'items',
                include: [{ model: Product, as: 'product' }]
            },
            {
                model: Promo,
                as: 'promo'
            },
            {
                model: require('../../models').review,
                as: 'review'
            },
            {
                model: Address,
                as: 'shippingAddress'
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    // Sync pending transactions dynamically
    for (const t of transactions) {
        if (t.status === 'pending') {
            try {
                const orderId = `ORDER-${t.id}`;
                if (process.env.MIDTRANS_SERVER_KEY) {
                    const statusResponse = await snap.transaction.status(orderId);
                    const transactionStatus = statusResponse.transaction_status;

                    let status = 'pending';
                    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
                        status = 'paid';
                    } else if (transactionStatus === 'deny' || transactionStatus === 'expire' || transactionStatus === 'cancel') {
                        status = 'failed';
                    }

                    if (t.status !== status) {
                        await t.update({ status });
                        try {
                            const statusLabel = status === 'paid' ? 'LUNAS' : (status === 'failed' ? 'GAGAL' : status.toUpperCase());
                            await createNotification({
                                userId: t.user_id,
                                title: 'Status Pembayaran Diperbarui!',
                                message: `Status pembayaran untuk pesanan #ORD-${t.id} Anda sekarang adalah ${statusLabel}.`,
                                type: 'payment'
                            });
                        } catch (notifErr) {
                            console.error('Failed to create user notification on status sync:', notifErr);
                        }
                    }
                }
            } catch (err) {
                console.error(`Error syncing status for transaction ${t.id}:`, err.message);
            }
        }
    }

    return transactions;
};

const getAllTransactions = async () => {
    const transactions = await Transaction.findAll({
        include: [
            {
                model: TransactionItem,
                as: 'items',
                include: [{ model: Product, as: 'product' }]
            },
            {
                model: require('../../models').user,
                as: 'user',
                attributes: ['name', 'email']
            },
            {
                model: Address,
                as: 'shippingAddress'
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    for (const t of transactions) {
        if (t.status === 'pending') {
            try {
                const orderId = `ORDER-${t.id}`;
                if (process.env.MIDTRANS_SERVER_KEY) {
                    const statusResponse = await snap.transaction.status(orderId);
                    const transactionStatus = statusResponse.transaction_status;

                    let status = 'pending';
                    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
                        status = 'paid';
                    } else if (transactionStatus === 'deny' || transactionStatus === 'expire' || transactionStatus === 'cancel') {
                        status = 'failed';
                    }

                    if (t.status !== status) {
                        await t.update({ status });
                        try {
                            const statusLabel = status === 'paid' ? 'LUNAS' : (status === 'failed' ? 'GAGAL' : status.toUpperCase());
                            await createNotification({
                                userId: t.user_id,
                                title: 'Status Pembayaran Diperbarui!',
                                message: `Status pembayaran untuk pesanan #ORD-${t.id} Anda sekarang adalah ${statusLabel}.`,
                                type: 'payment'
                            });
                        } catch (notifErr) {
                            console.error('Failed to create user notification on status sync (all):', notifErr);
                        }
                    }
                }
            } catch (err) {
                console.error(`Error syncing status for transaction ${t.id}:`, err.message);
            }
        }
    }

    return transactions.map(t => {
        const tVal = t.get({ plain: true });
        if (tVal.user) {
            tVal.user.username = tVal.user.name; // Frontend expects user.username
        }
        return tVal;
    });
};

const syncTransactionStatus = async (transactionId) => {
    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction) {
        throw new NotFoundError('Transaction not found');
    }

    const orderId = `ORDER-${transaction.id}`;
    let status = 'pending';

    try {
        if (process.env.MIDTRANS_SERVER_KEY) {
            const statusResponse = await snap.transaction.status(orderId);
            const transactionStatus = statusResponse.transaction_status;

            if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
                status = 'paid';
            } else if (transactionStatus === 'deny' || transactionStatus === 'expire' || transactionStatus === 'cancel') {
                status = 'failed';
            } else {
                status = 'pending';
            }
        }
    } catch (error) {
        console.error('Error fetching Midtrans status during sync:', error);
    }

    if (transaction.status !== status) {
        await transaction.update({ status });
        try {
            const statusLabel = status === 'paid' ? 'LUNAS' : (status === 'failed' ? 'GAGAL' : status.toUpperCase());
            await createNotification({
                userId: transaction.user_id,
                title: 'Status Pembayaran Diperbarui!',
                message: `Status pembayaran untuk pesanan #ORD-${transaction.id} Anda sekarang adalah ${statusLabel}.`,
                type: 'payment'
            });
        } catch (notifErr) {
            console.error('Failed to create user notification on sync status:', notifErr);
        }
    }

    return transaction;
};

const updateTransactionStatus = async (id, status) => {
    const transaction = await Transaction.findByPk(id, {
        include: [{ model: TransactionItem, as: 'items' }]
    });
    if (!transaction) {
        throw new NotFoundError('Transaction not found');
    }
    const oldStatus = transaction.status;

    const t = await sequelize.transaction();
    try {
        await transaction.update({ status }, { transaction: t });

        // Inventory Restock on cancellation
        if (
            (status === 'cancelled' || status === 'failed') && 
            oldStatus !== 'cancelled' && 
            oldStatus !== 'failed'
        ) {
            for (const item of transaction.items) {
                const product = await Product.findByPk(item.product_id, { transaction: t });
                if (product) {
                    await product.update({ stock: product.stock + item.quantity }, { transaction: t });
                }
            }
        }
        await t.commit();
    } catch (error) {
        await t.rollback();
        throw error;
    }

    if (oldStatus !== status) {
        try {
            let title = 'Status Pesanan Diperbarui!';
            let message = `Pesanan #ORD-${transaction.id} Anda telah diperbarui.`;
            let type = 'order';

            if (status === 'paid') {
                title = 'Pembayaran Berhasil! 🎉';
                message = `Pembayaran untuk pesanan #ORD-${transaction.id} telah diterima. Kami akan segera memprosesnya.`;
                type = 'payment';
            } else if (status === 'processing') {
                title = 'Pesanan Mulai Dimasak! 🍳';
                message = `Kabar baik! Makanan untuk pesanan #ORD-${transaction.id} Anda sedang disiapkan oleh koki kami.`;
            } else if (status === 'success') {
                title = 'Pesanan Selesai! 🍽️';
                message = `Pesanan #ORD-${transaction.id} Anda telah selesai disiapkan/diantar. Selamat menikmati!`;
            } else if (status === 'cancelled') {
                title = 'Pesanan Dibatalkan ❌';
                message = `Pesanan #ORD-${transaction.id} Anda telah dibatalkan.`;
            } else if (status === 'failed') {
                title = 'Pembayaran Gagal ⚠️';
                message = `Pembayaran untuk pesanan #ORD-${transaction.id} Anda gagal. Silakan coba lagi.`;
                type = 'payment';
            }

            await createNotification({
                userId: transaction.user_id,
                title,
                message,
                type
            });
        } catch (notifErr) {
            console.error('Failed to create user notification on status update:', notifErr);
        }
    }

    return transaction;
};

const deleteTransaction = async (id) => {
    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
        throw new NotFoundError('Transaction not found');
    }
    await transaction.destroy();
    return { id };
};

const getAnalyticsData = async (query = {}) => {
    const { startDate, endDate } = query;
    let dateWhere = {};
    let userDateWhere = {};

    if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        dateWhere = {
            createdAt: {
                [Op.between]: [start, end]
            }
        };
        userDateWhere = {
            createdAt: {
                [Op.between]: [start, end]
            }
        };
    } else {
        // Default to last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        
        dateWhere = {
            createdAt: {
                [Op.gte]: thirtyDaysAgo
            }
        };
        
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        userDateWhere = {
            createdAt: {
                [Op.gte]: startOfMonth
            }
        };
    }

    // 1. Total Revenue (total_amount of transactions with status = 'paid', 'processing', 'success')
    const totalRevenue = await Transaction.sum('total_amount', {
        where: { 
            status: { [Op.in]: ['paid', 'processing', 'success'] },
            ...dateWhere
        }
    }) || 0;

    // 2. Total Successful Orders (count of transactions with status = 'paid', 'processing', 'success')
    const totalSuccessfulOrders = await Transaction.count({
        where: { 
            status: { [Op.in]: ['paid', 'processing', 'success'] },
            ...dateWhere
        }
    });

    // 3. New Customers (users with role 'User' created this month)
    const userRole = await role.findOne({ where: { nama_role: 'User' } });
    let newCustomersCount = 0;
    if (userRole) {
        newCustomersCount = await user.count({
            where: {
                role_id: userRole.id,
                ...userDateWhere
            }
        });
    }

    // 4. Pending Orders (count of transactions with status = 'pending')
    const pendingOrdersCount = await Transaction.count({
        where: { status: 'pending' }
    });

    // 5. Top 5 Best Selling Menu Items (transaction_items sum quantity grouped by product_id)
    const topProducts = await TransactionItem.findAll({
        attributes: [
            'product_id',
            [sequelize.fn('SUM', sequelize.col('quantity')), 'total_sold']
        ],
        include: [
            {
                model: Product,
                as: 'product',
                attributes: ['name', 'price', 'image_url']
            },
            {
                model: Transaction,
                as: 'transaction',
                attributes: [],
                where: {
                    status: { [Op.in]: ['paid', 'processing', 'success'] },
                    ...dateWhere
                }
            }
        ],
        group: ['product_id', 'product.id'],
        order: [[sequelize.literal('total_sold'), 'DESC']],
        limit: 5
    });

    // 6. Low Stock Warning (products with stock < 5)
    const lowStockProducts = await Product.findAll({
        where: {
            stock: {
                [Op.lt]: 5
            }
        },
        attributes: ['id', 'name', 'stock', 'price', 'image_url']
    });

    // 7. Sales Trend (revenue by date for last 30 days)
    const salesTrendRaw = await Transaction.findAll({
        attributes: [
            [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('SUM', sequelize.col('total_amount')), 'daily_revenue']
        ],
        where: {
            status: { [Op.in]: ['paid', 'processing', 'success'] },
            ...dateWhere
        },
        group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    const salesTrend = salesTrendRaw.map(item => ({
        date: item.getDataValue('date'),
        revenue: parseInt(item.getDataValue('daily_revenue')) || 0
    }));

    return {
        summary: {
            totalRevenue,
            totalSuccessfulOrders,
            newCustomers: newCustomersCount,
            pendingOrders: pendingOrdersCount
        },
        topProducts: topProducts.map(p => {
            const val = p.get({ plain: true });
            return {
                id: val.product_id,
                name: val.product?.name || 'Produk Tidak Dikenal',
                image_url: val.product?.image_url,
                price: val.product?.price || 0,
                total_sold: parseInt(val.total_sold) || 0
            };
        }),
        lowStockProducts,
        salesTrend
    };
};

const cancelPendingTransaction = async (transactionId, userId) => {
    const transaction = await Transaction.findOne({
        where: { id: transactionId, user_id: userId },
        include: [{ model: TransactionItem, as: 'items' }]
    });

    if (!transaction) {
        throw new NotFoundError('Transaksi tidak ditemukan');
    }

    if (transaction.status !== 'pending') {
        throw new BadRequestError('Hanya transaksi pending yang dapat dibatalkan');
    }

    const t = await sequelize.transaction();
    try {
        // 1. Restore stock
        for (const item of transaction.items) {
            const product = await Product.findByPk(item.product_id, { transaction: t, lock: t.LOCK.UPDATE });
            if (product) {
                await product.update({ stock: product.stock + item.quantity }, { transaction: t });
            }
        }

        // 2. Restore promo usage
        if (transaction.promo_id) {
            const promo = await Promo.findByPk(transaction.promo_id, { transaction: t, lock: t.LOCK.UPDATE });
            if (promo && promo.max_usage !== null) {
                await promo.update({ max_usage: promo.max_usage + 1 }, { transaction: t });
            }
        }

        // 3. Delete items
        await TransactionItem.destroy({
            where: { transaction_id: transactionId },
            transaction: t
        });

        // 4. Delete transaction
        await transaction.destroy({ transaction: t });

        await t.commit();
        return { success: true };
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const cancelCustomerTransaction = async (transactionId, userId) => {
    const transaction = await Transaction.findOne({
        where: { id: transactionId, user_id: userId },
        include: [{ model: TransactionItem, as: 'items' }]
    });

    if (!transaction) {
        throw new NotFoundError('Transaksi tidak ditemukan');
    }

    if (transaction.status !== 'paid') {
        throw new BadRequestError('Hanya transaksi dengan status Lunas (paid) yang dapat dibatalkan');
    }

    const t = await sequelize.transaction();
    try {
        // 1. Restore stock
        for (const item of transaction.items) {
            const product = await Product.findByPk(item.product_id, { transaction: t, lock: t.LOCK.UPDATE });
            if (product) {
                await product.update({ stock: product.stock + item.quantity }, { transaction: t });
            }
        }

        // 2. Restore promo usage
        if (transaction.promo_id) {
            const promo = await Promo.findByPk(transaction.promo_id, { transaction: t, lock: t.LOCK.UPDATE });
            if (promo && promo.max_usage !== null) {
                await promo.update({ max_usage: promo.max_usage + 1 }, { transaction: t });
            }
        }

        // 3. Update status to 'cancelled'
        await transaction.update({ status: 'cancelled' }, { transaction: t });

        await t.commit();

        // 4. Send notification to Customer
        try {
            await createNotification({
                userId: transaction.user_id,
                title: 'Pesanan Dibatalkan & Refund Dana ❌',
                message: `Pesanan #ORD-${transaction.id} Anda telah berhasil dibatalkan. Dana sebesar Rp ${transaction.total_amount.toLocaleString()} telah dikembalikan secara penuh.`,
                type: 'payment'
            });
        } catch (notifErr) {
            console.error('Failed to create customer cancel notification:', notifErr);
        }

        // 5. Send notification to Admin
        try {
            const buyer = await user.findByPk(userId);
            const buyerName = buyer ? buyer.name : 'Pelanggan';
            await createNotification({
                userId: null, // null for admin
                title: 'Pesanan Dibatalkan oleh Pelanggan',
                message: `Pelanggan ${buyerName} telah membatalkan pesanan #ORD-${transaction.id}. Uang sebesar Rp ${transaction.total_amount.toLocaleString()} harus dikembalikan.`,
                type: 'order'
            });
        } catch (notifErr) {
            console.error('Failed to create admin cancel notification:', notifErr);
        }

        return transaction;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

module.exports = {
    createTransaction,
    getUserTransactions,
    getAllTransactions,
    syncTransactionStatus,
    updateTransactionStatus,
    deleteTransaction,
    getAnalyticsData,
    cancelPendingTransaction,
    cancelCustomerTransaction
};