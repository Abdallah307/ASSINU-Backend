const express = require('express')
const router = express.Router()

const universityController = require('../controllers/universityController')
const isAuth = require('../middleware/is-auth')

router.get('/questions/search',isAuth, universityController.searchQuestion)

router.get('/questions',isAuth, universityController.getUniversityQuestions)

router.post('/questions/addquestion',isAuth, universityController.addUniversityQuestion) // needs editing

router.post('/questions/:questionId',isAuth, universityController.answerQuestion)

router.get('/questions/:questionId',isAuth, universityController.getQuestionAnswers)

router.get('/questions/answer/:answerId/comments',isAuth, universityController.getAnswerComments)

router.post('/questions/answer/addcomment',isAuth, universityController.postAddAnswerComment)
router.get('/questions/answers/comments/:commentId/replays',isAuth, universityController.getCommentReplays)
router.post('/questions/answers/comments/:commentId/replays/addreplay',isAuth, universityController.addCommentReplay)

router.put('/questions/answer/upvote',isAuth, universityController.upvoteAnswer)
router.put('/questions/answer/downvote',isAuth, universityController.downvoteAnswer)

router.put('/questions/follow/:questionId',isAuth, universityController.switchQuestionFollowingStatus)


module.exports = router