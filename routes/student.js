const express = require('express')
const router = express.Router()
const studentController = require('../controllers/student')
const AskQuestion = require('../models/askQuestion')

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

router.post('/ask', async (req,res,next) => {
    const {question, sender, receiver} = req.body 

    const newQuestion = new AskQuestion({
        question:question,
        sender:sender,
        receiver:receiver
    })

    await newQuestion.save()

    return res.status(201).json({
        q:newQuestion
    })
})

router.get('/ask/receivedquestions/:userId', async (req,res,next) => {
    const userId = req.params.userId 
    const questions = await AskQuestion.find({receiver:userId, isAnswered:false})

    if (!questions) {

        return res.status(404).json({
            message:'no questions found'
        })
    }

    return res.status(200).json({
        questions:questions
    })
})

router.get('/ask/askedquestions/:userId', async (req,res,next) => {
    const userId = req.params.userId 
    const questions = await AskQuestion.find({sender:userId})
    .populate('receiver', 'name')
    .exec()

    if (!questions) {

        return res.status(404).json({
            message:'no questions found'
        })
    }

    return res.status(200).json({
        questions:questions
    })
})


router.get('/ask/answered/:userId', async (req,res,next) => {
    const userId = req.params.userId 
    const questions = await AskQuestion.find({receiver:userId, isAnswered:true})

    if (!questions) {

        return res.status(404).json({
            message:'no questions found'
        })
    }

    return res.status(200).json({
        questions:questions
    })
})

router.post('/ask/answerquestion', async (req,res,next) => {
    try {
        const questionId = req.body.questionId
        const answer = req.body.answer 

        const question = await AskQuestion.findById(questionId)

        question.answer = answer
        question.isAnswered = true

        await question.save()

        return res.status(201).json({
            question:question
        })
    }
    catch(err) {
        return next(err)
    }
})

router.get('/ask/question/answer/:questionId', async (req,res,next) => {
    try {
        const questionId = req.params.questionId 
        const questionAnswer = await AskQuestion.findById(questionId)
        .select('answer')

        return res.status(200).json({
            answer:questionAnswer
        })
    }
    catch(err) {
        return next(err)
    }
})

module.exports = router 
