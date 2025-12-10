const { Transaction, TransactionItem, Product, Promo, sequelize } = require('../../models');
const { BaseError, NotFoundError, BadRequestError } = require('../../common/responses/error-response');
const { StatusCodes } = require('http-status-codes');
const snap = require('../../common/utils/midtrans');
const { v4: uuidv4 } = require('uuid');

const createTransaction = async (user, items, promoCode) => {
    // items: [{ productId: 1, quantity: 2 }]
    
    const t = await sequelize.transaction();

    try {
        let totalAmount = 0;
        const transactionItemsData = [];

        // 1. Validate products and calculate total
        for (const item of items) {
            const product = await Product.findByPk(item.productId, { transaction: t });
            if (!product) {
                throw new NotFoundError(`Product with ID ${item.productId} not found`);
            }
            if (product.stock < item.quantity) {
                throw new BaseError(StatusCodes.BAD_REQUEST, `Insufficient stock for product ${product.name}`);
            }

            const price = product.price;
            const subtotal = price * item.quantity;
            totalAmount += subtotal;

            transactionItemsData.push({
                product_id: product.id,
                quantity: item.quantity,
                price_at_time: price,
                name: product.name // Use actual product name
            });

            // Decrease stock
            await product.update({ stock: product.stock - item.quantity }, { transaction: t });
        }

        // 2. Apply Promo Code if exists
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
                     // Promo invalid or used up, maybe throw error or just ignore?
                     // Let's throw error to inform user
                     throw new BaseError(StatusCodes.BAD_REQUEST, 'Promo code usage limit reached');
                }

                if (promo.discount_type === 'percentage') {
                    discountAmount = Math.floor((totalAmount * promo.discount_value) / 100);
                } else {
                    discountAmount = promo.discount_value;
                }

                if (discountAmount > totalAmount) discountAmount = totalAmount;

                promoId = promo.id;

                // Decrement max_usage if applicable
                if (promo.max_usage !== null) {
                    await promo.update({ max_usage: promo.max_usage - 1 }, { transaction: t });
                }
            } else {
                 throw new NotFoundError('Promo code not found or inactive');
            }
        }

        const finalAmount = totalAmount - discountAmount;

        // 3. Create Transaction Record
        const transaction = await Transaction.create({
            user_id: user.id,
            total_amount: finalAmount,
            status: 'pending',
            promo_id: promoId,
            discount_amount: discountAmount
        }, { transaction: t });

        // 4. Create Transaction Items
        const itemsWithId = transactionItemsData.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_time: item.price_at_time,
            transaction_id: transaction.id
        }));
        await TransactionItem.bulkCreate(itemsWithId, { transaction: t });

        // 5. Call Midtrans
        // Ensure a unique order ID for Midtrans
        const orderId = `ORDER-${transaction.id}-${Date.now()}`;
        
        const midtransItems = transactionItemsData.map(item => ({
            id: item.product_id.toString(), // Midtrans id should be string
            price: item.price_at_time,
            quantity: item.quantity,
            name: item.name.substring(0, 50) // Midtrans name limit
        }));

        if (discountAmount > 0) {
            midtransItems.push({
                id: 'DISCOUNT',
                price: -discountAmount,
                quantity: 1,
                name: 'Promo Discount'
            });
        }

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: finalAmount
            },
            customer_details: {
                first_name: user.name,
                email: user.email,
            },
            item_details: midtransItems
        };

        let snapToken = null;
        try {
             // Check if server key is set, otherwise skip real call or use dummy
             if (process.env.MIDTRANS_SERVER_KEY) {
                 const midtransTransaction = await snap.createTransaction(parameter);
                 snapToken = midtransTransaction.token;
             } else {
                 console.warn("Midtrans Server Key not found, generating dummy token.");
                 snapToken = `dummy-token-${uuidv4()}`;
             }
        } catch (midtransError) {
             console.error("Midtrans Error:", midtransError);
             // Fail gracefully or throw? 
             // If payment init fails, transaction might be stuck.
             // For now, allow it but status is pending.
             // Or throw to rollback.
             throw new BaseError(StatusCodes.INTERNAL_SERVER_ERROR, 'Payment gateway initialization failed');
        }

        await transaction.update({ snap_token: snapToken }, { transaction: t });

        await t.commit();

        return {
            transactionId: transaction.id,
            snapToken,
            totalAmount: finalAmount, // Return the discounted amount
            originalAmount: totalAmount,
            discountAmount,
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
            }
        ],
        order: [['createdAt', 'DESC']]
    });
    return transactions;
};

module.exports = {
    createTransaction,
    getUserTransactions
};