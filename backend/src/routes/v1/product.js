const express = require('express');
const router = express.Router();
const {
    getProductsController,
    getProductByIdController,
    createProductController
} = require('../../controller/product/product');
const { authMiddleware } = require('../../middlewares/authorization');

router.get('/', getProductsController);
router.get('/:id', getProductByIdController);
router.post('/', authMiddleware, createProductController); // ideally check for admin role

module.exports = router;
