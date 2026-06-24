const { Product, Category } = require('../../models');
const { BaseError, NotFoundError } = require('../../common/responses/error-response');
const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

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

    const rows = products.rows.map(p => {
        const productVal = p.get({ plain: true });
        if (productVal.image_url && productVal.image_url.startsWith('/')) {
            productVal.image_url = `${process.env.BASE_URL}${productVal.image_url}`;
        }
        return productVal;
    });

    return {
        products: rows,
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
    const productVal = product.get({ plain: true });
    if (productVal.image_url && productVal.image_url.startsWith('/')) {
        productVal.image_url = `${process.env.BASE_URL}${productVal.image_url}`;
    }
    return productVal;
};

const createProduct = async (data, file) => {
    if (file) {
        const filePath = file.path.replace(/\\/g, '/');
        const relativePath = filePath.split('/public')[1];
        data.image_url = relativePath;
    }
    if (!data.category_id) {
        const firstCategory = await Category.findOne();
        if (firstCategory) {
            data.category_id = firstCategory.id;
        }
    }
    const product = await Product.create(data);
    return product;
};

const updateProduct = async (id, data, file) => {
    const product = await Product.findByPk(id);
    if (!product) {
        throw new NotFoundError('Product not found');
    }

    if (file) {
        // delete old product image if it exists
        if (product.image_url && product.image_url.startsWith('/')) {
            const oldImagePath = path.join(process.cwd(), 'public', product.image_url);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        const filePath = file.path.replace(/\\/g, '/');
        const relativePath = filePath.split('/public')[1];
        data.image_url = relativePath;
    }

    await product.update(data);
    return product;
};

const deleteProduct = async (id) => {
    const product = await Product.findByPk(id);
    if (!product) {
        throw new NotFoundError('Product not found');
    }
    await product.destroy({ force: true });
    return { id };
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
