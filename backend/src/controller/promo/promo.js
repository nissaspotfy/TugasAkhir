const promoService = require('../../services/promo/promo');
const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const { createPromoSchema, updatePromoSchema } = require('../../common/validation/promo/promo');
const { BaseError } = require('../../common/responses/error-response');

const checkPromo = async (req, res, next) => {
  try {
    const { code, totalAmount } = req.body;
    const result = await promoService.checkPromo(code, totalAmount);
    return res.status(StatusCodes.OK).json(
        new BaseResponse({
            status: StatusCodes.OK,
            message: 'Promo applied successfully',
            data: result,
        })
    );
  } catch (error) {
    next(error);
  }
};

const createPromo = async (req, res, next) => {
    try {
        const { error, value } = createPromoSchema.validate(req.body);
        if (error) {
            throw new BaseError(StatusCodes.BAD_REQUEST, error.details[0].message);
        }
        const result = await promoService.createPromo(value);
        return res.status(StatusCodes.CREATED).json(
            new BaseResponse({
                status: StatusCodes.CREATED,
                message: 'Promo created successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const getAllPromos = async (req, res, next) => {
    try {
        const result = await promoService.getAllPromos();
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Promos retrieved successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const getPromoById = async (req, res, next) => {
    try {
        const result = await promoService.getPromoById(req.params.id);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Promo retrieved successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const updatePromo = async (req, res, next) => {
    try {
        const { error, value } = updatePromoSchema.validate(req.body);
        if (error) {
            throw new BaseError(StatusCodes.BAD_REQUEST, error.details[0].message);
        }
        const result = await promoService.updatePromo(req.params.id, value);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Promo updated successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const deletePromo = async (req, res, next) => {
    try {
        await promoService.deletePromo(req.params.id);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Promo deleted successfully',
            })
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
  checkPromo,
  createPromo,
  getAllPromos,
  getPromoById,
  updatePromo,
  deletePromo
};