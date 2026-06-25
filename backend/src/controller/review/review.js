const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const { createReview, getAllReviews, getHomepageReviews, toggleReviewHomepage } = require('../../services/review/review');

const createReviewController = async (req, res, next) => {
    try {
        const { transactionId, rating, comment } = req.body;
        if (!transactionId || !rating) {
            return res.status(StatusCodes.BAD_REQUEST).json(
                new BaseResponse({
                    status: StatusCodes.BAD_REQUEST,
                    message: 'transactionId and rating are required',
                    data: null
                })
            );
        }

        const cleanTransactionId = transactionId.replace('#ORD-', '');

        const result = await createReview(req.user.id, cleanTransactionId, rating, comment);
        return res.status(StatusCodes.CREATED).json(
            new BaseResponse({
                status: StatusCodes.CREATED,
                message: 'Review created successfully',
                data: result
            })
        );
    } catch (error) {
        next(error);
    }
};

const getAllReviewsController = async (req, res, next) => {
    try {
        const result = await getAllReviews();
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'All reviews retrieved successfully',
                data: result
            })
        );
    } catch (error) {
        next(error);
    }
};

const getHomepageReviewsController = async (req, res, next) => {
    try {
        const result = await getHomepageReviews();
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Homepage reviews retrieved successfully',
                data: result
            })
        );
    } catch (error) {
        next(error);
    }
};

const toggleReviewHomepageController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await toggleReviewHomepage(id);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Review homepage status toggled successfully',
                data: result
            })
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReviewController,
    getAllReviewsController,
    getHomepageReviewsController,
    toggleReviewHomepageController
};
