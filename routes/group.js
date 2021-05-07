const express = require('express')
const router = express.Router()

const groupController = require('../controllers/groupController')
const isAuth = require('../middleware/is-auth')

router.post('/createpost',isAuth, groupController.createPost)

router.get('/posts/:groupId',isAuth, groupController.getGroupPosts)

router.post('/members',isAuth, groupController.getGroupMembersInfo)

router.put('/posts/comment/createcomment',isAuth, groupController.createComment)

router.get('/posts/comments/:postId',isAuth, groupController.getPostComments)

router.get('/messages/:groupId',isAuth, groupController.getGroupMessages)

router.post('/messages/addmessage',isAuth, groupController.createMessage)


router.post('/polls/createpoll',isAuth, groupController.postCreateGroupPoll)

router.get('/postspolls/:groupId',isAuth, groupController.getGroupPostsAndPolls)

router.post('/polls/vote',isAuth, groupController.postVotePoll)


module.exports = router


