const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const cartService = require('../../services/cart/cart');
const { Product } = require('../../models');
const { BaseError } = require('../../common/responses/error-response');

const getCart = async (req, res, next) => {
    try {
        const result = await cartService.getCart(req.user.id);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Cart retrieved successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;

        // SELECT stock FROM products WHERE id = ?
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new BaseError(StatusCodes.NOT_FOUND, 'Produk tidak ditemukan');
        }

        if (product.stock === null || product.stock <= 0) {
            throw new BaseError(StatusCodes.BAD_REQUEST, 'Stok menu ini habis');
        }

        const result = await cartService.addToCart(req.user.id, productId, quantity);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Item added to cart',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const updateCartItem = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const result = await cartService.updateCartItem(req.user.id, productId, quantity);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Cart item updated',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const removeFromCart = async (req, res, next) => {
    try {
        const { productId } = req.params;
        await cartService.removeFromCart(req.user.id, productId);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Item removed from cart',
            })
        );
    } catch (error) {
        next(error);
    }
};

const clearCart = async (req, res, next) => {
    try {
        await cartService.clearCart(req.user.id);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Cart cleared successfully',
            })
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
