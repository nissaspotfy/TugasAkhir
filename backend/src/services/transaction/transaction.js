const { Transaction, TransactionItem, Product, Promo, Address, sequelize } = require('../../models');
const { BaseError, NotFoundError, BadRequestError } = require('../../common/responses/error-response');
const { StatusCodes } = require('http-status-codes');
const snap = require('../../common/utils/midtrans');
const { v4: uuidv4 } = require('uuid');
const shippingService = require('../shipping/shipping');

const createTransaction = async (user, items, promoCode, shippingAddressId, shippingOption) => {
    // items: [{ productId: 1, quantity: 2, note: "..." }]
    // shippingOption: { provider: 'JNE', service: 'REG', cost: 10000 }
    
    const t = await sequelize.transaction();

    try {
        let totalAmount = 0;
        const transactionItemsData = [];

        // 1. Validate products and calculate total
        for (const item of items) {
            // ... (rest of loop same) ...
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
                name: product.name, 
                note: item.note 
            });

            // Decrease stock
            await product.update({ stock: product.stock - item.quantity }, { transaction: t });
        }

        // Validate Shipping Option
        let shippingCost = 0;
        if (shippingAddressId && shippingOption) {
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
            shipping_address_id: shippingAddressId,
            shipping_provider: shippingOption.provider,
            shipping_service: shippingOption.service
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