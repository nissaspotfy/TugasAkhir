const { Category } = require('../../models');

const getAllCategories = async () => {
    return await Category.findAll({
        attributes: ['id', 'name', 'slug']
    });
};

module.exports = {
    getAllCategories
};
