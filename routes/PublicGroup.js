const express = require('express');
const router = express.Router()

const publicGroupController = require('../controllers/PublicGroup')
const isAuth = require('../middleware/is-auth')

router.get('/postsquestions',isAuth, publicGroupController.getPostsAndQuestions)

// questions routes

router.post('/createquestion',isAuth, publicGroupController.createQuestion)
router.post('/questions/addanswer',isAuth, publicGroupController.addAnswer)
router.get('/questions/:questionId/answers',isAuth, publicGroupController.getQuestionAnswers)
router.get('/questions/answer/:answerId/comments',isAuth, publicGroupController.getAnswerComments)
router.post('/questions/answer/addcomment',isAuth, publicGroupController.addCommentToAnswer)
router.get('/questions/answers/comments/:commentId/replays' ,isAuth,publicGroupController.getAnswerCommentReplays)
router.post('/questions/answers/comments/replays/addreplay',isAuth, publicGroupController.addReplayToAnswerComment)
router.put('/questions/answer/upvote',isAuth, publicGroupController.upvoteAnswer)
router.put('/questions/answer/downvote',isAuth, publicGroupController.downvoteAnswer)
router.put('/questions/follow',isAuth, publicGroupController.toggleQuestionFollowingStatus)


// posts routes

router.post('/createpost',isAuth, publicGroupController.createPost)
router.put('/posts/like',isAuth, publicGroupController.togglePostLikeStatus)
router.post('/posts/addcomment',isAuth, publicGroupController.addPostComment)
router.post('/posts/comments/addreplay',isAuth, publicGroupController.addReplayToPostComment)
router.get('/posts/:postId/comments',isAuth, publicGroupController.getPostComments)
router.get('/posts/comments/:commentId/replays',isAuth, publicGroupController.getPostCommentReplays)


module.exports = router