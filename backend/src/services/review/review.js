const { review, Transaction, TransactionItem, Product, user, profile } = require('../../models');
const { BaseError, NotFoundError } = require('../../common/responses/error-response');
const { StatusCodes } = require('http-status-codes');

const createReview = async (userId, transactionId, rating, comment) => {
    // Validate transaction
    const t = await Transaction.findByPk(transactionId);
    if (!t) {
        throw new NotFoundError('Transaksi tidak ditemukan');
    }

    if (t.user_id !== userId) {
        throw new BaseError(StatusCodes.FORBIDDEN, 'Anda tidak berwenang mengulas pesanan ini');
    }

    if (t.status !== 'paid' && t.status !== 'success') {
        throw new BaseError(StatusCodes.BAD_REQUEST, 'Hanya pesanan yang sudah lunas yang dapat diulas');
    }

    // Check if review already exists
    const existingReview = await review.findOne({ where: { transaction_id: transactionId } });
    if (existingReview) {
        throw new BaseError(StatusCodes.CONFLICT, 'Anda sudah memberikan ulasan untuk pesanan ini');
    }

    // Create review
    const newReview = await review.create({
        transaction_id: transactionId,
        user_id: userId,
        rating,
        comment
    });

    return newReview;
};

const getAllReviews = async () => {
    const reviews = await review.findAll({
        include: [
            {
                model: user,
                as: 'user',
                attributes: ['name', 'email'],
                include: [{
                    model: profile,
                    as: 'profiles',
                    attributes: ['profilePicture']
                }]
            },
            {
                model: Transaction,
                as: 'transaction',
                attributes: ['id', 'total_amount', 'createdAt'],
                include: [{
                    model: TransactionItem,
                    as: 'items',
                    attributes: ['quantity', 'price_at_time'],
                    include: [{
                        model: Product,
                        as: 'product',
                        attributes: ['name']
                    }]
                }]
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    return reviews.map(r => {
        const primaryProfile = r.user?.profiles?.[0];
        const profilePicture = primaryProfile?.profilePicture 
            ? `${process.env.BASE_URL}${primaryProfile.profilePicture}` 
            : null;

        const items = r.transaction?.items?.map(i => ({
            name: i.product?.name || 'Produk Tidak Dikenal',
            quantity: i.quantity,
            price: i.price_at_time
        })) || [];

        return {
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            show_on_homepage: r.show_on_homepage,
            customer: {
                name: r.user?.name || 'Pelanggan Draosan',
                email: r.user?.email || '',
                profilePicture
            },
            transaction: {
                id: r.transaction?.id,
                totalAmount: r.transaction?.total_amount || 0,
                date: r.transaction?.createdAt,
                items
            }
        };
    });
};

const getHomepageReviews = async () => {
    const reviews = await review.findAll({
        where: { show_on_homepage: true },
        include: [
            {
                model: user,
                as: 'user',
                attributes: ['name', 'email'],
                include: [{
                    model: profile,
                    as: 'profiles',
                    attributes: ['profilePicture']
                }]
            },
            {
                model: Transaction,
                as: 'transaction',
                attributes: ['id', 'total_amount', 'createdAt'],
                include: [{
                    model: TransactionItem,
                    as: 'items',
                    attributes: ['quantity', 'price_at_time'],
                    include: [{
                        model: Product,
                        as: 'product',
                        attributes: ['name']
                    }]
                }]
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
    });

    return reviews.map(r => {
        const primaryProfile = r.user?.profiles?.[0];
        const profilePicture = primaryProfile?.profilePicture 
            ? `${process.env.BASE_URL}${primaryProfile.profilePicture}` 
            : null;

        const items = r.transaction?.items?.map(i => ({
            name: i.product?.name || 'Produk Tidak Dikenal',
            quantity: i.quantity,
            price: i.price_at_time
        })) || [];

        return {
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            show_on_homepage: r.show_on_homepage,
            customer: {
                name: r.user?.name || 'Pelanggan Draosan',
                email: r.user?.email || '',
                profilePicture
            },
            transaction: {
                id: r.transaction?.id,
                totalAmount: r.transaction?.total_amount || 0,
                date: r.transaction?.createdAt,
                items
            }
        };
    });
};

const toggleReviewHomepage = async (reviewId) => {
    const rev = await review.findByPk(reviewId);
    if (!rev) {
        throw new NotFoundError('Ulasan tidak ditemukan');
    }

    const newStatus = !rev.show_on_homepage;

    if (newStatus === true) {
        const activeCount = await review.count({ where: { show_on_homepage: true } });
        if (activeCount >= 10) {
            throw new BaseError(StatusCodes.BAD_REQUEST, 'Batas maksimum 10 ulasan di Beranda telah tercapai. Silakan nonaktifkan ulasan lain terlebih dahulu.');
        }
    }

    await rev.update({ show_on_homepage: newStatus });
    return rev;
};

module.exports = {
    createReview,
    getAllReviews,
    getHomepageReviews,
    toggleReviewHomepage
};
