const Router = require('express')
const {
    registerUserController,
    registerAdminController,
} = require('../../controller/auth/register');

const {
    loginController,
} = require('../../controller/auth/login');


const router = Router()

router.post('/register', [], registerUserController)
router.post('/register/admin', [], registerAdminController)
router.post('/login', [], loginController)


module.exports = router