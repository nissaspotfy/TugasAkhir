const { Promo } = require('../../models');
const { BaseError, NotFoundError } = require('../../common/responses/error-response');
const { StatusCodes } = require('http-status-codes');

const checkPromo = async (code, totalAmount) => {
  const promo = await Promo.findOne({
    where: {
      code,
      is_active: true
    }
  });

  if (!promo) {
    throw new NotFoundError('Promo code not found or inactive');
  }

  if (promo.max_usage !== null && promo.max_usage <= 0) {
    throw new BaseError(StatusCodes.BAD_REQUEST, 'Promo code usage limit reached');
  }

  let discountAmount = 0;
  if (promo.discount_type === 'percentage') {
    discountAmount = Math.floor((totalAmount * promo.discount_value) / 100);
  } else {
    discountAmount = promo.discount_value;
  }

  if (discountAmount > totalAmount) {
    discountAmount = totalAmount;
  }

  return {
    promo_id: promo.id,
    code: promo.code,
    discount_amount: discountAmount,
    final_price: totalAmount - discountAmount
  };
};

const createPromo = async (data) => {
    const existing = await Promo.findOne({ where: { code: data.code } });
    if (existing) {
        throw new BaseError(StatusCodes.BAD_REQUEST, 'Promo code already exists');
    }
    return await Promo.create(data);
};

const getAllPromos = async () => {
    return await Promo.findAll();
};

const getPromoById = async (id) => {
    const promo = await Promo.findByPk(id);
    if (!promo) {
        throw new NotFoundError('Promo not found');
    }
    return promo;
};

const updatePromo = async (id, data) => {
    const promo = await Promo.findByPk(id);
    if (!promo) {
        throw new NotFoundError('Promo not found');
    }
    if (data.code && data.code !== promo.code) {
        const existing = await Promo.findOne({ where: { code: data.code } });
        if (existing) {
            throw new BaseError(StatusCodes.BAD_REQUEST, 'Promo code already exists');
        }
    }
    return await promo.update(data);
};

const deletePromo = async (id) => {
    const promo = await Promo.findByPk(id);
    if (!promo) {
        throw new NotFoundError('Promo not found');
    }
    await promo.destroy();
    return true;
};

module.exports = {
  checkPromo,
  createPromo,
  getAllPromos,
  getPromoById,
  updatePromo,
  deletePromo
};