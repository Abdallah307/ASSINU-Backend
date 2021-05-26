const express = require('express')
const router = express.Router()

const userController = require('../controllers/user')
const isAuth = require('../middleware/is-auth')

router.get('/info',isAuth, userController.getUserInfo)

router.post('/messages/createmessage',isAuth, userController.createPersonalMessage)

router.get('/messages/chats',isAuth, userController.getAllChats)

router.post('/messages',isAuth, userController.getPersonalMessages)

router.post('/changeimage', isAuth , userController.changeProfileImage)

router.put('/notfications/switch', isAuth , userController.switchNotifications)
router.put('/myask/switch', isAuth, userController.switchMyAsk)

router.get('/notifications',isAuth, userController.getNotifications)

router.get('/search', isAuth, userController.searchForUser)

router.post('/feed', isAuth, userController.getFeed)



module.exports = router