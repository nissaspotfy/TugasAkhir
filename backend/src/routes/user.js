const Router = require('express')
const {
    createProfileController,
    updateProfileController,
    getProfileController,
} = require('../controller/user/profile');

const { authMiddleware } = require('../middlewares/authorization');
const { uploadProfilePicture } = require('../middlewares/multer');


const router = Router()

//profile routes
router.get('/profile', [authMiddleware], getProfileController)
router.post('/create-profile', [authMiddleware, uploadProfilePicture.fields([{name: 'profile_picture', maxCount: 1}])], createProfileController)
router.put('/update-profile', [authMiddleware, uploadProfilePicture.fields([{name: 'profile_picture', maxCount: 1}])], updateProfileController)


module.exports = router