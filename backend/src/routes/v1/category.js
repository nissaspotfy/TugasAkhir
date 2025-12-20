const express = require('express');
const router = express.Router();
const categoryController = require('../../controller/category/category');

router.get('/', categoryController.getCategoriesController);

module.exports = router;
