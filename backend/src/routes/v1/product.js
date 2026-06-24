const express = require('express');
const router = express.Router();
const {
    getProductsController,
    getProductByIdController,
    createProductController,
    updateProductController,
    deleteProductController
} = require('../../controller/product/product');
const { authMiddleware, adminMiddleware } = require('../../middlewares/authorization');
const { uploadProductImage } = require('../../middlewares/multer');

router.get('/', getProductsController);
router.get('/:id', getProductByIdController);
router.post('/', [authMiddleware, adminMiddleware, uploadProductImage.single('image')], createProductController);
router.put('/:id', [authMiddleware, adminMiddleware, uploadProductImage.single('image')], updateProductController);
router.delete('/:id', [authMiddleware, adminMiddleware], deleteProductController);

module.exports = router;
