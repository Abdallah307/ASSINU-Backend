const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth')
const isAuth = require('../middleware/is-auth')


router.post('/signup',authController.signUp)
router.post('/signin', authController.signIn)
router.post('/signout',isAuth, authController.signOut)
router.post('/signup/verification', authController.checkVerificationCode)
router.post('/signup/resendcode', authController.resendVerificationCode)



module.exports = router 