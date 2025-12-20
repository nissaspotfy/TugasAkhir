const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const categoryService = require('../../services/category/category');

const getCategoriesController = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories();
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Categories retrieved successfully',
                data: categories,
            })
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategoriesController
};
