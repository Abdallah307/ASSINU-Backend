const express = require('express')
const router = express.Router()

const userController = require('../controllers/user')
const isAuth = require('../middleware/is-auth')

router.get('/info',isAuth, userController.getUserInfo)

router.post('/messages/createmessage',isAuth, userController.createPersonalMessage)

router.get('/messages/chats/:sender',isAuth, userController.getAllChats)

router.post('/messages',isAuth, userController.getPersonalMessages)

router.post('/changeimage', isAuth , userController.changeProfileImage)


module.exports = router