const { CartItem, Product } = require('../../models');
const { NotFoundError } = require('../../common/responses/error-response');

const getCart = async (userId) => {
    return await CartItem.findAll({
        where: { user_id: userId },
        include: [{ model: Product, as: 'product' }]
    });
};

const addToCart = async (userId, productId, quantity = 1) => {
    const item = await CartItem.findOne({
        where: { user_id: userId, product_id: productId }
    });

    if (item) {
        item.quantity += quantity;
        await item.save();
        return item;
    } else {
        return await CartItem.create({
            user_id: userId,
            product_id: productId,
            quantity
        });
    }
};

const updateCartItem = async (userId, productId, quantity) => {
    const item = await CartItem.findOne({
        where: { user_id: userId, product_id: productId }
    });

    if (!item) throw new NotFoundError('Item not in cart');

    if (quantity <= 0) {
        await item.destroy();
        return null;
    }

    item.quantity = quantity;
    await item.save();
    return item;
};

const removeFromCart = async (userId, productId) => {
    const item = await CartItem.findOne({
        where: { user_id: userId, product_id: productId }
    });

    if (item) await item.destroy();
};

const clearCart = async (userId) => {
    await CartItem.destroy({ where: { user_id: userId } });
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
