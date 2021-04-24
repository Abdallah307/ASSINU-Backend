const express = require('express')
const router = express.Router()
const studentController = require('../controllers/student')


const isAuth = require('../middleware/is-auth')



router.get('/info', studentController.getStudentInfo)

//router.get('/:studentId', studentController.getImageAndName)
router.post('/createpost', studentController.createPost)

router.get('/group/posts/:groupId', studentController.getGroupPosts)

router.post('/group/members', studentController.getGroupMembersInfo)

router.put('/group/posts/comment/createcomment', studentController.createComment)

router.get('/group/posts/comments/:postId', studentController.getPostComments)

router.get('/group/messages/:groupId', studentController.getGroupMessages)

router.post('/group/messages/addmessage', studentController.createMessage)

router.get('/university/questions', studentController.getUniversityQuestions)

router.post('/university/questions/addquestion', studentController.addUniversityQuestion) // needs editing

router.post('/university/questions/:questionId', studentController.answerQuestion)

router.get('/university/questions/:questionId', studentController.getQuestionAnswers)

router.get('/university/questions/answer/:answerId/comments', studentController.getAnswerComments)

router.post('/university/questions/answer/addcomment', studentController.postAddAnswerComment)
router.get('/university/questions/answers/comments/:commentId/replays', studentController.getCommentReplays)
router.post('/university/questions/answers/comments/:commentId/replays/addreplay', studentController.addCommentReplay)

router.put('/university/questions/answer/upvote', studentController.upvoteAnswer)
router.put('/university/questions/answer/downvote', studentController.downvoteAnswer)

router.put('/university/questions/follow/:questionId', studentController.switchQuestionFollowingStatus)

router.get('/questions/search', studentController.searchQuestion)

router.get('/sharingcenter/public', studentController.getPublicSharingItems)

router.get('/sharingcenter/public/search', studentController.searchPublicItems)
router.get('/sharingcenter/department/search', studentController.searchDepartmentItems)
router.get('/sharingcenter/department/:departmentId', studentController.getDepartmentSharingItems)

router.get('/sharingcenter/myitems/:userId', studentController.fetchUserItems)

router.post('/sharingcenter/public/shareitem', studentController.postPublicShareditem)
router.post('/sharingcenter/department/shareitem', studentController.postDepartmentShareditem)

router.post('/group/polls/createpoll', studentController.postCreateGroupPoll)
router.get('/group/polls/:groupId', studentController.getGroupPolls)

router.post('/group/polls/vote', studentController.postVotePoll)

router.post('/messages/createmessage', studentController.createPersonalMessage)

router.get('/messages/chats/:sender', studentController.getAllChats)

router.post('/messages', studentController.getPersonalMessages)


module.exports = router 
