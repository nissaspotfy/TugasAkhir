const { CartItem, Product } = require('../../models');
const { NotFoundError } = require('../../common/responses/error-response');

const getCart = async (userId) => {
    const items = await CartItem.findAll({
        where: { user_id: userId },
        include: [{ model: Product, as: 'product' }]
    });
    return items.map(item => {
        const itemVal = item.get({ plain: true });
        if (itemVal.product && itemVal.product.image_url && itemVal.product.image_url.startsWith('/')) {
            itemVal.product.image_url = `${process.env.BASE_URL}${itemVal.product.image_url}`;
        }
        return itemVal;
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
