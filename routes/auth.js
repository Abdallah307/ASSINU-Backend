const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth')
const isAuth = require('../middleware/is-auth')


router.post('/signup',authController.signUp)
router.post('/signin', authController.signIn)
router.post('/signout',isAuth, authController.signOut)
router.post('/signup/verification', authController.checkVerificationCode)
router.post('/signup/resendcode', authController.resendVerificationCode)
router.post('/forgetpassword/sendcode', authController.sendForgetPasswordCode)
router.post('/forgetpassword/verification', authController.checkForgetPasswordCode)
router.post('/forgetpassword/newpassword', authController.setNewPassword)



module.exports = router 