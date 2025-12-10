const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const {
    getAllProducts,
    getProductById,
    createProduct
} = require('../../services/product/product');

const getProductsController = async (req, res, next) => {
    try {
        const result = await getAllProducts(req.query);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Products retrieved successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const getProductByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await getProductById(id);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Product retrieved successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const createProductController = async (req, res, next) => {
    try {
        // Ideally add Joi validation here
        const result = await createProduct(req.body);
        return res.status(StatusCodes.CREATED).json(
            new BaseResponse({
                status: StatusCodes.CREATED,
                message: 'Product created successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProductsController,
    getProductByIdController,
    createProductController
};
