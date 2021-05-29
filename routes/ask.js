const express = require('express')
const router = express.Router()

const isAuth = require('../middleware/is-auth')

const askController = require('../controllers/ask')

router.post('/askquestion',isAuth, askController.askQuestion)

router.get('/receivedquestions/:userId',isAuth, askController.getReceivedQuestions)

router.get('/askedquestions/:userId',isAuth, askController.getAskedQuestions)

router.get('/answered/:userId',isAuth, askController.getAnsweredQuestions)

router.post('/answerquestion',isAuth, askController.answerQuestion)

router.get('/question/answer/:questionId',isAuth, askController.getQuestionAnswer)


module.exports = router