const express = require('express')
const router = express.Router()
const studentController = require('../controllers/student')


const isAuth = require('../middleware/is-auth')



router.get('/info', studentController.getStudentInfo)

router.get('/:studentId', studentController.getImageAndName)

router.post('/createpost', studentController.createPost)

router.get('/group/posts/:groupId', studentController.getGroupPosts)

router.put('/group/posts/comment/createcomment', studentController.createComment)

router.get('/group/posts/comments/:postId', studentController.getPostComments)

router.get('/group/messages/:groupId', studentController.getGroupMessages)

router.post('/group/messages/addmessage', studentController.createMessage)

router.get('/university/questions', studentController.getUniversityQuestions)

router.post('/university/questions/addquestion', studentController.addUniversityQuestion)

router.post('/university/questions/:questionId', studentController.answerQuestion)

router.get('/university/questions/:questionId', studentController.getQuestionAnswers)

router.put('/university/questions/answer/upvote/:questionId', studentController.upvoteAnswer)
router.put('/university/questions/answer/downvote/:questionId', studentController.downvoteAnswer)

router.put('/university/questions/follow/:questionId', studentController.switchQuestionFollowingStatus)

router.get('/questions/search', studentController.searchQuestion)

module.exports = router 
