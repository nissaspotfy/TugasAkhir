const Router = require('express')
const {
    registerUserController,
    registerAdminController,
} = require('../../controller/auth/register');

const {
    loginController,
} = require('../../controller/auth/login');

const {
    forgotPasswordController,
    verifyCodeController,
    resetPasswordController,
} = require('../../controller/auth/forgot-password');


const router = Router()

router.post('/register', [], registerUserController)
router.post('/register/admin', [], registerAdminController)
router.post('/login', [], loginController)
router.post('/forgot-password', [], forgotPasswordController)
router.post('/verify-code', [], verifyCodeController)
router.post('/reset-password', [], resetPasswordController)


module.exports = router