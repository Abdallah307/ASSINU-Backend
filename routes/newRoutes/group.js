const express = require('express')
const router = express.Router()
const isAuth = require('../../middleware/is-auth')
const groupController = require('../../controllers/newControllers/groupController')

router.get('/timeline/:groupId',isAuth, groupController.getGroupTimeline)

// questions
 
router.post('/createquestion',isAuth, groupController.createQuestion)
router.post('/questions/addanswer',isAuth, groupController.addAnswer)
router.get('/questions/:questionId/answers',isAuth, groupController.getQuestionAnswers)
router.put('/questions/answer/upvote',isAuth, groupController.upvoteAnswer)
router.put('/questions/answer/downvote',isAuth, groupController.downvoteAnswer)
router.put('/questions/follow',isAuth, groupController.toggleQuestionFollowingStatus)


// common
router.get('/comments/:referedTo',isAuth, groupController.getComments)
router.post('/addcomment',isAuth, groupController.addComment)
router.get('/replays/:referedTo' ,isAuth,groupController.getReplays)
router.post('/addreplay',isAuth, groupController.addReplay)

//group messages 

router.get('/messages/:groupId',isAuth, groupController.getGroupMessages)

router.post('/messages/addmessage',isAuth, groupController.createMessage)

router.post('/members', isAuth, groupController.getGroupMembersInfo)

//posts

router.post('/createpost',isAuth, groupController.createPost)
router.put('/posts/likepost',isAuth, groupController.togglePostLikeStatus)
router.delete('/posts/delete/:postId', groupController.deleteGroupPost)

//polls

router.post('/createpoll',isAuth, groupController.createPoll)

router.post('/polls/vote',isAuth, groupController.postVotePoll)


module.exports = router 