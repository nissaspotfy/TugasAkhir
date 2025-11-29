const Router = require('express')
const {
    registerController,
} = require('../controller/auth/register');

const {
    loginController,
} = require('../controller/auth/login');


const router = Router()

router.post('/register', [], registerController)
router.post('/login', [], loginController)


module.exports = router