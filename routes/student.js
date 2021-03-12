const express = require('express')
const router = express.Router()
const studentController = require('../controllers/student')


const isAuth = require('../middleware/is-auth')



router.get('/info',isAuth, studentController.getStudentInfo)

router.get('/:studentId', studentController.getImageAndName)

router.post('/createpost', studentController.createPost)

router.get('/group/posts/:groupId', studentController.getGroupPosts)

router.put('/group/posts/comment/:postId', studentController.createComment)

router.get('/group/posts/comments/:postId', studentController.getPostComments)

router.get('/group/messages/:groupId', studentController.getGroupMessages)

router.post('/group/messages/addmessage', studentController.createMessage)

module.exports = router 
