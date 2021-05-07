const express = require('express');
const router = express.Router()
const isAuth = require('../middleware/is-auth')
const departmentGroupController = require('../controllers/DepartmentGroup')

router.get('/postsquestions/:departmentId', departmentGroupController.getPostsAndQuestions)

// questions routes

router.post('/createquestion', departmentGroupController.createQuestion)
router.post('/questions/addanswer', departmentGroupController.addAnswer)
router.get('/questions/:questionId/answers', departmentGroupController.getQuestionAnswers)
router.get('/questions/answer/:answerId/comments', departmentGroupController.getAnswerComments)
router.post('/questions/answer/addcomment', departmentGroupController.addCommentToAnswer)
router.get('/questions/answers/comments/:commentId/replays' ,departmentGroupController.getAnswerCommentReplays)
router.post('/questions/answers/comments/replays/addreplay', departmentGroupController.addReplayToAnswerComment)
router.put('/questions/answer/upvote',isAuth, departmentGroupController.upvoteAnswer)
router.put('/questions/answer/downvote',isAuth, departmentGroupController.downvoteAnswer)
router.put('/questions/follow',isAuth, departmentGroupController.toggleQuestionFollowingStatus)


// posts routes

router.post('/createpost',isAuth, departmentGroupController.createPost)
router.put('/posts/like',isAuth, departmentGroupController.togglePostLikeStatus)
router.post('/posts/addcomment',isAuth, departmentGroupController.addPostComment)
router.post('/posts/comments/addreplay',isAuth, departmentGroupController.addReplayToPostComment)
router.get('/posts/:postId/comments', departmentGroupController.getPostComments)
router.get('/posts/comments/:commentId/replays', departmentGroupController.getPostCommentReplays)


module.exports = router