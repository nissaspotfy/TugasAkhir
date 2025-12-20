const { Product, Category } = require('../../models');
const { BaseError, NotFoundError } = require('../../common/responses/error-response');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');

const getAllProducts = async (query) => {
    const { search, category, limit, page } = query;
    const where = {};
    const include = [{
        model: Category,
        as: 'category',
        attributes: ['name', 'slug']
    }];
    
    if (search) {
        where.name = { [Op.like]: `%${search}%` };
    }
    
    if (category) {
        // Filter by category name via association
        include[0].where = { name: category };
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const products = await Product.findAndCountAll({
        where,
        include,
        limit: limitNum,
        offset,
        order: [['createdAt', 'DESC']]
    });

    return {
        products: products.rows,
        total: products.count,
        page: pageNum,
        totalPages: Math.ceil(products.count / limitNum)
    };
};

const getProductById = async (id) => {
    const product = await Product.findByPk(id);
    if (!product) {
        throw new NotFoundError('Product not found');
    }
    return product;
};

const createProduct = async (data) => {
    // Basic validation could go here or in controller/Joi
    const product = await Product.create(data);
    return product;
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct
};
