const express = require('express');
const router = express.Router()

const publicGroupController = require('../controllers/PublicGroup')

router.get('/postsquestions', publicGroupController.getPostsAndQuestions)

// questions routes

router.post('/createquestion', publicGroupController.createQuestion)
router.post('/questions/addanswer', publicGroupController.addAnswer)
router.get('/questions/:questionId/answers', publicGroupController.getQuestionAnswers)
router.get('/questions/answer/:answerId/comments', publicGroupController.getAnswerComments)
router.post('/questions/answer/addcomment', publicGroupController.addCommentToAnswer)
router.get('/questions/answers/comments/:commentId/replays' ,publicGroupController.getAnswerCommentReplays)
router.post('/questions/answers/comments/replays/addreplay', publicGroupController.addReplayToAnswerComment)
router.put('/questions/answer/upvote', publicGroupController.upvoteAnswer)
router.put('/questions/answer/downvote', publicGroupController.downvoteAnswer)
router.put('/questions/follow', publicGroupController.toggleQuestionFollowingStatus)


// posts routes

router.post('/createpost', publicGroupController.createPost)
router.put('/posts/like', publicGroupController.togglePostLikeStatus)
router.post('/posts/addcomment', publicGroupController.addPostComment)
router.post('/posts/commments/addreplay', publicGroupController.addReplayToPostComment)
router.get('/posts/:postId/comments', publicGroupController.getPostComments)
router.get('/posts/comments/:commentId/replays', publicGroupController.getPostCommentReplays)


module.exports = router